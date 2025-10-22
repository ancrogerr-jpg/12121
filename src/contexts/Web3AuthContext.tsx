import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { createNotification } from '../services/notificationService';

interface UserProfile {
  wallet_address: string;
  full_name?: string;
  role?: 'collector' | 'tester' | 'processor' | 'manufacturer';
  organization?: string;
  contact?: string;
}

interface Web3AuthContextType {
  provider: IProvider | null;
  user: any;
  userProfile: UserProfile | null;
  walletAddress: string;
  userId: string;
  loading: boolean;
  sessionExpiresAt: Date | null;
  minutesUntilExpiry: number | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (fullName: string, role: string, organization: string, contact: string) => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

const clientId = 'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13882',
  rpcTarget: 'https://rpc-amoy.polygon.technology/',
  displayName: 'Polygon Amoy Testnet',
  blockExplorerUrl: 'https://amoy.polygonscan.com/',
  ticker: 'MATIC',
  tickerName: 'MATIC',
  logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
};

const SESSION_DURATION_MS = 3600000;
const WARNING_THRESHOLD_MS = 300000;

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const [minutesUntilExpiry, setMinutesUntilExpiry] = useState<number | null>(null);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: 'sapphire_devnet',
          privateKeyProvider,
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);

        if (web3authInstance.connected && web3authInstance.provider) {
          setProvider(web3authInstance.provider);
          const userInfo = await web3authInstance.getUserInfo();
          setUser(userInfo);

          const accounts = await web3authInstance.provider.request<unknown, string[]>({
            method: 'eth_accounts',
          });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            loadUserProfile(accounts[0]);
            const expiryTime = new Date(Date.now() + SESSION_DURATION_MS);
            setSessionExpiresAt(expiryTime);
            setWarningShown(false);
          }
        }
      } catch (error) {
        console.error('Error initializing Web3Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    init();

    return () => clearTimeout(timeout);
  }, []);

  const loadUserProfile = (address: string) => {
    const stored = localStorage.getItem(`profile_${address}`);
    if (stored) {
      setUserProfile(JSON.parse(stored));
    } else {
      setUserProfile({ wallet_address: address });
    }
  };

  const startSessionTimer = useCallback(() => {
    const expiryTime = new Date(Date.now() + SESSION_DURATION_MS);
    setSessionExpiresAt(expiryTime);
    setWarningShown(false);
  }, []);

  const checkSessionExpiry = useCallback(async () => {
    if (!sessionExpiresAt || !user) {
      setMinutesUntilExpiry(null);
      return;
    }

    const now = Date.now();
    const expiryMs = sessionExpiresAt.getTime();
    const timeLeft = expiryMs - now;
    const minutesLeft = Math.floor(timeLeft / 60000);

    setMinutesUntilExpiry(minutesLeft);

    if (timeLeft <= 0) {
      await createNotification({
        user_id: user.email || user.name || walletAddress,
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        type: 'session_expiry',
        severity: 'error',
      });
      await logout();
    } else if (timeLeft <= WARNING_THRESHOLD_MS && !warningShown) {
      setWarningShown(true);
      await createNotification({
        user_id: user.email || user.name || walletAddress,
        title: 'Session Expiring Soon',
        message: `Your session will expire in ${minutesLeft} minutes. Please save your work.`,
        type: 'session_warning',
        severity: 'warning',
      });
    }
  }, [sessionExpiresAt, user, walletAddress, warningShown]);

  useEffect(() => {
    if (!user || !sessionExpiresAt) return;

    const interval = setInterval(checkSessionExpiry, 30000);
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [user, sessionExpiresAt, checkSessionExpiry]);

  const login = async () => {
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      const userInfo = await web3auth.getUserInfo();
      setUser(userInfo);

      if (web3authProvider) {
        const accounts = await web3authProvider.request<unknown, string[]>({
          method: 'eth_accounts',
        });
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          loadUserProfile(accounts[0]);
          startSessionTimer();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!web3auth) {
      return;
    }

    try {
      await web3auth.logout();
      setProvider(null);
      setUser(null);
      setUserProfile(null);
      setWalletAddress('');
      setSessionExpiresAt(null);
      setMinutesUntilExpiry(null);
      setWarningShown(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (fullName: string, role: string, organization: string, contact: string) => {
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    const profile: UserProfile = {
      wallet_address: walletAddress,
      full_name: fullName,
      role: role as UserProfile['role'],
      organization,
      contact,
    };

    localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(profile));
    setUserProfile(profile);
  };

  return (
    <Web3AuthContext.Provider
      value={{
        provider,
        user,
        userProfile,
        walletAddress,
        userId: walletAddress,
        loading,
        sessionExpiresAt,
        minutesUntilExpiry,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
}

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
}
