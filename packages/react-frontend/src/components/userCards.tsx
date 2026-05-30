import BasicList from "./basicList";

type CardDetail = {
	label: string;
	value: string;
};

type CardDetailWithId = CardDetail & {
	id: string;
};

interface CardsProps<T> {
	items: T[];
	getKey: (item: T) => string;
	getTitle: (item: T) => string;
	getDetails: (item: T) => CardDetail[];
	emptyMessage?: string;
	className?: string;
}

export default function Cards<T>({
	items,
	getKey,
	getTitle,
	getDetails,
	emptyMessage = "No profiles found.",
	className = "",
}: CardsProps<T>) {
	if (items.length === 0) {
		return <p className="header-secondary">{emptyMessage}</p>;
	}

	return (
		<div
			className={`grid w-full gap-4 justify-center grid-cols-[repeat(auto-fit,minmax(18rem,24rem))] ${className}`}
		>
			{/* Have to do this for each item because details do not have unique ids */}
			{items.map((item) => {
				const details: CardDetailWithId[] = getDetails(item)
					.filter((detail) => detail.value.trim() !== "")
					.map((detail, index) => ({
						...detail,
						id: `${getKey(item)}-${index}`,
					}));

				return (
					<div
						key={getKey(item)}
						className="card animate-floatUp flex flex-col gap-4"
					>
						<h2 className="header-secondary self-center-safe">
							{getTitle(item)}
						</h2>

						<BasicList
							title=""
							items={details}
							getKey={(detail) => detail.id}
							emptyMessage=""
							renderItem={(detail) => (
								<div className="flex flex-row gap-2">
									{detail.value === "" ? null : (
										<>
											<span className="font-bold">
												{detail.label}:
											</span>
											<span>{detail.value}</span>
										</>
									)}
								</div>
							)}
						/>
					</div>
				);
			})}
		</div>
	);
}
