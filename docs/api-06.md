# API-6: User Listing Pagination Bug Report

## Bug Description

When retrieving the list of users through the `/users` endpoint with task ID `api-6`, the pagination functionality is not working correctly in the development environment. Specifically:

1. The offset parameter is not respected, causing the same users to be returned regardless of offset
2. Large offset values don't return empty arrays as expected
3. The development environment returns all users instead of respecting pagination parameters

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-6
- **Endpoint**: GET /users
- **HTTP Method**: GET

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay.sah@example.com`
- Task ID Header: `X-Task-Id: api-6`

## Steps to Reproduce

1. Set up test environment with proper authentication
2. Send GET request to `/users` endpoint with offset=2 and limit=2
3. Compare results between development and production environments

## Expected vs Actual Behavior

### Expected Behavior (Production)

- Different users are returned when using offset
- Empty array is returned when offset exceeds total users
- Pagination parameters (offset, limit) are respected

### Actual Behavior (Development)

- Same users are returned regardless of offset value
- Large offset values (e.g., 1000) still return all users
- Pagination parameters are ignored, returning full dataset

## Test Implementation

The bug is verified using the following test cases:

```typescript
describe("Pagination Tests", () => {
  it("should return different users when using offset", async () => {
    const { getUsersWithPagination } = await createTestContext();
    const limit = 2;
    // Get first page
    const firstPage = await getUsersWithPagination(0, limit);
    // Get second page
    const secondPage = await getUsersWithPagination(limit, limit);
    // Verify we got different users
    const firstPageEmails = firstPage.data.users.map((user) => user.email);
    const secondPageEmails = secondPage.data.users.map((user) => user.email);
    // Check for no overlap between pages
    const hasOverlap = firstPageEmails.some((email) => secondPageEmails.includes(email));
    expect(hasOverlap).toBe(false);
  });

  it("should return empty array when offset exceeds total users", async () => {
    const { getUsersWithPagination } = await createTestContext();
    const response = await getUsersWithPagination(1000, 10);
    expect(response.status).toBe(200);
    expect(response.data.users).toHaveLength(0);
  });
});
```

## Verification Results

- ✅ Tests pass in Production environment
- ❌ Tests fail in Development environment
- 🔄 Issue is consistently reproducible

## Test Evidence

### Test Failure 1: Offset Not Respected

```diff
Expected: false
Received: true

  expect(received).toBe(expected)

  Expected no overlap between pages, but same users were returned
    at Object.<anonymous> (src/__test__/api/tasks/api-6.test.ts:91:26)
```

### Test Failure 2: Large Offset Returns All Users

```diff
Expected length: 0
Received length: 10
Received array: [
  {
    "email": "alex@gmail.com",
    "name": "Alex",
    ...
  },
  // ... 9 more users
]
```

## Additional Notes

- The API returns a 200 status code in both environments
- All user objects have valid structures
- Basic validation (zero limit, negative offset) works correctly
- The issue specifically affects pagination functionality
- Total count remains consistent across pages

## Related Files

- Test Implementation: `src/__test__/api/tasks/api-6.test.ts`
- Test Helpers: `src/utils/test-helpers.ts`
- Sample Data: `user.json`

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-06.test

# Run in production environment to verify behavior
pnpm test:prod api-06.test
```

## Bug Impact

This bug could affect:

- Frontend pagination implementations
- Data consistency checks
- User count displays
- API response time due to unnecessary data transfer
- Mobile app performance due to large response payloads
- Backend resource utilization

## Possible Investigation Points

1. Pagination query implementation in development environment
2. Database query optimization
3. Middleware that might be modifying the response
4. Environment-specific configuration differences
5. Cache layer consistency
