import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, UserPlus, Search, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3" data-testid="nav-home-link">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-stone-900">ChildFinder</h1>
              <p className="text-xs text-stone-500 font-medium">Reuniting Families</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  data-testid="nav-register-link"
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    isActive("/register")
                      ? "bg-amber-100 text-amber-700"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <UserPlus className="w-4 h-4" strokeWidth={2.5} />
                  <span>Register</span>
                </Link>
                <Link
                  to="/search"
                  data-testid="nav-search-link"
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    isActive("/search")
                      ? "bg-teal-100 text-teal-700"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Search className="w-4 h-4" strokeWidth={2.5} />
                  <span>Search</span>
                </Link>
                <Link
                  to="/profile"
                  data-testid="nav-profile-link"
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    isActive("/profile")
                      ? "bg-stone-200 text-stone-900"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <User className="w-4 h-4" strokeWidth={2.5} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  data-testid="nav-logout-button"
                  className="px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-link"
                  className="px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-stone-600 hover:bg-stone-100"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.5} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  data-testid="nav-signup-link"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
