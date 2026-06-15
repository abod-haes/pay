/* eslint-disable indent */
export const delayedActions = {
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

export function delayedReducer(state, action) {
  switch (action.type) {
    case delayedActions.searchValue:
      return { ...state, searchValue: action.payload };
    case delayedActions.pageIndex:
      return { ...state, pageIndex: action.payload };
    case delayedActions.pageSize:
      return { ...state, pageSize: action.payload };
    case delayedActions.openDeleteModal:
      return { ...state, isDeleteModalOpen: true, deleteTarget: action.payload };
    case delayedActions.closeDeleteModal:
      return { ...state, isDeleteModalOpen: false, deleteTarget: null };
    default:
      return state;
  }
}
