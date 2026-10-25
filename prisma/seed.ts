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

  console.log(
    `Seeded household "${household.name}" (${household.id}) with ${household.members.length} members and ${household.choreDefinitions.length} chore definition(s).`,
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
