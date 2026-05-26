// import React from "react";

// import { useState } from "react";

/*component is to add a new home based off a given code*/
import { API_BASE } from "../config";

type RemoveHomeProps = {
	onRemove: any;
	homeRemove: any | undefined;
	onCancel: (data: boolean) => void;
};

export default function RemoveHomeOverlay({
	onRemove,
	onCancel,
	homeRemove,
}: RemoveHomeProps) {
	async function removeHome() {
		console.log("connecting home to user!");

		const promise = await fetch(
			`${API_BASE}/relate/me/${homeRemove.homeName}`,
			{
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			}
		);
		return promise;
	}
	async function handleRemoveHome() {
		removeHome()
			.then((res) => (res?.ok ? res.json() : undefined))
			.then((json) => {
				onRemove(json);
			})
			.catch((error) => console.error("Error removing home:", error));
	}

	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<h1 className="header-secondary self-center">
				Are you sure you want to remove {homeRemove.homeName}?
			</h1>
			<div className="flex flex-row gap-4 self-center">
				<button
					className="button self-center"
					onClick={() => onCancel(false)}
				>
					Cancel
				</button>
				<button
					className="button self-center"
					onClick={handleRemoveHome}
				>
					Remove
				</button>
			</div>
		</div>
	);
}
