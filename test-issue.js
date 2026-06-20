const APPROVAL_FLOW = {
  nodes: ['curator', 'conservator', 'director'],
  nodeNames: {
    curator: '策展部',
    conservator: '保管部',
    director: '馆长'
  }
};

const getNow = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

// 这个就是store中的原函数
const isLoanPendingActive = (loan) => {
  if (loan.status !== 'pending') return false;
  if (!loan.currentNode) return false;
  const nodes = APPROVAL_FLOW.nodes;
  const currentIndex = nodes.findIndex((n) => n === loan.currentNode);
  // 问题在这里：检查是否有后面节点的rejected记录
  const result = !loan.approvalRecords.some((r) => {
    const rIndex = nodes.findIndex((n) => n === r.nodeType);
    return r.status === 'rejected' && rIndex > currentIndex;
  });
  console.log(`  isLoanPendingActive检查: currentNode=${loan.currentNode}(idx=${currentIndex}), 有后节点rejected? ${!result} → 返回${result}`);
  return result;
};

// store中的原函数
const getPendingApprovals = (loans, role) => {
  return loans.filter(
    (l) =>
      (l.status === 'pending' && l.currentNode === role && isLoanPendingActive(l))
  );
};

const getProcessedApprovals = (loans, role) => {
  return loans.filter((l) => {
    return l.approvalRecords.some(
      (r) => r.nodeType === role && r.status !== 'pending'
    );
  });
};

const createTestLoan = () => ({
  id: 'l_test1',
  loanNo: 'LTEST001',
  title: '测试借展申请',
  status: 'pending',
  currentNode: 'curator',
  currentNodeName: '策展部',
  approvalRecords: [
    {
      id: 'a1',
      nodeType: 'curator',
      nodeName: '策展部',
      status: 'pending',
      comment: ''
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
    approvalRecords: updatedRecords
  };
};

console.log('\n========== 复现用户描述的问题 ==========\n');

// ======= 场景A：保管驳回后，策展身份的待审批能否看到？ =======
console.log('【场景A】保管驳回→策展返工');
let loan = createTestLoan();
console.log('初始: 策展待处理');
console.log('  records:', loan.approvalRecords.map(r => `${r.nodeName}:${r.status}`).join(' → '));

loan = approveLoan(loan, 'u001', '张明远', '策展同意');
console.log('\n步骤1: 策展通过 → 流转到保管');
console.log('  currentNode:', loan.currentNodeName);
console.log('  records:', loan.approvalRecords.map(r => `${r.nodeName}:${r.status}`).join(' → '));

loan = rejectLoan(loan, 'u002', '李文静', '保管认为资料不全，退回补充');
console.log('\n步骤2: 保管驳回 → 应该退回到策展');
console.log('  status:', loan.status);
console.log('  currentNode:', loan.currentNodeName, `(${loan.currentNode})`);
console.log('  records:', loan.approvalRecords.map(r => `${r.nodeName}:${r.status}${r.approverName?`(${r.approverName})`:''}`).join(' → '));

console.log('\n关键检查：策展(u001)的待审批列表');
const curatorPending = getPendingApprovals([loan], 'curator');
console.log(`  策展待审批数量: ${curatorPending.length}`);
if (curatorPending.length === 0) {
  console.log('  ❌❌❌ BUG! 策展在待审批中看不到这条返工单！');
} else {
  console.log('  ✅ 策展可以在待审批中看到');
}

console.log('\n关键检查：保管(u002)的已处理列表');
const conservatorProcessed = getProcessedApprovals([loan], 'conservator');
console.log(`  保管已处理数量: ${conservatorProcessed.length}`);
if (conservatorProcessed.length === 0) {
  console.log('  ❌ 保管在已处理列表看不到自己的驳回记录！');
} else {
  console.log('  ✅ 保管可以在已处理中看到');
}

console.log('\n关键检查：策展(u001)的已处理列表');
const curatorProcessed = getProcessedApprovals([loan], 'curator');
console.log(`  策展已处理数量: ${curatorProcessed.length}`);
console.log(`  (策展之前通过了，但现在被重置为pending，所以getProcessedApprovals会找status!=='pending'的记录)`);
if (curatorProcessed.length > 0) {
  console.log('  ⚠️  策展在已处理列表也能看到 - 这是否合理？策展之前确实处理过（通过），但现在又要重处理');
} else {
  console.log('  ℹ️  策展不在已处理列表 - 因为策展记录现在是pending状态');
}

// ======= 场景B：馆长驳回后，保管身份的待审批能否看到？ =======
console.log('\n\n【场景B】馆长驳回→保管返工');
let loan2 = createTestLoan();
loan2 = approveLoan(loan2, 'u001', '张明远', '策展同意');
loan2 = approveLoan(loan2, 'u002', '李文静', '保管同意');
console.log('步骤1: 策展→保管都通过，等馆长审批');
console.log('  currentNode:', loan2.currentNodeName);
console.log('  records:', loan2.approvalRecords.map(r => `${r.nodeName}:${r.status}`).join(' → '));

loan2 = rejectLoan(loan2, 'u003', '王馆长', '馆长认为风险较大，补充评估');
console.log('\n步骤2: 馆长驳回 → 应该退回到保管');
console.log('  status:', loan2.status);
console.log('  currentNode:', loan2.currentNodeName, `(${loan2.currentNode})`);
console.log('  records:', loan2.approvalRecords.map(r => `${r.nodeName}:${r.status}${r.approverName?`(${r.approverName})`:''}`).join(' → '));

console.log('\n关键检查：保管(u002)的待审批列表');
const conservatorPending = getPendingApprovals([loan2], 'conservator');
console.log(`  保管待审批数量: ${conservatorPending.length}`);
if (conservatorPending.length === 0) {
  console.log('  ❌❌❌ BUG! 保管在待审批中看不到这条返工单！');
} else {
  console.log('  ✅ 保管可以在待审批中看到');
}

console.log('\n关键检查：馆长(u003)的已处理列表');
const directorProcessed = getProcessedApprovals([loan2], 'director');
console.log(`  馆长已处理数量: ${directorProcessed.length}`);
if (directorProcessed.length === 0) {
  console.log('  ❌ 馆长在已处理列表看不到自己的驳回记录！');
} else {
  console.log('  ✅ 馆长可以在已处理中看到');
}

// ======= 现在模拟修复后的效果 =======
console.log('\n\n========== 问题根因分析 ==========');
console.log('isLoanPendingActive函数逻辑错误：当保管驳回退回到策展时，');
console.log('  - approvalRecords中 保管:rejected 的节点索引(1) > 当前策展节点索引(0)');
console.log('  - 函数把这种情况判定为"非活跃pending"，导致待审批列表过滤掉了返工单！');
console.log('  - 但这恰恰是返工的正常场景：后面节点驳回，前面节点需要重新处理');
console.log('\n修复方案：移除isLoanPendingActive中"后节点rejected就认为不活跃"的判断逻辑');
console.log('         只要status===pending且currentNode===role就应该在待审批里');
