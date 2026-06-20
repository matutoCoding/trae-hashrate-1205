import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import CollectionCard from '@/components/CollectionCard';
import EmptyState from '@/components/EmptyState';
import classnames from 'classnames';

type FilterType = 'all' | 'available' | 'occupied';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部藏品' },
  { key: 'available', label: '可外借' },
  { key: 'occupied', label: '占用中' }
];

const CollectionSchedulePage: React.FC = () => {
  const { collections, getSchedulesByCollection } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');

  const collectionWithStatus = useMemo(() => {
    return collections.map((c) => ({
      ...c,
      schedules: getSchedulesByCollection(c.id)
    }));
  }, [collections, getSchedulesByCollection]);

  const filteredList = useMemo(() => {
    let list = collectionWithStatus;

    if (searchText) {
      const keyword = searchText.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.code.toLowerCase().includes(keyword) ||
          c.category.toLowerCase().includes(keyword)
      );
    }

    if (activeFilter === 'available') {
      list = list.filter(
        (c) =>
          c.isAvailable &&
          !c.schedules.some((s) => ['pending', 'approved', 'lent'].includes(s.status))
      );
    } else if (activeFilter === 'occupied') {
      list = list.filter((c) =>
        c.schedules.some((s) => ['pending', 'approved', 'lent'].includes(s.status))
      );
    }

    return list;
  }, [collectionWithStatus, searchText, activeFilter]);

  const totalCount = collections.length;
  const availableCount = collectionWithStatus.filter(
    (c) =>
      c.isAvailable &&
      !c.schedules.some((s) => ['pending', 'approved', 'lent'].includes(s.status))
  ).length;
  const occupiedCount = collectionWithStatus.filter((c) =>
    c.schedules.some((s) => ['pending', 'approved', 'lent'].includes(s.status))
  ).length;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>藏品排期</Text>
        <Text className={styles.headerDesc}>查看藏品信息与档期占用情况</Text>
      </View>

      <View className={styles.searchBox}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索藏品名称、编号、类别"
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <View className={classnames(styles.statIcon, styles.blue)}>
            <Text>📚</Text>
          </View>
          <View className={styles.statInfo}>
            <Text className={styles.statNumber}>{totalCount}</Text>
            <Text className={styles.statLabel}>藏品总数</Text>
          </View>
        </View>
        <View className={styles.statItem}>
          <View className={classnames(styles.statIcon, styles.green)}>
            <Text>✅</Text>
          </View>
          <View className={styles.statInfo}>
            <Text className={styles.statNumber}>{availableCount}</Text>
            <Text className={styles.statLabel}>可外借</Text>
          </View>
        </View>
        <View className={styles.statItem}>
          <View className={classnames(styles.statIcon, styles.orange)}>
            <Text>📅</Text>
          </View>
          <View className={styles.statInfo}>
            <Text className={styles.statNumber}>{occupiedCount}</Text>
            <Text className={styles.statLabel}>占用中</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {FILTERS.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.tabItem, activeFilter === filter.key && styles.active)}
            onClick={() => setActiveFilter(filter.key)}
          >
            <Text className={styles.tabText}>{filter.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContainer} style={{ height: 'calc(100vh - 640rpx)' }}>
        {filteredList.length > 0 ? (
          filteredList.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              schedules={collection.schedules}
            />
          ))
        ) : (
          <EmptyState
            title="未找到相关藏品"
            description="尝试更换搜索关键词或筛选条件"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default CollectionSchedulePage;
