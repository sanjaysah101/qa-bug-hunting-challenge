import { AxiosInstance, AxiosResponse } from "axios";

import { expectMissingTaskIdResponse, runTest } from "@/utils";

interface CartItem {
  item_uuid: string;
  quantity: number;
  total_price: number;
}

interface CartResponse {
  items: CartItem[];
  total_price: number;
  user_uuid: string;
}

interface GameResponse {
  category_uuids: string[];
  price: number;
  title: string;
  uuid: string;
}

interface GamesListResponse {
  games: GameResponse[];
  meta: {
    total: number;
  };
}

interface NewUserCredentials {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

interface TestContext {
  client: AxiosInstance;
  getCart: (userUuid: string) => Promise<AxiosResponse<CartResponse>>;
  addToCart: (userUuid: string, itemUuid: string, quantity: number) => Promise<AxiosResponse>;
  getGames: () => Promise<AxiosResponse<GamesListResponse>>;
  createUser: (data: NewUserCredentials) => Promise<AxiosResponse>;
}

describe("API-12: Get Cart", () => {
  const TASK_ID = "api-12";
  const DEFAULT_EMAIL = "sanjay12@example.com";
  let userUuid: string;
  let gameUuid: string;

  const getHeaders = (taskId: string) => ({
    Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
    "X-Task-Id": taskId,
  });

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const getCart = async (userUuid: string) => {
      return testClient.get<CartResponse>(`/users/${userUuid}/cart`, {
        headers: getHeaders(TASK_ID),
      });
    };

    const addToCart = async (userUuid: string, itemUuid: string, quantity: number) => {
      return testClient.post(
        `/users/${userUuid}/cart/add`,
        { item_uuid: itemUuid, quantity },
        { headers: getHeaders(TASK_ID) }
      );
    };

    const getGames = async () => {
      return testClient.get<GamesListResponse>("/games", {
        headers: getHeaders(TASK_ID),
        params: { offset: 0, limit: 10 },
      });
    };

    const createUser = async (data: NewUserCredentials) => {
      return testClient.post("/users", data, {
        headers: getHeaders(TASK_ID),
      });
    };

    return { client: testClient!, getCart, addToCart, getGames, createUser };
  };

  beforeAll(async () => {
    const { client, createUser, getGames } = await createTestContext();
    const setupResponse = await client.post("/setup", null, {
      headers: getHeaders(TASK_ID),
    });
    expect(setupResponse.status).toBe(205);

    // Create a test user
    const userData = {
      email: "test.cart@example.com",
      password: "password123",
      name: "Test Cart User",
      nickname: "cartuser",
    };
    const userResponse = await createUser(userData);
    userUuid = userResponse.data.uuid;

    // Get a game UUID for testing
    const gamesResponse = await getGames();
    gameUuid = gamesResponse.data.games[0].uuid;
  });

  describe("Header Validation", () => {
    it("should return 404 when X-Task-Id header is missing", async () => {
      const { client } = await createTestContext();
      const response = await client.get(`/users/${userUuid}/cart`);
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Cart Operations", () => {
    it("should return correct cart total price", async () => {
      const { getCart, addToCart } = await createTestContext();

      // Add items to cart
      const quantity = 2;
      await addToCart(userUuid, gameUuid, quantity);

      // Get cart and verify total price
      const response = await getCart(userUuid);

      expect(response.status).toBe(200);
      expect(response.data.total_price).toBe(response.data.items.reduce((sum, item) => sum + item.total_price, 0));
    });

    it("should return 404 for non-existent user", async () => {
      const { getCart } = await createTestContext();
      const nonExistentUuid = crypto.randomUUID();
      const response = await getCart(nonExistentUuid);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find user with "uuid": ${nonExistentUuid}`,
      });
    });

    it("should maintain consistent cart data structure", async () => {
      const { getCart } = await createTestContext();
      const response = await getCart(userUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: expect.any(Array),
        total_price: expect.any(Number),
        user_uuid: userUuid,
      });
    });
  });
});
