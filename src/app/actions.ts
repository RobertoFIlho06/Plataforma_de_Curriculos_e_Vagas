
"use server";

import { requireAccount } from "@/lib/access";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user";
import { extractPdfText } from "@/lib/pdf";
import { setUserSetting } from "@/lib/settings";

import {
  AiError,
  getActiveModel,
  getProvider,
  MODEL_SETTING_KEY,
} from "@/lib/ai";

import {
  extractProfileDraft,
  type ProfileDraftResult,
} from "@/lib/ai/extractProfile";

import {
  AI_FIELDS,
  type AiFieldName,
} from "@/lib/profileFields";

import {
  MAX_PDF_BYTES,
  WORK_MODES,
} from "@/lib/constants";

import {
  sanitizePhone,
  validateProfileFields,
} from "@/lib/profileValidation";

const STORAGE_DIR = path.join(
  process.cwd(),
  "storage",
  "resumes"
);

const MAX_FIELD_LENGTH = 5000;

type AiProfileData = Record<AiFieldName, string>;

type FullProfileData = AiProfileData & {
  interestAreas: string;
  workMode: string;
  salaryExpectation: string;
};

// ---------- Funções auxiliares ----------

function text(
  formData: FormData,
  name: string
): string {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim().slice(0, MAX_FIELD_LENGTH)
    : "";
}

