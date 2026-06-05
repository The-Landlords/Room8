import React from "react";
import BaseList from "./baseList";

interface BasicListProps<T> {
	title: string;
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T, index: number) => React.ReactNode;
	className?: string;
	emptyMessage?: string;
}

export default function BasicList<T>({
	title,
	items,
	getKey,
	renderItem,
	className,
	emptyMessage,
}: BasicListProps<T>) {
	return (
		<BaseList
			title={title}
			items={items}
			getKey={getKey}
			renderItem={renderItem}
			className={className}
			emptyMessage={emptyMessage}
			addMinus={false}
		/>
	);
}
