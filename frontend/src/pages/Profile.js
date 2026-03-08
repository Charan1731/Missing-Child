import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, Mail, Calendar, Trash2, Edit, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const { user, token } = useAuth();
  const [myChildren, setMyChildren] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("children");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [childrenRes, historyRes] = await Promise.all([
        axios.get(`${API}/user/my-children`, { headers }),
        axios.get(`${API}/user/search-history`, { headers }),
      ]);

      setMyChildren(childrenRes.data.children || []);
      setSearchHistory(historyRes.data.searches || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (childId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await axios.delete(`${API}/missing-child/${childId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Record deleted successfully");
      setMyChildren(myChildren.filter((child) => child.id !== childId));
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* User Info */}
        <div className="bg-white rounded-3xl border-2 border-stone-100 p-8 shadow-lg mb-8 animate-fade-in">
          <div className="flex items-center space-x-6">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-amber-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-amber-600" strokeWidth={2.5} />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 mb-2" data-testid="user-name">{user.name}</h1>
              <div className="flex items-center space-x-2 text-stone-600">
                <Mail className="w-4 h-4" />
                <span data-testid="user-email">{user.email}</span>
              </div>
              {user.oauth_provider && (
                <div className="mt-2 inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                  Connected via {user.oauth_provider}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl border-2 border-stone-100 shadow-lg overflow-hidden">
          <div className="border-b border-stone-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("children")}
                data-testid="tab-children"
                className={`flex-1 px-6 py-4 font-bold transition-colors ${
                  activeTab === "children"
                    ? "bg-amber-50 text-amber-600 border-b-2 border-amber-500"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                My Registered Children ({myChildren.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                data-testid="tab-history"
                className={`flex-1 px-6 py-4 font-bold transition-colors ${
                  activeTab === "history"
                    ? "bg-teal-50 text-teal-600 border-b-2 border-teal-500"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                Search History ({searchHistory.length})
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* My Children Tab */}
            {activeTab === "children" && (
              <div>
                {myChildren.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-children-message">
                    <UserIcon className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-600 text-lg">You haven't registered any missing children yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {myChildren.map((child) => (
                      <div
                        key={child.id}
                        className="bg-stone-50 rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-shadow"
                        data-testid={`child-card-${child.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-stone-900 mb-1">{child.name}</h3>
                            <p className="text-sm text-stone-600">
                              {child.age} years old • {child.gender}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(child.id)}
                            data-testid={`delete-child-${child.id}`}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {child.image_path && (
                          <img
                            src={`${API}/missing-child/image/${child.image_path}`}
                            alt={child.name}
                            className="w-full h-48 object-cover rounded-xl mb-4 border-2 border-stone-200"
                          />
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-stone-600">
                            <span className="font-semibold">Last seen:</span>
                            <span>{child.last_seen_location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-stone-600">
                            <span className="font-semibold">Contact:</span>
                            <span>{child.contact_number}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-stone-500">
                            <Calendar className="w-4 h-4" />
                            <span>Registered {formatDate(child.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search History Tab */}
            {activeTab === "history" && (
              <div>
                {searchHistory.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-history-message">
                    <Search className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-600 text-lg">You haven't performed any searches yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchHistory.map((search) => (
                      <div
                        key={search.id}
                        className="bg-stone-50 rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-shadow"
                        data-testid={`search-history-${search.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {search.match_found ? (
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-6 h-6 text-teal-600" />
                                  <span className="font-bold text-teal-700">Match Found</span>
                                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">
                                    {search.confidence}% Confidence
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <XCircle className="w-6 h-6 text-stone-500" />
                                  <span className="font-bold text-stone-700">No Match</span>
                                </div>
                              )}
                            </div>
                            
                            {search.matched_child && (
                              <div className="ml-8 p-4 bg-white rounded-xl border border-stone-200">
                                <p className="font-semibold text-stone-900">Matched Child:</p>
                                <p className="text-stone-700">{search.matched_child.name}</p>
                                <p className="text-sm text-stone-600">
                                  {search.matched_child.age} years • {search.matched_child.gender}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-xs text-stone-500">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(search.searched_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
