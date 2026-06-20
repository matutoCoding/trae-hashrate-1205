export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalNodeType = 'curator' | 'conservator' | 'director';
export type LoanStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'lent' | 'returned' | 'cancelled';
export type ConflictStatus = 'clear' | 'conflict' | 'warning';

export interface Collection {
  id: string;
  name: string;
  code: string;
  category: string;
  era: string;
  artist: string;
  imageUrl: string;
  description: string;
  dimensions: string;
  material: string;
  condition: string;
  location: string;
  isAvailable: boolean;
}

export interface Borrower {
  name: string;
  institution: string;
  contact: string;
  phone: string;
  address: string;
}

export interface InsuranceInfo {
  company: string;
  policyNo: string;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface TransportInfo {
  company: string;
  trackingNo: string;
  method: string;
  departureDate: string;
  returnDate: string;
  vehicleNo?: string;
  handler: string;
}

export interface ApprovalRecord {
  id: string;
  nodeType: ApprovalNodeType;
  nodeName: string;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplication {
  id: string;
  loanNo: string;
  title: string;
  reason: string;
  exhibitionName: string;
  collectionId: string;
  collectionName: string;
  collectionCode: string;
  collectionImage: string;
  borrower: Borrower;
  startDate: string;
  endDate: string;
  insurance?: InsuranceInfo;
  transport?: TransportInfo;
  status: LoanStatus;
  currentNode: ApprovalNodeType | null;
  currentNodeName: string;
  approvalRecords: ApprovalRecord[];
  conflictStatus: ConflictStatus;
  conflictMessage?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  loanId: string;
  loanNo: string;
  collectionId: string;
  collectionName: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  borrower: string;
}

export interface UserInfo {
  id: string;
  name: string;
  role: ApprovalNodeType;
  roleName: string;
  department: string;
  avatar: string;
  phone: string;
}

export interface ApprovalFlowConfig {
  nodes: ApprovalNodeType[];
  nodeNames: Record<ApprovalNodeType, string>;
}

export const APPROVAL_FLOW: ApprovalFlowConfig = {
  nodes: ['curator', 'conservator', 'director'],
  nodeNames: {
    curator: '策展部',
    conservator: '保管部',
    director: '馆长'
  }
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  draft: '草稿',
  pending: '审批中',
  approved: '审批通过',
  rejected: '已驳回',
  lent: '已借出',
  returned: '已归还',
  cancelled: '已取消'
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回'
};
