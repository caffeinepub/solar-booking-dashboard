import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SESSION_KEY = "solar_session";
const USERS_KEY = "solar_users";

export type AccessLevel = "admin" | "full-edit" | "view-only";

export interface AuthSession {
  token: string;
  username: string;
  accessLevel: AccessLevel;
}

interface StoredUser {
  username: string;
  passwordHash: string;
  accessLevel: AccessLevel;
}

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  createUser: (
    username: string,
    password: string,
    accessLevel: AccessLevel,
  ) => string | null;
  deleteUser: (username: string) => void;
  listUsers: () => Array<{ username: string; accessLevel: AccessLevel }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Simple hash — not cryptographic, but sufficient for local preview auth
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_ADMIN: StoredUser = {
  username: "admin2",
  passwordHash: simpleHash("Admin@1234"),
  accessLevel: "admin",
};

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [DEFAULT_ADMIN];
    const parsed = JSON.parse(raw) as StoredUser[];
    // Ensure default admin always present
    const hasAdmin = parsed.some((u) => u.username === DEFAULT_ADMIN.username);
    if (!hasAdmin) parsed.unshift(DEFAULT_ADMIN);
    return parsed;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        // Validate that this user still exists
        const users = loadUsers();
        const exists = users.some((u) => u.username === parsed.username);
        if (exists) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<string | null> => {
      const users = loadUsers();
      const user = users.find(
        (u) =>
          u.username === username && u.passwordHash === simpleHash(password),
      );
      if (!user) {
        return "Invalid username or password.";
      }
      const newSession: AuthSession = {
        token: generateToken(),
        username: user.username,
        accessLevel: user.accessLevel,
      };
      setSession(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const createUser = useCallback(
    (
      username: string,
      password: string,
      accessLevel: AccessLevel,
    ): string | null => {
      const users = loadUsers();
      if (users.some((u) => u.username === username)) {
        return `User "${username}" already exists.`;
      }
      if (!username.trim() || !password.trim()) {
        return "Username and password are required.";
      }
      const newUser: StoredUser = {
        username: username.trim(),
        passwordHash: simpleHash(password),
        accessLevel,
      };
      users.push(newUser);
      saveUsers(users);
      return null;
    },
    [],
  );

  const deleteUser = useCallback((username: string) => {
    const users = loadUsers().filter((u) => u.username !== username);
    saveUsers(users);
  }, []);

  const listUsers = useCallback(() => {
    return loadUsers().map((u) => ({
      username: u.username,
      accessLevel: u.accessLevel,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        createUser,
        deleteUser,
        listUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
