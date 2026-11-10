// Contrato que todo provedor de IA precisa cumprir.
// Para adicionar outro provedor no futuro (outro servidor local, uma API etc.),
// basta criar um arquivo que implemente AiProvider e registrá-lo em ./index.ts.

export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}

export interface ProviderStatus {
  ok: boolean;
  message: string;
  /** Modelos disponíveis para uso */
  models: string[];
}

export interface GenerateArgs {
  model: string;
  system: string;
  prompt: string;
}

export interface AiProvider {
  id: string;
  label: string;
  /** Verifica se o provedor está acessível. Nunca lança erro. */
  check(): Promise<ProviderStatus>;
  /** Pede uma resposta em JSON (texto). Lança AiError com mensagem em português. */
  generateJson(args: GenerateArgs): Promise<string>;
}
