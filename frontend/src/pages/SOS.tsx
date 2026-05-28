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

  const [editingContact, setEditingContact] =
    useState<Contact | null>(null);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userId = localStorage.getItem("userId");

  // ============================
  // FETCH CONTACTS
  // ============================
  useEffect(() => {
    if (!userId) return;

    const fetchContacts = async () => {
      try {
        const res = await fetch(
          `http://localhost:5174/api/contacts/${userId}`
        );

        const data = await res.json();

        setContacts(Array.isArray(data) ? data : data.contacts || []);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    fetchContacts();
  }, [userId]);

  // ============================
  // GET LOCATION
  // ============================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Location error:", err.message);
        }
      );
    }
  }, [setLocation]);

  // ============================
  // SEND WHATSAPP SOS
  // ============================
  const sendSOSAlert = () => {
    if (isCancelled) return;

    if (!location) {
      alert("Location not available");
      return;
    }

    if (!contacts.length) {
      alert("No emergency contacts found");
      return;
    }

    try {
      let phone = contacts[0].phone;

      // Remove spaces, +, -, etc.
      phone = phone.replace(/\D/g, "");

      // Add India country code if missing
      if (phone.length === 10) {
        phone = "91" + phone;
      }

      // Validate
      if (phone.length < 12) {
        alert("Invalid phone number");
        return;
      }

      console.log("FINAL PHONE:", phone);

      const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;

      const message =
        `[EMERGENCY ALERT]\n\n` +
        `I need immediate help.\n\n` +
        `My Live Location:\n${mapsLink}`;

      const whatsappURL =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      console.log("WHATSAPP URL:", whatsappURL);

      window.open(whatsappURL, "_blank");

      setIsSOSActive(true);

    } catch (err) {
      console.error("WhatsApp error:", err);
      alert("Failed to open WhatsApp");
    }
  };

  // ============================
  // START COUNTDOWN
  // ============================
  const handleSOSActivation = () => {
    setIsActivated(true);
    setCountdown(10);
    setIsCancelled(false);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          if (!isCancelled) {
            sendSOSAlert();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  // ============================
  // CANCEL SOS
  // ============================
  const handleCancel = () => {
    setIsActivated(false);
    setCountdown(0);
    setIsCancelled(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ============================
  // EDIT CONTACT
  // ============================
  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewName(contact.name);
    setNewPhone(contact.phone);
  };

  // ============================
  // SAVE CONTACT
  // ============================
  const handleSave = async () => {
    if (!editingContact) return;

    let cleanedPhone = newPhone.replace(/\D/g, "");

    // Allow only 10 digit Indian numbers
    if (cleanedPhone.length !== 10) {
      alert("Enter valid 10-digit mobile number");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5174/api/contacts/${editingContact._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName,
            phone: cleanedPhone,
          }),
        }
      );

      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === editingContact._id
              ? {
                  ...c,
                  name: newName,
                  phone: cleanedPhone,
                }
              : c
          )
        );

        setEditingContact(null);

        alert("Contact updated successfully");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // ============================
  // CANCEL EDIT
  // ============================
  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-center mb-6 text-red-600">
          Emergency SOS
        </h1>

        {/* CONTACT COUNT */}
        <p className="text-center text-gray-500 mb-6">
          Contacts Loaded: {contacts.length}
        </p>

        {/* SOS SECTION */}
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center mb-8">

          {!isActivated ? (
            <button
              onClick={handleSOSActivation}
              className="
                w-48 h-48
                bg-red-600
                hover:bg-red-700
                text-white
                rounded-full
                text-4xl
                font-bold
                shadow-2xl
                transition-all duration-300
              "
            >
              SOS
            </button>

          ) : countdown > 0 ? (
            <>
              <h2 className="text-6xl font-bold text-red-600 mb-6">
                {countdown}
              </h2>

              <button
                onClick={handleCancel}
                className="
                  px-6 py-3
                  bg-gray-700
                  hover:bg-gray-800
                  text-white
                  rounded-lg
                "
              >
                Cancel
              </button>
            </>
          ) : (
            <p className="text-green-600 text-2xl font-bold">
              SOS Activated
            </p>
          )}
        </div>

        {/* LOCATION */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Live Location
          </h2>

          {location ? (
            <>
              <p className="mb-2">
                Latitude: {location.lat}
              </p>

              <p className="mb-4">
                Longitude: {location.lng}
              </p>

              <a
                href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="
                  text-blue-600
                  underline
                  font-semibold
                "
              >
                Open in Google Maps
              </a>
            </>
          ) : (
            <p>Fetching location...</p>
          )}
        </div>

        {/* CONTACTS */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-6">
            Emergency Contacts
          </h2>

          {contacts.length ? (
            contacts.map((c) => (
              <div
                key={c._id}
                className="border p-4 rounded-xl mb-4"
              >
                {editingContact?._id === c._id ? (
                  <>
                    <input
                      value={newName}
                      onChange={(e) =>
                        setNewName(e.target.value)
                      }
                      placeholder="Name"
                      className="
                        border
                        p-2
                        mr-2
                        rounded
                      "
                    />

                    <input
                      value={newPhone}
                      onChange={(e) =>
                        setNewPhone(e.target.value)
                      }
                      placeholder="Phone Number"
                      className="
                        border
                        p-2
                        mr-2
                        rounded
                      "
                    />

                    <button
                      onClick={handleSave}
                      className="
                        bg-green-600
                        text-white
                        px-4 py-2
                        mr-2
                        rounded
                      "
                    >
                      Save
                    </button>

                    <button
                      onClick={handleCancelEdit}
                      className="
                        bg-gray-600
                        text-white
                        px-4 py-2
                        rounded
                      "
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-lg">
                      {c.name}
                    </p>

                    <p className="text-gray-700">
                      {c.phone}
                    </p>

                    <button
                      onClick={() => handleEdit(c)}
                      className="
                        mt-3
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        px-4 py-2
                        rounded
                      "
                    >
                      Edit
                    </button>
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