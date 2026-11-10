
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAccount } from "@/lib/access";
import { createJob, deleteJob } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  busca?: string | string[];
  localizacao?: string | string[];
  ordem?: string | string[];
  ok?: string | string[];
  erro?: string | string[];
};

type IconName =
  | "search"
  | "briefcase"
  | "plus"
  | "filter"
  | "location"
  | "money"
  | "calendar"
  | "external"
  | "sparkles"
  | "document"
  | "trash"
  | "arrow"
  | "check"
  | "layers";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const icons: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12c5 3 13 3 18 0" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    filter: <path d="M4 7h16M7 12h10M10 17h4" />,
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    money: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
        <path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z" />
      </>
    ),
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15" />
        <path d="M10 10v7M14 10v7" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function first(value?: string | string[]): string {
  return typeof value === "string" ? value : "";
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCompanyInitials(company: string | null): string {
  const name = company?.trim();

  if (!name) {
    return "EM";
  }

  const words = name.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toLocaleUpperCase("pt-BR");
  }

  return (
    words[0].charAt(0) + words[1].charAt(0)
  ).toLocaleUpperCase("pt-BR");
}

const jobSites = [
  {
    name: "Indeed",
    description: "Oportunidades de diversas empresas.",
    url: "https://br.indeed.com/",
    domain: "indeed.com",
  },
  {
    name: "InfoJobs",
    description: "Vagas em diferentes áreas profissionais.",
    url: "https://www.infojobs.com.br/",
    domain: "infojobs.com.br",
  },
  {
    name: "Glassdoor",
    description: "Vagas e informações sobre empresas.",
    url: "https://www.glassdoor.com.br/",
    domain: "glassdoor.com",
  },
  {
    name: "LinkedIn",
    description: "Conexões e oportunidades profissionais.",
    url: "https://www.linkedin.com/jobs/",
    domain: "linkedin.com",
  },
  {
    name: "Gupy",
    description: "Processos seletivos de empresas.",
    url: "https://portal.gupy.io/",
    domain: "gupy.io",
  },
  {
    name: "Catho",
    description: "Consulte oportunidades de emprego.",
    url: "https://www.catho.com.br/",
    domain: "catho.com.br",
  },
  {
    name: "Vagas.com",
    description: "Processos seletivos e vagas.",
    url: "https://www.vagas.com.br/",
    domain: "vagas.com.br",
  },
  {
    name: "Empregare",
    description: "Oportunidades em empresas brasileiras.",
    url: "https://www.empregare.com/",
    domain: "empregare.com",
  },
];

