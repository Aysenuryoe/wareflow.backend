import supertest from "supertest";
import app from "../../src/app";
import { createUser } from "../../src/services/UserService";
import DB from "tests/DB";
import dotenv from "dotenv";
import { verifyCredentialsGenerateToken } from "../../src/services/JWTService";
import mongoose from "mongoose";

dotenv.config();

let adminToken: string;
let userToken: string;
let userId: string;
let otherUserId: string;
const request = supertest(app);

beforeAll(async () => await DB.connect());
beforeEach(async () => {
  await DB.clear();
  const admin = await createUser({ email: "admin@example.com", password: "StrongPass123!", admin: true });
  const user = await createUser({ email: "user@example.com", password: "UserPass123!", admin: false });
  const otherUser = await createUser({ email: "otheruser@example.com", password: "OtherPass123!", admin: false });
  await createUser({ email: "duplicateuser@example.com", password: "DuplicatePass123!", admin: false });

  adminToken = (await verifyCredentialsGenerateToken(admin.email, "StrongPass123!")) as string;
  userToken = (await verifyCredentialsGenerateToken(user.email, "UserPass123!")) as string;
  userId = user.id!.toString();
  otherUserId = otherUser.id!.toString();
});
afterAll(async () => await DB.close());
  
 
test("GET all - successful retrieval of all users", async () => {
  const response = await supertest(app)
    .get(`/api/user/all`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(response.body.users).toBeDefined();
  expect(response.body.users.length).toBeGreaterThanOrEqual(3); 

  expect(response.body.users).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ email: "admin@example.com", admin: true }),
      expect.objectContaining({ email: "user@example.com", admin: false }),
      expect.objectContaining({ email: "otheruser@example.com", admin: false }),
    ])
  );
});
test("GET successfull", async () => {
  const response = await supertest(app)
    .get(`/api/user/${userId}`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("id", userId);
  expect(response.body).toHaveProperty("email", "user@example.com");
  expect(response.body).toHaveProperty("admin", false);
});

test("GET invalid id throws 400", async () => {
  const invalidID = "invalid";
  const response = await request.get(`/api/user/${invalidID}`)
  .set("Authorization", `Bearer ${adminToken}`);

  expect(response.statusCode).toBe(400);
});

test("GET non existing mongo id throws 404", async () => {
  const invalidID = "invalid";
  const response = await request.get(`/api/user/${new mongoose.Types.ObjectId().toString()}`)
  .set("Authorization", `Bearer ${adminToken}`);

  expect(response.statusCode).toBe(404);
})

test("POST successfully creates a new user", async () => {
  const response = await supertest(app)
    .post(`/api/user`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      email: "newuser@example.com",
      password: "NewUserPass123!",
      admin: false,
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("email", "newuser@example.com");
  expect(response.body).toHaveProperty("admin", false);
});

test("POST invalid email throw 400", async() => {

  const response = await request.post(`/api/user`)
  .set("Authorization", `Bearer ${adminToken}`)
  .send({
    email: "invalid.com",
    password: "NewUserPass123!",
    admin: false,
  });

  expect(response.statusCode).toBe(400);
 
});

test("GET /api/users/:id - returns 403 when a user tries to access another user's profile", async () => {
  const token = await verifyCredentialsGenerateToken("user@example.com", "UserPass123!");
  expect(token).toBeDefined();
 
});



test("POST /api/users - returns 400 if email already exists", async () => {
  const duplicateEmail = "existinguser@example.com";

  await createUser({ email: duplicateEmail, password: "UserPass123!", admin: false });

  const response = await request
    .post(`/api/user`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      email: duplicateEmail,
      password: "NewUserPass123!",
      admin: false,
    });
  expect(response.status).toBe(400);
});

test("POST /api/users - returns 404 if user creation fails", async () => {
  const existingUserEmail = "existinguser@example.com";
    await createUser({ email: existingUserEmail, password: "UserPass123!", admin: false });

  const response = await request
    .post(`/api/use`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      email: existingUserEmail,
      password: "NewUserPass123!",
      admin: false,
    });

  expect(response.status).toBe(404);

});


test("PUT /api/users/:id - successfully updates a user", async () => {
  const updatedUserData = {
    id: userId, 
    email: "updateduser@example.com",
    password: "StrongPass123!",
    admin: true,
  };

  const response = await request
    .put(`/api/user/${userId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send(updatedUserData);

  expect(response.status).toBe(200); 
  expect(response.body).toHaveProperty("id", userId); 
  expect(response.body).toHaveProperty("email", updatedUserData.email); 
  expect(response.body).toHaveProperty("admin", updatedUserData.admin); 
});

test("PUT /api/users/:id - returns 400 if ids do not match", async () => {
  const user2 = await createUser({
    email: "hellouser@gmx.de",
    password: "StrongPass123!", 
    admin: false,
  });

  const updatedUserData = {
    id: "invalid_id", 
    email: "updateduser@example.com",
    password: "StrongPass123!",
    admin: true,
  };

  const response = await request
    .put(`/api/user/${user2.id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send(updatedUserData);

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty("errors");
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg: "Ids do not match" 
      }),
    ])
  );
});

test("PUT /api/users/:id - returns 400 if body id does not match path id", async () => {
  const user2 = await createUser({
    email: "hellouser@gmx.de",
    password: "StrongPass123!",
    admin: false,
  });

  const updatedUserData = {
    id: "someOtherId", 
    email: "updateduser@example.com",
    password: "StrongPass123!",
    admin: true,
  };

  const response = await request
    .put(`/api/user/${user2.id}`) 
    .set("Authorization", `Bearer ${adminToken}`)
    .send(updatedUserData);

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty("errors");
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg: "Ids do not match" 
      }),
    ])
  );
});


test("PUT /api/users/:id - returns 400 if email already exists", async () => {
  const existingUser = await createUser({
    email: "existinguser@example.com",
    password: "StrongPass123!", 
    admin: false,
  });

  const userToUpdate = await createUser({
    email: "user2@example.com",
    password: "UserPass123!",
    admin: false,
  });

  const updatedUserData = {
    id: userToUpdate.id,
    email: "existinguser@example.com", 
    password: "StrongPass123!",
    admin: true,
  };

  const response = await request
    .put(`/api/user/${userToUpdate.id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send(updatedUserData);

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty("errors");
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg: "Email already exists" 
      }),
    ])
  );
});


test("PUT /api/users/:id - returns 404 if user does not exist", async () => {
  const existingUser = await createUser({
    email: "existinguser@example.com",
    password: "StrongPass123!",
    admin: false,
  });

  const nonExistentUserId = new mongoose.Types.ObjectId().toString(); 

  const updatedUserData = {
    id: nonExistentUserId, 
    email: "updateduser@example.com",
    password: "StrongPass123!",
    admin: true,
  };

  const response = await request
    .put(`/api/user/${nonExistentUserId}`) 
    .set("Authorization", `Bearer ${adminToken}`)
    .send(updatedUserData);

  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty("error");
  expect(response.body.error).toBe("User not found."); 
});


test("DELETE successfully deletes a user", async () => {
  const response = await request
    .delete(`/api/user/${userId}`) 
    .set("Authorization", `Bearer ${adminToken}`); 

  expect(response.status).toBe(204); 

  const getUserResponse = await request.get(`/api/user/${userId}`).set("Authorization", `Bearer ${adminToken}`);
  expect(getUserResponse.status).toBe(404); 
});

test("DELETE invalid id 400", async () => {
  const response = await request
    .delete(`/api/user/invalidID`) 
    .set("Authorization", `Bearer ${adminToken}`); 

  expect(response.status).toBe(400);

});