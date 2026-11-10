
"use server";

import { requireAccount } from "@/lib/access";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const VALID_STATUSES = [
  "FOUND",
  "APPLIED",
  "REVIEWING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

function getText(
  formData: FormData,
  field: string,
  maxLength = 5000
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function feedbackUrl(
  type: "ok" | "erro",
  message: string
): string {
  return `/oportunidades?${type}=${encodeURIComponent(
    message
  )}`;
}

function isValidStatus(
  value: string
): value is (typeof VALID_STATUSES)[number] {
  return VALID_STATUSES.some(
    (status) => status === value
  );
}

export async function createApplication(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const jobId = getText(formData, "jobId", 100);
  const resumeVersionId = getText(
    formData,
    "resumeVersionId",
    100
  );
  const message = getText(formData, "message", 10000);
  const status = getText(formData, "status", 30);

  if (!jobId) {
    redirect(
      feedbackUrl("erro", "Selecione uma vaga.")
    );
  }

  if (!isValidStatus(status)) {
    redirect(
      feedbackUrl("erro", "Status inválido.")
    );
  }

  const job = await db.job.findUnique({
    where: { id: jobId, userId: owner.id },
    select: { id: true },
  });

  if (!job) {
    redirect(
      feedbackUrl("erro", "Vaga não encontrada.")
    );
  }

  if (resumeVersionId) {
    const resume = await db.resumeVersion.findUnique({
      where: { id: resumeVersionId, resume: { userId: owner.id } },
      select: { id: true },
    });

    if (!resume) {
      redirect(
        feedbackUrl(
          "erro",
          "Currículo personalizado não encontrado."
        )
      );
    }
  }

  await db.application.create({
    data: {
      userId: owner.id,
      jobId,
      resumeVersionId: resumeVersionId || null,
      message,
      status,
      appliedAt:
        status === "FOUND" ? null : new Date(),
    },
  });

  revalidatePath("/oportunidades");
  revalidatePath("/");

  redirect(
    feedbackUrl(
      "ok",
      "Candidatura registrada com sucesso."
    )
  );
}

export async function updateApplication(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const id = getText(formData, "id", 100);
  const status = getText(formData, "status", 30);
  const resumeVersionId = getText(
    formData,
    "resumeVersionId",
    100
  );
  const message = getText(formData, "message", 10000);

  if (!id) {
    redirect(
      feedbackUrl(
        "erro",
        "Candidatura não identificada."
      )
    );
  }

  if (!isValidStatus(status)) {
    redirect(
      feedbackUrl("erro", "Status inválido.")
    );
  }

  const application = await db.application.findUnique({
    where: { id, userId: owner.id },
  });

  if (!application) {
    redirect(
      feedbackUrl(
        "erro",
        "Candidatura não encontrada."
      )
    );
  }

  if (resumeVersionId) {
    const resume = await db.resumeVersion.findUnique({
      where: { id: resumeVersionId, resume: { userId: owner.id } },
      select: { id: true },
    });

    if (!resume) {
      redirect(
        feedbackUrl(
          "erro",
          "Currículo personalizado não encontrado."
        )
      );
    }
  }

  await db.application.update({
    where: { id, userId: owner.id },
    data: {
      status,
      message,
      resumeVersionId: resumeVersionId || null,
      appliedAt:
        status !== "FOUND" && !application.appliedAt
          ? new Date()
          : status === "FOUND"
            ? null
            : application.appliedAt,
    },
  });

  revalidatePath("/oportunidades");
  revalidatePath("/");

  redirect(
    feedbackUrl(
      "ok",
      "Candidatura atualizada com sucesso."
    )
  );
}

export async function deleteApplication(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const id = getText(formData, "id", 100);

  if (!id) {
    redirect(
      feedbackUrl(
        "erro",
        "Candidatura não identificada."
      )
    );
  }

  const application = await db.application.findUnique({
    where: { id, userId: owner.id },
    select: { id: true },
  });

  if (!application) {
    redirect(
      feedbackUrl(
        "erro",
        "Candidatura não encontrada."
      )
    );
  }

  await db.application.delete({
    where: { id, userId: owner.id },
  });

  revalidatePath("/oportunidades");
  revalidatePath("/");

  redirect(
    feedbackUrl(
      "ok",
      "Registro de candidatura excluído."
    )
  );
}
