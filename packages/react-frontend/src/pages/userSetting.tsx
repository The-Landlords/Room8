import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "../config";
import { InputField } from "../components/input";
import type { FieldsLayout } from "../components/input";

const phoneRegex = /^\+?[1-9]\d{1,10}$/;

function isValidPhone(phone: string) {
	return phoneRegex.test(phone);
}

/* Force type-matching here so mapping works later on */
type userVisibility = "everyone" | "roommates" | "private";
type homeVisibility = "PUBLIC" | "RESIDENT" | "PRIVATE";

/* Defining the relations between visibilities here */
/* Yes, this should be better structured. Make it a 'future' issue. */
const UserToHome: Record<userVisibility, homeVisibility> = {
	everyone: "PUBLIC",
	roommates: "RESIDENT",
	private: "PRIVATE",
} as const;
const HomeToUser: Record<homeVisibility, userVisibility> = {
	PUBLIC: "everyone",
	RESIDENT: "roommates",
	PRIVATE: "private",
} as const;

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
		personalVisibility: userVisibility;
		emergencyVisibility: userVisibility;
		interestsVisibility: userVisibility;
	};
	visibility: {
		nameVisible: homeVisibility;
		allergensVisible: homeVisibility;
		dobVisible: homeVisibility;
		pronounsVisible: homeVisibility;
		phoneVisible: homeVisibility;
		emergencyContactVisible: homeVisibility;
		likesVisible: homeVisibility;
		dislikesVisible: homeVisibility;
	};
}

/* Defining the layout to be called below */
const settingsFields: FieldsLayout<DraftProps> = {
	fullName: {
		label: "Name",
		layout: "horizonal",
		fields: [
			{ type: "text", field: "fullName", placeholder: "Barry B. Benson" },
		],
	},
	allergens: {
		label: "Allergens",
		layout: "vertical",
		fields: [
			{
				type: "text",
				field: "allergens",
				placeholder: "pollen, dairy, etc.",
			},
		],
	},
	DOB: {
		label: "Birthday",
		layout: "horizonal",
		fields: [{ type: "date", field: "DOB" }],
	},
	pronouns: {
		label: "Pronouns",
		layout: "horizonal",
		fields: [{ type: "text", field: "pronouns", placeholder: "she/they" }],
	},
	phone: {
		label: "Phone",
		layout: "horizonal",
		fields: [{ type: "text", field: "phone", placeholder: "+19998887777" }],
	},
	emergencyContact: {
		label: "Emergency Contact",
		layout: "vertical",
		fields: [
			{
				type: "group",
				field: "emergencyContact",
				fields: [
					{ field: "name", placeholder: "Adam Flayman" },
					{ field: "phone", placeholder: "+15551990123" },
					{ field: "relationship", placeholder: "Relationship" },
				],
			},
		],
	},
	likes: {
		label: "Likes",
		layout: "vertical",
		fields: [
			{
				type: "text",
				field: "likes",
				placeholder: "concerts, movies, etc.",
			},
		],
	},
	dislikes: {
		label: "Dislikes",
		layout: "vertical",
		fields: [
			{
				type: "text",
				field: "dislikes",
				placeholder: "workouts, seafoods, etc.",
			},
		],
	},
	textSize: {
		label: "Text Size",
		layout: "horizontal",
		fields: [
			{
				type: "dropdown",
				field: "textSize",
				options: [
					{ value: "small", label: "Small" },
					{ value: "medium", label: "Medium" },
					{ value: "large", label: "Large" },
				],
			},
		],
	},
	theme: {
		label: "Theme",
		layout: "horizonal",
		fields: [
			{
				type: "toggle",
				field: "theme",
				onName: "light",
				offName: "dark",
			},
		],
	},
	colorBlindMode: {
		label: "Color-Blind Mode",
		layout: "horizonal",
		fields: [
			{
				type: "dropdown",
				field: "colorBlindMode",
				options: [
					{ value: "off", label: "Off" },
					{ value: "protanopia", label: "Protanopia" },
					{ value: "deuteranopia", label: "Deuteranopia" },
					{ value: "tritanopia", label: "Tritanopia" },
				],
			},
		],
	},
	/* These are for mapping visibility settings */
	personalVisibility: {
		label: "Who can see my personal details",
		layout: "vertical",
		fields: [
			{
				type: "select",
				field: "personalVisibility",
				layout: "horizontal",
				options: [
					{ value: "everyone", label: "Everyone" },
					{ value: "roommates", label: "Only Roomates" },
					{ value: "private", label: "No One (Private)" },
				],
			},
		],
	},
	emergencyVisibility: {
		label: "Who can see my emergency contact",
		layout: "vertical",
		fields: [
			{
				type: "select",
				field: "emergencyVisibility",
				layout: "horizontal",
				options: [
					{ value: "everyone", label: "Everyone" },
					{ value: "roommates", label: "Only Roomates" },
					{ value: "private", label: "No One (Private)" },
				],
			},
		],
	},
	interestsVisibility: {
		label: "Who can see my interests",
		layout: "vertical",
		fields: [
			{
				type: "select",
				field: "interestsVisibility",
				layout: "horizontal",
				options: [
					{ value: "everyone", label: "Everyone" },
					{ value: "roommates", label: "Only Roomates" },
					{ value: "private", label: "No One (Private)" },
				],
			},
		],
	},
};

