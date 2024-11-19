import DB from "tests/DB";
import { User } from "../../src/models/UserModel";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../../src/services/UserService";
import bcrypt from "bcryptjs";
import { UserResource } from "src/Resources";
import mongoose, { Types } from "mongoose";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("get user", async () => {
  const newUser = await User.create({
    email: "helloworld@web.com",
    password: "helloweb456",
    admin: true,
  });
  const userById = await getUser(newUser.id.toString());
  expect(userById).toBeDefined();
  expect(userById.email).toBe("helloworld@web.com");
  expect(userById.admin).toBe(true);
});

test("getUser negativ", async () => {
  const nonExistentUserId = "615c1f7701f28e5f447aad35";
  await expect(getUser(nonExistentUserId)).rejects.toThrow("User not found.");
});

test("successfully creating user", async () => {
  const userResource = {
    email: "helloworld@web.de",
    password: "helloworld",
    admin: true,
  };
  const res = await createUser(userResource);
  expect(res.email).toBe(userResource.email);
  expect(res.admin).toBe(userResource.admin);
});

test("should throw an error if a user with that email already exists", async () => {
  const userResource = {
    email: "helloworld@web.com",
    password: "helloweb456",
    admin: true,
  };
  await createUser(userResource);
  await expect(createUser(userResource)).rejects.toThrow(
    "A user with that E-Mail already exists."
  );
});



test("update throws error", async () => {
  const nonExistingId = new mongoose.Types.ObjectId().toString();
  const userNotExisting = {
    id: nonExistingId,
    email: "hello@web.de",
    password: "helloweb",
    admin: false,
  };
  await expect(updateUser(userNotExisting)).rejects.toThrowError();
});

test("updateUser - successfully updates and returns updated user data", async () => {
  const user = await createUser({ email: "user@example.com", password: "UserPass123!", admin: false });

  const updatedUserResource = {
    id: user.id,
    email: "updateduser@example.com",
    password: "NewUserPass123!",
    admin: true,
  };

  const updatedUser = await updateUser(updatedUserResource);

  expect(updatedUser).toHaveProperty("id", user.id);
  expect(updatedUser).toHaveProperty("email", "updateduser@example.com");
  expect(updatedUser).toHaveProperty("password"); // Password should be hashed, so we don't check the exact value
  expect(updatedUser).toHaveProperty("admin", true);
});



test("getAllUsers - throws error if no users found", async () => {
  await expect(getAllUsers()).rejects.toThrow("User not found.");

});



test("return all users", async () => {
  const usersResource: UserResource[] = [
    { email: "example1@web.com", password: "password123", admin: false },
    { email: "example2@web.com", password: "password456", admin: false },
    { email: "example3@web.com", password: "password789", admin: false },
  ];

  for (let userResource of usersResource) {
    const user = await createUser({
      email: userResource.email,
      password: userResource.password,
      admin: userResource.admin,
    });
  }
  const res = await getAllUsers();
  expect(res.users.length).toBe(3);
});

test("throw error when getAllUsers", async () => {
  await expect(getAllUsers()).rejects.toThrow("User not found.");
});

test("negative update", async () => {
  const nonExistingUser = {
    email: "blabla@gmail.de",
    password: "blablabla",
    admin: false,
  };
  await expect(updateUser(nonExistingUser)).rejects.toThrowError();
});

test("user not found", async () => {
  await expect(getAllUsers()).rejects.toThrowError("User not found.");
});

test("delete user error", async () => {
  const userResource = {
    email: "hellworld@gmx.de",
    password: "hellogmx",
    admin: false,
  };
  const newUser = await createUser(userResource);
  await deleteUser(newUser.id!);
  await expect(deleteUser(newUser.id!)).rejects.toThrowError();
});
