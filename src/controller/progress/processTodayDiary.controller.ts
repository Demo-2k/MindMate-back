import { prisma } from "../../utils/prisma";

export async function processTodayDiary(userId: number) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // 1️⃣ Өнөөдрийн diary-г шалгах
  const todayDiary = await prisma.diaryNote.findFirst({
    where: { userId, createdAt: { gte: startOfToday } },
    include: { aiInsight: true },
  });

  if (!todayDiary) return { diary: null, progress: null, achievements: [] }; // diary байхгүй бол юу ч хийхгүй


  let progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) {
    progress = await prisma.progress.create({
      data: { userId, streakCount: 0, points: 0 },
    });
  }

  // Өнөөдрийн diary
  type AchievementType = { id: string; title: string; desc: string };

  const todayAchievementsRaw = todayDiary.aiInsight?.achievements;
  const todayAchievements: AchievementType[] = Array.isArray(
    todayAchievementsRaw
  )
    ? todayAchievementsRaw.filter(
        (ach): ach is AchievementType =>
          ach !== null &&
          typeof ach === "object" &&
          "id" in ach &&
          "title" in ach &&
          "desc" in ach
      )
    : [];

  let newPoints = 0;
  for (const ach of todayAchievements) {
    const exists = await prisma.achievement.findUnique({
      where: { userId_achId: { userId, achId: ach.id } },
    });
    
    if (!exists) {
      await prisma.achievement.create({
        data: { userId, achId: ach.id, title: ach.title, desc: ach.desc },
      });
      newPoints += 5;
    }
  }

  // Өдрийн streak
  const todayDiaryExists = await prisma.diaryNote.findFirst({
    where: {
      userId,
      createdAt: {
        gte: startOfToday, // өнөөдрийн diary
        lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000), // зөвхөн өнөөдөр
      },
    },
  });
  

  let streakIncrement = 0;
  if (!todayDiaryExists) {
    streakIncrement = 1; // өнөөдөр анх удаа diary нэмэгдсэн бол streak++
  }

  // Progress update
  progress = await prisma.progress.update({
    where: { userId },
    data: {
      points: { increment: newPoints },
      // streakCount: { increment: streakIncrement },
    },
  });

  // User update (overwrite)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints: progress.points,
      // totalStreaks: progress.streakCount,
    },
  });

  return { finalProgress: progress, user: updatedUser };
}
