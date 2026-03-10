import React from "react";
import { useState } from "react";
export default function AddHomeOverlay() {
	const [state, setState] = useState("");
	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<h1 className="header-secondary self-center">Add Options</h1>
			<button
				className="button self-center"
				onClick={() => setState("Add")}
			>
				Add Home
			</button>
			<p className=" font-secondary color-secondary italic self-center">
				Or
			</p>
			<button
				className="button self-center"
				onClick={() => setState("Create")}
			>
				Create Home
			</button>
		</div>
	);
}
