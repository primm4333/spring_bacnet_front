import React, { useState, useEffect } from "react";
import useWebSocket from "./hooks/useWebSocket";

function App() {
  const {
    messages,
    devices,
    checkRouterStatus,
    fetchDevices,
    selectedDevice,
    setSelectedDevice,
    selectedDeviceSignals,
    isWebSocketConnected,
  } = useWebSocket();

  useEffect(() => {
    // Automatically check router status and fetch devices on mount
    checkRouterStatus();
    fetchDevices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">BACnet & WebSocket Demo</h1>

      {/* Router Status */}
      <div className="bg-white p-4 rounded-lg shadow-md w-96 mb-4">
        <h2 className="text-lg font-semibold">Router Status:</h2>
        <ul className="list-disc list-inside">
          {messages.length === 0 ? (
            <li className="text-gray-500">No updates received...</li>
          ) : (
            messages.map((msg, index) => <li key={index} className="text-green-600">{msg}</li>)
          )}
        </ul>
      </div>

      {/* Device List */}
      <div className="bg-white p-4 rounded-lg shadow-md w-96 mb-4">
        <h2 className="text-lg font-semibold">Connected Devices:</h2>
        <div className="space-y-2">
          {devices.length === 0 ? (
            <p className="text-gray-500">No devices found.</p>
          ) : (
            devices.map((device, index) => (
              <div
                key={index}
                className={`p-2 rounded-md cursor-pointer ${
                  selectedDevice === device ? "bg-blue-300" : "bg-blue-100 hover:bg-blue-200"
                }`}
                onClick={() => setSelectedDevice(device)}
              >
                <h3 className="text-md font-semibold">{device}</h3>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Device Details (if selected) */}
      {selectedDevice && (
        <div className="bg-white p-4 rounded-lg shadow-md w-96 mt-4">
          <h2 className="text-lg font-semibold">Device: {selectedDevice}</h2>
          <div className="mt-2">
            <div className="flex items-center">
              <p className="font-medium">Signal:</p>
              <p className="ml-2 animate-pulse bg-green-100 px-2 py-1 rounded">
                {selectedDeviceSignals[selectedDevice] || "Waiting for data..."}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Updates automatically every 5 seconds
            </p>
          </div>
        </div>
      )}

      {/* WebSocket Status */}
      <div className="mt-4 flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isWebSocketConnected ? "bg-green-500" : "bg-red-500"}`}></div>
        <p className="text-sm">{isWebSocketConnected ? "Connected" : "Disconnected"}</p>
      </div>

      {/* Fetch Devices and Check Router Button */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={checkRouterStatus}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Check Router Status
        </button>
        <button
          onClick={fetchDevices}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          Fetch Devices
        </button>
      </div>
    </div>
  );
}

export default App;