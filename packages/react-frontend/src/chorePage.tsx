import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "./components/list";

export default function ChorePage() {
	const [chores, setChores] = useState<string[]>([]);
	const { username = "", homeCode = "" } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchChores() {
			try {
				if (!username || !homeCode) return;

				const res = await fetch(
					`http://localhost:8000/${username}/${homeCode}/chores`
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
	}, [username, homeCode]);

	const displayChores = chores.length > 0 ? chores : ["All chores done :)"];

	return (
		<div>
			<div className="relative mb-4 pt-2">
				<button
					onClick={() => navigate(-1)}
					className="button absolute left-4 top-1/2 -translate-y-1/2 px-4 py-2 text-2xl"
				>
					←
				</button>

				<div className="header mx-auto w-fit px-8 py-3 text-center">
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
