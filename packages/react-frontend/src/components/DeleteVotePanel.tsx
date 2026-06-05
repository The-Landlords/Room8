// DeleteVotePanel.tsx

import Overlay from "./overlay";

interface Vote {
	voteId: string;
	vote: "YES" | "NO";
}

interface DeleteVotePanelProps {
	ruleId: string;
	voteId: string;
	deleteVotes?: Vote[];
	totalResidents: number;
	deleteStatus?: "NONE" | "PENDING" | "REJECTED" | "CONFIRMED";
	onVote: (ruleId: string, vote: "YES" | "NO") => void;
	onCancel: () => void;
}

export default function DeleteVotePanel({
	ruleId,
	voteId,
	deleteVotes = [],
	totalResidents,
	deleteStatus = "NONE",
	onVote,
	onCancel,
}: DeleteVotePanelProps) {
	const yes = deleteVotes.filter((v) => v.vote === "YES").length;
	const no = deleteVotes.filter((v) => v.vote === "NO").length;

	const myVote = deleteVotes.find(
		(v) => String(v.voteId) === String(voteId)
	)?.vote;

	const isRejected = deleteStatus === "REJECTED" || no > 0;

	const isPending = deleteStatus === "PENDING" && !isRejected;

	return (
		<Overlay isOpen={true} onClose={onCancel}>
			<div className="text-center">
				<h2 className="header-secondary">Vote to delete this rule</h2>

				{isRejected && (
					<p className="text-primary font-primary mb-2">
						Delete request rejected
					</p>
				)}

				{isPending && (
					<p className="text-primary font-primary">
						Waiting for unanimous approval
					</p>
				)}

				<p className="text-sm mb-5 text-primary font-secondary">
					YES {yes} | NO {no} | Total Roommates {totalResidents}
				</p>

				<div className="flex justify-center gap-4">
					<button
						type="button"
						aria-label="YES"
						onClick={() => onVote(ruleId, "YES")}
						className={`button px-4 py-2 ${
							myVote === "YES"
								? "bg-accent text-primary border-primary"
								: "bg-secondary hover:bg-accent border-primary text-primary"
						}`}
					>
						✓
					</button>

					<button
						type="button"
						aria-label="NO"
						onClick={() => onVote(ruleId, "NO")}
						className={`button px-4 py-2 ${
							myVote === "NO"
								? "bg-accent text-primary border-primary"
								: "bg-secondary hover:bg-accent border-primary text-primary"
						}`}
					>
						X
					</button>
				</div>

				<div className="flex justify-center mt-5">
					<button
						type="button"
						onClick={onCancel}
						className="button self-center"
					>
						Cancel
					</button>
				</div>
			</div>
		</Overlay>
	);
}
