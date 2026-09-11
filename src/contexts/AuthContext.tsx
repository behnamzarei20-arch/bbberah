import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (phone: string, role: 'driver', fullName: string) => Promise<{ error: string | null }>;
  signIn: (phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

type DemoUser = Profile & { email: string; password?: string };
const USERS_KEY = 'bbberah-demo-users';
const CURRENT_KEY = 'bbberah-demo-current';

function readUsers(): DemoUser[] { try { const value = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); return Array.isArray(value) ? value as DemoUser[] : []; } catch { return []; } }
function writeUsers(users: DemoUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function makeId() { try { return crypto.randomUUID(); } catch { return `user-${Date.now()}-${Math.random().toString(36).slice(2)}`; } }
function createSession(user: DemoUser): Session { return { access_token:'demo-access-token', refresh_token:'demo-refresh-token', expires_in:2592000, expires_at:Math.floor(Date.now()/1000)+2592000, token_type:'bearer', user:{id:user.id,aud:'authenticated',role:'authenticated',email:user.email||undefined,phone:user.phone||undefined,app_metadata:{provider:'demo'},user_metadata:{role:user.role,full_name:user.full_name,phone:user.phone},identities:[],created_at:user.created_at,updated_at:user.updated_at} } as Session; }

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,setSession]=useState<Session|null>(null); const [profile,setProfile]=useState<Profile|null>(null); const [loading,setLoading]=useState(true);
  const restore=useCallback(()=>{const id=localStorage.getItem(CURRENT_KEY);if(!id)return;const user=readUsers().find(x=>x.id===id);if(user){setProfile(user);setSession(createSession(user));}else localStorage.removeItem(CURRENT_KEY)},[]);
  useEffect(()=>{restore();setLoading(false)},[restore]);
  const signUp=useCallback(async(phone:string,role:'driver',fullName:string)=>{try{const normalizedPhone=phone.trim();const normalizedName=fullName.trim();const users=readUsers();if(users.some(x=>x.phone===normalizedPhone))return{error:'این شماره موبایل قبلاً ثبت شده است.'};const now=new Date().toISOString();const user:DemoUser={id:makeId(),email:'',role,full_name:normalizedName,phone:normalizedPhone,avatar_url:null,status:'active',city:null,created_at:now,updated_at:now};writeUsers([...users,user]);localStorage.setItem(CURRENT_KEY,user.id);setProfile(user);setSession(createSession(user));return{error:null}}catch{return{error:'ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.'}}},[]);
  const signIn=useCallback(async(phone:string)=>{const normalized=phone.trim();const user=readUsers().find(x=>x.phone===normalized);if(!user)return{error:'حسابی با این شماره موبایل پیدا نشد. ابتدا ثبت‌نام کنید.'};localStorage.setItem(CURRENT_KEY,user.id);setProfile(user);setSession(createSession(user));return{error:null}},[]);
  const signOut=useCallback(async()=>{localStorage.removeItem(CURRENT_KEY);setSession(null);setProfile(null)},[]);
  const refreshProfile=useCallback(async()=>{const id=session?.user.id;if(!id)return;const user=readUsers().find(x=>x.id===id);if(user){setProfile(user);setSession(createSession(user))}},[session]);
  return <AuthContext.Provider value={{session,profile,loading,signUp,signIn,signOut,refreshProfile}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const ctx=useContext(AuthContext);if(!ctx)throw new Error('useAuth must be used within AuthProvider');return ctx;}
