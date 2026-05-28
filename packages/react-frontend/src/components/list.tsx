import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCartShopping,
	faCalendar,
	faFileContract,
	faAngleRight,
	faPeopleRoof,
	faDownload,
	faClipboardCheck,
	faTrashCan,
	faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
// import Residents from "../pages/residents";

import { API_BASE } from "../config";

interface ListProps<T> {
	item: string;
	items: T[];
	handleAddClick: () => void;
	handleRemoveClick: (item: T) => void;
	handleEditClick?: (item: T) => void; // FIXME can be used for edit house too!
	handleVoteClick?: () => void;
	renderItem: (item: T) => React.ReactNode;
	relationship?: (item: T) => string | "";
	getKey: (item: T) => string;
	username?: string;
	homeCode?: string[];
	eventIds?: string[];
}

export default function List<T>({
	item,
	items,
	handleAddClick,
	handleRemoveClick,
	handleEditClick,
	renderItem,
	getKey,
	relationship,
	homeCode,
	eventIds,
	handleVoteClick,
}: ListProps<T>) {
	const isHomeSpaces = item === "Home Spaces";
	const isEvents = item === "Events";
	const isChores = item === "Chores";
	const isGrocery = item === "Grocery";
	const isRules = item === "Rules";

	const isBasic =
		!isHomeSpaces && !isEvents && !isChores && !isGrocery && !isRules;

	const [removeMode, setRemoveMode] = useState(false);
	return (
		<div className="flex flex-col gap-2 list-container animate-floatUp">
			<h1 className="header-secondary">
				{isHomeSpaces ? `Current ${item}` : item}
			</h1>

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
						<span className="flex w-full items-center">
							{renderItem(listItem)}

							{isHomeSpaces &&
								!removeMode &&
								relationship?.(listItem) === "RESIDENT" && (
									<div className="relative ml-auto gap-4 flex self-end-safe">
										<Link
											to={`/residents/${homeCode?.[index]}`}
										>
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faPeopleRoof}
											/>
										</Link>
										{homeCode?.[index] && (
											<Link
												to={`/rules/${homeCode[index]}`}
											>
												<FontAwesomeIcon
													className="iconWrapper"
													icon={faFileContract}
												/>
											</Link>
										)}
										{homeCode?.[index] && (
											<Link
												to={`/events/${homeCode[index]}`}
											>
												<FontAwesomeIcon
													className="iconWrapper"
													icon={faCalendar}
												/>
											</Link>
										)}

										{homeCode?.[index] && (
											<Link
												to={`/${homeCode[index]}/chores`}
											>
												<FontAwesomeIcon
													className="iconWrapper"
													icon={faClipboardCheck}
												/>
											</Link>
										)}

										{homeCode?.[index] && (
											<Link
												to={`/grocery/${homeCode[index]}`}
											>
												<FontAwesomeIcon
													className="iconWrapper"
													icon={faCartShopping}
												/>
											</Link>
										)}

										{homeCode?.[index] && (
											<Link
												to={`/homeDisplay/me/${homeCode?.[index]}`}
											>
												<FontAwesomeIcon
													className="iconWrapper"
													icon={faAngleRight}
												/>
											</Link>
										)}
									</div>
								)}
							{isHomeSpaces &&
								!removeMode &&
								relationship?.(listItem) === "GUEST" && (
									<div className="relative ml-auto gap-4 flex self-end-safe">
										<Link
											to={`/residents/${homeCode?.[index]}`}
										>
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faPeopleRoof}
											/>
										</Link>

										{homeCode?.[index] && (
											<Link
												to={`/homeDisplay/me/${homeCode?.[index]}`}
											>
												<FontAwesomeIcon
													className="iconWrapper"
													icon={faAngleRight}
												/>
											</Link>
										)}
									</div>
								)}
							{isEvents && eventIds?.[index] && (
								<div className="relative ml-auto flex gap-4 self-end-safe">
									<a
										href={`${API_BASE}/events/ics/${eventIds[index]}`}
									>
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faDownload}
										/>
									</a>

									{handleEditClick && (
										<button
											type="button"
											onClick={() =>
												handleEditClick(listItem)
											}
										>
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faPenToSquare}
											/>
										</button>
									)}
								</div>
							)}

							{removeMode && !isBasic && (
								<button
									type="button"
									onClick={() => handleRemoveClick(listItem)}
									className="relative ml-auto flex gap-4 self-end-safe"
								>
									<FontAwesomeIcon icon={faTrashCan} />
								</button>
							)}
						</span>
					</li>
				))}
			</ul>
			{!removeMode && !isBasic && (
				<div className="relative flex justify-center items-center mt-4">
					<div className="flex gap-4">
						<button onClick={handleAddClick} className="button">
							+
						</button>

						<button
							onClick={() => setRemoveMode((prev) => !prev)}
							className="button"
						>
							-
						</button>
					</div>

					{item === "Rules" && (
						<button
							onClick={handleVoteClick}
							className="button absolute right-0"
						>
							Vote
						</button>
					)}
				</div>
			)}

			{removeMode && !isBasic && (
				<div className="button self-center">
					<button onClick={() => setRemoveMode(false)}>Cancel</button>
				</div>
			)}
		</div>
	);
}
