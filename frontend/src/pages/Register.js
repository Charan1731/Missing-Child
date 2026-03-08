import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Register = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    last_seen_location: "",
    contact_number: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      toast.error("Please upload a child's photo");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("age", formData.age);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("last_seen_location", formData.last_seen_location);
      formDataToSend.append("contact_number", formData.contact_number);
      formDataToSend.append("photo", photo);

      const response = await axios.post(
        `${API}/missing-child/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        toast.success("Child registered successfully!");
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: "",
            age: "",
            gender: "male",
            last_seen_location: "",
            contact_number: "",
          });
          setPhoto(null);
          setPhotoPreview(null);
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error registering child:", error);
      const errorMsg = error.response?.data?.detail || "Failed to register child. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-stone-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mb-4">
            Report Missing Child
          </h1>
          <p className="text-lg text-stone-600">
            Please provide accurate information to help us find your child.
          </p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-stone-100 p-8 md:p-12 shadow-lg animate-slide-up">
          {success ? (
            <div className="text-center py-12" data-testid="success-message">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-teal-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-3">Child Registered Successfully!</h2>
              <p className="text-stone-600">
                The information has been saved. We'll do our best to help find your child.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} data-testid="register-form">
              {/* Photo Upload */}
              <div className="mb-8">
                <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                  Child's Photo *
                </label>
                <div
                  {...getRootProps()}
                  className={`upload-zone rounded-xl p-12 text-center cursor-pointer ${
                    isDragActive ? "drag-active" : ""
                  }`}
                  data-testid="photo-dropzone"
                >
                  <input {...getInputProps()} />
                  {photoPreview ? (
                    <div>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-xl mx-auto mb-4 border-4 border-amber-200"
                      />
                      <p className="text-stone-600 font-medium">Click or drag to change photo</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-16 h-16 text-stone-400 mx-auto mb-4" strokeWidth={2} />
                      <p className="text-lg font-semibold text-stone-700 mb-2">
                        Drop child's photo here
                      </p>
                      <p className="text-stone-500">or click to browse</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                    Child's Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    data-testid="input-name"
                    className="w-full h-14 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl px-4 text-lg transition-all placeholder:text-stone-400"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    max="18"
                    data-testid="input-age"
                    className="w-full h-14 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl px-4 text-lg transition-all placeholder:text-stone-400"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    data-testid="input-gender"
                    className="w-full h-14 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl px-4 text-lg transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                    data-testid="input-contact"
                    className="w-full h-14 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl px-4 text-lg transition-all placeholder:text-stone-400"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block uppercase tracking-widest text-xs font-bold text-stone-500 mb-3">
                  Last Seen Location *
                </label>
                <input
                  type="text"
                  name="last_seen_location"
                  value={formData.last_seen_location}
                  onChange={handleChange}
                  required
                  data-testid="input-location"
                  className="w-full h-14 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl px-4 text-lg transition-all placeholder:text-stone-400"
                  placeholder="Enter last seen location"
                />
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-sm text-amber-800">
                  Please ensure the photo clearly shows the child's face. Our AI system requires clear facial features for accurate matching.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="submit-button"
                className="w-full mt-8 h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register Missing Child</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
