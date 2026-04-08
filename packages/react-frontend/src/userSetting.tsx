import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const phoneRegex = /^\+?[1-9]\d{1,10}$/;

function isValidPhone(phone: string) {
	return phoneRegex.test(phone);
}

const bdayRegex = /^\d{2}-\d{2}$/;
/**
 *
 * @param s the input string
 * @returns true if the string is in form ##-## and is a valid mm-dd date
 */
function isValidDOB(s: string) {
	if (!bdayRegex.test(s)) return false;
	const [mm, dd] = s.split("-").map(Number);

	const date = new Date(2000, mm - 1, dd);

	return date.getMonth() === mm - 1 && date.getDate() === dd;
}

export default function UserSetting() {
	const navigate = useNavigate();
	const { username } = useParams();

	// holds what the user is currently typing
	const [draft, setDraft] = useState({
		pronouns: "",
		fullName: "",
		DOB: "",
		allergens: "",
		likes: "",
		dislikes: "",
		phone: "", // gets validated in post
		emergencyContact: {
			name: "",
			phone: "",
			relationship: "",
		},
		settings: {
			textSize: "medium",
			theme: "light",
			colorBlindMode: "off",
			scheduleVisibility: "roommates", // default
		},
	});

	const [user, setUser] = useState<any>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!username) return;

		fetch(`http://localhost:8000/users/username/${username}`)
			.then((res) => {
				if (!res.ok) throw new Error("User not found");
				return res.json();
			})
			.then((data) => {
				setUser(data);
				setDraft({
					pronouns: data?.pronouns ?? "",
					fullName: data?.fullName ?? "",
					DOB: data?.DOB ? String(data.DOB).slice(5, 10) : "",
					allergens: (data?.allergens ?? []).join(", "),
					likes: (data?.likes ?? []).join(", "),
					dislikes: (data?.dislikes ?? []).join(", "),
					phone: data?.phone ?? "",
					emergencyContact: {
						name: data?.emergencyContact?.name ?? "",
						phone: data?.emergencyContact?.phone ?? "",
						relationship:
							data?.emergencyContact?.relationship ?? "",
					},
					settings: {
						textSize: data?.settings?.textSize ?? "medium",
						theme: data?.settings?.theme ?? "light",
						colorBlindMode: data?.settings?.colorBlindMode ?? "off",
						scheduleVisibility:
							data?.settings?.scheduleVisibility ?? "roommates",
					},
				});
			})
			.catch((err) => {
				console.error(err);
				setUser(null);
			});
	}, [username]);

	/**
	 *
	 * @param s a given string with values with commas inside
	 * @returns a spliced array seperated at ,
	 */
	function toList(s: string) {
		return s
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);
	}
	async function saveProfile() {
		if (!username) return;
		// console.log("sending:", draft);

		if (draft.phone && !isValidPhone(draft.phone)) {
			alert(
				"Phone must be in +19998887777 format (optional country code followed by 1-10 digits)"
			);
			return;
		}

		if (draft.DOB && !isValidDOB(draft.DOB)) {
			alert("Birthday must be in MM-DD format and a valid date!");
			return;
		}
		const dob = draft.DOB ? `2000-${draft.DOB}` : ""; // there is no way to not have a year, so we use a default year of 2000. Will need to be encrypted

		const payload = {
			...draft,
			DOB: dob, // sent in MM-DD format
			allergens: toList(draft.allergens),
			likes: toList(draft.likes),
			dislikes: toList(draft.dislikes),
		};

		console.log("sending:", payload);

		const res = await fetch(
			`http://localhost:8000/users/${user.username}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}
		);
		alert("saved!");
	}
	return (
		<div className="settings-background">
			{/* HEADER */}
			<header className="w-full flex justify-center pt-8">
				<h1 className="header">User Settings</h1>
			</header>

			{/* TOP BAR */}
			<div className="w-full flex justify-center px-6 mt-8">
				<div className="w-full max-w-6xl grid grid-cols-4 items-center gap-6">
					{/* left controls */}
					<div className="flex justify-start">
						<button
							type="button"
							onClick={() => navigate(`/homelist/${username}`)}
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

					{/* right save */}
					<div className="flex justify-end">
						<button
							type="button"
							disabled={
								draft.phone.length > 0 &&
								!isValidPhone(draft.phone)
							}
							onClick={saveProfile}
							className="button h-14 px-6 rounded-xl"
						>
							Save Profile
						</button>
					</div>
					{/* right sign out */}
					<div className="flex justify-end">
						<button
							type="button"
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
					<div className="md:order-1 w-full min-w-0 animate-floatUp">
						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*COLUMN HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6">
								Personal Info
							</h2>

							{/*COLUMN MEMBERS*/}
							<div className="space-y-6">
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Name:</span>
										<input
											value={draft.fullName}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													fullName: e.target.value,
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="Barry B. Benson"
										/>
									</label>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Pronouns:</span>
										<input
											value={draft.pronouns}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													pronouns: e.target.value,
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="e.g., she/they"
										/>
									</label>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">
											Birthday ! :
										</span>
										<input
											type="text"
											value={draft.DOB}
											placeholder="MM-DD"
											maxLength={5}
											onChange={(e) => {
												console.log(e.target.value);

												setDraft((d) => ({
													...d,
													DOB: e.target.value,
												}));
											}}
											className="bg-transparent border-b border-text outline-none"
										/>
										{draft.DOB.length === 5 &&
											!bdayRegex.test(draft.DOB) &&
											!isValidDOB(draft.DOB) && (
												<p className="text-sm text-red-500">
													Please enter a valid date
													for birthday in the form
													mm-dd !
												</p>
											)}
									</label>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Allergens:</span>
										<input
											type="text" // need to split input by comma before post
											value={draft.allergens}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													allergens: e.target.value,
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="e.g., pollen, dairy"
										/>
									</label>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Likes:</span>
										<input
											type="text" // need to split input by comma before post
											value={draft.likes}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													likes: e.target.value,
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="e.g., concerts, movies"
										/>
									</label>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Dislikes:</span>
										<input
											type="text" // need to split input by comma before post
											value={draft.dislikes}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													dislikes: e.target.value,
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="e.g., workouts, seafood"
										/>
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className="md:order-3 w-full min-w-0 animate-floatUp">
						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6">
								Display Settings
							</h2>

							<div className="space-y-5">
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Text Size:</span>
										<select
											value={draft.settings.textSize}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													settings: {
														...d.settings,
														textSize:
															e.target.value,
													},
												}))
											}
											className="bg-transparent border-b border-text outline-none"
										>
											<option value="small">Small</option>
											<option value="medium">
												Medium
											</option>
											<option value="large">Large</option>
										</select>
									</label>
								</div>
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5 flex items-center justify-between">
									<span>Theme</span>

									<button
										type="button"
										onClick={() =>
											setDraft((d) => ({
												...d,
												settings: {
													...d.settings,
													theme:
														d.settings.theme ===
														"light"
															? "dark"
															: "light",
												},
											}))
										}
										className={`w-14 h-7 flex items-center rounded-full transition-colors duration-300 ${
											draft.settings.theme === "light"
												? "bg-yellow-400 justify-end" // light mode (right)
												: "bg-gray-800 justify-start" // dark mode (left)
										}`}
									>
										<span className="w-5 h-5 bg-white rounded-full shadow-md mx-1" />
									</button>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">
											Color-blind mode:
										</span>
										<select
											value={
												draft.settings.colorBlindMode
											}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													settings: {
														...d.settings,
														colorBlindMode:
															e.target.value,
													},
												}))
											}
											className="bg-transparent border-b border-text outline-none"
										>
											<option value="off">Off</option>
											<option value="protanopia">
												Protanopia
											</option>
											<option value="deuteranopia">
												Deuteranopia
											</option>
											<option value="tritanopia">
												Tritanopia
											</option>
										</select>
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* MIDDLE COLUMN */}
					<div className="md:order-2 w-full min-w-0 flex flex-col gap-10 animate-floatUp">
						<div className="bg-primary/70 rounded-2xl shadow-md p-6 w-full min-w-0">
							{/*HEADER*/}
							<h2 className="font-primary text-text text-3xl text-center mb-6">
								Emergency Info
							</h2>

							<div className="space-y-5">
								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									<label className="block">
										<span className="mr-3">Phone:</span>
										<input
											value={draft.phone}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													phone: e.target.value.replace(
														/[^\d+]/g,
														""
													),
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="+19998887777"
										/>
										{draft.phone.length > 0 &&
											!phoneRegex.test(draft.phone) && (
												<p className="text-sm text-red-500">
													Use E.164 format (e.g.
													+14155552671)
												</p>
											)}
									</label>
								</div>

								<div className="bg-secondary text-text font-secondary text-1xl rounded-2xl px-8 py-5">
									{/* Emergency: {user?.emergencyContact?.name}{" "}
									{user?.emergencyContact?.phone} */}
									<label className="block">
										<span className="mr-3">
											Emergency Contact:
										</span>
										<input
											value={draft.emergencyContact.name}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													emergencyContact: {
														...d.emergencyContact,
														name: e.target.value,
													},
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="Adam Flayman"
										/>

										<input
											value={draft.emergencyContact.phone}
											onChange={(e) => {
												const raw =
													e.target.value.replace(
														/[^\d+]/g,
														""
													);
												const cleaned =
													raw[0] === "+"
														? "+" +
															raw
																.slice(1)
																.replace(
																	/\+/g,
																	""
																)
														: raw.replace(
																/\+/g,
																""
															);

												setDraft((d) => ({
													...d,
													emergencyContact: {
														...d.emergencyContact,
														phone: cleaned,
													},
												}));
											}}
											className="bg-transparent border-b border-text outline-none"
											placeholder="+12224446666"
										/>

										<input
											value={
												draft.emergencyContact
													.relationship
											}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													emergencyContact: {
														...d.emergencyContact,
														relationship:
															e.target.value,
													},
												}))
											}
											className="bg-transparent border-b border-text outline-none"
											placeholder="Brother"
										/>
									</label>
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
										setDraft((d) => ({
											...d,
											settings: {
												...d.settings,
												scheduleVisibility: "everyone",
											},
										}))
									}
									className="w-full bg-secondary text-text font-secondary text-xl rounded-2xl px-8 py-5 flex items-center justify-between"
								>
									<span>Everyone</span>
									<span className="h-6 w-6 rounded-full border-2 border-text flex items-center justify-center">
										{draft.settings.scheduleVisibility ===
											"everyone" && (
											<span className="h-3 w-3 rounded-full bg-text" />
										)}
									</span>
								</button>

								<button
									type="button"
									onClick={() =>
										setDraft((d) => ({
											...d,
											settings: {
												...d.settings,
												scheduleVisibility: "roommates",
											},
										}))
									}
									className="w-full bg-secondary text-text font-secondary text-xl rounded-2xl px-8 py-5 flex items-center justify-between"
								>
									<span>Only roommates</span>
									<span className="h-6 w-6 rounded-full border-2 border-text flex items-center justify-center">
										{draft.settings.scheduleVisibility ===
											"roommates" && (
											<span className="h-3 w-3 rounded-full bg-text" />
										)}
									</span>
								</button>

								<button
									type="button"
									onClick={() =>
										setDraft((d) => ({
											...d,
											settings: {
												...d.settings,
												scheduleVisibility: "private",
											},
										}))
									}
									className="w-full bg-secondary text-text font-secondary text-xl rounded-2xl px-8 py-5 flex items-center justify-between"
								>
									<span>No one (private)</span>
									<span className="h-6 w-6 rounded-full border-2 border-text flex items-center justify-center">
										{draft.settings.scheduleVisibility ===
											"private" && (
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
