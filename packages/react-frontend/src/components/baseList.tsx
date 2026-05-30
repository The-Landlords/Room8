import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

export interface BaseListProps<T> {
	title: string;
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T, index: number) => React.ReactNode;

	handleAddClick?: () => void;
	handleRemoveClick?: (item: T) => void;

	className?: string;
	emptyMessage?: string;
	addMinus?: boolean;

	renderActions?: (item: T, index: number) => React.ReactNode;
	voteButtonAction?: () => React.ReactNode;
}

export default function BaseList<T>({
	title,
	items,
	getKey,
	renderItem,
	handleAddClick,
	handleRemoveClick,
	className = "",
	emptyMessage = `No ${title}`,
	addMinus = false,
	renderActions,
	voteButtonAction,
}: BaseListProps<T>) {
	const [removeMode, setRemoveMode] = useState(false);

	return (
		<div className={`animate-floatUp ${className}`}>
			<h1 className="header-secondary">{title}</h1>

			<ul>
				{items.length === 0 && (
					<li className="header-secondary animate-floatUp">
						{emptyMessage}
					</li>
				)}

				{items.map((listItem, index) => (
					<li
						className="list-item font-bold animate-floatUp"
						key={getKey(listItem)}
					>
						<span className="flex w-full items-center">
							{renderItem(listItem, index)}

							{!removeMode && renderActions?.(listItem, index)}

							{removeMode && handleRemoveClick && (
								<button
									type="button"
									onClick={() => handleRemoveClick(listItem)}
									className="iconWrapper safe ml-auto"
								>
									<FontAwesomeIcon icon={faTrashCan} />
								</button>
							)}
						</span>
					</li>
				))}
			</ul>

			{!removeMode && addMinus && (
				<div className="relative flex justify-center items-center mt-4">
					<div className="flex gap-4">
						{handleAddClick && (
							<button onClick={handleAddClick} className="button">
								+
							</button>
						)}

						{handleRemoveClick && (
							<button
								onClick={() => setRemoveMode(true)}
								className="button"
							>
								-
							</button>
						)}
					</div>

					{voteButtonAction?.()}
				</div>
			)}

			{removeMode && (
				<div className="button self-center">
					<button onClick={() => setRemoveMode(false)}>Cancel</button>
				</div>
			)}
		</div>
	);
}
