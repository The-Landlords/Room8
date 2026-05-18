// RuleCard.tsx

// import React from "react";
import VotePanel from "./VotePanel";

interface Vote {
	userId: string;
	vote: "YES" | "NO";
}

interface Rule {
	_id: string;
	description: string;
	status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
	votes?: Vote[];
}

interface RuleCardProps {
	rule: Rule;
	userId: string;
	totalResidents: number;
	onVote: (ruleId: string, vote: "YES" | "NO") => void;
	showVoting: boolean;
}

export default function RuleCard({
	rule,
	userId,
	totalResidents,
	onVote,
	showVoting,
}: RuleCardProps) {
	const yes = rule.votes?.filter((v) => v.vote === "YES").length || 0;

	const no = rule.votes?.filter((v) => v.vote === "NO").length || 0;

	const myVote = rule.votes?.find(
		(v) => String(v.userId) === String(userId)
	)?.vote;

	const statusText =
		rule.status === "CONFIRMED"
			? "Approved"
			: rule.status === "REJECTED"
				? "Rejected"
				: "Pending";

	return (
		<div className="relative grid grid-cols-3 items-center w-full gap-4">
			{/* LEFT */}
			<div>
				<p className="text-lg break-words">{rule.description}</p>
			</div>

			{/* CENTER */}
			<div className="flex justify-center">
				<p className="text-sm text-text/70 whitespace-nowrap">
					{yes}/{totalResidents} Approve
				</p>
			</div>

			{/* RIGHT */}
			<div className="flex flex-col items-end">
				<p className="text-sm whitespace-nowrap">
					Status: {statusText}
				</p>

			</div>

			{/* FLOATING VOTE PANEL */}
			{showVoting && (
				<div className="absolute right-40 top-1/2 -translate-y-1/2">
					<VotePanel
						ruleId={rule._id}
						myVote={myVote}
						yesCount={yes}
						noCount={no}
						onVote={onVote}
					/>
				</div>
			)}
		</div>
	);
}