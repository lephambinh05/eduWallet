import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { NetworkUtils, BLOCKCHAIN_NETWORKS } from "../config/blockchain";
import { walletAPI } from "../config/api";
import { useAuth } from "./AuthContext";
import { getCurrentUser, saveUserToLocalStorage } from "../utils/userUtils";
import logger from "../utils/logger";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState("pioneZero");
  const [userDisconnected, setUserDisconnected] = useState(false);
  const [pzoBalance, setPzoBalance] = useState("0.0000");
  const [tokenSymbol, setTokenSymbol] = useState("PZO");

  // Contract state
  const [pzoToken, setPzoToken] = useState(null);

  // PZO Token functions will be declared later

  // Initialize userDisconnected from localStorage so explicit disconnect persists
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userDisconnected");
      setUserDisconnected(stored === "true");
    } catch (e) {
      console.error("Error reading userDisconnected from localStorage", e);
    }
  }, []);

  // ✅ Kết nối ví MetaMask với logic mới
  const connectWallet = async () => {
    logger.log("🔐 Authentication status:", isAuthenticated);
    const token = localStorage.getItem("accessToken");
    logger.log(
      "🔐 Access token:",
      token ? `Present (${token.substring(0, 20)}...)` : "Missing"
    );
    logger.log("🔐 User data:", getCurrentUser());

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập trước khi kết nối ví!");
      return;
    }

    if (!window.ethereum) {
      toast.error(
        "MetaMask không được cài đặt! Vui lòng cài đặt MetaMask extension từ https://metamask.io"
      );
      return;
    }

    setIsLoading(true);

    try {
      logger.log("🔗 Starting wallet connection...");

      // Note: Cannot reset selectedAddress as it's read-only
      // MetaMask will show popup if user hasn't connected before

      try {
        // Force MetaMask to show account selection popup
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (permissionError) {
        // If user rejects permissions, throw specific error
        if (permissionError.code === 4001) {
          throw new Error("Người dùng đã từ chối cấp quyền truy cập ví");
        }
        throw permissionError;
      }

      // Now request accounts after permissions are granted
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("Không có tài khoản nào được chọn");
      }

      const address = ethers.utils.getAddress(accounts[0]);
      logger.log("✅ Selected account:", address);

      // Get network info and validate Pione Zero network
      const network = await window.ethereum.request({ method: "eth_chainId" });
      const chainId = parseInt(network, 16);

      // Check if connected to Pione Zero
      if (chainId !== BLOCKCHAIN_NETWORKS.pioneZero.chainId) {
        throw new Error(
          `Vui lòng chuyển sang mạng ${BLOCKCHAIN_NETWORKS.pioneZero.name} để tiếp tục`
        );
      }

      const networkConfig = BLOCKCHAIN_NETWORKS.pioneZero;

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Update state
      setAccount(address);
      setProvider(provider);
      setSigner(signer);
      setChainId(chainId);
      setCurrentNetwork(networkConfig ? networkConfig.name : "Unknown Network");
      setIsConnected(true);
      setUserDisconnected(false);
      // Clear persisted disconnect flag when user manually connects
      try {
        localStorage.removeItem("userDisconnected");
      } catch (e) {
        /* ignore */
      }

      // Save to database using new API
      logger.log("💾 Saving wallet to database:", {
        address,
        chainId,
        network: networkConfig ? networkConfig.name : "Unknown Network",
      });

      await walletAPI.saveWallet({
        address,
        chainId,
        network: networkConfig ? networkConfig.name : "Unknown Network",
      });

      // Update user in localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.walletAddress = address;
        currentUser.walletInfo = {
          address,
          chainId,
          network: networkConfig ? networkConfig.name : "Unknown Network",
          isConnected: true,
        };
        saveUserToLocalStorage(currentUser);
      }

      logger.log("✅ Wallet connected and saved to database:", {
        address,
        chainId,
        network: networkConfig ? networkConfig.name : "Unknown Network",
      });

      toast.success("Kết nối ví thành công!");
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);

      if (error.code === 4001) {
        toast.error("Người dùng đã từ chối kết nối ví");
      } else if (error.code === -32002) {
        toast.error("Đang có yêu cầu kết nối ví khác đang chờ xử lý");
      } else if (error.code === -32603) {
        toast.error("Lỗi nội bộ MetaMask. Vui lòng thử lại");
      } else {
        toast.error(`Lỗi kết nối ví: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ❌ Ngắt kết nối ví
  const disconnectWallet = useCallback(async () => {
    if (!account) return;

    try {
      logger.log("🔌 Disconnecting wallet...");

      // Delete from database
      await walletAPI.deleteWallet(account);

      // Clear state
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setChainId(null);
      setCurrentNetwork("pioneZero");
      setIsConnected(false);
      setUserDisconnected(true);
      // Persist that the user explicitly disconnected so auto-restore won't happen
      try {
        localStorage.setItem("userDisconnected", "true");
      } catch (e) {
        /* ignore */
      }

      // Clear localStorage
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("isWalletConnected");
      localStorage.removeItem("walletChainId");
      localStorage.removeItem("walletNetwork");
      localStorage.removeItem("walletProvider");
      localStorage.removeItem("walletSigner");

      // Update user in localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        delete currentUser.walletAddress;
        delete currentUser.walletInfo;
        saveUserToLocalStorage(currentUser);
      }

      logger.log("✅ Wallet disconnected and removed from database");
      toast.success("Đã ngắt kết nối ví!");
    } catch (error) {
      console.error("❌ Error disconnecting wallet:", error);
      toast.error("Lỗi khi ngắt kết nối ví");
    }
  }, [account]);

  // 🔄 Kiểm tra kết nối ví khi reload trang (chỉ dùng eth_accounts, không gây popup)
  const checkWalletConnection = useCallback(async () => {
    if (!window.ethereum || !isAuthenticated || userDisconnected) {
      logger.log("⚠️ Skipping wallet check:", {
        hasEthereum: !!window.ethereum,
        isAuthenticated,
        userDisconnected,
      });
      return;
    }

    try {
      logger.log("🔍 Checking wallet connection (silent check)...");

      // Get current accounts from MetaMask (không gây popup)
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const address = ethers.utils.getAddress(accounts[0]);
        logger.log("🔍 Found account in MetaMask:", address);

        // Check if wallet exists in database
        try {
          const response = await walletAPI.checkWallet(address);

          if (response.data.exists && response.data.wallet.connected) {
            logger.log("✅ Wallet found in database, restoring connection...");

            // Get network info
            const network = await window.ethereum.request({
              method: "eth_chainId",
            });
            const chainId = parseInt(network, 16);
            const networkConfig = NetworkUtils.getNetworkByChainId(chainId);

            // Create provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Update state
            setAccount(address);
            setProvider(provider);
            setSigner(signer);
            setChainId(chainId);
            setCurrentNetwork(
              networkConfig ? networkConfig.name : "Unknown Network"
            );
            setIsConnected(true);

            // Update user in localStorage
            const currentUser = getCurrentUser();
            if (currentUser) {
              currentUser.walletAddress = address;
              currentUser.walletInfo = {
                address,
                chainId,
                network: networkConfig ? networkConfig.name : "Unknown Network",
                isConnected: true,
              };
              saveUserToLocalStorage(currentUser);
            }

            logger.log("✅ Wallet restored from database:", {
              address,
              chainId,
              network: networkConfig ? networkConfig.name : "Unknown Network",
            });

            toast.success("Ví đã được khôi phục!");
          } else {
            logger.log("❌ Wallet not found in database or disconnected");
          }
        } catch (apiError) {
          console.error("❌ Error checking wallet in database:", apiError);
        }
      } else {
        logger.log("❌ No accounts connected in MetaMask");
      }
    } catch (error) {
      console.error("❌ Error checking wallet connection:", error);
      // Không hiển thị toast error cho auto-check để tránh spam
    }
  }, [isAuthenticated, userDisconnected]);

  // 🧠 Lắng nghe khi đổi ví hoặc ngắt kết nối trong MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      logger.log("🔄 Accounts changed:", accounts);

      if (accounts.length === 0) {
        // User disconnected in MetaMask
        await disconnectWallet();
      } else {
        // User switched accounts
        const newAddress = ethers.utils.getAddress(accounts[0]);

        if (newAddress !== account) {
          logger.log("🔄 Switching to new account:", newAddress);

          // Get network info
          const network = await window.ethereum.request({
            method: "eth_chainId",
          });
          const chainId = parseInt(network, 16);
          const networkConfig = NetworkUtils.getNetworkByChainId(chainId);

          // Create provider and signer
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          // Update state
          setAccount(newAddress);
          setProvider(provider);
          setSigner(signer);
          setChainId(chainId);
          setCurrentNetwork(
            networkConfig ? networkConfig.name : "Unknown Network"
          );
          setIsConnected(true);

          // Save new wallet to database
          await walletAPI.saveWallet({
            address: newAddress,
            chainId,
            network: networkConfig ? networkConfig.name : "Unknown Network",
          });

          // Update user in localStorage
          const currentUser = getCurrentUser();
          if (currentUser) {
            currentUser.walletAddress = newAddress;
            currentUser.walletInfo = {
              address: newAddress,
              chainId,
              network: networkConfig ? networkConfig.name : "Unknown Network",
              isConnected: true,
            };
            saveUserToLocalStorage(currentUser);
          }

          logger.log("✅ Switched to new wallet:", newAddress);
          toast.success("Đã chuyển sang ví mới!");
        }
      }
    };

    const handleChainChanged = (chainId) => {
      logger.log("🔄 Chain changed:", chainId);
      const newChainId = parseInt(chainId, 16);

      // Only allow Pione Zero network
      if (newChainId !== BLOCKCHAIN_NETWORKS.pioneZero.chainId) {
        toast.error(
          `Vui lòng chuyển sang mạng ${BLOCKCHAIN_NETWORKS.pioneZero.name} để tiếp tục`
        );
        return;
      }

      setChainId(newChainId);
      setCurrentNetwork(BLOCKCHAIN_NETWORKS.pioneZero.name);
      toast.info(`Đã chuyển sang mạng: ${BLOCKCHAIN_NETWORKS.pioneZero.name}`);
    };

    // Add event listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Cleanup
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, isAuthenticated, userDisconnected, disconnectWallet]);

  // 🔄 Check MetaMask availability when page loads (không tự động connect)
  useEffect(() => {
    if (window.ethereum) {
      logger.log("✅ MetaMask detected and ready");
    } else {
      logger.log("⚠️ MetaMask not detected");
    }
  }, []);

  // 🔄 Auto-restore wallet when page loads (chỉ khi user đã connect trước đó)
  useEffect(() => {
    if (isAuthenticated && !userDisconnected) {
      // Delay to ensure authentication is complete
      const timer = setTimeout(async () => {
        // Check if already on Pione Zero network
        if (window.ethereum) {
          const chainId = parseInt(
            await window.ethereum.request({ method: "eth_chainId" }),
            16
          );
          if (chainId !== BLOCKCHAIN_NETWORKS.pioneZero.chainId) {
            // Try to switch to Pione Zero network
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                  {
                    chainId: `0x${BLOCKCHAIN_NETWORKS.pioneZero.chainId.toString(
                      16
                    )}`,
                  },
                ],
              });
            } catch (switchError) {
              // If network doesn't exist, try to add it
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: `0x${BLOCKCHAIN_NETWORKS.pioneZero.chainId.toString(
                          16
                        )}`,
                        chainName: BLOCKCHAIN_NETWORKS.pioneZero.name,
                        nativeCurrency:
                          BLOCKCHAIN_NETWORKS.pioneZero.nativeCurrency,
                        rpcUrls: [BLOCKCHAIN_NETWORKS.pioneZero.rpcUrl],
                        blockExplorerUrls:
                          BLOCKCHAIN_NETWORKS.pioneZero.blockExplorerUrls,
                      },
                    ],
                  });
                } catch (addError) {
                  console.error("Error adding Pione Zero network:", addError);
                  toast.error(
                    "Không thể thêm mạng Pione Zero. Vui lòng thêm mạng thủ công."
                  );
                  return;
                }
              } else {
                console.error(
                  "Error switching to Pione Zero network:",
                  switchError
                );
                toast.error(
                  "Không thể chuyển sang mạng Pione Zero. Vui lòng chuyển mạng thủ công."
                );
                return;
              }
            }
          }
        }
        checkWalletConnection();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userDisconnected, checkWalletConnection]);

  // Initialize PZO Token contract when signer changes
  const initializePZOToken = useCallback(async () => {
    if (!signer || !provider) {
      logger.log("❌ No signer or provider available");
      return;
    }

    try {
      const pzoTokenAddress = process.env.REACT_APP_PZO_TOKEN_ADDRESS;
      logger.log("🔍 PZO Token address:", pzoTokenAddress);

      if (!pzoTokenAddress || pzoTokenAddress === "undefined") {
        console.error("❌ PZO Token address not found in env");
        return;
      }

      const pzoTokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const tokenContract = new ethers.Contract(
        pzoTokenAddress,
        pzoTokenABI,
        signer
      );
      setPzoToken(tokenContract);
      logger.log("✅ PZO Token contract initialized");
    } catch (error) {
      console.error("❌ Error initializing PZO Token contract:", error);
    }
  }, [signer, provider]);

  // Get native token balance
  const getAccountBalance = async () => {
    if (!account || !provider) {
      console.log("❌ No account or provider available for balance check");
      return "0.0000";
    }

    try {
      console.log("💰 Getting account balance for:", account);
      const balance = await provider.getBalance(account);
      const balanceInEth = ethers.utils.formatEther(balance);
      console.log("💰 Account balance:", balanceInEth, "ETH");
      return balanceInEth;
    } catch (error) {
      console.error("❌ Error getting account balance:", error);
      return "0.0000";
    }
  };

  // Get PZO Token balance (Native balance - không dùng contract)
  const getPZOBalance = useCallback(async () => {
    if (!account || !provider) {
      console.log("❌ No account or provider available");
      setPzoBalance("0.0000");
      return "0.0000";
    }

    try {
      // Get current network's token symbol
      const symbol =
        chainId === BLOCKCHAIN_NETWORKS.pioneChain.chainId ? "PIO" : "PZO";

      console.log(`💰 Getting native ${symbol} balance for:`, account);

      // Get native balance (PZO/PIO là native token của mạng)
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.utils.formatEther(balance);

      console.log(`💰 Native ${symbol} balance:`, formattedBalance, symbol);
      setPzoBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error("❌ Error getting native balance:", error);
      setPzoBalance("0.0000");
      return "0.0000";
    }
  }, [account, provider, chainId]);

  // Initialize PZO Token contract when signer changes
  useEffect(() => {
    if (signer && isConnected) {
      initializePZOToken();
    }
  }, [signer, isConnected, initializePZOToken]);

  // Update PZO balance when account or provider changes
  useEffect(() => {
    if (account && provider) {
      getPZOBalance();
    }
  }, [account, provider, getPZOBalance]);

  // Update token symbol when chain changes
  useEffect(() => {
    if (chainId) {
      const symbol =
        chainId === BLOCKCHAIN_NETWORKS.pioneChain.chainId ? "PIO" : "PZO";
      setTokenSymbol(symbol);
    }
  }, [chainId]);

  const value = {
    // State
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    chainId,
    currentNetwork,
    userDisconnected,
    pzoBalance,
    tokenSymbol,

    // Actions
    connectWallet,
    disconnectWallet,
    getAccountBalance,
    getPZOBalance,

    // Contract state
    pzoToken,

    // Network utilities
    NetworkUtils,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
