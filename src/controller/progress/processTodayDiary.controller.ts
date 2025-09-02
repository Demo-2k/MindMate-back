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
  if (!todayDiary) return; // diary байхгүй бол юу ч хийхгүй

  // 2️⃣ Progress-г шалгаж, streak-г зөвхөн шинээр үүсгэх үед нэмнэ
  //   const progress = await prisma.progress.upsert({
  //     where: { userId },
  //      update: { streakCount: { increment: 1 } },  // update хийхгүй
  //     create: { userId, streakCount: 1, points: 0 },
  //   });

  const progress = await prisma.progress.findUnique({ where: { userId } });

  if (!progress) {
    // Хэрэв progress байхгүй бол шинээр үүсгэнэ
    await prisma.progress.create({
      data: { userId, streakCount: 1, points: 0 },
    });
  } else {
    // streak зөвхөн тухайн өдөр анх удаа diary бичсэн үед л нэмнэ
    const lastDiary = await prisma.diaryNote.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const lastDiaryDate = lastDiary?.createdAt
      ? new Date(lastDiary.createdAt).toDateString()
      : null;

    const todayDate = new Date().toDateString();

    if (lastDiaryDate !== todayDate) {
      await prisma.progress.update({
        where: { userId },
        data: { streakCount: { increment: 1 } },
      });
    }
  }

  console.log("📊 Progress:", progress);

  // 3️⃣ Achievements шалгаж зөвхөн шинэ бол нэмнэ
  type AchievementType = { id: string; title: string; desc: string };
  const todayAchievements = Array.isArray(todayDiary.aiInsight?.achievements)
    ? (todayDiary.aiInsight.achievements as AchievementType[])
    : [];

  console.log("🏆 Today Achievements:", todayAchievements);

  let newAchievementCount = 0;
  for (const ach of todayAchievements) {
    const exists = await prisma.achievement.findUnique({
      where: { userId_achId: { userId, achId: ach.id } },
    });
    if (!exists) {
      await prisma.achievement.create({
        data: { userId, achId: ach.id, title: ach.title, desc: ach.desc },
      });
      newAchievementCount++;
    }
  }

  // 4️⃣ Шинэ achievements-аар points нэмэх
  if (newAchievementCount > 0) {
    const updated = await prisma.progress.update({
      where: { userId },
      data: { points: { increment: newAchievementCount * 5 } },
    });
    console.log("⭐ Updated Progress:", updated);
  }
}
