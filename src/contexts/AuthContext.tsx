import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

type DemoUser = Profile & { email: string; password: string };

const USERS_KEY = 'bbberah-demo-users';
const CURRENT_KEY = 'bbberah-demo-current';

function readUsers(): DemoUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as DemoUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function createSession(user: DemoUser): Session {
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 60 * 60 * 24 * 30,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    token_type: 'bearer',
    user: {
      id: user.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: user.email,
      phone: user.phone || undefined,
      app_metadata: { provider: 'demo' },
      user_metadata: { role: user.role, full_name: user.full_name, phone: user.phone },
      identities: [],
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  } as Session;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const restore = useCallback(() => {
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (!currentId) return;
    const user = readUsers().find((item) => item.id === currentId);
    if (user) {
      setProfile(user);
      setSession(createSession(user));
    }
  }, []);

  useEffect(() => {
    restore();
    setLoading(false);
  }, [restore]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    phone: string
  ) => {
    const users = readUsers();
    if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'این ایمیل قبلاً ثبت شده است.' };
    }
    const now = new Date().toISOString();
    const user: DemoUser = {
      id: crypto.randomUUID(),
      email,
      password,
      role,
      full_name: fullName,
      phone: phone || null,
      avatar_url: null,
      status: 'active',
      city: null,
      created_at: now,
      updated_at: now,
    };
    writeUsers([...users, user]);
    localStorage.setItem(CURRENT_KEY, user.id);
    setProfile(user);
    setSession(createSession(user));
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = readUsers().find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) return { error: 'حسابی با این ایمیل پیدا نشد. ابتدا ثبت‌نام کنید.' };
    if (user.password !== password) return { error: 'رمز عبور نادرست است.' };
    localStorage.setItem(CURRENT_KEY, user.id);
    setProfile(user);
    setSession(createSession(user));
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(CURRENT_KEY);
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const id = session?.user.id;
    if (!id) return;
    const user = readUsers().find((item) => item.id === id);
    if (user) {
      setProfile(user);
      setSession(createSession(user));
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
