import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import {
  getChoreDefinitionForHousehold,
  listChoreDefinitionsForHousehold,
} from "./definitionQueries";
import {
  listContributionSummaryForHousehold,
  listTodayAndOverdueOccurrencesForHousehold,
  listUpcomingOccurrencesForHousehold,
} from "./dashboardQueries";
import {
  listActiveOccurrencesForChoreDefinition,
  listHistoryOccurrencesForChoreDefinition,
} from "./historyQueries";
import { materializeRecurringOccurrencesForHousehold } from "./materializeRecurringOccurrences";

export {
  getChoreDefinitionForHousehold,
  listChoreDefinitionsForHousehold,
} from "./definitionQueries";

/** Lists chore definitions for the signed-in user's household. */
export async function listChoreDefinitionsForCurrentHousehold() {
  const { householdId } = await requireHouseholdSessionContext();
  await materializeRecurringOccurrencesForHousehold(householdId, {
    asOfDate: new Date(),
  });
  return listChoreDefinitionsForHousehold(householdId);
}

/** Loads one chore definition when it belongs to the current household. */
export async function getChoreDefinitionForCurrentHousehold(id: string) {
  const { householdId } = await requireHouseholdSessionContext();
  await materializeRecurringOccurrencesForHousehold(householdId, {
    asOfDate: new Date(),
  });
  return getChoreDefinitionForHousehold(id, householdId);
}

async function materializeForCurrentHousehold(asOfDate: Date) {
  const { householdId } = await requireHouseholdSessionContext();
  await materializeRecurringOccurrencesForHousehold(householdId, {
    asOfDate,
  });
  return householdId;
}

/** Dashboard widgets: today/overdue, upcoming, and contribution summary. */
export async function getDashboardDataForCurrentHousehold(
  asOfDate: Date = new Date(),
) {
  const householdId = await materializeForCurrentHousehold(asOfDate);
  const [todayAndOverdue, upcoming, contributions] = await Promise.all([
    listTodayAndOverdueOccurrencesForHousehold(householdId, asOfDate),
    listUpcomingOccurrencesForHousehold(householdId, asOfDate),
    listContributionSummaryForHousehold(householdId, asOfDate),
  ]);
  return { todayAndOverdue, upcoming, contributions, asOfDate };
}

/** Active and historical occurrences for chore detail (#26). */
export async function getChoreOccurrenceSectionsForCurrentHousehold(
  choreDefinitionId: string,
  asOfDate: Date = new Date(),
) {
  const householdId = await materializeForCurrentHousehold(asOfDate);
  const [active, history] = await Promise.all([
    listActiveOccurrencesForChoreDefinition(
      choreDefinitionId,
      householdId,
      asOfDate,
    ),
    listHistoryOccurrencesForChoreDefinition(
      choreDefinitionId,
      householdId,
      asOfDate,
    ),
  ]);
  return { active, history, householdId };
}
