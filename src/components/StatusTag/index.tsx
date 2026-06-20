import React from 'react';
import { View, Text } from '@tarojs/components';
import { LoanStatus, ApprovalStatus, ConflictStatus } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusTagProps {
  type: 'loan' | 'approval' | 'conflict';
  status: LoanStatus | ApprovalStatus | ConflictStatus;
  text?: string;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  'loan-draft': { label: '草稿', className: styles.tagDraft },
  'loan-pending': { label: '审批中', className: styles.tagPending },
  'loan-approved': { label: '已通过', className: styles.tagApproved },
  'loan-rejected': { label: '已驳回', className: styles.tagRejected },
  'loan-lent': { label: '已借出', className: styles.tagLent },
  'loan-returned': { label: '已归还', className: styles.tagReturned },
  'loan-cancelled': { label: '已取消', className: styles.tagCancelled },
  'approval-pending': { label: '待审批', className: styles.tagPending },
  'approval-approved': { label: '已通过', className: styles.tagApproved },
  'approval-rejected': { label: '已驳回', className: styles.tagRejected },
  'conflict-clear': { label: '无冲突', className: styles.tagClear },
  'conflict-warning': { label: '档期预警', className: styles.tagWarning },
  'conflict-conflict': { label: '档期冲突', className: styles.tagConflict }
};

const StatusTag: React.FC<StatusTagProps> = ({ type, status, text }) => {
  const key = `${type}-${status}`;
  const config = STATUS_MAP[key] || { label: status, className: styles.tagPending };
  const displayText = text || config.label;

  return (
    <View className={classnames(styles.tag, config.className)}>
      <Text className={styles.tagText}>{displayText}</Text>
    </View>
  );
};

export default StatusTag;
