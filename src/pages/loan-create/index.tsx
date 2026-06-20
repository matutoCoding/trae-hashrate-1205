import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { Collection, Borrower, InsuranceInfo, TransportInfo, ConflictStatus } from '@/types';
import classnames from 'classnames';

const LoanCreatePage: React.FC = () => {
  const router = useRouter();
  const preCollectionId = router.params.collectionId as string;
  const { collections, getSchedulesByCollection, checkConflict, createLoan } = useAppStore();

  const [title, setTitle] = useState('');
  const [exhibitionName, setExhibitionName] = useState('');
  const [reason, setReason] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerInstitution, setBorrowerInstitution] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [showInsurance, setShowInsurance] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState('');
  const [insuranceAmount, setInsuranceAmount] = useState('');
  const [insuranceStartDate, setInsuranceStartDate] = useState('');
  const [insuranceEndDate, setInsuranceEndDate] = useState('');
  const [showTransport, setShowTransport] = useState(false);
  const [transportCompany, setTransportCompany] = useState('');
  const [transportMethod, setTransportMethod] = useState('');
  const [transportTrackingNo, setTransportTrackingNo] = useState('');
  const [transportDepartureDate, setTransportDepartureDate] = useState('');
  const [transportReturnDate, setTransportReturnDate] = useState('');
  const [transportVehicleNo, setTransportVehicleNo] = useState('');
  const [transportHandler, setTransportHandler] = useState('');
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<ConflictStatus>('clear');
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    if (preCollectionId) {
      const col = collections.find((c) => c.id === preCollectionId);
      if (col) {
        setSelectedCollection(col);
      }
    }
  }, [preCollectionId, collections]);

  useEffect(() => {
    if (selectedCollection && startDate && endDate) {
      const result = checkConflict(selectedCollection.id, startDate, endDate);
      setConflictStatus(result.hasConflict ? 'conflict' : 'clear');
      setConflictMessage(result.message);
    } else {
      setConflictStatus('clear');
      setConflictMessage('');
    }
  }, [selectedCollection, startDate, endDate, checkConflict]);

  const collectionsWithStatus = useMemo(() => {
    return collections.map((c) => {
      const schedules = getSchedulesByCollection(c.id);
      const hasActive = schedules.some((s) =>
        ['pending', 'approved', 'lent'].includes(s.status)
      );
      return {
        ...c,
        isOccupied: hasActive
      };
    });
  }, [collections, getSchedulesByCollection]);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!exhibitionName.trim()) return false;
    if (!reason.trim()) return false;
    if (!selectedCollection) return false;
    if (!startDate || !endDate) return false;
    if (conflictStatus === 'conflict') return false;
    if (!borrowerName.trim()) return false;
    if (!borrowerInstitution.trim()) return false;
    if (!borrowerContact.trim()) return false;
    if (!borrowerPhone.trim()) return false;
    return true;
  }, [title, exhibitionName, reason, selectedCollection, startDate, endDate, conflictStatus, borrowerName, borrowerInstitution, borrowerContact, borrowerPhone]);

  const handleSelectCollection = (col: Collection) => {
    if (!col.isAvailable) {
      Taro.showToast({ title: '该藏品暂不外借', icon: 'none' });
      return;
    }
    const schedules = getSchedulesByCollection(col.id);
    const hasActive = schedules.some((s) =>
      ['pending', 'approved', 'lent'].includes(s.status)
    );
    if (hasActive) {
      Taro.showToast({ title: '该藏品档期已被占用', icon: 'none' });
      return;
    }
    setSelectedCollection(col);
    setShowCollectionPicker(false);
  };

  const handleStartDateChange = (e: any) => {
    setStartDate(e.detail.value);
  };

  const handleEndDateChange = (e: any) => {
    setEndDate(e.detail.value);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请完善必填信息', icon: 'none' });
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      Taro.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
      return;
    }

    const borrower: Borrower = {
      name: borrowerName,
      institution: borrowerInstitution,
      contact: borrowerContact,
      phone: borrowerPhone,
      address: borrowerAddress
    };

    let insurance: InsuranceInfo | undefined;
    if (showInsurance && insuranceCompany) {
      insurance = {
        company: insuranceCompany,
        policyNo: insurancePolicyNo,
        amount: Number(insuranceAmount) || 0,
        startDate: insuranceStartDate,
        endDate: insuranceEndDate
      };
    }

    let transport: TransportInfo | undefined;
    if (showTransport && transportCompany) {
      transport = {
        company: transportCompany,
        trackingNo: transportTrackingNo,
        method: transportMethod,
        departureDate: transportDepartureDate,
        returnDate: transportReturnDate,
        vehicleNo: transportVehicleNo || undefined,
        handler: transportHandler
      };
    }

    const newLoan = createLoan({
      title,
      exhibitionName,
      reason,
      collectionId: selectedCollection!.id,
      collectionName: selectedCollection!.name,
      collectionCode: selectedCollection!.code,
      collectionImage: selectedCollection!.imageUrl,
      borrower,
      startDate,
      endDate,
      insurance,
      transport,
      conflictStatus,
      conflictMessage
    });

    console.log('[LoanCreate] Created loan:', newLoan.loanNo);

    Taro.showToast({ title: '申请已提交', icon: 'success' });
    setTimeout(() => {
      Taro.redirectTo({
        url: `/pages/loan-detail/index?id=${newLoan.id}`
      });
    }, 1000);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>基本信息</Text>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>申请标题</Text>
          <Input
            className={styles.input}
            placeholder="请输入申请标题"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>展览名称</Text>
          <Input
            className={styles.input}
            placeholder="请输入展览名称"
            value={exhibitionName}
            onInput={(e) => setExhibitionName(e.detail.value)}
            maxlength={100}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>借展事由</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细说明借展事由..."
            value={reason}
            onInput={(e) => setReason(e.detail.value)}
            maxlength={500}
          />
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>藏品信息</Text>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>选择藏品</Text>
          <View
            className={styles.collectionPicker}
            onClick={() => setShowCollectionPicker(true)}
          >
            {selectedCollection ? (
              <View className={styles.collectionPickerInfo}>
                <Image
                  className={styles.collectionPickerImg}
                  src={selectedCollection.imageUrl}
                  mode="aspectFill"
                />
                <View className={styles.collectionPickerText}>
                  <Text className={styles.collectionPickerName}>{selectedCollection.name}</Text>
                  <Text className={styles.collectionPickerCode}>{selectedCollection.code} · {selectedCollection.category}</Text>
                </View>
              </View>
            ) : (
              <Text className={styles.collectionPickerPlaceholder}>请选择要外借的藏品</Text>
            )}
            <Text className={styles.collectionPickerArrow}>›</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>借展档期</Text>
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <Picker mode="date" value={startDate} onChange={handleStartDateChange}>
                <View className={classnames(styles.input, styles.pickerInput)}>
                  <Text className={startDate ? styles.pickerText : styles.pickerPlaceholder}>
                    {startDate || '开始日期'}
                  </Text>
                </View>
              </Picker>
            </View>
            <View className={styles.dateItem}>
              <Picker mode="date" value={endDate} onChange={handleEndDateChange}>
                <View className={classnames(styles.input, styles.pickerInput)}>
                  <Text className={endDate ? styles.pickerText : styles.pickerPlaceholder}>
                    {endDate || '结束日期'}
                  </Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>

        {conflictStatus === 'conflict' && (
          <View className={styles.conflictBanner}>
            <Text className={styles.conflictIcon}>!</Text>
            <Text className={styles.conflictText}>{conflictMessage}</Text>
          </View>
        )}
        {selectedCollection && startDate && endDate && conflictStatus === 'clear' && (
          <View className={styles.clearBanner}>
            <Text className={styles.clearIcon}>✓</Text>
            <Text className={styles.clearText}>{conflictMessage || '档期无冲突，可申请外借'}</Text>
          </View>
        )}
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>借展方信息</Text>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>借展机构</Text>
          <Input
            className={styles.input}
            placeholder="请输入借展机构名称"
            value={borrowerInstitution}
            onInput={(e) => setBorrowerInstitution(e.detail.value)}
            maxlength={100}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>联系人姓名</Text>
          <Input
            className={styles.input}
            placeholder="请输入联系人姓名"
            value={borrowerName}
            onInput={(e) => setBorrowerName(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>联系电话</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入联系电话"
            value={borrowerPhone}
            onInput={(e) => setBorrowerPhone(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>联系人职务</Text>
          <Input
            className={styles.input}
            placeholder="请输入联系人职务"
            value={borrowerContact}
            onInput={(e) => setBorrowerContact(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>借展地址</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请输入借展地址"
            value={borrowerAddress}
            onInput={(e) => setBorrowerAddress(e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.card}>
        <View
          className={classnames(styles.sectionTitle, styles.sectionToggle)}
          onClick={() => setShowInsurance(!showInsurance)}
        >
          <Text>保险信息（{showInsurance ? '已填写' : '选填'}）</Text>
          <Text className={styles.toggleIcon}>{showInsurance ? '−' : '+'}</Text>
        </View>

        {showInsurance && (
          <>
            <View className={classnames(styles.formItem, styles.formItemFirst)}>
              <Text className={styles.label}>保险公司</Text>
              <Input
                className={styles.input}
                placeholder="请输入保险公司名称"
                value={insuranceCompany}
                onInput={(e) => setInsuranceCompany(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>保单号</Text>
              <Input
                className={styles.input}
                placeholder="请输入保单号"
                value={insurancePolicyNo}
                onInput={(e) => setInsurancePolicyNo(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>保额（元）</Text>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入保额"
                value={insuranceAmount}
                onInput={(e) => setInsuranceAmount(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>保险期限</Text>
              <View className={styles.dateRow}>
                <View className={styles.dateItem}>
                  <Picker mode="date" value={insuranceStartDate} onChange={(e) => setInsuranceStartDate(e.detail.value)}>
                    <View className={classnames(styles.input, styles.pickerInput)}>
                      <Text className={insuranceStartDate ? styles.pickerText : styles.pickerPlaceholder}>
                        {insuranceStartDate || '开始日期'}
                      </Text>
                    </View>
                  </Picker>
                </View>
                <View className={styles.dateItem}>
                  <Picker mode="date" value={insuranceEndDate} onChange={(e) => setInsuranceEndDate(e.detail.value)}>
                    <View className={classnames(styles.input, styles.pickerInput)}>
                      <Text className={insuranceEndDate ? styles.pickerText : styles.pickerPlaceholder}>
                        {insuranceEndDate || '结束日期'}
                      </Text>
                    </View>
                  </Picker>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      <View className={styles.card} style={{ marginBottom: '200rpx' }}>
        <View
          className={classnames(styles.sectionTitle, styles.sectionToggle)}
          onClick={() => setShowTransport(!showTransport)}
        >
          <Text>运输信息（{showTransport ? '已填写' : '选填'}）</Text>
          <Text className={styles.toggleIcon}>{showTransport ? '−' : '+'}</Text>
        </View>

        {showTransport && (
          <>
            <View className={classnames(styles.formItem, styles.formItemFirst)}>
              <Text className={styles.label}>运输公司</Text>
              <Input
                className={styles.input}
                placeholder="请输入运输公司名称"
                value={transportCompany}
                onInput={(e) => setTransportCompany(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>运输方式</Text>
              <Input
                className={styles.input}
                placeholder="如：专业文物运输专车"
                value={transportMethod}
                onInput={(e) => setTransportMethod(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>运单号</Text>
              <Input
                className={styles.input}
                placeholder="请输入运单号"
                value={transportTrackingNo}
                onInput={(e) => setTransportTrackingNo(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>车牌号（可选）</Text>
              <Input
                className={styles.input}
                placeholder="请输入车牌号"
                value={transportVehicleNo}
                onInput={(e) => setTransportVehicleNo(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>押运人</Text>
              <Input
                className={styles.input}
                placeholder="请输入押运人姓名"
                value={transportHandler}
                onInput={(e) => setTransportHandler(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>运输日期</Text>
              <View className={styles.dateRow}>
                <View className={styles.dateItem}>
                  <Picker mode="date" value={transportDepartureDate} onChange={(e) => setTransportDepartureDate(e.detail.value)}>
                    <View className={classnames(styles.input, styles.pickerInput)}>
                      <Text className={transportDepartureDate ? styles.pickerText : styles.pickerPlaceholder}>
                        {transportDepartureDate || '出发日期'}
                      </Text>
                    </View>
                  </Picker>
                </View>
                <View className={styles.dateItem}>
                  <Picker mode="date" value={transportReturnDate} onChange={(e) => setTransportReturnDate(e.detail.value)}>
                    <View className={classnames(styles.input, styles.pickerInput)}>
                      <Text className={transportReturnDate ? styles.pickerText : styles.pickerPlaceholder}>
                        {transportReturnDate || '归还日期'}
                      </Text>
                    </View>
                  </Picker>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.btn, styles.btnCancel)}
          onClick={() => Taro.navigateBack()}
        >
          <Text className={styles.btnCancelText}>取消</Text>
        </View>
        <View
          className={classnames(styles.btn, canSubmit ? styles.btnSubmit : styles.btnSubmitDisabled)}
          onClick={handleSubmit}
        >
          <Text className={styles.btnSubmitText}>
            {conflictStatus === 'conflict' ? '存在档期冲突' : '提交申请'}
          </Text>
        </View>
      </View>

      {showCollectionPicker && (
        <View className={styles.modalOverlay} onClick={() => setShowCollectionPicker(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择藏品</Text>
              <Text className={styles.modalClose} onClick={() => setShowCollectionPicker(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {collectionsWithStatus.map((c) => {
                let tagClass = styles.tagAvailable;
                let tagText = '可外借';
                if (!c.isAvailable) {
                  tagClass = styles.tagDisabled;
                  tagText = '暂不外借';
                } else if (c.isOccupied) {
                  tagClass = styles.tagOccupied;
                  tagText = '档期占用';
                }

                return (
                  <View
                    key={c.id}
                    className={styles.collectionOption}
                    onClick={() => handleSelectCollection(c)}
                  >
                    <Image
                      className={styles.collectionOptionImage}
                      src={c.imageUrl}
                      mode="aspectFill"
                    />
                    <View className={styles.collectionOptionInfo}>
                      <Text className={styles.collectionOptionName}>{c.name}</Text>
                      <Text className={styles.collectionOptionMeta}>
                        {c.code} · {c.category} · {c.era}
                      </Text>
                    </View>
                    <Text className={classnames(styles.collectionOptionTag, tagClass)}>{tagText}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default LoanCreatePage;
