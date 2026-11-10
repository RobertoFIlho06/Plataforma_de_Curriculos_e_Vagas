"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AccountMenu from "@/components/AccountMenu";

type Props = {
  children: React.ReactNode;
  account: {
    name?: string | null;
    email?: string | null;
    avatarId?: string | null;
    avatarUrl?: string | null;
  };
};

export default function AppShell({ children, account }: Props) {
  const path = usePathname();
  const authPage = path === "/login" || path === "/cadastro";
  const landingPage = path === "/bem-vindo";
  const publicPage = authPage || landingPage;

  if (landingPage) return <main className="min-h-screen">{children}</main>;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {!publicPage && <Sidebar />}
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 md:py-9 lg:px-10">
          {!publicPage && (
            <AccountMenu
              name={account.name}
              email={account.email}
              avatarId={account.avatarId}
              avatarUrl={account.avatarUrl}
            />
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
