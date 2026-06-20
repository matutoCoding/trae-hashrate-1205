import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { LoanApplication } from '@/types';
import { formatDateTime, formatDate, getDaysBetween } from '@/utils';

interface ApprovalCardProps {
  loan: LoanApplication;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ loan }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/approval-detail/index?id=${loan.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.loanNo}>
          <Text className={styles.loanNoText}>单号：{loan.loanNo}</Text>
        </View>
        <StatusTag type="loan" status={loan.status} />
      </View>

      <View className={styles.cardBody}>
        <Image
          className={styles.collectionImage}
          src={loan.collectionImage}
          mode="aspectFill"
        />
        <View className={styles.content}>
          <Text className={styles.title}>{loan.title}</Text>
          <View className={styles.collectionInfo}>
            <Text className={styles.collectionName}>{loan.collectionName}</Text>
            <Text className={styles.collectionCode}>{loan.collectionCode}</Text>
          </View>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>借展方</Text>
              <Text className={styles.metaValue}>{loan.borrower.institution}</Text>
            </View>
          </View>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>借展周期</Text>
              <Text className={styles.metaValue}>
                {formatDate(loan.startDate)} 至 {formatDate(loan.endDate)}
                <Text className={styles.days}>（{getDaysBetween(loan.startDate, loan.endDate)}天）</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loan.conflictStatus === 'conflict' && (
        <View className={styles.conflictBar}>
          <Text className={styles.conflictIcon}>!</Text>
          <Text className={styles.conflictText}>{loan.conflictMessage}</Text>
        </View>
      )}

      <View className={styles.cardFooter}>
        {loan.currentNode && (
          <View className={styles.currentNode}>
            <Text className={styles.nodeLabel}>当前节点：</Text>
            <Text className={styles.nodeValue}>{loan.currentNodeName}</Text>
          </View>
        )}
        <Text className={styles.createTime}>创建于 {formatDateTime(loan.createdAt)}</Text>
      </View>
    </View>
  );
};

export default ApprovalCard;
