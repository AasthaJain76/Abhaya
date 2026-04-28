import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSOS = () => {
    alert("🚨 SOS Triggered! (You will connect backend later)");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <div className="flex justify-between items-center bg-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-purple-600">Abhaya Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1">

        <h2 className="text-3xl font-bold mb-6">
          Welcome 👋
        </h2>

        {/* SOS Button */}
        <button
          onClick={handleSOS}
          className="bg-red-600 text-white px-10 py-5 text-xl rounded-full shadow-lg hover:bg-red-700 transition"
        >
          🚨 SOS
        </button>

        <p className="mt-4 text-gray-600">
          Tap in case of emergency
        </p>

      </div>
    </div>
  );
}