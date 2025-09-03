import Swal from 'sweetalert2';

export const showSuccess = (message: string, title: string = 'Succès') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#8b5cf6',
    background: 'white',
    color: '#1f2937',
    showConfirmButton: true,
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showError = (message: string, title: string = 'Erreur') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    background: 'white',
    color: '#1f2937',
    showConfirmButton: true,
  });
};

export const showConfirm = (
  message: string,
  title: string = 'Confirmation',
  confirmText: string = 'Confirmer',
  cancelText: string = 'Annuler'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#8b5cf6',
    cancelButtonColor: '#6b7280',
    background: 'white',
    color: '#1f2937',
  });
};

export const showLoading = (message: string = 'Chargement...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: 'white',
    color: '#1f2937',
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

export const showInfo = (message: string, title: string = 'Information') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
    background: 'white',
    color: '#1f2937',
    showConfirmButton: true,
  });
};