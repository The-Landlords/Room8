import HomeSpaceList from "../components/homeList";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Overlay from "../components/overlay";
import HomeAddOverlay from "../components/homeAddOverlay";
import AddHomeOverlay from "../components/addHomeOverlay";
import CreateHomeOverlay from "../components/createHomeOverlay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear, faMapPin } from "@fortawesome/free-solid-svg-icons";
import RemoveHomeOverlay from "../components/removeHomeOverlay";
import { API_BASE } from "../config";

type Home = {
	_id: string;
	homeCode: string;
	homeName: string;
	address: string;
	relationship?: string;
};

export default function HomeList() {
	const [homes, setHomes] = useState<Home[]>([]);
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const [homeDelete, setHomeDelete] = useState<Home | null>(null);
	const handleAddClick = () => {
		console.log("Add!" + overlayOpen);
		setOverlayOpen(true);
	};
	const handleClose = () => {
		console.log("Closed!");
		setAddState("Base");
		setOverlayOpen(false);
	};

	async function handleAdd(data: any, relationship: string) {
		const homeWithRelationship = {
			...data,
			relationship,
		};

		setHomes((prev) => [...prev, homeWithRelationship]);
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

	function getRelationship(home: any): string {
		const relationship = home.relationship;
		if (relationship === "RESIDENT") return "RESIDENT";
		if (relationship === "GUEST") return "GUEST";
		return "";
	}

	return (
		<div className=" flex flex-col items-center">
			<h1 className="header">Home Spaces</h1>

			<Link
				to={`/settings`}
				className="aspect-square w-[20%] min-w-10 max-w-20 flex items-center justify-center self-end-safe  p-2 pr-5"
			>
				<FontAwesomeIcon icon={faUserGear} className="button text-xl" />
			</Link>

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
							handleAdd(data, "GUEST");
						}}
					/>
				)}
				{addState == "Create" && (
					<CreateHomeOverlay
						onBack={(data) => {
							setAddState(data);
						}}
						onAdd={(data: any) => {
							handleAdd(data, "RESIDENT");
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

			<HomeSpaceList
				className="panel"
				items={homes}
				handleAddClick={handleAddClick}
				handleRemoveClick={(home) => handleRemoveClick(home)}
				homeCode={(home) => home.homeCode}
				getKey={(home) => home._id}
				getRelationship={(home) => getRelationship(home)}
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
		</div>
	);
}
