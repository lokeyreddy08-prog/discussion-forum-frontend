import { useState } from "react";

const API_URL = "http://localhost:8000";

function Register({ setPage }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      alert("Fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data) {
        alert("User Registered Successfully");
        setPage("login");
      }
    } catch (error) {
      alert("Backend not running or /register API missing.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleRegister}>
        <h1>User Registration</h1>
        <p>Create a new user account</p>

        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>

        <p className="switch-text">
          Already Registered?
          <span onClick={() => setPage("login")}> Login Here</span>
        </p>
      </form>
    </div>
  );
}

export default Register;