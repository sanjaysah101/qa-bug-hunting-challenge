import dotenv from "dotenv";

dotenv.config();

export const config = {
  dev: {
    apiUrl: process.env.DEV_API_URL,
  },
  prod: {
    apiUrl: process.env.PROD_API_URL,
  },
};
