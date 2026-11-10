
"use server";

import { requireAccount } from "@/lib/access";
import { cleanResumeText } from "@/lib/resumeCleanup";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProvider, getActiveModel } from "@/lib/ai";
import { personalizeResumeWithAI } from "@/lib/ai/personalizeResume";

export type ResumeGenerationResult = {
  success: boolean;
  error?: string;
  title?: string;
  content?: string;
};

export async function generatePersonalizedResume(
  resumeId: string,
  jobId: string
): Promise<ResumeGenerationResult> {
  const owner = await requireAccount();
  if (!resumeId || !jobId) {
    return {
      success: false,
      error: "Selecione um currículo e uma vaga.",
    };
  }

  try {
    const [resume, job] = await Promise.all([
      db.resume.findUnique({
        where: { id: resumeId, userId: owner.id },
      }),
      db.job.findUnique({
        where: { id: jobId, userId: owner.id },
      }),
    ]);

    if (!resume || !job) {
      return {
        success: false,
        error: "Currículo ou vaga não encontrado.",
      };
    }

    if (!resume.extractedText.trim()) {
      return {
        success: false,
        error:
          "Este currículo não possui texto extraído. Envie um PDF com texto selecionável.",
      };
    }

    const provider = getProvider();
    const status = await provider.check();

    if (!status.ok) {
      return {
        success: false,
        error:
          "O Ollama não está disponível. Verifique se ele está em execução.",
      };
    }

    const model = await getActiveModel(status.models, owner.id);

    if (!model) {
      return {
        success: false,
        error:
          "Nenhum modelo de IA disponível. Verifique as configurações.",
      };
    }

    const jobDescription = [
      `Cargo: ${job.title}`,
      `Empresa: ${job.company}`,
      `Localização: ${job.location}`,
      `Descrição: ${job.description}`,
      `Requisitos: ${job.requirements}`,
    ].join("\n");

    const result = await personalizeResumeWithAI(
      provider,
      model,
      resume.extractedText,
      jobDescription
    );

    return {
      success: true,
      title: `${job.title} - ${result.title}`.slice(0, 150),
      content: cleanResumeText(result.content),
    };
  } catch (error) {
    console.error("Erro ao personalizar currículo:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o currículo.",
    };
  }
}

export async function savePersonalizedResume(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const resumeId = String(
    formData.get("resumeId") ?? ""
  ).trim();

  const jobId = String(
    formData.get("jobId") ?? ""
  ).trim();

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const content = cleanResumeText(String(
    formData.get("content") ?? ""
  ));

  if (
    !resumeId ||
    !jobId ||
    !title ||
    !content ||
    title.length > 150 ||
    content.length > 30000
  ) {
    redirect(
      "/curriculos?erro=" +
        encodeURIComponent(
          "Preencha os dados do currículo corretamente."
        )
    );
  }

  const [resume, job] = await Promise.all([
    db.resume.findUnique({
      where: { id: resumeId, userId: owner.id },
      select: { id: true },
    }),
    db.job.findUnique({
      where: { id: jobId, userId: owner.id },
      select: { id: true },
    }),
  ]);

  if (!resume || !job) {
    redirect(
      "/curriculos?erro=" +
        encodeURIComponent(
          "Currículo original ou vaga não encontrado."
        )
    );
  }

  await db.resumeVersion.create({
    data: {
      resumeId,
      jobId,
      title,
      content,
    },
  });

  revalidatePath("/curriculos");
  revalidatePath("/oportunidades");
  revalidatePath("/");

  redirect(
    "/curriculos?ok=" +
      encodeURIComponent(
        "Currículo personalizado salvo com sucesso!"
      )
  );
}
