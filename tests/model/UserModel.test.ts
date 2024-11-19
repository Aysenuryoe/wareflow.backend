import { User } from "../../src/models/UserModel";
import DB from "tests/DB";
import bcrypt from "bcryptjs";

beforeAll(async () => await DB.connect());
beforeEach(async () => await User.syncIndexes());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successfully save user", async () => {
  const user = new User({
    email: "aysenurylr@gmail.com",
    password: "v8j9renjc!v",
    admin: true,
  });
  const results = await user.save();
  expect(results).toBeDefined();
  expect(results.email).toBe("aysenurylr@gmail.com");
  expect(await bcrypt.compare("v8j9renjc!v", results.password)).toBe(true);
  expect(results.admin).toBeTruthy();
});

test("should not save without a required field", async () => {
  const user = new User({
    email: "aysenurylr@gmail.com",
    admin: true,
  });
  
  await expect(user.save()).rejects.toThrowError();
});

test("should save without admin", async () => {
  const user = new User({
    email: "aysenurylr@gmail.com",
    password: "jn89rbq4h3",
  });

  const result = await user.save();
  expect(result.admin).toBe(false);
});

test("should not save duplicate email", async () => {
  const user1 = new User({
    email: "hellouser@gmail.com",
    password: "nvmiorew2,3",
    admin: true,
  });

  const user2 = new User({
    email: "hellouser@gmail.com",
    password: "nvmiorew2,3",
    admin: false,
  });

  await user1.save();
  await expect(user2.save()).rejects.toThrowError();
});

test("password needs to be hashed before saving", async () => {
  const user = new User({
    email: "hellouser@gmail.com",
    password: "hellopassword",
    admin: true,
  });

  const res = await user.save();
  const matching = await bcrypt.compare("hellopassword", res.password);
  expect(matching).toBe(true);
});

test("should hash the password when updating (pre-updateOne hook)", async () => {
  const user = new User({
    email: "updateuser@example.com",
    password: "oldpassword123",
    admin: false,
  });
  await user.save();
  await User.updateOne(
    { email: "updateuser@example.com" },
    { password: "newpassword456" }
  );

  const updatedUser = await User.findOne({ email: "updateuser@example.com" });

  const isMatch = await bcrypt.compare("newpassword456", updatedUser!.password);
  expect(isMatch).toBe(true);
});

test("should hash the password when updating multiple users (pre-updateMany hook)", async () => {
  const user1 = new User({
    email: "user1@example.com",
    password: "password123",
    admin: false,
  });
  const user2 = new User({
    email: "user2@example.com",
    password: "password123",
    admin: false,
  });
  await user1.save();
  await user2.save();

  await User.updateMany(
    { email: { $in: ["user1@example.com", "user2@example.com"] } },
    { password: "newpassword456" }
  );

  const updatedUser1 = await User.findOne({ email: "user1@example.com" });
  const updatedUser2 = await User.findOne({ email: "user2@example.com" });

  const isMatch1 = await bcrypt.compare(
    "newpassword456",
    updatedUser1!.password
  );
  const isMatch2 = await bcrypt.compare(
    "newpassword456",
    updatedUser2!.password
  );

  expect(isMatch1).toBe(true);
  expect(isMatch2).toBe(true);
  expect(updatedUser1!.password).not.toBe("newpassword456");
  expect(updatedUser2!.password).not.toBe("newpassword456");
});

test("should return true for correct password using isCorrectPassword", async () => {
  const user = new User({
    email: "checkpassword@example.com",
    password: "password123",
    admin: false,
  });
  await user.save();
  const isCorrect = await user.isCorrectPassword("password123");
  expect(isCorrect).toBe(true);
});

test("should return incorrect password using isCorrectPassword", async () => {
  const user = new User({
    email: "checkpassword@example.com",
    password: "password123",
    admin: false,
  });
  await user.save();
  const isCorrect = await user.isCorrectPassword("wrongpassword");
  expect(isCorrect).toBe(false);
});

test("when user is not found", async () => {
  const user = new User({
    email: "userNotExisting@example.com",
    password: "password123",
    admin: false,
  });
  const res = await user.save();
  await User.deleteOne({ _id: res._id });
  expect(res.isCorrectPassword("password123")).rejects.toThrowError();
});

test("throw error when pasword is modified but not saved", async () => {
  const user = new User({
    email: "modifiedpass@gmail.com",
    password: "oldPass123",
  });
  await user.save();
  user.password = "newPass123";
  await expect(user.isCorrectPassword("newPass123")).rejects.toThrowError();
});
