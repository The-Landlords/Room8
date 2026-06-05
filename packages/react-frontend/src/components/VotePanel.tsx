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
	const base = "px-3 py-1 rounded-lg border font-medium transition";

	const yesClass =
		myVote === "YES"
			? "bg-accent text-primary border-primary"
			: "bg-secondary hover:bg-accent border-primary text-primary";

	const noClass =
		myVote === "NO"
			? "bg-accent text-primary border-primary"
			: "bg-secondary hover:bg-accent border-primary text-primary";

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
