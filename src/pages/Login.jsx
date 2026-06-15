import { useState } from "react";

const API_URL = "http://localhost:8000";

function Login({ setIsLoggedIn, setPage }) {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));

        alert("Login Successful");
        setIsLoggedIn(data);
      } else {
        alert("Invalid Email or Password");
      }
    } catch (error) {
      alert("Backend not running. Please start FastAPI.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Discussion Forum Login</h1>
        <p>Admin can login directly. New users can register first.</p>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={user.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={user.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p className="switch-text">
          New User?
          <span onClick={() => setPage("register")}> Register Here</span>
        </p>

        <div className="demo-box">
          <p>
            <b>Admin:</b> kushi@gmail.com / 1234
          </p>
          <p>
            <b>User:</b> student@gmail.com / 123456
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;