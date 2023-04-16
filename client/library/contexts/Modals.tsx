import React, { createContext } from "react";
import { ButtonVariant, MantineColor } from "@mantine/core";

interface Modal {
  open: boolean;
  title: string;
  type: "confirmation" | "form";
  buttons: {
    text: string;
    onClick: () => void;
    variant: ButtonVariant;
    color?: MantineColor;
  }[];
  onClose: () => void;
  content: React.ReactNode | string;
}

interface ModalContextType {
  modal: Modal;
  setModal: (modal: Omit<Modal, "open">) => void;
  resetModal: () => void;
  closeModal: () => void;
}

const initialModal: Modal = {
  open: false,
  title: "",
  content: "",
  type: "confirmation",
  buttons: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClose: () => {},
};

const intitialModalContext: ModalContextType = {
  modal: initialModal,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resetModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeModal: () => {},
};

export const ModalContext =
  createContext<ModalContextType>(intitialModalContext);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modal, setModal] = React.useState<Modal>(initialModal);

  const value: ModalContextType = {
    modal,
    setModal: (modal: Omit<Modal, "open">) =>
      setModal({ ...modal, open: true }),
    resetModal: () => setModal({ ...initialModal }),
    closeModal: () => setModal({ ...modal, open: false }),
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = () => React.useContext(ModalContext);
