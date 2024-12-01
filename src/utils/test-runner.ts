/* eslint-disable no-console */
import { AxiosInstance, AxiosResponse } from "axios";

import { devClient, prodClient } from "./api-client";

const getClient = () => {
  return process.env.ENVIRONMENT === "prod" ? prodClient : devClient;
};

export const runTest = async (taskId: string, testFn: (client: AxiosInstance) => Promise<void>) => {
  try {
    const client = getClient();
    client.defaults.validateStatus = (status: number) => status < 500;

    const env = process.env.ENVIRONMENT === "prod" ? "PROD" : "DEV";
    console.log(`Running ${env} test for task ${taskId}`);
    await testFn(client);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error in ${process.env.ENVIRONMENT} environment:`, error.message);
    }
    throw error;
  }
};

export const getResponseData = (response: AxiosResponse) => ({
  status: response.status,
  data: response.data,
  headers: response.headers,
});
