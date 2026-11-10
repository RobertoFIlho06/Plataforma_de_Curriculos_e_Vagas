
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { db } from "@/lib/db";
import { requireAccount } from "@/lib/access";

import {
  createApplication,
  updateApplication,
  deleteApplication,
} from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  ok?: string | string[];
  erro?: string | string[];
  status?: string | string[];
};

const STATUS_OPTIONS = [
  { value: "FOUND", label: "Encontrada" },
  { value: "APPLIED", label: "Candidatura enviada" },
  { value: "REVIEWING", label: "Em análise" },
  { value: "INTERVIEW", label: "Entrevista" },
  { value: "OFFER", label: "Proposta recebida" },
  { value: "REJECTED", label: "Não selecionado" },
  { value: "WITHDRAWN", label: "Desistência" },
];

function first(value?: string | string[]): string {
  return typeof value === "string" ? value : "";
}

function getStatusLabel(status: string): string {
  return (
    STATUS_OPTIONS.find(
      (option) => option.value === status
    )?.label ?? status
  );
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "INTERVIEW":
      return "bg-violet-50 text-violet-700";
    case "OFFER":
      return "bg-emerald-50 text-emerald-700";
    case "APPLIED":
      return "bg-blue-50 text-blue-700";
    case "REVIEWING":
      return "bg-amber-50 text-amber-800";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    case "WITHDRAWN":
      return "bg-slate-100 text-[#718178]";
    default:
      return "bg-[#e9f6ef] text-[#168466]";
  }
}

