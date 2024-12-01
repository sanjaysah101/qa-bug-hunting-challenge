import { expectMissingTaskIdResponse, expectUnauthorizedResponse } from "@/utils/test-helpers";
import { runTest } from "@/utils/test-runner";

describe("Initial Setup Test", () => {
  const TASK_ID = "api-2";

  test("test unauthorized response", async () => {
    await runTest(TASK_ID, async (client) => {
      const response = await client.get("/status", {
        headers: {
          Authorization: "Bearer your.email@example.com",
          "X-Task-Id": TASK_ID,
        },
      });
      expectUnauthorizedResponse(response);
    });
  });

  test("test authorized response", async () => {
    await runTest(TASK_ID, async (client) => {
      const response = await client.get("/status", {
        headers: {
          Authorization: "Bearer qahack2024:your.email@example.com",
          "X-Task-Id": TASK_ID,
        },
      });
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        task_id: TASK_ID,
      });
    });
  });

  test("test missing task ID response", async () => {
    await runTest(TASK_ID, async (client) => {
      const response = await client.get("/status", {
        headers: {
          Authorization: "Bearer qahack2024:your.email@example.com",
        },
      });
      expectMissingTaskIdResponse(response);
    });
  });
});
