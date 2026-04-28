import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../AppContext";

// ✅ Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

function Tracking() {
  const {
    isTracking,
    setIsTracking,
    location,
    contacts,
    addContact,
    updateContact,
    deleteContact,
    fetchContacts,
  } = useAppContext();

  const userId = localStorage.getItem("userId"); // 🔥 dynamic user

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });

  // ✅ Fetch contacts
  useEffect(() => {
    console.log("🔍 Fetching contacts...");
    console.log("User ID:", userId);

    if (!userId) {
      console.error("❌ No userId found");
      return;
    }

    fetchContacts(userId);
  }, [userId]);

  // ✅ Toggle tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);

    if (!isTracking && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 Location:", position.coords);
        },
        (err) => console.error("❌ Location error:", err)
      );
    }
  };

  // ✅ Add contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User not logged in");
      return;
    }

    if (newContact.name && newContact.phone) {
      addContact({
        userId,
        name: newContact.name,
        phone: newContact.phone,
      });

      console.log("✅ Contact added:", newContact);

      setNewContact({ name: "", phone: "" });
      setShowAddForm(false);
    }
  };

  // ✅ Edit contact
  const handleEditContact = (id: string, name: string, phone: string) => {
    const newName = prompt("Edit name:", name);
    const newPhone = prompt("Edit phone:", phone);

    if (newName && newPhone) {
      updateContact(id, { name: newName, phone: newPhone });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Location Tracking</h1>
          <p className="text-gray-600">
            Share your real-time location with trusted contacts.
          </p>
        </div>

        {/* Tracking + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Tracking Control */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Tracking Control</h2>

            <button
              onClick={toggleTracking}
              className={`w-32 h-32 rounded-full text-white font-bold ${
                isTracking ? "bg-green-600" : "bg-gray-400"
              }`}
            >
              {isTracking ? "ON" : "START"}
            </button>

            {location && (
              <div className="mt-4">
                <p>Lat: {location.lat}</p>
                <p>Lng: {location.lng}</p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Live Map</h2>

            <div className="h-80">
              {location ? (
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={15}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>You are here</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p>Start tracking...</p>
              )}
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Contacts</h2>

          {contacts.length === 0 ? (
            <p className="text-gray-500">No contacts found</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {contacts.map((c) => (
                <div key={c._id} className="border p-4 rounded">
                  <p className="font-bold">{c.name}</p>
                  <p>{c.phone}</p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleEditContact(c._id!, c.name, c.phone)
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteContact(c._id!)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Contact */}
          <div className="mt-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Add Contact
              </button>
            ) : (
              <form onSubmit={handleAddContact} className="space-y-2">
                <input
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="border p-2 w-full"
                />

                <input
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  className="border p-2 w-full"
                />

                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-4 py-2">
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 text-white px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracking;