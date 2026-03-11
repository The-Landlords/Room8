//import { useState } from "react";
//import reactLogo from "./assets/react.svg";
//import viteLogo from "/vite.svg";
//import "./App.css";
//import HomeList from "./homeList";
import RulesPage from "./rulesPage";
import HomeList from "./homelist";
import UserSetting from "./userSetting";
import SignInPage from "./signInPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<SignInPage />} />
					<Route path="/homelist/:username" element={<HomeList />} />
					<Route path="/home" element={<h1>Contact</h1>} />
					<Route path="/calendar" element={<h1>Calendar</h1>} />
					<Route path="/chores" element={<h1>Chores</h1>} />
                    <Route path="/rules/:homeId" element={<RulesPage />} />					
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
