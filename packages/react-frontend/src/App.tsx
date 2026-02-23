//import { useState } from "react";
//import reactLogo from "./assets/react.svg";
//import viteLogo from "/vite.svg";
//import "./App.css";
import UserSetting from "./userSetting";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<h1>Sign-In</h1>} />
					<Route path="/homeList" element={<h1>Homes</h1>} />
					<Route path="/home" element={<h1>Contact</h1>} />
					<Route path="/calendar" element={<h1>Calendar</h1>} />
					<Route path="/chores" element={<h1>Chores</h1>} />
					<Route path="/rules" element={<h1>Rules</h1>} />
					<Route path="/settings" element={<UserSetting />} />
					<Route path="/grocery" element={<h1>Groceries</h1>} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
