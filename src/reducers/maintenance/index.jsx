/* eslint-disable complexity */
/* eslint-disable indent */
export const maintenanceActions = {
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
};

export function maintenanceReducer(state, action) {
  switch (action.type) {
    case maintenanceActions.searchValue:
      return { ...state, searchValue: action.payload };
    case maintenanceActions.selectedData:
      return { ...state, selectedData: action.payload };
    case maintenanceActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case maintenanceActions.pageSize:
      return { ...state, pageSize: action.payload };
    case maintenanceActions.selectedId:
      return { ...state, selectedId: action.payload };
    case maintenanceActions.isSending:
      return { ...state, isSending: action.payload };
    case maintenanceActions.isDeleteModalOpen:
      return { ...state, isDeleteModalOpen: action.payload };
    case maintenanceActions.openDeleteModal:
      return { ...state, openDeleteModal: action.payload };
    case maintenanceActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    case maintenanceActions.openUsersModal:
      return { ...state, isUsersModalOpen: true };
    case maintenanceActions.closeUsersModal:
      return { ...state, isUsersModalOpen: false };
    case maintenanceActions.setCurrentDepartment:
      return { ...state, currentDepartment: action.payload };
    default:
      return state;
  }
}
