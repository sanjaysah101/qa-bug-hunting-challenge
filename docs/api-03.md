# API-3: User Creation Bug Report

## Bug Description

When creating a new user through the `/users` endpoint with task ID `api-3`, the development environment incorrectly returns an empty nickname field despite providing a valid nickname in the request.

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-3
- **Endpoint**: POST /users
- **HTTP Method**: POST

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:your.email@example.com`
- Task ID Header: `X-Task-Id: api-3`

## Steps to Reproduce

1. Set up test environment with proper authentication
2. Send POST request to `/users` with the following payload:

```json
{
  "email": "sanjay87520@gmail.com",
  "password": "password123",
  "name": "sanjay",
  "nickname": "sanjay"
}
```

## Expected vs Actual Behavior

### Expected Response (Production)

```json
{
  "email": "sanjay87520@gmail.com",
  "name": "sanjay",
  "nickname": "sanjay",
  "avatar_url": "",
  "uuid": "<dynamic-uuid>"
}
```

### Actual Response (Development)

```json
{
  "email": "sanjay87520@gmail.com",
  "name": "sanjay",
  "nickname": "",
  "avatar_url": "",
  "uuid": "<dynamic-uuid>"
}
```

**Note:** In both environments, avatar_url is an empty string.

## Test Implementation

The bug is verified using the following test case:

```typescript
it("should create a new user", async () => {
  const { createUser } = await createTestContext();
  const response = await createUser(VALID_USER);
  expect(response.status).toBe(200);
  expect(response.data).toMatchObject({
    email: VALID_USER.email,
    name: VALID_USER.name,
    nickname: VALID_USER.nickname,
    avatar_url: "",
    uuid: expect.any(String),
  });
});
```

## Verification Results

- ✅ Test passes in Production environment
- ❌ Test fails in Development environment
- 🔄 Issue is consistently reproducible

## Test Evidence

```diff
Expected  - 1
Received  + 1

Object {
  "avatar_url": "",
  "email": "sanjay87520@gmail.com",
  "name": "sanjay",
-  "nickname": "sanjay",
+  "nickname": "",
  "uuid": Any<String>,
}
```

## Additional Notes

- The bug only affects the nickname field; all other fields are correctly populated
- The API returns a 200 status code, indicating the request was successful
- This issue is specific to task ID `api-3`
- The bug demonstrates a clear difference between development and production environments

## Related Files

- Test Implementation: `src/__test__/api/tasks/api-3.test.ts`
- Test Helpers: `src/utils/test-helpers.ts`
- Environment Config: `src/config/environment.ts`

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-03.test

# Run in production environment to verify correct behavior
pnpm test:prod api-03.test
```

## Bug Impact

This bug could affect any frontend applications or services that rely on the nickname field being populated correctly, potentially causing display issues or validation problems in dependent systems.
