import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "../components/list";
import AddOverlay from "../components/addOverlay";

type Grocery = {
	_id: string;
	title: string;
	quantity: number;
	price: number;
	homeId: string;
	isShared?: boolean;
	status: "PENDING" | "PURCHASED" | "CANCELLED";
	completedBy?: string;
	completedAt?: string;
};

export default function GroceryPage() {
	const [groceries, setGroceries] = useState<Grocery[]>([]);
	const [showAddOverlay, setShowAddOverlay] = useState(false);
	const navigate = useNavigate();
	const { username = "", homeCode = "" } = useParams();

	function formatGrocery(grocery: Grocery) {
		return `${grocery.title} - Qty: ${grocery.quantity} - $${grocery.price}`;
	}

	async function handleAddGrocery(value: string) {
		try {
			if (!username || !homeCode) return;

			const res = await fetch(
				`http://localhost:8000/${homeCode}/grocery`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						title: value,
						quantity: 1,
						price: 0,
					}),
				}
			);

			if (!res.ok) {
				const message = await res.text();
				throw new Error(`Failed to add grocery: ${message}`);
			}

			const newGrocery = await res.json();
			setGroceries((prev) => [...prev, newGrocery]);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleRemoveGrocery(groceryToRemove: Grocery) {
		try {
			if (!homeCode) return;

			const res = await fetch(
				`http://localhost:8000/${homeCode}/grocery/${groceryToRemove._id}`,
				{
					method: "DELETE",
				}
			);

			if (!res.ok) {
				const message = await res.text();
				throw new Error(`Failed to delete grocery: ${message}`);
			}

			setGroceries((prev) =>
				prev.filter((grocery) => grocery._id !== groceryToRemove._id)
			);
		} catch (err) {
			console.error(err);
		}
	}

	useEffect(() => {
		async function fetchGroceries() {
			try {
				if (!username || !homeCode) return;

				const res = await fetch(
					`http://localhost:8000/${homeCode}/grocery`
				);

				if (!res.ok) {
					const message = await res.text();
					throw new Error(`Failed to fetch groceries: ${message}`);
				}

				const data = await res.json();
				setGroceries(data);
			} catch (err) {
				console.error(err);
				setGroceries([]);
			}
		}

		fetchGroceries();
	}, [username, homeCode]);

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
					Grocery
				</div>
			</div>

			<div className="panel flex flex-col items-center animate-floatUp min-w-[380px] bg-primary/70 p-6">
				<AddOverlay
					isOpen={showAddOverlay}
					title="Add Grocery"
					placeholder="enter grocery item"
					onSubmit={handleAddGrocery}
					onClose={() => setShowAddOverlay(false)}
				/>

				<List
					item="Grocery"
					items={groceries}
					handleAddClick={() => setShowAddOverlay(true)}
					handleRemoveClick={handleRemoveGrocery}
					getKey={(grocery) => grocery._id}
					renderItem={(grocery) => (
						<span>{formatGrocery(grocery)}</span>
					)}
				/>
			</div>
		</div>
	);
}
