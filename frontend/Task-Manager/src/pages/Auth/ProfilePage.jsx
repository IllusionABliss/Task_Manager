import React, { useContext, useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { UserContext } from "../../context/userContext";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout"
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const {user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", profileImage: null });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, password: "", profileImage: null });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      setFormData({ ...formData, profileImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("password", formData.password);
    if (formData.profileImage) {
      form.append("profileImage", formData.profileImage);
    }

    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      updateUser(res.data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  return (
    <DashboardLayout activeMenu="My Profile">
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">Full Name</label>
            <input 
              id="name"
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your name" 
              className="w-full border p-2 rounded" 
              required 
            />
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="p-2 border rounded bg-gray-100 text-gray-700">{formData.email}</div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">New Password (Optional)</label>
            <input 
              id="password"
              type="password" 
              name="password" 
              onChange={handleChange} 
              placeholder="Enter new password (optional)" 
              className="w-full border p-2 rounded" 
            />
          </div>

          {/* File Upload Field */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Profile Image
            </label>
            <div className="flex w-full items-center gap-3 border border-gray-300 rounded px-3 py-2 bg-gray-50">
              <input
                id="profileImage"
                type="file"
                name="profileImage"
                onChange={handleChange}
                accept="image/*"
                className="file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-sm file:font-semibold
                          file:bg-white file:text-gray-700
                          hover:file:bg-gray-100
                          w-full text-sm text-gray-500"
              />
            </div>
          </div>


          {/* Submit Button */}
          <button 
            type="submit" 
            className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>

          {/* Change Password Button */}
          <button 
            type="button"
            onClick={() => navigate("/change-password")}
            className="bg-slate-600 text-white py-2 px-4 rounded hover:bg-slate-700"
          >
            Change Password
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
