import { toast } from 'react-toastify';
export const showSuccess = message => {
  toast.success(
    <div>
      <span>{message}</span>
    </div>
  );
};
export const showError = message => {
  toast.error(
    <div>
      <span>{message}</span>
    </div>
  );
};
