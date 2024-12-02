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

interface ErrorResponse {
  code: number;
  message: string;
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
  removeFromCart: (userUuid: string, itemUuid: string) => Promise<AxiosResponse<CartResponse | ErrorResponse>>;
  addToCart: (userUuid: string, itemUuid: string, quantity: number) => Promise<AxiosResponse>;
  getGames: () => Promise<AxiosResponse<GamesListResponse>>;
  createUser: (data: NewUserCredentials) => Promise<AxiosResponse>;
}

describe("API-14: Remove Cart Item", () => {
  const TASK_ID = "api-14";
  const DEFAULT_EMAIL = "sanjay14@example.com";
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

    const removeFromCart = async (userUuid: string, itemUuid: string) => {
      return testClient.post<CartResponse | ErrorResponse>(
        `/users/${userUuid}/cart/remove`,
        { item_uuid: itemUuid },
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

    return { client: testClient!, removeFromCart, addToCart, getGames, createUser };
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
      const response = await client.post(`/users/${userUuid}/cart/remove`, {
        item_uuid: gameUuid,
      });
      expectMissingTaskIdResponse(response);
    });
  });

  describe("Cart Item Removal", () => {
    it("should return 404 when removing non-existent item", async () => {
      const { removeFromCart } = await createTestContext();
      const response = await removeFromCart(userUuid, gameUuid);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find cart_item with "uuid": ${gameUuid}`,
      });
    });

    it("should successfully remove existing item from cart", async () => {
      const { removeFromCart, addToCart } = await createTestContext();

      // Add two items to cart
      await addToCart(userUuid, gameUuid, 2);
      await addToCart(userUuid, secondGameUuid, 5);

      // Remove first item
      const response = await removeFromCart(userUuid, gameUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: [
          {
            item_uuid: secondGameUuid,
            quantity: 5,
            total_price: expect.any(Number),
          },
        ],
        total_price: expect.any(Number),
        user_uuid: userUuid,
      });
    });

    it("should return 404 for non-existent user", async () => {
      const { removeFromCart } = await createTestContext();
      const nonExistentUuid = crypto.randomUUID();
      const response = await removeFromCart(nonExistentUuid, gameUuid);

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        code: 404,
        message: `Could not find user with "uuid": ${nonExistentUuid}`,
      });
    });

    it("should maintain consistent cart data structure after removal", async () => {
      const { removeFromCart, addToCart } = await createTestContext();

      // Add and then remove an item
      await addToCart(userUuid, gameUuid, 1);
      const response = await removeFromCart(userUuid, gameUuid);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        items: expect.any(Array),
        total_price: expect.any(Number),
        user_uuid: userUuid,
      });
    });
  });
});
