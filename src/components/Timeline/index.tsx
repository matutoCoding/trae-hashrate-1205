import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { ApprovalRecord, APPROVAL_FLOW, ApprovalNodeType } from '@/types';
import { formatDateTime } from '@/utils';
import classnames from 'classnames';

interface TimelineProps {
  records: ApprovalRecord[];
}

const Timeline: React.FC<TimelineProps> = ({ records }) => {
  const allNodes: ApprovalNodeType[] = APPROVAL_FLOW.nodes;

  const getNodeRecord = (nodeType: ApprovalNodeType): ApprovalRecord | undefined => {
    return records.find((r) => r.nodeType === nodeType);
  };

  return (
    <View className={styles.timeline}>
      {allNodes.map((nodeType, index) => {
        const record = getNodeRecord(nodeType);
        const nodeName = APPROVAL_FLOW.nodeNames[nodeType];
        const status = record?.status || 'pending';
        const isLast = index === allNodes.length - 1;

        return (
          <View key={nodeType} className={styles.timelineItem}>
            <View className={styles.indicatorColumn}>
              <View
                className={classnames(
                  styles.dot,
                  status === 'approved' && styles.dotApproved,
                  status === 'rejected' && styles.dotRejected,
                  status === 'pending' && styles.dotPending
                )}
              >
                <Text className={styles.dotIndex}>{index + 1}</Text>
              </View>
              {!isLast && (
                <View
                  className={classnames(
                    styles.line,
                    status === 'approved' && styles.lineApproved,
                    status === 'rejected' && styles.lineRejected
                  )}
                />
              )}
            </View>
            <View className={styles.contentColumn}>
              <View className={styles.nodeHeader}>
                <Text className={styles.nodeName}>{nodeName}</Text>
                {record && (
                  <StatusTag type="approval" status={status} />
                )}
              </View>
              {record && record.approverName && (
                <View className={styles.approverInfo}>
                  <Text className={styles.approverName}>{record.approverName}</Text>
                  <Text className={styles.approverTime}>{formatDateTime(record.updatedAt)}</Text>
                </View>
              )}
              {record && record.comment && (
                <View className={styles.commentBox}>
                  <Text className={styles.commentText}>{record.comment}</Text>
                </View>
              )}
              {!record && (
                <Text className={styles.waitingText}>等待审批...</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Timeline;
