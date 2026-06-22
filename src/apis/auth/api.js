import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const login = async payload => {
  const { data } = await ApiInstance.post(ROUTES.LOGIN, payload);
  return data;
};

const checkEmail = async payload => {
  const { data } = await ApiInstance.post(ROUTES.CHECK_EMAIL, payload);
  return data;
};

const logout = async () => {
  const { data } = await ApiInstance.post(ROUTES.LOGOUT);
  return data;
};

const Me = async () => {
  const { data } = await ApiInstance.get(ROUTES.ME);
  return data;
};

export const AuthApis = { login, checkEmail, Me, logout };
