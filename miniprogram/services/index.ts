/**
 * Service 层统一出口。
 *
 * 页面只从这里 import,不直接 import data/mock-*。
 * 三层分离硬约束详见 docs/plans/2026-06-17-platform-decision.md。
 *
 * 接微信云函数时,各 service 内部实现替换为 wx.cloud.callFunction,
 * 本文件导出名称不变。
 */
export { memberService } from './memberService'
export { reportService } from './reportService'
export { metricService } from './metricService'
export { reminderService } from './reminderService'
export { interpretationService } from './interpretationService'
export { dashboardService } from './dashboardService'
export { exportService } from './exportService'