function go(
  pathname: string,
  key: "ok" | "erro",
  message: string
): never {
  redirect(
    `${pathname}?${key}=${encodeURIComponent(message)}`
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAiProfileData(
  formData: FormData
): AiProfileData {
  const data = {} as AiProfileData;

  for (const field of AI_FIELDS) {
    data[field.name] = text(formData, field.name);
  }

  data.phone = sanitizePhone(data.phone);

  return data;
}

function getFullProfileData(
  formData: FormData
): FullProfileData {
  const aiData = getAiProfileData(formData);

  return {
    ...aiData,
    interestAreas: text(formData, "interestAreas"),
    workMode: text(formData, "workMode"),
    salaryExpectation: text(
      formData,
      "salaryExpectation"
    ),
  };
}

function validateProfile(
  data: AiProfileData
): string[] {
  const errors = validateProfileFields({
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    linkedin: data.linkedin,
    city: data.city,
    state: data.state,
  });

  if (
    data.email &&
    !isValidEmail(data.email) &&
    !errors.some((error) =>
      error.toLowerCase().includes("e-mail")
    )
  ) {
    errors.push("E-mail inválido.");
  }

  return errors;
}

// ---------- Perfil ----------

export async function saveProfile(
  formData: FormData
) {
  await requireAccount();
  const data = getFullProfileData(formData);

  const errors = validateProfile(data);
  if (data.linkedin && !/^https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[a-zA-Z0-9%_-]+\/?(?:[?#][^\s]*)?$/i.test(data.linkedin)) {
    errors.push("Informe uma URL válida do perfil LinkedIn.");
  }

  if (
    data.workMode &&
    !(WORK_MODES as readonly string[]).includes(
      data.workMode
    )
  ) {
    errors.push("Modalidade de trabalho inválida.");
  }

  if (errors.length > 0) {
    go("/perfil", "erro", errors.join(" "));
  }

  const user = await getOrCreateUser();

  await db.user.update({
    where: { id: user.id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      education: data.education,
      experience: data.experience,
      courses: data.courses,
      technicalSkills: data.technicalSkills,
      softSkills: data.softSkills,
      interestAreas: data.interestAreas,
      workMode: data.workMode,
      salaryExpectation: data.salaryExpectation,
    },
  });

  revalidatePath("/perfil");

  go("/perfil", "ok", "Perfil salvo com sucesso.");
}

// ---------- Enviar currículo ----------

export async function uploadResume(
  formData: FormData
) {
  await requireAccount();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    go(
      "/curriculos",
      "erro",
      "Escolha um arquivo PDF para enviar."
    );
  }

  if (file.size > MAX_PDF_BYTES) {
    go(
      "/curriculos",
      "erro",
      "O arquivo passa de 5 MB. Envie um PDF menor."
    );
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    go(
      "/curriculos",
      "erro",
      "Só são aceitos arquivos com extensão .pdf."
    );
  }

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  if (
    buffer.subarray(0, 5).toString("latin1") !==
    "%PDF-"
  ) {
    go(
      "/curriculos",
      "erro",
      "Esse arquivo não parece ser um PDF válido."
    );
  }

  let extractedText = "";

  try {
    extractedText = await extractPdfText(buffer);
  } catch {
    go(
      "/curriculos",
      "erro",
      "Não consegui ler esse PDF. Ele pode estar protegido ou danificado."
    );
  }

  const storedFileName = `${randomUUID()}.pdf`;

  await mkdir(STORAGE_DIR, {
    recursive: true,
  });

  await writeFile(
    path.join(STORAGE_DIR, storedFileName),
    buffer
  );

  const user = await getOrCreateUser();

  await db.resume.create({
    data: {
      userId: user.id,
      originalFileName: file.name.slice(0, 200),
      storedFileName,
      extractedText,
    },
  });

  revalidatePath("/curriculos");

  if (!extractedText) {
    go(
      "/curriculos",
      "ok",
      "Currículo salvo, mas não encontrei texto nele. PDFs escaneados podem não funcionar nesta versão."
    );
  }

  go(
    "/curriculos",
    "ok",
    "Currículo enviado e texto extraído."
  );
}

// ---------- Excluir currículo ----------

export async function deleteResume(
  formData: FormData
) {
  await requireAccount();
  const id = text(formData, "id");
  const user = await getOrCreateUser();

  const resume = await db.resume.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!resume) {
    go(
      "/curriculos",
      "erro",
      "Currículo não encontrado."
    );
  }

  await unlink(
    path.join(STORAGE_DIR, resume.storedFileName)
  ).catch(() => {});

  await db.resume.delete({
    where: { id: resume.id },
  });

  revalidatePath("/curriculos");

  go("/curriculos", "ok", "Currículo excluído.");
}

// ---------- IA: extrair perfil do currículo ----------

export async function extractProfileFromResume(
  formData: FormData
) {
  await requireAccount();
  const id = text(formData, "id");
  const user = await getOrCreateUser();

  const resume = await db.resume.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!resume) {
    go(
      "/curriculos",
      "erro",
      "Currículo não encontrado."
    );
  }

  if (!resume.extractedText) {
    go(
      "/curriculos",
      "erro",
      "Esse currículo não tem texto para a IA ler."
    );
  }

  const provider = getProvider();
  const status = await provider.check();

  if (!status.ok) {
    go(
      "/curriculos",
      "erro",
      `${status.message} Veja como configurar em Configurações.`
    );
  }

  const model = await getActiveModel(
    status.models,
    user.id
  );

  if (!model) {
    go(
      "/curriculos",
      "erro",
      "Nenhum modelo de IA disponível."
    );
  }

  let result: ProfileDraftResult | null = null;
  let errorMessage = "";

  try {
    result = await extractProfileDraft(
      provider,
      model,
      resume.extractedText
    );
  } catch (err) {
    errorMessage =
      err instanceof AiError
        ? err.message
        : "Algo deu errado ao usar a IA. Tente novamente.";
  }

  if (!result) {
    go(
      "/curriculos",
      "erro",
      errorMessage
    );
  }

  await db.resume.update({
    where: { id: resume.id },
    data: {
      aiDraft: JSON.stringify(result),
    },
  });

  redirect(`/curriculos/${resume.id}/revisar`);
}

// ---------- IA: aplicar perfil revisado ----------

export async function applyProfileDraft(
  formData: FormData
) {
  await requireAccount();
  const resumeId = text(
    formData,
    "resumeId"
  );

  const user = await getOrCreateUser();

  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  if (!resume) {
    go(
      "/curriculos",
      "erro",
      "Currículo não encontrado."
    );
  }

  if (!resume.aiDraft) {
    go(
      "/curriculos",
      "erro",
      "Não existe um rascunho de IA pendente."
    );
  }

  // A IA altera somente os campos que extrai.
  // Áreas de interesse, modalidade e salário
  // permanecem como estavam no perfil.
  const data = getAiProfileData(formData);

  const errors = validateProfile(data);

  if (errors.length > 0) {
    go(
      `/curriculos/${resume.id}/revisar`,
      "erro",
      errors.join(" ")
    );
  }

  await db.user.update({
    where: { id: user.id },
    data,
  });

  await db.resume.update({
    where: { id: resume.id },
    data: { aiDraft: "" },
  });

  revalidatePath("/perfil");
  revalidatePath("/curriculos");

  go(
    "/perfil",
    "ok",
    "Perfil atualizado com os dados revisados."
  );
}

// ---------- Configuração da IA ----------

export async function saveAiModel(
  formData: FormData
) {
  const owner = await requireAccount();
  const model = text(
    formData,
    "model"
  ).slice(0, 100);

  const status = await getProvider().check();

  if (!status.ok) {
    go(
      "/configuracoes",
      "erro",
      status.message
    );
  }

  if (
    !model ||
    !status.models.includes(model)
  ) {
    go(
      "/configuracoes",
      "erro",
      "Escolha um dos modelos instalados na lista."
    );
  }

  await setUserSetting(
    owner.id,
    MODEL_SETTING_KEY,
    model
  );

  revalidatePath("/configuracoes");

  go(
    "/configuracoes",
    "ok",
    `Modelo "${model}" selecionado.`
  );
}

// ---------- Excluir todos os dados ----------

export async function deleteAllData(
  formData: FormData
) {
  await requireAccount();
  if (formData.get("confirm") !== "on") {
    go(
      "/configuracoes",
      "erro",
      "Marque a caixa de confirmação para excluir os dados."
    );
  }

  // Esta ação permanece bloqueada enquanto não houver exclusão segura por conta.
  // Nunca excluir registros ou arquivos de outros usuários.
  go(
    "/configuracoes",
    "erro",
    "Exclusão total temporariamente indisponível por segurança."
  );
}
