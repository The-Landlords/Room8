// rulesPage.tsx

import { API_BASE } from "../config";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import List from "../components/list";
import RuleCard from "../components/RuleCard";
import DeleteVotePanel from "../components/DeleteVotePanel";
import RulesList from "../components/rulesList";

interface Vote {
	voteId: string;
	vote: "YES" | "NO";
}

interface Rule {
	_id: string;
	description: string;
	status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
	votes?: Vote[];
	deleteVotes?: Vote[];
	deleteStatus?: "NONE" | "PENDING" | "REJECTED" | "CONFIRMED";
}

export default function RulesPage() {
	const [rules, setRules] = useState<Rule[]>([]);
	const [homeName, setHomeName] = useState("");
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const [totalResidents, setTotalResidents] = useState(0);
	const [showVoting, setShowVoting] = useState(false);

	const [voteId, setVoteId] = useState("");

	const { homeCode = "" } = useParams();

	const navigate = useNavigate();

	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		async function fetchMe() {
			try {
				if (import.meta.env.MODE === "test") {
					setVoteId("test-vote-id");
					return;
				}

				const res = await fetch(`${API_BASE}/auth/me`, {
					credentials: "include",
				});

				if (!res.ok) {
					throw new Error("Failed to fetch user");
				}

				const data = await res.json();

				setVoteId(String(data._id));
			} catch (err) {
				console.error(err);
			}
		}

		fetchMe();
	}, []);

	async function fetchRules() {
		if (!homeCode) {
			return;
		}

		try {
			setError("");

			const homeRes = await fetch(`${API_BASE}/homes/code/${homeCode}`, {
				credentials: "include",
			});

			if (!homeRes.ok) {
				throw new Error("Failed to fetch home");
			}

			const homeData = await homeRes.json();

			setHomeName(homeData.homeName || "");

			const residentRes = await fetch(
				`${API_BASE}/relate/home/${homeData._id}/residents`,
				{
					credentials: "include",
				}
			);

			if (!residentRes.ok) {
				throw new Error("Failed to fetch residents");
			}

			const residentData = await residentRes.json();

			setTotalResidents(residentData.count || 0);

			const rulesRes = await fetch(
				`${API_BASE}/homes/rules/${homeCode}`,
				{
					credentials: "include",
				}
			);

			if (!rulesRes.ok) {
				throw new Error("Failed to fetch rules");
			}

			const rulesData = await rulesRes.json();

			setRules(Array.isArray(rulesData) ? rulesData : []);
		} catch (err) {
			console.error(err);
			setError("Failed to load rules");
		}
	}

	useEffect(() => {
		fetchRules();
	}, [homeCode]);

	async function handleAdd() {
		const value = inputRef.current?.value.trim();

		if (!value || !homeCode) {
			return;
		}

		setLoading(true);

		try {
			await fetch(`${API_BASE}/homes/rules`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					homeCode,
					description: value,
				}),
			});

			if (inputRef.current) {
				inputRef.current.value = "";
			}

			setOverlayOpen(false);

			await fetchRules();
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function handleVote(ruleId: string, vote: "YES" | "NO") {
		try {
			await fetch(`${API_BASE}/rules/${ruleId}/vote`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					vote,
				}),
			});

			await fetchRules();
		} catch (err) {
			console.error(err);
			await fetchRules();
		}
	}

	async function handleDeleteVote(ruleId: string, vote: "YES" | "NO") {
		try {
			const res = await fetch(`${API_BASE}/rules/${ruleId}/delete-vote`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					voteId,
					vote,
				}),
			});

			const data = await res.json();

			if (data.deleted) {
				setRules((prev) => prev.filter((r) => r._id !== ruleId));

				setDeleteTarget(null);
			} else {
				await fetchRules();
			}
		} catch (err) {
			console.error(err);
			await fetchRules();
		}
	}

	const selectedRule = rules.find((r) => r._id === deleteTarget);

	return (
		<div className=" flex flex-col">
			<header className="header-wrapper">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="button"
				>
					← Back
				</button>

				<h1 className="header flex-1 text-center">
					Rules for {homeName}
				</h1>
			</header>

			<main className="flex justify-center">
				<RulesList
					items={rules}
					handleAddClick={() => setOverlayOpen(true)}
					handleRemoveClick={(rule) => setDeleteTarget(rule._id)}
					handleVoteClick={() => setShowVoting((prev) => !prev)}
					getKey={(rule) => rule._id}
					className="panel"
					renderItem={(rule) => (
						<RuleCard
							rule={rule}
							voteId={voteId}
							totalResidents={totalResidents}
							onVote={handleVote}
							showVoting={showVoting}
						/>
					)}
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
							<button
								type="button"
								onClick={() => setOverlayOpen(false)}
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleAdd}
								className="button"
								disabled={loading}
							>
								{loading ? "Adding..." : "Add"}
							</button>
						</div>
					</div>
				</div>
			)}

			{deleteTarget && (
				<DeleteVotePanel
					ruleId={deleteTarget}
					voteId={voteId}
					deleteVotes={selectedRule?.deleteVotes || []}
					deleteStatus={selectedRule?.deleteStatus || "NONE"}
					totalResidents={totalResidents}
					onVote={handleDeleteVote}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}

			{error && (
				<div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg">
					{error}
				</div>
			)}
		</div>
	);
}
