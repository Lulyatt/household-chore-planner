import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const household = await prisma.household.create({
    data: {
      name: "Sample Household",
      members: {
        create: [{ name: "Alex Kim" }, { name: "Jordan Lee" }],
      },
      choreDefinitions: {
        create: [
          {
            title: "Wash dishes",
            description: "Evening cleanup after dinner",
            source: "CUSTOM",
          },
        ],
      },
    },
    include: { members: true, choreDefinitions: true },
  });

  const definition = household.choreDefinitions[0]!;
  const alex = household.members.find((m) => m.name === "Alex Kim")!;

  await prisma.choreOccurrence.create({
    data: {
      choreDefinitionId: definition.id,
      householdId: household.id,
      dueDate: new Date("2026-10-24"),
      status: "COMPLETED",
      assigneeId: alex.id,
      completion: {
        create: {
          note: "Scrubbed pots and loaded the dishwasher",
          completedByMemberId: alex.id,
        },
      },
    },
  });

  await prisma.choreOccurrence.create({
    data: {
      choreDefinitionId: definition.id,
      householdId: household.id,
      dueDate: new Date("2026-10-25"),
      status: "PENDING",
      assigneeId: alex.id,
    },
  });

  console.log(
    `Seeded household "${household.name}" (${household.id}) with ${household.members.length} members, ${household.choreDefinitions.length} chore definition(s), and sample occurrence(s).`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
