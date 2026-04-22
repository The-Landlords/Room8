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
	faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

interface ListProps<T> {
	item: string;
	items: T[];
	handleAddClick: () => void;
	handleRemoveClick: (item: T) => void;
	handleEditClick?: (item: T) => void;
	renderItem: (item: T) => React.ReactNode;
	getKey: (item: T) => string;
	username?: string;
	homeCode?: string[];
	eventIds?: string[];
}

export default function List<T>({
	item,
	items,
	username,
	handleAddClick,
	handleRemoveClick,
	handleEditClick,
	renderItem,
	getKey,
	homeCode,
	eventIds,
}: ListProps<T>) {
	const isHomeSpaces = item === "Home Spaces";
	const isEvents = item === "Events";
	const [removeMode, setRemoveMode] = useState(false);

	return (
		<div className="flex flex-col gap-2 panel animate-floatUp">
			<h1 className="header-secondary">Current {item}</h1>

			<ul>
				{items.length === 0 && (
					<li className="list-item font-bold animate-floatUp">
						No {item}
					</li>
				)}

				{items.map((listItem, index) => (
					<li
						className="list-item font-bold animate-floatUp"
						key={getKey(listItem)}
					>
						<span className="flex flex-row">
							{renderItem(listItem)}

							{isHomeSpaces && username && !removeMode && (
								<div className="relative ml-auto gap-4 self-end-safe">
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
								<div className="relative ml-auto flex gap-4 self-end-safe">
									<a
										href={`http://localhost:8000/events/ics/${eventIds[index]}`}
									>
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faDownload}
										/>
									</a>
									{handleEditClick && (
										<button
											type="button"
											onClick={() => handleEditClick(listItem)}
										>
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faPenToSquare}
											/>
										</button>
									)}
								</div>
							)}

							{removeMode && (
								<button
									onClick={() => handleRemoveClick(listItem)}
									className="ml-4"
								>
									<FontAwesomeIcon icon={faTrashCan} />
								</button>
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
					onClick={() => setRemoveMode((prev) => !prev)}
					className="button self-center"
				>
					-
				</button>
			</div>

			{removeMode && (
				<div className="button self-center">
					<button onClick={() => setRemoveMode(false)}>Cancel</button>
				</div>
			)}
		</div>
	);
}