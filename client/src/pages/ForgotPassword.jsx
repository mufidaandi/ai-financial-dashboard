import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import API from "../api";

function ForgotPassword() {
  const { login } = useContext(AuthContext);
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !newPassword || !confirmPassword) {
      error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("Passwords don't match.");
      return;
    }

    if (newPassword.length < 6) {
      error("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await API.post("/auth/forgot-password", {
        email,
        newPassword,
      });
      
      // Log the user in immediately with the new password
      login(res.data);
      success("Password reset successfully! You are now logged in.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Forgot password error:", err.response?.data || err);
      error(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-neutral-800 text-white border-none dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="border-none flex align-center flex-col w-2/3 mx-auto pt-6">
          <CardTitle className="text-center">Reset your password</CardTitle>
          <CardDescription className="text-center text-gray-400 dark:text-gray-300 mb-4 text-sm">
            Enter your email and new password to reset your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-m text-white dark:text-gray-200">
                Email Address
              </Label>
              <Input
                id="email"
                className="mt-1 bg-neutral-700 text-white dark:bg-gray-700 dark:text-gray-100"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-m text-white dark:text-gray-200">
                New Password
              </Label>
              <Input
                id="newPassword"
                className="mt-1 bg-neutral-700 text-white dark:bg-gray-700 dark:text-gray-100"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-m text-white dark:text-gray-200">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                className="mt-1 bg-neutral-700 text-white dark:bg-gray-700 dark:text-gray-100"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          
          <div className="mt-6">
            <Link to="/">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;