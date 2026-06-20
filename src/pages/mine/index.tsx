import React, { useMemo, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import classnames from 'classnames';

const MinePage: React.FC = () => {
  const { currentUser, allUsers, switchUser, getMyLoans, getPendingApprovals, getProcessedApprovals } = useAppStore();
  const [showRolePicker, setShowRolePicker] = useState(false);

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

  const handleSwitchRole = (userId: string) => {
    switchUser(userId);
    setShowRolePicker(false);
    Taro.showToast({ title: '已切换身份', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileSection} onClick={() => setShowRolePicker(true)}>
        <Image
          className={styles.avatar}
          src={currentUser.avatar}
          mode="aspectFill"
        />
        <View className={styles.userInfo}>
          <Text className={styles.userName}>
            {currentUser.name}
            <Text className={styles.switchHint}>（点击切换）</Text>
          </Text>
          <Text className={styles.userRole}>{currentUser.roleName}</Text>
          <Text className={styles.userDept}>{currentUser.department}</Text>
        </View>
        <Text className={styles.profileArrow}>›</Text>
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
          <Text className={styles.menuText} style={{ color: '#999', fontSize: '24rpx', flex: 0 }}>
            {currentUser.phone}
          </Text>
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>
            <Text>💡</Text>
          </View>
          <Text className={styles.menuText}>系统版本</Text>
          <Text className={styles.menuText} style={{ color: '#999', fontSize: '24rpx', flex: 0 }}>
            v1.0.0
          </Text>
        </View>
      </View>

      {showRolePicker && (
        <View className={styles.roleModalOverlay} onClick={() => setShowRolePicker(false)}>
          <View className={styles.roleModal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.roleModalTitle}>切换审批身份</Text>
            <Text className={styles.roleModalTip}>用于测试不同审批节点的流转效果</Text>
            {allUsers.map((user) => (
              <View
                key={user.id}
                className={classnames(
                  styles.roleOption,
                  currentUser.id === user.id && styles.roleOptionActive
                )}
                onClick={() => handleSwitchRole(user.id)}
              >
                <Image
                  className={styles.roleAvatar}
                  src={user.avatar}
                  mode="aspectFill"
                />
                <View className={styles.roleInfo}>
                  <Text className={styles.roleName}>{user.name}</Text>
                  <Text className={styles.roleDesc}>{user.roleName} · {user.department}</Text>
                </View>
                {currentUser.id === user.id && (
                  <Text className={styles.roleCheck}>✓</Text>
                )}
              </View>
            ))}
            <View className={styles.roleCancelBtn} onClick={() => setShowRolePicker(false)}>
              <Text className={styles.roleCancelText}>取消</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MinePage;
