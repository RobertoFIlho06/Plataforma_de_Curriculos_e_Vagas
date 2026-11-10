
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Bem-vindo ao JobTriva",
  description:
    "Organize vagas, personalize currículos e acompanhe sua carreira com IA.",
};

const features = [
  {
    icon: "✦",
    title: "Currículos inteligentes",
    detail:
      "Personalize seus documentos com apoio da inteligência artificial.",
  },
  {
    icon: "▣",
    title: "Vagas organizadas",
    detail:
      "Reúna oportunidades e mantenha tudo em um só lugar.",
  },
  {
    icon: "↗",
    title: "Candidaturas em dia",
    detail:
      "Acompanhe as etapas e a evolução das suas candidaturas.",
  },
  {
    icon: "◈",
    title: "Análises com IA",
    detail:
      "Entenda como seu perfil se relaciona com cada vaga.",
  },
];

function JobTrivaLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0D3B2E] p-1.5">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M10 37L33 21C36 19 40 20 42 23L48 30C50 33 49 37 46 39L12 58V43C12 40 12 39 10 37Z"
            fill="#22D68F"
          />
          <path
            d="M16 6C18 4 21 4 24 6L52 25C58 29 58 35 52 39L40 47V33L16 17C12 14 12 9 16 6Z"
            fill="#FFFFFF"
          />
          <path
            d="M40 33L52 25C58 29 58 35 52 39L40 47V33Z"
            fill="#D8EAE1"
          />
        </svg>
      </span>

      <span className="text-[25px] font-extrabold tracking-[-0.065em] text-[#0D3B2E]">
        Job<span className="text-[#168466]">Triva</span>
      </span>
    </span>
  );
}

export default async function WelcomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7fbf8] text-[#173c2d]">
      <div className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-[#d7f5e3] blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-[440px] h-96 w-96 rounded-full bg-[#e8f8ef] blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-6 sm:px-8">
        <Link
          href="/bem-vindo"
          className="flex items-center"
          aria-label="JobTriva - Página inicial"
        >
          <JobTrivaLogo />
        </Link>

        <nav
          className="flex items-center gap-2 sm:gap-4"
          aria-label="Acesso à conta"
        >
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#17694e] hover:bg-[#e7f5eb]"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="rounded-xl bg-[#168466] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#106c52]"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-24">
          <div>
            <span className="inline-flex rounded-full border border-[#c4ead3] bg-[#e7f7ec] px-4 py-2 text-xs font-bold tracking-wide text-[#13744f]">
              ✦ SUA CARREIRA COM INTELIGÊNCIA ARTIFICIAL
            </span>

            <h1 className="mt-7 max-w-xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Sua próxima{" "}
              <span className="text-[#168466]">
                oportunidade
              </span>{" "}
              começa aqui.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#5a7065] sm:text-lg">
              Organize suas vagas, personalize seu currículo
              com IA e acompanhe suas candidaturas em um só
              lugar. Mais clareza para dar o próximo passo
              na carreira.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/cadastro"
                className="rounded-xl bg-[#168466] px-7 py-4 text-center font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#106c52]"
              >
                Começar agora →
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-[#d2e6d8] bg-white px-7 py-4 text-center font-bold text-[#17694e] transition hover:bg-[#edf7f0]"
              >
                Já tenho uma conta
              </Link>
            </div>

            <p className="mt-5 text-xs leading-5 text-[#70867b]">
              Cadastro de novas contas temporariamente limitado
              enquanto concluímos a validação de segurança.
            </p>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#3f6754]">
              <span>✓ Currículos com IA</span>
              <span>✓ Vagas organizadas</span>
              <span>✓ Progresso em um só lugar</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-[#e2f7e9] to-[#f4fbf6] blur-xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7ecde] bg-gradient-to-br from-[#effbf2] via-[#dff5e7] to-[#c8e9d5] p-6 shadow-xl shadow-[#185f3d]/10 sm:p-9">
              <div className="mb-7 flex items-center justify-between">
                <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-[#187a55] shadow-sm">
                  Seu espaço de carreira
                </span>

                <span className="rounded-full bg-white/80 px-3 py-2 text-[#168466]">
                  ✦ IA
                </span>
              </div>

              <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-lg shadow-[#2b6b4a]/10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e2f7e9] text-2xl">
                    ▣
                  </div>

                  <div>
                    <div className="text-sm font-bold">
                      Minha jornada profissional
                    </div>
                    <div className="mt-1 text-xs text-[#7b9183]">
                      Tudo organizado para você
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#f2faf5] p-4">
                    <div className="text-2xl font-black text-[#17825c]">
                      01
                    </div>
                    <div className="mt-1 text-xs text-[#607b6c]">
                      Currículos
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#f2faf5] p-4">
                    <div className="text-2xl font-black text-[#17825c]">
                      02
                    </div>
                    <div className="mt-1 text-xs text-[#607b6c]">
                      Oportunidades
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[#e6f1e9] p-4">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="font-bold">
                      Seu progresso
                    </span>
                    <span className="text-[#168466]">
                      Organização inteligente
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#e3f2e8]">
                    <div className="h-full w-2/3 rounded-full bg-[#21a879]" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d5f5e1] text-xl text-[#168466]">
                  ✧
                </span>

                <div>
                  <p className="text-sm font-bold">
                    Inteligência a seu favor
                  </p>
                  <p className="text-xs text-[#6c8576]">
                    Planeje seus próximos passos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e3efe7] bg-white/85 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#168466]">
                Tudo em um só lugar
              </p>

              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                O que você encontra no JobTriva
              </h2>

              <p className="mt-4 text-[#667e70]">
                Ferramentas para organizar sua busca por
                oportunidades e tomar decisões com mais
                confiança.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-[#e4efe8] bg-[#f8fcf9] p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dff4e7] text-2xl font-bold text-[#15845e]">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 text-base font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#6b8074]">
                    {feature.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e2eee6] bg-white px-5 py-7 text-center text-xs text-[#70857a]">
        © JobTriva · Sua carreira com mais organização e
        inteligência.
      </footer>
    </div>
  );
}
