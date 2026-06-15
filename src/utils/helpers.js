import {
  bondPayloadConfig,
  BondTypes,
  bondValidationConfig,
  PERMISSION_ACTION,
  PERMISSION_GROUP,
} from "@/constants/constants";
import { showError, showSuccess } from "@libs/react.toastify";
import * as yup from "yup";

/* eslint-disable curly */
export const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

export function formatDate(value, format = "DD/MM/YYYY") {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "-";
  }

  // replace all "-" with "/"
  const replaceDashWithSlash = str => str.replace(/-/g, "/");

  if (format === "MM/DD/YYYY") {
    return new Intl.DateTimeFormat("en-US").format(date);
  }
  if (format === "DD/MM/YYYY") {
    return new Intl.DateTimeFormat("en-GB").format(date);
  }
  if (format === "YYYY/MM/DD") {
    return replaceDashWithSlash(date.toISOString().slice(0, 10));
  }
  // Fallback: use locale string and replace "-" with "/"
  return replaceDashWithSlash(date.toLocaleDateString());
}

export function calculateEndDate(startDate, no_of_weeks) {
  // Validate startDate
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    return "-";
  }

  // Validate no_of_weeks
  if (typeof no_of_weeks !== "number" || !Number.isInteger(no_of_weeks) || no_of_weeks < 1) {
    return "-";
  }

  // Add (no_of_weeks * 7 - 1) days to include the start date in the count
  date.setDate(date.getDate() + (no_of_weeks * 7 - 1));

  // Format as YYYY-MM-DD (handles month/year rollovers, leap years, etc.)
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });
  const day = String(date.getDate());

  return `${day} ${month}, ${year}`;
}

//  2023-05-10 => "Joined on Wednesday, May 10th 2023"
export function formatJoinDate(dateString) {
  const date = new Date(dateString);

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const formatted = date.toLocaleDateString("en-US", options);

  const day = date.getDate();
  const suffix = getDaySuffix(day);

  // Replace the numeric day with day + suffix (e.g., 10 → 10th)
  const withSuffix = formatted.replace(/\d+/, `${day}${suffix}`);

  return `Joined on ${withSuffix}`;
}
function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function toggleItemInArray(array, item) {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item]; // add
  } else {
    return array.filter((_, i) => i !== index); // remove
  }
}

export function addIfNotExists(array, item) {
  if (!array.includes(item)) {
    return [...array, item];
  }
  return array;
}

export function removeIfExists(array, item) {
  return array.filter(i => i !== item);
}

export function isExistInsideArray(array, item, conditionFn) {
  if (!Array.isArray(array)) return false;

  const isSelected = array.some(selectedItem => {
    if (typeof conditionFn === "function") {
      return conditionFn(selectedItem, item); // use parent condition
    }
    // default condition: compare by `id`
    return selectedItem.id === item.id;
  });

  return isSelected;
}

export function findItemInArray(array, targetItem, conditionFn) {
  if (!Array.isArray(array)) return null;

  return (
    array.find(item => {
      if (typeof conditionFn === "function") {
        return conditionFn(item, targetItem);
      }
      // Default condition: compare by id
      return item.id === targetItem.id;
    }) || null
  );
}

export const formatTime = timeInSeconds => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const formatFileSize = size => {
  if (size < 1024) return `${size} bytes`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  else return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export const mergedRefs = (...refs) => {
  return node => {
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    });
  };
};

export const Permissions = {
  BRANCHES: "branches",
  USERS: "users",
  VOUCHERS: "vouchers",
  EMPLOYEES: "employee",
  SALARY: "salary",
  DELAYED: "delayed",
  PATIENT: "patient",
  COMPLAINTS: "complaints",
  HAIR: "hair",
  INJECTIONS: "injections",
  BOOKING_BOND: "booking_bond",
};
export const subPermissions = {
  VIEW: "view",
  STORE: "store",
  EDIT: "edit",
  DELETE: "delete",
  PAY: "pay",
};

export const getDataFromResponse = response => {
  return response?.data;
};

