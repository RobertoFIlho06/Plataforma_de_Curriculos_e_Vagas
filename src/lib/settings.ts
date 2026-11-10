import { db } from "./db";

// Preferencias individuais sao armazenadas no modelo Setting existente.
// Nenhuma alteracao no schema ou migracao e necessaria.
function scopedKey(userId: string, key: string): string {
  if (!userId.trim() || !key.trim()) {
    throw new Error("Identificador de configuracao invalido.");
  }
  return `user:${userId}:${key}`;
}

export async function getUserSetting(userId: string, key: string): Promise<string | null> {
  const row = await db.setting.findUnique({ where: { key: scopedKey(userId, key) } });
  return row?.value ?? null;
}

export async function setUserSetting(userId: string, key: string, value: string): Promise<void> {
  const scoped = scopedKey(userId, key);
  await db.setting.upsert({
    where: { key: scoped },
    update: { value },
    create: { key: scoped, value },
  });
}

// Funcoes globais mantidas apenas para compatibilidade com outras configuracoes.
export async function getSetting(key: string): Promise<string | null> {
  const row = await db.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
