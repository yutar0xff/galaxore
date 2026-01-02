import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DialogState {
  isOpen: boolean;
  type: "alert" | "confirm";
  title?: string;
  message: string;
  onConfirm?: () => void;
}

export function useDialog() {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: "alert",
    message: "",
  });

  const showAlert = (message: string, title?: string) => {
    setDialog({
      isOpen: true,
      type: "alert",
      message,
      title: title || t("Alert"),
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title?: string,
  ) => {
    setDialog({
      isOpen: true,
      type: "confirm",
      message,
      onConfirm,
      title: title || t("Confirm"),
    });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    dialog,
    showAlert,
    showConfirm,
    closeDialog,
  };
}
