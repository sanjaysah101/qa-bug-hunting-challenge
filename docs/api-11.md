# API-11: Avatar URL Domain Mismatch Bug Report

## Bug Description

When updating a user's avatar through the `/users/:user_uuid/avatar` endpoint with task ID `api-11`, the development environment returns an incorrect avatar URL domain (`qa-playground.com`) instead of the expected Gravatar domain (`gravatar.com`).

## Environment Details

- **Development URL**: <https://dev-gs.qa-playground.com/api/v1>
- **Production URL**: <https://release-gs.qa-playground.com/api/v1>
- **Task ID**: api-11
- **Endpoint**: PUT /users/:user_uuid/avatar
- **HTTP Method**: PUT

## Authentication Requirements

All requests require:

- Bearer Token: `Bearer qahack2024:sanjay11@example.com`
- Task ID Header: `X-Task-Id: api-11`

## Steps to Reproduce

1. Create a new user
2. Upload an avatar image using FormData with the field name "avatar_file"
3. Verify the response avatar_url domain

## Expected vs Actual Behavior

### Expected Response (Production)

```json
{
  "avatar_url": "https://gravatar.com/avatar/7cc8298803ee47399132670680da7885?f=y",
  "email": "UnTs@HeJaWCh2W3es.ZHd",
  "name": "HnIX6YRDd3",
  "nickname": "dm+.a6Ussd",
  "uuid": "5d72217a-07a5-496a-ac65-b64402907b40"
}
```

### Actual Response (Development)

```json
{
  "avatar_url": "https://qa-playground.com/avatar/6a5a14b7e43f3a75826e1cf84d89c275?f=y",
  "email": "UnTs@HeJaWCh2W3es.ZHd",
  "name": "HnIX6YRDd3",
  "nickname": "dm+.a6Ussd",
  "uuid": "ee0c406d-9bd9-4303-a625-5450471dae94"
}
```

## Test Implementation

The bug is verified using the following test case:

```typescript
it("should successfully update user avatar", async () => {
  const { updateAvatar, getTestImageBuffer } = await createTestContext();
  const imageBuffer = getTestImageBuffer();
  const response = await updateAvatar(userUuid, imageBuffer);

  expect(response.status).toBe(200);
  expect(response.data).toMatchObject({
    email: VALID_USER.email,
    name: VALID_USER.name,
    nickname: VALID_USER.nickname,
    uuid: userUuid,
    avatar_url: expect.stringMatching(/^https:\/\/gravatar\.com\/avatar\/.+\?f=y$/),
  });
});
```

## Verification Results

- ✅ Test passes in Production environment
- ❌ Test fails in Development environment
- 🔄 Issue is consistently reproducible

## Test Evidence

```diff
Expected avatar URL to match:
- https://gravatar.com/avatar/[hash]?f=y
+ https://qa-playground.com/avatar/[hash]?f=y

Object {
  "avatar_url":
-   "https://gravatar.com/avatar/7cc8298803ee47399132670680da7885?f=y",
+   "https://qa-playground.com/avatar/6a5a14b7e43f3a75826e1cf84d89c275?f=y",
  "email": "UnTs@HeJaWCh2W3es.ZHd",
  "name": "HnIX6YRDd3",
  "nickname": "dm+.a6Ussd",
  "uuid": expect.any(String)
}
```

## Additional Notes

- The avatar upload functionality works in both environments
- The only difference is the domain and path structure of the avatar URL
- Development environment uses `qa-playground.com/avatar/`
- Production environment uses `gravatar.com/avatar/`
- This affects avatar display consistency across environments

## Related Files

- Test Implementation: `src/__test__/api/tasks/api-11.test.ts`
- Test Helpers: `src/utils/test-helpers.ts`
- Environment Config: `src/config/environment.ts`

## Running the Test

```bash
# Run in development environment to see the bug
pnpm test:dev api-11.test

# Run in production environment to verify correct behavior
pnpm test:prod api-11.test
```

## Bug Impact

This bug affects:

- Visual consistency between environments
- Integration with Gravatar service
- Frontend applications expecting Gravatar URLs
- User avatar display across different environments

## Possible Investigation Points

1. Avatar service configuration in development environment
2. Gravatar integration settings
3. Environment-specific URL generation logic
4. CDN or storage service configuration
5. Avatar processing middleware
