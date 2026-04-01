import React from "react";

import { useState } from "react";
//import mongoose from "mongoose";

/*component is to add a new home based off a given code*/

type AddHomeProps = {
	onBack: (data: string) => void;
	onAdd: any;
	username: string | undefined;
};

export default function AddHomeOverlay({
	onBack,
	onAdd,
	username,
}: AddHomeProps) {
	const [homeCode, setHomeCode] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	async function addHome() {
		if (!username) return;
		console.log("connecting home to user!");
		const relationship = { relationship: "RESIDENT" };
		const promise = await fetch(
			`http://localhost:8000/relate/${username}/${homeCode}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(relationship),
			}
		);
		return promise;
	}
	async function handleAddHome() {
		addHome()
			.then((res) => (res && res.status === 201 ? res.json() : undefined))
			.then((json) => {
				if (!json) {
					setErrorMsg("Home not found with given code");
					return;
				}
				onAdd(json);
			})
			.catch((error) => setErrorMsg("Error posting home:" + error));
	}

	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<button
				className="button self-start-safe w-15 "
				onClick={() => onBack("Base")}
			>
				←
			</button>
			<h1 className="header-secondary self-center">Add Home</h1>
			<input
				placeholder="Home Id"
				className="font-secondary color-secondary"
				onChange={(e) => setHomeCode(e.target.value)}
			/>
			{errorMsg && (
				<p className="text-red-500 text-sm text-center mt-2">
					{errorMsg}
				</p>
			)}
			<button className="button self-center" onClick={handleAddHome}>
				Add Home
			</button>
		</div>
	);
}
