import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Rule {
	_id: string;
	description: string;
	status: "PENDING" | "CONFIRMED" | "CANCELLED";
	createdAt: string;
}

export default function RulesPage() {
	const [rules, setRules] = useState<Rule[]>([]);
	const [newRuleDesc, setNewRuleDesc] = useState("");
	const [newRuleStatus, setNewRuleStatus] = useState<
		"PENDING" | "CONFIRMED" | "CANCELLED"
	>("PENDING");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { homeId = "" } = useParams(); // URL: /rules/:homeId

	useEffect(() => {
		if (!homeId) {
			setError("No home ID");
			setLoading(false);
			return;
		}

		fetch(`http://localhost:8000/homes/rules/${homeId}`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch");
				return res.json();
			})
			.then((data) => {
				setRules(data);
				setLoading(false);
			})
			.catch(() => {
				setError("Could not load rules");
				setLoading(false);
			});
	}, [homeId]);

	const handleAddRule = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newRuleDesc.trim() || !homeId) return;

		fetch(`http://localhost:8000/homes/rules`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				description: newRuleDesc.trim(),
				status: newRuleStatus,
				homeId,
			}),
		})
			.then((res) => {
				if (!res.ok) throw new Error("Add failed");
				return res.json();
			})
			.then((newRule) => {
				setRules([...rules, newRule]);
				setNewRuleDesc("");
				setNewRuleStatus("PENDING");
			})
			.catch(() => setError("Failed to add rule"));
	};

	const handleDelete = (ruleId: string) => {
		if (!window.confirm("Delete rule?")) return;

		fetch(`http://localhost:8000/homes/rules/${ruleId}`, {
			method: "DELETE",
		})
			.then((res) => {
				if (!res.ok) throw new Error("Delete failed");
			})
			.then(() => {
				setRules(rules.filter((r) => r._id !== ruleId));
			})
			.catch(() => setError("Failed to delete rule"));
	};

	if (loading) {
		return (
			<div className="background-house min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	return (
		<div className="background-house min-h-screen flex flex-col">
			{/* Top Bar */}
			<div className="flex items-center px-4 pt-4">
				{/* Back button */}
				<button
					onClick={() => {
						const username = localStorage.getItem("username");
						if (username) {
							navigate(`/homelist/${username}`);
						} else {
							navigate("/"); // go to sign in if no username found
						}
					}}
					className="text-3xl text-text mr-4 hover:opacity-70 transition"
					title="Back to Home List"
				>
					←
				</button>

				<div className="w-144" />
				<h1 className="header flex-1 text-center">Rules</h1>
			</div>

			{/* Rules list */}
			<div className="flex-1 flex flex-col items-center p-4">
				<div className="panel w-full max-w-2xl">
					<h2 className="header-secondary mb-4">Current Rules:</h2>

					<div className="space-y-4">
						{rules.length === 0 ? (
							<p className="text-center text-text/70 py-6">
								No rules yet — add one!
							</p>
						) : (
							rules.map((rule) => (
								<div
									key={rule._id}
									className="bg-primary/40 rounded-lg p-4 shadow-sm relative"
								>
									<div className="flex justify-between items-start">
										<p className="text-text font-secondary text-lg">
											{rule.description}
										</p>

										<button
											onClick={() =>
												handleDelete(rule._id)
											}
											className="text-red-700 hover:text-red-900 text-xl font-bold"
											title="Remove rule"
										>
											−
										</button>
									</div>
									<p className="text-sm mt-2 text-text/80">
										Status: {rule.status}
									</p>
								</div>
							))
						)}
					</div>

					{/* Add Rule */}
					<div className="mt-6 pt-4 border-t border-text/20">
						<h3 className="header-secondary mb-2">Add Rule</h3>
						<form
							id="add-rule-form"
							onSubmit={handleAddRule}
							className="flex flex-col gap-3"
						>
							<textarea
								value={newRuleDesc}
								onChange={(e) => setNewRuleDesc(e.target.value)}
								placeholder="e.g. Quiet hours after 10:00 pm"
								className="list-item w-full resize-y min-h-[90px]"
								maxLength={100}
							/>
							<div className="flex items-center gap-2">
								<label
									htmlFor="status"
									className="text-text font-medium"
								>
									Status:
								</label>
								<select
									id="status"
									value={newRuleStatus}
									onChange={(e) =>
										setNewRuleStatus(
											e.target.value as
												| "PENDING"
												| "CONFIRMED"
												| "CANCELLED"
										)
									}
									className="border border-gray-300 rounded px-2 py-1"
								>
									<option value="PENDING">Pending</option>
									<option value="CONFIRMED">Confirmed</option>
									<option value="CANCELLED">Cancelled</option>
								</select>
							</div>
							<button
								type="submit"
								className="text-3xl text-text hover:opacity-70 transition font-bold self-start mt-2"
								title="Add new rule"
							>
								+
							</button>
						</form>
					</div>
				</div>

				{error && (
					<p className="text-red-600 bg-red-100/50 px-4 py-2 rounded mt-6">
						{error}
					</p>
				)}
			</div>
		</div>
	);
}
