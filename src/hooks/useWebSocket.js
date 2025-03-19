import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = () => {
  const [messages, setMessages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceSignals, setSelectedDeviceSignals] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Auto-reconnect every 5 seconds
      onConnect: () => {
        console.log("Connected to WebSocket");

        // Subscribe to router status updates
        stompClient.subscribe("/topic/routerStatus", (message) => {
          setMessages((prev) => [...prev, message.body]);
        });

        // Subscribe to BACnet device updates
        stompClient.subscribe("/topic/devices", (message) => {
          setDevices(JSON.parse(message.body)); // Assuming backend sends JSON
        });

        // Send a request to check router status
        stompClient.publish({ destination: "/app/checkRouter" });
      },
      onStompError: (frame) => {
        console.error("WebSocket Error:", frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      console.log("WebSocket Disconnected");
    };
  }, []);

  // Function to subscribe to real-time signals for a selected device
  const selectDevice = (device) => {
    setSelectedDevice(device);
    setSelectedDeviceSignals([]); // Clear previous signals

    // Subscribe to real-time signals for this device
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log(`Subscribed to signals for ${device}`);
        stompClient.subscribe(`/topic/signals/${device}`, (message) => {
          setSelectedDeviceSignals((prev) => [...prev, message.body]);
        });
      },
    });
    stompClient.activate();
  };

  return { messages, devices, selectedDevice, selectedDeviceSignals, selectDevice };
};

export default useWebSocket;
