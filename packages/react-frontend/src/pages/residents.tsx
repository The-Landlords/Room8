import { useState, useEffect } from "react";
import List from "../components/list";
import { Link, useParams } from "react-router-dom";

export default function Residents() {
	const [residents, setResidents] = useState<any[]>([]);
	const { username, homeCode } = useParams();
	async function fetchResidents() {
		if (!username || !homeCode) return;

		fetch(`http://localhost:8000/auth/${username}/${homeCode}`)
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
	useEffect(() => {
		fetchResidents().catch(console.error);
	}, [username, homeCode]);
	return (
		<div>
			<h1>Residents</h1>
			<List
				item="Residents"
				items={residents}
				handleAddClick={() => {}}
				handleRemoveClick={() => {}}
				renderItem={(resident) => (
					<div className="flex flex-row gap-4">
						<h1 className="header-secondary">
							{resident.fullName}
						</h1>
						<p>
							Allergens: {resident.allergens.join(", ") || "None"}
						</p>
						{resident.pronouns ? (
							<div>
								<p>Dislikes: {resident.pronouns || "N/A"}</p>
							</div>
						) : (
							<p>Dislikes: Hidden</p>
						)}
						<p>Date of Birth: {resident.DOB || "N/A"}</p>
						{resident.likes ? (
							<div>
								<p>
									Likes: {resident.likes?.join(", ") || "N/A"}
								</p>
							</div>
						) : (
							<p>Likes: Hidden</p>
						)}
						{resident.dislikes ? (
							<div>
								<p>
									Dislikes:{" "}
									{resident.dislikes?.join(", ") || "N/A"}
								</p>
							</div>
						) : (
							<p>Dislikes: Hidden</p>
						)}
						{resident.emergencyContact ? (
							<div>
								<p>
									Emergency Contact Name:{" "}
									{resident.emergencyContact.name || "N/A"}
								</p>
								<p>
									Emergency Contact Phone:{" "}
									{resident.emergencyContact.phone || "N/A"}
								</p>
								<p>
									Emergency Contact Relationship:{" "}
									{resident.emergencyContact.relationship ||
										"N/A"}
								</p>
							</div>
						) : (
							<p>Emergency Contact: Hidden</p>
						)}
					</div>
				)}
				getKey={(resident) => resident._id}
				username={username}
				homeCode={homeCode ? [homeCode] : undefined}
			/>
		</div>
	);
}
