"use client";

import { useEffect, useState } from "react";
import socket from "../socket/socket";
import {
  FaLock,
  FaPlus,
  FaUserShield,
} from "react-icons/fa";

export default function TicketBoard() {

  const [tickets, setTickets] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState("");

  const [disconnected, setDisconnected] =
    useState(false);

  // Initial Tickets
  useEffect(() => {

    setTickets([
      {
        id: 101,
        customer: "John Logistics",
        issue: "Truck Delay",
        priority: "High",
        status: "Open",
        locked: false,
        lockedBy: "",
      },
      {
        id: 102,
        customer: "Rapid Cargo",
        issue: "Payment Failed",
        priority: "Medium",
        status: "Pending",
        locked: false,
        lockedBy: "",
      },
    ]);

    let storedName =
      localStorage.getItem("agentName");

    if (!storedName) {
      storedName =
        prompt("Enter Agent Name") ||
        "Agent";

      localStorage.setItem(
        "agentName",
        storedName
      );
    }

    setCurrentUser(storedName);

  }, []);

  // Socket Events
  useEffect(() => {

    socket.on("connect", () => {
      setDisconnected(false);
    });

    socket.on("disconnect", () => {
      setDisconnected(true);
    });

    socket.on("ticket_locked", (data) => {

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === data.ticketId
            ? {
                ...ticket,
                locked: true,
                lockedBy: data.lockedBy,
              }
            : ticket
        )
      );

    });

    socket.on(
      "ticket_unlocked",
      (ticketId) => {

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  locked: false,
                  lockedBy: "",
                }
              : ticket
          )
        );

      }
    );

    socket.on("new_ticket", (ticket) => {

      setTickets((prev) => [
        ticket,
        ...prev,
      ]);

    });

    return () => {

      socket.off("connect");
      socket.off("disconnect");
      socket.off("ticket_locked");
      socket.off("ticket_unlocked");
      socket.off("new_ticket");

    };

  }, []);

  // Lock
  const handleEdit = (ticketId) => {

    socket.emit("lock_ticket", {
      ticketId,
      lockedBy: currentUser,
    });

  };

  // Unlock
  const handleClose = (ticketId) => {

    const ticket = tickets.find(
      (t) => t.id === ticketId
    );

    // ONLY lock owner can close
    if (
      ticket.lockedBy !== currentUser
    ) {
      return alert(
        "Only lock owner can close ticket"
      );
    }

    socket.emit(
      "unlock_ticket",
      ticketId
    );

  };

  // Create New Ticket
  const createTicket = () => {

    const newTicket = {
      id: Math.floor(
        Math.random() * 1000
      ),
      customer: "New Customer",
      issue: "New Support Issue",
      priority: "Low",
      status: "Open",
      locked: false,
      lockedBy: "",
    };

    socket.emit(
      "create_ticket",
      newTicket
    );

  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Disconnect Banner */}
      {disconnected && (
        <div className="bg-red-600 text-white text-center py-3 font-bold text-sm">
          Connection Lost: Reconnecting...
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Live Ops Helpdesk
            </h1>

            <p className="text-gray-600 mt-1">
              Real-Time Collaborative Dashboard
            </p>
          </div>

          <div className="flex gap-3">

            {/* Add Ticket */}
            <button
              onClick={createTicket}
              className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold"
            >
              <FaPlus />
              Add Ticket
            </button>

            {/* User */}
            <div className="bg-white rounded-xl shadow px-4 py-2 flex items-center gap-3">

              <FaUserShield className="text-2xl text-blue-600" />

              <div>
                <p className="text-xs text-gray-500">
                  Logged in as
                </p>

                <h2 className="font-bold text-gray-800">
                  {currentUser}
                </h2>
              </div>

            </div>

          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow p-5 text-blue-700">
            <p className="text-gray-500 text-sm">
              Total Tickets
            </p>

            <h2 className="text-3xl font-bold">
              {tickets.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Locked Tickets
            </p>

            <h2 className="text-3xl font-bold text-red-600">
              {
                tickets.filter(
                  (t) => t.locked
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Active Agents
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              2
            </h2>
          </div>

        </div>

        {/* Ticket Cards */}
        <div className="space-y-4">

          {tickets.map((ticket) => (

            <div
              key={ticket.id}
              className={`rounded-xl shadow p-5 transition-all text-gray-900 ${
  ticket.locked
    ? "bg-gray-300 border border-red-500"
    : "bg-white"
}`}
            >

              <div className="flex flex-col lg:flex-row justify-between gap-5">

                {/* Left */}
                <div className="space-y-2">

                  <div>
                    <p className="text-sm text-gray-700">
                      Ticket ID
                    </p>

                    <h2 className="text-2xl font-bold">
                      #{ticket.id}
                    </h2>
                  </div>

                  <div>
                    <p className="text-sm text-gray-700">
                      Customer
                    </p>

                    <p className="font-bold text-lg text-gray-900">
                      {ticket.customer}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-700">
                      Issue
                    </p>

                    <p className="text-gray-900">
                     {ticket.issue}
                    </p>
                  </div>

                </div>

                {/* Middle */}
                <div className="space-y-4">

                  <div>
                    <p className="text-sm text-gray-700">
                      Priority
                    </p>

                    <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full font-semibold">
                      {ticket.priority}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-700">
                      Status
                    </p>

                    <p className="font-bold text-blue-600">
                      {ticket.status}
                    </p>
                  </div>

                  <div>

                    <p className="text-sm text-gray-700">
                      Lock Status
                    </p>

                    {ticket.locked ? (
                      <div className="flex items-center gap-2 text-red-600 font-bold">
                        <FaLock />
                        Locked by{" "}
                        {ticket.lockedBy}
                      </div>
                    ) : (
                      <p className="text-green-600 font-bold">
                        Available
                      </p>
                    )}

                  </div>

                </div>

                {/* Buttons */}
                <div className="flex gap-3 items-center">

                  <button
                    onClick={() =>
                      handleEdit(ticket.id)
                    }
                    disabled={
                      ticket.locked &&
                      ticket.lockedBy !==
                        currentUser
                    }
                    className={`px-5 py-3 rounded-xl text-white font-bold ${
                      ticket.locked &&
                      ticket.lockedBy !==
                        currentUser
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600"
                    }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleClose(ticket.id)
                    }
                    disabled={
                      ticket.locked &&
                      ticket.lockedBy !==
                        currentUser
                    }
                    className={`px-5 py-3 rounded-xl text-white font-bold ${
                      ticket.locked &&
                      ticket.lockedBy !==
                        currentUser
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-600"
                    }`}
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}