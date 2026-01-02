import { i18n as I18nType } from "i18next";

/**
 * Change language and save to localStorage
 */
export function changeLanguage(lng: string, i18n: I18nType): void {
  i18n.changeLanguage(lng);
  localStorage.setItem("i18nextLng", lng);
}
