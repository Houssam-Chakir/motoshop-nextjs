import User from "@/models/User";
import { getSessionUser, SessionUser } from "./getSessionUser";

export const checkUserRole = async (userId: string, requiredRole: string): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user || user.role !== requiredRole) {
    return false;
  }
  return true;
};

export const isUserAuthorized = async (requiredRole: string): Promise<SessionUser> => {
  const sessionUser = await getSessionUser();
  const isAuthorized = await checkUserRole(sessionUser.userId, requiredRole);

  if (!isAuthorized) {
    throw new Error(`Unauthorized: ${requiredRole} privileges required`);
  }

  return sessionUser;
};
