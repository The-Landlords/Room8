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

interface RuleCardProps {
	rule: Rule;
	voteId: string;
	totalResidents: number;
	onVote: (ruleId: string, vote: "YES" | "NO") => void;
	showVoting: boolean;
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

	const myVote = votes.find((v) => v.voteId === voteId)?.vote;

	const statusText =
		rule.status === "CONFIRMED"
			? "Approved"
			: rule.status === "REJECTED"
				? "Rejected"
				: "Pending";

	console.log(rule.votes);

	return (
		<div className="relative grid grid-cols-3 items-center w-full gap-4">
			<div>
				<p className="text-lg break-words">{rule.description}</p>
			</div>

			<div className="flex justify-center">
				<p className="text-sm text-text/70 whitespace-nowrap">
					{yes}/{totalResidents} Approve
				</p>
			</div>

			<div className="flex flex-col items-end">
				<p className="text-sm whitespace-nowrap">
					Status: {statusText}
				</p>
			</div>

			{showVoting && (
				<div className="absolute right-40 top-1/2 -translate-y-1/2">
					<VotePanel
						ruleId={rule._id}
						myVote={myVote}
						yesCount={yes}
						noCount={no}
						onVote={onVote}
						voteId={voteId}
					/>
				</div>
			)}
		</div>
	);
}
