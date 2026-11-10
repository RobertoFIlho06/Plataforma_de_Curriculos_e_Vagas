/** Limpeza conservadora para currículos: preserva dados, siglas e pontuação útil. */
export function cleanResumeText(value: string): string {
  return value
    .normalize("NFC")
    // Caracteres de controle e invisíveis, sem remover quebras de linha.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g, "")
    // Emojis (inclusive sequências com seletores e modificadores) e pictogramas.
    .replace(/\p{Extended_Pictographic}(?:\uFE0F|\uFE0E|\u200D|\p{Emoji_Modifier})*/gu, "")
    .replace(/[\uFE0E\uFE0F\u200D\u20E3]/g, "")
    // Marcadores e ornamentos comuns: não retirar sinais úteis em e-mails/URLs.
    .replace(/[★☆✦✧✪✩✫✬✭✮✯✰✓✔☑☒☐●◉○◆◇■□▪▫▶▷►▸❖❥❣]/g, "")
    .replace(/^[ \t]*[•·▪◦‣⁃]+[ \t]*/gm, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Apenas identifica palavras suspeitas; correção automática pode danificar nomes próprios. */
export function findSuspiciousResumeWords(value: string): string[] {
  const words = value.match(/[\p{L}]{4,}/gu) ?? [];
  const found = new Set<string>();
  for (const word of words) {
    const mixed = /\p{Ll}\p{Lu}|\p{Lu}{2,}\p{Ll}/u.test(word);
    const repeated = /(\p{L})\1{2,}/iu.test(word);
    if (mixed || repeated) found.add(word);
  }
  return [...found].slice(0, 20);
}
