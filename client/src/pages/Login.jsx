import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import API from "../api";

function Login() {
  const { login } = useContext(AuthContext);
  const { error } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // Use AuthContext login function to update both context and localStorage
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-200 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-neutral-800 text-white border-none dark:bg-gray-800 dark:text-gray-100">
        <div className="flex justify-center p-6 pb-0 max-w-xs mx-auto">
          <img src="/dark-mode.png" alt="Dark Mode" />
        </div>
        <CardHeader className="border-none flex align-center flex-col w-2/3 mx-auto pt-6">
          <CardTitle className="text-center">Login to your account</CardTitle>
          <CardDescription className="text-center text-gray-400 dark:text-gray-300 mb-4 text-sm">Enter your email and password to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400 dark:text-gray-300 text-center mb-4">Test credentials: admin@test.com / admin</div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Label htmlFor="email" className="text-m text-white dark:text-gray-200">Email</Label>
            <Input
              className="mt-0 bg-neutral-700 text-white dark:bg-gray-700 dark:text-gray-100"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-row justify-between items-center">
              <Label htmlFor="password" className="text-m text-white dark:text-gray-200">Password</Label>

              <p className="text-center text-sm text-white dark:text-gray-300">
                <a href="/forgot-password" className="text-blue-400 dark:text-blue-300 hover:underline">
                  Forgot Password?
                </a>
              </p>
            </div>
            <Input
              className="mt-0 bg-neutral-700 text-white dark:bg-gray-700 dark:text-gray-100"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-4">Login</Button>
          </form>
          <p className="text-center text-sm text-white dark:text-gray-300 mt-4">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-400 dark:text-blue-300 hover:underline">
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
