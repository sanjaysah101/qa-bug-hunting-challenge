import { AxiosInstance, AxiosResponse } from "axios";

import { runTest } from "@/utils";

const DEFAULT_EMAIL = "sanjay.sah@example.com";

interface UserResponse {
  email: string;
  name: string;
  nickname: string;
  avatar_url: string;
  uuid: string;
}

interface UsersListResponse {
  meta: {
    total: number;
  };
  users: UserResponse[];
}

interface TestContext {
  client: AxiosInstance;
  getUsersWithPagination: (offset: number, limit: number) => Promise<AxiosResponse<UsersListResponse>>;
}

const getHeaders = (taskId: string) => ({
  Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
  "X-Task-Id": taskId,
});

describe("API-6: User Listing Pagination", () => {
  const TASK_ID = "api-6";

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const getUsersWithPagination = async (offset: number, limit: number) => {
      return testClient.get<UsersListResponse>(`/users`, {
        headers: getHeaders(TASK_ID),
        params: {
          offset,
          limit,
        },
      });
    };

    return { client: testClient!, getUsersWithPagination };
  };

  beforeAll(async () => {
    const { client } = await createTestContext();
    const response = await client.post("/setup", null, {
      headers: getHeaders(TASK_ID),
    });
    expect(response.status).toBe(205);
  });

  describe("Pagination Tests", () => {
    it("should return correct number of users based on limit", async () => {
      const { getUsersWithPagination } = await createTestContext();
      const limit = 3;
      const response = await getUsersWithPagination(0, limit);

      expect(response.status).toBe(200);
      expect(response.data.users.length).toBeLessThanOrEqual(limit);
    });

    it("should return different users when using offset", async () => {
      const { getUsersWithPagination } = await createTestContext();
      const limit = 2;

      // Get first page
      const firstPage = await getUsersWithPagination(0, limit);
      // Get second page
      const secondPage = await getUsersWithPagination(limit, limit);

      expect(firstPage.status).toBe(200);
      expect(secondPage.status).toBe(200);

      // Verify we got different users
      const firstPageEmails = firstPage.data.users.map((user) => user.email);
      const secondPageEmails = secondPage.data.users.map((user) => user.email);

      // Check for no overlap between pages
      const hasOverlap = firstPageEmails.some((email) => secondPageEmails.includes(email));
      expect(hasOverlap).toBe(false);
    });

    it("should return empty array when offset exceeds total users", async () => {
      const { getUsersWithPagination } = await createTestContext();
      const response = await getUsersWithPagination(1000, 10);

      expect(response.status).toBe(200);
      expect(response.data.users).toHaveLength(0);
    });

    it("should maintain consistent total count across pages", async () => {
      const { getUsersWithPagination } = await createTestContext();
      const firstPage = await getUsersWithPagination(0, 2);
      const secondPage = await getUsersWithPagination(2, 2);

      expect(firstPage.data.meta.total).toBe(secondPage.data.meta.total);
    });

    it("should reject zero limit with 400 error", async () => {
      const { getUsersWithPagination } = await createTestContext();
      const response = await getUsersWithPagination(0, 0);

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        code: 400,
        message: 'parameter "limit" in query has an error: number must be at least 1',
      });
    });

    it("should reject negative offset with 400 error", async () => {
      const { getUsersWithPagination } = await createTestContext();
      const response = await getUsersWithPagination(-1, 5);

      expect(response.status).toBe(400);
      expect(response.data).toMatchObject({
        code: 400,
        message: 'parameter "offset" in query has an error: number must be at least 0',
      });
    });
  });
});
