import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "./components/list";
import AddOverlay from "./components/addOverlay";

type Chore = {
	_id: string;
	title: string;
	assignedTo?: string;
};

export default function ChorePage() {
	const [chores, setChores] = useState<Chore[]>([]);
	const [showAddOverlay, setShowAddOverlay] = useState(false);
	const { username = "", homeCode = "" } = useParams();
	const navigate = useNavigate();

	function formatChore(chore: Chore) {
		return chore.assignedTo
			? `${chore.title} (${chore.assignedTo})`
			: chore.title;
	}

	async function handleAddChore(value: string) {
		try {
			if (!username || !homeCode) return;

			const res = await fetch(
				`http://localhost:8000/${homeCode}/chores`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						title: value,
					}),
				}
			);

			if (!res.ok) throw new Error("Failed to add chore");

			const newChore = await res.json();
			setChores((prev) => [...prev, newChore]);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleRemoveChore(itemText: string) {
		try {
			if (!homeCode) return;

			const choreToRemove = chores.find(
				(chore) => formatChore(chore) === itemText
			);

			if (!choreToRemove) return;

			const res = await fetch(
				`http://localhost:8000/${homeCode}/chores/${choreToRemove._id}`,
				{
					method: "DELETE",
				}
			);

			if (!res.ok) throw new Error("Failed to delete chore");

			setChores((prev) =>
				prev.filter((chore) => chore._id !== choreToRemove._id)
			);
		} catch (err) {
			console.error(err);
		}
	}

	useEffect(() => {
		async function fetchChores() {
			try {
				if (!username || !homeCode) return;

				const res = await fetch(
					`http://localhost:8000/${homeCode}/chores`
				);
				if (!res.ok) throw new Error("Failed to fetch chores");

				const data = await res.json();
				setChores(data);
			} catch (err) {
				console.error(err);
				setChores([]);
			}
		}

		fetchChores();
	}, [username, homeCode]);

	const displayChores = chores.map(formatChore);

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
				<AddOverlay
					isOpen={showAddOverlay}
					title="Add Chore"
					placeholder="enter text"
					onSubmit={handleAddChore}
					onClose={() => setShowAddOverlay(false)}
				/>
				<List
					item="Chores"
					items={displayChores}
					handleAddClick={() => setShowAddOverlay(true)}
					handleRemoveClick={(item: string) =>
						handleRemoveChore(item)
					}
				/>
			</div>
		</div>
	);
}
