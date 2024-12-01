if (process.env.ENVIRONMENT === undefined) {
  process.env.ENVIRONMENT = "dev";
}

// Validate environment
if (!["dev", "prod"].includes(process.env.ENVIRONMENT)) {
  throw new Error(`Invalid environment: ${process.env.ENVIRONMENT}`);
}
