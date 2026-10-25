/**
 * Global suggested chore templates (#10). Not stored per household until copied (#12).
 * Product owners: edit this list — see `_docs/suggested-chore-templates.md`.
 */
export type SuggestedChoreTemplate = {
  /** Stable identifier; copied to `ChoreDefinition.suggestedTemplateKey` when source is FROM_SUGGESTED_TEMPLATE. */
  key: string;
  title: string;
  description: string;
};

export const SUGGESTED_CHORE_TEMPLATES = [
  {
    key: "trash",
    title: "Take out trash",
    description:
      "Empty indoor bins and take bags to the outdoor collection point on pickup day.",
  },
  {
    key: "take-out-bins",
    title: "Take out bins",
    description:
      "Wheel recycling and rubbish bins to the curb the evening before collection.",
  },
  {
    key: "vacuum-common-areas",
    title: "Vacuum common areas",
    description:
      "Vacuum hallways, living room, and other shared floors; spot-clean high-traffic spots.",
  },
  {
    key: "wash-dishes",
    title: "Wash dishes",
    description:
      "Wash, dry, and put away dishes from the sink and dishwasher so the kitchen stays clear.",
  },
  {
    key: "clean-bathroom",
    title: "Clean bathroom",
    description:
      "Wipe surfaces, clean the mirror and sink, and refresh towels in the shared bathroom.",
  },
  {
    key: "laundry",
    title: "Do laundry",
    description:
      "Wash, dry, fold, and put away a load of shared household laundry.",
  },
] as const satisfies readonly SuggestedChoreTemplate[];

export type SuggestedChoreTemplateKey =
  (typeof SUGGESTED_CHORE_TEMPLATES)[number]["key"];
