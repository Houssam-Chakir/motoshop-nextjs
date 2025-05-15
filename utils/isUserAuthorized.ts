import User from "@/models/User";
import { getSessionUser } from "./getSessionUser";

export const checkUserRole = async (userId: string, requiredRole: string) => {
  const user = await User.findById(userId);
  console.log("user role: ", user.role);
  if (!user || user.role !== requiredRole) {
    return false;
  }
  return true;
};

const isUserAuthorized = async (requiredRole: string) => {
  const sessionUser = await getSessionUser();
  const { userId } = sessionUser;
  const isAuthorized = await checkUserRole(userId, requiredRole);
  if (!isAuthorized) throw new Error(`Unauthorized: ${requiredRole} privileges required`);
};

export default isUserAuthorized;
