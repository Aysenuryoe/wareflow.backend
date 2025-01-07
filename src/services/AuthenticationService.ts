import { User } from "../models/UserModel";

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; id?: string }> {
  const emailToLowerCase = email.toLowerCase();
  const user = await User.findOne({ email: emailToLowerCase });
  if (!user) {
    return { success: false };
  }
  const matchingPassword = await user.isCorrectPassword(password);
  if (!matchingPassword) {
    return { success: false };
  } else {
    return { success: true, id: user.id };
  }
}
