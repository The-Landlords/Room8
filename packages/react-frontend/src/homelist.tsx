import { useState } from "react";
import List from "./components/list";

const homes = ["Home 1", "Home 2", "Home 3", "Home 4"];

const handleAddClick = () => {
	console.log("Add!");
};
const handleRemoveClick = () => {
	console.log("Remove!");
};

export default function HomeList() {
	return (
		<div className="background-house flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>
			<List
				item={homes}
				handleAddClick={handleAddClick}
				handleRemoveClick={handleRemoveClick}
			/>
		</div>
	);
}
