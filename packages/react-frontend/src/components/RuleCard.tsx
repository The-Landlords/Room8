import React from "react";
import VotePanel from "./VotePanel";

const TOTAL_RESIDENTS = 4;

interface Vote {
	voteId: string;
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
	voteId: string;
	onVote: (ruleId: string, vote: "YES" | "NO") => void;
}

export default function RuleCard({ rule, voteId, onVote }: RuleCardProps) {
	const yes = rule.votes?.filter((v) => v.vote === "YES").length || 0;
	const no = rule.votes?.filter((v) => v.vote === "NO").length || 0;

	const myVote = rule.votes?.find((v) => v.voteId === voteId)?.vote;

	const statusText =
		rule.status === "CONFIRMED"
			? "Approved"
			: rule.status === "REJECTED"
				? "Rejected"
				: "Pending";

	return (
		<div className="flex justify-between items-start w-full">
			<div className="flex-1">
				<p className="text-lg">{rule.description}</p>
				<p className="text-sm mt-2">{statusText}</p>
				<p className="text-xs text-text/70 mt-1">
					YES {yes} | NO {no} | Total Roommates {TOTAL_RESIDENTS}
				</p>
			</div>

			<VotePanel
				ruleId={rule._id}
				myVote={myVote}
				yesCount={yes}
				noCount={no}
				onVote={onVote}
			/>
		</div>
	);
}
