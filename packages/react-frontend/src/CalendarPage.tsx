import { useState, useEffect } from "react";
import List from "./components/list";
import Overlay from "./components/overlay";
import { useParams } from "react-router-dom";

export default function CalendarPage() {
	const [events, setEvents] = useState<any[]>([]);
	const [homeName, setHomeName] = useState("");
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const { homeCode, username } = useParams();
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
		setEvents((prev) => [...prev, data]);
		handleClose();
	}
	async function fetchEvents() {
		// FIXME
		//  use homecode from url to fetch home id
		const homeObject = await fetch(
			`http://localhost:8000/homes/code/${homeCode}`
		);
		if (!homeObject.ok) throw new Error("Home not found");

		const data = await homeObject.json();
		const homeObjectId = data._id;

		setHomeName(data.homeName);

		console.log(homeObjectId);
		// use that id to fetch below
		const res = fetch(
			`http://localhost:8000/homeId/${homeObjectId}/events/`
		) // FIXME require username bc of event visibility
			.then((res) => {
				if (!res.ok) throw new Error("Events not found");
				return res.json();
			})
			.then((data) => {
				console.log(data);
				setEvents(data);
			})
			.catch((err) => {
				console.error(err);
				setEvents([]);
			});
	}
	useEffect(() => {
		fetchEvents().catch(console.error);
	}, [username, homeCode]);

	const eventNames = events?.map((e) => e.title);
	const eventIds = events.map((e) => e._id);
	return (
		<div>
			<h1 className="header">Events for {homeName}</h1>
			{events.length > 0 && (
				<List
					item="Events"
					items={eventNames}
					handleAddClick={handleAddClick}
					handleRemoveClick={handleRemoveClick}
					eventIds={eventIds}
				/>
			)}
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
			{events.length == 0 && (
				<List
					item="Events"
					items={["No Events: Add below"]}
					handleAddClick={handleAddClick}
					handleRemoveClick={handleRemoveClick}
				/>
			)}
		</div>
	);
}
