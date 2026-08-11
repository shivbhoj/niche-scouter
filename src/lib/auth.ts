import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Single form handles both signup and sign-in, mirroring the design's
// one-step "create account & unlock" modal: unknown emails are provisioned
// on the spot (with the 2 free-report bonus), known emails must match
// their password.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(raw) {
        const email = String(raw?.email ?? "").trim().toLowerCase();
        const password = String(raw?.password ?? "");
        if (!email || !password || password.length < 6) return null;

        const existing = await db.user.findUnique({ where: { email } });

        if (existing) {
          const ok = await bcrypt.compare(password, existing.passwordHash);
          if (!ok) return null;
          return { id: existing.id, email: existing.email };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const created = await db.user.create({
          data: {
            email,
            passwordHash,
            credits: 2,
            creditTxns: {
              create: { delta: 2, reason: "signup_bonus" },
            },
          },
        });
        return { id: created.id, email: created.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
