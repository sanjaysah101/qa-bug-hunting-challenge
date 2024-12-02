# API-13: Cart Item Change Bug Report

## Bug Description

When changing an item quantity in a user's cart through the `/users/:user_uuid/cart/change` endpoint with task ID `api-13`, the development environment incorrectly returns an empty items array while maintaining the total price. This creates an inconsistency between the items and the total price calculation.

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-13
- **Endpoint**: POST /users/:user_uuid/cart/change
- **HTTP Method**: POST

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay13@example.com`
- Task ID Header: `X-Task-Id: api-13`

## Steps to Reproduce

1. Create a new user
2. Add items to the user's cart
3. Change the quantity of an item in the cart
4. Compare results between development and production environments

## Expected vs Actual Behavior

### Expected Response (Production)

```json
{
  "items": [
    {
      "item_uuid": "1990ecdd-4d3d-4de2-91b9-d45d794c82bc",
      "quantity": 4,
      "total_price": 23996
    }
  ],
  "total_price": 23996,
  "user_uuid": "6fa47853-a440-4a84-9bf6-7829d1ffae45"
}
```

### Actual Response (Development)

```json
{
  "items": [],
  "total_price": 23996,
  "user_uuid": "6fa47853-a440-4a84-9bf6-7829d1ffae45"
}
```

## Test Implementation

The bug is verified using the following test case:

```typescript
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
```

## Verification Results

- ✅ Tests pass in Production environment
- ❌ Tests fail in Development environment
- 🔄 Issue is consistently reproducible

## Additional Notes

- The API returns a 200 status code in both environments
- Total price calculation appears correct
- Only the items array is affected
- The issue is specific to task ID `api-13`
- Cart items are properly added but disappear after quantity change

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-13.test

# Run in production environment to verify correct behavior
pnpm test:prod api-13.test
```

## Bug Impact

This bug affects:

- Cart item display
- Cart management functionality
- Order total calculations
- Checkout process
- Cart state consistency
- Frontend cart displays

## Possible Investigation Points

1. Cart item persistence logic
2. Response transformation layer
3. Cart update handlers
4. Data serialization process
5. Cart state management
6. Database transaction handling
