import { cookies } from "next/headers";
import { getSession, getUserById, type User } from "./db";

const SESSION_COOKIE = "kotha_session";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = getSession(token);
  if (!session) return null;
  return getUserById(session.userId);
}
