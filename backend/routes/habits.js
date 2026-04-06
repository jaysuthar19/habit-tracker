import express from "express";
import Habit from "../models/Habit.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET habits
router.get("/", auth, async (req, res) => {
  const habits = await Habit.find({ user: req.user.id });
  res.json(habits);
});



// ADD habit
router.post("/", auth, async (req, res) => {
  const newHabit = new Habit({
    title: req.body.title,
    user: req.user.id,
    streak: 0,
  });

  const saved = await newHabit.save();
  res.json(saved);
});

export default router;
// MARK AS DONE (update streak)
router.put("/:id/done", auth, async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) return res.status(404).json({ msg: "Habit not found" });

  const today = new Date().toISOString().split("T")[0];

  // already done today
  if (habit.lastCompleted === today) {
    return res.json(habit);
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toISOString().split("T")[0];

  let newStreak = 1;

  if (habit.lastCompleted === yDate) {
    newStreak = habit.streak + 1;
  }

  habit.streak = newStreak;
  habit.lastCompleted = today;
  habit.history.push({ date: today, count: 1 });

  await habit.save();

  res.json(habit);
});