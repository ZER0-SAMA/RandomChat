import React, { useMemo, useContext, useState, useEffect } from "react";
import { Socket, useSocket } from "../../sockets/socket";
export const PeerContext = React.createContext();
export const usePeer = () => useContext(PeerContext);

export const PeerProvider = (prop) => {
  // {
  //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  // }
  const { socket } = useSocket();
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    console.log("socket", socket);
    const createNewConnection = () => {
      const newpeer = new RTCPeerConnection();
      console.log("new peer");
      setPeer(newpeer);
    };
    socket.on("new-peer", createNewConnection);
    return () => {
      socket.off("new-peer", createNewConnection);
    };
  }, [socket]);
  async function getLocalStream() {
    try {
      const constraints = {
        video: {
          height: { min: "350px" },
        },
        audio: true,
        // { echoCancellation: true },
      };
      //
      const localStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      localStream.getTracks().forEach((track) => {
        // console.log("TTTTTTTTTT", track);
        peer?.addTrack(track, localStream);
      });
      console.log("peeeeeeer", peer);
      console.log("localStream", localStream);
      // console.log("propstream", peer);
    } catch (error) {
      console.error("Error opening video camera.", error);
    }
  }
  getLocalStream();

  const createOffer = async () => {
    const offer = await peer?.createOffer();
    await peer?.setLocalDescription(offer);
    return offer;
  };
  return (
    <>
      <PeerContext value={{ peer, createOffer }}>{prop.children}</PeerContext>
    </>
  );
};
