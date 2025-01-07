import { UserResource, UsersResource } from "../../src/Resources";
import { User } from "../../src/models/UserModel";

export async function getAllUsers(): Promise<UsersResource> {
  let users = await User.find().exec();
  let usersResource: UserResource[] = new Array();

  if (users.length === 0) {
    throw new Error("User not found.");
  } else {
    for (let user of users) {
      let userResource = {
        id: user.id,
        email: user.email,
        admin: user.admin,
      };
      usersResource.push(userResource);
    }
    return { users: usersResource };
  }
}
export async function getUser(id: string): Promise<UserResource> {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found.");
  }

  const userResource: UserResource = {
    id: user.id,
    email: user.email,
    admin: user.admin,
  };

  return userResource;
}

export async function createUser(
  userResource: UserResource
): Promise<UserResource> {
  const existingUser = await User.findOne({
    email: userResource.email.toLowerCase(),
  });
  if (existingUser) {
    throw new Error("User not found.");
  }
  let user = await User.create({
    email: userResource.email,
    password: userResource.password,
    admin: userResource.admin,
  });

  return {
    id: user.id,
    email: user.email,
    admin: user.admin,
  };
}

export async function updateUser(
  userResource: UserResource
): Promise<UserResource> {
  const updateObject: {
    email?: string;
    password?: string;
    admin?: boolean;
  } = {};

  if (userResource.email) {
    updateObject.email = userResource.email;
  }
  if (userResource.password) {
    updateObject.password = userResource.password;
  }
  if (userResource.admin !== undefined) {
    updateObject.admin = userResource.admin;
  }

  await User.updateOne({ _id: userResource.id }, updateObject);
  let user = await User.findById(userResource.id).exec();

  if (!user) {
    throw new Error("User not found.");
  } else {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      admin: user.admin,
    };
  }
}

export async function deleteUser(id: string): Promise<void> {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found.");
  }

  await User.deleteOne({ _id: id });
}
