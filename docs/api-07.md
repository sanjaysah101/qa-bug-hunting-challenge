# API-7: User Login Bug Report

## Bug Description

When attempting to login with valid credentials through the `/users/login` endpoint with task ID `api-7`, the development environment incorrectly returns a 404 error even after successfully creating the user.

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-7
- **Endpoint**: POST /users/login
- **HTTP Method**: POST

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay7@example.com`
- Task ID Header: `X-Task-Id: api-7`

## Steps to Reproduce

1. Create a new user with the following credentials:

```json
{
  "email": "sanjay7@example.com",
  "password": "password123",
  "name": "sanjay",
  "nickname": "sanjay"
}
```

2. Attempt to login with the same credentials:

```json
{
  "email": "sanjay7@example.com",
  "password": "password123"
}
```

## Expected vs Actual Behavior

### Expected Response (Production)

```json
{
  "avatar_url": "",
  "email": "sanjay7@example.com",
  "name": "sanjay",
  "nickname": "sanjay",
  "uuid": "635e5a86-19be-4501-8ee7-160c67cc4688"
}
```

### Actual Response (Development)

```json
{
  "code": 404,
  "message": "Could not find user with given credentials"
}
```

## Test Implementation

The bug is verified using the following test case:

```typescript
it("should successfully login with valid credentials", async () => {
  const { loginUser, createUser } = await createTestContext();

  const newUserResponse = await createUser(VALID_CREDENTIALS);
  expect(newUserResponse.status).toBe(200);

  const response = await loginUser(VALID_CREDENTIALS);
  expect(response.status).toBe(200);
  expect(response.data).toMatchObject({
    email: VALID_CREDENTIALS.email,
    name: VALID_CREDENTIALS.name,
    nickname: VALID_CREDENTIALS.nickname,
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
Expected: 200
Received: 404

  expect(received).toBe(expected)

Console logs show:
- User creation successful:
+ {
+   "avatar_url": "",
+   "email": "sanjay7@example.com",
+   "name": "sanjay",
+   "nickname": "sanjay",
+   "uuid": "8cca5f5c-b2ff-47f6-bed9-58fbc972594f"
+ }

- Login attempt failed:
+ {
+   "code": 404,
+   "message": "Could not find user with given credentials"
+ }
```

## Additional Notes

- User creation works successfully in both environments
- All validation tests (missing email, password, etc.) pass in both environments
- The issue only occurs during login attempts in the development environment
- The bug demonstrates a clear difference between development and production environments

## Related Files

- Test Implementation: `src/__test__/api/tasks/api-07.test.ts`
- Test Helpers: `src/utils/test-helpers.ts`
- Environment Config: `src/config/environment.ts`

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-07.test

# Run in production environment to verify correct behavior
pnpm test:prod api-07.test
```

## Bug Impact

This bug prevents:

- User authentication in development environment
- Testing of features requiring authentication
- Development of user-specific functionality
- Integration testing workflows

## Possible Investigation Points

1. Authentication service in development environment
2. Password hashing/comparison implementation
3. User data persistence between creation and login
4. Database connectivity issues
5. Environment-specific configuration differences
