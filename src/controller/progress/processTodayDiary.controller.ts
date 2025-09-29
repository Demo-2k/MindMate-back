import { prisma } from "../../utils/prisma";

export async function processTodayDiary(userId: number) {
  // 1️⃣ Хэрэглэгчийн diary-г шалгах (хамгийн сүүлийн тэмдэглэл)
  const todayDiary = await prisma.diaryNote.findFirst({
    where: { userId },
    include: { aiInsight: true },
    orderBy: { createdAt: "desc" },
  });

  if (!todayDiary) {
    return { diary: null, finalProgress: null, user: null, addedAchievements: [], addedPoints: 0 };
  }

  // 2️⃣ Хэрэглэгчийн progress-ийг шалгах, байхгүй бол шинээр үүсгэх
  let progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) {
    progress = await prisma.progress.create({ data: { userId, streakCount: 0, points: 0 } });
  }

  type AchievementType = { id: string; title: string; desc: string };

  const todayAchievementsRaw = todayDiary.aiInsight?.achievements;
  
  const todayAchievements: AchievementType[] = Array.isArray(todayAchievementsRaw)
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
  const savedAchievements: AchievementType[] = [];

  // 3️⃣ Achievement-г давхардахгүйгээр хадгалах
  for (const ach of todayAchievements) {
    const exists = await prisma.achievement.findUnique({
      where: { userId_achId: { userId, achId: ach.id } },
    });

    if (!exists) {
      await prisma.achievement.create({
        data: { userId, achId: ach.id, title: ach.title, desc: ach.desc },
      });
      savedAchievements.push(ach);
      newPoints += 5; // Шинээр нэмэгдсэн achievement бүрт 5 оноо
    }
  }

  // 4️⃣ Progress шинэчлэх
  if (newPoints > 0) {
    progress = await prisma.progress.update({
      where: { userId },
      data: { points: { increment: newPoints } },
    });
  }

  // 5️⃣ Хэрэглэгчийн totalPoints шинэчлэх
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { totalPoints: progress.points },
  });

  // 6️⃣ Return
  return {
    diary: todayDiary,
    finalProgress: progress,
    user: updatedUser,
    addedAchievements: savedAchievements, // зөвхөн шинэ achievement
    addedPoints: newPoints,               // зөвхөн шинэ point
  };
}
