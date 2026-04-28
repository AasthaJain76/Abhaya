const API_URL = "http://localhost:5174/api/sos";

export const sendSOS = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);

  return JSON.parse(text);
};