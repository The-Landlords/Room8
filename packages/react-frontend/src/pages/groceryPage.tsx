import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config";

import AddOverlay from "../components/addOverlay";
import Header from "../components/header";

import BaseList from "../components/baseList";

type Grocery = {
	_id: string;
	title: string;
	quantity: number;
	price?: number;
	homeId: string;
	isShared?: boolean;
	status: "PENDING" | "PURCHASED" | "CANCELLED";
	completedBy?: string;
	completedAt?: string;
};

export default function GroceryPage() {
	const [groceries, setGroceries] = useState<Grocery[]>([]);
	const [showAddOverlay, setShowAddOverlay] = useState(false);
	const [quantity, setQuantity] = useState("1");
	const [price, setPrice] = useState("");

	const { username = "", homeCode = "" } = useParams();

	function resetGroceryForm() {
		setQuantity("1");
		setPrice("");
	}

	async function handleAddGrocery(title: string) {
		try {
			if (!homeCode) return;

			const parsedQuantity = Number(quantity);
			const parsedPrice = price.trim() === "" ? undefined : Number(price);

			if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
				return;
			}

			if (
				parsedPrice !== undefined &&
				(!Number.isFinite(parsedPrice) || parsedPrice < 0)
			) {
				return;
			}

			const res = await fetch(`${API_BASE}/${homeCode}/grocery`, {
				credentials: "include",
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title,
					quantity: parsedQuantity,
					price: parsedPrice ?? 0,
				}),
			});

			if (!res.ok) {
				const message = await res.text();
				throw new Error(`Failed to add grocery: ${message}`);
			}

			const newGrocery = await res.json();
			setGroceries((prev) => [...prev, newGrocery]);
			resetGroceryForm();
		} catch (err) {
			console.error(err);
		}
	}

	async function handleRemoveGrocery(groceryToRemove: Grocery) {
		try {
			if (!homeCode) return;

			const res = await fetch(
				`${API_BASE}/${homeCode}/grocery/${groceryToRemove._id}`,
				{
					method: "DELETE",
					credentials: "include",
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
				if (!homeCode) return;

				const res = await fetch(`${API_BASE}/${homeCode}/grocery`, {
					credentials: "include",
				});

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
		<div className="flex flex-col items-center-safe">
			<Header title="Groceries" homeCode={homeCode} />

			<AddOverlay
				isOpen={showAddOverlay}
				title="Add Grocery"
				placeholder="enter grocery item"
				onSubmit={handleAddGrocery}
				onClose={() => {
					resetGroceryForm();
					setShowAddOverlay(false);
				}}
			>
				<input
					type="number"
					placeholder="Quantity"
					className="input-field"
					value={quantity}
					min="1"
					step="1"
					onChange={(e) => setQuantity(e.target.value)}
				/>

				<input
					type="number"
					placeholder="Price, optional"
					className="input-field"
					value={price}
					min="0"
					step="0.01"
					onChange={(e) => setPrice(e.target.value)}
				/>
			</AddOverlay>

			<BaseList
				title="Current Groceries"
				items={groceries}
				getKey={(grocery) => grocery._id}
				handleAddClick={() => setShowAddOverlay(true)}
				handleRemoveClick={(grocery) => handleRemoveGrocery(grocery)}
				className="panel pb-6"
				addMinus={true}
				emptyMessage="No Groceries"
				renderItem={(grocery) => (
					<div className="flex items-center w-full gap-4">
						<span className="flex-1 text-left truncate">
							{grocery.title}
						</span>

						<span className="flex-1 text-center">
							Qty: {grocery.quantity}
						</span>

						<span className="flex-1 text-right">
							{grocery.price === undefined
								? ""
								: `$${grocery.price.toFixed(2)}`}
						</span>
					</div>
				)}
			/>
		</div>
	);
}
