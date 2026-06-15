/* eslint-disable complexity */
/* eslint-disable indent */
export const warehouseActions = {
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
};

export function warehouseReducer(state, action) {
  switch (action.type) {
    case warehouseActions.searchValue:
      return { ...state, searchValue: action.payload };
    case warehouseActions.selectedData:
      return { ...state, selectedData: action.payload };
    case warehouseActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case warehouseActions.pageSize:
      return { ...state, pageSize: action.payload };
    case warehouseActions.selectedId:
      return { ...state, selectedId: action.payload };
    case warehouseActions.isSending:
      return { ...state, isSending: action.payload };
    case warehouseActions.isDeleteModalOpen:
      return { ...state, isDeleteModalOpen: action.payload };
    case warehouseActions.openDeleteModal:
      return { ...state, openDeleteModal: action.payload };
    case warehouseActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    case warehouseActions.openUsersModal:
      return { ...state, isUsersModalOpen: true };
    case warehouseActions.closeUsersModal:
      return { ...state, isUsersModalOpen: false };
    case warehouseActions.setCurrentDepartment:
      return { ...state, currentDepartment: action.payload };
    default:
      return state;
  }
}
