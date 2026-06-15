/* eslint-disable complexity */
/* eslint-disable indent */
export const branchesActions = {
  pageSize: "pageSize",
  pageIndex: "pageIndex",
  searchValue: "searchValue",
  openDeleteModal: "openDeleteModal",
  closeDeleteModal: "closeDeleteModal",
  openUsersModal: "openUsersModal",
  closeUsersModal: "closeUsersModal",
  selectedId: "selectedId",
  isSending: "isSending",
  setCurrentDepartment: "setCurrentDepartment",
  isDeleteModalOpen: "isDeleteModalOpen",
  selectedData: "selectedData",
  openAddDoctorModal: "OPEN_ADD_DOCTOR_MODAL",
  openAddTechnicianModal: "OPEN_ADD_TECHNICIAN_MODAL",
  setSelectedBookingId: "SET_SELECTED_BOOKING_ID",
};

export const initialValues = {
  searchValue: "",
  pageIndex: 1,
  pageSize: 8,
  isDeleteModalOpen: false,
  isUsersModalOpen: false,
  deleteTarget: null,
  selectedId: 0,
  isSending: false,
  currentDepartment: null,
  selectedData: null,
  openDeleteModal: false,
  isAddDoctorModalOpen: false,
  isAddTechnicianModalOpen: false,
  selectedBookingId: null,
};

export function branchesReducer(state, action) {
  switch (action.type) {
    case branchesActions.searchValue:
      return { ...state, searchValue: action.payload };
    case branchesActions.selectedData:
      return { ...state, selectedData: action.payload };
    case branchesActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case branchesActions.pageSize:
      return { ...state, pageSize: action.payload };
    case branchesActions.selectedId:
      return { ...state, selectedId: action.payload };
    case branchesActions.isSending:
      return { ...state, isSending: action.payload };
    case branchesActions.isDeleteModalOpen:
      return { ...state, isDeleteModalOpen: action.payload };
    case branchesActions.openDeleteModal:
      return { ...state, openDeleteModal: action.payload };
    case branchesActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    case branchesActions.openUsersModal:
      return { ...state, isUsersModalOpen: true };
    case branchesActions.closeUsersModal:
      return { ...state, isUsersModalOpen: false };
    case branchesActions.setCurrentDepartment:
      return { ...state, currentDepartment: action.payload };
    case branchesActions.openAddDoctorModal:
      return { ...state, isAddDoctorModalOpen: action.payload };
    case branchesActions.openAddTechnicianModal:
      return { ...state, isAddTechnicianModalOpen: action.payload };
    case branchesActions.setSelectedBookingId:
      return { ...state, selectedBookingId: action.payload };
    default:
      return state;
  }
}
