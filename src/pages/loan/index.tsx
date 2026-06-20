import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import ApprovalCard from '@/components/ApprovalCard';
import EmptyState from '@/components/EmptyState';
import { LoanStatus, LOAN_STATUS_LABELS } from '@/types';
import classnames from 'classnames';

type FilterType = 'all' | LoanStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '审批中' },
  { key: 'approved', label: '已通过' },
  { key: 'lent', label: '已借出' },
  { key: 'returned', label: '已归还' },
  { key: 'rejected', label: '已驳回' }
];

const LoanRegisterPage: React.FC = () => {
  const { currentUser, getMyLoans } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const myLoans = useMemo(() => getMyLoans(currentUser.id), [getMyLoans, currentUser.id]);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return myLoans;
    return myLoans.filter((l) => l.status === activeFilter);
  }, [myLoans, activeFilter]);

  const getFilterCount = (key: FilterType): number => {
    if (key === 'all') return myLoans.length;
    return myLoans.filter((l) => l.status === key).length;
  };

  const handleCreateLoan = () => {
    Taro.navigateTo({
      url: '/pages/loan-create/index'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>外借登记</Text>
        <Text className={styles.headerDesc}>发起和管理藏品外借申请</Text>
      </View>

      <View className={styles.createButton} onClick={handleCreateLoan}>
        <Text className={styles.createButtonText}>+ 发起新的外借申请</Text>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {FILTERS.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterItem, activeFilter === filter.key && styles.active)}
            onClick={() => setActiveFilter(filter.key)}
          >
            <Text className={styles.filterText}>
              {filter.label}
              <Text className={styles.filterCount}>{getFilterCount(filter.key)}</Text>
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.listContainer} style={{ height: 'calc(100vh - 440rpx)' }}>
        {filteredList.length > 0 ? (
          filteredList.map((loan) => (
            <ApprovalCard key={loan.id} loan={loan} viewMode="loan" />
          ))
        ) : (
          <EmptyState
            title={activeFilter === 'all' ? '暂无外借申请' : `暂无${LOAN_STATUS_LABELS[activeFilter]}的申请`}
            description="点击上方按钮发起新的外借申请"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default LoanRegisterPage;
