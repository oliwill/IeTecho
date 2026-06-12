export function getDirectionSymbol(direction: 'up' | 'down' | 'flat') {
  if (direction === 'up') return '↑'
  if (direction === 'down') return '↓'
  return '→'
}

export function getStatusTone(status: string) {
  if (['stable', 'normal', 'done', '平稳', '正常', '已完成'].includes(status)) return 'normal'
  if (['attention', 'followUp', 'high', 'low', '关注中', '待复查', '偏高', '偏低'].includes(status)) return 'attention'
  if (['overdue', 'warning', 'failed', '逾期', '异常', '解读失败'].includes(status)) return 'warning'
  if (['interpreting', 'pending', '待确认', '解读中'].includes(status)) return 'info'
  return 'default'
}
