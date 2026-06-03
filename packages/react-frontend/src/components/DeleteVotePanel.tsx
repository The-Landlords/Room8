// DeleteVotePanel.tsx

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
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-2xl w-[400px] text-center">
				<h2 className="text-lg mb-3">Vote to delete this rule</h2>

				{isRejected && (
					<p className="text-red-600 font-semibold mb-2">
						Delete request rejected
					</p>
				)}

				{isPending && (
					<p className="text-yellow-600 mb-2">
						Waiting for unanimous approval
					</p>
				)}

				<p className="text-sm mb-5 text-text/70">
					YES {yes} | NO {no} | Total Roommates {totalResidents}
				</p>

				<div className="flex justify-center gap-4">
					<button
						type="button"
						aria-label="YES"
						onClick={() => onVote(ruleId, "YES")}
						className={`button px-4 py-2 ${
							myVote === "YES"
								? "bg-green-500 text-white border-green-600"
								: "bg-gray-200 hover:bg-gray-300"
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
								? "bg-red-500 text-white border-red-600"
								: "bg-gray-200 hover:bg-gray-300"
						}`}
					>
						X
					</button>
				</div>

				<div className="flex justify-center mt-5">
					<button
						type="button"
						onClick={onCancel}
						className="text-sm text-gray-600 hover:text-black transition"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
