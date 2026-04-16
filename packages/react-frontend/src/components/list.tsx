import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faClipboardCheck,
	faCartShopping,
	faFileContract,
	faAngleRight,
	faPeopleRoof,
	faTrashCan,
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
	codes?: string[];
	username?: string;
	handleAddClick: () => void;
	handleRemoveClick: (item: string) => void;
}

export default function List({
	item,
	items,
	codes,
	username,
	handleAddClick,
	handleRemoveClick,
}: ListProps) {
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
							{item == "Home Spaces" && remove == false && (
								<div className="relative ml-auto gap-4 self-end-safe ">
									<Link to="/roommmates">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faPeopleRoof}
										/>
									</Link>
									<Link to="/calendar">
										{" "}
										{/* FIXME incorrect link */}
										<FontAwesomeIcon
											className="iconWrapper"
											icon={faCalendar}
										/>
									</Link>

									{codes?.[index] && username && (
										<Link
											to={`/${username}/${codes[index]}/chores`}
										>
											{" "}
											<FontAwesomeIcon
												className="iconWrapper"
												icon={faClipboardCheck}
											/>
										</Link>
									)}
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
							{(item == "Home Spaces" || item == "Chores") &&
								remove == true && (
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
			{(item == "Home Spaces" || item == "Chores") && remove == false && (
				<div className="flex flex-row flex-center self-center gap-4">
					<button
						onClick={handleAddClick}
						className="button self-center"
					>
						+
					</button>
					<button
						onClick={() => {
							setRemove(true);
						}}
						className="button self-center"
					>
						-
					</button>
				</div>
			)}
			{(item == "Home Spaces" || item == "Chores") && remove == true && (
				<div className="button self-center">
					<button onClick={() => setRemove(false)}> Cancel </button>
				</div>
			)}
		</div>
	);
}
