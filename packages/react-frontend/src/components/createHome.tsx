import React from "react";

export default function CreateHome() {
	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<h1 className="header-secondary self-center">Create Home</h1>
			<input
				type="text"
				placeholder="Home Name"
				className="font-secondary color-secondary"
			/>
			<input
				type="text"
				placeholder="Home Address"
				className="font-secondary color-secondary"
			/>
			<button className="button self-center">Create Home</button>
		</div>
	);
}
