import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "../components/list";
import AddOverlay from "../components/addOverlay";
import { API_BASE } from "../config";

type Chore = {
	_id: string;
	title: string;
	assignedTo?: string;
};

export default function ChorePage() {
	const [chores, setChores] = useState<Chore[]>([]);
	const [homeName, setHomeName] = useState("");
	const [showAddOverlay, setShowAddOverlay] = useState(false);
	const { homeCode = "" } = useParams();
	const navigate = useNavigate();

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

				const homeRes = await fetch(
					`${API_BASE}/homes/code/${homeCode}`,
					{
						credentials: "include",
					}
				);

				if (!homeRes.ok) {
					throw new Error("Failed to fetch home");
				}

				const homeData = await homeRes.json();

				setHomeName(homeData.homeName || "");
			} catch (err) {
				console.error(err);
				setChores([]);
			}
		}

		fetchChores();
	}, [homeCode]);

	return (
		<div>
			<header className="header-wrapper">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="button"
				>
					← Back
				</button>

				<h1 className="header flex-1 text-center">
					Chores for {homeName}
				</h1>
			</header>

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
					items={chores}
					handleAddClick={() => setShowAddOverlay(true)}
					handleRemoveClick={handleRemoveChore}
					getKey={(chore) => chore._id}
					renderItem={(chore) => <span>{formatChore(chore)}</span>}
				/>
			</div>
		</div>
	);
}
