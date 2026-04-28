const API_URL = "http://localhost:5174/api/auth";

export const loginUser = async (data: any) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Login failed");
  }

  return text ? JSON.parse(text) : {};
};

export const signupUser = async (data: any) => {
  const res = await fetch(`${API_URL}/signup`, { // ✅ FIXED
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Signup failed");
  }

  return text ? JSON.parse(text) : {};
};