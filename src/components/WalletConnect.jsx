import { useBlockchain } from "../context/BlockchainContext";
import { Wallet, Unlink, Loader } from "lucide-react";

export default function WalletConnect() {
  const { account, network, connecting, contractDeployed, connectWallet, disconnectWallet } = useBlockchain();

  if (connecting) {
    return (
      <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium cursor-not-allowed">
        <Loader size={14} className="animate-spin" />
        Connecting…
      </button>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        {!contractDeployed && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Contract not deployed
          </span>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-purple-800 font-mono text-xs">
            {account.slice(0, 6)}…{account.slice(-4)}
          </span>
          {network && (
            <span className="text-purple-500 text-xs hidden sm:inline">
              · {network.name || `chain ${network.chainId}`}
            </span>
          )}
        </div>
        <button
          onClick={disconnectWallet}
          title="Disconnect wallet"
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Unlink size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shadow-sm"
    >
      <Wallet size={14} />
      Connect Wallet
    </button>
  );
}