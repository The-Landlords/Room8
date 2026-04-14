import React from "react";

/*Component is a form field to create a new home object */
type CreateHomeProps = {
	onBack: (data: string) => void;
};
export default function CreateHomeOverlay({ onBack }: CreateHomeProps) {
	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<button
				className="button self-start-safe w-15 "
				onClick={() => onBack("Base")}
			>
				←
			</button>
			<h1 className="header-secondary self-center">Create Home</h1>
			<h2 className="">Home Name : </h2>
			<input
				type="text"
				placeholder="Home Name"
				className="font-secondary color-secondary"
			/>
			<h2 className="">Home Name : </h2>
			<input
				type="text"
				placeholder="Home Address"
				className="font-secondary color-secondary"
			/>
			<button className="button self-center">Create Home</button>
		</div>
	);
}
