import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { User, Mail, Lock, Save } from "lucide-react";
import API from "../api";

function Profile() {
  const { user, login } = useContext(AuthContext);
  const { success, error } = useToast();
  
  // Get user data from AuthContext - handle nested structure
  const actualUser = user?.user || user;
  const [name, setName] = useState(actualUser?.name || "");
  const [email, setEmail] = useState(actualUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await API.put("/auth/profile", {
        name,
        email,
      });
      
      // Update the context with new user data
      login(response.data);
      success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      error("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await API.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      
      success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password change error:", err);
      error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                <Save size={16} className="mr-2" />
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                <Lock size={16} className="mr-2" />
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information Display */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account ID
              </Label>
              <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                {actualUser?.id || actualUser?._id || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Member Since
              </Label>
              <p className="text-gray-900 dark:text-gray-100">
                {actualUser?.createdAt 
                  ? new Date(actualUser.createdAt).toLocaleDateString()
                  : "N/A"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;