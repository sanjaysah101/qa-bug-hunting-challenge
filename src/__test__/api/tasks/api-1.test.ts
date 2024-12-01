import { runTest } from "@/utils/test-runner";

describe("API-1: User Status Check", () => {
  const TASK_ID = "api-1";

  it("should correctly handle user status", async () => {
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
});
