import { useCallback } from "react";

export function useDateBr() {
  const formatDateBR = useCallback((dateStr: string | null): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  return { formatDateBR };
}