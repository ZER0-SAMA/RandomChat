import React, { useEffect, useState, useCallback, useRef } from "react";
import VideoAccess from "./VideoAccess";
import { useSocket } from "../sockets/socket";
// import { usePeer } from "./hooks/Peer";
import user from "../assets/user.png";
import ChatBox from "./ChatBox";

export default function Home() {
  const { socket } = useSocket();
  // const { peer } = usePeer();
  // const [peer, setPeer] = useState(null);peer.current
  const peer = useRef(null);
  const [userName, setUserName] = useState("");
  const [userNameSubmit, setUserNameSubmit] = useState(false);
  const [myStream, SetMyStream] = useState(null);
  const acceptCall = useCallback(async () => {
    console.log("peer in answer", peer.current);
    const answer = await peer.current?.createAnswer();
    console.log("anser", answer);
    await peer.current?.setLocalDescription(answer);
    socket.emit("my-answer", { answer: answer });
  }, [socket]);

  useEffect(() => {
    const createNewConnection = () => {
      const newpeer = new RTCPeerConnection();
      // setPeer(newpeer);
      peer.current = newpeer;
    };
    socket.on("connect", createNewConnection);
    return () => {
      socket.off("connect", createNewConnection);
    };
  }, [socket]);

  useEffect(() => {
    async function playVideoFromCamera() {
      try {
        const constraints = {
          video: {
            height: { min: "350px" },
          },
          audio: { echoCancellation: true },
        };
        const localStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        SetMyStream(localStream);
        localStream.getTracks().forEach((track) => {
          peer.current?.addTrack(track, localStream);
        });
      } catch (error) {
        console.error("Error opening video camera.", error);
      }
    }
    playVideoFromCamera();
  }, []);
  useEffect(() => {
    const createNewConnection = () => {
      const newpeer = new RTCPeerConnection();
      console.log("-------------setting new peer-----------");
      // setPeer(newpeer);
      peer.current = newpeer;
    };
    socket.on("new-peer", createNewConnection);
    return () => {
      socket.off("new-peer", createNewConnection);
    };
  }, [socket]);

  useEffect(() => {
    socket.on("connectedtofriend", (val) => {
      console.log("connected friend set : ", val);
    });
    return () => {
      socket.off("connectedtofriend", (val) => {
        console.log("connected friend set : ", val);
      });
    };
  }, [socket]);

  useEffect(() => {
    socket.on("remote-offer", async (message) => {
      if (message.offer) {
        peer.current?.setRemoteDescription(
          new RTCSessionDescription(message.offer)
        );
      }
      console.log("message", message);
      console.log(peer.current);
      setTimeout(() => {
        acceptCall();
      }, 1000);
    });
    return () => {
      socket.off("remote-offer", async (message) => {
        if (message.offer) {
          console.log("message", message);
          console.log(peer.current);
          peer.current?.setRemoteDescription(
            new RTCSessionDescription(message.offer)
          );
        }
      });
      setTimeout(() => {
        acceptCall();
      }, 1000);
    };
  }, [acceptCall, socket]);
  useEffect(() => {
    socket.on("remote-answer", async (message) => {
      if (message.answer) {
        const remoteDesc = new RTCSessionDescription(message.answer);
        await peer.current?.setRemoteDescription(remoteDesc);
      }
    });
    return () => {
      socket.off("remote-answer", async (message) => {
        if (message.answer) {
          const remoteDesc = new RTCSessionDescription(message.answer);
          await peer.current?.setRemoteDescription(remoteDesc);
        }
      });
    };
  }, [socket]);

  useEffect(() => {
    // Listen for local ICE candidates on the local RTCPeerConnection
    peer.current?.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("new-ice", { iceCandidate: event.candidate });
      }
    });
    // Listen for remote ICE candidates and add them to the local RTCPeerConnection
    socket.on("message-ice", async (message) => {
      if (message.iceCandidate) {
        try {
          await peer.current.addIceCandidate(message.iceCandidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    });
    // return () => {
    //   socket.off("message-ice", async (message) => {
    //     if (message.iceCandidate) {
    //       try {
    //         await peer.current.addIceCandidate(message.iceCandidate);
    //       } catch (e) {
    //         console.error("Error adding received ice candidate", e);
    //       }
    //     }
    //   });
    // };
  }, [socket]);
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
            <VideoAccess peer={peer.current} myStream={myStream} />
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
