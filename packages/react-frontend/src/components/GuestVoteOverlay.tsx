import { useEffect, useState } from "react";
import { API_BASE } from "../config";

type Ascension = {
	_id: string;
	guestId:
	| {
		_id: string;
		fullName: string;
	}
	| string;

	status: "PENDING" | "APPROVED" | "REJECTED";

	votes: {
		voteId: string;
		vote: "YES" | "NO";
	}[];

	yesVotes: number;
	noVotes: number;
	totalResidents: number;
};

type Props = {
	homeCode: string;
};

export default function GuestVoteOverlay({ homeCode }: Props) {
	const [ascensions, setAscensions] = useState<Ascension[]>([]);
	const [errorMsg, setErrorMsg] = useState("");
	const [loading, setLoading] = useState(false);
	const [votingId, setVotingId] = useState<string | null>(null);

	async function fetchAscensions() {
		if (!homeCode) return;

		setLoading(true);
		setErrorMsg("");

		try {
			const res = await fetch(
				`${API_BASE}/guest-ascension/home/${homeCode}`,
				{ credentials: "include" }
			);

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to load");
			}

			setAscensions(Array.isArray(data) ? data : []);
		} catch (err: any) {
			console.error("FETCH ASCENSIONS ERROR:", err);
			setErrorMsg(err.message || "Error loading ascensions");
			setAscensions([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchAscensions();
	}, [homeCode]);

	async function voteOnAscension(id: string, vote: "YES" | "NO") {
		setVotingId(id);
		setErrorMsg("");

		try {
			const res = await fetch(
				`${API_BASE}/guest-ascension/${id}/vote`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ vote }),
				}
			);

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Vote failed");
			}

			await fetchAscensions();
		} catch (err: any) {
			console.error("VOTE ERROR:", err);
			setErrorMsg(err.message || "Vote error");
		} finally {
			setVotingId(null);
		}
	}

	async function deleteAscension(id: string) {
		try {
			const res = await fetch(
				`${API_BASE}/guest-ascension/${id}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Delete failed");
			}

			await fetchAscensions();
		} catch (err: any) {
			setErrorMsg(err.message);
		}
	}

	const visible = ascensions;

	function getGuestName(guestId: Ascension["guestId"]) {
		if (typeof guestId === "string") return "Loading...";
		return guestId?.fullName ?? "Unknown User";
	}

	return (
		<div className="overlay">
			<h2 className="text-lg font-semibold mb-3">
				Guest Ascension Votes
			</h2>

			{loading && <p>Loading...</p>}
			{errorMsg && <p className="text-red-500">{errorMsg}</p>}

			{!loading && visible.length === 0 && (
				<p>No requests</p>
			)}

			<div className="flex flex-col gap-4">
				{visible.map((a) => (
					<div key={a._id} className="border p-3 rounded">
						<p>Guest: {getGuestName(a.guestId)}</p>

						<p>
							Yes: {a.yesVotes} | No: {a.noVotes} | Total: {a.totalResidents}
						</p>

						<p className="text-sm font-semibold">
							Status: {a.status}
						</p>

						<div className="flex gap-2 mt-3">
							<button
								className="button"
								disabled={votingId === a._id}
								onClick={() => voteOnAscension(a._id, "YES")}
							>
								YES
							</button>

							<button
								className="button"
								disabled={votingId === a._id}
								onClick={() => voteOnAscension(a._id, "NO")}
							>
								NO
							</button>

							<button
								className="button mt-2"
								onClick={() => deleteAscension(a._id)}
							>
								Delete Request
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
