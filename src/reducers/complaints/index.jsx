/* eslint-disable complexity */
/* eslint-disable indent */
export const complaintsActions = {
  pageSize: "pageSize",
  pageIndex: "pageIndex",
  searchValue: "searchValue",
  openDeleteModal: "openDeleteModal",
  closeDeleteModal: "closeDeleteModal",
  openCancelModal: "openCancelModal", // Add this
  closeCancelModal: "closeCancelModal", // Add this
  openUsersModal: "openUsersModal",
  closeUsersModal: "closeUsersModal",
  selectedId: "selectedId",
  isSending: "isSending",
  setCurrentDepartment: "setCurrentDepartment",
  isDeleteModalOpen: "isDeleteModalOpen",
  isCancelModalOpen: "isCancelModalOpen", // Add this
  selectedData: "selectedData",
};

export const initialValues = {
  searchValue: "",
  pageIndex: 1,
  pageSize: 8,
  isDeleteModalOpen: false,
  isCancelModalOpen: false, // Add this
  isUsersModalOpen: false,
  deleteTarget: null,
  selectedId: 0,
  isSending: false,
  currentDepartment: null,
  selectedData: null,
  openDeleteModal: false,
};

export function complaintsReducer(state, action) {
  switch (action.type) {
    case complaintsActions.searchValue:
      return { ...state, searchValue: action.payload };
    case complaintsActions.selectedData:
      return { ...state, selectedData: action.payload };
    case complaintsActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case complaintsActions.pageSize:
      return { ...state, pageSize: action.payload };
    case complaintsActions.selectedId:
      return { ...state, selectedId: action.payload };
    case complaintsActions.isSending:
      return { ...state, isSending: action.payload };
    case complaintsActions.isDeleteModalOpen:
      return { ...state, isDeleteModalOpen: action.payload };
    case complaintsActions.isCancelModalOpen: // Add this case
      return { ...state, isCancelModalOpen: action.payload };
    case complaintsActions.openDeleteModal:
      return { ...state, openDeleteModal: action.payload };
    case complaintsActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    case complaintsActions.openCancelModal: // Add this case
      return { ...state, isCancelModalOpen: true };
    case complaintsActions.closeCancelModal: // Add this case
      return { ...state, isCancelModalOpen: false, selectedData: null };
    case complaintsActions.openUsersModal:
      return { ...state, isUsersModalOpen: true };
    case complaintsActions.closeUsersModal:
      return { ...state, isUsersModalOpen: false };
    case complaintsActions.setCurrentDepartment:
      return { ...state, currentDepartment: action.payload };
    default:
      return state;
  }
}