export default function UserSetting() {
	const navigate = useNavigate();

	// holds what the user is currently typing
	const [draft, setDraft] = useState({
		fullName: "",
		allergens: "",
		DOB: "",
		pronouns: "",
		phone: "", // gets validated in post
		emergencyContact: {
			name: "",
			phone: "",
			relationship: "",
		},
		likes: "",
		dislikes: "",
		settings: {
			textSize: "medium",
			theme: "light",
			colorBlindMode: "off",
			personalVisibility: "roommates" as userVisibility,
			emergencyVisibility: "roommates" as userVisibility,
			interestsVisibility: "roommates" as userVisibility,
		},
		visibility: {
			nameVisible: "PUBLIC" as homeVisibility /* Unless we mess up */,
			allergensVisible:
				"PUBLIC" as homeVisibility /* These two should ALWAYS be 'PUBLIC' */,
			dobVisible: "RESIDENT" as homeVisibility,
			pronounsVisible: "RESIDENT" as homeVisibility,
			phoneVisible: "RESIDENT" as homeVisibility,
			emergencyContactVisible: "RESIDENT" as homeVisibility,
			likesVisible: "RESIDENT" as homeVisibility,
			dislikesVisible: "RESIDENT" as homeVisibility,
		},
	});

	const [user, setUser] = useState<any>(null);
	const [, setError] = useState("");

	useEffect(() => {
		// GET
		fetch(`${API_BASE}/users/me`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) throw new Error("User not found");
				return res.json();
			})
			.then((data) => {
				setUser(data);
				setDraft({
					fullName: data?.fullName ?? "",
					allergens: (data?.allergens ?? []).join(", "),
					DOB: data?.DOB ? String(data.DOB).slice(0, 10) : "",
					pronouns: data?.pronouns ?? "",
					phone: data?.phone ?? "",
					emergencyContact: {
						name: data?.emergencyContact?.name ?? "",
						phone: data?.emergencyContact?.phone ?? "",
						relationship:
							data?.emergencyContact?.relationship ?? "",
					},
					likes: (data?.likes ?? []).join(", "),
					dislikes: (data?.dislikes ?? []).join(", "),
					settings: {
						textSize: data?.settings?.textSize ?? "medium",
						theme: data?.settings?.theme ?? "light",
						colorBlindMode: data?.settings?.colorBlindMode ?? "off",
						personalVisibility:
							HomeToUser[
								(data?.visibility?.dobVisible ??
									"RESIDENT") as homeVisibility
							],
						emergencyVisibility:
							HomeToUser[
								(data?.visibility?.emergencyContactVisible ??
									"RESIDENT") as homeVisibility
							],
						interestsVisibility:
							HomeToUser[
								(data?.visibility?.likesVisible ??
									"RESIDENT") as homeVisibility
							],
					},
					visibility: {
						nameVisible:
							data?.visibility?.nameVisible ??
							("PUBLIC" as homeVisibility),
						allergensVisible:
							data?.visibility?.allergensVisible ??
							("PUBLIC" as homeVisibility),
						dobVisible:
							data?.visibility?.dobVisible ??
							("RESIDENT" as homeVisibility),
						pronounsVisible:
							data?.visibility?.pronounsVisible ??
							("RESIDENT" as homeVisibility),
						phoneVisible:
							data?.visibility?.phoneVisible ??
							("RESIDENT" as homeVisibility),
						emergencyContactVisible:
							data?.visibility?.emergencyContactVisible ??
							("RESIDENT" as homeVisibility),
						likesVisible:
							data?.visibility?.likesVisible ??
							("RESIDENT" as homeVisibility),
						dislikesVisible:
							data?.visibility?.dislikesVisible ??
							("RESIDENT" as homeVisibility),
					},
				});
			})
			.catch((err) => {
				console.error(err);
				setUser(null);
			});
	}, []);

	/* Updates the html value when 'theme' changes */
	useEffect(() => {
		document.body.setAttribute("data-theme", draft.settings.theme);
	}, [draft.settings.theme]);
	/* Updates the html value when 'colorblind' changes */
	useEffect(() => {
		document.body.setAttribute(
			"data-colorblind",
			draft.settings.colorBlindMode
		);
	}, [draft.settings.colorBlindMode]);

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
		console.log("sending:", draft);
		const payload = {
			...draft,
			allergens: toList(draft.allergens),
			likes: toList(draft.likes),
			dislikes: toList(draft.dislikes),
			visibility: {
				nameVisible: "PUBLIC" as homeVisibility /* Unless we mess up */,
				allergensVisible:
					"PUBLIC" as homeVisibility /* These two should ALWAYS be 'PUBLIC' */,
				dobVisible: UserToHome[draft.settings.personalVisibility],
				pronounsVisible: UserToHome[draft.settings.personalVisibility],
				phoneVisible: UserToHome[draft.settings.personalVisibility],
				emergencyContactVisible:
					UserToHome[draft.settings.emergencyVisibility],
				likesVisible: UserToHome[draft.settings.interestsVisibility],
				dislikesVisible: UserToHome[draft.settings.interestsVisibility],
			},
		};

		try {
			const res = await fetch(`${API_BASE}/users/me`, {
				method: "PATCH",
				credentials: "include",

				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				throw new Error("Unable to save profile.");
			}

			setError("");
			alert("User settings saved successfully!");
			navigate(`/homelist/`);
		} catch (err) {
			console.error(err);
			setError("Unable to save profile.");
		}
	}

	async function handleSignOut() {
		try {
			await fetch(`${API_BASE}/logout`, {
				method: "POST",
				credentials: "include",
			});
		} catch (err) {
			console.error(err);
		} finally {
			navigate("/", { replace: true });
		}
	}

	return (
		<div>
			<header className="header-wrapper">
				{/* left controls */}
				<div className="flex justify-start">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="button absolute left-6 top-8"
					>
						← Back
					</button>
				</div>
				<h1 className="header text-center px-14 ">
					Welcome {user?.username ?? "User"}
				</h1>
				<button
					type="button"
					onClick={handleSignOut}
					className="absolute button max-h-[30%] min-w-[10%] max-w-[15%] right-6 top-8  flex items-center justify-center p-2"
				>
					Sign Out
				</button>
			</header>

			{/* TOP BAR */}
			<div className="w-full flex justify-center px-6 mt-8">
				{/* right save */}
				<div className="flex justify-end">
					<button
						type="button"
						disabled={
							draft.phone.length > 0 && !isValidPhone(draft.phone)
						}
						onClick={saveProfile}
						className="button h-14 px-6 rounded-xl"
					>
						Save Profile
					</button>
				</div>
			</div>

			{/* MAIN GRID */}
			<main className="flex-1 flex justify-center px-6 py-10">
				<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-10">
					{/* LEFT COLUMN */}
					<div className="md:order-1 w-full min-w-0 flex flex-col items-center gap-10 animate-floatUp">
						{/*COLUMN MEMBERS*/}
						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">General</h2>
							<div className="bubble-contents">
								<InputField
									fieldName={settingsFields.fullName}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={settingsFields.allergens}
									state={{ draft, setDraft }}
								/>
								<p className="flex justify-center w-full text-primary">
									This information will be public to both
									residents and guests.
								</p>
							</div>
						</div>

						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">Personal</h2>
							<div className="bubble-contents">
								<InputField
									fieldName={settingsFields.DOB}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={settingsFields.pronouns}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={settingsFields.phone}
									state={{ draft, setDraft }}
								/>
								{draft.phone.length > 0 &&
									!phoneRegex.test(draft.phone) && (
										<p className="text-sm text-accent">
											Use E.164 format (e.g. +14155552671)
										</p>
									)}
								<InputField
									fieldName={
										settingsFields.personalVisibility
									}
									state={{ draft, setDraft }}
								/>
							</div>
						</div>
					</div>

					{/* MIDDLE COLUMN */}
					<div className="md:order-2 w-full min-w-0 flex flex-col gap-10 animate-floatUp">
						{/*COLUMN MEMBERS*/}
						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">Emergency</h2>
							<div className="bubble-contents">
								<InputField
									fieldName={settingsFields.emergencyContact}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={
										settingsFields.emergencyVisibility
									}
									state={{ draft, setDraft }}
								/>
							</div>
						</div>

						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">Interests</h2>
							<div className="bubble-contents">
								<InputField
									fieldName={settingsFields.likes}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={settingsFields.dislikes}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={
										settingsFields.interestsVisibility
									}
									state={{ draft, setDraft }}
								/>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className="md:order-3 w-full min-w-0 animate-floatUp">
						<div className="bubble">
							{/*HEADER*/}
							<h2 className="bubble-header">Display</h2>

							<div className="bubble-contents">
								<InputField
									fieldName={settingsFields.textSize}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={settingsFields.theme}
									state={{ draft, setDraft }}
								/>
								<InputField
									fieldName={settingsFields.colorBlindMode}
									state={{ draft, setDraft }}
								/>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
