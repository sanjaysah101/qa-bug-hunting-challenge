import { AxiosInstance, AxiosResponse } from "axios";

import { expectMissingTaskIdResponse, runTest } from "@/utils";

interface GameResponse {
  category_uuids: string[];
  price: number;
  title: string;
  uuid: string;
}

interface GamesListResponse {
  meta: {
    total: number;
  };
  games: GameResponse[];
}

interface TestContext {
  client: AxiosInstance;
  getGame: (uuid: string) => Promise<AxiosResponse<GameResponse>>;
  getGames: () => Promise<AxiosResponse<GamesListResponse>>;
}

const DEFAULT_EMAIL = "sanjay9@example.com";

const getHeaders = (taskId: string) => ({
  Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
  "X-Task-Id": taskId,
});

describe("API-9: Get Game Details", () => {
  const TASK_ID = "api-9";
  let validGameUuid: string;

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const getGame = async (uuid: string) => {
      return testClient.get<GameResponse>(`/games/${uuid}`, {
        headers: getHeaders(TASK_ID),
      });
    };

    const getGames = async () => {
      return testClient.get<GamesListResponse>("/games", {
        headers: getHeaders(TASK_ID),
      });
    };

    return { client: testClient!, getGame, getGames };
  };

  beforeAll(async () => {
    const { client, getGames } = await createTestContext();
    const setupResponse = await client.post("/setup", null, {
      headers: getHeaders(TASK_ID),
    });
    expect(setupResponse.status).toBe(205);

    // Get a valid game UUID from the games list
    const gamesResponse = await getGames();
    validGameUuid = gamesResponse.data.games[0].uuid;
  });

  describe("Header Validation", () => {
    it("should return 404 when X-Task-Id header is missing", async () => {
      const { client } = await createTestContext();
      const response = await client.get(`/games/${validGameUuid}`, {
        headers: { Authorization: getHeaders(TASK_ID).Authorization },
      });
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Game Retrieval", () => {
    it("should successfully retrieve game details", async () => {
      const { getGame } = await createTestContext();
      const response = await getGame(validGameUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        title: expect.any(String),
        uuid: validGameUuid,
        price: expect.any(Number),
        category_uuids: expect.any(Array),
      });
    });

    it("should return 404 for non-existent game UUID", async () => {
      const { getGame } = await createTestContext();
      const nonExistentUuid = crypto.randomUUID();
      const response = await getGame(nonExistentUuid);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find game with "uuid": ${nonExistentUuid}`,
      });
    });

    it("should return all expected game properties", async () => {
      const { getGame, getGames } = await createTestContext();
      const gamesResponse = await getGames();
      const [expectedGame] = gamesResponse.data.games;

      const response = await getGame(expectedGame.uuid);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(expectedGame);
    });
  });
});
