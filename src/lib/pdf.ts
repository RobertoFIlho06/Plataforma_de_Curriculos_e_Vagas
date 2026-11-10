// Extração de texto de PDFs (somente PDFs com texto selecionável; PDFs escaneados
// vêm vazios e precisariam de OCR, o que não faz parte desta versão).

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Importa o arquivo interno para evitar o modo de depuração do pdf-parse,
  // que tenta ler um PDF de teste ao ser carregado pelo caminho principal.
  const mod = await import("pdf-parse/lib/pdf-parse.js");
  const parse = mod.default;
  // PDF.js antigo pode interpretar Buffer do Node incorretamente.
  // Uma Uint8Array independente evita o erro "bad XRef entry".
  const parsePdf = parse as unknown as (input: Uint8Array) => Promise<{ text: string }>;
  const data = await parsePdf(new Uint8Array(buffer));
  return data.text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
