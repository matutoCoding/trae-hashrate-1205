import React, { useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import Timeline from '@/components/Timeline';
import { formatDate, formatDateTime, getDaysBetween, formatCurrency } from '@/utils';
import classnames from 'classnames';

const ApprovalDetailPage: React.FC = () => {
  const router = useRouter();
  const loanId = router.params.id as string;
  const { currentUser, approveLoan, rejectLoan } = useAppStore();
  const loan = useAppStore((state) => state.getLoanById(loanId));
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);

  if (!loan) {
    return (
      <View className={styles.page}>
        <View className={styles.card}>
          <Text>未找到审批记录</Text>
        </View>
      </View>
    );
  }

  const isMyApproval = loan.status === 'pending' && loan.currentNode === currentUser.role;

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    approveLoan(loanId, currentUser.id, currentUser.name, approveComment || '同意');
    setShowApproveModal(false);
    Taro.showToast({ title: '审批通过', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectComment.trim()) {
      Taro.showToast({ title: '请填写驳回原因', icon: 'none' });
      return;
    }
    rejectLoan(loanId, currentUser.id, currentUser.name, rejectComment);
    setShowRejectModal(false);
    Taro.showToast({ title: '已驳回', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
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
          <View className={classnames(styles.statusBanner, styles.rejected)}>
            <Text className={styles.statusText}>⚠️ {loan.conflictMessage}</Text>
          </View>
        )}

        <Text className={styles.exhibitionName}>{loan.exhibitionName}</Text>
        <Text className={styles.reason}>{loan.reason}</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>藏品信息</Text>
        <View className={styles.collectionInfo}>
          <Image
            className={styles.collectionImage}
            src={loan.collectionImage}
            mode="aspectFill"
          />
          <View className={styles.collectionDetail}>
            <Text className={styles.collectionName}>{loan.collectionName}</Text>
            <Text className={styles.collectionMeta}>编号：{loan.collectionCode}</Text>
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

      {isMyApproval && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.btn, styles.btnEdit)}
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/loan-create/index?loanId=${loanId}`
              });
            }}
          >
            <Text className={styles.btnEditText}>编辑</Text>
          </View>
          <View className={classnames(styles.btn, styles.btnReject)} onClick={handleReject}>
            <Text className={styles.btnRejectText}>驳回</Text>
          </View>
          <View className={classnames(styles.btn, styles.btnApprove)} onClick={handleApprove}>
            <Text className={styles.btnApproveText}>通过</Text>
          </View>
        </View>
      )}

      {showRejectModal && (
        <View className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>请填写驳回原因</Text>
            <Textarea
              className={styles.modalTextarea}
              placeholder="请详细说明驳回原因..."
              value={rejectComment}
              onInput={(e) => setRejectComment(e.detail.value)}
              maxlength={500}
            />
            <View className={styles.modalButtons}>
              <View
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowRejectModal(false)}
              >
                <Text className={styles.modalBtnCancelText}>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.modalBtnConfirm)}
                onClick={handleConfirmReject}
              >
                <Text className={styles.modalBtnConfirmText}>确认驳回</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showApproveModal && (
        <View className={styles.modalOverlay} onClick={() => setShowApproveModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>请填写审批意见（选填）</Text>
            <Textarea
              className={styles.modalTextarea}
              placeholder="可填写审批意见..."
              value={approveComment}
              onInput={(e) => setApproveComment(e.detail.value)}
              maxlength={500}
            />
            <View className={styles.modalButtons}>
              <View
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowApproveModal(false)}
              >
                <Text className={styles.modalBtnCancelText}>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.modalBtnConfirmSuccess)}
                onClick={handleConfirmApprove}
              >
                <Text className={styles.modalBtnConfirmSuccessText}>确认通过</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ApprovalDetailPage;
