import supertest from "supertest";
import app from "../../src/app";
import { createUser } from "../../src/services/UserService";
import DB from "tests/DB";
import dotenv from "dotenv";
import { User } from "../../src/models/UserModel";
import { log } from "console";
import { login } from "src/services/AuthenticationService";
import { LoginResource } from "../../src/Resources";
dotenv.config();

let emailAdress = "hello@aysenur.de";
let strongPassword = "123asdf!ABCD";
let user; 
beforeAll(async () => await DB.connect());
beforeEach(async () => {
  User.syncIndexes();
   user = await createUser({
    email: emailAdress,
    password: strongPassword,
    admin: false,
  });
});
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());


test("POST /api/login - successfully logs in a user", async () => {
  const request = supertest(app);
  const loginData = { email: "hello@aysenur.de", password: strongPassword};
  const response = await request.post(`/api/login`).send(loginData);
  const loginResource = response.body as LoginResource;
  const token = loginResource.accessToken;
  expect(token).toBeDefined();
});

test("login POST negative 400", async () => {
  const request = supertest(app);
  const loginData = { email: "helloaysenur-host.de", password: strongPassword};
  const response = await request.post(`/api/login`).send(loginData);
  expect(response.statusCode).toBe(400);
});

test("login POST negative 401", async () => {
  const request = supertest(app);
  const loginData = { email: "hello@ayse.de", password: strongPassword};
  const response = await request.post(`/api/login`).send(loginData);
  expect(response.statusCode).toBe(401);
});

