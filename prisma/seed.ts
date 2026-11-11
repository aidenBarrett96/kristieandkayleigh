import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// A couple of sample invitations so you can click around immediately.
async function main() {
  await prisma.guest.upsert({
    where: { token: "smith-family-demo01" },
    update: {},
    create: {
      token: "smith-family-demo01",
      name: "The Smith Family",
      email: "smith@example.com",
      maxPartySize: 4,
    },
  });

  await prisma.guest.upsert({
    where: { token: "jordan-lee-demo02" },
    update: {},
    create: {
      token: "jordan-lee-demo02",
      name: "Jordan Lee",
      maxPartySize: 2,
    },
  });

  console.log("Seeded sample invitations:");
  console.log("  /rsvp/smith-family-demo01");
  console.log("  /rsvp/jordan-lee-demo02");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
