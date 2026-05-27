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

	const isRejected =
		deleteStatus === "REJECTED" || no > 0;

	const isPending =
		deleteStatus === "PENDING" && !isRejected;

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-2xl w-[400px] shadow-xl">
				<h2 className="text-xl mb-4 text-center">
					Vote to delete this rule
				</h2>

				{isRejected && (
					<p className="text-red-600 font-semibold text-center mb-3">
						Delete request rejected
					</p>
				)}

				{isPending && (
					<p className="text-yellow-600 text-center mb-3">
						Waiting for unanimous approval
					</p>
				)}

				<div className="text-center mb-5">
					<p className="text-sm text-text/70">
						YES {yes} | NO {no}
					</p>

					<p className="text-sm text-text/70 mt-1">
						Total Roommates: {totalResidents}
					</p>
				</div>

				<div className="flex justify-center gap-4">
					<button
						type="button"
						onClick={() => onVote(ruleId, "YES")}
						className={`px-4 py-2 rounded-lg border font-medium transition ${myVote === "YES"
							? "bg-green-500 text-white border-green-600"
							: "bg-gray-200 hover:bg-gray-300"
							}`}
					>
						YES
					</button>

					<button
						type="button"
						onClick={() => onVote(ruleId, "NO")}
						className={`px-4 py-2 rounded-lg border font-medium transition ${myVote === "NO"
							? "bg-red-500 text-white border-red-600"
							: "bg-gray-200 hover:bg-gray-300"
							}`}
					>
						NO
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