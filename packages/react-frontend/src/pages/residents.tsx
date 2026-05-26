import { useState, useEffect } from "react";
import List from "../components/list";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import GuestVoteOverlay from "../components/GuestVoteOverlay";
import Overlay from "../components/overlay";

export default function Residents() {
	const [residents, setResidents] = useState<any[]>([]);
	const [guests, setGuests] = useState<any[]>([]);
	const [relationship, setRelationship] = useState<string>("");
	const { homeCode } = useParams();
	const [openVotePanel, setOpenVotePanel] = useState(false);
	const navigate = useNavigate();
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

		fetch(`${API_BASE}/auth/guests/me/${homeCode}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok)
					console.log("Guests not found for home code: " + homeCode);
				return res.json();
			})
			.then((data) => setGuests(data))
			.catch((err) => {
				console.error(err);
				setGuests([]);
			});
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
			<div className="flex justify-start">
				<button
					type="button"
					onClick={() => navigate(`/homelist/`)}
					className="button h-14 w-14 flex items-center justify-center rounded-xl"
				>
					←
				</button>
			</div>
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
			<div className="flex flex-col items-center">
				<h1 className="header ">Residents</h1>
				<List
					item=""
					items={residents}
					handleAddClick={() => {}}
					handleRemoveClick={() => {}}
					renderItem={(resident) => (
						<div className="flex flex-row gap-4">
							<h1 className="header-secondary">
								{resident.fullName}
							</h1>
							{resident.allergens &&
							resident.allergens.length > 0 ? (
								<p>
									Allergies:
									{resident.allergens?.join(", ") || "None"}
								</p>
							) : (
								<p />
							)}

							{resident.pronouns ? (
								<div>
									<p>
										Dislikes: {resident.pronouns || "N/A"}
									</p>
								</div>
							) : (
								<p />
							)}
							{resident.DOB ? (
								<div>
									<p>
										Date of Birth: {resident.DOB || "N/A"}
									</p>
								</div>
							) : (
								<p />
							)}
							{resident.likes ? (
								<div>
									<p>
										Likes:{" "}
										{resident.likes?.join(", ") || "N/A"}
									</p>
								</div>
							) : (
								<p />
							)}
							{resident.dislikes ? (
								<div>
									<p>
										Dislikes:{" "}
										{resident.dislikes?.join(", ") || "N/A"}
									</p>
								</div>
							) : (
								<p />
							)}
							{resident.emergencyContact ? (
								<div>
									<p>
										Emergency Contact Name:{" "}
										{resident.emergencyContact.name ||
											"N/A"}
									</p>
									<p>
										Emergency Contact Phone:{" "}
										{resident.emergencyContact.phone ||
											"N/A"}
									</p>
									<p>
										Emergency Contact Relationship:{" "}
										{resident.emergencyContact
											.relationship || "N/A"}
									</p>
								</div>
							) : (
								<p />
							)}
						</div>
					)}
					getKey={(resident) => resident._id}
					homeCode={homeCode ? [homeCode] : undefined}
				/>
			</div>
			{guests.length > 0 ? (
				<div className="flex flex-col items-center">
					<h1 className="header ">Guests</h1>
					<List
						item="Guests"
						items={guests}
						handleAddClick={() => {}}
						handleRemoveClick={() => {}}
						renderItem={(guest) => (
							<div className="flex flex-row gap-4">
								<h1 className="header-secondary">
									{guest.fullName}
								</h1>
								{guest.allergies &&
								guest.allergies.length > 0 ? (
									<p>
										Allergies:{" "}
										{guest.allergies.join(", ") || "None"}
									</p>
								) : (
									<p />
								)}

								{guest.pronouns ? (
									<div>
										<p>
											Dislikes: {guest.pronouns || "N/A"}
										</p>
									</div>
								) : (
									<p />
								)}
								{guest.DOB ? (
									<div>
										<p>
											Date of Birth: {guest.DOB || "N/A"}
										</p>
									</div>
								) : (
									<p />
								)}
								{guest.likes ? (
									<div>
										<p>
											Likes:{" "}
											{guest.likes?.join(", ") || "N/A"}
										</p>
									</div>
								) : (
									<p />
								)}
								{guest.dislikes ? (
									<div>
										<p>
											Dislikes:{" "}
											{guest.dislikes?.join(", ") ||
												"N/A"}
										</p>
									</div>
								) : (
									<p />
								)}
								{guest.emergencyContact ? (
									<div>
										<p>
											Emergency Contact Name:{" "}
											{guest.emergencyContact.name ||
												"N/A"}
										</p>
										<p>
											Emergency Contact Phone:{" "}
											{guest.emergencyContact.phone ||
												"N/A"}
										</p>
										<p>
											Emergency Contact Relationship:{" "}
											{guest.emergencyContact
												.relationship || "N/A"}
										</p>
									</div>
								) : (
									<p />
								)}
							</div>
						)}
						getKey={(guest) => guest._id}
						homeCode={homeCode ? [homeCode] : undefined}
					/>
					{relationship === "RESIDENT" && (
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
			) : (
				<p className="text-center mt-4">
					No guests found for this home.
				</p>
			)}
		</div>
	);
}
