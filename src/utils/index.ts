import dayjs from 'dayjs';
import { ScheduleItem, LoanStatus } from '@/types';

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const isDateOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = dayjs(start1).startOf('day');
  const e1 = dayjs(end1).endOf('day');
  const s2 = dayjs(start2).startOf('day');
  const e2 = dayjs(end2).endOf('day');
  return s1.isBefore(e2) && s2.isBefore(e1);
};

export const checkScheduleConflict = (
  collectionId: string,
  startDate: string,
  endDate: string,
  schedules: ScheduleItem[],
  excludeLoanId?: string
): { hasConflict: boolean; conflicts: ScheduleItem[]; message: string } => {
  const activeStatuses: LoanStatus[] = ['pending', 'approved', 'lent'];
  const conflicts = schedules.filter((s) => {
    if (excludeLoanId && s.loanId === excludeLoanId) return false;
    if (s.collectionId !== collectionId) return false;
    if (!activeStatuses.includes(s.status)) return false;
    return isDateOverlap(startDate, endDate, s.startDate, s.endDate);
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    message:
      conflicts.length > 0
        ? `该藏品在 ${conflicts.map((c) => `${formatDate(c.startDate)}至${formatDate(c.endDate)}`).join('、')} 档期已被占用`
        : '档期无冲突'
  };
};

export const generateLoanNo = (): string => {
  const now = dayjs();
  const prefix = `L${now.format('YYYYMMDD')}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${random}`;
};

export const getDaysBetween = (startDate: string, endDate: string): number => {
  return dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(amount);
};
