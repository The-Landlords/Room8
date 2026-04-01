import { useState, useEffect } from "react";
import List from "./components/list";
import { Link, useParams } from "react-router-dom";
import Overlay from "./components/overlay";
import HomeAddOverlay from "./components/homeAddOverlay";
import AddHomeOverlay from "./components/addHomeOverlay";
import CreateHomeOverlay from "./components/createHomeOverlay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";

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

	async function handleAdd(data: any) {
		setHomes((prev) => [...prev, data]);
		handleClose();
	}
	async function fetchHomes() {
		if (!username) return;

		const res = fetch(`http://localhost:8000/relate/${username}`)
			.then((res) => {
				if (!res.ok) throw new Error("Homes not found");
				return res.json();
			})
			.then((data) => setHomes(data))
			.catch((err) => {
				console.error(err);
				setHomes([]);
			});
	}
	useEffect(() => {
		fetchHomes().catch(console.error);
	}, [username]);

	const homeNames = homes?.map((h) => h.homeName);
	return (
		<div className="background-house relative flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>
			<div className="iconWrapper">
				<Link to={`/settings/${username}`}>
					{/* <img
						src="/assets/settings.png"
						alt="Settings Icon"
						width={60}
						height={60}
						className="w-20 h-20"
					/> */}
					<FontAwesomeIcon
						icon={faUserGear}
						className="w-20 h-20 absolute top-15 right-15 text-7xl"
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
						onAdd={(data: any) => {
							handleAdd(data);
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
			{homeNames.length > 0 && (
				<List
					item={homeNames}
					handleAddClick={handleAddClick}
					handleRemoveClick={handleRemoveClick}
				/>
			)}
			{homeNames.length == 0 && (
				<List
					item={["No Homes: Add below"]}
					handleAddClick={handleAddClick}
					handleRemoveClick={handleRemoveClick}
				/>
			)}
		</div>
	);
}
