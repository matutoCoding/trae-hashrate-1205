// 完整回归测试：覆盖用户3个需求的所有场景
const APPROVAL_FLOW = {
  nodes: ['curator', 'conservator', 'director'],
  nodeNames: {
    curator: '策展部',
    conservator: '保管部',
    director: '馆长'
  }
};

const getNow = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

// ======== 与store中完全一致的修复后逻辑 ========
const isLoanPendingActive = (loan) => {
  if (loan.status !== 'pending') return false;
  if (!loan.currentNode) return false;
  return true;
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
      collectionId: l.collectionId,
      status: l.status
    }));
};

const getPendingApprovals = (loans, role) => {
  return loans.filter(
    (l) =>
      (l.status === 'pending' && l.currentNode === role && isLoanPendingActive(l))
  );
};

const getProcessedApprovals = (loans, role) => {
  return loans.filter((l) => {
    return l.approvalRecords.some(
      (r) => r.nodeType === role && !!r.approverId
    );
  });
};

const createTestLoan = (idx = 1) => ({
  id: `l_test${idx}`,
  loanNo: `LTEST${String(idx).padStart(3, '0')}`,
  title: `测试借展申请${idx}`,
  status: 'pending',
  currentNode: 'curator',
  currentNodeName: '策展部',
  collectionId: 'c001',
  approvalRecords: [
    {
      id: `a${idx}_1`,
      nodeType: 'curator',
      nodeName: '策展部',
      approverId: '',
      approverName: '',
      status: 'pending',
      comment: '',
      createdAt: getNow(),
      updatedAt: getNow()
    }
  ]
});

