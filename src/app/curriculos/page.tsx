
import { db } from "@/lib/db";
import { requireAccount } from "@/lib/access";

import {
  deleteResume,
  extractProfileFromResume,
  uploadResume,
} from "../actions";

import PageHeader from "@/components/PageHeader";
import Notice from "@/components/Notice";
import PendingForm from "@/components/PendingForm";

import PersonalizarCurriculo from "./PersonalizarCurriculo";
import ExcluirVersaoButton from "./ExcluirVersaoButton";
import { excluirCurriculoPersonalizado } from "./excluir-versao-actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  ok?: string;
  erro?: string;
};

export default async function CurriculosPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const params = await searchParams;

  const owner = await requireAccount();
  const [resumes, jobs, versions] = await Promise.all([
    db.resume.findMany({
      where: { userId: owner.id },
      orderBy: { createdAt: "desc" },
    }),

    db.job.findMany({
      where: { userId: owner.id },
      orderBy: { foundAt: "desc" },
      select: {
        id: true,
        title: true,
        company: true,
      },
    }),

    db.resumeVersion.findMany({
      where: { resume: { userId: owner.id } },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#168466]">DOCUMENTOS PROFISSIONAIS</p>
      <PageHeader
        title="Currículos"
        subtitle="Envie seu currículo original em PDF e crie versões personalizadas com inteligência artificial."
      />

      <Notice
        ok={params.ok}
        erro={params.erro}
      />

      <section className="card mb-8 rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
        <h2 className="mb-3 text-lg font-bold text-[#1c2924]">
          Enviar currículo original
        </h2>

        <p className="mb-4 text-sm text-[#718178]">
          Envie um arquivo PDF de até 5 MB,
          com texto selecionável.
        </p>

        <form
          action={uploadResume}
          encType="multipart/form-data"
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label
              className="field-label"
              htmlFor="file"
            >
              Arquivo PDF
            </label>

            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              required
              className="field-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
          >
            Enviar currículo
          </button>
        </form>
      </section>

      <PersonalizarCurriculo
        resumes={resumes.map((resume) => ({
          id: resume.id,
          name: resume.originalFileName,
          hasText: Boolean(resume.extractedText.trim()),
        }))}
        jobs={jobs}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-[#1c2924]">
          Currículos personalizados
        </h2>

        {versions.length === 0 ? (
          <div className="card text-sm text-[#718178]">
            Nenhum currículo personalizado foi
            salvo ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <details
                key={version.id}
                className="card rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]"
              >
                <summary className="cursor-pointer font-bold text-[#1c2924] marker:text-[#168466]">
                  {version.title}
                </summary>

                <div className="mt-4 space-y-3">
                  <p className="text-sm text-[#718178]">
                    <strong>Vaga:</strong>{" "}
                    {version.job?.title ??
                      "Vaga não vinculada"}
                  </p>

                  {version.job?.company && (
                    <p className="text-sm text-[#718178]">
                      <strong>Empresa:</strong>{" "}
                      {version.job.company}
                    </p>
                  )}

                  <p className="text-xs text-[#819087]">
                    Criado em{" "}
                    {version.createdAt.toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>

                  <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm text-slate-800">
                    {version.content}
                  </pre>

                  <a
                    href={`/curriculos/versao/${encodeURIComponent(version.id)}/imprimir`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl bg-[#168466] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106c52]"
                  >
                    Imprimir / Salvar como PDF
                  </a>

                  <form action={excluirCurriculoPersonalizado} className="mt-3">
                    <input type="hidden" name="id" value={version.id} />
                    <ExcluirVersaoButton />
                  </form>

                  <p className="text-xs text-[#819087]">
                    Esta versão está salva no JobTriva
                    e pode ser vinculada a uma candidatura
                    na aba Minhas oportunidades.
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-[#1c2924]">
          Currículos enviados
        </h2>

        {resumes.length === 0 ? (
          <div className="card text-sm text-[#718178]">
            Nenhum currículo enviado ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <div key={r.id} className="card rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#1c2924]">
                      {r.originalFileName}
                    </p>

                    <p className="text-xs text-[#819087]">
                      Enviado em{" "}
                      {r.createdAt.toLocaleDateString(
                        "pt-BR"
                      )}{" "}
                      às{" "}
                      {r.createdAt.toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <form action={deleteResume}>
                    <input
                      type="hidden"
                      name="id"
                      value={r.id}
                    />

                    <button
                      type="submit"
                      className="btn-ghost-danger"
                    >
                      Excluir
                    </button>
                  </form>
                </div>

                {r.extractedText ? (
                  <>
                    <PendingForm
                      action={extractProfileFromResume}
                      pendingText="A IA está lendo o currículo. Em computadores sem placa de vídeo isso pode levar alguns minutos, não feche esta página."
                      className="mt-4"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={r.id}
                      />

                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Preencher meu perfil com IA
                      </button>

                      <span className="ml-3 text-xs text-[#819087]">
                        Você revisa tudo antes de
                        qualquer dado ser salvo.
                      </span>
                    </PendingForm>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-[#168466]">
                        Ver texto extraído (
                        {r.extractedText.length.toLocaleString(
                          "pt-BR"
                        )}{" "}
                        caracteres)
                      </summary>

                      <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                        {r.extractedText}
                      </pre>
                    </details>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-amber-700">
                    Nenhum texto encontrado neste PDF.
                    Provavelmente é um documento
                    escaneado (imagem).
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
