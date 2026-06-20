import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils';
import classnames from 'classnames';

const CollectionDetailPage: React.FC = () => {
  const router = useRouter();
  const collectionId = router.params.id as string;
  const collection = useAppStore((state) => state.getCollectionById(collectionId));
  const schedules = useAppStore((state) => state.getSchedulesByCollection(collectionId));

  if (!collection) {
    return (
      <View className={styles.page}>
        <View className={styles.card}>
          <Text>未找到藏品信息</Text>
        </View>
      </View>
    );
  }

  const hasActiveSchedule = schedules.length > 0;
  const canBorrow = collection.isAvailable;

  const handleCreateLoan = () => {
    if (!canBorrow) {
      Taro.showToast({ title: '该藏品暂不外借', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/loan-create/index?collectionId=${collectionId}`
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.heroImage}>
        <Image
          className={styles.heroImg}
          src={collection.imageUrl}
          mode="aspectFill"
        />
      </View>

      <View className={styles.card}>
        <View className={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text className={styles.name}>{collection.name}</Text>
            <Text className={styles.code}>藏品编号：{collection.code}</Text>
          </View>
          {hasActiveSchedule ? (
            <StatusTag type="conflict" status="conflict" text="占用中" />
          ) : collection.isAvailable ? (
            <StatusTag type="conflict" status="clear" text="可外借" />
          ) : (
            <StatusTag type="loan" status="draft" text="暂不外借" />
          )}
        </View>

        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>藏品类别</Text>
            <Text className={styles.infoValue}>{collection.category}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>年代</Text>
            <Text className={styles.infoValue}>{collection.era}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>作者</Text>
            <Text className={styles.infoValue}>{collection.artist}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>材质</Text>
            <Text className={styles.infoValue}>{collection.material}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>尺寸</Text>
            <Text className={styles.infoValue}>{collection.dimensions}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>品相</Text>
            <Text className={styles.infoValue}>{collection.condition}</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>馆藏位置</Text>
        <Text className={styles.description}>{collection.location}</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>藏品简介</Text>
        <Text className={styles.description}>{collection.description}</Text>
      </View>

      <View className={styles.card} style={{ marginBottom: '200rpx' }}>
        <Text className={styles.sectionTitle}>排期记录（{schedules.length}）</Text>
        {schedules.length > 0 ? (
          schedules.map((s) => (
            <View key={s.id} className={styles.scheduleItem}>
              <View className={styles.scheduleHeader}>
                <Text className={styles.scheduleBorrower}>{s.borrower}</Text>
                <StatusTag type="loan" status={s.status} />
              </View>
              <Text className={styles.scheduleLoanNo}>单号：{s.loanNo}</Text>
              <Text className={styles.scheduleDates}>
                档期：{formatDate(s.startDate)} 至 {formatDate(s.endDate)}
              </Text>
            </View>
          ))
        ) : (
          <Text className={styles.description}>暂无排期记录</Text>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.btn, canBorrow ? styles.btnPrimary : styles.btnDisabled)}
          onClick={handleCreateLoan}
        >
          <Text className={styles.btnText}>
            {canBorrow ? '申请外借该藏品' : '当前不可外借'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CollectionDetailPage;
