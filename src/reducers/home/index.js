import { useReducer } from "react";

/* eslint-disable indent */
export const homeActions = {
};

export const initialValues = {};

export function homeReducer(state, action) {
  switch (action.type) {
    case exerciseLibraryActions.openCollapseModel:
      return { ...state, openCollapseModel: action.payload };
    default:
      return state;
  }
}
