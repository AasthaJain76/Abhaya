import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../AppContext";

type Contact = {
  _id?: string;
  name: string;
  phone: string;
};

function SOS() {
  const { setIsSOSActive, location, setLocation } = useAppContext();

  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isCancelled, setIsCancelled] = useState(false);

  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userId = localStorage.getItem("userId");

  // ============================
  // ✅ FETCH CONTACTS
  // ============================
  useEffect(() => {
    console.log("🔍 Fetching contacts...");
    console.log("User ID:", userId);

    if (!userId) {
      console.warn("❌ No userId found");
      return;
    }

    const fetchContacts = async () => {
      try {
        const res = await fetch(`http://localhost:5174/api/contacts/${userId}`);
        console.log("API STATUS:", res.status);

        const text = await res.text();
        console.log("RAW RESPONSE:", text);

        const data = text ? JSON.parse(text) : [];
        console.log("PARSED DATA:", data);

        if (!res.ok) {
          console.error("❌ API error:", data);
          return;
        }

        setContacts(Array.isArray(data) ? data : data.contacts || []);
      } catch (err) {
        console.error("❌ Error fetching contacts:", err);
      }
    };

    fetchContacts();
  }, [userId]);

  // ============================
  // 📍 LOCATION
  // ============================
  useEffect(() => {
    console.log("📍 Getting location...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          console.log("✅ Location:", coords);
          setLocation(coords);
        },
        (err) => console.error("❌ Location error:", err.message)
      );
    }
  }, [setLocation]);

  // ============================
  // 🚨 SEND SOS
  // ============================
  const sendSOSAlert = async () => {
    console.log("🚨 Sending SOS...");

    if (isCancelled) return;

    if (!location) {
      alert("Location not available");
      return;
    }

    try {
      const res = await fetch("http://localhost:5174/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, location }),
      });

      const data = await res.json();
      console.log("SOS RESPONSE:", data);

      if (res.ok) {
        alert("✅ SOS alert sent!");
        setIsSOSActive(true);
      } else {
        alert("❌ Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ SOS error:", err);
    }
  };

  // ============================
  // ⏱ START
  // ============================
  const handleSOSActivation = () => {
    console.log("⏱ Starting countdown");

    setIsActivated(true);
    setCountdown(10);
    setIsCancelled(false);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          console.log("🚀 Sending SOS now");

          if (!isCancelled) sendSOSAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ============================
  // ❌ CANCEL
  // ============================
  const handleCancel = () => {
    console.log("❌ Cancelled");

    setIsActivated(false);
    setCountdown(0);
    setIsCancelled(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ============================
  // ✏️ EDIT
  // ============================
  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewName(contact.name);
    setNewPhone(contact.phone);
  };

  const handleSave = async () => {
    if (!editingContact) return;

    try {
      const res = await fetch(
        `http://localhost:5174/api/contacts/${editingContact._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName, phone: newPhone }),
        }
      );

      if (res.ok) {
        console.log("✅ Updated");

        setContacts((prev) =>
          prev.map((c) =>
            c._id === editingContact._id
              ? { ...c, name: newName, phone: newPhone }
              : c
          )
        );

        setEditingContact(null);
      }
    } catch (err) {
      console.error("❌ Update error:", err);
    }
  };

  const handleCancelEdit = () => setEditingContact(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Emergency SOS
        </h1>

        {/* DEBUG */}
        <p className="text-center text-sm text-gray-500">
          Contacts Loaded: {contacts.length}
        </p>

        {/* BUTTON */}
        <div className="bg-white p-8 text-center rounded-xl shadow mb-8">
          {!isActivated ? (
            <button
              onClick={handleSOSActivation}
              className="w-40 h-40 bg-red-600 text-white rounded-full"
            >
              SOS
            </button>
          ) : countdown > 0 ? (
            <>
              <h2 className="text-4xl">{countdown}</h2>
              <button onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <p className="text-green-600">Activated</p>
          )}
        </div>

        {/* LOCATION */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          {location ? (
            <>
              <p>Lat: {location.lat}</p>
              <p>Lng: {location.lng}</p>
            </>
          ) : (
            <p>Fetching location...</p>
          )}
        </div>

        {/* CONTACTS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Contacts</h2>

          {contacts.length ? (
            contacts.map((c) => (
              <div key={c._id} className="border p-3 mb-2">
                {editingContact?._id === c._id ? (
                  <>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p>{c.name}</p>
                    <p>{c.phone}</p>
                    <button onClick={() => handleEdit(c)}>Edit</button>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No contacts found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SOS;