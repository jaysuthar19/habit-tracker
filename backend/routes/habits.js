import express from "express";
import Habit from "../models/Habit.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ================= GET HABITS =================
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const habits = await Habit.find({ user: userId });
    res.json(habits);
  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= ADD HABIT =================
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const newHabit = new Habit({
      title: req.body.title,
      user: userId,
      streak: 0,
      history: [],
    });

    const saved = await newHabit.save();
    res.json(saved);
  } catch (err) {
    console.log("POST ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= MARK AS DONE =================
router.put("/:id/done", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ msg: "Habit not found" });
    }

    if (habit.user.toString() !== userId) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const today = new Date().toISOString().split("T")[0];

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

    // ✅ FIX: ensure history exists
    habit.history = habit.history || [];
    habit.history.push({ date: today, count: 1 });

    await habit.save();

    res.json(habit);
  } catch (err) {
    console.log("PUT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE HABIT =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ msg: "Habit not found" });
    }

    if (habit.user.toString() !== userId) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await habit.deleteOne();

    res.json({ msg: "Habit deleted" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;