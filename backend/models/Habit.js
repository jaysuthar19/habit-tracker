import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  title: String,
  user: String,
  streak: { type: Number, default: 0 },
  lastCompleted: { type: String, default: null },
  history: [
    {
      date: String,
      count: Number,
    },
  ],
});

export default mongoose.model("Habit", habitSchema);