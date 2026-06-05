import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import BaseList from "./baseList";
import { API_BASE } from "../config";

interface EventListProps<T> {
	items: T[];
	getKey: (item: T) => string;
	getEventId: (item: T, index: number) => string;
	renderItem: (item: T, index: number) => React.ReactNode;
	handleAddClick: () => void;
	handleRemoveClick: (item: T) => void;
	handleEditClick?: (item: T) => void;
	className?: string;
}

export default function EventList<T>({
	items,
	getKey,
	getEventId,
	renderItem,
	handleAddClick,
	handleRemoveClick,
	handleEditClick,
	className = "",
}: EventListProps<T>) {
	return (
		<BaseList
			title="Events"
			items={items}
			getKey={getKey}
			renderItem={renderItem}
			handleAddClick={handleAddClick}
			handleRemoveClick={handleRemoveClick}
			addMinus={true}
			className={className}
			emptyMessage="No Events"
			renderActions={(event, index) => {
				const eventId = getEventId(event, index);

				return (
					<div className="relative ml-auto flex gap-4 self-end-safe">
						<a href={`${API_BASE}/events/ics/${eventId}`}>
							<FontAwesomeIcon
								className="iconWrapper"
								icon={faDownload}
							/>
						</a>

						{handleEditClick && (
							<button
								type="button"
								onClick={() => handleEditClick(event)}
							>
								<FontAwesomeIcon
									className="iconWrapper"
									icon={faPenToSquare}
								/>
							</button>
						)}
					</div>
				);
			}}
		/>
	);
}
