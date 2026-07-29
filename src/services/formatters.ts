export function formatCurrency(amount: number, currency: string = 'BRL', hide: boolean = false): string {
  if (hide) return '••••••••';
  const val = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  return `${parts[2]}/${parts[1]}`;
}

export function formatPercent(value: number): string {
  const val = isNaN(value) ? 0 : value;
  return `${val.toFixed(1)}%`;
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex] || '';
}
