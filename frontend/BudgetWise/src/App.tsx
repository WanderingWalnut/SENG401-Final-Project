import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import SignUp from "./pages/SignUpPage"; // Import the SignUpPage component

interface User {
  id: number;
  name: string;
}

function HomePage() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); // State for the message from Flask API
  const [users, setUsers] = useState<User[]>([]); // State for the users from Flask API
  const navigate = useNavigate(); // Hook to navigate between pages

  // Fetch data from Flask API when the component is mounted
  useEffect(() => {
    // Fetch message from /api/hello route
    fetch("http://127.0.0.1:5001/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message));

    // Fetch users from /api/users route
    fetch("http://127.0.0.1:5001/api/users")
      .then((response) => response.json())
      .then((data) => {
        // Check if users is an array and update state
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Invalid users data format:", data);
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []); // Empty array means it will only run once when the component mounts

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>count is {count}</button>
        <p>{message}</p> {/* Display the message from Flask API */}
      </div>
      
      {/* Button to navigate to SignUp page */}
      <div>
        <button onClick={() => navigate("/signup")}>Go to Sign Up Page</button>
      </div>

      <div>
        <h2>Users:</h2>
        <ul>
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id}>{user.name}</li> // Display each user's name
            ))
          ) : (
            <p>No users available</p>
          )}
        </ul>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