export function truncateText({ text, maxLength, maxLengthPercent = 0.2 }) {
  if (typeof text !== "string") return "";

  let finalMaxLength = maxLength;
  if (
    typeof maxLengthPercent === "number" &&
    maxLengthPercent > 0 &&
    typeof window !== "undefined"
  ) {
    const screenWidth = window.innerWidth;
    const avgCharWidth = 10;
    finalMaxLength = Math.floor((screenWidth * maxLengthPercent) / avgCharWidth);
  }

  if (text.length <= finalMaxLength) return text;
  return `${text.slice(0, finalMaxLength)}...`;
}

// export function formatDateOrTime({ input, type = "date" }) {
//   const date = new Date(input);

//   if (type === "date") {
//     // Returns YYYY-MM-DD in local time
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   } else if (type === "time") {
//     // Returns HH:MM in 24-hour format (local time)
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     return `${hours}:${minutes}`;
//   } else {
//     throw new Error("Invalid type. Use 'date' or 'time'.");
//   }
// }

// export function formatDateOrTime({ input, type = "date" }) {
//   // إذا لم تكن القيمة قابلة للتحويل إلى تاريخ صالح
//   const date = new Date(input);
//   if (isNaN(date.getTime())) {
//     return input; // تجاهلها وأعدها كما هي
//   }

//   if (type === "date") {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   } else if (type === "time") {
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     return `${hours}:${minutes}`;
//   } else {
//     throw new Error("Invalid type. Use 'date' or 'time'.");
//   }
// }
export function formatDateOrTime({ input, type = "date" }) {
  if (typeof input === "string") {
    // إذا كانت الصيغة على شكل DD/MM/YYYY نحولها إلى YYYY-MM-DD
    const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      input = `${year}-${month}-${day}`;
    }
  }

  const date = new Date(input);

  // إذا لم تكن القيمة قابلة للتحويل إلى تاريخ صالح
  if (isNaN(date.getTime())) {
    return input; // تجاهلها وأعدها كما هي
  }

  if (type === "date") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } else if (type === "time") {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } else {
    throw new Error("Invalid type. Use 'date' or 'time'.");
  }
}

export const showResponse = async ({ api }) => {
  const response = await api();
  showSuccess({ message: response.message });
  return response;
};

export const handleBackendErrors = ({ error, setError, removeRedirect = true }) => {
  if (error?.response) {
    if (error.response.status === 403) {
      if (removeRedirect) {
        window.location.href = "/homePage";
      }
    }
    const errorData = error.response.data;

    // Handle field-specific errors
    if (errorData.errors && Object.keys(errorData.errors).length > 0) {
      Object.keys(errorData.errors).forEach(field => {
        // Handle specific field name mappings (client_id, bill_type_id, delegate_id)
        const fieldName = field.endsWith("_id") ? field : field;

        if (setError) {
          // Set the error for the specific field
          setError(fieldName, {
            type: "manual",
            message: errorData.errors[field][0],
          });
        }
      });
    } else if (errorData.message) {
      // Handle general error message if no specific field errors
      showError(errorData.message);
    }
  }
};

export function pluckProperty(array, key) {
  if (!Array.isArray(array)) return [];

  return array.map(item => item[key]);
}

export const hasPermissionFunction = ({ group, type }) => {
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

  if (Array.isArray(group)) {
    return group.some(
      g =>
        Array.isArray(permissions) &&
        permissions.some(perm => perm.group === g && perm.type === type)
    );
  }

  const hasPermission =
    Array.isArray(permissions) &&
    permissions.some(perm => perm.group === group && perm.type === type);

  return hasPermission;
};

export const formatSalary = salary => {
  if (salary === undefined || salary === null || salary === "") return "";
  return Number(salary).toLocaleString();
};

export function encryptId(id) {
  return btoa(id.toString()); // تشفير Base64
}

export function decryptId(encryptedId) {
  try {
    return atob(encryptedId); // فك التشفير
  } catch (error) {
    return null;
  }
}

