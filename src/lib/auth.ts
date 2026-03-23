import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id;
      return session;
    },
  },
};
