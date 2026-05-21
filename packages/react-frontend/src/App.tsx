//import { useState } from "react";
//import reactLogo from "./assets/react.svg";
//import viteLogo from "/vite.svg";
//import "./App.css";
//import HomeList from "./homeList";
import RulesPage from "./pages/rulesPage";
import HomeList from "./pages/homelistPage";
import UserSetting from "./pages/userSetting";
import SignInPage from "./pages/signInPage";
import SignUpPage from "./pages/signUpPage";
import ChorePage from "./pages/chorePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CalendarPage from "./pages/calendarPage";
import Residents from "./pages/residents";
import GroceryPage from "./pages/groceryPage.tsx";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					{/* routes are in the form path and page element (a .tsx file) */}
					<Route path="/" element={<SignInPage />} />
					<Route path="/signup" element={<SignUpPage />} />
					<Route path="/homelist/" element={<HomeList />} />
					<Route path="/home" element={<h1>Contact</h1>} />
					<Route
						path="/events/:homeCode"
						element={<CalendarPage />}
					/>
					<Route
						path="/:homeCode/chores"
						element={<ChorePage />}
					/>
					<Route path="/rules/:homeCode" element={<RulesPage />} />
					<Route
						path="/settings/"
						element={<UserSetting />}
					/>
					<Route
						path="/residents/:homeCode"
						element={<Residents />}
					/>
					<Route
						path="/grocery/:homeCode"
						element={<GroceryPage />}
					/>
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
