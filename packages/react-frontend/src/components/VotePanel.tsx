// VotePanel.tsx

interface VotePanelProps {
	ruleId: string;
	yesCount: number;
	noCount: number;
	onVote: (id: string, vote: "YES" | "NO") => void;
	myVote?: "YES" | "NO";
}

export default function VotePanel({
	ruleId,
	yesCount,
	noCount,
	onVote,
	myVote,
}: VotePanelProps) {
	const base =
		"px-3 py-1 rounded-lg border font-medium transition";

	const yesClass =
		myVote === "YES"
			? "bg-green-500 text-white border-green-600"
			: "bg-gray-200 hover:bg-gray-300";

	const noClass =
		myVote === "NO"
			? "bg-red-500 text-white border-red-600"
			: "bg-gray-200 hover:bg-gray-300";

	return (
		<div className="flex gap-2 items-center">
			<button
				type="button"
				aria-label="YES"
				onClick={() => onVote(ruleId, "YES")}
				className={`${base} ${yesClass}`}
			>
				✓
			</button>

			<button
				type="button"
				aria-label="NO"
				onClick={() => onVote(ruleId, "NO")}
				className={`${base} ${noClass}`}
			>
				X
			</button>

			<p className="text-xs text-text/70 ml-2 whitespace-nowrap">
				YES {yesCount} | NO {noCount}
			</p>
		</div>
	);
}