import { getServerSession } from "next-auth/next";
import authOptions from "./authOptions";
import { Session } from "next-auth";

export interface SessionUser {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  userId: string;
}

export const getSessionUser = async (): Promise<SessionUser> => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Error getting user session");
  }

  return {
    user: session.user,
    userId: session.user.id,
  };
};

export const getSession = async (): Promise<Session | null> => {
  return await getServerSession(authOptions);
};
