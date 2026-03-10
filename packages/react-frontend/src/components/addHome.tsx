import React from "react";

export default function AddHome() {
	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<h1 className="header-secondary self-center">Add Home</h1>
			<input
				type="text"
				placeholder="Home Id"
				className="font-secondary color-secondary"
			/>
			<button className="button self-center">Add Home</button>
		</div>
	);
}
