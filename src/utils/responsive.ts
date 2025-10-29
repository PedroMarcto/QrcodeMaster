import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Identifica se é tablet baseado no tamanho da tela
export const isTablet = () => {
  const aspectRatio = height / width;
  return width >= 768 && aspectRatio < 1.6;
};

// Função para escalar fontes de forma responsiva
export const scale = (size: number) => {
  const baseWidth = 411; // largura base do design (smartphone)
  const tabletWidth = 768; // largura típica de tablet
  
  if (isTablet()) {
    return Math.round((size * width) / tabletWidth);
  }
  return Math.round((size * width) / baseWidth);
};

// Função para espaçamento responsivo
export const spacing = (size: number) => {
  if (isTablet()) {
    return size * 1.5; // 50% maior em tablets
  }
  return size;
};

// Largura máxima do conteúdo em tablets
export const getMaxWidth = () => {
  if (isTablet()) {
    return Math.min(width * 0.8, 600); // 80% da largura ou 600px
  }
  return width;
};

// Tamanho de ícones/imagens responsivo
export const imageSize = (baseSize: number) => {
  if (isTablet()) {
    return baseSize * 1.3;
  }
  return baseSize;
};

// Retorna dimensões da janela
export const dimensions = {
  width,
  height,
  isTablet: isTablet(),
};
