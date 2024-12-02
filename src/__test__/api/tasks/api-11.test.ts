import { AxiosInstance, AxiosResponse } from "axios";
import FormData from "form-data";
import * as fs from "fs";
import * as path from "path";

import { expectMissingRequestBodyError, expectMissingTaskIdResponse, runTest } from "@/utils";

const DEFAULT_EMAIL = "sanjay11@example.com";

interface UserResponse {
  email: string;
  name: string;
  nickname: string;
  avatar_url: string;
  uuid: string;
}

interface NewUserCredentials {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

interface TestContext {
  client: AxiosInstance;
  createUser: (data: Partial<NewUserCredentials>) => Promise<AxiosResponse<UserResponse>>;
  updateAvatar: (uuid: string, file: Buffer) => Promise<AxiosResponse<UserResponse>>;
  getTestImageBuffer: () => Buffer;
}

const getHeaders = (taskId: string) => ({
  Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
  "X-Task-Id": taskId,
});

describe("API-11: Update User Avatar", () => {
  const TASK_ID = "api-11";
  let userUuid: string;
  const VALID_USER: NewUserCredentials = {
    email: "UnTs@HeJaWCh2W3es.ZHd",
    password: "password123",
    name: "HnIX6YRDd3",
    nickname: "dm+.a6Ussd",
  };

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const createUser = async (data: Partial<NewUserCredentials>) => {
      return testClient.post("/users", data, {
        headers: getHeaders(TASK_ID),
      });
    };

    const updateAvatar = async (uuid: string, file: Buffer) => {
      const formData = new FormData();
      formData.append("avatar_file", file, {
        filename: "test-avatar.jpg",
        contentType: "image/jpeg",
      });

      return testClient.put(`/users/${uuid}/avatar`, formData, {
        headers: {
          ...getHeaders(TASK_ID),
          ...formData.getHeaders(),
        },
      });
    };

    const getTestImageBuffer = () => {
      return fs.readFileSync(path.join(__dirname, "../../../assets/test-avatar.png"));
    };

    return { client: testClient!, createUser, updateAvatar, getTestImageBuffer };
  };

  beforeAll(async () => {
    const { client } = await createTestContext();
    const response = await client.post("/setup", null, {
      headers: getHeaders(TASK_ID),
    });
    expect(response.status).toBe(205);
    const { createUser } = await createTestContext();
    const userResponse = await createUser(VALID_USER);
    userUuid = userResponse.data.uuid;
  });

  describe("Header Validation", () => {
    it("should return 404 when X-Task-Id header is missing", async () => {
      const { client } = await createTestContext();
      const formData = new FormData();
      formData.append("avatar_file", Buffer.from("test"), "test.jpg");

      // Create a user first to get UUID

      const response = await client.put(`/users/${userUuid}/avatar`, formData, {
        headers: { Authorization: getHeaders(TASK_ID).Authorization },
      });
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Request Body Validation", () => {
    it("should return 400 when avatar file is missing", async () => {
      const { client } = await createTestContext();

      const formData = new FormData();

      const response = await client.put(`/users/${userUuid}/avatar`, formData, {
        headers: {
          ...getHeaders(TASK_ID),
          ...formData.getHeaders(),
        },
      });
      expectMissingRequestBodyError(response);
    });
  });

  describe("Avatar Update", () => {
    it("should successfully update user avatar", async () => {
      const { updateAvatar, getTestImageBuffer } = await createTestContext();

      const imageBuffer = getTestImageBuffer();
      const response = await updateAvatar(userUuid, imageBuffer);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        email: VALID_USER.email,
        name: VALID_USER.name,
        nickname: VALID_USER.nickname,
        uuid: userUuid,
        avatar_url: expect.stringMatching(/^https:\/\/gravatar\.com\/avatar\/.+\?f=y$/),
      });
    });

    it("should return 404 when user UUID does not exist", async () => {
      const { updateAvatar, getTestImageBuffer } = await createTestContext();
      const imageBuffer = getTestImageBuffer();
      const nonExistentUuid = crypto.randomUUID();

      const response = await updateAvatar(nonExistentUuid, imageBuffer);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find user with "uuid": ${nonExistentUuid}`,
      });
    });
  });
});
