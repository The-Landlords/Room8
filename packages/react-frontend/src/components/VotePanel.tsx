interface VotePanelProps {
	ruleId: string;
	myVote?: "YES" | "NO";
	yesCount: number;
	noCount: number;
	onVote: (ruleId: string, vote: "YES" | "NO") => void;
	voteId?: string;
}

export default function VotePanel({
	ruleId,
	myVote,
	yesCount,
	noCount,
	onVote,
	voteId,
}: VotePanelProps) {
	return (
		<div className="flex gap-2 items-center">
			<button
				disabled={!voteId}
				onClick={() => onVote(ruleId, "YES")}
				className={`button px-3 py-1 ${
					myVote === "YES" ? "vote-yes" : ""
				}`}
			>
				YES
			</button>

			<button
				disabled={!voteId}
				onClick={() => onVote(ruleId, "NO")}
				className={`button px-3 py-1 ${
					myVote === "NO" ? "bg-red-500 text-white" : ""
				}`}
			>
				NO
			</button>

			<p className="text-xs text-text/70 ml-2">
				YES {yesCount} | NO {noCount}
			</p>
		</div>
	);
}
