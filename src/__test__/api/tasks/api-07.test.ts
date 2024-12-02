import { AxiosInstance, AxiosResponse } from "axios";

import {
  expectMissingEmailErrorForLogin,
  expectMissingPasswordErrorForLogin,
  expectMissingRequestBodyError,
  expectMissingTaskIdResponse,
  runTest,
} from "@/utils";

const DEFAULT_EMAIL = "sanjay7@example.com";

interface LoginCredentials {
  email: string;
  password: string;
}

interface NewUserCredentials {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

interface TestContext {
  client: AxiosInstance;
  loginUser: (data: Partial<LoginCredentials>) => Promise<AxiosResponse>;
  createUser: (data: Partial<NewUserCredentials>) => Promise<AxiosResponse>;
}

const getHeaders = (taskId: string) => ({
  Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
  "X-Task-Id": taskId,
});

describe("API-7: Get a user by email and password", () => {
  const TASK_ID = "api-7";

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const loginUser = async (data: Partial<LoginCredentials>) => {
      return testClient.post("/users/login", data, {
        headers: getHeaders(TASK_ID),
      });
    };

    const createUser = async (data: Partial<NewUserCredentials>) => {
      return testClient.post("/users", data, {
        headers: getHeaders(TASK_ID),
      });
    };

    return { client: testClient!, loginUser, createUser };
  };

  beforeAll(async () => {
    const { client } = await createTestContext();
    const response = await client.post("/setup", null, {
      headers: getHeaders(TASK_ID),
    });
    expect(response.status).toBe(205);
  });

  describe("Header Validation", () => {
    it("should return 404 when X-Task-Id header is missing", async () => {
      const { client } = await createTestContext();
      const response = await client.post(
        "/users/login",
        {},
        {
          headers: { Authorization: getHeaders(TASK_ID).Authorization },
        }
      );
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Request Body Validation", () => {
    let context: TestContext;

    beforeEach(async () => {
      context = await createTestContext();
    });

    const testCases = [
      {
        name: "missing request body",
        data: undefined,
        expectation: expectMissingRequestBodyError,
      },
      {
        name: "missing email",
        data: { password: "password123" },
        expectation: expectMissingEmailErrorForLogin,
      },
      {
        name: "missing password",
        data: { email: "test@example.com" },
        expectation: expectMissingPasswordErrorForLogin,
      },
    ];

    testCases.forEach(({ name, data, expectation }) => {
      it(`should return 400 when ${name}`, async () => {
        const response = await context.loginUser(data as Partial<LoginCredentials>);
        expectation(response);
      });
    });
  });

  describe("User Login", () => {
    const VALID_CREDENTIALS: NewUserCredentials = {
      email: "sanjay7@example.com",
      password: "password123",
      name: "sanjay",
      nickname: "sanjay",
    };

    it("should successfully login with valid credentials", async () => {
      const { loginUser, createUser } = await createTestContext();

      const newUserResponse = await createUser(VALID_CREDENTIALS);
      expect(newUserResponse.status).toBe(200);

      const response = await loginUser(VALID_CREDENTIALS);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        email: VALID_CREDENTIALS.email,
        name: VALID_CREDENTIALS.name,
        nickname: VALID_CREDENTIALS.nickname,
        avatar_url: "",
        uuid: expect.any(String),
      });
    });

    it("should return 404 when credentials are invalid", async () => {
      const { loginUser } = await createTestContext();
      const response = await loginUser({
        email: "invalid@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: "Could not find user with given credentials",
      });
    });
  });
});
