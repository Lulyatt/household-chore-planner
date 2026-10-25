import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import {
  getChoreDefinitionForHousehold,
  listChoreDefinitionsForHousehold,
} from "./definitionQueries";

export {
  getChoreDefinitionForHousehold,
  listChoreDefinitionsForHousehold,
} from "./definitionQueries";

/** Lists chore definitions for the signed-in user's household. */
export async function listChoreDefinitionsForCurrentHousehold() {
  const { householdId } = await requireHouseholdSessionContext();
  return listChoreDefinitionsForHousehold(householdId);
}

/** Loads one chore definition when it belongs to the current household. */
export async function getChoreDefinitionForCurrentHousehold(id: string) {
  const { householdId } = await requireHouseholdSessionContext();
  return getChoreDefinitionForHousehold(id, householdId);
}
