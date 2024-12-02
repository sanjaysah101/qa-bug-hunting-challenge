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
  clearCart: (userUuid: string) => Promise<AxiosResponse<CartResponse>>;
  addToCart: (userUuid: string, itemUuid: string, quantity: number) => Promise<AxiosResponse>;
  getGames: () => Promise<AxiosResponse<GamesListResponse>>;
  createUser: (data: NewUserCredentials) => Promise<AxiosResponse>;
}

describe("API-15: Clear Cart", () => {
  const TASK_ID = "api-15";
  const DEFAULT_EMAIL = "sanjay15@example.com";
  let userUuid: string;
  let gameUuid: string;
  let secondGameUuid: string;

  const getHeaders = (taskId: string) => ({
    Authorization: `Bearer qahack2024:${DEFAULT_EMAIL}`,
    "X-Task-Id": taskId,
  });

  const createTestContext = async (): Promise<TestContext> => {
    let testClient: AxiosInstance;

    await runTest(TASK_ID, async (client) => {
      testClient = client;
    });

    const clearCart = async (userUuid: string) => {
      return testClient.post<CartResponse>(`/users/${userUuid}/cart/clear`, {}, { headers: getHeaders(TASK_ID) });
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

    return { client: testClient!, clearCart, addToCart, getGames, createUser };
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

    // Get game UUIDs for testing
    const gamesResponse = await getGames();
    [{ uuid: gameUuid }, { uuid: secondGameUuid }] = gamesResponse.data.games;
  });

  describe("Header Validation", () => {
    it("should return 404 when X-Task-Id header is missing", async () => {
      const { client } = await createTestContext();
      const response = await client.post(`/users/${userUuid}/cart/clear`);
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Cart Clear Operations", () => {
    it("should clear all items from cart", async () => {
      const { clearCart, addToCart } = await createTestContext();

      // Add multiple items to cart
      await addToCart(userUuid, gameUuid, 2);
      await addToCart(userUuid, secondGameUuid, 5);

      // Clear cart
      const response = await clearCart(userUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: [],
        total_price: 0,
        user_uuid: userUuid,
      });
    });

    it("should return empty cart when clearing already empty cart", async () => {
      const { clearCart } = await createTestContext();
      const response = await clearCart(userUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: [],
        total_price: 0,
        user_uuid: userUuid,
      });
    });

    it("should return 404 for non-existent user", async () => {
      const { clearCart } = await createTestContext();
      const nonExistentUuid = crypto.randomUUID();
      const response = await clearCart(nonExistentUuid);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find user with "uuid": ${nonExistentUuid}`,
      });
    });

    it("should maintain consistent cart data structure after clearing", async () => {
      const { clearCart } = await createTestContext();
      const response = await clearCart(userUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: expect.any(Array),
        total_price: expect.any(Number),
        user_uuid: userUuid,
      });
    });
  });
});
