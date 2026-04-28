import { useState } from "react";
import { loginUser, signupUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        email: formData.emailOrMobile,
        password: formData.password,
        name: "User",
      };

      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          setLoading(false);
          return;
        }

        const res = await signupUser(payload);

        if (!res?.token) {
          alert(res?.message || "Signup failed");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId); // ✅ ADD THIS
        navigate("/dashboard");
      } else {
        const res = await loginUser(payload);

        if (!res?.token) {
          alert(res?.message || "Login failed");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId); // 🔥 ADD THIS
        navigate("/dashboard");
      }

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-gray-200">
      
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transition-all">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <input
            type="text"
            name="emailOrMobile"
            placeholder="Email"
            value={formData.emailOrMobile}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            required
          />

          {/* Confirm Password */}
          {isSignup && (
            <>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />

              {/* Password rules */}
              <ul className="text-xs text-gray-500 ml-4 list-disc">
                <li>Minimum 8 characters</li>
                <li>Uppercase + lowercase</li>
                <li>At least 1 number</li>
                <li>At least 1 special character</li>
              </ul>
            </>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center mt-5 text-gray-600">
          {isSignup ? "Already have an account?" : "New user?"}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-purple-600 ml-2 font-semibold hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

      </div>
    </div>
  );
}