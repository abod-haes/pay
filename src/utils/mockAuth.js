/**
 * Mock authentication data for development/testing purposes
 */

export const createMockAuthData = () => {
  const mockAuthData = {
    token: "mock-jwt-token-for-development",
    user: {
      id: 1,
      name: "مستخدم تجريبي",
      email: "test@example.com",
      role: "admin",
    },
    permissions: [
      // Branches permissions
      { group: "branches", type: "view" },
      { group: "branches", type: "store" },
      { group: "branches", type: "edit" },
      // { group: "branches", type: "delete" },
      { group: "users", type: "view" },
      { group: "users", type: "store" },
      { group: "users", type: "edit" },
      { group: "users", type: "delete" },
      { group: "permissions", type: "view" },
      { group: "permissions", type: "store" },
      { group: "permissions", type: "edit" },
      { group: "permissions", type: "delete" },
      { group: "employee", type: "view" },
      { group: "employee", type: "store" },
      { group: "employee", type: "edit" },
      { group: "employee", type: "delete" },
    ],
  };

  return mockAuthData;
};

/**
 * Set mock authentication data in localStorage
 */
export const setMockAuth = () => {
  const mockData = createMockAuthData();
  localStorage.setItem("authData", JSON.stringify(mockData));
  console.log("Mock authentication data set in localStorage");
  return mockData;
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem("authData");
  sessionStorage.removeItem("authData");
  console.log("Authentication data cleared");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const authData = localStorage.getItem("authData") || sessionStorage.getItem("authData");
  return !!authData;
};
