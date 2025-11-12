import { create } from "zustand";

interface PeerData {
  peer: any;
  stream: MediaStream;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface UserInfo {
  id: string;
  username: string;
}

interface RoomState {
  roomId: string | null;
  meetingTitle: string | null;
  userName: string | null;
  localStream: MediaStream | null;
  peers: Map<string, PeerData>;
  participants: Map<string, UserInfo>; // socketId -> { id, username }
  chatMessages: ChatMessage[];
  mySocketId: string | null;
  setRoomId: (id: string) => void;
  setMeetingTitle: (title: string) => void;
  setUserName: (name: string) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setPeers: (peers: Map<string, PeerData>) => void;
  setParticipants: (participants: Map<string, UserInfo>) => void;
  addParticipant: (id: string, username: string) => void;
  removeParticipant: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setMySocketId: (id: string | null) => void;
  clearChat: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  meetingTitle: null,
  userName: null,
  localStream: null,
  peers: new Map(),
  participants: new Map(),
  chatMessages: [],
  mySocketId: null,
  setRoomId: (id) => set({ roomId: id }),
  setMeetingTitle: (title) => set({ meetingTitle: title }),
  setUserName: (name) => set({ userName: name }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setPeers: (peers) => set({ peers }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (id, username) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.set(id, { id, username });
      return { participants: newParticipants };
    }),
  removeParticipant: (id) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.delete(id);
      return { participants: newParticipants };
    }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  setMySocketId: (id) => set({ mySocketId: id }),
  clearChat: () => set({ chatMessages: [] }),
}));
