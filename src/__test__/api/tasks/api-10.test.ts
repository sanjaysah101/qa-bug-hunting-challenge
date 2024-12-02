import { AxiosInstance, AxiosResponse } from "axios";

import { expectMissingTaskIdResponse, runTest } from "@/utils";

interface GameResponse {
  category_uuids: string[];
  price: number;
  title: string;
  uuid: string;
}

interface Category {
  name: string;
  uuid: string;
}

interface CategoriesResponse {
  categories: Category[];
  meta: {
    total: number;
  };
}

interface GamesListResponse {
  meta: {
    total: number;
  };
  games: GameResponse[];
}

interface TestContext {
  client: AxiosInstance;
  getGamesByCategory: (
    categoryUuid: string,
    offset: number,
    limit: number
  ) => Promise<AxiosResponse<GamesListResponse>>;
  getCategories: () => Promise<AxiosResponse<CategoriesResponse>>;
}

describe("API-10: Get Games by Category", () => {
  const TASK_ID = "api-10";
  const DEFAULT_EMAIL = "sanjay10@example.com";
  let validCategoryUuid: string;
  //   let categoryName: string;

  const getHeaders = (taskId: string) => ({
    Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
    "X-Task-Id": taskId,
  });

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const getGamesByCategory = async (categoryUuid: string, offset: number, limit: number) => {
      return testClient.get<GamesListResponse>(`/categories/${categoryUuid}/games`, {
        headers: getHeaders(TASK_ID),
        params: {
          offset,
          limit,
        },
      });
    };

    const getCategories = async () => {
      return testClient.get<CategoriesResponse>("/categories", {
        headers: getHeaders(TASK_ID),
        params: {
          offset: 0,
          limit: 10,
        },
      });
    };

    return { client: testClient!, getGamesByCategory, getCategories };
  };

  beforeAll(async () => {
    const { client, getCategories } = await createTestContext();
    const setupResponse = await client.post("/setup", null, {
      headers: getHeaders(TASK_ID),
    });
    expect(setupResponse.status).toBe(205);

    // Get a valid category UUID from the categories list
    const categoriesResponse = await getCategories();
    const actionCategory = categoriesResponse.data.categories.find((cat) => cat.name === "Action");
    validCategoryUuid = actionCategory!.uuid;
    // categoryName = actionCategory!.name;
  });

  describe("Header Validation", () => {
    it("should return 404 when X-Task-Id header is missing", async () => {
      const { client } = await createTestContext();
      const response = await client.get(`/categories/${validCategoryUuid}/games`);
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Category Games Retrieval", () => {
    it("should return correct games for valid category", async () => {
      const { getGamesByCategory } = await createTestContext();
      const response = await getGamesByCategory(validCategoryUuid, 0, 10);

      expect(response.status).toBe(200);
      expect(response.data.games).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category_uuids: expect.arrayContaining([validCategoryUuid]),
          }),
        ])
      );
      expect(response.data.meta.total).toBe(response.data.games.length);
    });

    it("should return 404 for non-existent category", async () => {
      const { getGamesByCategory } = await createTestContext();
      const nonExistentUuid = crypto.randomUUID();
      const response = await getGamesByCategory(nonExistentUuid, 0, 10);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find category with "uuid": ${nonExistentUuid}`,
      });
    });

    it("should return games with matching category UUID only", async () => {
      const { getGamesByCategory } = await createTestContext();
      const response = await getGamesByCategory(validCategoryUuid, 0, 10);

      expect(response.status).toBe(200);
      response.data.games.forEach((game) => {
        expect(game.category_uuids).toContain(validCategoryUuid);
      });
    });

    it("should maintain consistent data structure", async () => {
      const { getGamesByCategory } = await createTestContext();
      const response = await getGamesByCategory(validCategoryUuid, 0, 10);

      expect(response.status).toBe(200);
      response.data.games.forEach((game) => {
        expect(game).toMatchObject({
          title: expect.any(String),
          uuid: expect.any(String),
          price: expect.any(Number),
          category_uuids: expect.any(Array),
        });
      });
    });
  });
});
