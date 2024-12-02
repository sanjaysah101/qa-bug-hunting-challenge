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
  changeCartItem: (userUuid: string, itemUuid: string, quantity: number) => Promise<AxiosResponse<CartResponse>>;
  addToCart: (userUuid: string, itemUuid: string, quantity: number) => Promise<AxiosResponse>;
  getGames: () => Promise<AxiosResponse<GamesListResponse>>;
  createUser: (data: NewUserCredentials) => Promise<AxiosResponse>;
}

describe("API-13: Change Cart Item", () => {
  const TASK_ID = "api-13";
  const DEFAULT_EMAIL = "sanjay13@example.com";
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

    const changeCartItem = async (userUuid: string, itemUuid: string, quantity: number) => {
      return testClient.post<CartResponse>(
        `/users/${userUuid}/cart/change`,
        { item_uuid: itemUuid, quantity },
        { headers: getHeaders(TASK_ID) }
      );
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

    return { client: testClient!, changeCartItem, addToCart, getGames, createUser };
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
      const response = await client.post(`/users/${userUuid}/cart/change`, {
        item_uuid: gameUuid,
        quantity: 1,
      });
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Cart Item Operations", () => {
    it("should maintain items array after changing quantity", async () => {
      const { changeCartItem, addToCart } = await createTestContext();

      // First add an item to cart
      await addToCart(userUuid, gameUuid, 2);

      // Then change its quantity
      const response = await changeCartItem(userUuid, gameUuid, 4);

      expect(response.status).toBe(200);
      expect(response.data.items).toHaveLength(1);
      expect(response.data.items[0]).toMatchObject({
        item_uuid: gameUuid,
        quantity: 4,
        total_price: expect.any(Number),
      });
    });

    it("should calculate correct total price after quantity change", async () => {
      const { changeCartItem } = await createTestContext();

      const response = await changeCartItem(userUuid, gameUuid, 3);

      expect(response.status).toBe(200);
      expect(response.data.total_price).toBe(response.data.items.reduce((sum, item) => sum + item.total_price, 0));
    });

    it("should return 404 for non-existent user", async () => {
      const { changeCartItem } = await createTestContext();
      const nonExistentUuid = crypto.randomUUID();
      const response = await changeCartItem(nonExistentUuid, gameUuid, 1);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find user with "uuid": ${nonExistentUuid}`,
      });
    });

    it("should maintain consistent cart data structure", async () => {
      const { changeCartItem } = await createTestContext();
      const response = await changeCartItem(userUuid, gameUuid, 2);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: expect.any(Array),
        total_price: expect.any(Number),
        user_uuid: userUuid,
      });
    });
  });
});
