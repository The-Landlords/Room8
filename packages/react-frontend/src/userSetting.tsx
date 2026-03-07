import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UserSetting() {
	const navigate = useNavigate();
	const { username } = useParams();

	const [scheduleVisibility, setScheduleVisibility] =
		useState("only-roommates");

	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		if (!username) return;

		fetch(`http://localhost:8000/users/username/${username}`)
			.then((res) => {
				if (!res.ok) throw new Error("User not found");
				return res.json();
			})
			.then((data) => setUser(data))
			.catch((err) => {
				console.error(err);
				setUser(null);
			});
	}, [username]);

	return (
		<div className="settings-background">
			{/* HEADER */}
			<header className="w-full flex justify-center pt-8">
				<h1 className="header">User Settings</h1>
			</header>

			{/* TOP BAR */}
			<div className="w-full flex justify-center px-6 mt-8">
				<div className="w-full max-w-6xl grid grid-cols-3 items-center gap-6">
					{/* left controls */}
					<div className="flex justify-start">
						<button
							type="button"
							//FIX ME Change button nag. to correct page
							onClick={() => navigate("/")}
							className="button h-14 w-14 flex items-center justify-center rounded-xl"
						>
							←
						</button>
					</div>

					{/* center welcome */}
					<div className="flex justify-center">
						<div className="bg-primary/70 h-14 px-8 flex items-center justify-center rounded-xl shadow-md">
							<div className="font-primary text-text text-2xl">
								Welcome {user?.username ?? username ?? "User"}
							</div>
						</div>
					</div>

					{/* right sign out */}
					<div className="flex justify-end">
						<button
							type="button"
							//FIX ME Change button nag. to correct page
							onClick={() => navigate("/")}
							className="button h-14 px-6 rounded-xl"
						>
							Sign Out
						</button>
					</div>
				</div>
			</div>

			{/* MAIN GRID */}
			<main className="flex-1 flex justify-center px-6 py-10">
				<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-10">
					{/* LEFT COLUMN */}
					{/* LEFT COLUMN */}
					<div className="md:order-1 w-full min-w-0">
						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*COLUMN HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6">
								Personal Info
							</h2>

							{/*COLUMN MEMBERS*/}
							<div className="space-y-6">
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Name: {user?.fullName ?? "Loading..."}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Pronouns: {user?.pronouns}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									DOB: {user?.DOB}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Allergies: {user?.allergens}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Likes: {user?.likes}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Dislikes: {user?.dislikes}
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className="md:order-3 w-full min-w-0">
						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6">
								Display Settings
							</h2>

							<div className="space-y-5">
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Text Size: {user?.settings?.textSize}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Theme: {user?.settings?.theme}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Color-blind Mode:{" "}
									{String(
										user?.settings?.colorBlindMode ?? ""
									)}
								</div>
							</div>
						</div>
					</div>

					{/* MIDDLE COLUMN */}

					{/* MIDDLE COLUMN */}
					<div className="md:order-2 w-full min-w-0 flex flex-col gap-10">
						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6">
								Emergency Info
							</h2>

							<div className="space-y-5">
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Phone: {user?.phone}
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									Emergency: {user?.emergencyContact?.name}{" "}
									{user?.emergencyContact?.phone}
								</div>
							</div>
						</div>

						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6 leading-tight">
								Who can see
								<br />
								my schedule?
							</h2>

							{/*CLICKABLE ROWS */}
							<div className="space-y-5">
								<button
									type="button"
									onClick={() =>
										setScheduleVisibility("everyone")
									}
									className="w-full bg-secondary text-text font-secondary text-xl rounded-2xl px-8 py-5 flex items-center justify-between"
								>
									<span>Everyone</span>
									<span className="h-6 w-6 rounded-full border-2 border-text flex items-center justify-center">
										{scheduleVisibility === "everyone" && (
											<span className="h-3 w-3 rounded-full bg-text" />
										)}
									</span>
								</button>

								<button
									type="button"
									onClick={() =>
										setScheduleVisibility("only-roommates")
									}
									className="w-full bg-secondary text-text font-secondary text-xl rounded-2xl px-8 py-5 flex items-center justify-between"
								>
									<span>Only roommates</span>
									<span className="h-6 w-6 rounded-full border-2 border-text flex items-center justify-center">
										{scheduleVisibility ===
											"only-roommates" && (
											<span className="h-3 w-3 rounded-full bg-text" />
										)}
									</span>
								</button>

								<button
									type="button"
									onClick={() =>
										setScheduleVisibility("private")
									}
									className="w-full bg-secondary text-text font-secondary text-xl rounded-2xl px-8 py-5 flex items-center justify-between"
								>
									<span>No one (private)</span>
									<span className="h-6 w-6 rounded-full border-2 border-text flex items-center justify-center">
										{scheduleVisibility === "private" && (
											<span className="h-3 w-3 rounded-full bg-text" />
										)}
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
