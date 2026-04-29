import { useState, useEffect } from "react";
import List from "../components/list";
import Overlay from "../components/overlay";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faClock,
	faMapPin,
	faCaretRight,
	faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import AddEventOverlay from "../components/AddEventOverlay";
import RemoveEventOverlay from "../components/RemoveEventOverlay";
import EditEventOverlay from "../components/EditEventOverlay";

export default function CalendarPage() {
	const [events, setEvents] = useState<any[]>([]);
	const [homeName, setHomeName] = useState("");
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const [eventDelete, setEventDelete] = useState<any>();
	const { homeCode, username } = useParams();
	const [eventEdit, setEventEdit] = useState<any>(null);
	const [showUpcoming, setShowUpcoming] = useState(true);
	const [showPast, setShowPast] = useState(false);

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
			`https://room8-bqgagjd0cndffae5.canadacentral-01.azurewebsites.net/homes/code/${homeCode}`
		);
		if (!homeObject.ok) throw new Error("Home not found");

		const data = await homeObject.json();
		const homeObjectId = data._id;

		setHomeName(data.homeName);

		fetch(
			`https://room8-bqgagjd0cndffae5.canadacentral-01.azurewebsites.net/homeId/${homeObjectId}/events/`
		)
			.then((res) => {
				if (!res.ok) throw new Error("Events not found");
				return res.json();
			})
			.then((data) => {
				const sorted = data.sort(
					(a: any, b: any) =>
						new Date(a.start).getTime() -
						new Date(b.start).getTime()
				);
				setEvents(sorted);
			})
			.catch((err) => {
				console.error(err);
				setEvents([]);
			});
	}

	useEffect(() => {
		fetchEvents().catch(console.error);
	}, [username, homeCode]);

	const now = new Date();

	const upcomingEvents = events
		.filter((e) => new Date(e.start) >= now)
		.sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
		);

	const pastEvents = events
		.filter((e) => new Date(e.start) < now)
		.sort(
			(a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
		);

	const renderItem = (event: any) => (
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
	);
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

			{upcomingEvents.length > 0 && (
				<>
					<button
						type="button"
						className="header-secondary"
						onClick={() => setShowUpcoming((prev) => !prev)}
					>
						<span>Upcoming Events</span>
						<FontAwesomeIcon
							icon={showUpcoming ? faCaretDown : faCaretRight}
							className="ml-2 transition-transform duration-200"
						/>
					</button>

					{showUpcoming && (
						<List
							item="Events"
							items={upcomingEvents}
							handleAddClick={handleAddClick}
							handleRemoveClick={handleRemoveClick}
							handleEditClick={handleEditClick}
							getKey={(event) => event._id}
							renderItem={renderItem}
							eventIds={upcomingEvents.map((e) => e._id)}
						/>
					)}
				</>
			)}

			{pastEvents.length > 0 && (
				<>
					<button
						type="button"
						className="header-secondary"
						onClick={() => setShowPast((prev) => !prev)}
					>
						<span>Past Events</span>
						<FontAwesomeIcon
							icon={showPast ? faCaretDown : faCaretRight}
							className="ml-2 transition-transform duration-200"
						/>
					</button>

					{showPast && (
						<List
							item="Events"
							items={pastEvents}
							handleAddClick={handleAddClick}
							handleRemoveClick={handleRemoveClick}
							handleEditClick={handleEditClick}
							getKey={(event) => event._id}
							renderItem={renderItem}
							eventIds={pastEvents.map((e) => e._id)}
						/>
					)}
				</>
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
