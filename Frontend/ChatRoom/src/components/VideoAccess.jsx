import React, { useEffect, useState, useRef, useCallback } from "react";
import mute from "../assets/mute.png";
import unmute from "../assets/speaker-filled-audio-tool.png";
import mutemicro from "../assets/mute-microphone.png";
import videounhide from "../assets/video.png";
import hidevideo from "../assets/video-camera.png";
import unmutemicro from "../assets/microphone.png";
import nosignal from "../assets/nosignal.gif";
// import { usePeer } from "./hooks/Peer";
import { useSocket } from "../sockets/socket";
import ReactPlayer from "react-player";
export default function VideoAccess({ peer, myStream, userName, friendName }) {
  const [isMute, setIsMute] = useState(true);
  const [constraint, setConstraint] = useState(true);
  const [dummyStream, setDummyStream] = useState(null);
  const [sender, setSender] = useState(null);
  const [search, setSearch] = useState("search");
  // const [skip, setSkip] = useState(false);
  const { socket } = useSocket();
  // const { peer, createOffer } = usePeer();
  // const videoElement = useRef();
  const remoteRef = useRef();

  const setRemotTrack = () => {
    // myStream.getTracks().forEach((track) => {
    //   peer?.addTrack(track, myStream);
    // });
    // videoSender.track.enabled = false;
  };

  const createOffer = useCallback(async () => {
    const offer = await peer?.createOffer();
    await peer?.setLocalDescription(offer);
    return offer;
  }, [peer]);
  // const updateOffer = useCallback(async () => {
  //   const offer = await createOffer();
  //   socket.emit("set-my-offer", { offer: offer });
  // }, [createOffer, socket]);
  // useEffect(() => {
  //   updateOffer();
  // }, [updateOffer]);
  // useEffect(() => {
  //   peer?.addEventListener("track", async (event) => {
  //     console.log("pperr", peer);
  //     const [remoteStream] = event.streams;
  //     console.log("remotestream", remoteStream);
  //     setDummyStream(remoteStream);
  //   });
  // }, [peer]);
  useEffect(() => {
    // const transceiver = peer
    //   ?.getTransceivers()
    //   .find((t) => t.receiver.track.kind === "video");
    // if (transceiver) {
    //   console.log("transceivertransceivertransceiver", transceiver);
    //   transceiver.direction = "recvonly";
    // }
    peer.ontrack = (event) => {
      // console.log("eventtttttttt", event);
      const [remoteStream] = event.streams;
      console.log("remotestream", remoteStream);
      setDummyStream(remoteStream);
    };
  }, [peer]);
  // useEffect(() => {
  //   peer?.addEventListener("track", async (event) => {
  //     console.log("pperr", peer);
  //     const [remoteStream] = event.streams;
  //     console.log("remotestream", remoteStream);
  //     setDummyStream(remoteStream);
  //   });
  // }, [peer]);
  useEffect(() => {
    if (dummyStream) {
      setSearch("skip");
    }
  }, [dummyStream]);

  useEffect(() => {
    socket.on("friend-left-room", () => {
      console.log("friend-left-room");
      setDummyStream(null);
      peer.close();
      socket.emit("new-peer-start");
      // updateOffer();
    });
    return () => {
      socket.off("friend-left-room", () => {
        setDummyStream(null);
        peer.close();
        socket.emit("new-peer-start");
        // updateOffer();
      });
    };
  }, [peer, socket]);

  const searchFriend = useCallback(
    async (value) => {
      console.log("search");

      if (value !== "search") {
        peer.close();
        setDummyStream(null);
        socket.emit("new-friend-skip");
      } else {
        const offer = await createOffer();

        socket.emit("searchFriend", { offer: offer });
      }
    },
    [createOffer, peer, socket]
  );
  useEffect(() => {
    const skipFriend = () => {
      console.log("new-connect playing");
      socket.emit("searchFriend");
    };
    socket.on("offer-set-done", skipFriend);
    return () => {
      socket.off("offer-set-done", skipFriend);
    };
  }, [socket]);
  const toggleVideoStream = () => {
    const senders = peer.getSenders();
    const videoSender = senders.find(
      (sender) => sender.track?.kind === "video"
    );

    if (!constraint) {
      console.log("remooott");
      videoSender.track.enabled = true;
    } else {
      if (videoSender && videoSender.track) {
        videoSender.track.enabled = false; // Stops sending video but keeps track
      }

      // myStream.getTracks().find((e) => e.kind === "video").enabled =
      //   !constraint;
      // const senderr = peer.getSenders().find(function (s) {
      //   return s.track?.kind === "video";
      // });
      // setSender(senderr);
      // console.log("sender", senderr);
      // peer.removeTrack(senderr);
    }

    console.log("peeeeeeer", peer);
  };
  const toggleAudioStream = () => {
    console.log("peerr", peer);
    const senders = peer.getSenders();
    const audioSender = senders.find(
      (sender) => sender.track?.kind === "audio"
    );

    if (!isMute) {
      console.log("remooott");
      audioSender.track.enabled = true;
    } else {
      if (audioSender && audioSender.track) {
        audioSender.track.enabled = false; // Stops sending video but keeps track
      }
    }
  };
  return (
    <>
      <div className="video-box">
        <div className="video-screen">
          {!myStream ? (
            <img src={nosignal} alt="Thumbnail" height="420px" width="100%" />
          ) : (
            <>
              <ReactPlayer
                // className='react-player'
                // light={}
                playing={true}
                url={myStream}
                width="100%"
                height="420px"
              />
              <h1 style={{ color: "black" }}>{userName}</h1>
            </>
          )}
        </div>
        <div className="video-controls">
          <button
            style={{ background: "white", outline: "none" }}
            onClick={() => {
              toggleVideoStream();
              setConstraint(!constraint);
            }}
          >
            <img src={!constraint ? videounhide : hidevideo} height="25px" />
          </button>
          <button
            style={{ background: "white", outline: "none" }}
            onClick={() => {
              toggleAudioStream();
              setIsMute(!isMute);
            }}
          >
            <img src={!isMute ? mutemicro : unmutemicro} height="25px" />
          </button>
        </div>
      </div>
      <div className="video-box">
        <div className="video-screen">
          {!dummyStream ? (
            <img src={nosignal} alt="Thumbnail" height="420px" width="100%" />
          ) : (
            <>
              {dummyStream.getTracks().forEach((track) => {
                console.log("tracckk", track);
              })}
              <ReactPlayer
                // className='react-player'
                // light={}
                ref={remoteRef}
                playing={true}
                url={dummyStream}
                width="100%"
                height="420px"
              />
              <h1 style={{ color: "black" }}>{friendName}</h1>
            </>
          )}
        </div>
        <div className="video-controls">
          <button
            style={{
              background: "red",
              outline: "none",
              color: "black",
              fontSize: "medium",
            }}
            onClick={() => {
              if (search === "search") {
                setSearch("searching");
                searchFriend("search");
              } else {
                searchFriend();
              }
            }} //on skip should i leave the room or make her leave the room
          >
            {search === "search" ? (
              <>Search</>
            ) : search === "skip" ? (
              <>skip</>
            ) : (
              <>Searching . . .</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
// https://i.pinimg.com/originals/e3/aa/8c/e3aa8ccb65a2aca19df86525fa4dbe4a.gif
// useEffect(() => {
//   // console.log("Peer Connection State:", peer.connectionState);
//   // console.log("ICE Connection State:", peer.iceConnectionState);
//   // console.log("Signaling State:", peer.signalingState);
//   // console.log("Remote Stream:", remoteVideo.srcObject);
// }, [peer.connectionState, peer.iceConnectionState, peer.signalingState]);
{
  /* <video
            ref={videoElement}
            poster={nosignal}
            autoPlay
            style={{
              height: "390px",
              width: "480px",
              borderRadius: "20px",
            }}
            playsInline
            controls={false}
          /> */
}
{
  /* <video
            ref={remoteVideo}
            poster={nosignal}
            autoPlay
            style={{
              height: "390px",
              width: "480px",
              borderRadius: "20px",
            }}
            // playsInline
            controls={false}
          /> */
}

// useEffect(() => {
//   socket.on("skip-new-friend", () => {
//     searchFriend();
//   });
//   return () => {
//     socket.off("skip-new-friend", () => {
//       searchFriend();
//     });
//   };
// }, [searchFriend, socket]);
// useEffect(() => {
//   console.log("track1");
//   peer.ontrack = (event) => {
//     const track = event.track;
//     console.log("track", track);
//     if (track.kind === "video") {
//       track.onmute = () => {
//         console.log("track", track);
//         remoteRef.current.style.display = "none"; // Hide video element
//       };
//       track.onunmute = () => {
//         console.log("track", track);
//         remoteRef.current.style.display = "block"; // Show video element
//       };
//     }
//   };
// }, [peer]);

// const withoutvideoTrack = myStream
//   .getTracks()
//   .find((e) => e.kind === "video");
// console.log("withoutvideoTrack", withoutvideoTrack);
// peer.replaceTrack(withoutvideoTrack);
// myStream.getTracks().forEach((track) => {
//   // console.log("TTTTTTTTTT", track);
//   // if (track.kind === "video") {
//   //   track.enabled = !constraint;
//   // }

//   console.log("track", track);
//   const steam = myStream;
//   peer?.addTrack(track, steam);
// });
