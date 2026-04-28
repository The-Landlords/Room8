import { useState } from "react";

interface AddEventOverlayProps {
	homeCode?: string;
	username?: string;
	onAdd: (event: any) => void;
	onCancel: () => void;
}

export default function AddEventOverlay({
	homeCode,
	username,
	onAdd,
	onCancel,
}: AddEventOverlayProps) {
	const [title, setTitle] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [location, setLocation] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	

	async function handleAddEvent(e: React.FormEvent) {
		e.preventDefault();
		if (!title || !start || !end || !location || !description) {
			setErrorMsg("All fields must be filled out.");
			return;
		}

		const startDate = new Date(start);
		const endDate = new Date(end);

		if (startDate >= endDate) {
			alert("Start time must be before end time.");
			return;
		}

		const res = await fetch(`http://localhost:8000/${homeCode}/events`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title,
				start,
				end,
				location,
				username,
				description
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.error || "Failed to create event");
		}

		onAdd(data);
	}

	return (
		<form onSubmit={handleAddEvent} className="flex flex-col gap-4">
			<h2>Add Event</h2>

			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Title"
				className="font-secondary color-secondary"
			/>
			<input
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Description"
				className="font-secondary color-secondary"
			/>

			<input
				type="datetime-local"
				value={start}
				onChange={(e) => setStart(e.target.value)}
				className="font-secondary color-secondary"
			/>

			<input
				type="datetime-local"
				value={end}
				min={start}
				onChange={(e) => setEnd(e.target.value)}
				className="font-secondary color-secondary"
			/>

			<input
				value={location}
				onChange={(e) => setLocation(e.target.value)}
				placeholder="Location"
				className="font-secondary color-secondary"
			/>

			{errorMsg && (
				<p className="text-red-500 text-sm text-center mt-2">
					{errorMsg}
				</p>
			)}
			{/* FIXME add status display bar of approval depending on persons in the house */}

			<div className="flex gap-2">
				<button className="button self-center" onClick={handleAddEvent}>
					Add Event
				</button>
			</div>
		</form>
	);
}