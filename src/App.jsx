import { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./App.css";

const API_URL = "https://habit-tracker-2-b3ji.onrender.com";
const getToday = () => new Date().toISOString().split("T")[0];

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [habits, setHabits] = useState([]);
  const [habit, setHabit] = useState("");
  const [error, setError] = useState("");

  // ================= AUTH =================

  const loginUser = async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
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

  const registerUser = async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
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

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setHabits([]);
  };

  // ================= FETCH HABITS =================

  useEffect(() => {
    if (!token) return;

    const fetchHabits = async () => {
      try {
        const res = await fetch(`${API_URL}/api/habits`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Error fetching habits");
          setHabits([]);
          return;
        }

        setHabits(Array.isArray(data) ? data : []);
      } catch {
        setError("Server error");
      }
    };

    fetchHabits();
  }, [token]);

  // ================= ACTIONS =================

  const addHabit = async () => {
    if (!habit.trim()) return;

    const res = await fetch(`${API_URL}/api/habits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: habit }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.msg || "Add failed");
      return;
    }

    setHabits((prev) => [data, ...prev]);
    setHabit("");
  };

  const markDone = async (id) => {
    const res = await fetch(`${API_URL}/api/habits/${id}/done`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = await res.json();

    if (!res.ok) {
      setError(updated.msg || "Error updating");
      return;
    }

    setHabits((prev) =>
      prev.map((h) => (h._id === id ? updated : h))
    );
  };

 const deleteHabit = async (id) => {
  const res = await fetch(`${API_URL}/api/habits/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`, // ✅ FIXED
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data);
    setError(data.msg || "Delete failed");
    return;
  }

  setHabits((prev) => prev.filter((h) => h._id !== id));
};

  // ================= LOGIN UI =================

  if (!token) {
    return (
      <div className="login">
        <h2>Login</h2>

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button add-btn" onClick={loginUser}>
          Login
        </button>

        <button className="button" onClick={registerUser}>
          Register
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  // ================= MAIN UI =================

  return (
    <div>
      <header>
        <div className="container">
          <h1>🔥 Habit Tracker</h1>
          <button className="button" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="pages">
        <div className="home">

          {/* LEFT */}
          <div>
            {habits.length === 0 && (
              <div className="empty">
                <h3>🚀 Start your first habit</h3>
                <p>Add a habit to begin</p>
              </div>
            )}

            {habits.map((h) => (
              <div key={h._id} className="card">
                <h3>{h.title}</h3>

                <p className="streak">
                  🔥 {h.streak}
                  {h.lastCompleted === getToday() && " ✅"}
                </p>

                <CalendarHeatmap
                  startDate={new Date(new Date().setDate(new Date().getDate() - 90))}
                  endDate={new Date()}
                  values={Array.isArray(h.history) ? h.history : []}
                  classForValue={(value) => {
                    if (!value) return "color-empty";
                    return "color-scale-1";
                  }}
                />

                <div className="actions">
                  <button className="button done-btn" onClick={() => markDone(h._id)}>
                    Done
                  </button>
                  <button className="button delete-btn" onClick={() => deleteHabit(h._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="add-card">
            <h3>Add Habit</h3>

            <input
              className="input"
              placeholder="Enter habit..."
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
            />

            <button className="button add-btn" onClick={addHabit}>
              Add
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;