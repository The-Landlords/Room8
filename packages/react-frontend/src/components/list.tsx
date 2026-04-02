import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faClipboardCheck,
	faCartShopping,
	faFileContract,
	faAngleRight,
	faPeopleRoof,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

/*
Component takes in items as a prop and renders them as a list.
*/
interface ListProps {
	item: string[];
	handleAddClick: () => void;
	handleRemoveClick: () => void;
}

export default function List({
	item,
	handleAddClick,
	handleRemoveClick,
}: ListProps) {
	return (
		<div className="flex flex-col gap-2 panel animate-floatUp">
			<h1 className="header-secondary">Current Homes</h1>
			<ul>
				{item.map((item, index) => (
					<li
						className="list-item font-bold animate-floatUp"
						key={index}
					>
						<span>{item}</span>

						<div className="ml-auto flex gap-4">
							<Link to="/roommmates">
								{" "}
								{/* FIXME incorrect link */}
								<FontAwesomeIcon icon={faPeopleRoof} />
							</Link>
							<Link to="/calendar">
								{" "}
								{/* FIXME incorrect link */}
								<FontAwesomeIcon icon={faCalendar} />
							</Link>
							<Link to="/chores">
								{" "}
								{/* FIXME incorrect link */}
								<FontAwesomeIcon icon={faClipboardCheck} />
							</Link>
							<Link to="/groceries">
								{" "}
								{/* FIXME incorrect link */}
								<FontAwesomeIcon icon={faCartShopping} />
							</Link>
							<Link to="/rules">
								{" "}
								{/* FIXME incorrect link */}
								<FontAwesomeIcon icon={faFileContract} />
							</Link>
							<Link to="/dropdown">
								{" "}
								{/* FIXME incorrect link */}
								<FontAwesomeIcon icon={faAngleRight} />
							</Link>
						</div>
					</li>
				))}
			</ul>
			<div className="flex flex-row flex-center self-center gap-4">
				<button onClick={handleAddClick} className="button self-center">
					+
				</button>
				<button
					onClick={handleRemoveClick}
					className="button self-center"
				>
					-
				</button>
			</div>
		</div>
	);
}
