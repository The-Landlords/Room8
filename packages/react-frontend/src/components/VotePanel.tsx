import React from "react";

interface VotePanelProps {
  ruleId: string;
  myVote?: "YES" | "NO";
  yesCount: number;
  noCount: number;
  onVote: (ruleId: string, vote: "YES" | "NO") => void;
}

export default function VotePanel({
  ruleId,
  myVote,
  yesCount,
  noCount,
  onVote,
}: VotePanelProps) {
  return (
    <div className="flex flex-col gap-2 items-end">

      <button
        onClick={() => onVote(ruleId, "YES")}
        className={`button px-3 py-1 ${
          myVote === "YES" ? "vote-yes" : ""
        }`}
      >
        Yes
      </button>

      <button
        onClick={() => onVote(ruleId, "NO")}
        className={`button px-3 py-1 ${
          myVote === "NO" ? "bg-red-500 text-white" : ""
        }`}
      >
        No
      </button>

      <p className="text-sm text-text/70">
        YES {yesCount} | NO {noCount}
      </p>
    </div>
  );
}