// src/context/AppContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

type Location = {
  lat: number;
  lng: number;
};

export type Contact = {
  _id?: string; // MongoDB ID
  userId: string;
  name: string;
  phone: string;
  status?: string;
};

type AppContextType = {
  isSOSActive: boolean;
  setIsSOSActive: (active: boolean) => void;
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;
  location: Location | null;
  setLocation: (loc: Location | null) => void;

  // ✅ Contacts
  contacts: Contact[];
  fetchContacts: (userId: string) => Promise<void>;
  addContact: (contact: Omit<Contact, "_id">) => Promise<void>;
  updateContact: (id: string, updated: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Backend API URL
const API_URL = "http://localhost:5174/api/contacts";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // ✅ Fetch contacts by userId
  const fetchContacts = async (userId: string) => {
    try {
      const res = await axios.get(`${API_URL}/${userId}`);
      setContacts(res.data as Contact[]);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  // ✅ Add new contact (refetch after save)
  const addContact = async (contact: Omit<Contact, "_id">) => {
    try {
      await axios.post(API_URL, contact);
      // Always re-fetch to keep contacts list in sync
      await fetchContacts(contact.userId);
    } catch (err) {
      console.error("Error adding contact:", err);
    }
  };

  // ✅ Update existing contact
  const updateContact = async (id: string, updated: Partial<Contact>) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, updated);
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? (res.data as Contact) : c))
      );
    } catch (err) {
      console.error("Error updating contact:", err);
    }
  };

  // ✅ Delete contact
  const deleteContact = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  // ✅ Auto-fetch live location when tracking is enabled
  useEffect(() => {
    let watchId: number;

    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);

  return (
    <AppContext.Provider
      value={{
        isSOSActive,
        setIsSOSActive,
        isTracking,
        setIsTracking,
        location,
        setLocation,
        contacts,
        fetchContacts,
        addContact,
        updateContact,
        deleteContact,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used inside AppProvider");
  return context;
};
