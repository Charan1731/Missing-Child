import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Search as SearchIcon, Loader2, CheckCircle2, XCircle, Phone, MapPin, Calendar, User } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Search = () => {
  const { token } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setSearchResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const handleSearch = async () => {
    if (!photo) {
      toast.error("Please upload a photo to search");
      return;
    }

    setLoading(true);
    setSearchResult(null);

    try {
      const formData = new FormData();
      formData.append("photo", photo);

      const response = await axios.post(`${API}/missing-child/search`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      setSearchResult(response.data);

      if (response.data.match_found) {
        toast.success(`Match found! Confidence: ${response.data.confidence}%`);
      } else {
        toast.info("No match found in our database");
      }
    } catch (error) {
      console.error("Error searching:", error);
      const errorMsg = error.response?.data?.detail || "Failed to search. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-stone-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mb-4">
            Search for Missing Child
          </h1>
          <p className="text-lg text-stone-600">
            Upload a photo of a child you've seen. Our AI will check if they match any missing child reports.
          </p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-stone-100 p-8 md:p-12 shadow-lg animate-slide-up">
          {/* Photo Upload */}
          <div className="mb-8">
            <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
              Upload Photo
            </label>
            <div
              {...getRootProps()}
              className={`upload-zone rounded-xl p-12 text-center cursor-pointer ${
                isDragActive ? "drag-active" : ""
              }`}
              data-testid="search-dropzone"
            >
              <input {...getInputProps()} />
              {photoPreview ? (
                <div>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-xl mx-auto mb-4 border-4 border-teal-200"
                  />
                  <p className="text-stone-600 font-medium">Click or drag to change photo</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 text-stone-400 mx-auto mb-4" strokeWidth={2} />
                  <p className="text-lg font-semibold text-stone-700 mb-2">
                    Drop photo here
                  </p>
                  <p className="text-stone-500">or click to browse</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !photo}
            data-testid="search-button"
            className="w-full h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5" strokeWidth={2.5} />
                <span>Search Database</span>
              </>
            )}
          </button>

          {/* Results */}
          {searchResult && (
            <div className="mt-12 animate-fade-in" data-testid="search-results">
              {searchResult.match_found ? (
                <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-center text-stone-900 mb-2" data-testid="match-found-title">
                    Match Found!
                  </h2>
                  
                  <div className="text-center mb-6">
                    <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-bold" data-testid="confidence-badge">
                      {searchResult.confidence}% Confidence
                    </span>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="mb-8">
                    <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="confidence-bar h-full"
                        style={{ width: `${searchResult.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Child Details */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl">
                      <User className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Name</p>
                        <p className="text-lg font-semibold text-stone-900" data-testid="child-name">{searchResult.child_data.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-xl">
                        <Calendar className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Age</p>
                          <p className="text-lg font-semibold text-stone-900" data-testid="child-age">{searchResult.child_data.age}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-xl">
                        <User className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Gender</p>
                          <p className="text-lg font-semibold text-stone-900 capitalize" data-testid="child-gender">{searchResult.child_data.gender}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl">
                      <MapPin className="w-5 h-5 text-stone-500 mt-1" strokeWidth={2.5} />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Last Seen</p>
                        <p className="text-lg font-semibold text-stone-900" data-testid="child-location">{searchResult.child_data.last_seen_location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl">
                      <Phone className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Contact</p>
                        <p className="text-lg font-semibold text-stone-900" data-testid="child-contact">{searchResult.child_data.contact_number}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white border-2 border-teal-300 rounded-xl">
                    <p className="text-sm text-stone-700 font-medium text-center">
                      Please contact the above number immediately or notify local authorities.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-100 border-2 border-stone-200 rounded-2xl p-8 text-center" data-testid="no-match-result">
                  <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-stone-500" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-3">No Match Found</h2>
                  <p className="text-stone-600 mb-6">
                    This child doesn't match any records in our database.
                  </p>
                  <p className="text-sm text-stone-600">
                    If you believe this child is missing or in distress, please contact local authorities immediately.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
