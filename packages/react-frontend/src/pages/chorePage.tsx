import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddOverlay from "../components/addOverlay";
import { API_BASE } from "../config";
import Header from "../components/header";
import BaseList from "../components/baseList";

type Chore = {
	_id: string;
	title: string;
	assignedTo?: string;
};

export default function ChorePage() {
	const [chores, setChores] = useState<Chore[]>([]);
	const [showAddOverlay, setShowAddOverlay] = useState(false);
	const { homeCode = "" } = useParams();

	function formatChore(chore: Chore) {
		return chore.assignedTo
			? `${chore.title} (${chore.assignedTo})`
			: chore.title;
	}

	async function handleAddChore(value: string) {
		try {
			if (!homeCode) return;

			const res = await fetch(`${API_BASE}/${homeCode}/chores`, {
				method: "POST",
				credentials: "include",

				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: value,
				}),
			});

			if (!res.ok) throw new Error("Failed to add chore");

			const newChore = await res.json();
			setChores((prev) => [...prev, newChore]);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleRemoveChore(choreToRemove: Chore) {
		try {
			if (!homeCode) return;

			const res = await fetch(
				`${API_BASE}/${homeCode}/chores/${choreToRemove._id}`,
				{
					method: "DELETE",
					credentials: "include",
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
				if (!homeCode) return;

				const res = await fetch(`${API_BASE}/${homeCode}/chores`, {
					credentials: "include",
				});
				if (!res.ok) throw new Error("Failed to fetch chores");

				const data = await res.json();
				setChores(data);
			} catch (err) {
				console.error(err);
				setChores([]);
			}
		}

		fetchChores();
	}, [homeCode]);

	return (
		<div>
			<Header title="Chores" homeCode={homeCode} />

			<div className="flex flex-col items-center animate-floatUp min-w-[380px] p-6">
				<AddOverlay
					isOpen={showAddOverlay}
					title="Add Chore"
					placeholder="enter text"
					onSubmit={handleAddChore}
					onClose={() => setShowAddOverlay(false)}
				/>
				<BaseList
					title="Current Chores"
					items={chores}
					getKey={(chore) => chore._id}
					handleAddClick={() => setShowAddOverlay(true)}
					handleRemoveClick={(chore) => handleRemoveChore(chore)}
					className="panel pb-6"
					addMinus={true}
					emptyMessage="No chores"
					renderItem={(chore) => (
						<div className="flex items-center justify-between w-full">
							<span className="flex flex-row gap-4">
								{formatChore(chore)}
							</span>
						</div>
					)}
				/>
			</div>
		</div>
	);
}
