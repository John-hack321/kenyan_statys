"use client";

import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import { useRouter } from "expo-router";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { refreshAccessToken } from "@/api/auth";
import { useUserStore } from "@/app_state/user_store";
import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.backendBaseUrl || "http://localhost:8000";

export type User = {
  id: number;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  signup: (
    email: string,
    phone: string,
    first_legal_name: string,
    last_legal_name: string,
    id_number: string,
    date_of_birth: Date,
    password: string,
  ) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const resetUser = useUserStore((state) => state.resetUser);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const payload = JSON.parse(atob(token.split(".")[1]));

          if (payload.exp * 1000 > Date.now()) {
            setUser({
              id: payload.id,
              email: payload.sub,
            });
          } else {
            await SecureStore.deleteItemAsync("access_token");
            delete axios.defaults.headers.common["Authorization"];
            resetUser();
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        await SecureStore.deleteItemAsync("access_token");
        delete axios.defaults.headers.common["Authorization"];
        resetUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshAccessToken();
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const signup = async (
    email: string,
    phone: string,
    first_legal_name: string,
    last_legal_name: string,
    id_number: string,
    date_of_birth: Date,
    password: string,
  ) => {
    try {
      const payload = { email , phone , first_legal_name, last_legal_name, national_id_number: id_number, date_of_birth, password };

      console.log(
        `payload constructed with data ${payload} now awaiting forwarding to the respective endpoint`,
      );

      const response = await axios.post(`${API_BASE_URL}/auth/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log(
        `the payload has been sent successfuly , now awaiting access token from the backend`,
      );

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      console.log(`the access token has been received`);

      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      await SecureStore.setItemAsync("access_token", accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync("refresh_token", refreshToken);
      }

      const payloadDecoded = JSON.parse(atob(accessToken.split(".")[1]));

      setUser({
        id: payloadDecoded.id,
        email: payloadDecoded.sub,
      });

      router.push("/"); // will swap with the correct path later on .
    } catch (error) {
      console.error("there was an error signing you up", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log(
        `the login function has been fired with username as : ${email} and password as ${password}`, // in future the usrname can either be the phone number or the email
      );
      const formData = new FormData();
      formData.append("password", password);
      formData.append("username", email);  // our backend being a oauth2 backend we have to send the email as a username to avoid conflict.

      console.log("Sending login request with email and password");
      const response = await axios.post(
        `${API_BASE_URL}/auth/token`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        },
      );

      console.log(
        `the backeng login functin has been reaches and it has returned the following login data`,
        response.data,
      );

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      console.log("Access token:", accessToken);
      console.log("Refresh token:", refreshToken);

      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      console.log(`the access token has been set to axio headers successfuly`);

      await SecureStore.setItemAsync("access_token", accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync("refresh_token", refreshToken);
      }

      const payload = JSON.parse(atob(accessToken.split(".")[1]));

      const userData: User = {
        id: parseFloat(payload.id),
        email: String(payload.sub),
      };

      setUser(userData);
      console.log(
        `the user store has been updated with the data gotten from the api`,
      );

      router.push("/"); // will swap with the right path later once its built
      console.log("now pushing the user to the home page hopefuly");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      if (accessToken) {
        /* for now there still no need of doing the api call to the backend
        await axios.post(`${API_BASE_URL}/auth/logout`, null, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        */
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      resetUser();
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      delete axios.defaults.headers.common["Authorization"];
      router.push("/sign-in");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
