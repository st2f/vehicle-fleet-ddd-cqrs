import { Then, When } from "@cucumber/cucumber";
import assert from "assert";
import { FleetWorld } from "../support/world";

When("I park my vehicle at this location", async function (this: FleetWorld) {
  await this.parkMyVehicleAtLocation();
});

When(
  "I try to park my vehicle at this location",
  async function (this: FleetWorld) {
    await this.tryToParkMyVehicleAtLocation();
  },
);

Then(
  "the known location of my vehicle should verify this location",
  async function (this: FleetWorld) {
    const currentLocation = await this.currentLocationOfMyVehicle();

    assert.ok(currentLocation?.equals(this.location!));
  },
);

Then(
  "I should be informed that my vehicle is already parked at this location",
  function (this: FleetWorld) {
    assert.ok(this.caughtError instanceof Error);
    assert.match(this.caughtError.message, /already parked at this location/);
  },
);
