import DB from "tests/DB";
import { User } from "../../src/models/UserModel";
import { createUser } from "../../src/services/UserService";
import { login } from "../../src/services/AuthenticationService";

beforeAll(async () => await DB.connect());
beforeEach(async () => await User.syncIndexes());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("login", async () => {
  const userResource = {
    email: "aysenurylr@gmail.com",
    password: "aysenurylr123",
    admin: true,
  };
  await createUser(userResource);
  const wrongEmail = login("ayseylr@gmail.com", "aysenurylr123");
  const wrongPassword = login("aysenurylr@gmail.com", "aysenurylr1");
  const successfull = login("aysenurylr@gmail.com", "aysenurylr123");
  expect((await wrongEmail).success).toBe(false);
  expect((await wrongPassword).success).toBe(false);

  expect((await successfull).id).toBeDefined();
  expect((await successfull).success).toBe(true);

});
