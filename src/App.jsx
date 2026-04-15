import { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./App.css";

const getToday = () => new Date().toISOString().split("T")[0];

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [habits, setHabits] = useState([]);
  const [habit, setHabit] = useState("");
  const [error, setError] = useState("");

  // ✅ REGISTER
  const registerUser = async () => {
    const res = await fetch("https://habit-tracker-2-b3ji.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.msg || "Register failed");
      return;
    }

    alert("User registered!");
  };

  // ✅ LOGIN
  const loginUser = async () => {
    const res = await fetch("https://habit-tracker-2-b3ji.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.msg || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setError("");
  };

  // ✅ FETCH HABITS
  useEffect(() => {
    if (!token) return;

    const fetchHabits = async () => {
      try {
        const res = await fetch("https://habit-tracker-2-b3ji.onrender.com/api/habits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Error fetching habits");
          return;
        }

        setHabits(data);
      } catch {
        setError("Server error");
      }
    };

    fetchHabits();
  }, [token]);

  // ✅ ADD HABIT
  const addHabit = async () => {
    if (!habit.trim()) return;

    const res = await fetch("https://habit-tracker-2-b3ji.onrender.com/api/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: habit }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.msg || "Failed to add habit");
      return;
    }

    setHabits([data, ...habits]);
    setHabit("");
  };

  // ✅ DONE BUTTON (STREAK)
  const markDone = async (id) => {
    const res = await fetch(
      `https://habit-tracker-2-b3ji.onrender.com/api/habits/${id}/done`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedHabit = await res.json();

    if (!res.ok) {
      setError(updatedHabit.msg || "Error updating streak");
      return;
    }

    setHabits((prev) =>
      prev.map((h) => (h._id === id ? updatedHabit : h))
    );
  };

  const deleteHabit = async (id) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/api/habits/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });

  setHabits(habits.filter((h) => h._id !== id));
};

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setHabits([]);
  };

  const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

  return (
  <div>
  {/* HEADER */}
  <header>
    <div className="container">
      <h1>🔥 Habit Tracker</h1>
      <button className="button" onClick={logout}>
        Logout
      </button>
    </div>
  </header>

  {/* MAIN */}
  <div className="pages">
    <div className="home">

      {/* LEFT SIDE - HABITS */}
      <div>
        {habits.length === 0 && (
          <p className="empty">No habits yet 😴</p>
        )}

        {habits.map((h) => (
          <div key={h._id} className="card">
            <h3>{h.title}</h3>

            <p className="streak">
              🔥 Streak: {h.streak}
              {h.lastCompleted === getToday() && " ✅"}
            </p>

            {/* CALENDAR */}
            <CalendarHeatmap
              startDate={new Date(new Date().setDate(new Date().getDate() - 90))}
              endDate={new Date()}
              values={h.history || []}
              classForValue={(value) => {
                if (!value) return "color-empty";
                return "color-scale-1";
              }}
            />

            <div className="actions">
              <button
                className="button done-btn"
                onClick={() => markDone(h._id)}
              >
                Done
              </button>

              <button
                className="button delete-btn"
                onClick={() => deleteHabit(h._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE - ADD HABIT */}
      <div className="add-card">
        <h3>Add New Habit</h3>

        <input
          className="input"
          placeholder="Enter habit..."
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
        />

        <button className="button add-btn" onClick={addHabit}>
          Add Habit
        </button>
      </div>

    </div>
  </div>
</div>
  );
  }

export default App;