import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Collection, ScheduleItem } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils';

interface CollectionCardProps {
  collection: Collection;
  schedules?: ScheduleItem[];
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, schedules = [] }) => {
  const hasActiveSchedule = schedules.some((s) =>
    ['pending', 'approved', 'lent'].includes(s.status)
  );

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/collection-detail/index?id=${collection.id}`
    });
  };

  const currentSchedule = schedules.find(
    (s) => ['pending', 'approved', 'lent'].includes(s.status)
  );

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image
        className={styles.image}
        src={collection.imageUrl}
        mode="aspectFill"
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{collection.name}</Text>
          {hasActiveSchedule ? (
            <StatusTag type="conflict" status="conflict" text="占用中" />
          ) : collection.isAvailable ? (
            <StatusTag type="conflict" status="clear" text="可外借" />
          ) : (
            <StatusTag type="loan" status="draft" text="暂不外借" />
          )}
        </View>
        <View className={styles.meta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>编号</Text>
            <Text className={styles.metaValue}>{collection.code}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>类别</Text>
            <Text className={styles.metaValue}>{collection.category}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>年代</Text>
            <Text className={styles.metaValue}>{collection.era}</Text>
          </View>
        </View>
        <View className={styles.location}>
          <Text className={styles.locationLabel}>馆藏位置：</Text>
          <Text className={styles.locationValue}>{collection.location}</Text>
        </View>
        {currentSchedule && (
          <View className={styles.scheduleBar}>
            <Text className={styles.scheduleText}>
              {currentSchedule.borrower} 借展至 {formatDate(currentSchedule.endDate)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CollectionCard;
