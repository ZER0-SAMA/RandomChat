import React from "react";
import "./App.css";
import Home from "./components/Home";
// import { animate } from "./components/hooks/main";
// import { PeerProvider } from "./components/hooks/Peer";
import { Socket } from "./sockets/socket";
function App() {
  // useEffect(() => {
  //   animate();
  // }, []);
  return (
    <Socket>
      {/* <PeerProvider> */}
      <Home />
      {/* </PeerProvider> */}
    </Socket>
  );
}

export default App;
