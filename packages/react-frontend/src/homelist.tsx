import { useState } from "react";
import List from "./components/list";
import { useNavigate } from "react-router-dom";

const homes = ["Home 1", "Home 2", "Home 3", "Home 4"];

const handleAddClick = () => {
	console.log("Add!");
};
const handleRemoveClick = () => {
	console.log("Remove!");
};

const handleSettingsClick = () => {
	const navigate = useNavigate();
	navigate("/settings");
};

export default function HomeList() {
	return (
		<div className="background-house flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>
			<div className="iconWrapper">
				<img
					onClick={handleSettingsClick}
					src="/public/assets/settings.png"
					alt="Settings Icon"
					width={60}
					height={60}
					className="w-20 h-20"
				/>
			</div>
			<List
				item={homes}
				handleAddClick={handleAddClick}
				handleRemoveClick={handleRemoveClick}
			/>
		</div>
	);
}
