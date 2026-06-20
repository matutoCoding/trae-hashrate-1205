// Mock Taro Storage API for testing
const storage = {};
global.Taro = {
  getStorageSync: (key) => storage[key] || '',
  setStorageSync: (key, value) => { storage[key] = value; }
};

const APPROVAL_FLOW = {
  nodes: ['curator', 'conservator', 'director'],
  nodeNames: {
    curator: '策展部',
    conservator: '保管部',
    director: '馆长'
  }
};

const getNow = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

const isLoanPendingActive = (loan) => {
  if (loan.status !== 'pending') return false;
  if (!loan.currentNode) return false;
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
  return !loan.approvalRecords.some((r) => {
    const rIndex = nodes.findIndex((n) => n === r.nodeType);
    return r.status === 'rejected' && rIndex > currentIndex;
  });
};

const computeSchedules = (loans) => {
  const activeStatuses = ['pending', 'approved', 'lent'];
  return loans
    .filter((l) => {
      if (!activeStatuses.includes(l.status)) return false;
      if (l.status === 'pending') return isLoanPendingActive(l);
      return true;
    })
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
};

const approveLoan = (loan, approverId, approverName, comment) => {
  const now = getNow();
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
  const isLastNode = currentIndex >= nodes.length - 1;
  const nextNode = isLastNode ? null : nodes[currentIndex + 1];
  const nextNodeName = nextNode ? APPROVAL_FLOW.nodeNames[nextNode] : '';

  const updatedRecords = loan.approvalRecords.map((r) => {
    if (r.nodeType === loan.currentNode) {
      return {
        ...r,
        status: 'approved',
        approverId,
        approverName,
        comment,
        updatedAt: now
      };
    }
    return r;
  });

  if (!isLastNode && nextNode) {
    const existingNext = updatedRecords.find((r) => r.nodeType === nextNode);
    if (existingNext) {
      existingNext.status = 'pending';
      existingNext.approverId = '';
      existingNext.approverName = '';
      existingNext.comment = '';
      existingNext.updatedAt = now;
    } else {
      updatedRecords.push({
        id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nodeType: nextNode,
        nodeName: nextNodeName,
        approverId: '',
        approverName: '',
        status: 'pending',
        comment: '',
        createdAt: now,
        updatedAt: now
      });
    }
  }

  return {
    ...loan,
    status: isLastNode ? 'approved' : 'pending',
    currentNode: nextNode,
    currentNodeName: nextNodeName,
    approvalRecords: updatedRecords,
    updatedAt: now
  };
};

const rejectLoan = (loan, approverId, approverName, comment) => {
  const now = getNow();
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);

  const updatedRecords = loan.approvalRecords.map((r) => {
    if (r.nodeType === loan.currentNode) {
      return {
        ...r,
        status: 'rejected',
        approverId,
        approverName,
        comment,
        updatedAt: now
      };
    }
    return r;
  });

  if (currentIndex <= 0) {
    return {
      ...loan,
      status: 'rejected',
      currentNode: null,
      currentNodeName: '',
      approvalRecords: updatedRecords,
      updatedAt: now
    };
  }

  const prevNode = nodes[currentIndex - 1];
  const prevNodeName = APPROVAL_FLOW.nodeNames[prevNode];

  const prevRecord = updatedRecords.find((r) => r.nodeType === prevNode);
  if (prevRecord) {
    prevRecord.status = 'pending';
    prevRecord.approverId = '';
    prevRecord.approverName = '';
    prevRecord.comment = '';
    prevRecord.updatedAt = now;
  }

  return {
    ...loan,
    status: 'pending',
    currentNode: prevNode,
    currentNodeName: prevNodeName,
    approvalRecords: updatedRecords,
    updatedAt: now
  };
};

const resubmitLoan = (loan) => {
  const now = getNow();
  const newRecords = [
    {
      id: `a_${Date.now()}`,
      nodeType: 'curator',
      nodeName: '策展部',
      approverId: '',
      approverName: '',
      status: 'pending',
      comment: '',
      createdAt: now,
      updatedAt: now
    }
  ];

  return {
    ...loan,
    status: 'pending',
    currentNode: 'curator',
    currentNodeName: '策展部',
    approvalRecords: newRecords,
    conflictStatus: 'clear',
    conflictMessage: '',
    updatedAt: now
  };
};

