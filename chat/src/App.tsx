import React, { useState, useRef, useEffect } from "react";

interface Message {
  text: string;
  type: "sent" | "received";
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      // Append received message to the state
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: event.data, type: "received" },
      ]);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const handleJoinRoom = () => {
    const userRoomId = prompt("Enter Room ID:");
    if (userRoomId) {
      setRoomId(userRoomId);
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: "join",
            payload: {
              roomId: userRoomId,
            },
          })
        );
      }
    }
  };

  const sendMessage = () => {
    const message = inputRef.current?.value;
    if (message && wsRef.current) {
      // Send message to backend
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          payload: {
            message,
          },
        })
      );
      // Append sent message to state
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `You: ${message}`, type: "sent" },
      ]);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[800px] h-[500px] bg-[#fdf6e3] border border-gray-300 rounded-lg shadow-lg flex">
        {/* Sidebar */}
        <div className="w-1/4 p-4 border-r border-gray-300">
          <button
            onClick={handleJoinRoom}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Join Room
          </button>
        </div>

        {/* Chat Section */}
        <div className="w-3/4 flex flex-col">
          <div className="h-12 flex items-center justify-between px-4 bg-gray-200 border-b border-gray-300">
            <h1 className="text-lg font-semibold">Chat App</h1>
            {roomId && <span className="text-sm">Room ID: {roomId}</span>}
          </div>

          {/* Messages Section */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[70%] mb-3 p-2 rounded-lg ${
                  msg.type === "sent"
                    ? "bg-blue-300 ml-auto text-right"
                    : "bg-gray-300 text-left"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="h-16 flex items-center border-t border-gray-300 px-4">
            <input
              type="text"
              ref={inputRef}
              placeholder="Type your message"
              className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-4 w-10 h-10 bg-pink-300 rounded-full flex items-center justify-center hover:bg-pink-400"
            >
              <span>&#9993;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
