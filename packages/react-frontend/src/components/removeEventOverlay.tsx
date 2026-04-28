import React from "react";

type RemoveEventProps = {
	onRemove: (data: any) => void;
	eventRemove: any;
	onCancel: () => void;
};

export default function RemoveEventOverlay({
	onRemove,
	onCancel,
	eventRemove,
}: RemoveEventProps) {
	async function handleRemoveEvent() {
		try {
			if (!eventRemove?._id) {
				console.error("Missing event id", eventRemove);
				return;
			}

			const res = await fetch(
				`http://localhost:8000/events/${eventRemove._id}`,
				{
					method: "DELETE",
				}
			);

			console.log("delete status:", res.status);

			if (!res.ok) {
				const err = await res.text();
				console.error("delete failed:", err);
				throw new Error("Failed to remove event");
			}

			onRemove(eventRemove);
		} catch (error) {
			console.error("Error removing event:", error);
		}
	}

	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<h1 className="header-secondary self-center">
				Are you sure you want to remove {eventRemove?.title}?
			</h1>

			<div className="flex flex-row gap-4 self-center">
				<button className="button self-center" onClick={onCancel}>
					Cancel
				</button>

				<button
					type="button"
					className="button self-center"
					onClick={handleRemoveEvent}
				>
					Remove
				</button>
			</div>
		</div>
	);
}
