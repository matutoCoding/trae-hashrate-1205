import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const MinePage: React.FC = () => {
  const { currentUser, getMyLoans, getPendingApprovals, getProcessedApprovals } = useAppStore();

  const myLoans = useMemo(() => getMyLoans(currentUser.id), [getMyLoans, currentUser.id]);
  const pendingCount = useMemo(
    () => getPendingApprovals(currentUser.role).length,
    [getPendingApprovals, currentUser.role]
  );
  const processedCount = useMemo(
    () => getProcessedApprovals(currentUser.role).length,
    [getProcessedApprovals, currentUser.role]
  );
  const approvedCount = useMemo(
    () => myLoans.filter((l) => l.status === 'approved' || l.status === 'lent' || l.status === 'returned').length,
    [myLoans]
  );

  const handleNavTo = (url: string) => {
    Taro.switchTab({ url }).catch(() => {
      Taro.navigateTo({ url });
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileSection}>
        <Image
          className={styles.avatar}
          src={currentUser.avatar}
          mode="aspectFill"
        />
        <View className={styles.userInfo}>
          <Text className={styles.userName}>{currentUser.name}</Text>
          <Text className={styles.userRole}>{currentUser.roleName}</Text>
          <Text className={styles.userDept}>{currentUser.department}</Text>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statCol}>
          <Text className={styles.statNumber}>{myLoans.length}</Text>
          <Text className={styles.statLabel}>我的申请</Text>
        </View>
        <View className={styles.statCol}>
          <Text className={styles.statNumber}>{approvedCount}</Text>
          <Text className={styles.statLabel}>已通过</Text>
        </View>
        <View className={styles.statCol}>
          <Text className={styles.statNumber}>{pendingCount}</Text>
          <Text className={styles.statLabel}>待审批</Text>
        </View>
        <View className={styles.statCol}>
          <Text className={styles.statNumber}>{processedCount}</Text>
          <Text className={styles.statLabel}>已处理</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>快捷功能</Text>
        <View className={styles.menuItem} onClick={() => handleNavTo('/pages/index/index')}>
          <View className={styles.menuIcon}>
            <Text>✅</Text>
          </View>
          <Text className={styles.menuText}>审批中心</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleNavTo('/pages/loan/index')}>
          <View className={styles.menuIcon}>
            <Text>📝</Text>
          </View>
          <Text className={styles.menuText}>外借登记</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleNavTo('/pages/collection/index')}>
          <View className={styles.menuIcon}>
            <Text>🏛️</Text>
          </View>
          <Text className={styles.menuText}>藏品排期</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View style={{ height: '32rpx' }} />

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>联系我们</Text>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>
            <Text>📞</Text>
          </View>
          <Text className={styles.menuText}>联系电话</Text>
          <Text className={styles.menuText} style={{ color: '$color-text-secondary', fontSize: '24rpx', flex: 0 }}>
            {currentUser.phone}
          </Text>
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>
            <Text>💡</Text>
          </View>
          <Text className={styles.menuText}>系统版本</Text>
          <Text className={styles.menuText} style={{ color: '$color-text-secondary', fontSize: '24rpx', flex: 0 }}>
            v1.0.0
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
