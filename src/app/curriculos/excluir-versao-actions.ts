"use server";

import { db } from "@/lib/db";
import { requireAccount } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function excluirCurriculoPersonalizado(formData: FormData) {
  const account = await requireAccount();
  const id = formData.get("id");
  if (typeof id !== "string" || !id.trim()) {
    redirect("/curriculos?erro=Curr%C3%ADculo%20inv%C3%A1lido");
  }

  const version = await db.resumeVersion.findFirst({
    where: { id, resume: { userId: account.id } },
    select: { id: true },
  });
  if (!version) {
    redirect("/curriculos?erro=Curr%C3%ADculo%20n%C3%A3o%20encontrado");
  }

  // Applications referencing this version use onDelete: SetNull in Prisma.
  await db.resumeVersion.delete({ where: { id: version.id } });
  revalidatePath("/curriculos");
  revalidatePath("/oportunidades");
  redirect("/curriculos?ok=Curr%C3%ADculo%20personalizado%20exclu%C3%ADdo");
}
