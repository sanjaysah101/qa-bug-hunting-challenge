import { AxiosInstance, AxiosResponse } from "axios";

import { runTest } from "@/utils";

interface TestContext {
  client: AxiosInstance;
  getUsers: () => Promise<AxiosResponse>;
}

describe("API-21: User Listing Meta Information", () => {
  const TASK_ID = "api-21";

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const getUsers = async () => {
      return testClient.get("/users", {
        headers: {
          Authorization: "Bearer qahack2024:sanjay.sah@example.com",
          "X-Task-Id": TASK_ID,
        },
      });
    };

    return { client: testClient!, getUsers };
  };

  beforeAll(async () => {
    const { client } = await createTestContext();
    const response = await client.post("/setup", null, {
      headers: {
        Authorization: "Bearer qahack2024:sanjay.sah@example.com",
        "X-Task-Id": TASK_ID,
      },
    });
    expect(response.status).toBe(205);
  });

  describe("Meta Information Tests", () => {
    it("should return non-zero total count", async () => {
      const { getUsers } = await createTestContext();
      const response = await getUsers();

      expect(response.status).toBe(200);
      if (response.data.users.length > 0) expect(response.data.meta.total).toBeGreaterThan(0);
    });
  });
});
