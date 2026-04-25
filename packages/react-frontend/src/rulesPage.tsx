import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import List from "./components/list";
import RuleCard from "./components/RuleCard";
import DeleteVotePanel from "./components/DeleteVotePanel";

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
}

const TOTAL_RESIDENTS = 4;

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const navigate = useNavigate();
  const { homeCode } = useParams();

  const newRuleInputRef = useRef<HTMLTextAreaElement>(null);

  const getVoteId = () => {
    let id = localStorage.getItem("voteId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("voteId", id);
    }
    return id;
  };

  const voteId = getVoteId();

  // ✅ Calendar-style fetch (homeCode → homeId → rules)
  const fetchRules = async () => {
    if (!homeCode) return;

    try {
      setLoading(true);

      const homeRes = await fetch(
        `http://localhost:8000/homes/code/${homeCode}`
      );

      const homeData = await homeRes.json();

      const rulesRes = await fetch(
        `http://localhost:8000/homeId/${homeData._id}/rules`
      );

      const data: Rule[] = await rulesRes.json();
      setRules(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [homeCode]);

  // ✅ Create rule (calendar-style)
  const handleAddRule = async () => {
    const input = newRuleInputRef.current;
    if (!input || !input.value.trim() || !homeCode) return;

    const res = await fetch(`http://localhost:8000/${homeCode}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: input.value.trim() }),
    });

    const newRule = await res.json();
    setRules((prev) => [...prev, newRule]);

    input.value = "";
    setIsAddOpen(false);
  };

  // ✅ Voting
  const handleVote = async (ruleId: string, vote: "YES" | "NO") => {
    await fetch(`http://localhost:8000/rules/${ruleId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteId, vote }),
    });

    fetchRules();
  };

  // ✅ Delete voting (NO direct delete anymore)
  const handleDeleteVote = async (vote: "YES" | "NO") => {
    if (!deleteTarget) return;

    const res = await fetch(
      `http://localhost:8000/rules/${deleteTarget}/delete-vote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteId, vote }),
      }
    );

    const data = await res.json();

    if (data.deleted) {
      setRules((prev) => prev.filter((r) => r._id !== deleteTarget));
      setDeleteTarget(null);
    } else {
      fetchRules();
    }
  };

  if (loading) {
    return (
      <div className="background-house min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="background-house min-h-screen">

      <header className="w-full flex justify-between px-6 pt-8">
        <button onClick={() => navigate(-1)} className="button">
          ← Back
        </button>
        <h1 className="header">Rules</h1>
        <div className="w-[80px]" />
      </header>

      <main className="flex justify-center px-6 py-10">
        <div className="w-full max-w-4xl">

          <List
            item="Rules"
            items={rules}
            handleAddClick={() => setIsAddOpen(true)}
            handleRemoveClick={(rule) => setDeleteTarget(rule._id)}
            getKey={(rule) => rule._id}
            renderItem={(rule) => (
              <RuleCard
                rule={rule}
                voteId={voteId}
                onVote={handleVote}
              />
            )}
          />

        </div>
      </main>

      {/* DELETE VOTE PANEL */}
      {deleteTarget && (
        <DeleteVotePanel
          rule={rules.find((r) => r._id === deleteTarget)!}
          totalResidents={TOTAL_RESIDENTS}
          onVote={handleDeleteVote}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ADD RULE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[400px]">
            <h2 className="text-xl mb-4">Add Rule</h2>

            <textarea
              ref={newRuleInputRef}
              placeholder="e.g. Quiet hours after 10:00 pm"
              className="w-full border p-2 rounded"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsAddOpen(false)}>Cancel</button>
              <button onClick={handleAddRule} className="button">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}