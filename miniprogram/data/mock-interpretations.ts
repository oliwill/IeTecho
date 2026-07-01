import type { Interpretation } from '../models/interpretation'

export const disclaimer = '内容仅用于帮助理解体检报告和管理健康档案，不构成诊断或治疗建议。如指标持续异常或出现不适，请咨询医生。'

export const interpretations: Interpretation[] = [
  {
    id: 'interpretation-self-20260601',
    memberId: 'member-self',
    reportId: 'report-self-20260601',
    createdAt: '2026-06-01T20:30:00+08:00',
    riskLevel: 'attention',
    summary: '本次报告有 3 项指标需要关注，其中尿酸和 LDL-C 偏高。空腹血糖在参考范围内。',
    // 字段对齐云函数 interpretReport 写入结构：内嵌完整异常指标对象。
    abnormalMetrics: [
      {
        metricName: '尿酸',
        value: 468,
        unit: 'μmol/L',
        status: 'high',
        statusText: '偏高',
        referenceRange: '149-416',
        plainExplanation: '尿酸偏高可能与高嘌呤饮食、饮酒、代谢因素或肾功能相关。',
        nextSuggestion: '减少动物内脏、海鲜和酒精，按计划复查。',
        possibleFactors: ['高嘌呤饮食', '饮酒', '代谢因素']
      },
      {
        metricName: 'LDL-C',
        value: 3.72,
        unit: 'mmol/L',
        status: 'high',
        statusText: '偏高',
        referenceRange: '< 3.40',
        plainExplanation: 'LDL-C 常被称为低密度脂蛋白胆固醇，持续偏高需要关注心血管风险。',
        nextSuggestion: '减少高油脂食物，保持规律运动，必要时咨询医生。',
        possibleFactors: ['饮食结构', '运动不足', '遗传因素']
      }
    ],
    keyConcerns: ['尿酸偏高', 'LDL-C 偏高', '建议按计划复查并观察趋势'],
    lifestyleSuggestions: {
      diet: ['减少动物内脏、海鲜和酒精', '控制高油脂食物', '增加蔬菜和全谷物比例'],
      exercise: ['保持规律中等强度运动', '避免突然高强度运动后立即体检'],
      habits: ['保持饮水', '定期复查同一指标，观察趋势']
    },
    followUpSuggestions: ['建议 1-3 个月后复查尿酸', '如指标持续异常或出现不适，请咨询医生'],
    disclaimer,
    hasViewed: true
  }
]
