import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const jsonError = (error: string, status: number) =>
  NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } }
  );

export async function POST(request: Request) {
  // Cadastro público multiusuário continua desabilitado nesta etapa.
  // A criação da primeira conta só é permitida em um banco realmente vazio.
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    return jsonError("Envie os dados em formato JSON.", 415);
  }

  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return jsonError("Dados muito grandes.", 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonError("Dados inválidos.", 400);
    }
    input = parsed as Record<string, unknown>;
  } catch {
    return jsonError("Dados inválidos.", 400);
  }

  const name = typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const avatarId =
    typeof input.avatarId === "string" && /^avatar-[1-5]$/.test(input.avatarId)
      ? input.avatarId
      : "avatar-1";

  if (name.length < 2 || name.length > 120 || /[\d<>\u0000-\u001f]/u.test(name)) {
    return jsonError("Informe um nome válido, sem números, com 2 a 120 caracteres.", 400);
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Informe um e-mail válido.", 400);
  }
  if (password.length < 12 || password.length > 128 || Buffer.byteLength(password, "utf8") > 72) {
    return jsonError("Use uma senha de 12 a 128 caracteres, com até 72 bytes UTF-8.", 400);
  }

  // Nunca apropriar automaticamente perfis legados sem autenticação.
  // Isso também preserva o bloqueio do cadastro de contas adicionais.
  if ((await db.user.count()) !== 0) {
    return jsonError("Este JobTriva já possui dados ou uma conta. Entre com a conta existente; o cadastro de novas contas permanece bloqueado.", 403);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    // SQLite serializa escritas; a verificação transacional evita criar
    // uma segunda conta em uma execução concorrente comum.
    await db.$transaction(async (tx) => {
      if ((await tx.user.count()) !== 0) throw new Error("registration-closed");
      await tx.user.create({
        data: { fullName: name, email, authEmail: email, passwordHash, avatarId },
      });
    });
    return NextResponse.json(
      { ok: true },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Não foi possível criar a conta.", 409);
    }
    return jsonError("Não foi possível criar a conta. Verifique se já existe um cadastro.", 409);
  }
}
