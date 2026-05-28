"use client";

import { io } from "socket.io-client";

const socket = io(
  "https://live-ops-helpdesk-n2lv.onrender.com",
  {
    autoConnect: true,
  }
);

export default socket;