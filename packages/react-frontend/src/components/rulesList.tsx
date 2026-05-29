import React from "react";
import BaseList from "./baseList";

interface RulesListProps<T> {
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T, index: number) => React.ReactNode;
	handleAddClick: () => void;
	handleRemoveClick: (item: T) => void;
	handleVoteClick?: () => void;
	className?: string;
}

export default function RulesList<T>({
	items,
	getKey,
	renderItem,
	handleAddClick,
	handleRemoveClick,
	handleVoteClick,
	className = "",
}: RulesListProps<T>) {
	return (
		<BaseList
			title="Rules"
			items={items}
			getKey={getKey}
			renderItem={renderItem}
			handleAddClick={handleAddClick}
			handleRemoveClick={handleRemoveClick}
			addMinus={true}
			className={className}
			emptyMessage="No Rules"
			voteButtonAction={() =>
				handleVoteClick ? (
					<button
						onClick={handleVoteClick}
						className="button absolute right-0"
					>
						Vote
					</button>
				) : null
			}
		/>
	);
}
