import { API_BASE } from "../config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	getPasswordChecks,
	getPasswordStrength,
	isValidPassword,
} from "../utils/passwordStrength";

export default function SignUpPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState("");

	const passwordChecks = getPasswordChecks(password);
	const passwordStrength = getPasswordStrength(password);
	const passwordIsValid = isValidPassword(password);

	const navigate = useNavigate();

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// check if fields are empty
		if (!username || !password || !fullName) {
			setError("Please fill in username, password, and full name");
			return;
		}

		if (!passwordIsValid) {
			setError(
				"Password must be at least 8 characters and include uppercase, lowercase, number, and symbol characters."
			);
			return;
		}
		fetch(`${API_BASE}/users`, {
			// matches user-routes.ts POST /users
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
				fullName,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					console.log("Account created!", data);

					// automatically navigate to user settings
					// assumes auto login
					navigate(`/settings/`, { replace: true });
				}
			})
			.catch(() => {
				setError("Signup failed. Please try again.");
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
						className="input-field self-center w-full"
					/>

					{/* password */}
					<div className="flex items-center gap-2 w-full">
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="input-field self-center flex-1 min-w-0"
						/>
						<button
							type="button"
							className="text-sm whitespace-nowrap"
							onClick={() =>
								setShowPassword((current) => !current)
							}
							aria-label={
								showPassword ? "Hide password" : "Show password"
							}
						>
							{showPassword ? "Hide" : "Show"}
						</button>
					</div>

					<div className="text-sm text-left mt-1 w-full">
						<p>
							Password must be at least 8 characters and include
							uppercase, lowercase, number, and symbol characters.
						</p>

						<ul className="mt-2 space-y-1">
							<li>
								{passwordChecks.hasLength ? "✓" : "○"} At least
								8 characters
							</li>
							<li>
								{passwordChecks.hasUpper ? "✓" : "○"} One
								uppercase letter
							</li>
							<li>
								{passwordChecks.hasLower ? "✓" : "○"} One
								lowercase letter
							</li>
							<li>
								{passwordChecks.hasNumber ? "✓" : "○"} One
								number
							</li>
							<li>
								{passwordChecks.hasSymbol ? "✓" : "○"} One
								symbol
							</li>
						</ul>

						<p className="mt-2">
							Password strength: {passwordStrength}
						</p>

						<meter
							className="w-full h-3"
							min="0"
							max="3"
							value={
								passwordStrength === "Weak"
									? 1
									: passwordStrength === "Medium"
										? 2
										: 3
							}
						/>
					</div>
					{/* full name */}
					<input
						type="text"
						placeholder="Full Name"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						className="input-field self-center w-full"
					/>

					{/* sign in */}
					<button
						type="submit"
						className="button mt-2 disabled:opacity-50"
						disabled={!passwordIsValid}
					>
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
