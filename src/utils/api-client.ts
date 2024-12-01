import axios from "axios";

import { config } from "@/config/environment";

export const devClient = axios.create({
  baseURL: config.dev.apiUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const prodClient = axios.create({
  baseURL: config.prod.apiUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});
