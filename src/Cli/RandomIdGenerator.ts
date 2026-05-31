import { randomUUID } from "node:crypto";
import { IdGenerator } from "../App/Ports/IdGenerator";

export class RandomIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
