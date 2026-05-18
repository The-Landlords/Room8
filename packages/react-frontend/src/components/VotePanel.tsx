// VotePanel.tsx

// import React from "react";

interface VotePanelProps {
	ruleId: string;
	myVote?: "YES" | "NO";
	yesCount: number;
	noCount: number;
	onVote: (ruleId: string, vote: "YES" | "NO") => void;
}

export default function VotePanel({
	ruleId,
	myVote,
	yesCount,
	noCount,
	onVote,
}: VotePanelProps) {
	return (
		<div className="flex gap-2 items-center">
			<button
				onClick={() => onVote(ruleId, "YES")}
				className={`button px-3 py-1 ${myVote === "YES" ? "vote-yes" : ""
					}`}
			>
				✓
			</button>

			<button
				onClick={() => onVote(ruleId, "NO")}
				className={`button px-3 py-1 ${myVote === "NO" ? "bg-red-500 text-white" : ""
					}`}
			>
				X
			</button>

			<p className="text-xs text-text/70 ml-2">
				YES {yesCount} | NO {noCount}
			</p>
		</div>
	);
}