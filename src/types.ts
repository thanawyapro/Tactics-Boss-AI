export interface TacticResult {
  formation: string;
  reason: string;
  defensiveStyle: string;
  defensiveDetails: Record<string, string>;
  attackingStyle: string;
  attackingDetails: Record<string, string>;
  playerInstructions: string[];
  inGameStrategy: string;
  emergencyPlan: string;
  protectLeadPlan: string;
  mistakesToAvoid: string[];
  difficulty: string;
  confidence: string;
}

export interface SavedTactic {
  id: string;
  title: string;
  game: string;
  myFormation: string;
  oppFormation: string;
  opponentStyle: string;
  myStyle: string;
  matchState: string;
  myTeam: string;
  oppTeam: string;
  notes: string;
  result: TacticResult;
  createdAt: string;
}

export interface Rival {
  id: string;
  name: string;
  favoriteGame: string;
  favoriteFormation: string;
  playstyle: string;
  strengths: string;
  weaknesses: string;
  notes: string;
  createdAt: string;
}

export interface UserSubscription {
  plan: 'free' | 'pro' | 'elite';
  status: 'active' | 'expired';
  startedAt: string;
  expiresAt: string;
}

export interface AppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
}
