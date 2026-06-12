import type { Report } from '../models/report'

export const reports: Report[] = [
  {
    id: 'report-self-20260601',
    memberId: 'member-self',
    memberName: '我',
    reportType: 'checkup',
    reportTypeLabel: '体检报告',
    hospital: '上海市体检中心',
    reportDate: '2026-06-01',
    fileType: 'pdf',
    fileName: '2026-06-01-体检报告.pdf',
    summary: '本次报告有 3 项指标需要关注，其中尿酸和 LDL-C 偏高。',
    interpretationId: 'interpretation-self-20260601',
    interpretationStatus: 'pendingMetrics',
    pendingMetricCount: 2
  },
  {
    id: 'report-father-20260520',
    memberId: 'member-father',
    memberName: '父亲',
    reportType: 'outpatient',
    reportTypeLabel: '门诊记录',
    hospital: '瑞金医院',
    department: '心内科',
    reportDate: '2026-05-20',
    fileType: 'image',
    summary: '血压记录偏高，建议继续监测并按时复诊。',
    interpretationStatus: 'interpreted',
    pendingMetricCount: 0
  }
]

export const uploadMockReport: Report = {
  id: 'report-upload-mock',
  memberId: 'member-self',
  memberName: '我',
  reportType: 'checkup',
  reportTypeLabel: '体检报告',
  hospital: '待填写',
  reportDate: '2026-06-12',
  fileType: 'mock',
  fileName: '体检报告示例.pdf',
  summary: '静态 Mock 文件，未进行真实上传。',
  interpretationStatus: 'none',
  pendingMetricCount: 0
}
