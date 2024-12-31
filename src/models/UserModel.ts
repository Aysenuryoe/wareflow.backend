import { model, Model, Query, Schema } from "mongoose";
import { logger } from "../../src/logger";
import bcrypt, { compare } from "bcryptjs";

export interface IUser {
  email: string;
  password: string;
  admin: boolean;
}

interface IUserMethods {
  isCorrectPassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

export const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  admin: { type: Boolean, default: false },
});

UserSchema.pre("save", async function () {
  this.email = this.email.toLowerCase();
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
});

UserSchema.pre<Query<any, IUser>>("updateOne", async function () {
  const update = this.getUpdate() as { password?: string } | null;
  if (update?.password) {
    const hashedPassword = await bcrypt.hash(update.password, 10);
    update.password = hashedPassword;
  }
});

UserSchema.pre<Query<any, IUser>>("updateMany", async function () {
  const update = this.getUpdate() as { password?: string } | null;
  if (update?.password) {
    const hashedPassword = await bcrypt.hash(update.password, 10);
    update.password = hashedPassword;
  }
});

UserSchema.method(
  "isCorrectPassword",
  async function (password: string): Promise<boolean> {
    const user = await User.findById(this._id);
    if (!user) {
      const errorMsg = "User not found..";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    if (this.isModified("password")) {
      const errorMsg = "Password not saved.";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    return compare(password, user.password);
  }
);

export const User = model<IUser, UserModel>("User", UserSchema);
