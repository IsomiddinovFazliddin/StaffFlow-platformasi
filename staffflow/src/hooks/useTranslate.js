import { useLang } from '../context/LangContext';

/**
 * Returns a t(key, vars) function.
 * key uses dot notation: "dashboard.title"
 * vars is an optional object for interpolation: t("employees.subtitle", { filtered: 3, total: 5 })
 */
export function useTranslate() {
  const { translations } = useLang();

  const t = (key, vars = {}) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], translations);
    if (value === undefined) return key; // fallback to key if missing
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, v),
      value
    );
  };

  return t;
}
