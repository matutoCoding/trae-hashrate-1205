import { create } from 'zustand';
import {
  LoanApplication,
  Collection,
  UserInfo,
  ScheduleItem,
  ApprovalStatus,
  ApprovalNodeType,
  APPROVAL_FLOW,
  LoanStatus
} from '@/types';
import { mockLoanApplications, mockCurrentUser } from '@/data/mockApprovals';
import { mockCollections } from '@/data/mockCollections';
import { generateLoanNo, checkScheduleConflict } from '@/utils';
import Taro from '@tarojs/taro';

const STORAGE_KEY_LOANS = 'museum_loan_applications';
const STORAGE_KEY_SCHEDULES = 'museum_loan_schedules';

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = Taro.getStorageSync(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (e) {
    console.warn('[Store] Failed to load from storage:', key, e);
  }
  return defaultValue;
};

const saveToStorage = (key: string, data: any) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[Store] Failed to save to storage:', key, e);
  }
};

const getNow = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

const isLoanReturned = (loan: LoanApplication): boolean => {
  if (loan.status !== 'pending') return false;
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
  return loan.approvalRecords.some((r) => {
    const rIndex = nodes.findIndex((n) => n === r.nodeType);
    return r.status === 'rejected' && rIndex > currentIndex;
  });
};

const computeSchedules = (loans: LoanApplication[]): ScheduleItem[] => {
  const activeStatuses: LoanStatus[] = ['pending', 'approved', 'lent'];
  return loans
    .filter((l) => activeStatuses.includes(l.status) && !isLoanReturned(l))
    .map((l) => ({
      id: `s_${l.id}`,
      loanId: l.id,
      loanNo: l.loanNo,
      collectionId: l.collectionId,
      collectionName: l.collectionName,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
      borrower: l.borrower.name
    }));
};

interface AppState {
  currentUser: UserInfo;
  loans: LoanApplication[];
  collections: Collection[];
  schedules: ScheduleItem[];
  initFromStorage: () => void;
  persist: () => void;
  getLoansByStatus: (status: LoanStatus[]) => LoanApplication[];
  getPendingApprovals: (role: ApprovalNodeType) => LoanApplication[];
  getProcessedApprovals: (role: ApprovalNodeType) => LoanApplication[];
  getMyLoans: (userId: string) => LoanApplication[];
  getCollectionById: (id: string) => Collection | undefined;
  getLoanById: (id: string) => LoanApplication | undefined;
  getSchedulesByCollection: (collectionId: string) => ScheduleItem[];
  approveLoan: (loanId: string, approverId: string, approverName: string, comment: string) => void;
  rejectLoan: (loanId: string, approverId: string, approverName: string, comment: string) => void;
  createLoan: (data: Partial<LoanApplication>) => LoanApplication;
  updateLoan: (loanId: string, data: Partial<LoanApplication>) => void;
  cancelLoan: (loanId: string) => void;
  checkConflict: (collectionId: string, startDate: string, endDate: string, excludeLoanId?: string) => { hasConflict: boolean; conflicts: ScheduleItem[]; message: string };
}

