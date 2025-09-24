// Genera el código base de pallet (11 dígitos) sin sufijo contador
// Estructura: D (1) + SS (2) + YY (2) + T (1) + CC (2) + F (1) + EE (2)

function getIsoWeek(date: Date): number {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = tmp.getUTCDay() || 7; // 1..7 (Mon..Sun)
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

export const generatePalletCode = (
  date: Date,
  shift: string,
  caliber: string,
  formatId: string,
  company: string
): string => {
  const jsDay = date.getDay();
  const day = (jsDay === 0 ? 7 : jsDay).toString();
  const week = String(getIsoWeek(date)).padStart(2, '0');
  const year = String(date.getFullYear() % 100).padStart(2, '0');

  const companyTwoDigits = company.padStart(2, '0');

  return `${day}${week}${year}${shift}${caliber}${formatId}${companyTwoDigits}`;
};

export default generatePalletCode;
