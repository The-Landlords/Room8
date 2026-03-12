import React from "react";

import { useState } from "react";
import mongoose from "mongoose";

/*component is to add a new home based off a given code*/

type AddHomeProps = {
	onBack: (data: string) => void;
	//onAdd: (data: mongoose.Types.ObjectId) => (void),
	username: string | undefined;
};

export default function AddHomeOverlay({ onBack, username }: AddHomeProps) {
	const [homeCode, setHomeCode] = useState("");

	async function addHome() {
		if (!username) return;
		console.log("connecting home to user!");
		console.log(`http://localhost:8000/relate/${username}/${homeCode}`);
		const relationship = { relationship: "RESIDENT" };
		const res = await fetch(
			`http://localhost:8000/relate/${username}/${homeCode}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(relationship),
			}
		);
		return res;
	}
	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<button
				className="button self-start-safe w-15 "
				onClick={() => onBack("Base")}
			>
				{" "}
				←{" "}
			</button>
			<h1 className="header-secondary self-center">Add Home</h1>
			<input
				placeholder="Home Id"
				className="font-secondary color-secondary"
				onChange={(e) => setHomeCode(e.target.value)}
			/>
			<button className="button self-center" onClick={addHome}>
				Add Home
			</button>
		</div>
	);
}
