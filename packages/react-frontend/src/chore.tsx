import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "./components/list";

export default function ChorePage() {
	const [chores, setChores] = useState<string[]>([]);
	const { homeId = "" } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchChores() {
			try {
				if (!homeId) return;

				const res = await fetch(
					`http://localhost:8000/chores/${homeId}`
				);
				if (!res.ok) throw new Error("Failed to fetch chores");

				const data = await res.json();

				const formatted = data.map(
					(chore: any) => `${chore.title} (${chore.assignedTo})`
				);

				setChores(formatted);
			} catch (err) {
				console.error(err);
				setChores([]);
			}
		}

		fetchChores();
	}, [homeId]);

	const displayChores = chores.length > 0 ? chores : ["All chores done :)"];

	return (
		<div>
			<div className="mb-4 pl-4 pt-2 flex items-center gap-4">
				<button
					onClick={() => navigate(-1)}
					className="button px-4 py-2 text-2xl"
				>
					←
				</button>

				<div className="header inline-flex items-center justify-center px-8 py-3">
					Chores
				</div>
			</div>

			<div className="panel flex flex-col items-center animate-floatUp min-w-[380px] bg-primary/70 p-6">
				<List
					item="Chores"
					items={displayChores}
					handleAddClick={() => console.log("add chore")}
					handleRemoveClick={() => console.log("remove chore")}
				/>
			</div>
		</div>
	);
}
