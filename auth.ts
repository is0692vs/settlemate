// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: true, // Enable debug in production to see error details
  events: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] Sign in event:", { user, account, profile });
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      console.log("[NextAuth] JWT callback:", {
        trigger,
        hasUser: !!user,
        tokenId: token.id,
      });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback:", {
        tokenId: token.id,
        sessionUser: session.user?.email,
      });
      if (session.user && token.id) {
        (session.user as typeof session.user & { id?: string }).id =
          token.id as string;
      }
      return session;
    },
  },
});
