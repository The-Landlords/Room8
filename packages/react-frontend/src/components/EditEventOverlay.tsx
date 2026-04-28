import { useState } from "react";

interface EditEventOverlayProps {
	eventEdit: any;
	onEdit: (event: any) => void;
	onCancel: () => void;
}

export default function EditEventOverlay({
	eventEdit,
	onEdit,
	onCancel,
}: EditEventOverlayProps) {
	const [title, setTitle] = useState(eventEdit?.title || "");
	const [start, setStart] = useState(
		eventEdit?.start ? new Date(eventEdit.start).toISOString().slice(0, 16) : ""
	);
	const [end, setEnd] = useState(
		eventEdit?.end ? new Date(eventEdit.end).toISOString().slice(0, 16) : ""
	);
	const [location, setLocation] = useState(eventEdit?.location || "");
	const [description, setDescription] = useState(eventEdit?.description || "");
	const [status, setStatus] = useState(eventEdit?.status || "");

	async function handleEditEvent(e: React.FormEvent) {
		e.preventDefault();

		const startDate = new Date(start);
		const endDate = new Date(end);

		if (startDate >= endDate) {
			alert("Start time must be before end time.");
			return;
		}

		if (!eventEdit?._id) {
			throw new Error("Missing event id");
		}

		const res = await fetch(`http://localhost:8000/events/${eventEdit._id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title,
				start,
				end,
				location,
				description,
				status,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.error || "Failed to edit event");
		}

		onEdit(data);
	}

	return (
		<form onSubmit={handleEditEvent} className="flex flex-col gap-4">
			<h2>Edit Event</h2>

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

			<select
				value={status}
				onChange={(e) => setStatus(e.target.value)}
				className="font-secondary color-secondary"
			>
				<option value="">Select status</option>
				<option value="pending">Pending</option>
				<option value="confirmed">Confirmed</option>
				<option value="cancelled">Cancelled</option>
			</select>

			<div className="flex gap-2">
				<button type="button" className="button self-center" onClick={onCancel}>
					Cancel
				</button>
				<button type="submit" className="button self-center">
					Update Event
				</button>
			</div>
		</form>
	);
}