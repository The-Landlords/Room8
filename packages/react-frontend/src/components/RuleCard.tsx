// RuleCard.tsx

import VotePanel from "./VotePanel";

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

function formatStatus(status: Rule["status"]) {
	switch (status) {
		case "CONFIRMED":
			return "Approved";
		case "PENDING":
			return "Pending";
		case "REJECTED":
			return "Rejected";
		case "CANCELLED":
			return "Cancelled";
		default:
			return status.toLowerCase();
	}
}

interface RuleCardProps {
	rule: Rule;
	voteId: string;
	totalResidents: number;
	onVote: (id: string, vote: "YES" | "NO") => void;
	showVoting?: boolean;
}

export default function RuleCard({
	rule,
	voteId,
	totalResidents,
	onVote,
	showVoting,
}: RuleCardProps) {
	const votes = rule.votes ?? [];

	const yes = votes.filter((v) => v.vote === "YES").length;
	const no = votes.filter((v) => v.vote === "NO").length;

	const myVote = votes.find((v) => String(v.voteId) === String(voteId))?.vote;

	return (
		<div className="grid grid-cols-[1fr_120px_auto_220px] items-center gap-4 w-full">
			{/* RULE */}
			<p className="text-lg font-bold ">{rule.description}</p>

			{/* APPROVAL COUNT */}
			<p className="text-sm text-text/70 italic text-center-safe whitespace-nowrap">
				{yes}/{totalResidents} Approve
			</p>

			{/* BUTTONS */}
			<div className="flex justify-end">
				{showVoting && (
					<VotePanel
						ruleId={rule._id}
						yesCount={yes}
						noCount={no}
						onVote={onVote}
						myVote={myVote}
					/>
				)}
			</div>

			{/* STATUS */}
			<p className="text-lg font-bold text-right-safe whitespace-nowrap">
				Status : {formatStatus(rule.status)}
			</p>
		</div>
	);
}
