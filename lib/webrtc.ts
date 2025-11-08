import Peer from "simple-peer";
import { getSocket } from "./socket";

interface PeerData {
  peer: Peer.Instance;
  stream: MediaStream;
}

export const initWebRTC = async (
  roomId: string,
  localStream: MediaStream,
  setPeers: (peers: Map<string, PeerData>) => void,
  addTranscript: (text: string) => void,
  setMySocketId: (id: string | null) => void
) => {
  const socket = getSocket();
  const peers = new Map<string, PeerData>();
  let mySocketId: string | null = null;

  // Wait for socket to connect
  const waitForConnection = (): Promise<string> => {
    return new Promise((resolve) => {
      if (socket.connected && socket.id) {
        const socketId = socket.id;
        mySocketId = socketId;
        setMySocketId(socketId);
        resolve(socketId);
      } else {
        const onConnect = () => {
          if (socket.id) {
            const socketId = socket.id;
            mySocketId = socketId;
            setMySocketId(socketId);
            socket.off("connect", onConnect);
            resolve(socketId);
          }
        };
        socket.on("connect", onConnect);
      }
    });
  };

  // Wait for connection before proceeding
  const connectedSocketId = await waitForConnection();
  mySocketId = connectedSocketId;
  console.log("🔌 Socket connected, ID:", mySocketId);

  // Clean up function for removing a peer
  const removePeer = (userId: string | null | undefined) => {
    if (!userId) return;
    const peerData = peers.get(userId);
    if (peerData) {
      try {
        if (!peerData.peer.destroyed) {
          peerData.peer.destroy();
        }
      } catch (e) {
        console.error("Error destroying peer:", e);
      }
      peers.delete(userId);
      setPeers(new Map(peers));
    }
  };

  // Create a peer connection
  const createPeer = (userId: string | null | undefined, initiator: boolean): Peer.Instance | null => {
    if (!mySocketId || !userId || userId === mySocketId) {
      return null;
    }

    // Remove existing peer if any
    if (peers.has(userId)) {
      removePeer(userId);
    }

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      if (!peer.destroyed && socket.connected && mySocketId) {
        socket.emit("signal", { to: userId, signal, from: mySocketId });
      }
    });

    peer.on("stream", (remoteStream) => {
      if (!peer.destroyed && userId) {
        console.log("✅ Received stream from", userId);
        peers.set(userId, { peer, stream: remoteStream });
        setPeers(new Map(peers));
      }
    });

    peer.on("error", (err) => {
      console.error("❌ Peer error for", userId, ":", err);
      removePeer(userId);
    });

    peer.on("close", () => {
      console.log("🔌 Peer closed for", userId);
      removePeer(userId);
    });

    peer.on("connect", () => {
      console.log("✅ Peer connected for", userId);
    });

    // Store peer with local stream initially (will be replaced when remote stream arrives)
    if (userId) {
      peers.set(userId, { peer, stream: localStream });
      setPeers(new Map(peers));
    }

    return peer;
  };

  // Join room - only if we have a socket ID
  if (mySocketId) {
    console.log("🚪 Joining room:", roomId, "with socket ID:", mySocketId);
    const username = `User-${mySocketId.slice(0, 6)}`;
    socket.emit("join-room", roomId, username);
  } else {
    console.error("❌ Cannot join room: No socket ID");
    throw new Error("Socket not connected");
  }

  // Handle room users list (when joining)
  socket.on("room-users", (users: Array<{ id: string; username: string }>) => {
    console.log("📋 Room users received:", users.length, "users");
    if (users && users.length > 0) {
      users.forEach((user) => {
        if (user && user.id && user.id !== mySocketId && !peers.has(user.id)) {
          console.log("🔗 Creating peer as initiator for existing user:", user.id);
          createPeer(user.id, true);
        }
      });
    } else {
      console.log("📋 No other users in room");
    }
  });

  // When a new user joins, create a peer connection as initiator
  socket.on("user-joined", (userData: { id: string; username: string }) => {
    console.log("👤 User joined event received:", userData);
    const userId = userData?.id;
    if (userId && userId !== mySocketId && !peers.has(userId)) {
      console.log("🔗 Creating peer as initiator for new user:", userId);
      createPeer(userId, true);
    } else {
      console.log("⚠️ Skipping peer creation:", { userId, mySocketId, alreadyHas: peers.has(userId || "") });
    }
  });

  // When a user leaves, remove their peer
  socket.on("user-left", (userId: string | null | undefined) => {
    console.log("👋 User left:", userId);
    removePeer(userId);
  });

  // Handle signaling data
  socket.on("signal", ({ from, signal }: { from: string; signal: any }) => {
    if (!mySocketId || !from || from === mySocketId) {
      console.log("⚠️ Ignoring signal:", { from, mySocketId, same: from === mySocketId });
      return;
    }

    console.log("📡 Signal received from:", from);
    let peerData = peers.get(from);
    
    if (peerData) {
      // Existing peer, apply signal
      try {
        if (!peerData.peer.destroyed) {
          console.log("✅ Applying signal to existing peer:", from);
          peerData.peer.signal(signal);
        } else {
          // Peer was destroyed, recreate
          console.log("🔄 Peer destroyed, recreating for", from);
          removePeer(from);
          const newPeer = createPeer(from, false);
          if (newPeer) {
            setTimeout(() => {
              try {
                newPeer.signal(signal);
              } catch (e) {
                console.error("Error signaling recreated peer:", e);
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("❌ Error signaling peer:", error);
        removePeer(from);
        const newPeer = createPeer(from, false);
        if (newPeer) {
          setTimeout(() => {
            try {
              newPeer.signal(signal);
            } catch (e) {
              console.error("Error signaling new peer:", e);
            }
          }, 100);
        }
      }
    } else {
      // New peer, create as receiver
      console.log("📡 New signal received, creating peer as receiver:", from);
      const peer = createPeer(from, false);
      if (peer) {
        setTimeout(() => {
          try {
            peer.signal(signal);
            console.log("✅ Signal applied to new peer:", from);
          } catch (error) {
            console.error("❌ Error signaling new peer:", error);
            removePeer(from);
          }
        }, 100);
      }
    }
  });

  // Audio transcription setup
  let audioContext: AudioContext | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let transcriptionInterval: NodeJS.Timeout | null = null;

  const startTranscription = () => {
    try {
      audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(localStream);
      const destination = audioContext.createMediaStreamDestination();

      mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          audioChunks = [];

          try {
            console.log("🎤 Sending audio for transcription, size:", audioBlob.size);
            const formData = new FormData();
            formData.append("audio", audioBlob);

            const response = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              if (data.text && data.text.trim()) {
                console.log("✅ Transcription received:", data.text.substring(0, 50) + "...");
                addTranscript(data.text);
              } else {
                console.log("⚠️ Empty transcription received");
              }
            } else {
              const errorText = await response.text();
              console.error("❌ Transcription API error:", response.status, errorText);
            }
          } catch (error) {
            console.error("❌ Transcription error:", error);
          }
        }
      };

      source.connect(destination);

      // Record for 10 seconds, then transcribe
      transcriptionInterval = setInterval(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.start();
        } else if (mediaRecorder && mediaRecorder.state === "inactive") {
          mediaRecorder.start();
        }
      }, 10000);

      if (mediaRecorder.state === "inactive") {
        mediaRecorder.start();
      }
    } catch (error) {
      console.error("Error setting up transcription:", error);
    }
  };

  startTranscription();

  // Cleanup function
  return () => {
    console.log("🧹 Cleaning up WebRTC");
    if (transcriptionInterval) {
      clearInterval(transcriptionInterval);
    }
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (audioContext) {
      audioContext.close();
    }
    peers.forEach((peerData) => {
      try {
        if (!peerData.peer.destroyed) {
          peerData.peer.destroy();
        }
      } catch (e) {
        console.error("Error destroying peer in cleanup:", e);
      }
    });
    peers.clear();
    setPeers(new Map());
  };
};
