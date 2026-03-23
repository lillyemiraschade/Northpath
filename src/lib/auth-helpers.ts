import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  return session;
}
