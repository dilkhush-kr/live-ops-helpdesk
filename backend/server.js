const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const lockedTickets = new Map();

io.on("connection", (socket) => {

  console.log("User connected");

  // Lock
  socket.on("lock_ticket", (data) => {

    const existingLock =
      lockedTickets.get(data.ticketId);

    if (existingLock) {
      return;
    }

    lockedTickets.set(
      data.ticketId,
      {
        socketId: socket.id,
        lockedBy: data.lockedBy,
      }
    );

    io.emit(
      "ticket_locked",
      data
    );

  });

  // Unlock
  socket.on(
    "unlock_ticket",
    (ticketId) => {

      lockedTickets.delete(
        ticketId
      );

      io.emit(
        "ticket_unlocked",
        ticketId
      );

    }
  );

  // New Ticket
  socket.on(
    "create_ticket",
    (ticket) => {

      io.emit(
        "new_ticket",
        ticket
      );

    }
  );

  // Disconnect
  socket.on(
    "disconnect",
    () => {

      for (const [
        ticketId,
        lockData,
      ] of lockedTickets.entries()) {

        if (
          lockData.socketId ===
          socket.id
        ) {

          lockedTickets.delete(
            ticketId
          );

          io.emit(
            "ticket_unlocked",
            ticketId
          );

        }

      }

      console.log(
        "User disconnected"
      );

    }
  );

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});