import { useState, useEffect } from "react";
import List from "../components/list";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import GuestVoteOverlay from "../components/GuestVoteOverlay";
import Overlay from "../components/overlay";

type User = {
	_id: string;
	fullName: string;
	allergens: string[];
	likes: string[];
	dislikes: string[];
};

export default function Residents() {
	const [residents, setResidents] = useState<User[]>([]);
	const [guests, setGuests] = useState<User[]>([]);
	const [relationship, setRelationship] = useState<string>("");

	const { homeCode } = useParams();
	const navigate = useNavigate();

	const [openVotePanel, setOpenVotePanel] = useState(false);


	function normalizeUsers(data: any): User[] {
		if (!Array.isArray(data)) return [];

		return data
			.filter((u) => u && u._id)
			.map((u) => ({
				_id: String(u._id),
				fullName: String(u.fullName ?? "Unknown User"),
				allergens: Array.isArray(u.allergens) ? u.allergens : [],
				likes: Array.isArray(u.likes) ? u.likes : [],
				dislikes: Array.isArray(u.dislikes) ? u.dislikes : [],
			}));
	}

	async function fetchResidents() {
		if (!homeCode) return;

		try {
			const res = await fetch(
				`${API_BASE}/auth/residents/${homeCode}`,
				{ credentials: "include" }
			);

			const data = await res.json();
			setResidents(normalizeUsers(data));
		} catch {
			setResidents([]);
		}
	}

	async function fetchGuests() {
		if (!homeCode) return;

		try {
			const res = await fetch(
				`${API_BASE}/auth/guests/me/${homeCode}`,
				{ credentials: "include" }
			);

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
			<div className="flex justify-start">
				<button
					type="button"
					onClick={() => navigate(`/homelist/`)}
					className="button h-14 w-14 flex items-center justify-center rounded-xl"
				>
					←
				</button>
			</div>

			{openVotePanel && homeCode && (
				<Overlay
					isOpen={openVotePanel}
					onClose={() => setOpenVotePanel(false)}
				>
					<GuestVoteOverlay homeCode={homeCode} />
				</Overlay>
			)}

			{/* RESIDENTS */}
			<div className="flex flex-col items-center">
				<h1 className="header">Residents</h1>

				<List
					item=""
					items={residents}
					handleAddClick={() => { }}
					handleRemoveClick={() => { }}
					getKey={(r) => r._id}
					renderItem={(r) => (
						<div className="flex flex-row gap-4">
							<h1 className="header-secondary">{r.fullName}</h1>

							{r.allergens.length > 0 && (
								<p>Allergies: {r.allergens.join(", ")}</p>
							)}

							{r.likes.length > 0 && (
								<p>Likes: {r.likes.join(", ")}</p>
							)}

							{r.dislikes.length > 0 && (
								<p>Dislikes: {r.dislikes.join(", ")}</p>
							)}
						</div>
					)}
				/>
			</div>

			{/* GUESTS */}
			{guests.length > 0 ? (
				<div className="flex flex-col items-center">
					<h1 className="header">Guests</h1>

					<List
						item="Guests"
						items={guests}
						handleAddClick={() => { }}
						handleRemoveClick={() => { }}
						getKey={(g) => g._id}
						renderItem={(g) => (
							<div className="flex flex-row gap-4">
								<h1 className="header-secondary">{g.fullName}</h1>

								{g.likes.length > 0 && (
									<p>Likes: {g.likes.join(", ")}</p>
								)}

								{g.dislikes.length > 0 && (
									<p>Dislikes: {g.dislikes.join(", ")}</p>
								)}
							</div>
						)}
					/>

					{relationship === "RESIDENT" && (
						<button
							className="button mt-4"
							onClick={() => setOpenVotePanel(true)}
						>
							Vote
						</button>
					)}
				</div>
			) : (
				<p className="text-center mt-4">
					No guests found for this home.
				</p>
			)}
		</div>
	);
}