import Peer from "simple-peer";
import { getSocket } from "./socket";

interface PeerData {
  peer: Peer.Instance;
  stream: MediaStream;
  isInitiator: boolean;
}

export const initWebRTC = async (
  roomId: string,
  localStream: MediaStream,
  setPeers: (peers: Map<string, PeerData>) => void,
  setMySocketId: (id: string | null) => void
) => {
  const socket = getSocket();
  const peers = new Map<string, PeerData>();
  let mySocketId: string | null = null;
  let isCleaningUp = false;

  // Wait for socket to connect
  const waitForConnection = (): Promise<string> => {
    return new Promise((resolve, reject) => {
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
            socket.off("connect_error", onError);
            resolve(socketId);
          }
        };
        const onError = (error: Error) => {
          socket.off("connect", onConnect);
          socket.off("connect_error", onError);
          reject(error);
        };
        socket.on("connect", onConnect);
        socket.on("connect_error", onError);
        setTimeout(() => {
          socket.off("connect", onConnect);
          socket.off("connect_error", onError);
          reject(new Error("Socket connection timeout"));
        }, 10000);
      }
    });
  };

  try {
    const connectedSocketId = await waitForConnection();
    mySocketId = connectedSocketId;
    console.log("🔌 Socket connected, ID:", mySocketId);
  } catch (error) {
    console.error("❌ Failed to connect socket:", error);
    throw error;
  }

  // Remove peer
  const removePeer = (userId: string | null | undefined) => {
    if (!userId || isCleaningUp) return;
    const peerData = peers.get(userId);
    if (peerData) {
      try {
        if (!peerData.peer.destroyed) {
          peerData.peer.destroy();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      peers.delete(userId);
      setPeers(new Map(peers));
    }
  };

  // Create peer connection
  const createPeer = (
    userId: string | null | undefined,
    initiator: boolean
  ): Peer.Instance | null => {
    if (!mySocketId || !userId || userId === mySocketId || isCleaningUp) {
      return null;
    }

    // Remove existing peer if any
    if (peers.has(userId)) {
      removePeer(userId);
    }

    console.log(
      `🔗 Creating peer for ${userId} as ${initiator ? "INITIATOR" : "ANSWERER"}`
    );

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
      if (peer.destroyed || !socket.connected || !mySocketId || isCleaningUp) {
        return;
      }
      console.log(`📤 Sending ${signal.type} signal to ${userId}`);
      socket.emit("signal", { to: userId, signal, from: mySocketId });
    });

    peer.on("stream", (remoteStream) => {
      if (peer.destroyed || !userId || isCleaningUp) {
        return;
      }
      console.log("✅ Received stream from", userId);
      const peerData = peers.get(userId);
      if (peerData) {
        // Update with remote stream
        peers.set(userId, {
          peer: peerData.peer,
          stream: remoteStream,
          isInitiator: peerData.isInitiator,
        });
        setPeers(new Map(peers));
      }
    });

    peer.on("error", (err) => {
      console.error("❌ Peer error for", userId, ":", err);
    });

    peer.on("close", () => {
      console.log("🔌 Peer closed for", userId);
      removePeer(userId);
    });

    peer.on("connect", () => {
      console.log("✅ Peer connected for", userId);
    });

    // Store peer with local stream initially (placeholder until remote stream arrives)
    if (userId && !isCleaningUp) {
      peers.set(userId, {
        peer,
        stream: localStream, // Placeholder - will be replaced when remote stream arrives
        isInitiator: initiator,
      });
      setPeers(new Map(peers));
    }

    return peer;
  };

  // Join room
  if (mySocketId) {
    console.log("🚪 Joining room:", roomId, "with socket ID:", mySocketId);
    const username = `User-${mySocketId.slice(0, 6)}`;
    socket.emit("join-room", roomId, username);
  } else {
    throw new Error("Socket not connected");
  }

  // When joining, new user creates peers as initiators for all existing users
  socket.on("room-users", (users: Array<{ id: string; username: string }>) => {
    if (isCleaningUp) return;
    console.log("📋 Room users received:", users.length, "users");
    if (users && users.length > 0) {
      setTimeout(() => {
        if (isCleaningUp) return;
        users.forEach((user) => {
          if (
            user &&
            user.id &&
            user.id !== mySocketId &&
            !peers.has(user.id)
          ) {
            console.log("🔗 Creating peer as INITIATOR for existing user:", user.id);
            createPeer(user.id, true);
          }
        });
      }, 300);
    }
  });

  // When a new user joins, existing users create peer as answerer
  socket.on("user-joined", (userData: { id: string; username: string }) => {
    if (isCleaningUp) return;
    console.log("👤 User joined:", userData.id);
    const userId = userData?.id;
    if (userId && userId !== mySocketId && !peers.has(userId)) {
      console.log("🔗 Creating peer as ANSWERER for new user:", userId);
      setTimeout(() => {
        if (!isCleaningUp && !peers.has(userId)) {
          createPeer(userId, false);
        }
      }, 200);
    }
  });

  // When user leaves
  socket.on("user-left", (userId: string | null | undefined) => {
    if (isCleaningUp) return;
    console.log("👋 User left:", userId);
    removePeer(userId);
  });

  // Handle signaling
  socket.on("signal", ({ from, signal }: { from: string; signal: any }) => {
    if (
      isCleaningUp ||
      !mySocketId ||
      !from ||
      from === mySocketId ||
      !signal ||
      !signal.type
    ) {
      return;
    }

    console.log(`📥 Received ${signal.type} signal from ${from}`);
    let peerData = peers.get(from);

    if (peerData) {
      // Peer exists
      if (peerData.peer.destroyed) {
        console.log("🔄 Peer destroyed, recreating for", from);
        removePeer(from);
        const isInitiator = signal.type !== "offer";
        const newPeer = createPeer(from, isInitiator);
        if (newPeer) {
          setTimeout(() => {
            if (!newPeer.destroyed && !isCleaningUp) {
              try {
                newPeer.signal(signal);
              } catch (e) {
                console.error("❌ Error signaling recreated peer:", e);
                removePeer(from);
              }
            }
          }, 500);
        }
      } else {
        // Apply signal to existing peer
        try {
          peerData.peer.signal(signal);
          console.log(`✅ Applied ${signal.type} signal to peer:`, from);
        } catch (error: any) {
          console.error("❌ Error signaling peer:", error);
          // If state error, recreate peer
          if (
            error.message?.includes("state") ||
            error.message?.includes("stable") ||
            error.message?.includes("destroyed")
          ) {
            console.log("🔄 Recreating peer due to state error");
            removePeer(from);
            const isInitiator = signal.type !== "offer";
            const newPeer = createPeer(from, isInitiator);
            if (newPeer) {
              setTimeout(() => {
                if (!newPeer.destroyed && !isCleaningUp) {
                  try {
                    newPeer.signal(signal);
                  } catch (e) {
                    console.error("Error signaling new peer:", e);
                    removePeer(from);
                  }
                }
              }, 500);
            }
          }
        }
      }
    } else {
      // No peer exists - create one based on signal type
      const isInitiator = signal.type !== "offer";
      console.log(
        `📡 Creating new peer as ${isInitiator ? "INITIATOR" : "ANSWERER"} for ${from}`
      );
      const peer = createPeer(from, isInitiator);
      if (peer) {
        setTimeout(() => {
          if (!peer.destroyed && !isCleaningUp) {
            try {
              peer.signal(signal);
              console.log(`✅ Applied ${signal.type} signal to new peer:`, from);
            } catch (error: any) {
              console.error("❌ Error signaling new peer:", error);
              removePeer(from);
            }
          }
        }, 500);
      }
    }
  });

  // Cleanup
  return () => {
    console.log("🧹 Cleaning up WebRTC");
    isCleaningUp = true;

    socket.off("room-users");
    socket.off("user-joined");
    socket.off("user-left");
    socket.off("signal");

    peers.forEach((peerData) => {
      try {
        if (!peerData.peer.destroyed) {
          peerData.peer.destroy();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    peers.clear();
    setPeers(new Map());
  };
};
