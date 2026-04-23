import { useState, useEffect } from "react";
import List from "./components/list";
import Overlay from "./components/overlay";
import { useParams } from "react-router-dom";
import { faClock, faMapPin } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddEventOverlay from "./components/addEventOverlay";
import RemoveEventOverlay from "./components/removeEventOverlay";
import EditEventOverlay from "./components/editEventOverlay";

export default function CalendarPage() {
	const [events, setEvents] = useState<any[]>([]);
	const [homeName, setHomeName] = useState("");
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const [eventDelete, setEventDelete] = useState<any>();
	const { homeCode, username } = useParams();
	const [eventEdit, setEventEdit] = useState<any>(null);



	const handleAddClick = () => {
		console.log("Add!" + overlayOpen);
		setAddState("Add");
		setOverlayOpen(true);
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

	async function handleRemove(data: any) {
		setEvents((prev) => prev.filter((e) => e._id !== data._id));
		handleClose();
	}

	async function handleRemoveClick(data: any) {
		console.log("Remove ", data);
		setEventDelete(data);
		setAddState("Remove");
		setOverlayOpen(true);
	}

	async function handleEditClick(event: any) {
		setEventEdit(event);
		setAddState("Edit");
		setOverlayOpen(true);
	}

	async function handleEdit(updatedEvent: any) {
		setEvents((prev) =>
			prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
		);
		handleClose();
	}
	async function fetchEvents() {
		const homeObject = await fetch(
			`http://localhost:8000/homes/code/${homeCode}`
		);
		if (!homeObject.ok) throw new Error("Home not found");

		const data = await homeObject.json();
		const homeObjectId = data._id;

		setHomeName(data.homeName);

		fetch(`http://localhost:8000/homeId/${homeObjectId}/events/`)
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

	return (
		<div>
			<h1 className="header">Events for {homeName}</h1>

			<Overlay isOpen={overlayOpen} onClose={() => handleClose()}>
				{addState === "Add" && (
					<AddEventOverlay
						homeCode={homeCode}
						username={username}
						onAdd={(data: any) => {
							handleAdd(data);
						}}
						onCancel={() => {
							setOverlayOpen(false);
							setAddState("Base");
						}}
					/>
				)}

				{addState === "Remove" && (
					<RemoveEventOverlay
						eventRemove={eventDelete}
						onRemove={(data: any) => {
							handleRemove(data);
						}}
						onCancel={() => {
							setOverlayOpen(false);
							setAddState("Base");
						}}
					/>
				)}
				{addState === "Edit" && (
					<EditEventOverlay
						eventEdit={eventEdit}
						onEdit={handleEdit}
						onCancel={handleClose}
					/>
				)}
			</Overlay>

			{events.length > 0 && (
				<List
					item="Events"
					items={events}
					handleAddClick={handleAddClick}
					handleRemoveClick={(event) => handleRemoveClick(event)}
					handleEditClick={(event) => handleEditClick(event)}
					getKey={(event) => event._id}
					renderItem={(event) => (
						<div>
							<div>{event.title}</div>
							<div className="text-sm">{event.description}</div>
							<div className="text-sm flex items-center gap-2">
								<FontAwesomeIcon icon={faClock} />
								<span>
									{new Date(event.start).toLocaleDateString("en-US", {
										weekday: "long",
										month: "short",
										day: "numeric",
									})}
								</span>
								<span>
									{new Date(event.start).toLocaleTimeString("en-US", {
										hour: "numeric",
										minute: "2-digit",
									})}
								</span>
								<span>-</span>
								<span>
									{new Date(event.end).toLocaleTimeString("en-US", {
										hour: "numeric",
										minute: "2-digit",
									})}
								</span>
								<FontAwesomeIcon icon={faMapPin} className="ml-2" />
								<span>{event.location}</span>
							</div>
						</div>
					)}
					eventIds={events.map((e) => e._id)}
				/>
			)}

			{events.length == 0 && (
				<List<string>
					item="Events"
					items={["No Events available! Click below to add."]}
					handleAddClick={handleAddClick}
					handleRemoveClick={(event) => handleRemoveClick(event)}
					handleEditClick={(event) => handleEditClick(event)}
					getKey={(item) => item}
					renderItem={(item) => <span>{item}</span>}
				/>
			)}
		</div>
	);
}