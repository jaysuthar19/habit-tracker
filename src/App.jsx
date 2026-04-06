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
    const res = await fetch("http://localhost:5000/api/auth/register", {
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
    const res = await fetch("http://localhost:5000/api/auth/login", {
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
        const res = await fetch("http://localhost:5000/api/habits", {
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

    const res = await fetch("http://localhost:5000/api/habits", {
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
      `http://localhost:5000/api/habits/${id}/done`,
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

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setHabits([]);
  };

  return (
  <div className="container">
    <h1 className="title">🔥 Habit Tracker</h1>

    {error && <p style={{ color: "red" }}>{error}</p>}

    {!token ? (
      <>
        <div className="input-group">
          <input
            className="input"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            className="input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <button className="button add-btn" onClick={registerUser}>
            Register
          </button>
          <button className="button done-btn" onClick={loginUser}>
            Login
          </button>
        </div>
      </>
    ) : (
      <>
        <button className="button delete-btn" onClick={logout}>
          Logout
        </button>

        {/* ADD HABIT */}
        <div className="input-group">
          <input
            className="input"
            placeholder="New Habit..."
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
          />
          <button className="button add-btn" onClick={addHabit}>
            Add
          </button>
        </div>

        {/* HABITS */}
        {Array.isArray(habits) && habits.length > 0 ? (
          habits.map((h) => (
            <div key={h._id} className="card">
              <h3>{h.title}</h3>

              <p className="streak">
  🔥 {h.streak}
  {h.lastCompleted === getToday() && " ✅"}
</p>

<CalendarHeatmap
  startDate={new Date(new Date().setDate(new Date().getDate() - 90))}
  endDate={new Date()}
  values={h.history || []}
  classForValue={(value) => {
    if (!value) return "color-empty";
    return "color-scale-" + value.count;
  }}
/>

              <div className="actions">
                <button
                  className="button done-btn"
                  onClick={() => markDone(h._id)}
                >
                  Done
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No habits yet</p>
        )}
      </>
    )}
  </div>
);
}

export default App;