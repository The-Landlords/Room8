import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faCartShopping,
	faFileContract,
	faAngleRight,
	faPeopleRoof,
	faTrashCan,
	faDownload,
	faClipboardCheck,
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
	handleRemoveClick: (item: string) => void;
	username?: string;
	homeCode?: string[];
	eventIds?: string[];
}

export default function List({
	item,
	items,
	username,
	handleAddClick,
	handleRemoveClick,
	homeCode,
	eventIds,
}: ListProps) {
	const isHomeSpaces = item === "Home Spaces";
	const isEvents = item === "Events";
	const [remove, setRemove] = useState(false);

	return (
		<div className="flex flex-col gap-2 panel animate-floatUp">
			<h1 className="header-secondary">Current {item}</h1>
			<ul>
				{items.length == 0 && (
					<li className="list-item font-bold animate-floatUp">
						No {item}
					</li>
				)}
				{items.map((listItem, index) => (
					<li
						className="list-item font-bold animate-floatUp"
						key={index}
					>
						<span className="flex flex-row ">
							{listItem}
							{isHomeSpaces && username && !remove && (
								<div className="relative ml-auto gap-4 self-end-safe ">
									<Link to="/roommmates">
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faPeopleRoof}
										/>
									</Link>
									<Link to="/rules">
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faFileContract}
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
									{homeCode?.[index] && (
										<Link
											to={`/${username}/${homeCode[index]}/chores`}
										>
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faClipboardCheck}
											/>
										</Link>
									)}
									<Link to="/groceries">
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faCartShopping}
										/>
									</Link>
									<Link to="/dropdown">
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faAngleRight}
										/>
									</Link>
								</div>
							)}
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
							{(item == "Home Spaces" || item == "Chores") &&
								remove && (
									<div className="relative ml-auto self-end-safe">
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faTrashCan}
											onClick={() => {
												handleRemoveClick(listItem);
											}}
										/>
									</div>
								)}
						</span>
					</li>
				))}
			</ul>
			<div className="flex flex-row flex-center self-center gap-4">
				<button onClick={handleAddClick} className="button self-center">
					+
				</button>
				<button
					onClick={() => {
						setRemove((prev) => !prev);
					}}
					className="button self-center"
				>
					-
				</button>
			</div>
			{(item == "Home Spaces" || item == "Chores") && remove && (
				<div className="button self-center">
					<button onClick={() => setRemove(false)}> Cancel </button>
				</div>
			)}
		</div>
	);
}
