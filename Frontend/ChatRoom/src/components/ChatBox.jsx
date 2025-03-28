import React, { useCallback, useEffect, useState } from "react";
import send from "../assets/send.png";
import { useSocket } from "../sockets/socket";
export default function ChatBox(prop) {
  const { socket } = useSocket();
  const [textValue, setTextValue] = useState("");
  const [msgStore, setMsgStore] = useState([
    { name: "", text: "", classtyle: "" },
  ]);
  const addMsg = useCallback(
    (val) => {
      const msgData = { name: val.name, text: val.text, classtyle: val.class };
      socket.emit("text", textValue);
      setMsgStore([...msgStore, msgData]);
    },
    [msgStore, socket, textValue]
  );
  useEffect(() => {
    socket.on("msg", (val) => {
      console.log("msg aaya hai : ", val);
      setMsgStore([
        ...msgStore,
        { name: val.name, text: val.text, classtyle: "msg-style-friend" },
      ]);
    });
    return () => {
      socket.off("msg", (val) => {
        console.log("msg aaya ja rha hai : ", val);
        setMsgStore([
          ...msgStore,
          { name: val.name, text: val.text, classtyle: "msg-style-friend" },
        ]);
      });
    };
  }, [msgStore, socket]);

  const msgBox = () => {
    return (
      <>
        {msgStore.map(({ name, text, classtyle }) => (
          <div key={text}>
            <div className={classtyle ? classtyle : ""}>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </>
    );
  };
  return (
    <div className="main-chat-area">
      <div className="chat-box">
        <div
          style={{
            height: "100vh",
            display: "flex",
            padding: "5px 0px 0px 0pxs",
            flexDirection: "column",
          }}
        >
          {msgBox()}
        </div>
      </div>
      <div className="msg-send-box">
        <input
          id="send-input"
          onChange={(e) => {
            setTextValue(e.target.value);
          }}
          value={textValue}
        />
        <button
          style={{
            outline: "none",
            background: "red",
          }}
          onClick={(e) => {
            e.preventDefault();
            if (textValue !== "") {
              console.log("textValue", textValue);
              // socket.emit("text", textValue);
              addMsg({
                name: prop.userName,
                text: textValue,
                class: "msg-style-my",
              });

              setTextValue("");
            }
          }}
        >
          <img src={send} height="25px" width="25px" alt="send" />
        </button>
      </div>
    </div>
  );
}
