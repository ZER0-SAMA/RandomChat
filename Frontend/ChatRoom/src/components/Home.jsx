import React, { useEffect, useState, useCallback } from "react";
import VideoAccess from "./VideoAccess";
import { useSocket } from "../sockets/socket";
// import { usePeer } from "./hooks/Peer";
import user from "../assets/user.png";
import ChatBox from "./ChatBox";

export default function Home() {
  const { socket } = useSocket();
  // const { peer } = usePeer();

  const [peer, setPeer] = useState(null);
  const [userName, setUserName] = useState("");
  const [userNameSubmit, setUserNameSubmit] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [myStream, SetMyStream] = useState(null);
  // const [dummyStream, setDummyStream] = useState(null);
  const [role, setRole] = useState("");
  const acceptCall = useCallback(async () => {
    console.log("peeeeerrrrrr", peer.localDescription);
    const answer = await peer?.createAnswer();
    await peer?.setLocalDescription(answer);
    socket.emit("my-answer", { answer: answer });
  }, [peer, socket]);
  // const forNewConnection = async () => {
  //   const newpeer = new RTCPeerConnection();
  //   console.log("new-connect playing");

  //   console.log("newpeer", newpeer);
  // };

  useEffect(() => {
    socket.on("connect", () => {
      const newpeer = new RTCPeerConnection();
      setPeer(newpeer);
    });
    return () => {
      socket.off("connect", () => {
        const newpeer = new RTCPeerConnection();
        setPeer(newpeer);
      });
    };
  }, [socket]);
  useEffect(() => {
    if (role === "caller") {
      peer?.addEventListener(
        "negotiationneeded",
        (ev) => {
          console.log("eeeeeeeeeeeeeeeeeeeeeeevvvvvvvvvvvvvvvvvvvvvvv", ev);

          peer
            .createOffer()
            .then((offer) => peer.setLocalDescription(offer))
            .then((vall) => {
              console.log("vallllllll;;;;;;;;;;;;;", vall);
              console.log(
                "peer.localDescriptionpeer.localDescription",
                peer.localDescription
              );
              socket.emit("negotion-offer", {
                offer: peer.localDescription,
              });
            })
            .catch((err) => {
              // handle error
            });
        },
        false
      );
    }
  }, [peer, role, socket]);
  useEffect(() => {
    async function playVideoFromCamera() {
      try {
        const constraints = {
          video: {
            height: { min: "350px" },
          },
          audio: false,
          // { echoCancellation: true },
        };
        const localStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        SetMyStream(localStream);
        localStream.getTracks().forEach((track) => {
          peer?.addTrack(track, localStream);
        });
      } catch (error) {
        console.error("Error opening video camera.", error);
      }
    }
    playVideoFromCamera();
    return () => {
      playVideoFromCamera();
    };
  }, [peer]);

  useEffect(() => {
    const createNewConnection = async () => {
      const newpeer = new RTCPeerConnection();
      console.log("-------------setting new peer-----------");
      console.log("peer", newpeer);
      setPeer(newpeer);
      const offer = await newpeer?.createOffer();
      await newpeer?.setLocalDescription(offer);
      // socket.emit("set-my-offer", { offer: offer });
      socket.emit("searchFriend", { offer: offer });
    };
    socket.on("new-peer-searching", createNewConnection);
    return () => {
      socket.off("new-peer-searching", createNewConnection);
    };
  }, [peer, socket]);
  useEffect(() => {
    const createNewConnection = async () => {
      const newpeer = new RTCPeerConnection();
      console.log("-------------setting new peer-----------");
      console.log("peer", newpeer);
      setPeer(newpeer);
      const offer = await newpeer?.createOffer();
      await newpeer?.setLocalDescription(offer);
    };
    socket.on("new-peer", createNewConnection);
    return () => {
      socket.off("new-peer", createNewConnection);
    };
  }, [peer, socket]);
  useEffect(() => {
    socket.on("connectedtofriend", (val) => {
      console.log("connected friend set : ", val);
      const myIdentity = val.filter((e) => e.id === socket.id);
      const myFriend = val.filter((e) => e.id !== socket.id);
      setFriendName(myFriend[0]?.username);
      setRole(myIdentity[0]?.role);
    });
    return () => {
      socket.off("connectedtofriend", (val) => {
        console.log("connected friend set : ", val);
        const myIdentity = val.filter((e) => e.id === socket.id);
        const myFriend = val.filter((e) => e.id !== socket.id);
        setFriendName(myFriend[0]?.username);
        setRole(myIdentity[0]?.role);
      });
    };
  }, [socket]);

  useEffect(() => {
    socket.on("remote-offer", async (message) => {
      if (message.offer) {
        console.log("offffffffffffffffffffffffff", message.offer);
        peer?.setRemoteDescription(new RTCSessionDescription(message.offer));
        console.log(peer);
        acceptCall();
      }
    });
    return () => {
      socket.off("remote-offer", async (message) => {
        if (message.offer) {
          peer?.setRemoteDescription(new RTCSessionDescription(message.offer));
          acceptCall();
        }
      });
    };
  }, [acceptCall, peer, socket]);
  useEffect(() => {
    socket.on("remote-answer", async (message) => {
      if (message.answer) {
        try {
          console.log("peer", peer);
          const remoteDesc = new RTCSessionDescription(message.answer);
          await peer?.setRemoteDescription(remoteDesc);
        } catch (e) {
          console.error("Error adding remote answer", e);
        }

        // setRemoteAnswer();
      }
    });
    return () => {
      socket.off("remote-answer", async (message) => {
        if (message.answer) {
          try {
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peer?.setRemoteDescription(remoteDesc);
          } catch (e) {
            console.error("Error adding remote answer", e);
          }
        }
      });
    };
  }, [peer, socket]);

  useEffect(() => {
    // Listen for local ICE candidates on the local RTCPeerConnection
    peer?.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("new-ice", { iceCandidate: event.candidate });
      }
    });
    // Listen for remote ICE candidates and add them to the local RTCPeerConnection
    socket.on("message-ice", async (message) => {
      // if (peer?.iceConnectionState === "connected") {
      // if (message.iceCandidate) {
      try {
        await peer.addIceCandidate(message.iceCandidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
      // }
      // }
    });
    return () => {
      socket.off("message-ice", async (message) => {
        // if (peer?.iceConnectionState === "connected") {
        if (message.iceCandidate) {
          try {
            await peer.addIceCandidate(message.iceCandidate);
          } catch (e) {
            console.error("Error adding received ice candidate", e);
          }
        }
        // }
      });
    };
  }, [peer, socket]);

  return (
    <div>
      {!userNameSubmit ? (
        <div className="username-box">
          <img src={user} alt="User" height="70px" width="70px" />

          <div className="username-inner-box">
            <input
              id="username-inpt-box"
              placeholder="Username"
              onChange={(e) => {
                const input = e.target.value.trim();
                if (input !== "") setUserName(e.target.value);
              }}
              value={userName}
              type="text"
            />
            <button
              id="username-btn"
              disabled={!userName ? true : false}
              onClick={() => {
                console.log("socket id on click : ", socket.id);
                setUserNameSubmit(true);
                socket.emit("name", userName);
              }}
            >
              Enter
            </button>
          </div>
        </div>
      ) : (
        <div className="main-box">
          <div className="main-video-area">
            <VideoAccess
              peer={peer}
              myStream={myStream}
              userName={userName}
              friendName={friendName}
              // dummyStream={dummyStream}
              // forNewConnection={forNewConnection}
            />
            <ChatBox userName={userName} />
          </div>
        </div>
      )}
    </div>
  );
}
{
  /* <button
            onClick={() => {
              if (!disconnectSocket) {
                {
                  console.log("socket id : ", socket.id);
                }
                setDisconnectSocket(true);

                socket.disconnect();
              }
            }}
          >
            Disconnect
          </button> */
}
///-------------negotiation-----------------

// useEffect(() => {
//   peer.addEventListener(
//     "negotiationneeded",
//     (ev) => {
//       peer
//         .createOffer()
//         .then((offer) => peer.setLocalDescription(offer))
//         .then(() => {
//           socket.emit("searchFriend", { offer: peer.localDescription });
//           console.log("localdiscription", peer.localDescription);
//         })
//         .catch((err) => {
//           // handle error
//         });
//     },
//     false
//   );
// }, [peer, socket]);
