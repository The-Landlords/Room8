import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "../components/list";
import RuleCard from "../components/RuleCard";
import DeleteVotePanel from "../components/DeleteVotePanel";

interface Vote {
	voteId: string;
	vote: "YES" | "NO";
}

interface Rule {
	_id: string;
	description: string;
	status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
	createdAt: string;
	votes?: Vote[];
	deleteVotes?: Vote[];
	deleteStatus?: "NONE" | "PENDING" | "REJECTED" | "CONFIRMED";
}

export default function RulesPage() {
	const [rules, setRules] = useState<Rule[]>([]);
	const [homeName, setHomeName] = useState("");
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

	const { homeCode = "" } = useParams();
	const navigate = useNavigate();
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const getVoteId = () => {
		let id = localStorage.getItem("voteId");
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem("voteId", id);
		}
		return id;
	};

	const voteId = getVoteId();

	const selectedRule = rules.find((r) => r._id === deleteTarget);

	async function fetchRules() {
		if (!homeCode) return;

		const homeRes = await fetch(
			`http://localhost:8000/homes/code/${homeCode}`
		);
		if (!homeRes.ok) throw new Error("Failed to fetch home");
		const homeData = await homeRes.json();

		setHomeName(homeData.homeName);

		const rulesRes = await fetch(
			`http://localhost:8000/homes/rules/${homeCode}`
		);
		if (!rulesRes.ok) throw new Error("Failed to fetch rules");
		const data = await rulesRes.json();
		setRules(data);
	}

	useEffect(() => {
		fetchRules().catch(console.error);
	}, [homeCode]);

	async function handleAdd() {
		if (!inputRef.current || !inputRef.current.value.trim() || !homeCode)
			return;

		const res = await fetch(`http://localhost:8000/${homeCode}/rules`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				description: inputRef.current.value.trim(),
			}),
		});

		if (!res.ok) throw new Error("Failed to add rule");

		await fetchRules();
		inputRef.current.value = "";
		setOverlayOpen(false);
	}

	async function handleVote(ruleId: string, vote: "YES" | "NO") {
		await fetch(`http://localhost:8000/rules/${ruleId}/vote`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ voteId, vote }),
		});

		fetchRules().catch(console.error);
	}

	async function handleDeleteVote(ruleId: string, vote: "YES" | "NO") {
		if (!voteId) return;

		const res = await fetch(
			`http://localhost:8000/rules/${ruleId}/delete-vote`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ voteId, vote }),
			}
		);

		const data = await res.json();

		if (data.deleted) {
			setRules((prev) => prev.filter((r) => r._id !== ruleId));
			setDeleteTarget(null);
		} else {
			fetchRules().catch(console.error);
		}
	}

	const renderRule = (rule: Rule) => (
		<RuleCard rule={rule} voteId={voteId} onVote={handleVote} />
	);

	return (
		<div className="background-house min-h-screen">
			<header className="w-full flex justify-between px-6 pt-8">
				<button onClick={() => navigate(-1)} className="button">
					← Back
				</button>

				<h1 className="header">Rules for {homeName}</h1>

				<div className="w-[80px]" />
			</header>

			<main className="flex justify-center px-6 py-10">
				<div className="flex items-start">
					<List
						item="Rules"
						items={rules}
						handleAddClick={() => setOverlayOpen(true)}
						handleRemoveClick={(rule) => setDeleteTarget(rule._id)}
						getKey={(rule) => rule._id}
						renderItem={renderRule}
					/>
				</div>
			</main>

			{overlayOpen && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
					<div className="bg-white p-6 rounded-2xl w-[400px]">
						<h2 className="text-xl mb-4">Add Rule</h2>

						<textarea
							ref={inputRef}
							placeholder="e.g. Quiet hours after 10pm"
							className="w-full border p-2 rounded"
						/>

						<div className="flex justify-end gap-3 mt-4">
							<button onClick={() => setOverlayOpen(false)}>
								Cancel
							</button>
							<button onClick={handleAdd} className="button">
								Add
							</button>
						</div>
					</div>
				</div>
			)}

			{deleteTarget && selectedRule && (
				<DeleteVotePanel
					key={deleteTarget}
					ruleId={selectedRule._id}
					voteId={voteId}
					deleteVotes={selectedRule.deleteVotes || []}
					deleteStatus={selectedRule.deleteStatus || "NONE"}
					totalResidents={4}
					onVote={handleDeleteVote}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
}
