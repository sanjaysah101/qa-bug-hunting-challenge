import { AxiosInstance, AxiosResponse } from "axios";

import {
  expectDuplicateEmailError,
  expectEmailValidationError,
  expectInvalidEmailFormatError,
  expectMissingEmailError,
  expectMissingNameError,
  expectMissingNicknameError,
  expectMissingPasswordError,
  expectMissingRequestBodyError,
  expectMissingTaskIdResponse,
  runTest,
} from "@/utils";

const DEFAULT_EMAIL = "sanjay@example.com";

// Move interfaces and helpers to global scope
interface UserData {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

interface TestContext {
  client: AxiosInstance;
  createUser: (data: Partial<UserData>) => Promise<AxiosResponse>;
}

// Global helper function
export const getHeaders = (taskId: string) => ({
  Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
  "X-Task-Id": taskId,
});

describe("API-3: Create a new User", () => {
  const TASK_ID = "api-3";

  const VALID_USER: UserData = {
    email: "sanjay87520@gmail.com",
    password: "password123",
    name: "sanjay",
    nickname: "sanjay",
  };

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const createUser = async (data: Partial<UserData>) => {
      return testClient.post("/users", data, {
        headers: getHeaders(TASK_ID),
      });
    };

    return { client: testClient!, createUser };
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
        "/users",
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
        name: "too short email",
        data: { email: "a@b" },
        expectation: expectEmailValidationError,
      },
      {
        name: "missing email",
        data: {},
        expectation: expectMissingEmailError,
      },
      {
        name: "invalid email format",
        data: { email: "invalid.email" },
        expectation: expectInvalidEmailFormatError,
      },
      {
        name: "missing password",
        data: { email: "test@example.com", name: "Test User" },
        expectation: expectMissingPasswordError,
      },
      {
        name: "missing name",
        data: { email: "test@example.com", password: "password123" },
        expectation: expectMissingNameError,
      },
      {
        name: "missing nickname",
        data: { email: "test@example.com", password: "password123", name: "Test User" },
        expectation: expectMissingNicknameError,
      },
    ];

    testCases.forEach(({ name, data, expectation }) => {
      it(`should return 400 when ${name}`, async () => {
        const response = await context.createUser(data as Partial<UserData>);
        expectation(response);
      });
    });
  });

  describe("User Creation", () => {
    it("should create a new user", async () => {
      const { createUser } = await createTestContext();
      const response = await createUser(VALID_USER);
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        email: VALID_USER.email,
        name: VALID_USER.name,
        nickname: VALID_USER.nickname,
        avatar_url: "",
        uuid: expect.any(String),
      });
    });

    it("should return 409 when user with email already exists", async () => {
      const { createUser } = await createTestContext();

      const response = await createUser(VALID_USER);

      expectDuplicateEmailError(response, VALID_USER.email);
    });
  });
});
