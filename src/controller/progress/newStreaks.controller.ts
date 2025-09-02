import { Response, Request } from "express";
import { processTodayDiary } from "./processTodayDiary.controller";

export const TodayProgresses = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" });

    const data = await processTodayDiary(userId);

    console.log("data data", data);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to process diary" });
  }
};
