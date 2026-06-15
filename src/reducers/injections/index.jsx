/* eslint-disable indent */
export const injectionActions = {
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

export function injectionReducer(state, action) {
  switch (action.type) {
    case injectionActions.searchValue:
      return { ...state, searchValue: action.payload };
    case injectionActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case injectionActions.pageSize:
      return { ...state, pageSize: action.payload };
    case injectionActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case injectionActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    default:
      return state;
  }
}
