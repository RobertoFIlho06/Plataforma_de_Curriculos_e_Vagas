
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAccount } from "@/lib/access";
import {
  COMPATIBLE_MIN_SCORE,
  SUBMITTED_STATUSES,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

type IconName =
  | "briefcase"
  | "target"
  | "document"
  | "send"
  | "calendar"
  | "arrow"
  | "sparkles"
  | "trending"
  | "check"
  | "location"
  | "clock";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const icons: Record<IconName, React.ReactNode> = {
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12c5 3 13 3 18 0" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h8" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    sparkles: (
      <>
        <path d="m12 3 2 6 6 2-6 2-2 6-6-2 6-2 2-6Z" />
        <path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z" />
      </>
    ),
    trending: (
      <>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
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

function getCompanyInitials(company: string | null) {
  const name = company?.trim();

  if (!name) {
    return "EM";
  }

  const words = name.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toLocaleUpperCase("pt-BR");
  }

  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toLocaleUpperCase(
    "pt-BR"
  );
}

export default async function DashboardPage() {
  const owner = await requireAccount();
  const [
    totalJobs,
    compatibleJobs,
    customResumes,
    submitted,
    interviews,
    recentJobs,
  ] = await Promise.all([
    db.job.count({ where: { userId: owner.id } }),

    db.job.count({
      where: {
        userId: owner.id,
        analyses: {
          some: {
            userId: owner.id,
            score: {
              gte: COMPATIBLE_MIN_SCORE,
            },
          },
        },
      },
    }),

    db.resumeVersion.count({ where: { resume: { userId: owner.id } } }),

    db.application.count({
      where: {
        userId: owner.id,
        status: {
          in: SUBMITTED_STATUSES,
        },
      },
    }),

    db.application.count({
      where: {
        userId: owner.id,
        status: "INTERVIEW",
      },
    }),

    db.job.findMany({
      where: { userId: owner.id },
      orderBy: {
        foundAt: "desc",
      },
      take: 5,
    }),
  ]);

  const cards: {
    label: string;
    value: number;
    icon: IconName;
    description: string;
    href: string;
  }[] = [
    {
      label: "Vagas encontradas",
      value: totalJobs,
      icon: "briefcase",
      description: "Total de vagas cadastradas",
      href: "/vagas",
    },
    {
      label: "Vagas compatíveis",
      value: compatibleJobs,
      icon: "target",
      description: `A partir de ${COMPATIBLE_MIN_SCORE}% de compatibilidade`,
      href: "/vagas",
    },
    {
      label: "Currículos personalizados",
      value: customResumes,
      icon: "document",
      description: "Versões criadas para vagas",
      href: "/curriculos",
    },
    {
      label: "Candidaturas realizadas",
      value: submitted,
      icon: "send",
      description: "Candidaturas acompanhadas",
      href: "/oportunidades",
    },
    {
      label: "Entrevistas",
      value: interviews,
      icon: "calendar",
      description: "Oportunidades em entrevista",
      href: "/oportunidades",
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* BANNER JOBTRIVA MODERN — PRESERVADO */}
      <section className="relative isolate overflow-hidden rounded-[26px] border border-[#dcebe3] bg-gradient-to-br from-[#f3faf6] via-[#eaf7f0] to-[#d7f3e4] shadow-[0_8px_30px_rgba(13,59,46,0.06)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-36 h-[430px] w-[430px] rounded-full bg-[#22d68f]/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-12 h-[350px] w-[350px] rounded-full bg-[#178565]/10 blur-3xl"
        />

        <div className="relative grid items-center gap-8 px-6 py-9 sm:px-9 sm:py-11 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:gap-4 lg:px-11">
          <div className="relative z-10 min-w-0">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bcebd4] bg-white/80 px-3.5 py-2 text-xs font-bold text-[#08734f] shadow-sm">
              <Icon name="sparkles" className="h-4 w-4" />
              Inteligência Artificial para sua carreira
            </span>

            <h2 className="max-w-[630px] text-[29px] font-extrabold leading-[1.2] tracking-tight text-[#102f26] sm:text-[35px] lg:text-[38px]">
              Encontre vagas, personalize seu currículo e
              conquiste sua{" "}
              <span className="text-[#078758]">
                próxima oportunidade.
              </span>
            </h2>

            <p className="mt-5 max-w-[550px] text-sm leading-7 text-[#52695e] sm:text-[15px]">
              Organize suas oportunidades, acompanhe
              candidaturas e utilize os recursos de
              inteligência artificial do JobTriva para
              impulsionar sua carreira.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/vagas"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087b55] px-5 py-3 text-sm font-bold text-white shadow-[0_5px_14px_rgba(8,123,85,0.18)] transition hover:bg-[#056746]"
              >
                <Icon name="briefcase" className="h-4 w-4" />
                Explorar vagas
                <Icon name="arrow" className="h-4 w-4" />
              </Link>

              <Link
                href="/curriculos"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#b8d9c8] bg-white px-5 py-3 text-sm font-bold text-[#145a42] shadow-sm transition hover:bg-[#f6fbf8]"
              >
                <Icon name="document" className="h-4 w-4" />
                Meus currículos
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex w-full max-w-[360px] items-center justify-center py-4"
          >
            <div className="absolute h-[260px] w-[260px] rounded-full bg-[#20bf83]/15" />

            <div className="relative w-full max-w-[310px] rotate-[-3deg] rounded-[22px] border border-[#c5e6d4] bg-white/90 p-4 shadow-[0_18px_45px_rgba(9,82,57,0.12)] backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d3b2e] text-[#22d68f]">
                    <Icon name="sparkles" className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-[#153e2e]">
                      JobTriva
                    </p>
                    <p className="text-[10px] text-[#789082]">
                      Assistente de carreira
                    </p>
                  </div>
                </div>

                <span className="h-2.5 w-2.5 rounded-full bg-[#22d68f]" />
              </div>

              <div className="rounded-xl border border-[#e1efe6] bg-[#f7fbf8] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#355747]">
                    Sua evolução profissional
                  </span>
                  <Icon
                    name="target"
                    className="h-4 w-4 text-[#168466]"
                  />
                </div>

                <div className="flex items-end gap-2">
                  {[35, 52, 44, 72, 88].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-[#087b55] to-[#22d68f]"
                        style={{ height: `${height}px` }}
                      />
                    )
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-[#168466]">
                  <Icon name="arrow" className="h-3 w-3" />
                  Sua carreira em movimento
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e1efe6] bg-white p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5f6ed] text-[#168466]">
                  <Icon name="document" className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#264d3a]">
                    Currículo profissional
                  </p>
                  <p className="text-[10px] text-[#789082]">
                    Personalização com IA
                  </p>
                </div>

                <span className="ml-auto text-[#168466]">
                  ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CABEÇALHO DO PAINEL */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#168466]">
            Visão geral
          </p>

          <h1 className="text-[28px] font-bold tracking-tight text-[#1c2924] md:text-[34px]">
            Seu painel de carreira
          </h1>

          <p className="mt-1.5 text-sm text-[#718178]">
            Acompanhe suas oportunidades, currículos e candidaturas.
          </p>
        </div>

        <Link
          href="/vagas"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#168466] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#106c52]"
        >
          <Icon name="briefcase" className="h-4 w-4" />
          Explorar vagas
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </section>

      {/* INDICADORES MODERNIZADOS */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#1c2924]">
              Resumo da sua jornada
            </h2>
            <p className="mt-1 text-xs text-[#87978d]">
              Seus números em um só lugar
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#dcece2] bg-white px-3 py-1.5 text-[11px] font-medium text-[#648374]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22b981]" />
            Dados atualizados
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group relative flex min-h-[166px] flex-col overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white p-4 shadow-[0_4px_18px_rgba(20,64,42,0.035)] transition-all duration-200 hover:-translate-y-1 hover:border-[#b9dfca] hover:shadow-[0_12px_30px_rgba(20,90,58,0.09)]"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#168466] to-[#22d68f] opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f6ef] text-[#168466] transition-colors group-hover:bg-[#d9f3e4]">
                  <Icon name={card.icon} className="h-5 w-5" />
                </div>

                <Icon
                  name="arrow"
                  className="h-4 w-4 text-[#b1c5b8] transition-colors group-hover:text-[#168466]"
                />
              </div>

              <p className="text-[30px] font-extrabold leading-none tracking-tight text-[#173c2d]">
                {card.value}
              </p>

              <p className="mt-2 text-[12px] font-bold leading-snug text-[#304d3e]">
                {card.label}
              </p>

              <p className="mt-1 text-[10px] leading-relaxed text-[#8a9c90]">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* OPORTUNIDADES E ASSISTENTE */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* OPORTUNIDADES RECENTES */}
        <section className="overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.035)] xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-[#1c2924] sm:text-lg">
                Oportunidades recentes
              </h2>

              <p className="mt-1.5 text-xs text-[#8b9b90]">
                Últimas vagas cadastradas no sistema
              </p>
            </div>

            <Link
              href="/vagas"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf8f1] px-3 py-2 text-xs font-bold text-[#168466] transition hover:bg-[#def1e5]"
            >
              Ver todas
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f6ef] text-[#168466]">
                <Icon name="briefcase" className="h-7 w-7" />
              </div>

              <h3 className="text-base font-bold text-[#1c2924]">
                Nenhuma vaga cadastrada ainda
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#718178]">
                Comece preenchendo seu perfil e enviando seu currículo
                para organizar sua busca por oportunidades.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/perfil"
                  className="rounded-xl border border-[#dce6de] px-4 py-2 text-sm font-medium text-[#40564a] transition hover:bg-[#f5faf6]"
                >
                  Meu perfil
                </Link>

                <Link
                  href="/curriculos"
                  className="rounded-xl bg-[#168466] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#106c52]"
                >
                  Enviar currículo
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#edf1ed]">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-[#f9fcfa] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dcece3] bg-[#edf8f1] text-sm font-extrabold tracking-wide text-[#168466]">
                      {getCompanyInitials(job.company)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#243e30]">
                        {job.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#819087]">
                        {job.company || "Empresa não informada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-14 sm:pl-0">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#eff7f1] px-3 py-1.5 text-[11px] font-medium text-[#557563]">
                      <Icon name="clock" className="h-3.5 w-3.5" />
                      {job.foundAt.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recentJobs.length > 0 && (
            <div className="border-t border-[#edf1ed] bg-[#fbfdfb] px-6 py-3">
              <Link
                href="/vagas"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#168466] hover:text-[#106c52]"
              >
                Explorar todas as oportunidades
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* ASSISTENTE DE CARREIRA */}
        <section className="overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.035)]">
          <div className="border-b border-[#edf1ed] bg-gradient-to-br from-[#f0faf4] to-white px-5 py-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#168466] text-white shadow-[0_5px_12px_rgba(22,132,102,0.16)]">
              <Icon name="sparkles" className="h-5 w-5" />
            </div>

            <h2 className="text-lg font-bold text-[#1c2924]">
              Seu assistente de carreira
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-[#718178]">
              Utilize as ferramentas do JobTriva para analisar
              vagas, personalizar currículos e acompanhar
              suas candidaturas.
            </p>
          </div>

          <div className="space-y-2.5 p-4">
            {[
              {
                href: "/vagas",
                label: "Analisar vagas",
                description: "Explore suas oportunidades",
                icon: "target" as IconName,
              },
              {
                href: "/curriculos",
                label: "Personalizar currículo",
                description: "Prepare suas versões",
                icon: "document" as IconName,
              },
              {
                href: "/oportunidades",
                label: "Minhas candidaturas",
                description: "Acompanhe sua jornada",
                icon: "send" as IconName,
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-xl border border-[#e4ebe5] p-3 transition hover:border-[#b9dcc7] hover:bg-[#f5faf6]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e9f6ef] text-[#168466]">
                  <Icon name={action.icon} className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#304d3e]">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8b9b90]">
                    {action.description}
                  </p>
                </div>

                <Icon
                  name="arrow"
                  className="h-4 w-4 text-[#9bb1a3] transition group-hover:text-[#168466]"
                />
              </Link>
            ))}
          </div>

          <div className="mx-4 mb-4 rounded-xl border border-[#dcefe3] bg-[#f2f9f4] p-3">
            <div className="flex items-center gap-2">
              <Icon
                name="sparkles"
                className="h-4 w-4 text-[#168466]"
              />
              <p className="text-xs font-bold text-[#168466]">
                JobTriva + Inteligência Artificial
              </p>
            </div>

            <p className="mt-1.5 text-[11px] leading-relaxed text-[#718178]">
              Aproveite os recursos de IA disponíveis para
              apoiar sua busca por oportunidades.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
