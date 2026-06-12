import type { MetricRecord } from '../models/metric'

export const metricRecords: MetricRecord[] = [
  {
    id: 'metric-uric-acid-20260601',
    memberId: 'member-self',
    reportId: 'report-self-20260601',
    metricName: '尿酸',
    metricCode: 'UA',
    category: '代谢',
    value: 468,
    unit: 'μmol/L',
    referenceRange: '149-416',
    status: 'high',
    statusText: '偏高',
    isAbnormal: true,
    measuredAt: '2026-06-01',
    plainLanguageExplanation: '尿酸偏高可能与高嘌呤饮食、饮酒、代谢因素或肾功能相关。',
    possibleFactors: ['高嘌呤饮食', '饮酒', '代谢因素'],
    nextSuggestion: '减少动物内脏、海鲜和酒精，按计划复查。',
    confirmationState: 'pending'
  },
  {
    id: 'metric-ldl-20260601',
    memberId: 'member-self',
    reportId: 'report-self-20260601',
    metricName: 'LDL-C',
    metricCode: 'LDL_C',
    category: '血脂',
    value: 3.72,
    unit: 'mmol/L',
    referenceRange: '< 3.40',
    status: 'high',
    statusText: '偏高',
    isAbnormal: true,
    measuredAt: '2026-06-01',
    plainLanguageExplanation: 'LDL-C 常被称为低密度脂蛋白胆固醇，持续偏高需要关注心血管风险。',
    possibleFactors: ['饮食结构', '运动不足', '遗传因素'],
    nextSuggestion: '减少高油脂食物，保持规律运动，必要时咨询医生。',
    confirmationState: 'pending'
  },
  {
    id: 'metric-glucose-20260601',
    memberId: 'member-self',
    reportId: 'report-self-20260601',
    metricName: '空腹血糖',
    metricCode: 'FBG',
    category: '血糖',
    value: 5.4,
    unit: 'mmol/L',
    referenceRange: '3.9-6.1',
    status: 'normal',
    statusText: '正常',
    isAbnormal: false,
    measuredAt: '2026-06-01',
    plainLanguageExplanation: '本次空腹血糖在参考范围内。',
    confirmationState: 'confirmed'
  }
]

export const trendSummaries = [
  { metricName: '尿酸', memberName: '我', direction: 'up', symbol: '↑', status: 'attention', currentValue: '468 μmol/L' },
  { metricName: '血压', memberName: '父亲', direction: 'up', symbol: '↑', status: 'warning', currentValue: '148/92 mmHg' },
  { metricName: '血糖', memberName: '母亲', direction: 'flat', symbol: '→', status: 'normal', currentValue: '5.6 mmol/L' }
] as const
