# QA Hack Challenge Submission

## Project Overview

This project contains automated API tests for the QA Hack challenge (<https://qahack.net/>). The test suite validates API endpoints across both development and production environments.

## Environment Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file with:

   ```env
   DEV_API_URL=https://dev-gs.qa-playground.com/api/v1
   PROD_API_URL=https://release-gs.qa-playground.com/api/v1
   ```

## Test Structure

- `src/__test__/dev/` - Development environment tests
- `src/__test__/prod/` - Production environment tests
- `src/utils/` - Test helpers and utilities

## Running Tests

- Development environment: `pnpm test:dev`
- Production environment: `pnpm test:prod`
- All environments: `pnpm test:all`

## Test Coverage

Generate coverage report:

```bash
pnpm test:coverage
```

## API Authentication

Tests require proper authentication headers:

- Bearer Token Format: `Bearer qahack2024:your.email@example.com`
- Task ID Header: `X-Task-Id: api-2`

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Submit a pull request

## Quality Checks

- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- Husky for pre-commit hooks
