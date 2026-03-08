import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);

      if (response.data.success) {
        login(response.data.access_token, response.data.user);
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.detail || "Login failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${API}/auth/google`, {
        credential: credentialResponse.credential,
      });

      if (response.data.success) {
        login(response.data.access_token, response.data.user);
        toast.success("Logged in with Google successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen py-12 bg-stone-50">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mb-4">
              Welcome Back
            </h1>
            <p className="text-lg text-stone-600">
              Sign in to access your account
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-stone-100 p-8 shadow-lg animate-slide-up">
            {GOOGLE_CLIENT_ID && (
              <div className="mb-6">
                <div className="flex justify-center" data-testid="google-login-button">
                  {/* REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH */}
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-stone-500 font-medium">Or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            {!GOOGLE_CLIENT_ID && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Google OAuth is not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to your environment variables.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} data-testid="login-form">
              <div className="mb-6">
                <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="input-email"
                    className="w-full h-14 pl-12 pr-4 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl text-lg transition-all placeholder:text-stone-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    data-testid="input-password"
                    className="w-full h-14 pl-12 pr-4 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl text-lg transition-all placeholder:text-stone-400"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-stone-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-amber-600 font-semibold hover:text-amber-700" data-testid="signup-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
