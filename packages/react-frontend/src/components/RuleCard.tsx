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

	const myVote = votes.find(
		(v) => String(v.voteId) === String(voteId)
	)?.vote;

	return (
		<div className="w-full border rounded-xl p-4 bg-white/40">
			<div className="grid grid-cols-[1fr_auto_auto] items-start w-full gap-4">
				{/* DESCRIPTION */}
				<div>
					<p className="text-base font-medium break-words">
						{rule.description}
					</p>
				</div>

				{/* APPROVAL COUNT */}
				<div className="flex justify-center">
					<p className="text-sm text-text/70 whitespace-nowrap">
						{yes}/{totalResidents} Approve
					</p>
				</div>

				{/* STATUS + VOTING */}
				<div className="flex flex-col items-end max-w-[220px]">
					<p className="text-sm text-text/70 whitespace-nowrap">
						Status: {formatStatus(rule.status)}
					</p>

					{showVoting && (
						<div className="mt-2">
							<VotePanel
								ruleId={rule._id}
								yesCount={yes}
								noCount={no}
								onVote={onVote}
								myVote={myVote}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}