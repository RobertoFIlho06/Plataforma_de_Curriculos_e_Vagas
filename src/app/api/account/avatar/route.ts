import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sua sessão expirou. Saia e entre novamente." }, { status: 401 });
    }

    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
    const avatarId = (body as { avatarId?: unknown } | null)?.avatarId;
    if (typeof avatarId !== "string" || !/^avatar-[1-5]$/.test(avatarId)) {
      return NextResponse.json({ error: "Selecione um dos cinco avatares." }, { status: 400 });
    }

    const account = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, authEmail: true, avatarUrl: true, authAccounts: { select: { provider: true } } },
    });
    if (!account) return NextResponse.json({ error: "Conta não encontrada. Faça login novamente." }, { status: 404 });
    if (account.authAccounts.some((a) => a.provider === "google")) {
      return NextResponse.json({ error: "A foto desta conta é gerenciada pelo Google." }, { status: 403 });
    }
    if (!account.authEmail) return NextResponse.json({ error: "Esta conta ainda não está vinculada ao login local." }, { status: 403 });

    await db.user.update({ where: { id: account.id }, data: { avatarId } });
    return NextResponse.json({ ok: true, avatarId });
  } catch (error) {
    console.error("[JobTriva] Erro ao salvar avatar:", error);
    return NextResponse.json({ error: "Erro no servidor ao salvar avatar. Confira o terminal do JobTriva." }, { status: 500 });
  }
}
