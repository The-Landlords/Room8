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
				if (!res.ok) throw new Error("Residents not found");
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
				item="resident"
				items={residents}
				handleAddClick={() => {}}
				handleRemoveClick={() => {}}
			/>
		</div>
	);
}
