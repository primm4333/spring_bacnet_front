import { useEffect, useState, useRef } from "react";
import axios from "axios"; // For HTTP requests
import { Client } from "@stomp/stompjs"; // For WebSocket connection
import SockJS from "sockjs-client"; // For WebSocket connection

const useWebSocket = () => {
  const [messages, setMessages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceSignals, setSelectedDeviceSignals] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const intervalRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Auto-reconnect every 5 seconds
      onConnect: () => {
        console.log("Connected to WebSocket");

        // Subscribe to router status updates
        client.subscribe("/topic/routerStatus", (message) => {
          console.log("Router Status Update: ", message.body);
          setMessages((prev) => [...prev, message.body]);
        });

        // Subscribe to BACnet device updates
        client.subscribe("/topic/devices", (message) => {
          setDevices(JSON.parse(message.body)); // Assuming backend sends JSON
        });

        setIsWebSocketConnected(true);
      },
      onStompError: (frame) => {
        console.error("WebSocket Error:", frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
      console.log("WebSocket Disconnected");
    };
  }, []);

  // Set up automatic signal fetching when a device is selected
  useEffect(() => {
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // If a device is selected, start fetching signals periodically
    if (selectedDevice) {
      fetchDeviceSignals();
      intervalRef.current = setInterval(fetchDeviceSignals, 5000);
    }

    // Clean up interval when component unmounts or selectedDevice changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDevice]);

  // Fetch BACnet Router status
  const checkRouterStatus = async () => {
    try {
      const response = await axios.get("http://localhost:8080/checkRouter");
      setMessages([response.data]); // Display router status
    } catch (error) {
      console.error("Error checking router:", error);
    }
  };

  // Fetch connected devices
  const fetchDevices = async () => {
    try {
      const response = await axios.get("http://localhost:8080/getDevices");
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  // Fetch device signals
  const fetchDeviceSignals = async () => {
    try {
      console.log("Fetching device signals...");
      const response = await axios.get("http://localhost:8080/getDeviceSignals");
      setSelectedDeviceSignals(response.data); // Set the device signals data
    } catch (error) {
      console.error("Error fetching device signals:", error);
    }
  };

  return {
    messages,
    devices,
    checkRouterStatus,
    fetchDevices,
    fetchDeviceSignals,
    selectedDevice,
    setSelectedDevice,
    selectedDeviceSignals,
    setSelectedDeviceSignals,
    isWebSocketConnected,
  };
};

export default useWebSocket;