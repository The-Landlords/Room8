// import React from "react";

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

	const myVote = deleteVotes.find((v) => v.voteId === voteId)?.vote;

	const isRejected = deleteStatus === "REJECTED" || no > 0;
	const isPending = deleteStatus === "PENDING";

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
			<div className="bg-white p-6 rounded-2xl w-[400px] text-center">
				<h2 className="text-lg mb-3">Vote to delete this rule</h2>

				{/* STATUS MESSAGES */}
				{isRejected && (
					<p className="text-red-600 font-semibold mb-2">
						Delete request rejected
					</p>
				)}

				{isPending && no === 0 && (
					<p className="text-yellow-600 mb-2">
						Waiting for unanimous approval
					</p>
				)}

				<p className="text-sm mb-5 text-text/70">
					YES {yes} | NO {no} | Total Roommates {totalResidents}
				</p>

				<div className="flex justify-center gap-4">
					<button
						onClick={() => onVote(ruleId, "YES")}
						className={`button px-4 py-2 ${
							myVote === "YES" ? "bg-green-500 text-white" : ""
						}`}
					>
						Yes
					</button>

					<button
						onClick={() => onVote(ruleId, "NO")}
						className={`button px-4 py-2 ${
							myVote === "NO" ? "bg-red-500 text-white" : ""
						}`}
					>
						No
					</button>
				</div>

				<button
					onClick={onCancel}
					className="mt-4 text-sm text-gray-600"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
