// src/signInPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "./config";
export default function SignInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const navigate = useNavigate();

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// check if fields are empty
		if (!username || !password) {
			setError("Please fill in username and password");
			return;
		}

		//send login request
		fetch(`${API_BASE}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					console.log("Logged in!", data);

					// navigate to homelist
					navigate(`/homelist/${data.username}`, { replace: true });
				}
			})
			.catch(() => {
				setError("Invalid Username or Password");
			});
	};

	return (
		<div className="background-house flex items-center justify-center">
			<div className="panel flex flex-col items-center animate-floatUp min-w-[380px]">
				<h1 className="header mb-4">Sign In</h1>

				<form
					onSubmit={handleSignIn}
					className="flex flex-col gap-3 w-full max-w-xs"
				>
					{/* username */}
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="list-item w-full"
					/>

					{/* password */}
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="list-item w-full"
					/>

					{/* sign in */}
					<button type="submit" className="button mt-2">
						Sign In
					</button>

					<p className="text-sm text-center mt-2">
						Don&apos;t have an account?{" "}
						<a href="/signup" className="text-blue-500">
							Sign Up
						</a>
					</p>

					{error && (
						<p className="text-red-500 text-sm text-center mt-2">
							{error}
						</p>
					)}
				</form>
			</div>
		</div>
	);
}
