// 预算项目模板数据
export const projectTemplateData = [
  {
    使用部门: '行政部',
    预算指标: '办公费用',
    预算项目: '办公费用',
    项目预算数: 100,
    项目执行数: 81,
    项目执行率: '81%',
    项目序时进度: '90%',
    差值: -9,
  },
  {
    使用部门: '行政部',
    预算指标: '办公用品',
    预算项目: '办公用品',
    项目预算数: 100,
    项目执行数: 82,
    项目执行率: '82%',
    项目序时进度: '90%',
    差值: -8,
  },
]

// 定义Excel表头
export const projectTemplateHeader = [
  { key: '使用部门', title: '使用部门' },
  { key: '预算指标', title: '预算指标' },
  { key: '预算项目', title: '预算项目' },
  { key: '项目预算数', title: '项目预算数' },
  { key: '项目执行数', title: '项目执行数' },
  { key: '项目执行率', title: '项目执行率' },
  { key: '项目序时进度', title: '项目序时进度' },
  { key: '差值', title: '差值' },
]

// 字段映射关系
export const fieldMapping = {
  使用部门: 'department',
  预算指标: 'budget_index',
  预算项目: 'project_name',
  项目预算数: 'budget_amount',
  项目执行数: 'executed_amount',
  项目执行率: 'execution_rate',
  项目序时进度: 'time_progress',
  差值: 'difference',
}
