import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import API from "../api";

function ResetPassword() {
  const { success, error } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      error("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post("/auth/reset-password", {
        token,
        password,
      });
      
      success("Password reset successfully!");
      setIsReset(true);
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err);
      error(err.response?.data?.message || "Failed to reset password. Please try again.");
      if (err.response?.status === 400) {
        setIsValidToken(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-neutral-800 text-white border-none dark:bg-gray-800 dark:text-gray-100">
          <CardHeader className="border-none flex align-center flex-col w-2/3 mx-auto pt-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center text-gray-400 dark:text-gray-300 mb-4 text-sm">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 dark:text-gray-300 text-center">
                Please request a new password reset link.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
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

  if (isReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-neutral-800 text-white border-none dark:bg-gray-800 dark:text-gray-100">
          <CardHeader className="border-none flex align-center flex-col w-2/3 mx-auto pt-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" />
            </div>
            <CardTitle className="text-center">Password Reset Successfully</CardTitle>
            <CardDescription className="text-center text-gray-400 dark:text-gray-300 mb-4 text-sm">
              Your password has been reset. You can now login with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-neutral-800 text-white border-none dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="border-none flex align-center flex-col w-2/3 mx-auto pt-6">
          <CardTitle className="text-center">Reset your password</CardTitle>
          <CardDescription className="text-center text-gray-400 dark:text-gray-300 mb-4 text-sm">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-m text-white dark:text-gray-200">
                New Password
              </Label>
              <Input
                id="password"
                className="mt-1 bg-neutral-700 text-white dark:bg-gray-700 dark:text-gray-100"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

export default ResetPassword;