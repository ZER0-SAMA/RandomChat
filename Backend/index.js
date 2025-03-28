const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: " http://localhost:5173",
  },
});
const MapSockets = new Map();
const tempMap = new Map();
const roomsArr = ["a", "b", "c", "d", "e"];

const room = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

io.on("connection", (socket) => {
  socket.on("new-peer-start", () => {
    socket.emit("new-peer");
  });

  socket.once("name", (value) => {
    MapSockets.set(socket.id, {
      id: socket.id,
      username: value,
      connected: false,
      roomid: null,
      prevroomid: null,
      offer: null,
      role: "",
    }); //creating user object
    tempMap.set(socket.id, {
      username: value,
      currentRoomId: null,
      prevRoomId: null,
    });
    console.log("Username : ", value);
  });

  // socket.on("set-my-offer", (myoffer) => {
  //   if (myoffer) {
  //     MapSockets.get(socket.id).offer = myoffer?.offer; //setting my offer
  //     socket.emit("offer-set-done");
  //   }
  // });

  socket.on("searchFriend", (val) => {
    //fitting user in free rooms

    for (let i of roomsArr) {
      //search room

      const roomSize = room.get(i)?.size;

      if (
        (!roomSize || roomSize < 2) &&
        i !== MapSockets.get(socket.id)?.prevRoomId
      ) {
        socket.join(i);

        MapSockets.get(socket.id).currentRoomId = i;
        MapSockets.get(socket.id).role = "caller";
        tempMap.get(socket.id).currentRoomId = i;
        console.log("tempMap", tempMap);
        if (roomSize === 1) {
          const userids = [...room.get(i)];
          console.log("userids", userids);
          const filterfriends = [
            MapSockets.get(userids[0]).username,
            MapSockets.get(userids[1]).username,
          ];
          const otherFriend = userids.filter((e) => e.id !== socket.id);
          MapSockets.get(otherFriend[0]).role = "calle";
          MapSockets.get(socket.id).role = "caller";
          const connectedFriend = [
            MapSockets.get(otherFriend[0]),
            MapSockets.get(socket.id),
          ];
          // console.log(userids);
          socket.to(i).emit("remote-offer", { offer: val.offer });
          io.to(i).emit("connectedtofriend", connectedFriend); //create an event which send alert that u have connected to this person
        }

        break;
      }
    }
  });
  socket.on("new-ice", (val) => {
    //new ice candidates
    const roomId = MapSockets.get(socket.id)?.currentRoomId;
    socket.to(roomId).emit("message-ice", val);
  });

  socket.on("new-friend-skip", () => {
    const roomId = MapSockets.get(socket.id)?.currentRoomId;
    socket.to(roomId).emit("friend-left-room");
    socket.leave(roomId);
    MapSockets.get(socket.id).prevRoomId = roomId;
    MapSockets.get(socket.id).currentRoomId = null;
    console.log(tempMap.get(socket.id));
    socket.emit("new-peer-searching");
  });

  // socket.on("update-offer", (value) => {
  //   console.log("update offer");
  //   MapSockets.get(socket.id).offer = value?.offer;
  // });
  socket.on("text", (value) => {
    const roomId = MapSockets.get(socket.id)?.currentRoomId;
    socket.to(roomId).emit("msg", {
      name: MapSockets.get(socket?.id)?.username,
      text: value,
    });
  });
  socket.on("negotion-offer", (val) => {
    const roomId = MapSockets.get(socket.id)?.currentRoomId;
    console.log("valllllllll", val);
    socket.to(roomId).emit("remote-offer", { offer: val.offer });
  });
  socket.on("my-answer", (answer) => {
    const roomId = MapSockets.get(socket.id)?.currentRoomId;
    socket.to(roomId).emit("remote-answer", answer);
  });
  socket.on("disconnect", () => {
    MapSockets.delete(socket.id); // To disconnect
    socket.disconnect();
    console.log("socket is disconnected");
  });
});

httpServer.listen(3000, () => {
  console.log("Listening on port 3000");
});
io.listen(3001);
// const friendList = MapSockets.filter((i) => i.id !== socket.id);
// const friend = MapSockets.at(
//   Math.floor(Math.random() * MapSockets?.length)
// );
