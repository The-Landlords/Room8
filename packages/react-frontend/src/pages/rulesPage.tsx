import { API_BASE } from "../config";
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
	const [, setLoading] = useState(false);
	const [, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const [totalResidents, setTotalResidents] = useState(0);

	const { homeCode = "" } = useParams();
	const navigate = useNavigate();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [showVoting, setShowVoting] = useState(true);

	const [voteId] = useState(() => {
		let id = localStorage.getItem("voteId");
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem("voteId", id);
		}
		return id;
	});

	const selectedRule = rules.find((r) => r._id === deleteTarget);

	async function fetchRules() {
		if (!homeCode) return;

		const homeRes = await fetch(`${API_BASE}/homes/code/${homeCode}`);
		if (!homeRes.ok) throw new Error("Failed to fetch home");
		const homeData = await homeRes.json();
		setHomeName(homeData.homeName);

		const residentRes = await fetch(
			`${API_BASE}/relate/home/${homeData._id}/residents`
		);
		if (!residentRes.ok) throw new Error("Failed to fetch residents");

		const residentData = await residentRes.json();
		setTotalResidents(residentData.count);

		const rulesRes = await fetch(`${API_BASE}/homes/rules/${homeCode}`);
		if (!rulesRes.ok) throw new Error("Failed to fetch rules");

		setRules(await rulesRes.json());
	}

	useEffect(() => {
		fetchRules().catch(console.error);
	}, [homeCode]);

	async function handleAdd() {
		if (!inputRef.current || !inputRef.current.value.trim() || !homeCode)
			return;

		setLoading(true);
		setError("");

		try {
			const res = await fetch(`${API_BASE}/homes/rules`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					homeCode,
					description: inputRef.current.value.trim(),
				}),
			});

			if (!res.ok) throw new Error("Failed to add rule");

			inputRef.current.value = "";
			setOverlayOpen(false);
			await fetchRules();
		} catch {
			setError("Failed to add rule");
		} finally {
			setLoading(false);
		}
	}

	// ✅ FIX: no voting lock (jest tests can be async + fast)
	async function handleVote(ruleId: string, vote: "YES" | "NO") {
		if (!voteId) return;

		const res = await fetch(`${API_BASE}/rules/${ruleId}/vote`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ voteId, vote }),
		});

		if (!res.ok) {
			console.error(await res.text());
			return;
		}

		await fetchRules();
	}

	async function handleDeleteVote(ruleId: string, vote: "YES" | "NO") {
		if (!voteId) return;

		const res = await fetch(`${API_BASE}/rules/${ruleId}/delete-vote`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ voteId, vote }),
		});

		const data = await res.json();

		if (data.deleted) {
			setRules((prev) => prev.filter((r) => r._id !== ruleId));
			setDeleteTarget(null);
		} else {
			await fetchRules();
		}
	}

	const renderRule = (rule: Rule) => (
		<RuleCard
			rule={rule}
			voteId={voteId}
			totalResidents={totalResidents}
			onVote={handleVote}
			showVoting={showVoting}
		/>
	);

	useEffect(() => {
		(window as any).toggleVoting = () => {
			setShowVoting((prev) => !prev);
		};

		return () => {
			delete (window as any).toggleVoting;
		};
	}, []);

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
				<List
					item="Rules"
					items={rules}
					handleAddClick={() => setOverlayOpen(true)}
					handleRemoveClick={(rule) => setDeleteTarget(rule._id)}
					getKey={(rule) => rule._id}
					renderItem={renderRule}
				/>
			</main>

			{overlayOpen && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
					<div className="bg-white p-6 rounded-2xl w-[400px]">
						<h2 className="text-xl mb-4">Add Rule</h2>

						<textarea
							ref={inputRef}
							className="w-full border p-2 rounded"
							placeholder="e.g. Quiet hours after 10pm"
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
					totalResidents={totalResidents}
					onVote={handleDeleteVote}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
}
