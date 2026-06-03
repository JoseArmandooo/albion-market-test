// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default user settings
  await prisma.userSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      marketFee: 0.025,
      premiumFee: 0.0,
      minRoi: 5,
      minProfit: 10000,
      soundAlerts: true,
      autoRefresh: true,
      refreshInterval: 60,
    },
  });

  console.log("Default settings created");

  // Create sample alerts for testing
  const alerts = [
    {
      itemId: "T8_MAIN_SWORD",
      itemName: "T8 Carving Sword",
      city: "Caerleon",
      alertType: "ROI" as const,
      threshold: 25,
    },
    {
      itemId: "T7_2H_BOW",
      itemName: "T7 Longbow",
      city: "Bridgewatch",
      alertType: "PROFIT" as const,
      threshold: 500000,
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.upsert({
      where: { id: `seed-${alert.itemId}-${alert.city}` },
      update: {},
      create: {
        id: `seed-${alert.itemId}-${alert.city}`,
        ...alert,
      },
    });
  }

  console.log("Sample alerts created");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
