# Vehicle Fleet Parking Management

A TypeScript learning project for modeling a vehicle fleet with BDD, DDD, and CQRS ideas.

The behavior is described first with Gherkin scenarios in `features/*.feature`, then implemented through thin Cucumber step definitions, a scenario `World`, application command/query handlers, an in-memory repository, and a small domain model.

This first version deliberately avoids database persistence. Storage is handled by `InMemoryFleetRepository` so the use cases and domain rules can be designed before introducing a real database.

## What The App Models

Current behavior:

- create a fleet for a user
- register a vehicle in a fleet
- prevent registering the same vehicle twice in the same fleet
- allow the same vehicle to belong to another fleet
- park a registered vehicle at a location
- prevent parking a vehicle twice at the same location
- retrieve the current location of a vehicle

Feature files:

- `features/register_vehicle.feature`
- `features/park_vehicle.feature`

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
src/Infra/                     # In-memory repository implementation
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

## Commands

Run all Cucumber scenarios:

```sh
npm test
```

Run critical scenarios only:

```sh
npm run test:critical
```

Run the TypeScript compiler without emitting files:

```sh
npm run typecheck
```

Useful Cucumber output formats:

```sh
# readable scenario-by-scenario CLI output
npx cucumber-js --format pretty

# progress bar in the terminal
npx cucumber-js --format progress-bar

# HTML report
npx cucumber-js --format html:reports/cucumber.html

# CI-friendly JUnit output
npx cucumber-js --format junit:reports/cucumber.xml

# see which step definitions are used
npx cucumber-js --dry-run --format usage

# print failing scenario locations for re-runs
npx cucumber-js --format rerun:reports/rerun.txt
```

## Test Results

<img width="600" alt="image" src="https://github.com/user-attachments/assets/5dab0057-5bf3-4d21-b7cd-b7a9befddd94" />