export default async function OportunidadesPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};

  const ok = first(params.ok);
  const erro = first(params.erro);
  const statusFilter = first(params.status);

  const owner = await requireAccount();
  const [jobs, resumeVersions, applications] =
    await Promise.all([
      db.job.findMany({
        where: { userId: owner.id },
        orderBy: { foundAt: "desc" },
      }),

      db.resumeVersion.findMany({
        where: { resume: { userId: owner.id } },
        orderBy: { createdAt: "desc" },
      }),

      db.application.findMany({
        where: { userId: owner.id },
        include: {
          job: true,
          resumeVersion: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const filteredApplications =
    statusFilter &&
    STATUS_OPTIONS.some(
      (option) => option.value === statusFilter
    )
      ? applications.filter(
          (application) =>
            application.status === statusFilter
        )
      : applications;

  const stats = {
    saved: jobs.length,
    applied: applications.filter(
      (item) => item.appliedAt !== null
    ).length,
    reviewing: applications.filter(
      (item) => item.status === "REVIEWING"
    ).length,
    interviews: applications.filter(
      (item) => item.status === "INTERVIEW"
    ).length,
  };

  return (
    <>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#168466]">GESTÃO DE CANDIDATURAS</p>
      <PageHeader
        title="Minhas oportunidades"
        subtitle="Acompanhe suas candidaturas e organize cada etapa do processo seletivo."
      />

      {ok && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {ok}
        </div>
      )}

      {erro && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* INDICADORES */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Vagas salvas",
            value: stats.saved,
          },
          {
            label: "Candidaturas registradas",
            value: stats.applied,
          },
          {
            label: "Em análise",
            value: stats.reviewing,
          },
          {
            label: "Entrevistas",
            value: stats.interviews,
          },
        ].map((card) => (
          <div key={card.label} className="card rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
            <p className="text-3xl font-extrabold tracking-tight text-[#173c2d]">
              {card.value}
            </p>

            <p className="mt-2 text-xs font-medium text-[#718178]">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* NOVA CANDIDATURA */}
      <section className="card mb-6 rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
        <h2 className="text-lg font-bold text-[#1c2924]">
          Registrar oportunidade
        </h2>

        <p className="mt-2 text-sm text-[#718178]">
          Selecione uma vaga cadastrada no JobTriva
          e registre o andamento da candidatura.
        </p>

        {jobs.length === 0 ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-[#718178]">
            Você ainda não cadastrou nenhuma vaga.{" "}
            <Link
              href="/vagas"
              className="font-medium text-[#168466] underline"
            >
              Ir para Vagas
            </Link>
          </div>
        ) : (
          <form
            action={createApplication}
            className="mt-5 space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="jobId"
                  className="field-label"
                >
                  Vaga *
                </label>

                <select
                  id="jobId"
                  name="jobId"
                  className="field-input"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione uma vaga
                  </option>

                  {jobs.map((job) => (
                    <option
                      key={job.id}
                      value={job.id}
                    >
                      {job.title}
                      {job.company
                        ? ` — ${job.company}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="field-label"
                >
                  Status *
                </label>

                <select
                  id="status"
                  name="status"
                  className="field-input"
                  defaultValue="FOUND"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="resumeVersionId"
                className="field-label"
              >
                Currículo personalizado utilizado
              </label>

              <select
                id="resumeVersionId"
                name="resumeVersionId"
                className="field-input"
                defaultValue=""
              >
                <option value="">
                  Nenhum currículo vinculado
                </option>

                {resumeVersions.map((resume) => (
                  <option
                    key={resume.id}
                    value={resume.id}
                  >
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="field-label"
              >
                Mensagem de apresentação ou observações
              </label>

              <textarea
                id="message"
                name="message"
                className="field-input min-h-28"
                maxLength={10000}
                placeholder="Registre a mensagem enviada à empresa ou informações importantes sobre a candidatura."
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
            >
              Registrar candidatura
            </button>
          </form>
        )}
      </section>

      {/* LISTA DE CANDIDATURAS */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#1c2924]">
            Acompanhamento ({filteredApplications.length})
          </h2>

          <form method="GET" action="/oportunidades">
            <select
              name="status"
              defaultValue={statusFilter}
              className="field-input"
            >
              <option value="">
                Todos os status
              </option>

              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Filtrar
            </button>
          </form>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="card text-sm text-[#718178]">
            Nenhuma candidatura encontrada.
            Registre sua primeira oportunidade
            utilizando o formulário acima.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <article
                key={application.id}
                className="card rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#1c2924]">
                      {application.job.title}
                    </h3>

                    <p className="text-sm text-[#718178]">
                      {application.job.company ||
                        "Empresa não informada"}
                    </p>

                    <p className="mt-2 text-xs font-medium text-[#718178]">
                      {application.job.location ||
                        "Localização não informada"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      application.status
                    )}`}
                  >
                    {getStatusLabel(
                      application.status
                    )}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[#718178] md:grid-cols-2">
                  <div>
                    <span className="font-medium text-slate-800">
                      Currículo:
                    </span>{" "}
                    {application.resumeVersion?.title ||
                      "Não vinculado"}
                  </div>

                  <div>
                    <span className="font-medium text-slate-800">
                      Data da candidatura:
                    </span>{" "}
                    {application.appliedAt
                      ? application.appliedAt.toLocaleDateString(
                          "pt-BR"
                        )
                      : "Ainda não enviada"}
                  </div>
                </div>

                {application.job.url && (
                  <div className="mt-3">
                    <a
                      href={application.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#168466] underline"
                    >
                      Abrir vaga original
                    </a>
                  </div>
                )}

                <form
                  action={updateApplication}
                  className="mt-5 space-y-4 border-t border-slate-100 pt-4"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={application.id}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`status-${application.id}`}
                        className="field-label"
                      >
                        Atualizar status
                      </label>

                      <select
                        id={`status-${application.id}`}
                        name="status"
                        defaultValue={application.status}
                        className="field-input"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`resume-${application.id}`}
                        className="field-label"
                      >
                        Currículo utilizado
                      </label>

                      <select
                        id={`resume-${application.id}`}
                        name="resumeVersionId"
                        defaultValue={
                          application.resumeVersionId ??
                          ""
                        }
                        className="field-input"
                      >
                        <option value="">
                          Nenhum currículo vinculado
                        </option>

                        {resumeVersions.map((resume) => (
                          <option
                            key={resume.id}
                            value={resume.id}
                          >
                            {resume.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`message-${application.id}`}
                      className="field-label"
                    >
                      Mensagem ou observações
                    </label>

                    <textarea
                      id={`message-${application.id}`}
                      name="message"
                      defaultValue={application.message}
                      className="field-input min-h-24"
                      maxLength={10000}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Salvar alterações
                  </button>
                </form>

                <form
                  action={deleteApplication}
                  className="mt-3"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={application.id}
                  />

                  <button
                    type="submit"
                    className="btn-ghost-danger"
                  >
                    Excluir registro
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
