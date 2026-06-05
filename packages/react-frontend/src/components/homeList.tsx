import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCartShopping,
	faCalendar,
	faBookBookmark,
	faAngleRight,
	faPeopleRoof,
	faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import BaseList from "./baseList";

interface HomeSpaceListProps<T> {
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T, index: number) => React.ReactNode;
	homeCode: (item: T) => string;
	getRelationship: (item: T) => string;
	handleAddClick: () => void;
	handleRemoveClick: (item: T) => void;
	className?: string;
}

export default function HomeSpaceList<T>({
	items,
	getKey,
	renderItem,
	homeCode,
	getRelationship,
	handleAddClick,
	handleRemoveClick,
	className = "",
}: HomeSpaceListProps<T>) {
	return (
		<BaseList
			title="Current Home Spaces"
			items={items}
			getKey={getKey}
			renderItem={renderItem}
			handleAddClick={handleAddClick}
			handleRemoveClick={handleRemoveClick}
			addMinus={true}
			className={className}
			emptyMessage="No Home Spaces"
			renderActions={(home) => {
				const code = homeCode(home);
				const relationship = getRelationship(home);

				if (relationship === "GUEST") {
					return (
						<div className="relative ml-auto gap-4 flex self-end-safe">
							<Link to={`/residents/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faPeopleRoof}
								/>
							</Link>

							<Link to={`/homeDisplay/me/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faAngleRight}
								/>
							</Link>
						</div>
					);
				}

				if (relationship === "RESIDENT") {
					return (
						<div className="relative ml-auto gap-4 flex self-end-safe">
							<Link to={`/residents/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faPeopleRoof}
								/>
							</Link>

							<Link to={`/rules/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faBookBookmark}
								/>
							</Link>

							<Link to={`/events/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faCalendar}
								/>
							</Link>

							<Link to={`/${code}/chores`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faListCheck}
								/>
							</Link>

							<Link to={`/grocery/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faCartShopping}
								/>
							</Link>

							<Link to={`/homeDisplay/me/${code}`}>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faAngleRight}
								/>
							</Link>
						</div>
					);
				}

				return null;
			}}
		/>
	);
}
