import type { Member } from '../models/member'

export const members: Member[] = [
  {
    id: 'member-self',
    name: '我',
    relation: 'self',
    relationLabel: '本人',
    gender: 'unknown',
    ageLabel: '32 岁',
    heightCm: 174,
    weightKg: 70,
    bmi: 23.1,
    focusTags: ['尿酸', '血脂'],
    medicalHistory: [],
    allergyHistory: [],
    avatarType: 'self',
    status: 'followUp',
    statusText: '待复查',
    latestReportDate: '2026-06-01',
    abnormalMetricCount: 2,
    reminderCount: 1,
    nextAction: '9 月前复查尿酸'
  },
  {
    id: 'member-father',
    name: '父亲',
    relation: 'father',
    relationLabel: '父亲',
    gender: 'male',
    ageLabel: '67 岁',
    focusTags: ['血压', '血脂'],
    medicalHistory: ['高血压'],
    avatarType: 'father',
    status: 'attention',
    statusText: '关注中',
    latestReportDate: '2026-05-20',
    abnormalMetricCount: 2,
    reminderCount: 1,
    nextAction: '3 天后心内科复诊'
  },
  {
    id: 'member-mother',
    name: '母亲',
    relation: 'mother',
    relationLabel: '母亲',
    gender: 'female',
    ageLabel: '63 岁',
    focusTags: ['血糖'],
    avatarType: 'mother',
    status: 'stable',
    statusText: '近期平稳',
    latestReportDate: '2026-05-12',
    abnormalMetricCount: 0,
    reminderCount: 1,
    nextAction: '未来 7 天复查血糖'
  }
]

export const firstUseMember: Member = {
  id: 'member-self-empty',
  name: '我',
  relation: 'self',
  relationLabel: '本人',
  gender: 'unknown',
  focusTags: [],
  avatarType: 'self',
  status: 'empty',
  statusText: '还没有档案',
  abnormalMetricCount: 0,
  reminderCount: 0,
  nextAction: '上传我的体检报告'
}
