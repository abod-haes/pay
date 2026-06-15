import { showError } from "@/libs/react.toastify";

/**
 * Handles API error responses and sets form errors accordingly
 * @param {Object} error - The error object from the API response
 * @param {Function} setError - The setError function from react-hook-form
 * @param {Object} options - Additional options for error handling
 * @param {Object} options.fieldMapping - Optional mapping of API error fields to form fields
 * @param {Function} options.onError - Optional callback for custom error handling
 */
export const handleFormError = (error, setError, options = {}) => {
  const { fieldMapping = {}, onError } = options;

  // If there's a custom error handler, use it
  if (onError) {
    return onError(error, setError);
  }

  // Handle API error response
  if (error?.response?.data) {
    const errorData = error.response.data;

    // Handle array of errors
    if (Array.isArray(errorData)) {
      errorData.forEach(error => {
        const field = fieldMapping[error.field] || error.field;
        if (field === "details") {
          showError(error.message);
        } else {
          setError(field, {
            type: "manual",
            message: error.message,
          });
        }
      });
      return;
    }

    // Handle object of errors
    Object.entries(errorData).forEach(([field, messages]) => {
      const mappedField = fieldMapping[field] || field;
      const message = Array.isArray(messages) ? messages[0] : messages;

      if (mappedField === "details") {
        showError(message);
      } else {
        setError(mappedField, {
          type: "manual",
          message: message,
        });
      }
    });
  }
};

/**
 * Creates a reusable error handler for a specific form
 * @param {Function} setError - The setError function from react-hook-form
 * @param {Object} options - Options for error handling
 * @returns {Function} A function that handles errors for the specific form
 */
export const createFormErrorHandler = (setError, options = {}) => {
  return error => handleFormError(error, setError, options);
};
