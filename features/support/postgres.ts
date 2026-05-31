import { After, Before } from "@cucumber/cucumber";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PostgresFleetRepository } from "../../src/Infra/PostgresFleetRepository";
import { FleetWorld } from "./world";

Before(
  { tags: "@postgres", timeout: 60_000 },
  async function (this: FleetWorld) {
    const container = await new PostgreSqlContainer(
      "postgres:16-alpine",
    ).start();
    const repositories: PostgresFleetRepository[] = [];

    // we need an initial repository and a second one for the reload test
    const createRepositoryConnection =
      async (): Promise<PostgresFleetRepository> => {
        const repository = await createRepository(container);
        repositories.push(repository);
        return repository;
      };
    const initialRepository = await createRepositoryConnection();

    this.useRepository(initialRepository, createRepositoryConnection);
    this.addCleanup(async () => {
      for (const repository of repositories.reverse()) {
        await repository.close();
      }

      await container.stop();
    });
  },
);

After(
  { tags: "@postgres", timeout: 60_000 },
  async function (this: FleetWorld) {
    await this.cleanup();
  },
);

async function createRepository(
  container: StartedPostgreSqlContainer,
): Promise<PostgresFleetRepository> {
  const repository = new PostgresFleetRepository(container.getConnectionUri());
  await repository.migrate();

  return repository;
}
