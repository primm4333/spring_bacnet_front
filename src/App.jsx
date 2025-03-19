import { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";

function App() {
  const { messages, devices, selectedDevice, selectedDeviceSignals, selectDevice } = useWebSocket();
  const [manualDevices, setManualDevices] = useState([]);

  const fetchDevices = async () => {
    console.log("Fetch button clicked!");
    try {
      const response = await fetch("http://localhost:8080/getDevices", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json(); // Assuming backend returns JSON
      console.log("Fetched Devices:", data);
      setManualDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      setManualDevices(["Error fetching devices"]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">BACnet & WebSocket Test</h1>

      {/* Router Status */}
      <div className="bg-white p-4 rounded-lg shadow-md w-96">
        <h2 className="text-lg font-semibold">Router Status:</h2>
        <ul className="list-disc list-inside">
          {messages.length === 0 ? (
            <li className="text-gray-500">No updates received...</li>
          ) : (
            messages.map((msg, index) => <li key={index} className="text-green-600">{msg}</li>)
          )}
        </ul>
      </div>

      {/* Fetch BACnet Devices Button */}
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={fetchDevices}>
        Fetch BACnet Devices
      </button>

      {/* IoT Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {devices.map((device, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-blue-100"
            onClick={() => selectDevice(device)}
          >
            <h3 className="text-lg font-semibold text-center">{device}</h3>
          </div>
        ))}
      </div>

      {/* Manually Fetched Devices or Error Message */}
      {manualDevices.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md w-96 mt-4">
          <h2 className="text-lg font-semibold">Manually Fetched Devices:</h2>
          <ul className="list-disc list-inside">
            {manualDevices.map((device, index) => (
              <li key={index} className={device.includes("not initialized") || device.includes("Error") ? "text-red-600 font-semibold" : "text-gray-700"}>
                {device}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Real-time signals for the selected device */}
      {selectedDevice && (
        <div className="bg-white p-4 rounded-lg shadow-md w-96 mt-4">
          <h2 className="text-lg font-semibold">Real-time Signals: {selectedDevice}</h2>
          <ul className="list-disc list-inside">
            {selectedDeviceSignals.length === 0 ? (
              <li className="text-gray-500">No signals received yet...</li>
            ) : (
              selectedDeviceSignals.map((signal, index) => (
                <li key={index} className="text-red-600">{signal}</li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
