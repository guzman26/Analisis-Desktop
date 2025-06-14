export const getCalibreFromCodigo = (codigo: string) => {
  const calibreNumber = codigo.slice(6, 8);
  const calibreName = formatCalibreName(calibreNumber);
  return calibreName;
};

export const getBaseCodeFromCodigo = (codigo: string) => {
  const baseCode = codigo.slice(2, 10);
  return baseCode;
};

export const formatCalibreName = (calibre: string): string => {
  const calibreMap: Record<string, string> = {
    "01": "ESPECIAL BCO",
    "02": "EXTRA BCO",
    "04": "GRANDE BCO",
    "07": "MEDIANO BCO",
    "09": "TERCERA BCO",
    "15": "CUARTA BCO",
    "12": "JUMBO BCO",
    "03": "ESPECIAL COLOR",
    "05": "EXTRA COLOR",
    "06": "GRANDE COLOR",
    "13": "MEDIANO COLOR",
    "11": "TERCERA COLOR",
    "16": "CUARTA COLOR",
    "14": "JUMBO COLOR",
    "08": "SUCIO / TRIZADO",
  };

  return calibreMap[calibre] || `${calibre}`;
};