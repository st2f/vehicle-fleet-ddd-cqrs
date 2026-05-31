import { When } from "@cucumber/cucumber";
import { FleetWorld } from "../support/world";

When("the fleet repository is reloaded", async function (this: FleetWorld) {
  await this.reloadRepository();
});
