import { useEffect, useState, useContext } from "react";
import { User, Lock, Globe, Save, Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import userService from "../services/userService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CustomSelect, CustomSelectItem } from "../components/ui/custom-select";

function Settings() {
  const { user, setUser } = useContext(AuthContext);
  const { updateSettings, COUNTRIES } = useSettings();
  const { success, error } = useToast();
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: ""
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Regional settings state
  const [regionalForm, setRegionalForm] = useState({
    country: "US",
    currency: "USD"
  });
  
  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false,
    regional: false
  });
  
  useEffect(() => {
    if (user) {
      // Handle nested user structure
      const actualUser = user.user || user;
      setProfileForm({
        name: actualUser.name || "",
        email: actualUser.email || ""
      });
      setRegionalForm({
        country: actualUser.country || "US",
        currency: actualUser.currency || "USD"
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleRegionalChange = (field, value) => {
    if (field === "country") {
      const selectedCountry = COUNTRIES.find(c => c.code === value);
      setRegionalForm({
        country: value,
        currency: selectedCountry?.currency || "USD"
      });
    } else {
      setRegionalForm({ ...regionalForm, [field]: value });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      error("Please fill in all fields");
      return;
    }

    setIsLoading({ ...isLoading, profile: true });
    try {
      const response = await userService.updateProfile(profileForm);
      
      // Handle the response structure - the API returns { user: {...} }
      const userData = response.user || response;
      
      // Update context with new user data, preserving existing structure
      let updatedUser;
      if (user.user) {
        // Nested structure
        updatedUser = {
          ...user,
          user: {
            ...user.user,
            name: userData.name,
            email: userData.email,
            country: userData.country,
            currency: userData.currency
          }
        };
      } else {
        // Flat structure
        updatedUser = {
          ...user,
          name: userData.name,
          email: userData.email,
          country: userData.country,
          currency: userData.currency
        };
      }
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      console.error("Error details:", err.response?.data);
      error(err.response?.data?.message || "Error updating profile");
    } finally {
      setIsLoading({ ...isLoading, profile: false });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      error("New password must be at least 6 characters long");
      return;
    }

    setIsLoading({ ...isLoading, password: true });
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      success("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      error(err.response?.data?.message || "Error updating password");
    } finally {
      setIsLoading({ ...isLoading, password: false });
    }
  };

  const handleRegionalUpdate = async (e) => {
    e.preventDefault();
    
    setIsLoading({ ...isLoading, regional: true });
    try {
      const response = await userService.updateProfile(regionalForm);
      
      // Handle the response structure - the API returns { user: {...} }
      const userData = response.user || response;
      
      // Update context with new user data, preserving existing structure  
      let updatedUser;
      if (user.user) {
        // Nested structure
        updatedUser = {
          ...user,
          user: {
            ...user.user,
            country: userData.country,
            currency: userData.currency
          }
        };
      } else {
        // Flat structure
        updatedUser = {
          ...user,
          country: userData.country,
          currency: userData.currency
        };
      }
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update Settings Context
      updateSettings({
        country: regionalForm.country,
        currency: regionalForm.currency
      });
      
      success("Regional settings updated successfully!");
    } catch (err) {
      console.error("Error updating regional settings:", err);
      console.error("Error details:", err.response?.data);
      error(err.response?.data?.message || "Error updating regional settings");
    } finally {
      setIsLoading({ ...isLoading, regional: false });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-gray-100 mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold dark:text-gray-100">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading.profile}
              className="w-full flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading.profile ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold dark:text-gray-100">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading.password}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {isLoading.password ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </div>

        {/* Regional Settings Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-green-700 dark:text-green-400" />
            <h2 className="text-xl font-semibold dark:text-gray-100">Regional Settings</h2>
          </div>
          
          <form onSubmit={handleRegionalUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Country/Region <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={regionalForm.country}
                onValueChange={(value) => handleRegionalChange("country", value)}
                placeholder="Select country"
              >
                {COUNTRIES.map(country => (
                  <CustomSelectItem key={country.code} value={country.code}>
                    {country.name}
                  </CustomSelectItem>
                ))}
              </CustomSelect>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Currency <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={regionalForm.currency}
                onValueChange={(value) => handleRegionalChange("currency", value)}
                placeholder="Select currency"
              >
                {COUNTRIES.map(country => (
                  <CustomSelectItem key={country.currency} value={country.currency}>
                    {country.currency} ({country.symbol})
                  </CustomSelectItem>
                ))}
              </CustomSelect>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Selected: {COUNTRIES.find(c => c.currency === regionalForm.currency)?.symbol} ({regionalForm.currency})
              </p>
            </div>
            
            <div className="md:col-span-2">
              <Button 
                type="submit" 
                disabled={isLoading.regional}
                className="flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading.regional ? "Updating..." : "Update Regional Settings"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;