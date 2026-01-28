// User type
export interface User {
  id: string;
  name: string;
}

// Vote type
export interface Vote {
  userId: string;
  value: string | null;
}

// Voting scale types
export type VotingScaleType = 'fibonacci' | 'powersOf2';

// Room type
export interface Room {
  code: string;
  users: User[];
  votes: Map<string, string | null>;
  currentScale: VotingScaleType;
  votesRevealed: boolean;
}

// Voting scales
export const VOTING_SCALES = {
  fibonacci: ['1', '2', '3', '5', '8', '13', '21', '?', '🍺'],
  powersOf2: ['1', '2', '4', '8', '16', '32', '64', '?', '🍺'],
} as const;

// Socket event types
export interface ServerToClientEvents {
  'room-update': (room: RoomState) => void;
  'room-created': (code: string) => void;
  'room-joined': (room: RoomState) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'create-room': (userName: string, callback: (code: string) => void) => void;
  'join-room': (code: string, userName: string, callback: (success: boolean, room?: RoomState) => void) => void;
  'leave-room': (code: string, userId: string) => void;
  'vote': (code: string, userId: string, value: string | null) => void;
  'reveal-votes': (code: string) => void;
  'reset-votes': (code: string) => void;
  'change-scale': (code: string, scale: VotingScaleType) => void;
}

// Room state for client
export interface RoomState {
  code: string;
  users: User[];
  votes: Record<string, string | null>;
  currentScale: VotingScaleType;
  votesRevealed: boolean;
}
