/* eslint-disable indent */
export const patientActions = {
  pageSize: "pageSize",
  pageIndex: "pageIndex",
  searchValue: "searchValue",
  openDeleteModal: "openDeleteModal",
  closeDeleteModal: "closeDeleteModal",
  selectedId: "selectedIdl",
  isSending: "isSending",
  openReasonModal: "openReasonModal",
  closeReasonModal: "closeReasonModal",
};

export const initialValues = {
  searchValue: "",
  pageIndex: 1,
  selectedId: 0,
  pageSize: 8,
  isDeleteModalOpen: false, // ✅ unified
  deleteTarget: null,
  isReasonModalOpen: false,
  reasonTarget: null,
  isSending: false,
};

export function patientReducer(state, action) {
  switch (action.type) {
    case patientActions.searchValue:
      return { ...state, searchValue: action.payload };
    case patientActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case patientActions.selectedId:
      return { ...state, selectedId: action.payload };
    case patientActions.pageSize:
      return { ...state, pageSize: action.payload };
    case patientActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case patientActions.isSending:
      return { ...state, isSending: action.payload };
    case patientActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    case patientActions.openReasonModal:
      return { ...state, isReasonModalOpen: true, reasonTarget: action.payload };
    case patientActions.closeReasonModal:
      return { ...state, isReasonModalOpen: false, reasonTarget: null };
    default:
      return state;
  }
}
