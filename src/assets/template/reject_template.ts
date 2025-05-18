// 驳回单据模板数据
export const rejectTemplateData = [
  {
    单据月份: '2023-01',
    单据号: 'DJ202301001',
    单据摘要: '差旅费报销',
    单据金额: 3500,
    凭证类别: '费用报销',
    凭证月份: '2023-01',
    凭证号: 'FY202301001',
    驳回原因: '发票不清晰',
  },
  {
    单据月份: '2023-01',
    单据号: 'DJ202301005',
    单据摘要: '办公用品采购',
    单据金额: 2800,
    凭证类别: '费用报销',
    凭证月份: '2023-01',
    凭证号: 'FY202301005',
    驳回原因: '发票总不完整',
  },
]

export const rejectTemplateHeader = [
  { key: 'month', title: '单据月份' },
  { key: 'doc_number', title: '单据号' },
  { key: 'summary', title: '单据摘要' },
  { key: 'amount', title: '单据金额' },
  { key: 'voucher_type', title: '凭证类别' },
  { key: 'voucher_month', title: '凭证月份' },
  { key: 'voucher_number', title: '凭证号' },
  { key: 'reject_reason', title: '驳回原因' },
]
