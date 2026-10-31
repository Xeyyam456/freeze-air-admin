// Kartın üç pəncərəsi: məlumat, redaktə, telefon/şəkil
export type ManagerModalState = {
  viewing: boolean;
  editing: boolean;
  contact: boolean;
  open: () => void;
  edit: () => void;
  openContact: () => void;
  close: () => void;
};