const initialLoans = loadFromStorage<LoanApplication[]>(STORAGE_KEY_LOANS, mockLoanApplications);
const initialSchedules = computeSchedules(initialLoans);

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockCurrentUser,
  loans: initialLoans,
  collections: mockCollections,
  schedules: initialSchedules,

  initFromStorage: () => {
    const storedLoans = loadFromStorage<LoanApplication[] | null>(STORAGE_KEY_LOANS, null);
    if (storedLoans) {
      set({
        loans: storedLoans,
        schedules: computeSchedules(storedLoans)
      });
    }
  },

  persist: () => {
    saveToStorage(STORAGE_KEY_LOANS, get().loans);
  },

  getLoansByStatus: (statuses) => {
    return get().loans.filter((l) => statuses.includes(l.status));
  },

  getPendingApprovals: (role) => {
    return get().loans.filter(
      (l) => l.status === 'pending' && l.currentNode === role
    );
  },

  getProcessedApprovals: (role) => {
    return get().loans.filter((l) => {
      return l.approvalRecords.some(
        (r) => r.nodeType === role && r.status !== 'pending'
      );
    });
  },

  getMyLoans: (userId) => {
    return get().loans.filter((l) => l.creatorId === userId);
  },

  getCollectionById: (id) => {
    return get().collections.find((c) => c.id === id);
  },

  getLoanById: (id) => {
    return get().loans.find((l) => l.id === id);
  },

  getSchedulesByCollection: (collectionId) => {
    return get().schedules.filter((s) => s.collectionId === collectionId);
  },

  approveLoan: (loanId, approverId, approverName, comment) => {
    const now = getNow();
    set((state) => {
      const loans = state.loans.map((loan) => {
        if (loan.id !== loanId) return loan;

        const nodes = APPROVAL_FLOW.nodes;
        const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
        const isLastNode = currentIndex >= nodes.length - 1;
        const nextNode = isLastNode ? null : nodes[currentIndex + 1];
        const nextNodeName = nextNode ? APPROVAL_FLOW.nodeNames[nextNode] : '';

        const updatedRecords = loan.approvalRecords.map((r) => {
          if (r.nodeType === loan.currentNode) {
            return {
              ...r,
              status: 'approved' as ApprovalStatus,
              approverId,
              approverName,
              comment,
              updatedAt: now
            };
          }
          return r;
        });

        if (!isLastNode && nextNode) {
          const existingNext = updatedRecords.find((r) => r.nodeType === nextNode);
          if (existingNext) {
            existingNext.status = 'pending';
            existingNext.approverId = '';
            existingNext.approverName = '';
            existingNext.comment = '';
            existingNext.updatedAt = now;
          } else {
            updatedRecords.push({
              id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              nodeType: nextNode,
              nodeName: nextNodeName,
              approverId: '',
              approverName: '',
              status: 'pending' as ApprovalStatus,
              comment: '',
              createdAt: now,
              updatedAt: now
            });
          }
        }

        return {
          ...loan,
          status: isLastNode ? 'approved' as LoanStatus : 'pending' as LoanStatus,
          currentNode: nextNode,
          currentNodeName: nextNodeName,
          approvalRecords: updatedRecords,
          updatedAt: now
        };
      });

      const newSchedules = computeSchedules(loans);
      saveToStorage(STORAGE_KEY_LOANS, loans);
      saveToStorage(STORAGE_KEY_SCHEDULES, newSchedules);

      return { loans, schedules: newSchedules };
    });
  },

  rejectLoan: (loanId, approverId, approverName, comment) => {
    const now = getNow();
    set((state) => {
      const loans = state.loans.map((loan) => {
        if (loan.id !== loanId) return loan;

        const nodes = APPROVAL_FLOW.nodes;
        const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
        const prevIndex = currentIndex - 1;
        const prevNode = prevIndex >= 0 ? nodes[prevIndex] : null;
        const prevNodeName = prevNode ? APPROVAL_FLOW.nodeNames[prevNode] : '';

        const updatedRecords = loan.approvalRecords.map((r) => {
          if (r.nodeType === loan.currentNode) {
            return {
              ...r,
              status: 'rejected' as ApprovalStatus,
              approverId,
              approverName,
              comment,
              updatedAt: now
            };
          }
          return r;
        });

        if (prevNode) {
          const prevRecord = updatedRecords.find((r) => r.nodeType === prevNode);
          if (prevRecord) {
            prevRecord.status = 'pending';
            prevRecord.updatedAt = now;
          } else {
            updatedRecords.unshift({
              id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              nodeType: prevNode,
              nodeName: prevNodeName,
              approverId: '',
              approverName: '',
              status: 'pending' as ApprovalStatus,
              comment: '',
              createdAt: now,
              updatedAt: now
            });
          }
        }

        return {
          ...loan,
          status: 'pending' as LoanStatus,
          currentNode: prevNode,
          currentNodeName: prevNodeName,
          approvalRecords: updatedRecords,
          updatedAt: now
        };
      });

      const newSchedules = computeSchedules(loans);
      saveToStorage(STORAGE_KEY_LOANS, loans);
      saveToStorage(STORAGE_KEY_SCHEDULES, newSchedules);

      return { loans, schedules: newSchedules };
    });
  },

  createLoan: (data) => {
    const now = getNow();
    const newLoan: LoanApplication = {
      id: `l_${Date.now()}`,
      loanNo: generateLoanNo(),
      title: data.title || '',
      reason: data.reason || '',
      exhibitionName: data.exhibitionName || '',
      collectionId: data.collectionId || '',
      collectionName: data.collectionName || '',
      collectionCode: data.collectionCode || '',
      collectionImage: data.collectionImage || '',
      borrower: data.borrower || {
        name: '',
        institution: '',
        contact: '',
        phone: '',
        address: ''
      },
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      insurance: data.insurance,
      transport: data.transport,
      status: 'pending',
      currentNode: 'curator',
      currentNodeName: '策展部',
      approvalRecords: [
        {
          id: `a_${Date.now()}`,
          nodeType: 'curator',
          nodeName: '策展部',
          approverId: '',
          approverName: '',
          status: 'pending',
          comment: '',
          createdAt: now,
          updatedAt: now
        }
      ],
      conflictStatus: data.conflictStatus || 'clear',
      conflictMessage: data.conflictMessage,
      creatorId: get().currentUser.id,
      creatorName: get().currentUser.name,
      createdAt: now,
      updatedAt: now
    };

    set((state) => {
      const loans = [newLoan, ...state.loans];
      const newSchedules = computeSchedules(loans);
      saveToStorage(STORAGE_KEY_LOANS, loans);
      saveToStorage(STORAGE_KEY_SCHEDULES, newSchedules);
      return { loans, schedules: newSchedules };
    });

    return newLoan;
  },

  updateLoan: (loanId, data) => {
    const now = getNow();
    set((state) => {
      const loans = state.loans.map((loan) => {
        if (loan.id !== loanId) return loan;
        return {
          ...loan,
          ...data,
          updatedAt: now
        };
      });
      const newSchedules = computeSchedules(loans);
      saveToStorage(STORAGE_KEY_LOANS, loans);
      saveToStorage(STORAGE_KEY_SCHEDULES, newSchedules);
      return { loans, schedules: newSchedules };
    });
  },

  cancelLoan: (loanId) => {
    const now = getNow();
    set((state) => {
      const loans = state.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'cancelled' as LoanStatus,
              currentNode: null,
              currentNodeName: '',
              updatedAt: now
            }
          : l
      );
      const newSchedules = computeSchedules(loans);
      saveToStorage(STORAGE_KEY_LOANS, loans);
      saveToStorage(STORAGE_KEY_SCHEDULES, newSchedules);
      return { loans, schedules: newSchedules };
    });
  },

  checkConflict: (collectionId, startDate, endDate, excludeLoanId) => {
    return checkScheduleConflict(collectionId, startDate, endDate, get().schedules, excludeLoanId);
  }
}));
