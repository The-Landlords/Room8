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

export default function Residents() {
	const [residents, setResidents] = useState<any[]>([]);
	const [guests, setGuests] = useState<any[]>([]);
	const [relationship, setRelationship] = useState<string>("");
	const { homeCode } = useParams();

	const [openVotePanel, setOpenVotePanel] = useState(false);

	async function fetchResidents() {
		if (!homeCode) return;

		fetch(`${API_BASE}/auth/residents/${homeCode}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) throw new Error("Residents not found ");
				return res.json();
			})
			.then((data) => setResidents(data))
			.catch((err) => {
				console.error(err);
				setResidents([]);
			});
	}

	async function fetchGuests() {
		if (!homeCode) return;

		try {
			const res = await fetch(`${API_BASE}/auth/guests/me/${homeCode}`, {
				credentials: "include",
			});

			if (!res.ok) {
				console.log("Guests not found for home code: " + homeCode);
				setGuests([]);
				return;
			}

			const data = await res.json();

			if (Array.isArray(data)) {
				setGuests(data);
			} else {
				setGuests([]);
			}
		} catch (err) {
			console.error(err);
			setGuests([]);
		}
	}
	async function fetchRelationship() {
		if (!homeCode) return;

		fetch(`${API_BASE}/auth/relationship/me/${homeCode}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok)
					console.log(
						"Relationship not found for home code: " + homeCode
					);
				return res.json();
			})
			.then((data) => setRelationship(data.relationship))
			.catch((err) => {
				console.error(err);
				setRelationship("");
			});
		console.log("Relationship: " + relationship);
	}
	useEffect(() => {
		fetchResidents().catch(console.error);
		fetchGuests().catch(console.error);
		fetchRelationship().catch(console.error);
	}, [homeCode]);
	return (
		<div className="flex flex-col">
			{openVotePanel && (
				<Overlay
					isOpen={openVotePanel}
					onClose={() => setOpenVotePanel(false)}
				>
					<GuestVoteOverlay
						guests={guests}
						homeCode={homeCode || ""}
						username={""}
					/>
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
						{ label: "Phone", value: user.phoneNumber || "" },
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
						{ label: "Phone", value: user.phoneNumber || "" },
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
