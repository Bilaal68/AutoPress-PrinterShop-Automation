import { useState, useEffect } from "react";
import api from "../services/api";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const BackendStatus = () => {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.healthCheck();
        setStatus("connected");
      } catch (err) {
        console.error("Backend connection failed:", err);
        setStatus("failed");
        setError(err.message);
      }
    };

    checkConnection();

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (status === "checking") {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs flex items-center space-x-2 z-50">
        <AlertCircle className="h-3 w-3" />
        <span>Connecting to backend...</span>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center space-x-2 z-50">
        <CheckCircle className="h-3 w-3" />
        <span>Backend: Connected to localhost:5000</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs flex items-center space-x-2 z-50">
      <XCircle className="h-3 w-3" />
      <span>Backend: Not connected - {error?.slice(0, 30)}</span>
    </div>
  );
};

export default BackendStatus;
