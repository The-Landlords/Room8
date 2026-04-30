import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputField } from "../components/input";
import type { FieldsLayout } from "../components/input";

const phoneRegex = /^\+?[1-9]\d{1,10}$/;

function isValidPhone(phone: string) {
	return phoneRegex.test(phone);
}

/* This should definitely go somewhere else */
/* But I don't know where yet */
interface DraftProps {
	pronouns: string;
	fullName: string;
	DOB: string;
	allergens: string;
	likes: string;
	dislikes: string;
	phone: string;
	emergencyContact: {
		name: string;
		phone: string;
		relationship: string;
	};
	settings: {
		textSize: string;
		theme: string;
		colorBlindMode: string;
		scheduleVisibility: string;
	};
}

/* Defining the layout to be called below */
const settingsFields: FieldsLayout<DraftProps> = {
	fullName: {label: "Name", layout: "horizonal", fields: [
		{ type: "text", field: "fullName", placeholder: "Barry B. Benson"}
	]},
	pronouns: {label: "Pronouns", layout: "horizonal", fields: [
		{ type: "text", field: "pronouns", placeholder: "she/they"}
	]},
	DOB: {label: "Birthday", layout: "horizonal", fields: [
		{ type: "date", field: "DOB"}
	]},
	allergens: {label: "Allergens", layout: "vertical", fields: [
		{ type: "text", field: "allergens", placeholder: "pollen, dairy, etc."}
	]},
	likes: {label: "Likes", layout: "vertical", fields: [
		{ type: "text", field: "likes", placeholder: "concerts, movies, etc."}
	]},
	dislikes: {label: "Dislikes", layout: "vertical", fields: [
		{ type: "text", field: "dislikes", placeholder: "workouts, seafoods, etc."}
	]},
	phone: {label: "Phone", layout: "horizonal", fields: [
		{type: "text", field: "phone", placeholder: "+15551239876"}
	]},
	emergencyContact: {label: "Emergency Contact", layout: "vertical", fields: [
		{type: "group", field: "emergencyContact", fields: [
			{field: "name", placeholder: "Adam Flayman"},
			{field: "phone", placeholder: "+15551990123"},
			{field: "relationship", placeholder: "Brother"}
		]}
	]},
	textSize: {label: "Text Size", layout: "horizontal", fields: [
		{type: "dropdown", field: "textSize", options: [
			{value: "small", label: "Small"},
			{value: "medium", label: "Medium"},
			{value: "large", label: "Large"}
		]}
	]},
	theme: {label: "Theme", layout: "horizonal", fields: [
		{type: "toggle", field: "theme", onName: "light", offName: "dark"}
	]},
	colorBlindMode: {label: "Color-Blind Mode", layout: "horizonal", fields: [
		{type: "dropdown", field: "colorBlindMode", options: [
			{value: "off", label: "Off"},
			{value: "protanopia", label: "Protanopia"},
			{value: "deuteranopia", label: "Deuteranopia"},
			{value: "tritanopia", label: "Tritanopia"}
		]}
	]},
	/* This one is unused as a custom, prettier button is preferred */
	scheduleVisibility: {label: "Who can see my schedule?", layout: "vertical", fields: [
		{type: "select", field: "scheduleVisibility", options: [
			{value: "everyone", label: "Everyone"},
			{value: "roommates", label: "Only Roomates"},
			{value: "private", label: "No One (Private)"}
		]}
	]}
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
					DOB: data?.DOB ? String(data.DOB).slice(0, 10) : "",
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
		console.log("sending:", draft);
		const payload = {
			...draft,
			allergens: toList(draft.allergens),
			likes: toList(draft.likes),
			dislikes: toList(draft.dislikes),
		};

		console.log("sending:", payload);

		await fetch(
			`http://localhost:8000/users/${user.username}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}
		);
		/* TODO: */
		/* User feedback if saving failed goes here */
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
					<div className="md:order-1 w-full min-w-0 animate-floatUp">
						<div className="bubble">
							{/*COLUMN HEADER*/}
							<h2 className="bubble-header">
								Personal Info
							</h2>

							{/*COLUMN MEMBERS*/}
							<div className="space-y-5">
								<InputField fieldName={settingsFields.fullName} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.pronouns} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.DOB} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.allergens} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.likes} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.dislikes} state={{draft, setDraft}}/>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className="md:order-3 w-full min-w-0 animate-floatUp">
						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">
								Display Settings
							</h2>

							<div className="space-y-5">
								<InputField fieldName={settingsFields.textSize} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.theme} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.colorBlindMode} state={{draft, setDraft}}/>
							</div>
						</div>
					</div>

					{/* MIDDLE COLUMN */}
					<div className="md:order-2 w-full min-w-0 flex flex-col gap-10 animate-floatUp">
						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">
								Emergency Info
							</h2>

							<div className="space-y-5">
								<InputField fieldName={settingsFields.phone} state={{draft, setDraft}}/>
								<InputField fieldName={settingsFields.emergencyContact} state={{draft, setDraft}}/>
							</div>
						</div>

						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">
								Who can see
								<br />
								my schedule?
							</h2>

							{/*CLICKABLE ROWS */}
							<div className="space-y-5">
								{/* Un-pretty version of the below button */}
								{/* <InputField fieldName={settingsFields.scheduleVisibility} state={{draft, setDraft}}/> */}
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
									className="input-field"
								>
									<span>Everyone</span>
									<span className="toggle-text">
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
									className="input-field"
								>
									<span>Only roommates</span>
									<span className="toggle-text">
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
									className="input-field"
								>
									<span>No one (private)</span>
									<span className="toggle-text">
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
