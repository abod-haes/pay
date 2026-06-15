/* eslint-disable indent */
export const salaryActions = {
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

export function salaryReducer(state, action) {
  switch (action.type) {
    case salaryActions.searchValue:
      return { ...state, searchValue: action.payload };
    case salaryActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case salaryActions.pageSize:
      return { ...state, pageSize: action.payload };
    case salaryActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case salaryActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    default:
      return state;
  }
}
