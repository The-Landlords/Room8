import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faClipboardCheck,
	faCartShopping,
	faFileContract,
	faAngleRight,
	faPeopleRoof,
	faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

/*
Component takes in items as a prop and renders them as a list. Note: to add and remove features like
the add or remove buttons, you must add in a new item type and implement a conditional
See below how the home spaces icons are implemented for refrence
@V 2.0
*/

interface ListProps {
	item: string;
	items: string[];
	handleAddClick: () => void;
	handleRemoveClick: () => void;
	username?: string; // question mark means optional
	homeCode?: string[];
	eventIds?: string[];
}

export default function List({
	item,
	items,
	handleAddClick,
	handleRemoveClick,
	username,
	homeCode,
	eventIds,
}: ListProps) {
	const isHomeSpaces = item === "Home Spaces";
	const isEvents = item === "Events";
	return (
		<div className="flex flex-col gap-2 panel animate-floatUp">
			<h1 className="header-secondary">Current {item}</h1>
			<ul>
				{items.map((listItem, index) => (
					<li
						className="list-item font-bold animate-floatUp"
						key={index}
					>
						<span className="flex flex-row  ">
							{listItem}
							{isHomeSpaces && username && (
								<div className="relative ml-auto gap-4 self-end-safe ">
									<Link to="/roommmates">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faPeopleRoof}
										/>
									</Link>

									{homeCode?.[index] && (
										<Link
											to={`/events/${username}/${homeCode[index]}`}
										>
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faCalendar}
											/>
										</Link>
									)}
									<Link to="/chores">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faClipboardCheck}
										/>
									</Link>
									<Link to="/groceries">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faCartShopping}
										/>
									</Link>
									<Link to="/rules">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faFileContract}
										/>
									</Link>
									<Link to="/dropdown">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faAngleRight}
										/>
									</Link>
								</div>
							)}
							{/* FOR EVENTS PAGE ICONS*/}
							{isEvents && eventIds?.[index] && (
								<div className="relative ml-auto gap-4 self-end-safe">
									<a
										href={`http://localhost:8000/events/ics/${eventIds[index]}`}
									>
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faDownload}
										/>
									</a>
								</div>
							)}
						</span>
					</li>
				))}
			</ul>
			{/*BUTTONS SECTION AT BOTTOM*/}
			{/*for adding a home or removing a home*/}
			{isHomeSpaces && (
				<div className="flex flex-row flex-center self-center gap-4">
					<button
						onClick={handleAddClick}
						className="button self-center"
					>
						+
					</button>
					<button
						onClick={handleRemoveClick}
						className="button self-center"
					>
						-
					</button>
				</div>
			)}
			{/*for adding daily list of events */}
			{isEvents && (
				<div className="flex flex-row flex-center self-center gap-4">
					<button
						onClick={handleAddClick}
						className="button self-center"
					>
						+
					</button>
					<button
						onClick={handleRemoveClick}
						className="button self-center"
					>
						-
					</button>
				</div>
			)}
		</div>
	);
}
