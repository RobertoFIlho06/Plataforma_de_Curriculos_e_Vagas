
import { getUserSetting } from "../settings";
import { ollamaProvider } from "./ollama";
import { externalApiProvider } from "./externalApi";
import type { AiProvider } from "./types";

export const MODEL_SETTING_KEY = "ollamaModel";

// Ponto único de escolha do provedor de IA.
// Atualmente, o JobTriva utiliza o Ollama.
export function getProvider(): AiProvider {
  return process.env.AI_PROVIDER?.trim().toLowerCase() === "external"
    ? externalApiProvider
    : ollamaProvider;
}

// Retorna o modelo de IA escolhido nas Configurações.
// Se o modelo salvo não estiver disponível, utiliza
// o primeiro modelo instalado.
//
// Também protege a aplicação caso a lista de modelos
// seja undefined, null ou esteja vazia.
export async function getActiveModel(
  installed: string[] | undefined | null,
  userId: string
): Promise<string | null> {
  const saved = await getUserSetting(userId, MODEL_SETTING_KEY);

  const availableModels: string[] = Array.isArray(installed)
    ? installed
    : [];

  if (
    typeof saved === "string" &&
    saved.trim().length > 0 &&
    availableModels.includes(saved)
  ) {
    return saved;
  }

  if (availableModels.length > 0) {
    return availableModels[0];
  }

  return null;
}

// Exporta os erros personalizados da IA.
export { AiError } from "./types";
