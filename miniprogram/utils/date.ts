export function formatDisplayDate(dateText?: string) {
  if (!dateText) return '暂无记录'
  return dateText.replace(/-/g, '.')
}
