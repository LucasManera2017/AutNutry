// src/hooks/useTitle.ts
import { useEffect } from 'react';

export const useTitle = (title: string): void => {
  useEffect(() => {
    // Altera o título do documento (a aba do navegador)
    document.title = title;

    // Função de limpeza (opcional, mas boa prática)
    return () => {
      document.title = 'AutNutry'
    };
  }, [title]); // O efeito será executado sempre que o 'title' mudar
};