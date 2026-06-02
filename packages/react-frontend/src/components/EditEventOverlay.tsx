import { useState } from "react";
import { API_BASE } from "../config";
interface EditEventOverlayProps {
	eventEdit: any;
	onEdit: (event: any) => void;
	onCancel: () => void;
}

function toDatetimeLocalValue(dateString: string) {
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "";

	const pad = (num: number) => String(num).padStart(2, "0");

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());

	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EditEventOverlay({
	eventEdit,
	onEdit,
	onCancel,
}: EditEventOverlayProps) {
	const [title, setTitle] = useState(eventEdit?.title || "");
	const [start, setStart] = useState(
		eventEdit?.start ? toDatetimeLocalValue(eventEdit.start) : ""
	);

	const [end, setEnd] = useState(
		eventEdit?.end ? toDatetimeLocalValue(eventEdit.end) : ""
	);
	const [location, setLocation] = useState(eventEdit?.location || "");
	const [description, setDescription] = useState(
		eventEdit?.description || ""
	);
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

		const res = await fetch(`${API_BASE}/events/${eventEdit._id}`, {
			method: "PATCH",
			credentials: "include",
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
		<form
			onSubmit={handleEditEvent}
			className="flex flex-col gap-4 items-center-safe"
		>
			<h2 className="header-secondary">Edit Event</h2>

			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Title"
				className="input-field"
			/>

			<input
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Description"
				className="input-field"
			/>

			<input
				type="datetime-local"
				value={start}
				onChange={(e) => setStart(e.target.value)}
				className="input-field"
			/>

			<input
				type="datetime-local"
				value={end}
				min={start}
				onChange={(e) => setEnd(e.target.value)}
				className="input-field"
			/>

			<input
				value={location}
				onChange={(e) => setLocation(e.target.value)}
				placeholder="Location"
				className="input-field"
			/>

			<select
				value={status}
				onChange={(e) => setStatus(e.target.value)}
				className="input-field"
			>
				<option value="">Select status</option>
				<option value="pending">Pending</option>
				<option value="confirmed">Confirmed</option>
				<option value="cancelled">Cancelled</option>
			</select>

			<div className="flex gap-2">
				<button
					type="button"
					className="button self-center"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button type="submit" className="button self-center">
					Update Event
				</button>
			</div>
		</form>
	);
}
