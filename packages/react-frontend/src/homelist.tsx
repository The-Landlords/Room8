import { useState, useEffect } from "react";
import List from "./components/list";
import { Link, useParams } from "react-router-dom";
import Overlay from "./components/overlay";
import HomeAddOverlay from "./components/homeAddOverlay";
import AddHomeOverlay from "./components/addHomeOverlay";
import CreateHomeOverlay from "./components/createHomeOverlay";

//const homes = ["Home 1", "Home 2", "Home 3", "Home 4"];

export default function HomeList() {
	const [homes, setHomes] = useState<any[]>([]);
	const { username } = useParams();
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const handleAddClick = () => {
		console.log("Add!" + overlayOpen);
		setOverlayOpen(true);
	};
	const handleRemoveClick = () => {
		console.log("Remove!");
	};
	const handleClose = () => {
		console.log("Closed!");
		setAddState("Base");
		setOverlayOpen(false);
	};

	useEffect(() => {
		if (!username) return;

		fetch(`http://localhost:8000/relate/${username}`)
			.then((res) => {
				if (!res.ok) throw new Error("Homes not found");
				return res.json();
			})
			.then((data) => setHomes(data))
			.catch((err) => {
				console.error(err);
				setHomes([]);
			});
	}, [username]);

	const homeNames = homes?.map((h) => h.homeName);
	return (
		<div className="background-house flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>
			<div className="iconWrapper">
				<Link to={`/settings/${username}`}>
					<img
						src="/assets/settings.png"
						alt="Settings Icon"
						width={60}
						height={60}
						className="w-20 h-20"
					/>
				</Link>
			</div>
			<Overlay isOpen={overlayOpen} onClose={() => handleClose()}>
				{addState == "Base" && (
					<HomeAddOverlay
						onPick={(data) => {
							setAddState(data);
						}}
					/>
				)}
				{addState == "Add" && (
					<AddHomeOverlay
						username={username}
						onBack={(data) => {
							setAddState(data);
						}}
					/>
				)}
				{addState == "Create" && (
					<CreateHomeOverlay
						onBack={(data) => {
							setAddState(data);
						}}
					/>
				)}
			</Overlay>
			<List
				item={homeNames}
				handleAddClick={handleAddClick}
				handleRemoveClick={handleRemoveClick}
			/>
		</div>
	);
}
