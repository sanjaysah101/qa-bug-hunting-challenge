# API-21: User Listing Meta Information Bug Report

## Bug Description

When retrieving the list of users through the `/users` endpoint with task ID `api-21`, the meta information in the development environment shows incorrect total count. Specifically, the `meta.total` field returns 0 even when users are present in the response.

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-21
- **Endpoint**: GET /users
- **HTTP Method**: GET

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay.sah@example.com`
- Task ID Header: `X-Task-Id: api-21`

## Steps to Reproduce

1. Set up test environment with proper authentication
2. Send GET request to `/users` endpoint
3. Check the `meta.total` field in the response

## Expected vs Actual Behavior

### Expected Response (Production)

```json
{
  "meta": {
    "total": 11 // Non-zero when users exist
  },
  "users": [
    // ... array of user objects
  ]
}
```

### Actual Response (Development)

```json
{
  "meta": {
    "total": 0 // Always zero even when users exist
  },
  "users": [
    // ... array of user objects
  ]
}
```

## Test Implementation

The bug is verified using the following test case:

```typescript
it("should return non-zero total count", async () => {
  const { getUsers } = await createTestContext();
  const response = await getUsers();

  expect(response.status).toBe(200);
  if (response.data.users.length > 0) expect(response.data.meta.total).toBeGreaterThan(0);
});
```

## Verification Results

- ✅ Test passes in Production environment
- ❌ Test fails in Development environment
- 🔄 Issue is consistently reproducible

## Test Evidence

```diff
Expected: > 0
Received:   0

  expect(received).toBeGreaterThan(expected)
```

## Additional Notes

- The API returns a 200 status code in both environments
- The bug only affects the meta.total count
- User data is still returned correctly in the response
- This issue is specific to task ID `api-21`
- The bug demonstrates a clear difference between development and production environments

## Related Files

- Test Implementation: `src/__test__/api/tasks/api-21.test.ts`
- Test Helpers: `src/utils/test-helpers.ts`
- Environment Config: `src/config/environment.ts`

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-21.test

# Run in production environment to verify correct behavior
pnpm test:prod api-21.test
```

## Bug Impact

This bug could affect:

- Frontend pagination implementations
- Total user count displays
- Data consistency checks
- UI components that rely on total count for rendering
- Progress indicators or loading states
- Resource allocation based on user counts

## Possible Investigation Points

1. Meta information calculation in development environment
2. Database query for total count
3. Response transformation middleware
4. Environment-specific configuration differences
5. Caching layer implementation
