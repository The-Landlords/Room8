import React from "react";

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
						{item}
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
