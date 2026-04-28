//import { useState } from "react";
//import reactLogo from "./assets/react.svg";
//import viteLogo from "/vite.svg";
//import "./App.css";
//import HomeList from "./homeList";
import RulesPage from "./rulesPage";
import HomeList from "./homelist";
import UserSetting from "./userSetting";
import SignInPage from "./signInPage";
import SignUpPage from "./signUpPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CalendarPage from "./CalendarPage";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					{/* routes are in the form path and page element (a .tsx file) */}
					<Route path="/" element={<SignInPage />} />
					<Route path="/signup" element={<SignUpPage />} />
					<Route path="/homelist/:username" element={<HomeList />} />
					<Route path="/home" element={<h1>Contact</h1>} />
					<Route
						path="/events/:username/:homeCode"
						element={<CalendarPage />}
					/>
					<Route path="/chores" element={<h1>Chores</h1>} />
					<Route path="/rules/:homeCode" element={<RulesPage />} />
					<Route
						path="/settings/:username"
						element={<UserSetting />}
					/>
					<Route path="/grocery" element={<h1>Groceries</h1>} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
