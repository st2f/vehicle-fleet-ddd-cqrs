import { When, Then } from "@cucumber/cucumber";
import assert from "assert";
import { FleetWorld } from "../support/world";

When(
  "I register this vehicle into my fleet",
  async function (this: FleetWorld) {
    await this.registerVehicleIntoMyFleet();
  },
);

When(
  "I try to register this vehicle into my fleet",
  async function (this: FleetWorld) {
    await this.tryToRegisterVehicleIntoMyFleet();
  },
);

Then(
  "this vehicle should be part of my vehicle fleet",
  async function (this: FleetWorld) {
    assert.ok(await this.myFleetHasVehicle());
  },
);

Then(
  "I should be informed this vehicle has already been registered into my fleet",
  function (this: FleetWorld) {
    assert.ok(this.caughtError instanceof Error);
    assert.match(this.caughtError.message, /already registered/);
  },
);