const createTestLoan = () => ({
  id: 'l_test',
  loanNo: 'LTEST001',
  title: '测试借展申请',
  reason: '测试审批流程',
  exhibitionName: '测试展览',
  collectionId: 'c001',
  collectionName: '测试藏品',
  collectionCode: 'TEST-001',
  collectionImage: 'https://picsum.photos/400/400',
  borrower: {
    name: '测试借展方',
    institution: '测试机构',
    contact: '测试联系人',
    phone: '13800000000',
    address: '测试地址'
  },
  startDate: '2026-10-01',
  endDate: '2026-12-31',
  status: 'pending',
  currentNode: 'curator',
  currentNodeName: '策展部',
  approvalRecords: [
    {
      id: 'a_test_1',
      nodeType: 'curator',
      nodeName: '策展部',
      approverId: '',
      approverName: '',
      status: 'pending',
      comment: '',
      createdAt: '2026-06-01 10:00:00',
      updatedAt: '2026-06-01 10:00:00'
    }
  ],
  conflictStatus: 'clear',
  creatorId: 'u001',
  creatorName: '张明远',
  createdAt: '2026-06-01 10:00:00',
  updatedAt: '2026-06-01 10:00:00'
});

const assert = (condition, message) => {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const printLoanState = (loan, label) => {
  console.log(`\n  [${label}]`);
  console.log(`    status: ${loan.status}`);
  console.log(`    currentNode: ${loan.currentNode} (${loan.currentNodeName})`);
  console.log(`    records: ${loan.approvalRecords.map(r => `${r.nodeName}:${r.status}`).join(' → ')}`);
};

console.log('\n========== 审批流程测试 ==========\n');

// Scenario 1: 正常流程 - 策展通过→保管通过→馆长通过
console.log('场景1: 正常审批流程（策展→保管→馆长 全通过）');
let loan1 = createTestLoan();
printLoanState(loan1, '初始状态');

loan1 = approveLoan(loan1, 'u001', '张明远', '策展同意');
assert(loan1.status === 'pending' && loan1.currentNode === 'conservator', '策展通过后，应流转到保管部');
printLoanState(loan1, '策展通过后');

loan1 = approveLoan(loan1, 'u002', '李文静', '保管同意');
assert(loan1.status === 'pending' && loan1.currentNode === 'director', '保管通过后，应流转到馆长');
printLoanState(loan1, '保管通过后');

loan1 = approveLoan(loan1, 'u003', '王馆长', '馆长同意');
assert(loan1.status === 'approved' && loan1.currentNode === null, '馆长通过后，应最终通过');
printLoanState(loan1, '馆长通过后');
console.log('');

// Scenario 2: 策展驳回→退回申请人→重新提交→全流程通过
console.log('场景2: 策展驳回→申请人编辑→重新提交→全流程通过');
let loan2 = createTestLoan();
printLoanState(loan2, '初始状态');

loan2 = rejectLoan(loan2, 'u001', '张明远', '资料不全，请补充');
assert(loan2.status === 'rejected' && loan2.currentNode === null, '策展驳回后，应为rejected状态且无当前节点（退回申请人）');
printLoanState(loan2, '策展驳回后');

loan2 = resubmitLoan(loan2);
assert(loan2.status === 'pending' && loan2.currentNode === 'curator', '重新提交后，应从策展部重新开始');
assert(loan2.approvalRecords.length === 1, '重新提交后，应只有一条新的策展待审批记录');
printLoanState(loan2, '重新提交后');

loan2 = approveLoan(loan2, 'u001', '张明远', '策展同意');
loan2 = approveLoan(loan2, 'u002', '李文静', '保管同意');
loan2 = approveLoan(loan2, 'u003', '王馆长', '馆长同意');
assert(loan2.status === 'approved', '重新提交后应能完整走完全部流程');
printLoanState(loan2, '最终状态');
console.log('');

// Scenario 3: 保管驳回→退回到策展→策展修改通过→保管通过→馆长通过
console.log('场景3: 保管驳回→策展修改→通过→全流程');
let loan3 = createTestLoan();
loan3 = approveLoan(loan3, 'u001', '张明远', '策展同意');
printLoanState(loan3, '策展通过后');

loan3 = rejectLoan(loan3, 'u002', '李文静', '保管认为需补充文物状态说明');
assert(loan3.status === 'pending' && loan3.currentNode === 'curator', '保管驳回后，应退回到策展部（状态pending）');
assert(
  loan3.approvalRecords.find(r => r.nodeType === 'curator')?.status === 'pending',
  '保管驳回后，策展节点应重置为pending'
);
assert(
  loan3.approvalRecords.find(r => r.nodeType === 'conservator')?.status === 'rejected',
  '保管驳回后，保管节点应为rejected'
);
printLoanState(loan3, '保管驳回后');

loan3 = approveLoan(loan3, 'u001', '张明远', '已补充资料，策展同意');
assert(loan3.currentNode === 'conservator', '策展重新通过后，应流转到保管部');
printLoanState(loan3, '策展重新通过后');

loan3 = approveLoan(loan3, 'u002', '李文静', '保管同意');
loan3 = approveLoan(loan3, 'u003', '王馆长', '馆长同意');
assert(loan3.status === 'approved', '返工后应能最终通过');
printLoanState(loan3, '最终状态');
console.log('');

// Scenario 4: 馆长驳回→退回到保管→保管修改→通过→馆长通过
console.log('场景4: 馆长驳回→保管修改→通过→馆长通过');
let loan4 = createTestLoan();
loan4 = approveLoan(loan4, 'u001', '张明远', '策展同意');
loan4 = approveLoan(loan4, 'u002', '李文静', '保管同意');
printLoanState(loan4, '保管通过后（等待馆长）');

loan4 = rejectLoan(loan4, 'u003', '王馆长', '馆长认为需再评估风险');
assert(loan4.status === 'pending' && loan4.currentNode === 'conservator', '馆长驳回后，应退回到保管部（状态pending）');
assert(
  loan4.approvalRecords.find(r => r.nodeType === 'conservator')?.status === 'pending',
  '馆长驳回后，保管节点应重置为pending'
);
printLoanState(loan4, '馆长驳回后');

loan4 = approveLoan(loan4, 'u002', '李文静', '已补充风险评估，保管同意');
assert(loan4.currentNode === 'director', '保管重新通过后，应流转到馆长');
printLoanState(loan4, '保管重新通过后');

loan4 = approveLoan(loan4, 'u003', '王馆长', '馆长同意');
assert(loan4.status === 'approved', '返工后应能最终通过');
printLoanState(loan4, '最终状态');
console.log('');

// 验证排期计算逻辑
console.log('场景5: 排期状态联动验证');
const testLoans = [
  { ...createTestLoan(), id: 'l1', status: 'pending', currentNode: 'curator' },
  { ...createTestLoan(), id: 'l2', status: 'approved', currentNode: null },
  { ...createTestLoan(), id: 'l3', status: 'rejected', currentNode: null },
  { ...createTestLoan(), id: 'l4', status: 'cancelled', currentNode: null },
  { ...createTestLoan(), id: 'l5', status: 'lent', currentNode: null }
];
const schedules = computeSchedules(testLoans);
assert(schedules.length === 3, 'pending/approved/lent的申请应计入排期（共3条），rejected/cancelled不计入');
assert(!schedules.find(s => s.loanId === 'l3'), 'rejected申请不应占用排期');
assert(!schedules.find(s => s.loanId === 'l4'), 'cancelled申请不应占用排期');
console.log(`  排期条数: ${schedules.length}（预期: 3）`);
console.log(`  排期对应loanId: ${schedules.map(s => s.loanId).join(', ')}`);

console.log('\n========== 测试完成 ==========\n');
