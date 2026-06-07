import { useState, useEffect } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { Shield, ChevronDown, ChevronUp, Loader, ExternalLink } from "lucide-react";

const EVENT_COLORS = {
  Created:   "bg-green-100 text-green-700 border-green-200",
  Updated:   "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-purple-100 text-purple-700 border-purple-200",
  Deleted:   "bg-red-100 text-red-700 border-red-200",
  Unknown:   "bg-gray-100 text-gray-600 border-gray-200",
};

function shortHash(hex) {
  return hex ? `${hex.slice(0, 8)}…${hex.slice(-6)}` : "—";
}

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";
}

export default function BlockchainAudit({ task }) {
  const { account, contractDeployed, getTaskHistory } = useBlockchain();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (!contractDeployed || !task?.id) return;

    setLoading(true);
    getTaskHistory(task.id)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [open, task?.id, contractDeployed, getTaskHistory]);

  if (!account) return null;

  return (
    <div className="mt-3 border border-purple-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium text-purple-800"
      >
        <span className="flex items-center gap-2">
          <Shield size={14} />
          Blockchain Audit Trail
          {history.length > 0 && (
            <span className="bg-purple-200 text-purple-700 text-xs rounded-full px-1.5 py-0.5">
              {history.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="bg-white px-4 py-3">
          {!contractDeployed ? (
            <p className="text-xs text-amber-600 py-1">
              Smart contract not deployed yet. Run{" "}
              <code className="bg-amber-50 px-1 rounded">npm run deploy:local</code>{" "}
              in the <code className="bg-amber-50 px-1 rounded">onchain/</code> directory first.
            </p>
          ) : loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
              <Loader size={12} className="animate-spin" />
              Fetching on-chain history…
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-500 py-1">No on-chain events recorded for this task yet.</p>
          ) : (
            <ol className="space-y-2 mt-1">
              {history.map((entry, i) => (
                <li key={i} className="flex flex-col gap-0.5 text-xs border-l-2 border-purple-200 pl-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`border rounded px-1.5 py-0.5 font-medium text-[10px] ${EVENT_COLORS[entry.eventType] ?? EVENT_COLORS.Unknown}`}>
                      {entry.eventType}
                    </span>
                    <span className="text-gray-500">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  {entry.metadata && (
                    <span className="text-gray-700 italic">{entry.metadata}</span>
                  )}
                  <div className="flex gap-3 mt-0.5 text-gray-400 flex-wrap">
                    <span title={entry.dataHash}>
                      Hash: <span className="font-mono">{shortHash(entry.dataHash)}</span>
                    </span>
                    <span title={entry.actor}>
                      Actor: <span className="font-mono">{shortAddr(entry.actor)}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}