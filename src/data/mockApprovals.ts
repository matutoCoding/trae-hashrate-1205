import { LoanApplication, UserInfo, ScheduleItem } from '@/types';

export const mockCurrentUser: UserInfo = {
  id: 'u001',
  name: '张明远',
  role: 'curator',
  roleName: '策展部主任',
  department: '策展部',
  avatar: 'https://picsum.photos/id/64/200/200',
  phone: '13800138001'
};

export const mockApprovalUsers: UserInfo[] = [
  {
    id: 'u001',
    name: '张明远',
    role: 'curator',
    roleName: '策展部主任',
    department: '策展部',
    avatar: 'https://picsum.photos/id/64/200/200',
    phone: '13800138001'
  },
  {
    id: 'u002',
    name: '李文静',
    role: 'conservator',
    roleName: '保管部主任',
    department: '保管部',
    avatar: 'https://picsum.photos/id/91/200/200',
    phone: '13800138002'
  },
  {
    id: 'u003',
    name: '王馆长',
    role: 'director',
    roleName: '馆长',
    department: '馆领导',
    avatar: 'https://picsum.photos/id/177/200/200',
    phone: '13800138003'
  }
];

export const mockLoanApplications: LoanApplication[] = [
  {
    id: 'l001',
    loanNo: 'L202606153821',
    title: '故宫博物院特展借展申请',
    reason: '为配合"故宫博物院建院100周年特展"，需借展我馆青花缠枝莲纹梅瓶，展期为6月20日至8月20日。',
    exhibitionName: '故宫博物院建院100周年特展',
    collectionId: 'c001',
    collectionName: '青花缠枝莲纹梅瓶',
    collectionCode: 'QC-2023-001',
    collectionImage: 'https://picsum.photos/id/250/400/400',
    borrower: {
      name: '故宫博物院',
      institution: '故宫博物院展览部',
      contact: '赵文博',
      phone: '010-85007428',
      address: '北京市东城区景山前街4号'
    },
    startDate: '2026-06-20',
    endDate: '2026-08-20',
    insurance: {
      company: '中国人民财产保险',
      policyNo: 'PICC20260615001',
      amount: 5000000,
      startDate: '2026-06-18',
      endDate: '2026-08-22'
    },
    transport: {
      company: '顺丰速运·文物运输专线',
      trackingNo: 'SF1029384756',
      method: '专业文物运输专车',
      departureDate: '2026-06-18',
      returnDate: '2026-08-22',
      vehicleNo: '京A·88888',
      handler: '陈师傅'
    },
    status: 'pending',
    currentNode: 'conservator',
    currentNodeName: '保管部',
    approvalRecords: [
      {
        id: 'a001',
        nodeType: 'curator',
        nodeName: '策展部',
        approverId: 'u001',
        approverName: '张明远',
        status: 'approved',
        comment: '展览级别高，借展方案完善，同意提交保管部审核。',
        createdAt: '2026-06-15 09:30:00',
        updatedAt: '2026-06-15 14:20:00'
      },
      {
        id: 'a002',
        nodeType: 'conservator',
        nodeName: '保管部',
        approverId: 'u002',
        approverName: '李文静',
        status: 'pending',
        comment: '',
        createdAt: '2026-06-15 14:20:00',
        updatedAt: '2026-06-15 14:20:00'
      }
    ],
    conflictStatus: 'clear',
    creatorId: 'u001',
    creatorName: '张明远',
    createdAt: '2026-06-15 09:30:00',
    updatedAt: '2026-06-15 14:20:00'
  },
  {
    id: 'l002',
    loanNo: 'L202606105628',
    title: '上海博物馆书画联展借展申请',
    reason: '上海博物馆举办"宋元书画精品联展"，特邀我馆《富春山居图》（局部摹本）参展。',
    exhibitionName: '宋元书画精品联展',
    collectionId: 'c002',
    collectionName: '富春山居图（局部）',
    collectionCode: 'SH-2022-015',
    collectionImage: 'https://picsum.photos/id/1025/400/400',
    borrower: {
      name: '上海博物馆',
      institution: '上海博物馆书画研究部',
      contact: '孙雅琴',
      phone: '021-63723500',
      address: '上海市黄浦区人民大道201号'
    },
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    insurance: {
      company: '中国太平洋保险',
      policyNo: 'CPIC20260610002',
      amount: 8000000,
      startDate: '2026-06-28',
      endDate: '2026-10-02'
    },
    transport: {
      company: '中铁快运·艺术品物流',
      trackingNo: 'ZT6688990011',
      method: '恒温恒湿文物运输专车',
      departureDate: '2026-06-28',
      returnDate: '2026-10-02',
      handler: '吴师傅'
    },
    status: 'pending',
    currentNode: 'curator',
    currentNodeName: '策展部',
    approvalRecords: [
      {
        id: 'a003',
        nodeType: 'curator',
        nodeName: '策展部',
        approverId: 'u001',
        approverName: '张明远',
        status: 'pending',
        comment: '',
        createdAt: '2026-06-10 16:45:00',
        updatedAt: '2026-06-10 16:45:00'
      }
    ],
    conflictStatus: 'clear',
    creatorId: 'u001',
    creatorName: '张明远',
    createdAt: '2026-06-10 16:45:00',
    updatedAt: '2026-06-10 16:45:00'
  },
  {
    id: 'l003',
    loanNo: 'L202606051204',
    title: '湖南省博物馆青铜文化展借展申请',
    reason: '湖南省博物馆举办"商周青铜文化大展"，需要借展我馆司母戊鼎复制品用于展示。',
    exhibitionName: '商周青铜文化大展',
    collectionId: 'c003',
    collectionName: '司母戊鼎（复制品）',
    collectionCode: 'QT-2021-008',
    collectionImage: 'https://picsum.photos/id/225/400/400',
    borrower: {
      name: '湖南省博物馆',
      institution: '湖南省博物馆陈列展览部',
      contact: '周建国',
      phone: '0731-84415833',
      address: '湖南省长沙市开福区东风路50号'
    },
    startDate: '2026-06-10',
    endDate: '2026-07-15',
    status: 'approved',
    currentNode: null,
    currentNodeName: '',
    approvalRecords: [
      {
        id: 'a004',
        nodeType: 'curator',
        nodeName: '策展部',
        approverId: 'u001',
        approverName: '张明远',
        status: 'approved',
        comment: '复制品外借风险较低，展览主题契合，同意。',
        createdAt: '2026-06-05 10:00:00',
        updatedAt: '2026-06-05 11:30:00'
      },
      {
        id: 'a005',
        nodeType: 'conservator',
        nodeName: '保管部',
        approverId: 'u002',
        approverName: '李文静',
        status: 'approved',
        comment: '复制品状态良好，运输条件确认可行，同意。',
        createdAt: '2026-06-05 11:30:00',
        updatedAt: '2026-06-05 15:00:00'
      },
      {
        id: 'a006',
        nodeType: 'director',
        nodeName: '馆长',
        approverId: 'u003',
        approverName: '王馆长',
        status: 'approved',
        comment: '同意外借，请保管部做好出库登记工作。',
        createdAt: '2026-06-05 15:00:00',
        updatedAt: '2026-06-05 17:30:00'
      }
    ],
    conflictStatus: 'clear',
    creatorId: 'u001',
    creatorName: '张明远',
    createdAt: '2026-06-05 10:00:00',
    updatedAt: '2026-06-05 17:30:00'
  },
  {
    id: 'l004',
    loanNo: 'L202606019910',
    title: '南京博物院玉器特展借展申请',
    reason: '南京博物院举办"明清宫廷玉器精品展"，申请借展我馆白玉雕双龙耳活环瓶。',
    exhibitionName: '明清宫廷玉器精品展',
    collectionId: 'c004',
    collectionName: '白玉雕双龙耳活环瓶',
    collectionCode: 'YU-2023-023',
    collectionImage: 'https://picsum.photos/id/103/400/400',
    borrower: {
      name: '南京博物院',
      institution: '南京博物院艺术研究所',
      contact: '林晓峰',
      phone: '025-84807923',
      address: '江苏省南京市玄武区中山东路321号'
    },
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'lent',
    currentNode: null,
    currentNodeName: '',
    approvalRecords: [
      {
        id: 'a007',
        nodeType: 'curator',
        nodeName: '策展部',
        approverId: 'u001',
        approverName: '张明远',
        status: 'approved',
        comment: '南京博物院为国家级博物馆，合作信誉良好，同意。',
        createdAt: '2026-04-10 09:00:00',
        updatedAt: '2026-04-10 14:00:00'
      },
      {
        id: 'a008',
        nodeType: 'conservator',
        nodeName: '保管部',
        approverId: 'u002',
        approverName: '李文静',
        status: 'approved',
        comment: '玉器保存状态良好，包装运输方案专业，同意。',
        createdAt: '2026-04-10 14:00:00',
        updatedAt: '2026-04-11 10:00:00'
      },
      {
        id: 'a009',
        nodeType: 'director',
        nodeName: '馆长',
        approverId: 'u003',
        approverName: '王馆长',
        status: 'approved',
        comment: '同意外借，注意做好保险和运输保障。',
        createdAt: '2026-04-11 10:00:00',
        updatedAt: '2026-04-11 16:00:00'
      }
    ],
    conflictStatus: 'clear',
    creatorId: 'u001',
    creatorName: '张明远',
    createdAt: '2026-04-10 09:00:00',
    updatedAt: '2026-04-28 10:00:00'
  },
  {
    id: 'l005',
    loanNo: 'L202605207788',
    title: '国家博物馆丝路文化展借展申请',
    reason: '国家博物馆举办"丝绸之路文化大展"，申请借展我馆银錾花执壶和鎏金铜佛坐像。',
    exhibitionName: '丝绸之路文化大展',
    collectionId: 'c001',
    collectionName: '银錾花执壶',
    collectionCode: 'QJ-2023-034',
    collectionImage: 'https://picsum.photos/id/431/400/400',
    borrower: {
      name: '中国国家博物馆',
      institution: '中国国家博物馆展览中心',
      contact: '郑海涛',
      phone: '010-65116400',
      address: '北京市东城区东长安街16号'
    },
    startDate: '2026-06-15',
    endDate: '2026-07-20',
    status: 'rejected',
    currentNode: 'conservator',
    currentNodeName: '保管部',
    approvalRecords: [
      {
        id: 'a010',
        nodeType: 'curator',
        nodeName: '策展部',
        approverId: 'u001',
        approverName: '张明远',
        status: 'approved',
        comment: '国博大展，意义重大，同意。',
        createdAt: '2026-05-20 08:30:00',
        updatedAt: '2026-05-20 16:00:00'
      },
      {
        id: 'a011',
        nodeType: 'conservator',
        nodeName: '保管部',
        approverId: 'u002',
        approverName: '李文静',
        status: 'rejected',
        comment: '银錾花执壶有轻微氧化情况，需先进行修复处理后再考虑外借。建议先退回，补充文物健康评估报告。',
        createdAt: '2026-05-20 16:00:00',
        updatedAt: '2026-05-22 10:30:00'
      }
    ],
    conflictStatus: 'conflict',
    conflictMessage: '该藏品在 2026-06-20至2026-08-20 档期已被故宫博物院特展占用',
    creatorId: 'u001',
    creatorName: '张明远',
    createdAt: '2026-05-20 08:30:00',
    updatedAt: '2026-05-22 10:30:00'
  },
  {
    id: 'l006',
    loanNo: 'L202605153366',
    title: '苏州博物馆吴门书画展借展申请',
    reason: '苏州博物馆举办"吴门画派精品展"，申请借展我馆敦煌壁画摹本·飞天。',
    exhibitionName: '吴门画派精品展',
    collectionId: 'c010',
    collectionName: '敦煌壁画摹本·飞天',
    collectionCode: 'SH-2023-067',
    collectionImage: 'https://picsum.photos/id/1074/400/400',
    borrower: {
      name: '苏州博物馆',
      institution: '苏州博物馆书画部',
      contact: '钱雨薇',
      phone: '0512-67575666',
      address: '江苏省苏州市姑苏区东北街204号'
    },
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    status: 'returned',
    currentNode: null,
    currentNodeName: '',
    approvalRecords: [
      {
        id: 'a012',
        nodeType: 'curator',
        nodeName: '策展部',
        approverId: 'u001',
        approverName: '张明远',
        status: 'approved',
        comment: '主题契合，苏博办展经验丰富，同意。',
        createdAt: '2026-03-01 10:00:00',
        updatedAt: '2026-03-01 14:00:00'
      },
      {
        id: 'a013',
        nodeType: 'conservator',
        nodeName: '保管部',
        approverId: 'u002',
        approverName: '李文静',
        status: 'approved',
        comment: '摹本保存完好，可外借。',
        createdAt: '2026-03-01 14:00:00',
        updatedAt: '2026-03-02 09:00:00'
      },
      {
        id: 'a014',
        nodeType: 'director',
        nodeName: '馆长',
        approverId: 'u003',
        approverName: '王馆长',
        status: 'approved',
        comment: '同意。',
        createdAt: '2026-03-02 09:00:00',
        updatedAt: '2026-03-02 16:00:00'
      }
    ],
    conflictStatus: 'clear',
    creatorId: 'u001',
    creatorName: '张明远',
    createdAt: '2026-03-01 10:00:00',
    updatedAt: '2026-06-02 10:00:00'
  }
];

export const mockSchedules: ScheduleItem[] = mockLoanApplications
  .filter((l) => ['pending', 'approved', 'lent'].includes(l.status))
  .map((l) => ({
    id: `s_${l.id}`,
    loanId: l.id,
    loanNo: l.loanNo,
    collectionId: l.collectionId,
    collectionName: l.collectionName,
    startDate: l.startDate,
    endDate: l.endDate,
    status: l.status,
    borrower: l.borrower.name
  }));
