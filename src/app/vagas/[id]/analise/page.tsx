
import Link from "next/link";
import AiPendingForm from "@/components/AiPendingForm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAccount } from "@/lib/access";
import { analyzeSavedJob } from "../../actions";

export const dynamic = "force-dynamic";

function readList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is string => typeof item === "string"
    );
  } catch {
    return [];
  }
}

function ResultList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="card">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhuma informação identificada.
        </p>
      ) : (
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function JobAnalysisPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { erro?: string; ok?: string };
}) {
  const owner = await requireAccount();
  const job = await db.job.findUnique({
    where: { id: params.id, userId: owner.id },
    include: {
      analyses: {
        where: { userId: owner.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!job) notFound();

  const analysis = job.analyses[0];

  return (
    <main className="space-y-6">
      <Link
        href="/vagas"
        className="text-sm font-medium text-indigo-600"
      >
        ← Voltar para vagas
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Análise de compatibilidade
        </h1>
        <p className="mt-1 text-slate-600">
          {job.title} — {job.company || "Empresa não informada"}
        </p>
      </div>

      {searchParams?.erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {searchParams.erro}
        </div>
      )}

      {searchParams?.ok && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          Análise realizada e salva com sucesso!
        </div>
      )}

      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">
          Analisar esta vaga
        </h2>

        <p className="mb-4 text-sm text-slate-600">
          A IA comparará os requisitos da vaga com as
          informações cadastradas no seu perfil profissional.
          A análise pode levar alguns minutos.
        </p>

        <AiPendingForm action={analyzeSavedJob} jobId={job.id} label={analysis ? "Analisar novamente com IA" : "Analisar com IA"} />
      </section>

      {analysis ? (
        <>
          <section className="card text-center">
            <p className="text-sm text-slate-500">
              Compatibilidade estimada pela IA
            </p>

            <p className="my-3 text-5xl font-bold text-indigo-600">
              {analysis.score}%
            </p>

            <div className="mx-auto h-3 max-w-lg overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-slate-600">
              {analysis.aiSummary}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Resultado estimado, não representa chance de contratação.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <ResultList
              title="Requisitos atendidos"
              items={readList(analysis.met)}
            />

            <ResultList
              title="Requisitos não comprovados"
              items={readList(analysis.unmet)}
            />

            <ResultList
              title="Pontos positivos"
              items={readList(analysis.positives)}
            />

            <ResultList
              title="Pontos de atenção"
              items={readList(analysis.attention)}
            />
          </div>

          <p className="text-xs text-slate-500">
            Última análise:{" "}
            {analysis.createdAt.toLocaleString("pt-BR")}
          </p>
        </>
      ) : (
        <section className="card text-sm text-slate-500">
          Esta vaga ainda não possui análise de compatibilidade.
        </section>
      )}
    </main>
  );
}
