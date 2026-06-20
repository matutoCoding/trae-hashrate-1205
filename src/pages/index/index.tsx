import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import ApprovalCard from '@/components/ApprovalCard';
import EmptyState from '@/components/EmptyState';
import classnames from 'classnames';

type TabType = 'pending' | 'processed';

const ApprovalCenterPage: React.FC = () => {
  const { currentUser, getPendingApprovals, getProcessedApprovals } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const pendingList = useMemo(
    () => getPendingApprovals(currentUser.role),
    [getPendingApprovals, currentUser.role]
  );

  const processedList = useMemo(
    () => getProcessedApprovals(currentUser.role),
    [getProcessedApprovals, currentUser.role]
  );

  const displayList = activeTab === 'pending' ? pendingList : processedList;

  const handleCreateLoan = () => {
    Taro.navigateTo({
      url: '/pages/loan-create/index'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userGreeting}>
          <Image
            className={styles.avatar}
            src={currentUser.avatar}
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>您好，{currentUser.name}</Text>
            <Text className={styles.userRole}>{currentUser.roleName} · {currentUser.department}</Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statValue, pendingList.length > 0 && styles.warning)}>
              {pendingList.length}
            </Text>
            <Text className={styles.statLabel}>待我审批</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{processedList.length}</Text>
            <Text className={styles.statLabel}>我已审批</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'pending' && styles.active)}
          onClick={() => setActiveTab('pending')}
        >
          <Text className={styles.tabText}>
            待审批
            {pendingList.length > 0 && (
              <Text className={styles.badge}>{pendingList.length}</Text>
            )}
          </Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'processed' && styles.active)}
          onClick={() => setActiveTab('processed')}
        >
          <Text className={styles.tabText}>已审批</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.listContainer} style={{ height: 'calc(100vh - 500rpx)' }}>
        {displayList.length > 0 ? (
          displayList.map((loan) => (
            <ApprovalCard key={loan.id} loan={loan} />
          ))
        ) : (
          <EmptyState
            title={activeTab === 'pending' ? '暂无待审批事项' : '暂无已审批记录'}
            description={activeTab === 'pending' ? '当前没有需要您审批的申请' : '您还没有处理过审批'}
          />
        )}
      </ScrollView>

      <View className={styles.fabButton} onClick={handleCreateLoan}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
};

export default ApprovalCenterPage;
