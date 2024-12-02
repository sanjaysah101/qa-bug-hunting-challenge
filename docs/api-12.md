# API-12: Cart Total Price Bug Report

## Bug Description

When retrieving a user's cart through the `/users/:user_uuid/cart` endpoint with task ID `api-12`, the development environment incorrectly calculates the cart's total price. The total_price field is always returned as 0, even when there are items in the cart with valid prices.

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-12
- **Endpoint**: GET /users/:user_uuid/cart
- **HTTP Method**: GET

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay12@example.com`
- Task ID Header: `X-Task-Id: api-12`

## Steps to Reproduce

1. Create a new user
2. Get a valid game UUID from the `/games` endpoint
3. Add items to the cart using POST `/users/:user_uuid/cart/add`
4. Retrieve the cart using GET `/users/:user_uuid/cart`
5. Compare results between development and production environments

## Expected vs Actual Behavior

### Expected Response (Production)

```json
{
  "items": [
    {
      "item_uuid": "1990ecdd-4d3d-4de2-91b9-d45d794c82bc",
      "quantity": 2,
      "total_price": 11998
    }
  ],
  "total_price": 11998,
  "user_uuid": "6fa47853-a440-4a84-9bf6-7829d1ffae45"
}
```

### Actual Response (Development)

```json
{
  "items": [
    {
      "item_uuid": "1990ecdd-4d3d-4de2-91b9-d45d794c82bc",
      "quantity": 2,
      "total_price": 11998
    }
  ],
  "total_price": 0,
  "user_uuid": "6fa47853-a440-4a84-9bf6-7829d1ffae45"
}
```

## Test Implementation

The bug is verified using the following test case:

```typescript
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
```

## Verification Results

- ✅ Tests pass in Production environment
- ❌ Tests fail in Development environment
- 🔄 Issue is consistently reproducible

## Additional Notes

- The API returns a 200 status code in both environments
- Individual item prices are calculated correctly
- Only the cart total_price field is affected
- The issue is specific to task ID `api-12`
- Cart items are properly added and stored

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-12.test

# Run in production environment to verify correct behavior
pnpm test:prod api-12.test
```

## Bug Impact

This bug affects:

- Cart total calculations
- Checkout functionality
- Order total displays
- Price summaries
- Cart-related features
- Payment processing

## Possible Investigation Points

1. Cart total calculation logic
2. Price aggregation implementation
3. Cart data transformation layer
4. Response formatting middleware
5. Cart service implementation
6. Price calculation utilities
