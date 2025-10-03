import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";

function Register() {
  const { login } = useContext(AuthContext);
  const { error } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/register", {
        name,
        email,
        password,
      });
      // Use AuthContext login function to update both context and localStorage
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);
      error("Registration failed. Try again.");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
  <Card className="w-full max-w-md bg-neutral-800 text-white dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="border-none flex align-center flex-col w-2/3 mx-auto pt-6">
          <CardTitle className="text-center">Create your account</CardTitle>
          <CardDescription className="text-center text-gray-400 dark:text-gray-300 mb-4">Enter your details to register and access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Label htmlFor="name" className="text-m text-white dark:text-gray-200">Name</Label>
            <Input
              className="mt-0 text-white placeholder:text-neutral-300 bg-neutral-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Label htmlFor="email" className="text-m text-white dark:text-gray-200">Email</Label>
            <Input
              className="mt-0 text-white placeholder:text-neutral-300 bg-neutral-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Label htmlFor="password" className="text-m text-white dark:text-gray-200">Password</Label>
            <Input
              className="mt-0 text-white placeholder:text-neutral-300 bg-neutral-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-4" variant="secondary">Register</Button>
          </form>
          <p className="text-center text-sm text-white dark:text-gray-300 mt-4">
            Already have an account?{" "}
            <a href="/" className="text-blue-400 dark:text-blue-300 hover:underline">
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
