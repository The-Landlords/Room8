import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const navigate = useNavigate();
  const { homeId } = useParams();
  const newRuleInputRef = useRef<HTMLTextAreaElement>(null);

  // vote id
  const getVoteId = () => {
    let id = localStorage.getItem("voteId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("voteId", id);
    }
    return id;
  };

  const voteId = getVoteId();

  // fetch rules
  const fetchRules = async () => {
    if (!homeId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8000/homes/rules/${homeId}`
      );

      const data: Rule[] = await res.json();
      setRules(data);
    } catch (err) {
      setError("Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [homeId]);

  // add rule
  const handleAddRule = async () => {
    const input = newRuleInputRef.current;
    if (!input || !input.value.trim() || !homeId) return;

    try {
      const res = await fetch("http://localhost:8000/homes/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: input.value.trim(),
          homeId,
        }),
      });

      const newRule = await res.json();
      setRules((prev) => [...prev, newRule]);

      input.value = "";
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // delete rule
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await fetch(
        `http://localhost:8000/homes/rules/${deleteTarget}`,
        { method: "DELETE" }
      );

      setRules((prev) =>
        prev.filter((r) => r._id !== deleteTarget)
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  // vote rule
  const handleVote = async (ruleId: string, vote: "YES" | "NO") => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule._id !== ruleId) return rule;

        const votes = rule.votes ? [...rule.votes] : [];

        const existing = votes.find(
          (v) => v.voteId === voteId
        );

        if (existing) {
          existing.vote = vote;
        } else {
          votes.push({ voteId, vote });
        }

        const yes = votes.filter((v) => v.vote === "YES").length;
        const no = votes.filter((v) => v.vote === "NO").length;

        let status: Rule["status"] = "PENDING";

        if (no > 0) {
          status = "REJECTED";
        } else if (yes > 0) {
          status = "CONFIRMED";
        }

        return {
          ...rule,
          votes,
          status,
        };
      })
    );

    try {
      await fetch(
        `http://localhost:8000/homes/rules/${ruleId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteId, vote }),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  {/* background */}
  if (loading) {
  return (
    <div className="background-house min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

return (
  <div className="background-house min-h-screen">

    {/* header */}
    <header className="w-full flex items-center justify-between px-6 pt-8">
      <button onClick={() => navigate(-1)} className="button px-4 py-2">← Back</button>
      <h1 className="header">Rules</h1>
      <div className="w-[80px]" />
    </header>

    {/* main */}
    <main className="flex justify-center px-6 py-10">
      <div className="w-full max-w-4xl bg-primary/60 rounded-2xl p-8 space-y-6">

        {rules.map(rule => {
          const yes = rule.votes?.filter(v => v.vote === "YES").length || 0;
          const no = rule.votes?.filter(v => v.vote === "NO").length || 0;
          const myVote = rule.votes?.find(v => v.voteId === voteId)?.vote;

          const statusText =
            rule.status === "CONFIRMED"
              ? "Agreed by roommates"
              : rule.status === "REJECTED"
              ? "Rejected by roommates"
              : "Pending";

          return (
            <div key={rule._id} className="bg-primary/70 rounded-2xl p-6 flex gap-4">
              <div className="flex-1">
                <p className="text-lg">{rule.description}</p>
                <p className="text-sm mt-3">{statusText}</p>
                <p className="text-sm text-text/70">YES {yes} | NO {no}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleVote(rule._id, "YES")}
                  className={`button px-3 py-1 ${myVote === "YES" ? "bg-green-500" : ""}`}
                >
                  Yes
                </button>

                <button
                  onClick={() => handleVote(rule._id, "NO")}
                  className={`button px-3 py-1 ${myVote === "NO" ? "bg-red-500" : ""}`}
                >
                  No
                </button>

                <button
                  onClick={() => setDeleteTarget(rule._id)}
                  className="text-red-700 text-2xl"
                >
                  −
                </button>
              </div>
            </div>
          );
        })}

        {/* add button */}
        <div className="flex justify-center pt-6">
          <button onClick={() => setIsAddOpen(true)} className="button px-10 py-3">
            + Add Rule
          </button>
        </div>
      </div>
    </main>

    {/* add rule*/}
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
            <button onClick={handleAddRule} className="button">Add</button>
          </div>
        </div>
      </div>
    )}

    {/* delete rule*/}
    {deleteTarget && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl w-[350px] text-center">
          <h2 className="text-lg mb-4">Delete this rule?</h2>
          <div className="flex justify-center gap-4">
            <button onClick={() => setDeleteTarget(null)}>No</button>
            <button onClick={confirmDelete}>Yes</button>
          </div>
        </div>
      </div>
    )}
  </div>
);}
