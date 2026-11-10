import { prisma } from "@/lib/prisma";

// Returns the singleton settings row, creating it on first access.
export async function getSettings() {
  return prisma.setting.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
  });
}

export async function isPhotosEnabled(): Promise<boolean> {
  const s = await getSettings();
  return s.photosEnabled;
}
