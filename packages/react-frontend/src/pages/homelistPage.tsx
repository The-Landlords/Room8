import { useState, useEffect } from "react";
import List from "../components/list";
import { Link } from "react-router-dom";
import Overlay from "../components/overlay";
import HomeAddOverlay from "../components/homeAddOverlay";
import AddHomeOverlay from "../components/addHomeOverlay";
import CreateHomeOverlay from "../components/createHomeOverlay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear, faMapPin } from "@fortawesome/free-solid-svg-icons";
import RemoveHomeOverlay from "../components/removeHomeOverlay";
import { API_BASE } from "../config";

export default function HomeList() {
	const [homes, setHomes] = useState<any[]>([]);
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const [homeDelete, setHomeDelete] = useState<any | null>(null);
	const handleAddClick = () => {
		console.log("Add!" + overlayOpen);
		setOverlayOpen(true);
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

	async function handleRemove(data: any) {
		setHomes(homes.filter((h) => h._id !== data._id));
		handleClose();
	}

	async function handleRemoveClick(data: any) {
		if (!data) return;
		console.log("Remove " + data);
		setHomeDelete(data);
		setAddState("Remove");
		setOverlayOpen(true);
	}

	async function fetchHomes() {
		fetch(`${API_BASE}/relate/me`, {
			credentials: "include",
		})
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
	}, []);

	const homeNames = homes?.map((h) => h.homeName);
	// const homeLocations = homes?.map((h) => h.address);
	const homeCodes = homes?.map((h) => h.homeCode);
	return (
		<div className="background-house flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>
			<div className="iconWrapper">
				<Link to={`/settings`}>
					<FontAwesomeIcon
						icon={faUserGear}
						className="w-20 h-20 text-7xl"
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
						onAdd={(data: any) => {
							handleAdd(data);
						}}
					/>
				)}
				{addState == "Remove" && (
					<RemoveHomeOverlay
						homeRemove={homeDelete}
						onRemove={(data: any) => {
							handleRemove(data);
						}}
						onCancel={() => {
							setOverlayOpen(false);
							setAddState("Base");
						}}
					/>
				)}
			</Overlay>
			{homeNames.length > 0 && (
				<List
					item="Home Spaces"
					items={homes}
					handleAddClick={handleAddClick}
					handleRemoveClick={(home) => handleRemoveClick(home)}
					homeCode={homeCodes}
					getKey={(home) => home._id}
					renderItem={(home) => (
						<div>
							<div>{home.homeName}</div>
							<div>
								<FontAwesomeIcon
									icon={faMapPin}
									className="text-sm"
								/>
								{home.address}
							</div>
						</div>
					)}
				/>
			)}
			{homeNames.length == 0 && (
				<List<string>
					item="Home Spaces"
					items={["No Homes available! Click below to add."]}
					handleAddClick={handleAddClick}
					handleRemoveClick={(name) => handleRemoveClick(name)}
					homeCode={homeCodes}
					getKey={(name) => name}
					renderItem={(name) => <span>{name}</span>}
				/>
			)}
		</div>
	);
}
