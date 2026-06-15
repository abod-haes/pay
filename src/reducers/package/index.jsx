/* eslint-disable indent */
export const packageActions = {
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

export function packageReducer(state, action) {
  switch (action.type) {
    case packageActions.searchValue:
      return { ...state, searchValue: action.payload };
    case packageActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case packageActions.pageSize:
      return { ...state, pageSize: action.payload };
    case packageActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case packageActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    default:
      return state;
  }
}
