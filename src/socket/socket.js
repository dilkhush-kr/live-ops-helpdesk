"use client";

import { io } from "socket.io-client";

const socket = io(
  "https://live-ops-backend-az1y.onrender.com",
  {
    autoConnect: true,
  }
);

export default socket;