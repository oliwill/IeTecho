import type { Reminder } from '../models/reminder'

export const reminders: Reminder[] = [
  {
    id: 'reminder-father-visit',
    memberId: 'member-father',
    memberName: '父亲',
    type: 'doctorVisit',
    typeLabel: '复诊',
    title: '心内科复诊',
    time: '2026-06-15T09:00:00+08:00',
    displayTime: '06/15 09:00',
    repeatRule: 'once',
    note: '带近期血压记录',
    status: 'today',
    subscriptionAuthorized: false
  },
  {
    id: 'reminder-self-uric-acid',
    memberId: 'member-self',
    memberName: '我',
    relatedMetricId: 'metric-uric-acid-20260601',
    type: 'followUpTest',
    typeLabel: '复查',
    title: '复查尿酸',
    time: '2026-09-01T08:30:00+08:00',
    displayTime: '09/01 上午',
    repeatRule: 'once',
    note: '复查前保持正常饮食，不要临时极端控制。',
    status: 'future',
    subscriptionAuthorized: false
  },
  {
    id: 'reminder-mother-glucose',
    memberId: 'member-mother',
    memberName: '母亲',
    type: 'followUpTest',
    typeLabel: '复查',
    title: '复查空腹血糖',
    time: '2026-06-18T08:00:00+08:00',
    displayTime: '06/18 上午',
    repeatRule: 'once',
    note: '建议空腹前往。',
    status: 'future',
    subscriptionAuthorized: false
  }
]