export function getTimeSuffix(date, lang = "ar") {
  const hours = new Date(date).getHours();
  const isAM = hours < 12;

  if (lang === "ar") {
    return isAM ? " ص " : " م ";
  } else {
    return isAM ? " AM " : " PM ";
  }
}

export const formatTimeToSHow = (time24, i18n) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period =
    hours >= 12 ? (i18n.language === "en" ? "PM" : "م") : i18n.language === "en" ? "AM" : "ص";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};
export const getUserData = () => {
  try {
    const authData = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const isSuperAdmin = () => {
  return localStorage.getItem("is_default") === "1" || sessionStorage.getItem("is_default") === "1";
};
export const isEmployee = () => {
  const storageType = localStorage.getItem("type") || sessionStorage.getItem("type");

  if (storageType) {
    return storageType === "employee";
  }

  const userData = getUserData();
  return userData?.user?.type === "employee";
};
export const buildPayloadByBondType = ({ formData, bondType }) => {
  try {
    const basePayload = {
      ...formData,
      no: Number(formData.no),
      type: bondType.value === BondTypes.booking.value ? "catch" : "pay",
      bond_group: bondType.value,
      cashier_id: formData.cashier_id?.value,
      date: formData.date ? new Date(formData.date).toISOString().split("T")[0] : null,
    };

    const config = bondPayloadConfig[bondType.value];

    if (!config) return basePayload;

    config.exclude?.forEach(field => {
      delete basePayload[field];
    });

    // map select values
    if (config.include?.includes("bill_id")) basePayload.bill_id = formData.bill_id?.value || null;

    if (config.include?.includes("financier_id"))
      basePayload.financier_id = formData.financier_id?.value || null;

    if (config.include?.includes("financier_id")) basePayload.type = formData.type?.value || null;

    if (config.include?.includes("user_id")) basePayload.user_id = formData.user_id?.value || null;

    if (config.include?.includes("booking_id"))
      basePayload.booking_id = formData.booking_id?.value || null;

    if (config.include?.includes("patient_id"))
      basePayload.patient_id = formData.patient_id?.value || null;

    if (config.include?.includes("discount_type"))
      basePayload.discount_type = formData.discount_type?.value;
    return basePayload;
  } catch (error) {
    console.log("erere", error);
  }
};

/**
 * Dynamic object field validation
 */
const objectField = (isRequired, t) =>
  isRequired
    ? yup
        .object({
          label: yup.string().nullable(),
          value: yup.mixed().required(),
        })
        .required(t("validation.required"))
    : yup
        .object({
          label: yup.string().nullable(),
          value: yup.mixed().nullable(),
        })
        .nullable();

/**
 * Factory: returns yup schema based on bond type
 */
export const getBondSchema = (bondType, t) =>
  yup.object().shape({
    bill_id: objectField(bondValidationConfig[bondType]?.require?.includes("bill_id"), t),

    cashier_id: objectField(bondValidationConfig[bondType]?.require?.includes("cashier_id"), t),

    user_id: objectField(bondValidationConfig[bondType]?.require?.includes("user_id"), t),

    patient_id: objectField(bondValidationConfig[bondType]?.require?.includes("patient_id"), t),

    booking_id: objectField(bondValidationConfig[bondType]?.require?.includes("booking_id"), t),

    financier_id: objectField(bondValidationConfig[bondType]?.require?.includes("financier_id"), t),

    type: objectField(bondValidationConfig[bondType]?.require?.includes("financier_id"), t),

    total: yup.string().required(t("validation.required")),

    notes: yup.string().required(t("validation.required")),

    description: yup.string().required(t("validation.required")),

    date: yup.mixed().required(t("validation.required")),

    discount_type: yup.object().nullable(),

    discount_value: yup
      .string()
      .nullable()
      .test("discount-validation", function (value) {
        const { discount_type } = this.parent;
        if (!value) return true;

        const numericValue = parseFloat(value.replace(/,/g, ""));
        if (isNaN(numericValue)) {
          return this.createError({ message: t("validation.invalid_number") });
        }

        if (discount_type?.value === "percentage" && numericValue > 100) {
          return this.createError({
            message: t("validation.discount_percentage_max"),
          });
        }

        if (discount_type?.value === "amount" && numericValue <= 0) {
          return this.createError({
            message: t("validation.salary_positive"),
          });
        }

        return true;
      }),
  });

export const BondActionsPermissionMap = {
  [BondTypes.generalPay.value]: {
    view: {
      group: PERMISSION_GROUP.GENERAL_BOND,
      type: PERMISSION_ACTION.index,
    },
    edit: {
      group: PERMISSION_GROUP.GENERAL_BOND,
      type: PERMISSION_ACTION.update,
    },
    delete: {
      group: PERMISSION_GROUP.GENERAL_BOND,
      type: PERMISSION_ACTION.delete,
    },
    approve: {
      group: PERMISSION_GROUP.GENERAL_BOND,
      type: PERMISSION_ACTION.change_status_to_done,
    },
  },

  [BondTypes.invoice.value]: {
    view: {
      group: PERMISSION_GROUP.INVOICE_BOND,
      type: PERMISSION_ACTION.index,
    },
    edit: {
      group: PERMISSION_GROUP.INVOICE_BOND,
      type: PERMISSION_ACTION.update,
    },
    delete: {
      group: PERMISSION_GROUP.INVOICE_BOND,
      type: PERMISSION_ACTION.delete,
    },
    approve: {
      group: PERMISSION_GROUP.INVOICE_BOND,
      type: PERMISSION_ACTION.change_status_to_done,
    },
  },

  [BondTypes.booking.value]: {
    view: {
      group: PERMISSION_GROUP.BOOKING_BOND,
      type: PERMISSION_ACTION.index,
    },
    edit: {
      group: PERMISSION_GROUP.BOOKING_BOND,
      type: PERMISSION_ACTION.update,
    },
    delete: {
      group: PERMISSION_GROUP.BOOKING_BOND,
      type: PERMISSION_ACTION.delete,
    },
    pay: {
      group: PERMISSION_GROUP.BOOKING_BOND,
      type: PERMISSION_ACTION.pay,
    },
    approve: {
      group: PERMISSION_GROUP.BOOKING_BOND,
      type: PERMISSION_ACTION.change_status_to_done,
    },
  },

  [BondTypes.salary.value]: {
    view: {
      group: PERMISSION_GROUP.SALARY_BOND,
      type: PERMISSION_ACTION.index,
    },
    edit: {
      group: PERMISSION_GROUP.SALARY_BOND,
      type: PERMISSION_ACTION.update,
    },
    delete: {
      group: PERMISSION_GROUP.SALARY_BOND,
      type: PERMISSION_ACTION.delete,
    },
    approve: {
      group: PERMISSION_GROUP.SALARY_BOND,
      type: PERMISSION_ACTION.change_status_to_done,
    },
  },

  [BondTypes.financier.value]: {
    view: {
      group: PERMISSION_GROUP.FINANCIER_BOND,
      type: PERMISSION_ACTION.index,
    },
    edit: {
      group: PERMISSION_GROUP.FINANCIER_BOND,
      type: PERMISSION_ACTION.update,
    },
    delete: {
      group: PERMISSION_GROUP.FINANCIER_BOND,
      type: PERMISSION_ACTION.delete,
    },
    approve: {
      group: PERMISSION_GROUP.FINANCIER_BOND,
      type: PERMISSION_ACTION.change_status_to_done,
    },
  },
};

export const hasBondPermission = (bondGroupValue, action) => {
  const permissionConfig = BondActionsPermissionMap[bondGroupValue]?.[action];

  if (!permissionConfig) return false;

  return hasPermissionFunction(permissionConfig);
};
export const hasStatusPermission = (statusId, userPermissions = []) => {
  if (!statusId || !userPermissions) return false;
  const permissionName = `change status to ${statusId}`.toLowerCase();

  return userPermissions.some(
    p =>
      p.group === "booking_status" &&
      p.type === "change_status" &&
      p.name?.toLowerCase() === permissionName
  );
};
