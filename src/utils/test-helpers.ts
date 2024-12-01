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
