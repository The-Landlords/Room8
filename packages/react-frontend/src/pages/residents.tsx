import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config";
import GuestVoteOverlay from "../components/GuestVoteOverlay";
import Overlay from "../components/overlay";
import Cards from "../components/userCards";
import Header from "../components/header";

function formatDob(dob?: string): string {
	if (!dob) return "";

	const date = new Date(dob);

	if (Number.isNaN(date.getTime())) return "";

	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const month = months[date.getUTCMonth()];
	const endings = ["th", "st", "nd", "rd"];
	const dayNum = date.getUTCDate();
	const ending =
		dayNum % 10 <= 3 && dayNum % 100 !== 11
			? endings[dayNum % 10]
			: endings[0];
	const day = String(date.getUTCDate()).padStart(2, "0");

	return `${month} ${day}${ending}`;
}

type User = {
	_id: string;
	fullName: string;
	allergens: string[];
	likes: string[];
	dislikes: string[];
	phone?: string;
	pronouns?: string;
	DOB?: string;
	emergencyContact?: {
		name: string;
		phone: string;
		relationship: string;
	};
};

export default function Residents() {
	const [residents, setResidents] = useState<User[]>([]);
	const [guests, setGuests] = useState<User[]>([]);
	const [relationship, setRelationship] = useState<string>("");

	const { homeCode } = useParams();

	const [openVotePanel, setOpenVotePanel] = useState(false);

	function normalizeUsers(data: any): User[] {
		if (!Array.isArray(data)) return [];

		return data
			.filter((u) => u && u._id)
			.map((u) => ({
				_id: String(u._id),
				fullName: String(u.fullName ?? "Unknown User"),
				phone: String(u.phone ?? ""),
				pronouns: String(u.pronouns ?? ""),
				DOB: String(u.DOB ?? ""),
				emergencyContact: u.emergencyContact
					? {
							name: String(u.emergencyContact.name ?? ""),
							phone: String(u.emergencyContact.phone ?? ""),
							relationship: String(
								u.emergencyContact.relationship ?? ""
							),
						}
					: undefined,
				allergens: Array.isArray(u.allergens) ? u.allergens : [],
				likes: Array.isArray(u.likes) ? u.likes : [],
				dislikes: Array.isArray(u.dislikes) ? u.dislikes : [],
			}));
	}

	async function fetchResidents() {
		if (!homeCode) return;

		try {
			const res = await fetch(`${API_BASE}/auth/residents/${homeCode}`, {
				credentials: "include",
			});

			const data = await res.json();
			setResidents(normalizeUsers(data));
		} catch {
			setResidents([]);
		}
	}

	async function fetchGuests() {
		if (!homeCode) return;

		try {
			const res = await fetch(`${API_BASE}/auth/guests/me/${homeCode}`, {
				credentials: "include",
			});

			const data = await res.json();
			setGuests(normalizeUsers(data));
		} catch {
			setGuests([]);
		}
	}

	async function fetchRelationship() {
		if (!homeCode) return;

		try {
			const res = await fetch(
				`${API_BASE}/auth/relationship/me/${homeCode}`,
				{ credentials: "include" }
			);

			const data = await res.json();
			setRelationship(String(data?.relationship ?? ""));
		} catch {
			setRelationship("");
		}
	}

	useEffect(() => {
		fetchResidents();
		fetchGuests();
		fetchRelationship();
	}, [homeCode]);

	return (
		<div className="flex flex-col">
			{openVotePanel && homeCode && (
				<Overlay
					isOpen={openVotePanel}
					onClose={() => setOpenVotePanel(false)}
				>
					<GuestVoteOverlay homeCode={homeCode} />
				</Overlay>
			)}

			<div className="flex flex-col items-center justify-center">
				<Header title="Residents" homeCode={homeCode} />
				<Cards
					items={residents}
					getKey={(user) => user._id}
					getTitle={(user) => user.fullName}
					getDetails={(user) => [
						{
							label: "Allergens",
							value: user.allergens.join(", ") || "",
						},
						{ label: "Phone", value: user.phone || "" },
						{ label: "Pronouns", value: user.pronouns || "" },
						{ label: "Birthday", value: formatDob(user.DOB) || "" },
						{
							label: "Emergency Contact",
							value: user.emergencyContact
								? `${user.emergencyContact.name} (${user.emergencyContact.relationship}) - ${user.emergencyContact.phone}`
								: "",
						},
						{ label: "Likes", value: user.likes?.join(", ") || "" },
						{
							label: "Dislikes",
							value: user.dislikes?.join(", ") || "",
						},
					]}
				/>
			</div>
			<div className="flex flex-col items-center justify-center gap-5">
				<h1 className="header p-5">Guests</h1>
				<Cards
					items={guests}
					getKey={(user) => user._id}
					getTitle={(user) => user.fullName}
					getDetails={(user) => [
						{
							label: "Allergens",
							value: user.allergens.join(", ") || "",
						},
						{ label: "Phone", value: user.phone || "" },
						{ label: "Pronouns", value: user.pronouns || "" },
						{ label: "Birthday", value: formatDob(user.DOB) || "" },
						{
							label: "Emergency Contact",
							value: user.emergencyContact
								? `${user.emergencyContact.name} (${user.emergencyContact.relationship}) - ${user.emergencyContact.phone}`
								: "",
						},
						{ label: "Likes", value: user.likes?.join(", ") || "" },
						{
							label: "Dislikes",
							value: user.dislikes?.join(", ") || "",
						},
					]}
					emptyMessage="No guests found."
					className="mx-auto justify-items-center"
				/>

				{relationship === "RESIDENT" && guests.length != 0 && (
					<button
						className="button"
						onClick={() => {
							setOpenVotePanel(true);
						}}
					>
						Vote
					</button>
				)}
			</div>
		</div>
	);
}
