# Vehicle Fleet Parking Management

A TypeScript learning project for modeling a vehicle fleet with BDD, DDD, and CQRS ideas.

The project was built in two steps:

1. First, the behavior was described with Gherkin scenarios and implemented
   with an in-memory repository for fast feedback.
2. Then, PostgreSQL persistence was added for the CLI.

The Cucumber scenarios use `InMemoryFleetRepository`. PostgreSQL lives behind
the same repository port in `PostgresFleetRepository`, so the application code
stays the same while the infrastructure changes.

## Current Features

- create fleets and register vehicles
- localize vehicles and retrieve their current location
- prevent duplicate vehicle registration and duplicate parking positions

## Project Shape

The application layer orchestrates use cases while business rules remain inside the domain model.

```text
features/
  *.feature                    # Business behavior written in Gherkin
  step_definitions/            # Cucumber sentence-to-code adapters
  support/world.ts             # Scenario state and test wiring

src/App/
  Commands/                    # Write use cases
  Queries/                     # Read use cases
  Ports/                       # Interfaces used by the application layer

src/Domain/                    # Fleet, Vehicle, Location, domain errors
src/Infra/                     # In-memory and PostgreSQL repository implementations
src/Cli/                       # Command line entrypoint and argument parsing
```

The flow of a scenario is:

```text
Gherkin scenario
-> step definition
-> FleetWorld helper
-> command/query handler
-> repository port
-> domain model
```

## Implementation Example

Start from a behavior scenario:

```cucumber
Scenario: I can register a vehicle
  Given my fleet
  And a vehicle
  When I register this vehicle into my fleet
  Then this vehicle should be part of my vehicle fleet
```

Write a step definition that keeps the business sentence readable:

```ts
When(
  "I register this vehicle into my fleet",
  async function (this: FleetWorld) {
    await this.registerVehicleIntoMyFleet();
  },
);
```

Then let `FleetWorld` become the scenario context and test wiring:

```ts
export class FleetWorld extends World {
  async registerVehicleIntoMyFleet(): Promise<void> {
    await this.registerVehicleHandler.handle({
      fleetId: this.myFleetId,
      vehiclePlateNumber: this.vehiclePlateNumber,
    });
  }
}
```

At that point, the failing test or compiler errors guide the next missing pieces:

```text
no RegisterVehicleCommand type
no RegisterVehicleHandler
no FleetRepository port
no InMemoryFleetRepository
no Fleet.register(vehicle)
no HasVehicleHandler
```

Add each piece only when the current behavior needs it, make the scenario pass, then refactor names and boundaries while the test stays green.

---

Example pressure from the first scenario:

```text
Scenario needs: "I register this vehicle into my fleet"
Step needs: registerVehicleIntoMyFleet()
World needs: a way to execute the use case
Use case needs: RegisterVehicleHandler.handle(command)
Handler needs: load fleet, register vehicle, save fleet
Domain needs: Fleet.register(vehicle)
Assertion needs: HasVehicleHandler.handle(query)
```

## Development Flow

### Step 1: In-memory behavior

Run the default Cucumber scenarios:

```sh
npm test
```

These tests use `InMemoryFleetRepository`, which keeps the feedback loop fast
and does not require Docker or a database.

Useful variants:

```sh
# run critical scenarios only
npm run test:critical

# run the TypeScript compiler without emitting files
npm run typecheck
```

Useful Cucumber output formats:

```sh
# readable scenario-by-scenario CLI output
npx cucumber-js --format pretty

# HTML report
npx cucumber-js --format html:reports/cucumber.html
```

<img width="600" alt="In-memory-DB test results" src="https://github.com/user-attachments/assets/5dab0057-5bf3-4d21-b7cd-b7a9befddd94" />

### Step 2: PostgreSQL persistence

PostgreSQL persistence is used by the CLI for real local data.

#### CLI persistence

The CLI supports these commands:

```sh
./fleet create <userId>
./fleet register-vehicle <fleetId> <vehiclePlateNumber>
./fleet localize-vehicle <fleetId> <vehiclePlateNumber> lat lng [alt]
```

Without database configuration, each CLI invocation uses a fresh in-memory
repository. That is useful for exercising a single command, but data will not be
shared between separate `./fleet` calls.

To make CLI data persistent, create a local `.env` from `.env.example` and start
the local PostgreSQL database:

```sh
cp .env.example .env
npm run db:up
```

Then data created by one command can be reused by the next command:

```sh
fleetId=$(./fleet create user-1)
./fleet register-vehicle "$fleetId" AA-123-BB
./fleet localize-vehicle "$fleetId" AA-123-BB 48.8566 2.3522
```

Stop the local database when you are done:

```sh
npm run db:down
```

<img width="1328" height="1128" alt="CLI terminal examples" src="https://github.com/user-attachments/assets/b2b87249-0ada-415d-96c6-68c3178041c2" />

You can also set `DATABASE_URL` directly to target another local or remote
PostgreSQL database.
