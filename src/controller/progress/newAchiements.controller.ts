import { prisma } from "../../utils/prisma";

export async function saveAchievements(userId: number, achievements: any[]) {
  let newAchievementCount = 0;

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { userId_achId: { userId, achId: ach.id } }, // unique constraint шаардлагатай
      update: { title: ach.title, desc: ach.desc }, // Хэрвээ байгаа бол update
      create: { userId, achId: ach.id, title: ach.title, desc: ach.desc }, // Байхгүй бол create
    });

    newAchievementCount++;
  }

  if (newAchievementCount > 0) {
    await prisma.progress.upsert({
      where: { userId },
      update: {
        points: { increment: newAchievementCount * 10 }, // жишээ: нэг achievement = 10 point
        streakCount: { increment: newAchievementCount }, // нэгээр нэмнэ
      },
      create: {
        userId,
        points: newAchievementCount * 10,
        streakCount: newAchievementCount,
      },
    });
  }
}
