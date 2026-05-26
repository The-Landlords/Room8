import React, { type ReactNode, useState } from "react";
import { API_BASE } from "../config";
import List from "./list";

type Guest = {
	_id: string;
	fullName: string;
};

type GuestVoteOverlayProps<Guest> = {
	guests: Guest[];
	homeCode: string;
	username: string;
};

export default function GuestVoteOverlay({
	guests,
	homeCode,
}: GuestVoteOverlayProps<Guest>) {
	const [vote, setVote] = useState<"approve" | "reject" | "abstain" | null>(
		null
	);
	const [errorMsg, setErrorMsg] = useState("");

	/*async function submitVote() {
        if (!vote) {
            setErrorMsg("Please select a vote option.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/rules/vote/${ruleId}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vote }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit vote.");
            }

            setErrorMsg("");
        } catch (error) {
            setErrorMsg(error.message);
        }
    }*/

	return (
		<div className="overlay">
			<h2>Vote on Guest Ascencion</h2>
			<div>
				<List
					item=""
					items={guests}
					handleAddClick={() => {}}
					handleRemoveClick={() => {}}
					getKey={(guests: Guest) => guests._id}
					renderItem={(guest: Guest) => (
						<div>
							<p>{guest.fullName}</p>
							<button className="button">Yes</button>
						</div>
					)}
					homeCode={homeCode ? [homeCode] : undefined}
				></List>
			</div>
		</div>
	);
}
