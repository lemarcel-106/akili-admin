export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_active?: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormError {
  field?: string;
  message: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}