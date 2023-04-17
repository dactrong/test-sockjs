import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs"

const App = () => {
  const [stompClient, setStompClient] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [privateMessageInput, setPrivateMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    connect();
  }, []);

  const connect = () => {
    const socket = new SockJS("http://localhost:8080/our-websocket");
    const client = Stomp.over(socket);
    client.connect({}, (frame) => {
      console.log(`Connected: ${frame}`);
      updateNotificationDisplay();
      client.subscribe("/topic/messages", (message) => {
        const content = JSON.parse(message.body).content;
        setMessages((prevMessages) => [...prevMessages, content]);
      });

      client.subscribe("/user/topic/private-messages", (message) => {
        const content = JSON.parse(message.body).content;
        setMessages((prevMessages) => [...prevMessages, content]);
      });

      client.subscribe("/topic/global-notifications", (message) => {
        setNotificationCount((prevCount) => prevCount + 1);
      });

      client.subscribe("/user/topic/private-notifications", (message) => {
        setNotificationCount((prevCount) => prevCount + 1);
      });

      setStompClient(client);
    });
  };

  const sendMessage = () => {
    console.log("sending message");
    stompClient.send(
      "/ws/message",
      {},
      JSON.stringify({ messageContent: messageInput })
    );
    setMessageInput("");
  };

  const sendPrivateMessage = () => {
    console.log("sending private message");
    stompClient.send(
      "/ws/private-message",
      {},
      JSON.stringify({ messageContent: privateMessageInput })
    );
    setPrivateMessageInput("");
  };

  function updateNotificationDisplay() {
    setShowNotifications(notificationCount !== 0);
  }

  const resetNotificationCount = () => {
    setNotificationCount(0);
    updateNotificationDisplay();
  };

  return (
    <div className="container" style={{ marginTop: 50 }}>
      <div className="row">
        <div className="col-md-12">
          <form className="form-inline">
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <input
                type="text"
                id="message"
                className="form-control"
                placeholder="Enter your message here..."
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
              />
            </div>
            <button
              className="btn btn-default"
              type="button"
              onClick={sendMessage}
            >
              Send
            </button>
          </form>
        </div>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <div className="col-md-12">
          <form className="form-inline">
            <div className="form-group">
              <label htmlFor="private-message">Private Message</label>
              <input
                type="text"
                id="private-message"
                className="form-control"
                placeholder="Enter your message here..."
                value={privateMessageInput}
                onChange={(event) => setPrivateMessageInput(event.target.value)}
              />
            </div>
            <button
              className="btn btn-default"
              type="button"
              onClick={sendPrivateMessage}
            >
              Send
            </button>
          </form>
        </div>
      </div>
     
      <div className="row" style={{ marginTop: "50px" }}>
        <div className="col-md-12">
          <button
            className="btn btn-primary"
            type="button"
            onClick={resetNotificationCount}
          >
            Notifications
            <span
              className="badge badge-light"
              id="notifications"
              style={{
                marginLeft: "10px",
                display: showNotifications !== 0 ? "block" : "none",
              }}
            >
             số lượng {notificationCount}
            </span>
          </button>
        </div>
      </div>
      <div className="row" style={{ marginTop: 20 }}>
        <div className="col-md-12">
          <h3>Public Chat</h3>
          <ul className="list-group">
            {messages.map((message, index) => (
              <li key={index} className="list-group-item">
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
