
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type IconName =
  | "dashboard"
  | "search"
  | "opportunities"
  | "resume"
  | "profile"
  | "settings";

type NavigationItem = {
  href: string;
  label: string;
  icon: IconName;
};

const ITEMS: NavigationItem[] = [
  { href: "/", label: "Início", icon: "dashboard" },
  { href: "/vagas", label: "Vagas", icon: "search" },
  {
    href: "/oportunidades",
    label: "Minhas oportunidades",
    icon: "opportunities",
  },
  { href: "/curriculos", label: "Currículos", icon: "resume" },
  { href: "/perfil", label: "Meu perfil", icon: "profile" },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: "settings",
  },
];

function BrandSymbol({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
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
  );
}

function NavIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    opportunities: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12c5 3 13 3 18 0" />
        <path d="M10 14h4" />
      </>
    ),
    resume: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h8" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06A1.7 1.7 0 0 0 16 18.4a1.7 1.7 0 0 0-1 1.56V21h-6v-1.04A1.7 1.7 0 0 0 8 18.4a1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H2v-4h1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.34-1.88L4.2 7.06l1.9-1.9.06.06A1.7 1.7 0 0 0 8 5.6 1.7 1.7 0 0 0 9 4.04V3h6v1.04a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.6 1h1v4h-1a1.7 1.7 0 0 0-1.6 1Z" />
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
      {paths[name]}
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {open ? (
        <path d="M5 5 19 19M19 5 5 19" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className="jobtriva-sidebar relative z-20 shrink-0 bg-[#0D3B2E] text-white md:w-64 lg:w-72">
      <div className="flex flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">

        {/* LOGOTIPO */}
        <div className="flex shrink-0 items-center justify-between px-5 py-4 md:px-6 md:pb-5 md:pt-6">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2"
            aria-label="JobTriva - Página inicial"
          >
            <BrandSymbol className="h-10 w-10 shrink-0" />

            <span className="text-[25px] font-extrabold tracking-[-0.065em] text-white">
              Job<span className="text-[#22D68F]">Triva</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="jobtriva-navigation"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-white md:hidden"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>

        {/* NAVEGAÇÃO */}
        <nav
          id="jobtriva-navigation"
          aria-label="Navegação principal"
          className={`px-3 pb-3 md:block md:px-4 ${
            mobileOpen ? "block" : "hidden"
          }`}
        >
          <p className="mb-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#91B9A9]">
            Menu principal
          </p>

          <div className="space-y-1">
            {ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`jobtriva-nav-link group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                    active
                      ? "jobtriva-nav-active bg-[#1C5A46] text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <NavIcon
                    name={item.icon}
                    className={`h-[19px] w-[19px] shrink-0 ${
                      active ? "text-[#22D68F]" : ""
                    }`}
                  />

                  <span className="min-w-0 flex-1">
                    {item.label}
                  </span>

                  {active && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22D68F]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* CARTÃO INFERIOR COMPACTO */}
        <div className="mt-auto hidden px-4 pb-4 pt-3 md:block">
          <div className="jobtriva-sidebar-card rounded-xl border border-white/10 bg-[#164C3B] p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#22D68F]/15 text-[#22D68F]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
                  <path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z" />
                </svg>
              </div>

              <h2 className="text-xs font-bold leading-snug text-white">
                Sua carreira em movimento
              </h2>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-white/65">
              Explore as ferramentas do JobTriva para encontrar
              novas oportunidades.
            </p>

            <Link
              href="/curriculos"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22D68F] px-3 py-2 text-xs font-bold text-[#07392A] transition hover:bg-[#5CE6AE]"
            >
              Meus currículos
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <p className="mt-3 text-center text-[10px] text-white/35">
            JobTriva • Sua carreira em movimento
          </p>
        </div>
      </div>
    </aside>
  );
}