export default async function VagasPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};

  const busca = first(params.busca);
  const localizacao = first(params.localizacao);
  const ordem =
    first(params.ordem) === "antigas"
      ? "antigas"
      : "recentes";

  const ok = first(params.ok);
  const erro = first(params.erro);

  const owner = await requireAccount();
  const jobs = await db.job.findMany({
    where: { userId: owner.id },
    orderBy: {
      foundAt: ordem === "antigas" ? "asc" : "desc",
    },
  });

  const filteredJobs = jobs.filter((job) => {
    const searchableText = normalize(
      [
        job.title,
        job.company,
        job.description,
        job.requirements,
      ].join(" ")
    );

    const matchesSearch =
      !busca || searchableText.includes(normalize(busca));

    const matchesLocation =
      !localizacao ||
      normalize(job.location || "").includes(
        normalize(localizacao)
      );

    return matchesSearch && matchesLocation;
  });

  const hasFilters = Boolean(busca || localizacao);

  return (
    <div className="space-y-7 pb-10">
      {/* CABEÇALHO */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#168466]">
            Oportunidades
          </p>

          <h1 className="text-[28px] font-bold tracking-tight text-[#1c2924] md:text-[34px]">
            Explore suas vagas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#718178]">
            Descubra oportunidades, organize suas vagas
            e utilize a inteligência artificial para
            analisar sua compatibilidade.
          </p>
        </div>

        <a
          href="#cadastrar-vaga"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#168466] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#106c52]"
        >
          <Icon name="plus" className="h-4 w-4" />
          Nova vaga
        </a>
      </section>

      {/* MENSAGENS */}
      {ok && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-[#c9e8d4] bg-[#edf9f0] px-5 py-4 text-sm text-[#246d45]"
        >
          <Icon name="check" className="h-5 w-5 shrink-0" />
          <span>{ok}</span>
        </div>
      )}

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-[#f3d3d3] bg-[#fff1f1] px-5 py-4 text-sm text-[#b53b3b]"
        >
          {erro}
        </div>
      )}

      {/* PLATAFORMAS */}
      <section className="overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-5 md:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#1c2924]">
              Encontre oportunidades
            </h2>

            <p className="mt-1 text-xs text-[#819087]">
              Acesse plataformas de emprego e descubra novas vagas.
            </p>
          </div>

          <span className="rounded-full bg-[#edf8f1] px-3 py-1.5 text-[11px] font-semibold text-[#168466]">
            {jobSites.length} plataformas
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-5">
          {jobSites.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[138px] flex-col justify-between rounded-xl border border-[#e4ebe5] bg-[#fcfdfb] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9dcc7] hover:bg-[#f6fbf8] hover:shadow-[0_8px_22px_rgba(20,90,58,0.07)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e4ebe5] bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=128`}
                    alt={`Logo ${site.name}`}
                    width={28}
                    height={28}
                    loading="lazy"
                    className="h-7 w-7 object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#243e30]">
                    {site.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[#8b9b90]">
                    Plataforma de empregos
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-[#819087]">
                {site.description}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-[#edf1ed] pt-3 text-[11px] font-semibold text-[#168466]">
                <span>Acessar plataforma</span>
                <Icon
                  name="external"
                  className="h-3.5 w-3.5"
                />
              </div>
            </a>
          ))}
        </div>

        <div className="border-t border-[#edf1ed] bg-[#fbfdfb] px-5 py-3 md:px-6">
          <p className="text-xs leading-relaxed text-[#819087]">
            As plataformas abrem em uma nova aba. Depois de
            encontrar uma oportunidade, cadastre-a no JobTriva
            para organizar suas informações e utilizar a IA.
          </p>
        </div>
      </section>

      {/* CADASTRO */}
      <section
        id="cadastrar-vaga"
        className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.035)]"
      >
        <div className="border-b border-[#edf1ed] bg-gradient-to-r from-[#f1faf5] to-white px-5 py-5 md:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#168466] text-white">
              <Icon name="plus" className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#1c2924]">
                Cadastrar nova vaga
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-[#718178]">
                Salve uma oportunidade para analisar
                sua compatibilidade e acompanhar sua jornada.
              </p>
            </div>
          </div>
        </div>

        <form action={createJob} className="space-y-5 p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="field-label">
                Cargo *
              </label>
              <input
                id="title"
                name="title"
                className="field-input"
                placeholder="Ex.: Auxiliar Administrativo"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label htmlFor="company" className="field-label">
                Empresa
              </label>
              <input
                id="company"
                name="company"
                className="field-input"
                placeholder="Nome da empresa"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="location" className="field-label">
                Localização
              </label>
              <input
                id="location"
                name="location"
                className="field-input"
                placeholder="Ex.: Praia Grande, SP"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="salary" className="field-label">
                Salário
              </label>
              <input
                id="salary"
                name="salary"
                className="field-input"
                placeholder="Ex.: R$ 2.000 ou A combinar"
                maxLength={100}
              />
            </div>
          </div>

          <div>
            <label htmlFor="url" className="field-label">
              Link da vaga
            </label>
            <input
              id="url"
              name="url"
              type="url"
              className="field-input"
              placeholder="https://..."
              maxLength={2000}
            />
            <p className="mt-2 text-xs text-[#8b9b90]">
              Cole o endereço da oportunidade encontrada.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="field-label"
            >
              Descrição da vaga *
            </label>
            <textarea
              id="description"
              name="description"
              className="field-input min-h-36"
              placeholder="Cole a descrição da vaga, atividades e informações importantes."
              maxLength={15000}
              required
            />
          </div>

          <div>
            <label
              htmlFor="requirements"
              className="field-label"
            >
              Requisitos da vaga
            </label>
            <textarea
              id="requirements"
              name="requirements"
              className="field-input min-h-28"
              placeholder="Ex.: Ensino médio completo, Pacote Office, experiência com atendimento..."
              maxLength={10000}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] pt-5">
            <p className="text-xs text-[#8b9b90]">
              * Campos obrigatórios
            </p>

            <button type="submit" className="btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              Salvar vaga
            </button>
          </div>
        </form>
      </section>

      {/* VAGAS SALVAS */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#168466]">
              Sua organização
            </p>

            <h2 className="text-xl font-bold text-[#1c2924]">
              Vagas salvas
            </h2>

            <p className="mt-1 text-sm text-[#819087]">
              Gerencie as oportunidades cadastradas.
            </p>
          </div>

          <div className="rounded-full border border-[#dcebe0] bg-[#edf8f0] px-4 py-2 text-xs font-semibold text-[#168466]">
            {filteredJobs.length} exibidas de {jobs.length}
          </div>
        </div>

        {/* FILTROS */}
        <form
          method="GET"
          action="/vagas"
          className="mb-5 rounded-2xl border border-[#e2ebe4] bg-white p-5 shadow-[0_4px_20px_rgba(20,64,42,0.035)] md:p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#1c2924]">
                Filtrar oportunidades
              </h3>
              <p className="mt-1 text-xs text-[#8b9b90]">
                Pesquise entre as vagas que você salvou.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f6ef] text-[#168466]">
              <Icon name="filter" className="h-4 w-4" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="busca" className="field-label">
                Cargo ou palavra-chave
              </label>
              <input
                id="busca"
                name="busca"
                type="search"
                defaultValue={busca}
                className="field-input"
                placeholder="Ex.: Administrativo"
              />
            </div>

            <div>
              <label
                htmlFor="localizacao"
                className="field-label"
              >
                Localização
              </label>
              <input
                id="localizacao"
                name="localizacao"
                defaultValue={localizacao}
                className="field-input"
                placeholder="Ex.: Santos"
              />
            </div>

            <div>
              <label htmlFor="ordem" className="field-label">
                Ordenar por
              </label>
              <select
                id="ordem"
                name="ordem"
                defaultValue={ordem}
                className="field-input"
              >
                <option value="recentes">
                  Mais recentes primeiro
                </option>
                <option value="antigas">
                  Mais antigas primeiro
                </option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              <Icon name="search" className="h-4 w-4" />
              Aplicar filtros
            </button>

            <Link
              href="/vagas"
              className="inline-flex items-center justify-center rounded-xl border border-[#dce6de] px-5 py-3 text-sm font-medium text-[#40564a] transition hover:bg-[#f5faf6]"
            >
              Limpar filtros
            </Link>
          </div>
        </form>

        {/* RESULTADOS */}
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-[#e4ebe5] bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f6ef] text-[#168466]">
              <Icon
                name="search"
                className="h-7 w-7"
              />
            </div>

            <h3 className="text-base font-bold text-[#1c2924]">
              {hasFilters
                ? "Nenhuma vaga encontrada"
                : "Nenhuma vaga cadastrada"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#718178]">
              {hasFilters
                ? "Não encontramos vagas com esses filtros. Experimente alterar sua pesquisa."
                : "Encontre uma oportunidade em uma das plataformas acima e cadastre-a no JobTriva."}
            </p>

            {hasFilters && (
              <Link
                href="/vagas"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-[#dce6de] px-4 py-2 text-sm font-semibold text-[#168466] hover:bg-[#f5faf6]"
              >
                Limpar filtros
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white shadow-[0_4px_18px_rgba(20,64,42,0.035)] transition-all duration-200 hover:border-[#b9dcc7] hover:shadow-[0_10px_28px_rgba(20,90,58,0.07)]"
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#dcece3] bg-[#edf8f1] text-sm font-extrabold tracking-wide text-[#168466]">
                        {getCompanyInitials(job.company)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-[#243e30]">
                          {job.title}
                        </h3>

                        <p className="mt-1 text-sm text-[#718178]">
                          {job.company ||
                            "Empresa não informada"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#819087]">
                          <span className="inline-flex items-center gap-1.5">
                            <Icon
                              name="location"
                              className="h-3.5 w-3.5"
                            />
                            {job.location ||
                              "Localização não informada"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Icon
                              name="money"
                              className="h-3.5 w-3.5"
                            />
                            {job.salary ||
                              "Salário não informado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="rounded-full border border-[#dcece3] bg-[#f1f8f3] px-3 py-1.5 text-[11px] font-semibold text-[#168466]">
                      {job.source === "manual"
                        ? "Cadastro manual"
                        : "Vaga importada"}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl border border-[#edf1ed] bg-[#fafcf9] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#40564a]">
                      Descrição da oportunidade
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#718178]">
                      {job.description}
                    </p>
                  </div>

                  {job.requirements && (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-[#40564a]">
                        Requisitos
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#718178]">
                        {job.requirements}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1ed] bg-[#fcfdfc] px-5 py-4 md:px-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168466] hover:text-[#106c52]"
                      >
                        <Icon
                          name="external"
                          className="h-4 w-4"
                        />
                        Abrir vaga original
                      </a>
                    )}

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#8b9b90]">
                      <Icon
                        name="calendar"
                        className="h-3.5 w-3.5"
                      />
                      Cadastrada em{" "}
                      {job.foundAt.toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/vagas/${job.id}/analise`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#168466] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106c52]"
                    >
                      <Icon
                        name="sparkles"
                        className="h-4 w-4"
                      />
                      Analisar com IA
                    </Link>

                    <form action={deleteJob}>
                      <input
                        type="hidden"
                        name="id"
                        value={job.id}
                      />
                      <button
                        type="submit"
                        className="btn-ghost-danger"
                      >
                        <Icon
                          name="trash"
                          className="h-4 w-4"
                        />
                        Excluir vaga
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
