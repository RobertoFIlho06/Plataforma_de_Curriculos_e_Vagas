
export function sanitizePhone(value: string): string {
  return value
    .replace(/[^\d()+\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateProfileFields(fields: {
  fullName?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  city?: string;
  state?: string;
}): string[] {
  const errors: string[] = [];

  const name = fields.fullName?.trim() || "";
  const phone = fields.phone?.trim() || "";
  const email = fields.email?.trim() || "";
  const city = fields.city?.trim() || "";
  const state = fields.state?.trim() || "";

  const namePattern = /^[\p{L}\p{M}]+(?:[ '\u2019.-][\p{L}\p{M}]+)*$/u;
  const placePattern = /^[\p{L}\p{M}\s.'\u2019-]+$/u;

  if (name && !namePattern.test(name)) {
    errors.push("O nome contém números ou caracteres inválidos.");
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "");

    if (!/^[\d()+\-\s]+$/.test(phone)) {
      errors.push("O telefone contém caracteres inválidos.");
    } else if (digits.length < 8 || digits.length > 15) {
      errors.push("Confira a quantidade de dígitos do telefone.");
    }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("O e-mail possui um formato inválido.");
  }

  if (city && !placePattern.test(city)) {
    errors.push("A cidade contém caracteres inválidos.");
  }

  if (state && !placePattern.test(state)) {
    errors.push("O estado contém caracteres inválidos.");
  }

  return errors;
}
