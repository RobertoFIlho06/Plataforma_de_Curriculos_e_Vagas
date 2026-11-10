
"use server";

import { requireAccount } from "@/lib/access";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getProvider, getActiveModel } from "@/lib/ai";
import { analyzeJobWithAI } from "@/lib/ai/analyzeJob";

function getText(
  formData: FormData,
  field: string,
  max = 5000
): string {
  const value = formData.get(field);
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

function vagasUrl(
  type: "ok" | "erro",
  message: string
): string {
  return `/vagas?${type}=${encodeURIComponent(message)}`;
}

function analysisUrl(
  jobId: string,
  message: string
): string {
  return `/vagas/${encodeURIComponent(jobId)}/analise?erro=${encodeURIComponent(message)}`;
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type EmpregareJob = {
  id?: number;
  url?: string | null;
  titulo?: string | null;
  chamada?: string | null;
  salario?: string | null;
  nivel?: string | null;
  empresa?: string | null;
  cidades?: string[] | null;
  trabalhoRemotoTexto?: string | null;
};

type EmpregareResponse = {
  sucesso?: boolean;
  model?: {
    dados?: EmpregareJob[];
  };
};

const ESTADOS: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

// ---------- Cadastrar vaga ----------

export async function createJob(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const title = getText(formData, "title", 200);
  const company = getText(formData, "company", 200);
  const location = getText(formData, "location", 200);
  const salary = getText(formData, "salary", 100);
  const url = getText(formData, "url", 2000);
  const description = getText(
    formData,
    "description",
    15000
  );
  const requirements = getText(
    formData,
    "requirements",
    10000
  );

  if (!title || !description) {
    redirect(
      vagasUrl(
        "erro",
        "Preencha o cargo e a descrição."
      )
    );
  }

  if (url) {
    try {
      const parsed = new URL(url);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        throw new Error("Link inválido");
      }
    } catch {
      redirect(
        vagasUrl(
          "erro",
          "Informe um link válido."
        )
      );
    }
  }

  await db.job.create({
    data: {
      userId: owner.id,
      title,
      company,
      location,
      salary,
      url,
      description,
      requirements,
      source: "manual",
    },
  });

  revalidatePath("/vagas");
  revalidatePath("/");

  redirect(
    vagasUrl(
      "ok",
      "Vaga cadastrada com sucesso."
    )
  );
}

// ---------- Excluir vaga ----------

export async function deleteJob(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const id = getText(formData, "id", 100);

  if (!id) {
    redirect(
      vagasUrl("erro", "Vaga não identificada.")
    );
  }

  const job = await db.job.findUnique({
    where: { id, userId: owner.id },
    select: { id: true },
  });

  if (!job) {
    redirect(
      vagasUrl("erro", "Vaga não encontrada.")
    );
  }

  await db.job.delete({
    where: { id, userId: owner.id },
  });

  revalidatePath("/vagas");
  revalidatePath("/");

  redirect(
    vagasUrl("ok", "Vaga excluída com sucesso.")
  );
}

// ---------- Importar vagas brasileiras ----------

export async function importExternalJobs(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const cargo = getText(
    formData,
    "externalSearch",
    100
  );

  const cidade = getText(
    formData,
    "externalCity",
    100
  );

  const estadoSigla = getText(
    formData,
    "externalState",
    2
  ).toUpperCase();

  const modalidade = getText(
    formData,
    "externalMode",
    50
  );

  const nivel = getText(
    formData,
    "externalLevel",
    100
  );

  const regime = getText(
    formData,
    "externalContract",
    50
  );

  if (cargo.length < 2) {
    redirect(
      vagasUrl(
        "erro",
        "Informe um cargo com pelo menos 2 caracteres."
      )
    );
  }

  if (!estadoSigla || !ESTADOS[estadoSigla]) {
    redirect(
      vagasUrl(
        "erro",
        "Selecione um estado brasileiro."
      )
    );
  }

  if (!cidade) {
    redirect(
      vagasUrl(
        "erro",
        "Informe a cidade onde deseja trabalhar."
      )
    );
  }

  const endpoint = new URL(
    "https://pdv.empregare.com/api/pt-br/vagas/buscar-novo"
  );

  endpoint.searchParams.set("Query", cargo);
  endpoint.searchParams.set(
    "Estado",
    ESTADOS[estadoSigla]
  );
  endpoint.searchParams.set("Cidade", cidade);
  endpoint.searchParams.set("Pagina", "1");
  endpoint.searchParams.set("ItensPagina", "20");
  endpoint.searchParams.set("Ordenacao", "2");

  if (modalidade) {
    endpoint.searchParams.set(
      "Modalidade",
      modalidade
    );
  }

  if (nivel) {
    endpoint.searchParams.set("Nivel", nivel);
  }

  if (regime) {
    endpoint.searchParams.set("Regime", regime);
  }

  let externalJobs: EmpregareJob[] = [];

  try {
    const response = await fetch(
      endpoint.toString(),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erro HTTP ${response.status}`
      );
    }

    const data =
      (await response.json()) as EmpregareResponse;

    if (
      data.sucesso !== true ||
      !Array.isArray(data.model?.dados)
    ) {
      throw new Error(
        "Resposta inesperada da Empregare."
      );
    }

    externalJobs = data.model.dados;
  } catch (error) {
    console.error(
      "Erro na importação Empregare:",
      error
    );

    redirect(
      vagasUrl(
        "erro",
        "Não foi possível consultar a Empregare. Verifique o terminal e tente novamente."
      )
    );
  }

  let imported = 0;
  let duplicates = 0;
  let ignored = 0;

  const processedUrls = new Set<string>();

  for (const externalJob of externalJobs) {
    const title = cleanText(
      externalJob.titulo || ""
    ).slice(0, 200);

    const company = cleanText(
      externalJob.empresa || ""
    ).slice(0, 200);

    const cities = Array.isArray(
      externalJob.cidades
    )
      ? externalJob.cidades
      : [];

    // Proteção adicional contra cidades diferentes.
    const matchesCity = cities.some(
      (item) =>
        normalize(item) === normalize(cidade) ||
        normalize(item).startsWith(
          normalize(cidade) + " "
        ) ||
        normalize(item).startsWith(
          normalize(cidade) + "/"
        ) ||
        normalize(item).startsWith(
          normalize(cidade) + ","
        ) ||
        normalize(item).startsWith(
          normalize(cidade) + " -"
        )
    );

    if (!matchesCity) {
      ignored++;
      continue;
    }

    const rawUrl = (
      externalJob.url || ""
    ).trim();

    let url = "";

    if (rawUrl.startsWith("/")) {
      url = new URL(
        rawUrl,
        "https://www.empregare.com"
      ).toString();
    } else if (
      rawUrl.startsWith(
        "https://www.empregare.com/"
      )
    ) {
      url = rawUrl;
    } else if (
      typeof externalJob.id === "number" &&
      Number.isInteger(externalJob.id) &&
      externalJob.id > 0
    ) {
      url = `https://www.empregare.com/v${externalJob.id}`;
    }

    if (!title || !url) {
      ignored++;
      continue;
    }

    if (processedUrls.has(url)) {
      duplicates++;
      continue;
    }

    processedUrls.add(url);

    const existing = await db.job.findFirst({
      where: { url, userId: owner.id },
      select: { id: true },
    });

    if (existing) {
      duplicates++;
      continue;
    }

    const description = cleanText(
      externalJob.chamada || ""
    ).slice(0, 15000);

    const requirements = [
      externalJob.nivel
        ? `Nível: ${externalJob.nivel}`
        : "",
      externalJob.trabalhoRemotoTexto
        ? `Modalidade: ${externalJob.trabalhoRemotoTexto}`
        : "",
      "Consulte os requisitos completos no link original.",
    ]
      .filter(Boolean)
      .join("\n");

    await db.job.create({
      data: {
        userId: owner.id,
        title,
        company,
        location: `${cidade}, ${estadoSigla}`,
        salary: cleanText(
          externalJob.salario || ""
        ).slice(0, 100),
        url,
        description:
          description ||
          "Consulte a descrição completa no anúncio original.",
        requirements,
        source: "empregare",
      },
    });

    imported++;
  }

  revalidatePath("/vagas");
  revalidatePath("/");

  redirect(
    vagasUrl(
      "ok",
      `Busca concluída: ${imported} importadas, ${duplicates} duplicadas e ${ignored} ignoradas.`
    )
  );
}

// ---------- Analisar vaga com IA ----------

export async function analyzeSavedJob(
  formData: FormData
): Promise<void> {
  const owner = await requireAccount();
  const jobId = getText(formData, "jobId", 100);

  if (!jobId) {
    redirect(
      vagasUrl("erro", "Vaga não identificada.")
    );
  }

  const job = await db.job.findUnique({
    where: { id: jobId, userId: owner.id },
  });

  if (!job) {
    redirect(
      vagasUrl("erro", "Vaga não encontrada.")
    );
  }

  const user = owner;

  if (!user) {
    redirect(
      "/perfil?erro=Preencha%20seu%20perfil%20primeiro"
    );
  }

  const profileFields = [
    user.education,
    user.experience,
    user.courses,
    user.technicalSkills,
    user.softSkills,
  ];

  const hasProfile = profileFields.some(
    (field) => field.trim().length > 0
  );

  if (!hasProfile) {
    redirect(
      "/perfil?erro=Complete%20seu%20perfil%20antes%20da%20analise"
    );
  }

  const profile = [
    `Formação: ${user.education}`,
    `Experiência: ${user.experience}`,
    `Cursos: ${user.courses}`,
    `Habilidades técnicas: ${user.technicalSkills}`,
    `Habilidades comportamentais: ${user.softSkills}`,
    `Áreas de interesse: ${user.interestAreas}`,
  ].join("\n");

  const jobText = [
    `Cargo: ${job.title}`,
    `Empresa: ${job.company}`,
    `Descrição: ${job.description}`,
    `Requisitos: ${job.requirements}`,
  ].join("\n");

  const provider = getProvider();
  const status = await provider.check();

  if (!status.ok) {
    redirect(
      analysisUrl(jobId, status.message)
    );
  }

  const model = await getActiveModel(
    status.models,
    owner.id
  );

  if (!model) {
    redirect(
      analysisUrl(
        jobId,
        "Nenhum modelo de IA disponível."
      )
    );
  }

  let analysis;
  let analysisError = "";

  try {
    analysis = await analyzeJobWithAI(
      provider,
      model,
      profile,
      jobText
    );
  } catch (error) {
    analysisError =
      error instanceof Error
        ? error.message
        : "Não foi possível realizar a análise.";
  }

  if (analysisError || !analysis) {
    redirect(
      analysisUrl(
        jobId,
        analysisError ||
          "A análise não foi concluída."
      )
    );
  }

  await db.analysis.create({
    data: {
      userId: owner.id,
      jobId,
      score: analysis.score,
      met: JSON.stringify(analysis.met),
      unmet: JSON.stringify(analysis.unmet),
      positives: JSON.stringify(
        analysis.positives
      ),
      attention: JSON.stringify(
        analysis.attention
      ),
      aiSummary: analysis.summary,
    },
  });

  revalidatePath(`/vagas/${jobId}/analise`);
  revalidatePath("/vagas");
  revalidatePath("/");

  redirect(
    `/vagas/${encodeURIComponent(jobId)}/analise?ok=1`
  );
}
