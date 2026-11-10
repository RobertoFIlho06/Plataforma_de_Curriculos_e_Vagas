import { AiError, type AiProvider, type GenerateArgs, type ProviderStatus } from "./types";

// Chave acessível somente no servidor; nunca usar NEXT_PUBLIC_.
function config() {
  const key = process.env.AI_API_KEY?.trim() || "";
  const model = process.env.AI_API_MODEL?.trim() || "";
  const base = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
  if (!/^https:\/\/[^\s]+$/.test(base)) {
    throw new AiError("AI_API_BASE_URL deve ser uma URL HTTPS.");
  }
  return { key, model, base };
}

export const externalApiProvider: AiProvider = {
  id: "external",
  label: "API externa",
  async check(): Promise<ProviderStatus> {
    try {
      const { key, model } = config();
      if (!key || !model) return { ok: false, message: "Configure AI_API_KEY e AI_API_MODEL no servidor.", models: [] };
      // Não faz chamada de cobrança ou consulta de modelos; valida apenas configuração.
      return { ok: true, message: "API configurada (conectividade ainda não testada).", models: [model] };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Configuração inválida.", models: [] };
    }
  },
  async generateJson(args: GenerateArgs): Promise<string> {
    const { key, model, base } = config();
    if (!key || !model) throw new AiError("A API externa não está configurada.");
    if (!args.prompt.trim()) throw new AiError("O texto enviado para análise está vazio.");
    if (args.model !== model) throw new AiError("O modelo solicitado não corresponde ao modelo configurado no servidor.");
    let response: Response;
    try {
      response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model, temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: args.system },
            { role: "user", content: args.prompt },
          ],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(120000),
      });
    } catch {
      throw new AiError("Não foi possível acessar a API externa ou a solicitação excedeu o tempo limite.");
    }
    if (!response.ok) throw new AiError(`A API externa retornou HTTP ${response.status}.`);
    let data: unknown;
    try { data = await response.json(); } catch { throw new AiError("A API retornou uma resposta inválida."); }
    const choices = (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices;
    const content = choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) throw new AiError("A API não retornou conteúdo.");
    try { JSON.parse(content); } catch { throw new AiError("A API não retornou JSON válido."); }
    return content;
  },
};
