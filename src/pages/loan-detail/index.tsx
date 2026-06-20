import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import Timeline from '@/components/Timeline';
import { formatDate, formatDateTime, getDaysBetween, formatCurrency } from '@/utils';
import classnames from 'classnames';

const LoanDetailPage: React.FC = () => {
  const router = useRouter();
  const loanId = router.params.id as string;
  const { cancelLoan, resubmitLoan, currentUser } = useAppStore();
  const loan = useAppStore((state) => state.getLoanById(loanId));

  if (!loan) {
    return (
      <View className={styles.page}>
        <View className={styles.card}>
          <Text>未找到外借申请</Text>
        </View>
      </View>
    );
  }

  const isCreator = loan.creatorId === currentUser.id;
  const canCancel = isCreator && ['pending', 'approved'].includes(loan.status);
  const canEdit = isCreator && ['pending', 'rejected'].includes(loan.status);
  const canResubmit = isCreator && loan.status === 'rejected';

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消该外借申请吗？取消后档期将自动释放。',
      success: (res) => {
        if (res.confirm) {
          cancelLoan(loanId);
          Taro.showToast({ title: '已取消', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  const handleEdit = () => {
    Taro.navigateTo({
      url: `/pages/loan-create/index?loanId=${loanId}`
    });
  };

  const handleResubmit = () => {
    Taro.showModal({
      title: '确认重新提交',
      content: '重新提交后将从策展部开始重新走审批流程。',
      success: (res) => {
        if (res.confirm) {
          resubmitLoan(loanId);
          Taro.showToast({ title: '已重新提交', icon: 'success' });
        }
      }
    });
  };

  const handleViewCollection = () => {
    Taro.navigateTo({
      url: `/pages/collection-detail/index?id=${loan.collectionId}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.card}>
        <View className={styles.titleBar}>
          <View style={{ flex: 1 }}>
            <Text className={styles.title}>{loan.title}</Text>
            <Text className={styles.loanNo}>单号：{loan.loanNo}</Text>
          </View>
          <StatusTag type="loan" status={loan.status} />
        </View>

        {loan.conflictStatus === 'conflict' && (
          <View className={styles.statusBanner}>
            <Text className={styles.statusText}>⚠️ {loan.conflictMessage}</Text>
          </View>
        )}

        <Text className={styles.exhibitionName}>{loan.exhibitionName}</Text>
        <Text className={styles.reasonText}>{loan.reason}</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>藏品信息</Text>
        <View className={styles.collectionCard} onClick={handleViewCollection}>
          <Image
            className={styles.collectionImage}
            src={loan.collectionImage}
            mode="aspectFill"
          />
          <View className={styles.collectionDetail}>
            <Text className={styles.collectionName}>{loan.collectionName}</Text>
            <Text className={styles.collectionMeta}>编号：{loan.collectionCode}</Text>
            <Text className={styles.collectionMeta} style={{ color: '$color-primary' }}>点击查看详情 ›</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>借展信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>借展方</Text>
          <Text className={styles.infoValue}>{loan.borrower.institution}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>联系人</Text>
          <Text className={styles.infoValue}>{loan.borrower.contact} · {loan.borrower.phone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>借展地址</Text>
          <Text className={styles.infoValue}>{loan.borrower.address}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>借展周期</Text>
          <Text className={styles.infoValue}>
            {formatDate(loan.startDate)} 至 {formatDate(loan.endDate)}
            （{getDaysBetween(loan.startDate, loan.endDate)}天）
          </Text>
        </View>
      </View>

      {loan.insurance && (
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>保险信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>保险公司</Text>
            <Text className={styles.infoValue}>{loan.insurance.company}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>保单号</Text>
            <Text className={styles.infoValue}>{loan.insurance.policyNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>保额</Text>
            <Text className={styles.infoValue}>{formatCurrency(loan.insurance.amount)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>保期</Text>
            <Text className={styles.infoValue}>
              {formatDate(loan.insurance.startDate)} 至 {formatDate(loan.insurance.endDate)}
            </Text>
          </View>
        </View>
      )}

      {loan.transport && (
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>运输信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>运输公司</Text>
            <Text className={styles.infoValue}>{loan.transport.company}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>运输方式</Text>
            <Text className={styles.infoValue}>{loan.transport.method}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>运单号</Text>
            <Text className={styles.infoValue}>{loan.transport.trackingNo}</Text>
          </View>
          {loan.transport.vehicleNo && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>车牌号</Text>
              <Text className={styles.infoValue}>{loan.transport.vehicleNo}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>押运人</Text>
            <Text className={styles.infoValue}>{loan.transport.handler}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>出发日期</Text>
            <Text className={styles.infoValue}>{formatDate(loan.transport.departureDate)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>归还日期</Text>
            <Text className={styles.infoValue}>{formatDate(loan.transport.returnDate)}</Text>
          </View>
        </View>
      )}

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>审批流程</Text>
        <Timeline records={loan.approvalRecords} />
      </View>

      <View className={styles.card} style={{ marginBottom: '200rpx' }}>
        <Text className={styles.sectionTitle}>申请信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>申请人</Text>
          <Text className={styles.infoValue}>{loan.creatorName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>申请时间</Text>
          <Text className={styles.infoValue}>{formatDateTime(loan.createdAt)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>更新时间</Text>
          <Text className={styles.infoValue}>{formatDateTime(loan.updatedAt)}</Text>
        </View>
      </View>

      {(canCancel || canEdit || canResubmit) && (
        <View className={styles.actionBar}>
          {canCancel && (
            <View className={classnames(styles.btn, styles.btnCancel)} onClick={handleCancel}>
              <Text className={styles.btnCancelText}>取消申请</Text>
            </View>
          )}
          {canEdit && (
            <View className={classnames(styles.btn, styles.btnEdit)} onClick={handleEdit}>
              <Text className={styles.btnEditText}>编辑</Text>
            </View>
          )}
          {canResubmit && (
            <View className={classnames(styles.btn, styles.btnResubmit)} onClick={handleResubmit}>
              <Text className={styles.btnResubmitText}>重新提交</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default LoanDetailPage;
