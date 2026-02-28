import React from "react";

//component takes in items as a prop and renders them as a list. items may be replaced as home objects or whatnot later

interface ListProps {
	item: string[];
	handleAddClick: () => void;
	handleRemoveClick: () => void;
}

const List = ({ item, handleAddClick, handleRemoveClick }: ListProps) => {
	return (
		<div className="flex flex-col gap-2 panel animate-floatUp">
			<h1 className="header-secondary">Current Homes</h1>
			<ul>
				{item.map((item, index) => (
					<li className="list-item font-bold" key={index}>
						{item}
					</li>
				))}
			</ul>
			<div className="flex flex-row flex-center self-center gap-4">
				<button
					onClick={handleAddClick}
					className="bg-primary/70 text-text font-secondary font-bold text-lg p-3 w-15 rounded-md shadow-sm mt-4 self-center"
				>
					+
				</button>
				<button
					onClick={handleRemoveClick}
					className="bg-primary/70 text-text font-secondary font-bold text-lg p-3 w-15 rounded-md shadow-sm mt-4 self-center"
				>
					-
				</button>
			</div>
		</div>
	);
};
export default List;
