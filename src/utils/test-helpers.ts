import { AxiosResponse } from "axios";

export const expectUnauthorizedResponse = (response: AxiosResponse) => {
  expect(response.status).toBe(401);
  expect(response.data).toMatchObject({
    code: 401,
    message: 'security requirements failed: authentication failed, please set correct "Bearer" header',
  });
};

export const expectMissingTaskIdResponse = (response: AxiosResponse) => {
  expect(response.status).toBe(404);
  expect(response.data).toMatchObject({
    code: 404,
    message:
      'Could not find backlog task with "taskId": . Please set taskId of your current backlog task to "X-Task-Id" header',
  });
};

export const expectEmailValidationError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/NewUser: Error at "/email": minimum string length is 5',
  });
};

export const expectMissingEmailError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/NewUser: Error at "/email": property "email" is missing',
  });
};

export const expectMissingEmailErrorForLogin = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/Login: Error at "/email": property "email" is missing',
  });
};

export const expectInvalidEmailFormatError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/NewUser: Error at "/email": string doesn\'t match the regular expression "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"',
  });
};

export const expectMissingRequestBodyError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message: "request body has an error: value is required but missing",
  });
};

export const expectMissingPasswordError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/NewUser: Error at "/password": property "password" is missing',
  });
};

export const expectMissingPasswordErrorForLogin = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/Login: Error at "/password": property "password" is missing',
  });
};

export const expectMissingNameError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/NewUser: Error at "/name": property "name" is missing',
  });
};

export const expectMissingNicknameError = (response: AxiosResponse) => {
  expect(response.status).toBe(400);
  expect(response.data).toMatchObject({
    code: 400,
    message:
      'request body has an error: doesn\'t match schema #/components/schemas/NewUser: Error at "/nickname": property "nickname" is missing',
  });
};

export const expectDuplicateEmailError = (response: AxiosResponse, email: string) => {
  expect(response.status).toBe(409);
  expect(response.data).toMatchObject({
    code: 409,
    message: `User with the following "email" already exists: ${email}`,
  });
};
