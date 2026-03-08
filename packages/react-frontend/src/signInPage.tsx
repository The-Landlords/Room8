// src/signInPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const navigate = useNavigate();

	const handleSignIn = (e: any) => {
		e.preventDefault();
		setError("");

		//check if any user/password
		if (!username || !password) {
			setError("Please fill in username and password");
			return;
		}

		//send login request
		fetch(`http://localhost:8000/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		})
			//response and error handling
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					console.log("Logged in!", data);
					localStorage.setItem("token", data.token);
					navigate(`/homelist/${data.username}`, { replace: true });
				}
			})
			.catch((err) => {
				setError("Invalid Username or Password");
			});
	};

	return (
		<div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
			<div className="w-full max-w-sm bg-white rounded-lg p-8">
				{/* Title */}
				<h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
					Room8
				</h1>

				{/* Header */}
				<h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
					Sign In
				</h2>

				{/* Username */}
				<form onSubmit={handleSignIn} className="space-y-6">
					<div>
						<label className="block text-gray-600 mb-2">
							username
						</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="barrybbenson"
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
						/>
					</div>

					{/* Password */}
					<div>
						<label className="block text-gray-600 mb-2">
							password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
						/>
					</div>

					{error && (
						<p className="text-red-600 text-sm mt-1">{error}</p>
					)}

					{/* Sign in Button */}
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700"
					>
						Sign in
					</button>
				</form>

				<p className="text-center text-gray-500 mt-6 text-sm">
					Already have an account?{" "}
					<a href="#" className="text-blue-600 hover:underline">
						Log in
					</a>
				</p>
			</div>
		</div>
	);
}
