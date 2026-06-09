// src/signInPage.tsx
import { API_BASE } from "../config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
			credentials: "include",
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
					// FIXME chance to /homelist for bugfix
					navigate(`/homelist/`, { replace: true });
				}
			})
			.catch(() => {
				setError("Invalid Username or Password");
			});
	};

	return (
		<div className="background-house flex flex-col items-center">
			<div className="flex flex-col items-center gap-0">
				<img
					src="/assets/HouseTop.png"
					alt="Roof"
					className="w-140 h-32 -mb-7"
				/>
				<div className="flex flex-row items-center  gap-1.5">
					<h1 className="header-title">Room8</h1>
					<img
						src="/assets/Logo.PNG"
						alt="Logo"
						className="w-35 h-30"
					/>
				</div>
			</div>

			<div className="panel flex flex-col items-center animate-floatUp min-w-[28%]">
				<h1 className="header pb-8">Sign In</h1>

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
						className="input-field w-full self-center-safe"
					/>

					{/* password */}
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="input-field w-full self-center-safe"
					/>

					{/* sign in */}
					<button type="submit" className="button mt-2">
						Sign In
					</button>

					<p className="text-sm text-primary/70 font-secondary text-center mt-2">
						Don&apos;t have an account?{" "}
						<Link to="/signup" className="text-primary">
							Sign Up
						</Link>
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
