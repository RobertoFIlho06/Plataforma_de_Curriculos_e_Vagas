import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Google será habilitado após a implementação do isolamento multiusuário.
const googleEnabled = false;
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: { email: { label: "E-mail", type: "email" }, password: { label: "Senha", type: "password" } },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { authEmail: email } });
        if (!user?.passwordHash || !(await bcrypt.compare(credentials.password, user.passwordHash))) return null;
        return { id: user.id, email: user.authEmail, name: user.fullName || null };
      },
    }),
    ...(googleEnabled ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      const googleId = account.providerAccountId;
      const existing = await db.authAccount.findUnique({ where: { provider_providerAccountId: { provider: "google", providerAccountId: googleId } } });
      if (existing) { user.id = existing.userId; return true; }
      // Não vinculamos automaticamente uma conta Google a uma senha existente.
      const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified === true;
      const email = user.email?.toLowerCase();
      if (!verified || !email) return false;
      const collision = await db.user.findUnique({ where: { authEmail: email } });
      if (collision) return false;
      try {
        const created = await db.user.create({ data: { authEmail: email, email, fullName: user.name || "", authAccounts: { create: { provider: "google", providerAccountId: googleId } } } });
        user.id = created.id;
        return true;
      } catch { return false; }
    },
    async jwt({ token, user, account }) {
      if (user) token.uid = user.id;
      if (account?.provider === "google") {
        const linked = await db.authAccount.findUnique({ where: { provider_providerAccountId: { provider: "google", providerAccountId: account.providerAccountId } } });
        if (linked) token.uid = linked.userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as typeof session.user & { id: string }).id = String(token.uid || token.sub || "");
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
