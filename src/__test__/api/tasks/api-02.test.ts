import { AxiosInstance, AxiosResponse } from "axios";

import { runTest } from "@/utils";

interface GameResponse {
  category_uuids: string[];
  price: number;
  title: string;
  uuid: string;
}

interface GamesSearchResponse {
  meta: {
    total: number;
  };
  games: GameResponse[];
}

interface TestContext {
  client: AxiosInstance;
  searchGames: (query: string, offset: number, limit: number) => Promise<AxiosResponse<GamesSearchResponse>>;
}

describe("API-2: Game Search", () => {
  const TASK_ID = "api-2";
  const DEFAULT_EMAIL = "sanjay2@example.com";

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const searchGames = async (query: string, offset: number, limit: number) => {
      return testClient.get<GamesSearchResponse>("/games/search", {
        headers: {
          Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
          "X-Task-Id": TASK_ID,
        },
        params: {
          query,
          offset,
          limit,
        },
      });
    };

    return { client: testClient!, searchGames };
  };

  beforeAll(async () => {
    const { client } = await createTestContext();
    const response = await client.post("/setup", null, {
      headers: {
        Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
        "X-Task-Id": TASK_ID,
      },
    });
    expect(response.status).toBe(205);
  });

  describe("Search Functionality", () => {
    it("should return exact matches for search query", async () => {
      const { searchGames } = await createTestContext();
      const response = await searchGames("gate", 0, 10);

      expect(response.status).toBe(200);
      expect(response.data.games).toHaveLength(1);
      expect(response.data.games[0]).toMatchObject({
        title: expect.stringContaining("Gate"),
        uuid: expect.any(String),
        price: expect.any(Number),
        category_uuids: expect.any(Array),
      });
    });

    it("should return correct total count in meta", async () => {
      const { searchGames } = await createTestContext();
      const response = await searchGames("gate", 0, 10);

      expect(response.status).toBe(200);
      expect(response.data.meta.total).toBe(1);
    });

    it("should not return unrelated games in search results", async () => {
      const { searchGames } = await createTestContext();
      const response = await searchGames("gate", 0, 10);

      const unrelatedTitles = ["Atomic Heart", "Elden Ring", "The Witcher 3"];
      const hasUnrelatedGames = response.data.games.some((game) =>
        unrelatedTitles.some((title) => game.title.includes(title))
      );

      expect(hasUnrelatedGames).toBe(false);
    });
  });
});
