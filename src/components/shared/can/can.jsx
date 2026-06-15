import React from "react";

export const Can = ({ group, type, children }) => {
  let permissions = [];

  try {
    const authString = localStorage.getItem("authData");
    if (authString) {
      const authData = JSON.parse(authString);
      const data = authData?.user?.role;
      permissions = Array.isArray(data.permissions) ? data.permissions : [];
    }
  } catch (error) {
    console.error("Error parsing auth data:", error);
  }
  const hasPermission =
    Array.isArray(permissions) &&
    permissions.some(perm => perm.group === group && perm.type === type);

  return hasPermission ? children : null;
};
