import { Given } from "@cucumber/cucumber";
import { FleetWorld } from "../support/world";

Given("my fleet", async function (this: FleetWorld) {
  await this.createMyFleet();
});

Given("a vehicle", function (this: FleetWorld) {
  this.createVehicle();
});

Given("the fleet of another user", async function (this: FleetWorld) {
  await this.createOtherFleet();
});

Given("a location", function (this: FleetWorld) {
  this.createLocation();
});

Given(
  "I have registered this vehicle into my fleet",
  async function (this: FleetWorld) {
    await this.registerVehicleIntoMyFleet();
  },
);

Given(
  "this vehicle has been registered into the other user's fleet",
  async function (this: FleetWorld) {
    await this.registerVehicleIntoOtherFleet();
  },
);

Given(
  "my vehicle has been parked into this location",
  async function (this: FleetWorld) {
    await this.parkMyVehicleAtLocation();
  },
);
