import axios from "axios";
import { API_BASE_URL } from "./domain";
import { showError } from "@/libs/react.toastify";
const ApiInstance = axios.create({
  baseURL: API_BASE_URL,
});

ApiInstance.interceptors.request.use(
  config => {
    let authData = localStorage.getItem("authData");
    const Branchid = localStorage.getItem("branch_id");
    const xx = JSON.parse(Branchid);

    if (!authData) {
      authData = sessionStorage.getItem("authData");
    }
    const lang = localStorage && localStorage.getItem("i18nextLng");
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        if (parsedAuth?.token) {
          config.headers.Authorization = `Bearer ${parsedAuth.token}`;
          const languageMap = {
            ar: "ar",
            en: "en",
            fa: "fa",
          };
          config.headers.lang = languageMap[lang] || "ar";
          if (Branchid) {
            config.headers["X-Branch-Id"] = xx?.id;
          }
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }

    return config;
  },
  error => Promise.reject(error)
);
export const setupInterceptors = (navigate, t) => {
  ApiInstance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      if (error.response && error.response.status === 500) {
        // navigate("/500");
        showError(t("common.500_error"));
        return;
      }
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("authData");
        sessionStorage.removeItem("authData");
        navigate("/", { replace: true });
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
};

export default ApiInstance;
