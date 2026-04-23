import { renderToStaticMarkup } from "react-dom/server";

const BASE_URL = import.meta.env.BASE_URL;

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const token = localStorage.getItem("token");

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  try {
    console.log(endpoint)
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Intentamos obtener el mensaje de error del servidor si existe
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error("API Utility Error:", error);
    throw error;
  }
};