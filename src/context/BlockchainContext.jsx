import { createContext, useContext, useState, useCallback, useRef } from "react";
import { BrowserProvider, Contract } from "ethers";
import contractInfo from "../contracts/TaskAuditLog.json";
import toast from "react-hot-toast";

const BlockchainContext = createContext(null);

const EVENT_LABELS = ["Created", "Updated", "Completed", "Deleted"];

// keccak256 of a JS object snapshot (matches Solidity's keccak256)
async function hashTask(taskObj) {
  const json = JSON.stringify(taskObj, Object.keys(taskObj).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return "0x" + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function BlockchainProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [contractDeployed] = useState(!!contractInfo.address);
  const contractRef = useRef(null);

  // Helper to get injected provider (modern + legacy fallback)
  const getInjectedProvider = () => {
    // Modern extensions (MetaMask) expose window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) return window.ethereum;
    // Older dapp browsers expose window.web3.currentProvider
    if (typeof window !== 'undefined' && window.web3 && window.web3.currentProvider) return window.web3.currentProvider;
    return null;
  };

  const getContract = useCallback(async (withSigner = false) => {
    if (!contractInfo.address) return null;
    const injected = getInjectedProvider();
    if (!injected) return null;
    // expose provider for debugging
    console.debug('[Blockchain] injected provider:', injected);
    const provider = new BrowserProvider(injected);
    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(contractInfo.address, contractInfo.abi, signer);
    }
    return new Contract(contractInfo.address, contractInfo.abi, provider);
  }, []);

  const connectWallet = useCallback(async () => {
    const injected = getInjectedProvider();
    if (!injected) {
      toast.error("MetaMask (or another Web3 wallet) not detected. Install MetaMask and enable it for this site.");
      console.warn('[Blockchain] No injected wallet provider found on window');
      return;
    }
    setConnecting(true);
    try {
      const provider = new BrowserProvider(injected);
      const accounts = await provider.send("eth_requestAccounts", []);
      const net = await provider.getNetwork();
      setAccount(accounts[0]);
      setNetwork({ chainId: net.chainId.toString(), name: net.name });
      contractRef.current = await getContract(true);
      toast.success(`Wallet connected: ${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`);

      // Listen for account / chain changes
      window.ethereum.on("accountsChanged", (accs) => {
        setAccount(accs[0] ?? null);
        if (!accs[0]) toast("Wallet disconnected");
      });
      window.ethereum.on("chainChanged", () => window.location.reload());
    } catch (err) {
      toast.error("Wallet connection failed: " + (err.message ?? err));
    } finally {
      setConnecting(false);
    }
  }, [getContract]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setNetwork(null);
    contractRef.current = null;
    toast("Wallet disconnected");
  }, []);

  /**
   * Log a task event on-chain.
   * @param {object} task      – full task object from the API
   * @param {"CREATED"|"UPDATED"|"COMPLETED"|"DELETED"} eventType
   * @param {string} metadata  – short description
   */
  const logTaskEvent = useCallback(async (task, eventType, metadata = "") => {
    if (!account) return null;
    if (!contractInfo.address) {
      console.warn("Contract not deployed yet — skipping on-chain log");
      return null;
    }
    try {
      const contract = contractRef.current ?? await getContract(true);
      if (!contract) return null;

      const eventIndex = ["CREATED", "UPDATED", "COMPLETED", "DELETED"].indexOf(eventType);
      if (eventIndex === -1) throw new Error("Unknown event type: " + eventType);

      const dataHash = await hashTask(task);
      const tx = await contract.logEvent(task.id, eventIndex, dataHash, metadata || `${eventType} – task #${task.id}`);
      const receipt = await tx.wait();
      console.log(`[Blockchain] ${eventType} event logged for task ${task.id}. TX: ${receipt.hash}`);
      return receipt;
    } catch (err) {
      console.error("[Blockchain] logTaskEvent failed:", err);
      return null;
    }
  }, [account, getContract]);

  /**
   * Fetch on-chain history for a given task ID.
   * Returns [] when contract is not deployed or wallet not connected.
   */
  const getTaskHistory = useCallback(async (taskId) => {
    if (!contractInfo.address) return [];
    try {
      const contract = await getContract(false);
      if (!contract) return [];
      const raw = await contract.getTaskHistory(BigInt(taskId));
      return raw.map((entry) => ({
        taskId: entry.taskId.toString(),
        eventType: EVENT_LABELS[Number(entry.eventType)] ?? "Unknown",
        dataHash: entry.dataHash,
        actor: entry.actor,
        timestamp: new Date(Number(entry.timestamp) * 1000),
        metadata: entry.metadata,
      }));
    } catch (err) {
      console.error("[Blockchain] getTaskHistory failed:", err);
      return [];
    }
  }, [getContract]);

  return (
    <BlockchainContext.Provider value={{
      account,
      network,
      connecting,
      contractDeployed,
      contractAddress: contractInfo.address,
      connectWallet,
      disconnectWallet,
      logTaskEvent,
      getTaskHistory,
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error("useBlockchain must be used inside BlockchainProvider");
  return ctx;
}