const approveLoan = (loan, approverId, approverName, comment) => {
  const now = getNow();
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
  const isLastNode = currentIndex >= nodes.length - 1;
  const nextNode = isLastNode ? null : nodes[currentIndex + 1];
  const nextNodeName = nextNode ? APPROVAL_FLOW.nodeNames[nextNode] : '';

  const updatedRecords = loan.approvalRecords.map((r) => {
    if (r.nodeType === loan.currentNode) {
      return { ...r, status: 'approved', approverId, approverName, comment, updatedAt: now };
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
        id: `a_${Date.now()}`,
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
    approvalRecords: updatedRecords
  };
};

const rejectLoan = (loan, approverId, approverName, comment) => {
  const now = getNow();
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);

  const updatedRecords = loan.approvalRecords.map((r) => {
    if (r.nodeType === loan.currentNode) {
      return { ...r, status: 'rejected', approverId, approverName, comment, updatedAt: now };
    }
    return r;
  });

  if (currentIndex <= 0) {
    return {
      ...loan,
      status: 'rejected',
      currentNode: null,
      currentNodeName: '',
      approvalRecords: updatedRecords
    };
  }

  const prevNode = nodes[currentIndex - 1];
  const prevNodeName = APPROVAL_FLOW.nodeNames[prevNode];

  const prevRecord = updatedRecords.find((r) => r.nodeType === prevNode);
  if (prevRecord) {
    prevRecord.status = 'pending';
    prevRecord.comment = '';
    prevRecord.updatedAt = now;
  }

  return {
    ...loan,
    status: 'pending',
    currentNode: prevNode,
    currentNodeName: prevNodeName,
    approvalRecords: updatedRecords
  };
};

const resubmitLoan = (loan) => {
  const now = getNow();
  return {
    ...loan,
    status: 'pending',
    currentNode: 'curator',
    currentNodeName: '策展部',
    approvalRecords: [{
      id: `a_${Date.now()}`,
      nodeType: 'curator',
      nodeName: '策展部',
      approverId: '',
      approverName: '',
      status: 'pending',
      comment: '',
      createdAt: now,
      updatedAt: now
    }],
    updatedAt: now
  };
};

let passCount = 0;
let failCount = 0;
const assert = (condition, message) => {
  if (condition) {
    passCount++;
    console.log(`  ✅ ${message}`);
  } else {
    failCount++;
    console.log(`  ❌ ${message}`);
  }
};

const printState = (label, loan) => {
  console.log(`\n  [${label}]`);
  console.log(`    状态: ${loan.status} | 当前节点: ${loan.currentNodeName || '无'}`);
  console.log(`    审批流: ${loan.approvalRecords.map(r => {
    const who = r.approverName ? `(${r.approverName})` : '';
    return `${r.nodeName}:${r.status}${who}`;
  }).join(' → ')}`);
};

console.log('\n' + '='.repeat(60));
console.log('  完整审批链路回归测试（覆盖用户3个需求）');
console.log('='.repeat(60));

// ==================== 场景1：保管驳回→策展返工→最终通过 ====================
console.log('\n【需求1场景】保管驳回→切回策展身份→在待审批里看到返工单→继续流到保管→馆长→通过');
{
  let loan = createTestLoan(1);
  const loans = [loan];

  printState('初始状态', loan);
  // 1. 策展通过
  loan = approveLoan(loan, 'u001', '张明远', '策展同意');
  printState('策展通过', loan);
  assert(loan.currentNode === 'conservator', '策展通过后流转到保管');

  // 2. 保管驳回
  const rejectResult = rejectLoan(loan, 'u002', '李文静', '需补充文物温湿度控制方案');
  loans[0] = rejectResult;
  loan = rejectResult;
  printState('保管驳回（退回策展）', loan);

  // ========== 核心检查点 ==========
  console.log('\n  --- 关键检查 ---');
  const curatorPending = getPendingApprovals(loans, 'curator');
  assert(curatorPending.length === 1, '【切回策展身份】待审批里能看到这条返工单');
  assert(curatorPending[0].id === loan.id, '返工单就是刚被保管驳回的那条');
  assert(loan.status === 'pending' && loan.currentNode === 'curator', '状态pending，当前节点策展部');

  const conservatorProcessed = getProcessedApprovals(loans, 'conservator');
  assert(conservatorProcessed.length === 1, '【保管身份】已处理列表能看到自己驳回的记录');

  const curatorProcessed = getProcessedApprovals(loans, 'curator');
  assert(curatorProcessed.length === 1, '【策展身份】已处理列表能看到自己之前处理过的记录');

  const curatorRecord = loan.approvalRecords.find(r => r.nodeType === 'curator');
  assert(curatorRecord.approverName === '张明远', '详情页/Timeline：策展节点保留原处理人张明远');
  assert(curatorRecord.status === 'pending', '详情页/Timeline：策展节点状态是pending（待重处理）');

  const conservatorRecord = loan.approvalRecords.find(r => r.nodeType === 'conservator');
  assert(conservatorRecord.approverName === '李文静', '详情页/Timeline：保管节点显示驳回人李文静');
  assert(conservatorRecord.status === 'rejected', '详情页/Timeline：保管节点状态是rejected（已驳回）');
  assert(conservatorRecord.comment === '需补充文物温湿度控制方案', '详情页/Timeline：保管驳回理由保留');

  // 3. 策展补充完资料重新点通过
  console.log('\n  --- 策展补充完资料，点通过 ---');
  const reapprove1 = approveLoan(loan, 'u001', '张明远', '已补充温湿度方案，重新同意');
  loans[0] = reapprove1;
  loan = reapprove1;
  printState('策展重新通过', loan);
  assert(loan.currentNode === 'conservator', '策展重通过后流转到保管');

  // 4. 保管通过
  const conservatorPending = getPendingApprovals(loans, 'conservator');
  assert(conservatorPending.length === 1, '【保管身份】待审批里能看到策展重通过后流转过来的单');

  loan = approveLoan(loan, 'u002', '李文静', '资料已补充，保管同意');
  loans[0] = loan;
  printState('保管通过', loan);
  assert(loan.currentNode === 'director', '保管通过流转到馆长');

  // 5. 馆长通过
  loan = approveLoan(loan, 'u003', '王馆长', '馆长同意');
  loans[0] = loan;
  printState('馆长通过（最终）', loan);
  assert(loan.status === 'approved', '最终馆长通过→approved');
}

// ==================== 场景2：馆长驳回→保管返工→最终通过 ====================
console.log('\n\n【需求2场景】馆长驳回→切回保管身份→待审批里看到→保管处理→回馆长→最终通过');
{
  let loan = createTestLoan(2);
  const loans = [loan];

  loan = approveLoan(loan, 'u001', '张明远', '策展同意');
  loan = approveLoan(loan, 'u002', '李文静', '保管同意');
  loans[0] = loan;
  printState('策展→保管都通过，等馆长', loan);
  assert(loan.currentNode === 'director', '流转到馆长');

  // 馆长驳回
  loan = rejectLoan(loan, 'u003', '王馆长', '需再评估运输风险，请保管补充');
  loans[0] = loan;
  printState('馆长驳回（退回保管）', loan);

  // ========== 核心检查点 ==========
  console.log('\n  --- 关键检查 ---');
  const conservatorPending = getPendingApprovals(loans, 'conservator');
  assert(conservatorPending.length === 1, '【切回保管身份】待审批里能看到这条馆长驳回的返工单');

  const directorProcessed = getProcessedApprovals(loans, 'director');
  assert(directorProcessed.length === 1, '【馆长身份】已处理列表能看到自己驳回的记录');

  const conservatorProcessed = getProcessedApprovals(loans, 'conservator');
  assert(conservatorProcessed.length === 1, '【保管身份】已处理列表能看到自己之前通过的记录');

  const conservatorRec = loan.approvalRecords.find(r => r.nodeType === 'conservator');
  assert(conservatorRec.approverName === '李文静', '详情页/Timeline：保管节点保留原处理人李文静');
  assert(conservatorRec.status === 'pending', '详情页/Timeline：保管节点状态pending（待重处理）');

  const directorRec = loan.approvalRecords.find(r => r.nodeType === 'director');
  assert(directorRec.approverName === '王馆长', '详情页/Timeline：馆长节点保留驳回人王馆长');
  assert(directorRec.status === 'rejected', '详情页/Timeline：馆长节点状态是rejected');

  // 保管补充完重新点通过
  console.log('\n  --- 保管补充完，点通过 ---');
  loan = approveLoan(loan, 'u002', '李文静', '已补充运输风险评估，重新同意');
  loans[0] = loan;
  printState('保管重新通过', loan);
  assert(loan.currentNode === 'director', '保管重通过后流转回馆长');

  // 馆长待审批检查
  const directorPending = getPendingApprovals(loans, 'director');
  assert(directorPending.length === 1, '【馆长身份】待审批里能看到保管重处理后流转回来的单');

  // 馆长通过
  loan = approveLoan(loan, 'u003', '王馆长', '馆长同意');
  loans[0] = loan;
  printState('馆长通过（最终）', loan);
  assert(loan.status === 'approved', '最终馆长通过→approved');
}

// ==================== 场景3：策展驳回→申请人重新提交→完整流程通过 ====================
console.log('\n\n【附加场景】策展驳回→退申请人→重新提交→全流程通过');
{
  let loan = createTestLoan(3);
  const loans = [loan];

  printState('初始状态', loan);
  loan = rejectLoan(loan, 'u001', '张明远', '借展事由描述不清楚，请重新补充');
  loans[0] = loan;
  printState('策展驳回（退申请人）', loan);

  console.log('\n  --- 关键检查 ---');
  assert(loan.status === 'rejected', '状态变为rejected（不是卡在审批中）');
  assert(loan.currentNode === null, '当前节点清空（回到申请人手里）');
  const curatorPending = getPendingApprovals(loans, 'curator');
  assert(curatorPending.length === 0, '策展待审批里不再显示这条单');

  // 申请人重新提交
  console.log('\n  --- 申请人编辑完，点重新提交 ---');
  loan = resubmitLoan(loan);
  loans[0] = loan;
  printState('重新提交（从策展开始）', loan);
  assert(loan.status === 'pending', '重新提交后状态是pending');
  assert(loan.currentNode === 'curator', '重新从策展部开始');

  const curatorPending2 = getPendingApprovals(loans, 'curator');
  assert(curatorPending2.length === 1, '【策展身份】待审批里重新出现这条单');

  // 完整走流程
  loan = approveLoan(loan, 'u001', '张明远', '资料补充完整，同意');
  loan = approveLoan(loan, 'u002', '李文静', '保管同意');
  loan = approveLoan(loan, 'u003', '王馆长', '馆长同意');
  loans[0] = loan;
  printState('全流程最终通过', loan);
  assert(loan.status === 'approved', '最终完整流程通过→approved');
}

// ==================== 场景4：排期联动 ====================
console.log('\n\n【排期验证】驳回/取消自动释放档期，通过/借出占用档期');
{
  const pendingLoan = { ...createTestLoan(11), status: 'pending', currentNode: 'curator' };
  const approvedLoan = { ...createTestLoan(12), status: 'approved', currentNode: null };
  const lentLoan = { ...createTestLoan(13), status: 'lent', currentNode: null };
  const rejectedLoan = { ...createTestLoan(14), status: 'rejected', currentNode: null };
  const cancelledLoan = { ...createTestLoan(15), status: 'cancelled', currentNode: null };

  const allLoans = [pendingLoan, approvedLoan, lentLoan, rejectedLoan, cancelledLoan];
  const schedules = computeSchedules(allLoans);
  const scheduleIds = schedules.map(s => s.loanId);
  assert(schedules.length === 3, 'pending/approved/lent共3条计入排期');
  assert(!scheduleIds.includes('l_test14'), 'rejected申请不计入排期（释放档期）');
  assert(!scheduleIds.includes('l_test15'), 'cancelled申请不计入排期（释放档期）');
}

// ==================== 总结 ====================
console.log('\n' + '='.repeat(60));
console.log(`  测试结果: 共 ${passCount + failCount} 项, 通过 ${passCount}, 失败 ${failCount}`);
console.log('='.repeat(60) + '\n');

if (failCount > 0) {
  process.exit(1);
}
