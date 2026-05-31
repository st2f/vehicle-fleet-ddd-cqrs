import "dotenv/config";
import { FleetCli, CliUsageError } from "./FleetCli";
import { PostgresFleetRepository } from "../Infra/PostgresFleetRepository";

async function main(): Promise<void> {
  const databaseUrl = databaseUrlFromEnv();
  const postgresRepository =
    databaseUrl === undefined
      ? undefined
      : new PostgresFleetRepository(databaseUrl);

  try {
    if (postgresRepository !== undefined) {
      await postgresRepository.migrate();
    }

    await new FleetCli(postgresRepository).run(process.argv.slice(2));
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }

    process.exitCode = error instanceof CliUsageError ? 64 : 1;
  } finally {
    await postgresRepository?.close();
  }
}

void main();

function databaseUrlFromEnv(): string | undefined {
  if (process.env.DATABASE_URL !== undefined) {
    return process.env.DATABASE_URL;
  }

  const database = process.env.POSTGRES_DB;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;

  if (
    database === undefined ||
    user === undefined ||
    password === undefined
  ) {
    return undefined;
  }

  const host = process.env.POSTGRES_HOST ?? "localhost";
  const port = process.env.POSTGRES_PORT ?? "5432";

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${host}:${port}/${encodeURIComponent(database)}`;
}
