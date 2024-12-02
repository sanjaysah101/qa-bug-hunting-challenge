# API-14: Cart Item Removal Bug Report

## Bug Description

When removing an item from a user's cart through the `/users/:user_uuid/cart/remove` endpoint with task ID `api-14`, the development environment incorrectly handles non-existent items. Instead of returning a 404 error, it returns an empty cart response, creating inconsistency with the production behavior.

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-14
- **Endpoint**: POST /users/:user_uuid/cart/remove
- **HTTP Method**: POST

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay14@example.com`
- Task ID Header: `X-Task-Id: api-14`

## Steps to Reproduce

1. Create a new user
2. Attempt to remove a non-existent item from the cart
3. Compare results between development and production environments
4. Add items to cart and remove them
5. Verify remaining items in cart

## Expected vs Actual Behavior

### Expected Response (Production) - Non-existent Item

```json
{
  "code": 404,
  "message": "Could not find cart_item with \"uuid\": 1990ecdd-4d3d-4de2-91b9-d45d794c82bc"
}
```

### Actual Response (Development) - Non-existent Item

```json
{
  "items": [],
  "total_price": 0,
  "user_uuid": "6fa47853-a440-4a84-9bf6-7829d1ffae45"
}
```

## Test Implementation

The bug is verified using the following test case:

```typescript
it("should return 404 when removing non-existent item", async () => {
  const { removeFromCart } = await createTestContext();
  const response = await removeFromCart(userUuid, gameUuid);

  expect(response.status).toBe(404);
  expect(response.data).toMatchObject({
    code: 404,
    message: `Could not find cart_item with "uuid": ${gameUuid}`,
  });
});
```

## Verification Results

- ✅ Tests pass in Production environment
- ❌ Tests fail in Development environment
- 🔄 Issue is consistently reproducible

## Additional Notes

- The API returns different status codes between environments
- Development environment doesn't properly validate item existence
- Cart total calculation remains consistent for existing items
- The issue is specific to task ID `api-14`
- Successful item removal works correctly in both environments

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-14.test

# Run in production environment to verify correct behavior
pnpm test:prod api-14.test
```

## Bug Impact

This bug affects:

- Error handling consistency
- Cart item validation
- Frontend error displays
- User feedback for invalid operations
- Cart state management
- Error handling flows

## Possible Investigation Points

1. Item existence validation logic
2. Error handling middleware
3. Cart item removal service
4. Response transformation layer
5. Cart state management
6. Error response formatting
