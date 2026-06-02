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
import AddEventOverlay from "../components/addEventOverlay";
import RemoveEventOverlay from "../components/removeEventOverlay";
import EditEventOverlay from "../components/EditEventOverlay";
import { API_BASE } from "../config";
import Header from "../components/header";
import EventList from "../components/eventList";

export default function CalendarPage() {
	const [events, setEvents] = useState<any[]>([]);

	const [overlayOpen, setOverlayOpen] = useState(false);
	const [addState, setAddState] = useState("Base");
	const [eventDelete, setEventDelete] = useState<any>();
	const { homeCode } = useParams();
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
		const homeObject = await fetch(`${API_BASE}/homes/code/${homeCode}`, {
			credentials: "include",
		});
		if (!homeObject.ok) throw new Error("Home not found");

		const data = await homeObject.json();
		const homeObjectId = data._id;

		fetch(`${API_BASE}/homeId/${homeObjectId}/events/`, {
			credentials: "include",
		})
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
	}, [homeCode]);

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
		<div className="flex flex-col items-center">
			<Header title="Calendar" homeCode={homeCode} />
			<Overlay isOpen={overlayOpen} onClose={() => handleClose()}>
				{addState === "Add" && (
					<AddEventOverlay
						homeCode={homeCode}
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
			<div className="flex flex-col items-center animate-floatUp min-w-[60%] p-6">
				{upcomingEvents.length > 0 && (
					<>
						<button
							type="button"
							className="header-secondary"
							onClick={() => setShowUpcoming((prev) => !prev)}
						>
							<span className="header-secondary self-start-safe">
								Upcoming Events
							</span>
							<FontAwesomeIcon
								icon={showUpcoming ? faCaretDown : faCaretRight}
								className="ml-2 transition-transform duration-200"
							/>
						</button>

						{showUpcoming && (
							<EventList
								items={upcomingEvents}
								handleAddClick={handleAddClick}
								handleRemoveClick={(event) =>
									handleRemoveClick(event)
								}
								handleEditClick={(event) =>
									handleEditClick(event)
								}
								getKey={(event) => event._id}
								renderItem={renderItem}
								getEventId={(event) => event._id}
								className="panel"
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
							<span className="header-secondary self-start-safe">
								Past Events
							</span>
							<FontAwesomeIcon
								icon={showPast ? faCaretDown : faCaretRight}
								className="ml-2 transition-transform duration-200"
							/>
						</button>

						{showPast && (
							<EventList
								items={pastEvents}
								handleAddClick={handleAddClick}
								handleRemoveClick={(event) =>
									handleRemoveClick(event)
								}
								handleEditClick={(event) =>
									handleEditClick(event)
								}
								getKey={(event) => event._id}
								renderItem={renderItem}
								getEventId={(event) => event._id}
								className="panel"
							/>
						)}
					</>
				)}

				{events.length == 0 && (
					<EventList
						items={[]}
						handleAddClick={handleAddClick}
						getKey={(event) => event._id}
						renderItem={renderItem}
						getEventId={(event) => event._id}
						className="panel"
						handleRemoveClick={() => {}}
						handleEditClick={() => {}}
					/>
				)}
			</div>
		</div>
	);
}
