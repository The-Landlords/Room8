import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CalendarTab from "./pages/CalendarTab";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
	return (
		<BrowserRouter>
			<nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
				<Link to="/">Home</Link> | <Link to="/cal">Calendar</Link>
			</nav>

			<Routes>
				<Route path="/" element={<h1>Home</h1>} />
				<Route path="/cal" element={<CalendarTab />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
