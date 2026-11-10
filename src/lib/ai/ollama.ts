
import type {
  AiProvider,
  GenerateArgs,
  ProviderStatus,
} from "./types";

import { AiError } from "./types";

const OLLAMA_URL = (
  process.env.OLLAMA_BASE_URL ||
  "http://localhost:11434"
).replace(/\/+$/, "");

type OllamaModel = {
  name?: string;
  model?: string;
};

type OllamaTagsResponse = {
  models?: OllamaModel[];
};

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
  done_reason?: string;
};

async function getInstalledModels(): Promise<string[]> {
  let response: Response;

  try {
    response = await fetch(
      `${OLLAMA_URL}/api/tags`,
      {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch {
    throw new AiError(
      "Não foi possível conectar ao Ollama. Verifique se ele está aberto."
    );
  }

  if (!response.ok) {
    throw new AiError(
      `O Ollama retornou o erro HTTP ${response.status}.`
    );
  }

  let data: OllamaTagsResponse;

  try {
    data = (await response.json()) as OllamaTagsResponse;
  } catch {
    throw new AiError(
      "O Ollama retornou uma resposta inválida."
    );
  }

  if (!Array.isArray(data.models)) {
    throw new AiError(
      "O Ollama não retornou uma lista válida de modelos."
    );
  }

  return data.models
    .map((item) => item.name || item.model || "")
    .filter((name) => name.trim().length > 0);
}

async function checkOllama(): Promise<ProviderStatus> {
  try {
    const models = await getInstalledModels();

    if (models.length === 0) {
      return {
        ok: false,
        message:
          "O Ollama está funcionando, mas não possui modelos instalados.",
        models: [],
      };
    }

    return {
      ok: true,
      message: "Ollama conectado com sucesso.",
      models,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível verificar o Ollama.",
      models: [],
    };
  }
}

function getOllamaErrorMessage(
  status: number,
  details: string
): string {
  const normalized = details.toLowerCase();

  if (
    normalized.includes("token repeat limit") ||
    normalized.includes("prediction aborted")
  ) {
    return (
      "O modelo de IA interrompeu a geração por repetição excessiva " +
      "de tokens. Tente novamente. Se o problema continuar, " +
      "utilize outro modelo nas Configurações."
    );
  }

  if (
    normalized.includes("out of memory") ||
    normalized.includes("not enough memory") ||
    normalized.includes("cannot allocate memory")
  ) {
    return (
      "O computador não possui memória disponível suficiente " +
      "para executar essa geração. Tente um modelo menor."
    );
  }

  if (status === 404) {
    return (
      "O modelo selecionado não foi encontrado no Ollama. " +
      "Confira o modelo nas Configurações."
    );
  }

  return `O Ollama retornou o erro HTTP ${status}. ${details.slice(0, 200)}`;
}

async function generateOllamaJson(
  args: GenerateArgs
): Promise<string> {
  const model = args.model.trim();
  const system = args.system.trim();
  const prompt = args.prompt.trim();

  if (!model) {
    throw new AiError(
      "Nenhum modelo de IA foi selecionado."
    );
  }

  if (!prompt) {
    throw new AiError(
      "O texto enviado para análise está vazio."
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          system,
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.3,
            top_p: 0.9,
            repeat_penalty: 1.15,
            repeat_last_n: 128,
            num_predict: 3072,
            num_ctx: 8192,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(300000),
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" ||
        error.name === "AbortError")
    ) {
      throw new AiError(
        "O Ollama demorou muito para responder. " +
        "A geração foi interrompida após cinco minutos."
      );
    }

    throw new AiError(
      "Não foi possível comunicar com o Ollama. " +
      "Verifique se ele está em execução."
    );
  }

  if (!response.ok) {
    let details = "";

    try {
      const body: unknown = await response.json();

      if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        details = body.error;
      } else {
        details = JSON.stringify(body);
      }
    } catch {
      details = "";
    }

    throw new AiError(
      getOllamaErrorMessage(response.status, details)
    );
  }

  let data: OllamaGenerateResponse;

  try {
    data =
      (await response.json()) as OllamaGenerateResponse;
  } catch {
    throw new AiError(
      "O Ollama retornou uma resposta que não pôde ser interpretada."
    );
  }

  if (
    typeof data.response !== "string" ||
    !data.response.trim()
  ) {
    throw new AiError(
      data.error ||
        "A inteligência artificial não retornou uma resposta."
    );
  }

  const result = data.response.trim();

  try {
    JSON.parse(result);
  } catch {
    throw new AiError(
      data.done_reason === "length"
        ? "A resposta da IA ultrapassou o limite de geração. " +
          "Tente novamente com um currículo ou vaga mais curtos."
        : "A inteligência artificial não retornou um JSON válido."
    );
  }

  return result;
}

export const ollamaProvider: AiProvider = {
  id: "ollama",

  label: "Ollama (Local)",

  async check(): Promise<ProviderStatus> {
    return checkOllama();
  },

  async generateJson(
    args: GenerateArgs
  ): Promise<string> {
    return generateOllamaJson(args);
  },
};
