/* eslint-disable indent */
export const hairActions = {
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

export function hairReducer(state, action) {
  switch (action.type) {
    case hairActions.searchValue:
      return { ...state, searchValue: action.payload };
    case hairActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case hairActions.pageSize:
      return { ...state, pageSize: action.payload };
    case hairActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case hairActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    default:
      return state;
  }
}
