import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState("");

	const navigate = useNavigate();

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// check if fields are empty
		if (!username || !password || !fullName) {
			setError("Please fill in username, password, and full name");
			return;
		}
		fetch(`${API_BASE}//users`, {
			// matches user-routes.ts POST /users
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password, fullName }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					console.log("Account created!", data);

					// automatically navigate to user settings
					navigate(`/settings/${data.username}`, { replace: true });
				}
			})
			.catch(() => {
				setError("Signup failed. Please try again.");
			});
	};

	return (
		<div className="background-house flex items-center justify-center">
			<div className="panel flex flex-col items-center animate-floatUp min-w-[380px]">
				<h1 className="header mb-4">Sign Up</h1>

				<form
					onSubmit={handleSignUp}
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
					{/* full name */}
					<input
						type="text"
						placeholder="Full Name"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						className="list-item w-full"
					/>

					{/* sign in */}
					<button type="submit" className="button mt-2">
						Sign Up
					</button>

					<p className="text-sm text-center mt-2">
						Have an existing account?{" "}
						<a href="/" className="text-blue-500">
							{" "}
							{/* / is default login page */}
							Sign In
						</a>
					</p>

					{/* TODO: clear input fields button here */}

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
