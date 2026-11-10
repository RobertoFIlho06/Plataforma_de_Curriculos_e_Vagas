
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AppShell from "@/components/AppShell";

import "./globals.css";
import "./avatar.css";

export const metadata: Metadata = {
  title: {
    default: "JobTriva",
    template: "%s | JobTriva",
  },
  description:
    "Gerencie vagas, currículos e candidaturas com inteligência artificial.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const uid = (
    session?.user as { id?: string } | undefined
  )?.id;

  const profile = uid
    ? await db.user.findUnique({
        where: { id: uid },
        select: {
          avatarId: true,
          avatarUrl: true,
        },
      })
    : null;

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#f8faf8] text-[#1c2924] antialiased">
        <AppShell
          account={{
            name: session?.user?.name,
            email: session?.user?.email,
            avatarId: profile?.avatarId,
            avatarUrl: profile?.avatarUrl,
          }}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
