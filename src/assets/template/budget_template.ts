// 创建预算模板数据
export const budgetTemplateData = [
  {
    department: '市场部',
    index_name: '营销费用',
    budget_amount: 100000,
    executed_amount: 85000,
    execution_rate: '85',
    time_progress: '90',
    difference: -5,
  },
  {
    department: '市场部',
    index_name: '营销费用',
    budget_amount: 80000,
    executed_amount: 75000,
    execution_rate: '93.75',
    time_progress: '90',
    difference: 3.75,
  },
  {
    department: '行政部',
    index_name: '办公费用',
    budget_amount: 50000,
    executed_amount: 42000,
    execution_rate: '84',
    time_progress: '90',
    difference: -6,
  },
  {
    department: '行政部',
    index_name: '办公用品',
    budget_amount: 30000,
    executed_amount: 28000,
    execution_rate: '93.33',
    time_progress: '90',
    difference: 3.33,
  },
  {
    department: '人力资源部',
    index_name: '培训费用',
    budget_amount: 60000,
    executed_amount: 45000,
    execution_rate: '75',
    time_progress: '90',
    difference: -15,
  },
]

// 定义Excel表头
export const budgetTemplateHeader = [
  { key: 'department', title: '使用部门' },
  { key: 'index_name', title: '预算指标' },
  { key: 'budget_amount', title: '预算指标数' },
  { key: 'executed_amount', title: '指标执行数' },
  { key: 'execution_rate', title: '指标执行率' },
  { key: 'time_progress', title: '指标序时进度' },
  { key: 'difference', title: '差值' },
]
