import { useState } from "react";
import List from "./components/list";
import { useNavigate } from "react-router-dom";
import Overlay from "./components/overlay";

const homes = ["Home 1", "Home 2", "Home 3", "Home 4"];

export default function HomeList() {
	const navigate = useNavigate();
	const [overlayOpen, setOverlayOpen] = useState(false);

	const handleAddClick = () => {
		console.log("Add!" + overlayOpen);
		setOverlayOpen(true);
	};
	const handleRemoveClick = () => {
		console.log("Remove!");
	};
	const handleClose = () => {
		console.log("Closed!");
		setOverlayOpen(false);
	};
	const handleSettingsClick = () => {
		navigate("/settings");
	};

	return (
		<div className="background-house flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>
			<div className="iconWrapper">
				<img
					onClick={handleSettingsClick}
					src="/assets/settings.png"
					alt="Settings Icon"
					width={60}
					height={60}
					className="w-20 h-20"
				/>
			</div>
			<Overlay isOpen={overlayOpen} onClose={() => handleClose()}>
				<p>Overlay</p>
			</Overlay>
			<List
				item={homes}
				handleAddClick={handleAddClick}
				handleRemoveClick={handleRemoveClick}
			/>
		</div>
	);
}
