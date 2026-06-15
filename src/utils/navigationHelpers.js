/**
 * Get the appropriate translation key for the current path
 * @param {string} pathname - The current pathname
 * @param {function} t - Translation function
 * @returns {string} - The translated breadcrumb text
 */
export const getPageTitle = (pathname, t) => {
  // Handle root path
  if (pathname === "/homepage") {
    return t("sidebar.home");
  }
  if (pathname.includes("/patient-details/")) {
    return t("sidebar.Patient-details");
  }

  // Handle branches routes
  if (pathname.startsWith("/branches")) {
    // Branch details page (e.g., /branches/123)
    if (pathname.match(/^\/branches\/\d+$/)) {
      return t("branches.branches");
    }

    // Add branch page
    if (pathname === "/branches/add") {
      return t("branches.branches");
    }

    // Main branches page
    if (pathname === "/branches") {
      return t("branches.branches");
    }
  }

  // Handle sponsors routes
  if (pathname.startsWith("/sponsors")) {
    // Main sponsors page
    if (pathname === "/sponsors") {
      return t("sponsors.sponsors");
    }
  }

  // Handle other routes
  const pathSegments = pathname.split("/").filter(Boolean);
  const mainPath = pathSegments[0];
  // Try to get translation from sidebar first
  const sidebarKey = `sidebar.${mainPath}`;
  if (t(sidebarKey) !== sidebarKey) {
    return t(sidebarKey);
  }

  // Fallback to the path itself (capitalized)
  return mainPath ? mainPath.charAt(0).toUpperCase() + mainPath.slice(1) : "";
};

/**
 * Get breadcrumb navigation for the current path
 * @param {string} pathname - The current pathname
 * @param {function} t - Translation function
 * @returns {Array} - Array of breadcrumb items
 */
export const getBreadcrumbs = (pathname, t) => {
  const breadcrumbs = [{ text: t("common.dashboard"), path: "/" }];

  if (pathname === "/") {
    return breadcrumbs;
  }

  // Handle branches routes
  if (pathname.startsWith("/branches")) {
    breadcrumbs.push({ text: t("branches.branches"), path: "/branches" });

    // Branch details page
    if (pathname.match(/^\/branches\/\d+$/)) {
      breadcrumbs.push({ text: t("branches.branch-details"), path: pathname });
    }

    // Add branch page
    if (pathname === "/branches/add") {
      breadcrumbs.push({ text: t("branches.add-branch"), path: pathname });
    }

    // Edit branch page
    if (pathname.match(/^\/branches\/\d+\/edit$/)) {
      breadcrumbs.push({ text: t("branches.edit-branch"), path: pathname });
    }
  }

  return breadcrumbs;
};
