import { requireAccount } from "@/lib/access";

// Perfil associado à conta autenticada; nunca seleciona o primeiro usuário globalmente.
export async function getOrCreateUser() {
  return requireAccount();
}
