import { create } from "zustand";

interface PeerData {
  peer: any;
  stream: MediaStream;
}

interface Transcript {
  text: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface RoomState {
  roomId: string | null;
  localStream: MediaStream | null;
  peers: Map<string, PeerData>;
  transcripts: Transcript[];
  summary: string | null;
  chatMessages: ChatMessage[];
  mySocketId: string | null;
  setRoomId: (id: string) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setPeers: (peers: Map<string, PeerData>) => void;
  addTranscript: (text: string) => void;
  setSummary: (summary: string | null) => void;
  clearTranscripts: () => void;
  addChatMessage: (message: ChatMessage) => void;
  setMySocketId: (id: string | null) => void;
  clearChat: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  localStream: null,
  peers: new Map(),
  transcripts: [],
  summary: null,
  chatMessages: [],
  mySocketId: null,
  setRoomId: (id) => set({ roomId: id }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setPeers: (peers) => set({ peers }),
  addTranscript: (text) =>
    set((state) => ({
      transcripts: [...state.transcripts, { text, timestamp: new Date() }],
    })),
  setSummary: (summary) => set({ summary }),
  clearTranscripts: () => set({ transcripts: [] }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  setMySocketId: (id) => set({ mySocketId: id }),
  clearChat: () => set({ chatMessages: [] }),
}));

