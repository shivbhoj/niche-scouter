import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authLimiter, clientKey } from "@/lib/rate-limit";
import { validateCredentials } from "@/lib/credentials";

/**
 * "Run your first report free." One credit, not two — the free report
 * exists to remove the last objection, not to satisfy the need. Must
 * stay in step with the default on User.credits.
 */
export const FREE_SIGNUP_CREDITS = 1;

// Single form handles both signup and sign-in, mirroring the design's
// one-step "create account & unlock" modal: unknown emails are provisioned
// on the spot (with the free-report credit), known emails must match
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
      async authorize(raw, request) {
        const parsed = validateCredentials(raw?.email, raw?.password);
        if (!parsed) return null;
        const { email, password } = parsed;

        // Throttle by source address so a stolen email list can't be
        // walked against this endpoint at speed.
        const limit = authLimiter.check(`auth:${clientKey(request)}`);
        if (!limit.ok) return null;

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
            credits: FREE_SIGNUP_CREDITS,
            creditTxns: {
              create: { delta: FREE_SIGNUP_CREDITS, reason: "signup_bonus" },
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
