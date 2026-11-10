import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Exige uma conta local válida antes de ler ou modificar dados privados.
 * Redireciona sessões ausentes, expiradas ou vinculadas a contas removidas.
 * A liberação de múltiplas contas depende de auditoria adicional.
 */
export async function requireAccount() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: unknown } | undefined)?.id;

  if (typeof id !== "string" || !id.trim()) {
    redirect("/login");
  }

  const account = await db.user.findUnique({ where: { id } });
  if (!account?.authEmail) {
    redirect("/login");
  }

  return account;
}
