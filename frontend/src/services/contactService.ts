const API_URL = "http://localhost:5174/api/contacts";

export const addContact = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getContacts = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};