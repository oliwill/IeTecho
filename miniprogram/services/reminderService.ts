import { reminders } from '../data/mock-reminders'
import type { Reminder } from '../models/reminder'
import { resolve } from './_async'

/**
 * 提醒读取 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现,接口不变。
 *
 * P1 接入计划：第二批（reminderOps 云函数待建，主链路验证通过后再接入）。
 */
export const reminderService = {
  /** 全部提醒。 */
  list: (): Promise<Reminder[]> => resolve(reminders),

  /** 取某成员的全部提醒。 */
  getByMember: (memberId: string): Promise<Reminder[]> =>
    resolve(reminders.filter((item) => item.memberId === memberId))
}
