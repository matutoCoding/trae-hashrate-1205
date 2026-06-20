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
import { mockLoanApplications, mockCurrentUser, mockSchedules } from '@/data/mockApprovals';
import { mockCollections } from '@/data/mockCollections';
import { generateLoanNo, checkScheduleConflict } from '@/utils';

interface AppState {
  currentUser: UserInfo;
  loans: LoanApplication[];
  collections: Collection[];
  schedules: ScheduleItem[];
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
  cancelLoan: (loanId: string) => void;
  checkConflict: (collectionId: string, startDate: string, endDate: string, excludeLoanId?: string) => { hasConflict: boolean; conflicts: ScheduleItem[]; message: string };
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockCurrentUser,
  loans: mockLoanApplications,
  collections: mockCollections,
  schedules: mockSchedules,

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
    set((state) => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
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
          updatedRecords.push({
            id: `a_${Date.now()}`,
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

        return {
          ...loan,
          status: isLastNode ? 'approved' as LoanStatus : 'pending' as LoanStatus,
          currentNode: nextNode,
          currentNodeName: nextNodeName,
          approvalRecords: updatedRecords,
          updatedAt: now
        };
      });

      return { ...state, loans };
    });
  },

  rejectLoan: (loanId, approverId, approverName, comment) => {
    set((state) => {
      const loans = state.loans.map((loan) => {
        if (loan.id !== loanId) return loan;
        const nodes = APPROVAL_FLOW.nodes;
        const currentIndex = nodes.findIndex((n) => n === loan.currentNode);

        const loanCopy = { ...loan };
        const targetRecord = loanCopy.approvalRecords.find((r) => r.nodeType === loanCopy.currentNode);
        if (targetRecord) {
          targetRecord.status = 'rejected';
          targetRecord.approverId = approverId;
          targetRecord.approverName = approverName;
          targetRecord.comment = comment;
          targetRecord.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }

        const prevNode = currentIndex > 0 ? nodes[currentIndex - 1] : null;
        const prevNodeName = prevNode ? APPROVAL_FLOW.nodeNames[prevNode] : '';

        loanCopy.status = 'rejected';
        loanCopy.currentNode = prevNode;
        loanCopy.currentNodeName = prevNodeName;
        loanCopy.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

        return loanCopy;
      });
      return { ...state, loans };
    });
  },

  createLoan: (data) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
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
    set((state) => ({
      loans: [newLoan, ...state.loans],
      schedules: [
        ...state.schedules,
        {
          id: `s_${newLoan.id}`,
          loanId: newLoan.id,
          loanNo: newLoan.loanNo,
          collectionId: newLoan.collectionId,
          collectionName: newLoan.collectionName,
          startDate: newLoan.startDate,
          endDate: newLoan.endDate,
          status: newLoan.status,
          borrower: newLoan.borrower.name
        }
      ]
    }));
    return newLoan;
  },

  cancelLoan: (loanId) => {
    set((state) => ({
      loans: state.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'cancelled',
              currentNode: null,
              currentNodeName: '',
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : l
      ),
      schedules: state.schedules.filter((s) => s.loanId !== loanId)
    }));
  },

  checkConflict: (collectionId, startDate, endDate, excludeLoanId) => {
    return checkScheduleConflict(collectionId, startDate, endDate, get().schedules, excludeLoanId);
  }
}));
