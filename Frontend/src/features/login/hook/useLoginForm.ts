/** @format */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthenticationService } from "../service/LoginService";
import { components } from "@/types/api";

export type TLoginRequest = components["schemas"]["LoginRequest"];
export type TLoginResponse = components["schemas"]["LoginResponse"];

export function useLoginForm() {
  const [userData, setUserData] = useState<TLoginRequest>({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const Login = async (credencials: TLoginRequest) => {
    setError("");
    setLoading(true);
    try {
      const data = await AuthenticationService.login(credencials);

      login(data.access_token);
      navigate("/");
      return data;
    } catch (err: any) {
      const errorMessage = err.message || "Invalid email or password";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, Login, userData, setUserData, setError };
}
