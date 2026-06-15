/* eslint-disable indent */
export const vouchersActions = {
  pageSize: "pageSize",
  pageIndex: "pageIndex",
  searchValue: "searchValue",
  openDeleteModal: "openDeleteModal",
  closeDeleteModal: "closeDeleteModal",
};

export const initialValues = {
  searchValue: "",
  pageIndex: 1,
  pageSize: 8,
  isDeleteModalOpen: false, // ✅ unified
  deleteTarget: null,
};

export function vouchersReducer(state, action) {
  switch (action.type) {
    case vouchersActions.searchValue:
      return { ...state, searchValue: action.payload };
    case vouchersActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case vouchersActions.pageSize:
      return { ...state, pageSize: action.payload };
    case vouchersActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case vouchersActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    default:
      return state;
  }
}
