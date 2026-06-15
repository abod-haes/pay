export const screenSizes = {
  sm_custom: 600,
  sm: 640,
  md: 768,
  md_custom: 900,
  lg: 1024,
  xl: 1280,
  custom_xl: 1440,
  "2xl": 1536,
  "3xl": 1706,
  "4xl": 1920,
  "6xl": 2400,
};

export const BookingVia = {
  instagram: { value: "instagram", label: "booking.instagram" },
  facebook: { value: "facebook", label: "booking.facebook" },
  direct: { value: "direct", label: "booking.direct" },
  tiktok: { value: "tiktok", label: "booking.tiktok" },
  snapchat: { value: "snapchat", label: "booking.snapchat" },
  barber_shop: { value: "barber_shop", label: "booking.brand_shop" },
  through_friend: { value: "through_friend", label: "booking.through_friend" },
  whatsapp: { value: "whatsapp", label: "booking.whatsapp" },
};

export const BookingSections = {
  hair_transplant: { value: "hair_transplant", label: "home.implant" },
  injection: { value: "injection", label: "sidebar.injections" },
  hair_care: { value: "hair_care", label: "sidebar.hair-care" },
};

export const PatientStatus = {
  active: { value: "active", label: "home.implant" },
  inactive: { value: "inactive", label: "sidebar.injections" },
};

export const BookingStatus = {
  wait: { value: "wait", label: "booking.wait" },
  approve: { value: "approve", label: "booking.approve" },
  cancel: { value: "cancel", label: "booking.cancel" },
  done: { value: "done", label: "booking.done" },
  delayed: { value: "delayed", label: "booking.delayed" },
};

export const BondTypes = {
  generalPay: {
    value: "general_pay_bond",
    label: "bond.generalPay",
  },
  invoice: {
    value: "invoice_bond",
    label: "bond.invoice",
  },
  booking: {
    value: "booking_bond",
    label: "bond.booking",
  },
  salary: {
    value: "salary_bond",
    label: "bond.salary",
  },
  financier: {
    value: "financier_bond",
    label: "bond.financier",
  },
};

export const ComplaintsStatus = {
  waiting: { value: "waiting ", label: "booking.wait" },
  done: { value: "done", label: "booking.served" },
  canceled: { value: "canceled", label: "booking.cancel" },
};
export const ExaminationStatus = {
  wait: { value: "wait ", label: "booking.wait" },
  delayed: { value: "delayed", label: "booking.delayed" },
  transfer_to_doctor: { value: "transfer_to_doctor", label: "examination.transfer" },
  booking_assigned: { value: "booking_assigned", label: "examination.assign" },
  booking_cancelled: { value: "booking_cancelled", label: "examination.cancel" },
};

export const maintenanceStatus = {
  waiting: { value: "waiting", label: "booking.wait" },
  done: { value: "done", label: "booking.served" },
  in_progress: { value: "in_progress", label: "booking.progress" },
};

export const BondStatus = {
  pending: { value: "pending", label: "booking.wait" },
  approved: { value: "approved", label: "booking.approve" },
  rejected: { value: "rejected", label: "booking.rejected" },
  cancelled: { value: "cancelled", label: "booking.cancelled" },
  paid: { value: "paid", label: "bond.paid" },
};

export const PERMISSION_GROUP = {
  User: "user",
  Employee: "employee",
  Branch: "branch",
  Department: "department",
  JobTitle: "job_title",
  Salary: "salary",
  Reward: "reward",
  Punishment: "punishment",
  Auth: "auth",
  Patient: "patient",
  Service: "service",
  Booking: "booking",
  Injection: "injection",
  HairTransplant: "hair_transplant",
  HairCare: "hair_care",
  Delayed: "delayed",
  Complaint: "complaint",
  Warehouse: "warehouse",
  Unit: "unit",
  Material: "material",
  Role: "role",
  Maintenance: "maintenance",
  Holiday: "holiday",
  Setting: "setting",
  Bill: "bill",
  Bond: "bond",
  Cashier: "cashier",
  Dashboard: "dashboard",
  Vendors: "vendor",
  Offers: "offer",
  BOOKING_BOND: "booking_bond",
  SALARY_BOND: "salary_bond",
  FINANCIER_BOND: "financier_bond",
  INVOICE_BOND: "invoice_bond",
  GENERAL_BOND: "general_pay_bond",
  BOOKING_STATUS: "booking_status",
  SPONSOR: "financier",
  REASON_FOR_NOT_BOOKING: "reason",
  Examination: "examination",
};

export const PERMISSION_ACTION = {
  index: "index",
  create: "create",
  update: "update",
  delete: "delete",
  change_status: "change_status",
  assign_doctor: "assign_doctor",
  assign_technician: "assign_technician",
  change_status_to_in_progress: "in_progress",
  change_status_to_done: "approve",
  pay: "pay",
};

export const bondPayloadConfig = {
  [BondTypes.generalPay.value]: {
    include: ["cashier_id"],
    exclude: [
      "bill_id",
      "patient_id",
      "discount_type",
      "discount_value",
      "financier_id",
      "user_id",
      "booking_id",
    ],
  },

  [BondTypes.invoice.value]: {
    include: ["bill_id"],
    exclude: [
      "user_id",
      "patient_id",
      "discount_type",
      "discount_value",
      "booking_id",
      "financier_id",
    ],
  },

  [BondTypes.booking.value]: {
    include: ["patient_id", "discount_type", "discount_value", "booking_id"],
    exclude: ["bill_id", "user_id", "financier_id"],
  },

  [BondTypes.salary.value]: {
    include: ["user_id"],
    exclude: [
      "bill_id",
      "patient_id",
      "discount_type",
      "discount_value",
      "booking_id",
      "financier_id",
    ],
  },

  [BondTypes.financier.value]: {
    include: ["cashier_id", "financier_id", "type"],
    exclude: ["user_id", "patient_id", "discount_type", "discount_value", "booking_id", "bill_id"],
  },
};

export const bondValidationConfig = {
  [BondTypes.generalPay.value]: {
    require: ["cashier_id"],
  },

  [BondTypes.invoice.value]: {
    require: ["bill_id", "discount_type", "cashier_id"],
  },

  [BondTypes.booking.value]: {
    require: ["patient_id", "cashier_id", "booking_id"],
    optional: ["type"],
  },

  [BondTypes.salary.value]: {
    require: ["user_id", "date", "cashier_id"],
    optional: ["notes"],
  },

  [BondTypes.financier.value]: {
    require: ["cashier_id", "financier_id", "type"],
  },
};

export const BondPermissionsMap = {
  general_pay_bond: {
    group: "general_pay_bond",
    type: "create",
  },
  invoice_bond: {
    group: "invoice_bond",
    type: "create",
  },
  booking_bond: {
    group: "booking_bond",
    type: "create",
  },
  salary_bond: {
    group: "salary_bond",
    type: "create",
  },
  financier_bond: {
    group: "financier_bond",
    type: "create",
  },
};
