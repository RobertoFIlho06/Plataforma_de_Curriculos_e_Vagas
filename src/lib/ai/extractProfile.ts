import { AiError, type AiProvider } from "./types";
import { AI_FIELDS, type AiFieldName } from "../profileFields";

export type ProfileDraft = Record<AiFieldName, string>;

export interface ProfileDraftResult {
  fields: ProfileDraft;
  /** Avisos para mostrar na tela de revisão */
  warnings: string[];
}

export const MAX_RESUME_CHARS = 12_000;

const SYSTEM_PROMPT =
  "Você é um assistente que lê currículos e extrai dados para um formulário. " +
  "Responda SOMENTE com um objeto JSON válido, sem nenhum texto antes ou depois. " +
  "Copie apenas informações que estão escritas no currículo. " +
  "Nunca invente, complete ou deduza dados. Se uma informação não estiver no texto, use string vazia.";

function buildPrompt(resumeText: string): string {
  return `Extraia do currículo abaixo os campos a seguir e devolva um JSON com exatamente estas chaves, todas com valor em texto:

- fullName: nome completo
- email: e-mail
- phone: telefone
- linkedin: URL do perfil pessoal do LinkedIn (somente quando estiver escrita no currículo)
- city: cidade
- state: estado
- education: formação acadêmica, um item por linha
- experience: experiências profissionais, um item por linha, com cargo, empresa e período quando houver, mais as principais atividades
- courses: cursos e certificações, um por linha
- technicalSkills: habilidades técnicas, separadas por vírgula
- softSkills: habilidades comportamentais, separadas por vírgula (somente se o currículo as citar)

Regras:
- Use apenas o que está escrito no currículo.
- Não invente cargos, empresas, datas, cursos, certificações nem habilidades.
- Se um campo não aparecer no currículo, devolva "" (string vazia).
- Escreva no mesmo idioma do currículo.

CURRÍCULO:
"""
${resumeText}
"""`;
}

// Converte qualquer valor devolvido pela IA em texto simples
function toText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(toText).filter(Boolean).join(" | ");
  }
  return "";
}

// A IA às vezes envolve o JSON em ```; pegamos só o trecho entre a primeira { e a última }
export function parseJsonLoose(raw: string): Record<string, unknown> {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new AiError("A IA respondeu num formato inesperado. Tente de novo ou escolha outro modelo.");
  }
  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not object");
    return parsed as Record<string, unknown>;
  } catch {
    throw new AiError("A IA respondeu num formato inesperado. Tente de novo ou escolha outro modelo.");
  }
}

const digitsOnly = (s: string) => s.replace(/\D/g, "");

export async function extractProfileDraft(
  provider: AiProvider,
  model: string,
  resumeText: string
): Promise<ProfileDraftResult> {
  const warnings: string[] = [];

  let source = resumeText;
  if (source.length > MAX_RESUME_CHARS) {
    source = source.slice(0, MAX_RESUME_CHARS);
    warnings.push(
      `O currículo é longo: a IA leu só os primeiros ${MAX_RESUME_CHARS.toLocaleString("pt-BR")} caracteres. Confira se nada importante ficou de fora.`
    );
  }

  const raw = await provider.generateJson({
    model,
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(source),
  });
  const parsed = parseJsonLoose(raw);

  const fields = {} as ProfileDraft;
  for (const field of AI_FIELDS) {
    fields[field.name] = toText(parsed[field.name]);
  }

  // Trava anti-invenção: e-mail e telefone só valem se aparecerem de fato no currículo
  if (fields.email && !source.toLowerCase().includes(fields.email.toLowerCase())) {
    fields.email = "";
    warnings.push("O e-mail sugerido pela IA não aparece no currículo e foi descartado.");
  }
  if (fields.phone) {
    const phoneDigits = digitsOnly(fields.phone);
    const tail = phoneDigits.slice(-8);
    if (phoneDigits.length < 8 || !digitsOnly(source).includes(tail)) {
      fields.phone = "";
      warnings.push("O telefone sugerido pela IA não aparece no currículo e foi descartado.");
    }
  }

  // Nunca aceitar um LinkedIn criado pela IA: a URL precisa estar no texto original.
  if (fields.linkedin) {
    const link = fields.linkedin.trim().replace(/[),.;]+$/, "");
    const valid = /^https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[a-zA-Z0-9%_-]+\/?(?:[?#][^\s]*)?$/i.test(link);
    if (!valid || !source.toLowerCase().includes(link.toLowerCase())) {
      fields.linkedin = "";
      warnings.push("O LinkedIn sugerido não foi confirmado no currículo e foi descartado.");
    } else {
      fields.linkedin = link;
    }
  }

  if (AI_FIELDS.every((f) => !fields[f.name])) {
    throw new AiError(
      "A IA não conseguiu encontrar dados nesse currículo. Tente de novo ou escolha outro modelo em Configurações."
    );
  }

  return { fields, warnings };
}
