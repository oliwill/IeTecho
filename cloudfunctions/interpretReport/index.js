// 云函数：interpretReport
// AI 报告解读：微信 OCR 提取文本 → DeepSeek 结构化解读。
//
// 设计原则（docs/plans/2026-06-17-platform-decision.md）：
// - 纯 Node 业务逻辑，OCR 和 AI 调用都封装在独立函数，iOS 后端可复用。
// - DeepSeek key 从云函数环境变量读取，绝不进 git。
// - 输出固定结构 JSON，便于解读结果页渲染和指标确认。
//
// 安全边界（docs/plans/2026-06-12-family-health-miniapp-design.md）：
// - 不输出诊断结论、处方、药物剂量。
// - 异常指标只解释含义 + 建议复查/就医。
// - 固定附加免责声明。
//
// 调用：interpretReport({ reportId })
// 流程：取报告 fileID → 下载临时链接 → OCR → DeepSeek → 存 interpretation → 返回

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// DeepSeek API（key 在云函数环境变量 DEEPSEEK_API_KEY，不入库）
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

exports.main = async (event) => {
  const { reportId } = event
  const userId = resolveUserId(event)

  if (!reportId) {
    return { ok: false, error: '缺少 reportId' }
  }

  try {
    // 1. 取报告记录，拿到 fileID
    const report = await getReport(userId, reportId)
    if (!report || !report.fileID) {
      return { ok: false, error: '报告不存在或缺少文件' }
    }

    // 标记解读中
    await patchReport(userId, reportId, { interpretationStatus: 'interpreting' })

    // 2. 按文件类型分流提取文字
    //    - PDF：云函数直接下载 Buffer → pdf-parse 抽文字（电子版 PDF 又快又准）
    //    - 图片：取临时链接 → 微信 OCR printedText
    const fileType = report.fileType || (report.fileID && /\.pdf$/i.test(report.fileID) ? 'pdf' : 'image')

    let ocrText = ''
    let failHint = '' // 失败时的针对性提示

    if (fileType === 'pdf') {
      try {
        const { text, isScanned } = await extractTextFromPdf(report.fileID)
        if (isScanned || text.length < 10) {
          // 扫描件：PDF 里全是图片，pdf-parse 提不到文字
          failHint = '该 PDF 是扫描件（纯图片），无法直接识别文字。请用相机拍照后以「图片」重新上传。'
        } else {
          ocrText = text
        }
      } catch (err) {
        console.warn('[interpretReport] PDF 文本提取失败', err && err.message)
        failHint = 'PDF 文本提取失败，请尝试拍照后以「图片」重新上传。'
      }
    } else if (fileType === 'image') {
      try {
        const { fileList } = await cloud.getTempFileIDs({ fileList: [report.fileID] })
        const imgUrl = fileList && fileList[0] && fileList[0].tempFileURL
        if (!imgUrl) throw new Error('无法获取报告文件链接')
        ocrText = await ocrImage(imgUrl)
      } catch (err) {
        console.warn('[interpretReport] OCR 失败', err && err.errMsg)
        failHint = '未能从图片中识别出文字，请尝试更清晰的报告照片。'
      }
      if (ocrText.trim().length < 10) {
        failHint = '未识别到有效文字，可能是图片模糊或非文字报告，请重新拍摄清晰照片上传。'
      }
    } else {
      failHint = '暂不支持该文件类型，请上传图片或 PDF 报告。'
    }

    if (!ocrText || ocrText.trim().length < 10) {
      // 文字提取失败：给出针对性提示，便于用户下一步操作
      await patchReport(userId, reportId, {
        interpretationStatus: 'failed',
        summary: failHint || '未能从报告中识别出文字内容。'
      })
      return { ok: false, error: failHint || '未识别到有效内容' }
    }

    // 4. DeepSeek 结构化解读
    const interpretation = await interpretWithDeepSeek(ocrText, report)

    // 5. 存 interpretation 集合
    const interpDoc = {
      userId,
      memberId: report.memberId,
      reportId,
      createdAt: new Date().toISOString(),
      riskLevel: interpretation.riskLevel,
      summary: interpretation.summary,
      abnormalMetrics: interpretation.abnormalMetrics || [],
      keyConcerns: interpretation.keyConcerns || [],
      lifestyleSuggestions: interpretation.lifestyleSuggestions || {},
      followUpSuggestions: interpretation.followUpSuggestions || [],
      disclaimer: DISCLAIMER,
      hasViewed: false
    }
    const addRes = await db.collection('interpretations').add({ data: interpDoc })

    // 6. 更新报告状态
    await patchReport(userId, reportId, {
      interpretationStatus: 'pendingMetrics',
      interpretationId: addRes._id,
      summary: interpretation.summary,
      pendingMetricCount: (interpretation.abnormalMetrics || []).length
    })

    return { ok: true, data: { interpretationId: addRes._id, interpretation: interpDoc } }
  } catch (err) {
    // 失败时标记报告解读失败
    await patchReport(userId, reportId, { interpretationStatus: 'failed' }).catch(() => {})
    return { ok: false, error: String(err && err.errMsg ? err.errMsg : err) }
  }
}

// ── OCR：微信云开发通用印刷体识别 ──────────────
// 注意：云调用方法名是 printedText（不是 printText）；imgUrl 传纯字符串 URL。
async function ocrImage(imgUrl) {
  const res = await cloud.openapi.ocr.printedText({ imgUrl })
  // res.items 数组，每项有 text
  const items = res && res.items ? res.items : []
  return items.map((it) => it.text || '').join('\n')
}

// ── PDF 文本提取：电子版 PDF 直接抽文字，又快又准 ──
// 返回 { text, isScanned }；isScanned=true 表示是扫描件（几乎提不到文字）。
async function extractTextFromPdf(fileID) {
  const pdfParse = require('pdf-parse')
  const { fileContent } = await cloud.downloadFile({ fileID })
  const data = await pdfParse(fileContent) // fileContent 在云函数端是 Buffer，可直接喂
  const text = (data && data.text ? data.text : '').trim()
  // 扫描件判定：pdf-parse 能跑通但几乎提不到文字（每页平均字符数极低）
  const pages = (data && data.numpages) || 1
  const isScanned = text.length < pages * 15 // 经验阈值：电子版每页至少几十字
  return { text, isScanned }
}

// ── DeepSeek 解读 ──────────────────────────────
async function interpretWithDeepSeek(ocrText, report) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未配置')
  }

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(ocrText, report)

  const resp = await httpsPostJson(DEEPSEEK_API, {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000
  }, {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  })

  const content = resp && resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content
  if (!content) {
    throw new Error('DeepSeek 返回为空')
  }

  // 强制 JSON 解析（response_format 已要求，但兜底手动提取）
  return parseInterpretationJson(content)
}

function buildSystemPrompt() {
  return [
    '你是一个体检报告解读助手。用户会提供体检报告的 OCR 文本（可能包含错别字、乱序、多余字符）。',
    '你的任务：',
    '1. 从 OCR 文本中提取关键健康指标（数值、单位、参考范围）。',
    '2. 识别异常指标（超出参考范围的）。',
    '3. 用通俗语言解释每个异常指标的可能含义。',
    '4. 给出生活方式建议（饮食、运动、作息）和复查建议。',
    '',
    '严格限制：',
    '- 不得给出医学诊断结论。',
    '- 不得推荐处方药、药物剂量。',
    '- 不得替代医生判断。',
    '- 异常指标只解释含义和下一步建议。',
    '',
    '必须返回 JSON，结构如下：',
    '{',
    '  "riskLevel": "low" | "attention" | "warning",',
    '  "summary": "一句话总结本次报告（针对普通人）",',
    '  "abnormalMetrics": [',
    '    { "metricName": "尿酸", "value": "468", "unit": "μmol/L", "status": "high", "statusText": "偏高", "referenceRange": "208-428", "plainExplanation": "通俗解释", "nextSuggestion": "建议" }',
    '  ],',
    '  "keyConcerns": ["重点关注 1", "重点关注 2"],',
    '  "lifestyleSuggestions": {',
    '    "diet": ["建议 1"],',
    '    "exercise": ["建议 1"],',
    '    "sleep": [],',
    '    "habits": []',
    '  },',
    '  "followUpSuggestions": ["1-3 个月后复查尿酸"]',
    '}',
    '',
    '如果没有异常指标，abnormalMetrics 返回空数组，riskLevel 为 low。'
  ].join('\n')
}

function buildUserPrompt(ocrText, report) {
  return [
    '报告类型：' + (report.reportTypeLabel || '体检报告'),
    '报告日期：' + (report.reportDate || '未知'),
    report.hospital ? '医院：' + report.hospital : '',
    '',
    '以下是报告的 OCR 文本：',
    '---',
    ocrText,
    '---',
    '',
    '请解读并返回 JSON。'
  ].filter(Boolean).join('\n')
}

// 容错 JSON 解析
function parseInterpretationJson(content) {
  try {
    return JSON.parse(content)
  } catch (e) {
    // 尝试提取 { ... } 片段
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (e2) {
        throw new Error('DeepSeek 返回非合法 JSON')
      }
    }
    throw new Error('DeepSeek 返回非合法 JSON')
  }
}

// ── 数据库操作 ─────────────────────────────────
async function getReport(userId, id) {
  let { data } = await db.collection('reports').where({ id, userId }).get()
  if (!data.length) {
    data = (await db.collection('reports').where({ _id: id, userId }).get()).data
  }
  return data[0] ? { ...data[0], id: data[0].id || data[0]._id } : null
}

async function patchReport(userId, id, patch) {
  const payload = { ...patch, updatedAt: new Date().toISOString() }
  await db.collection('reports').where({ id, userId }).update({ data: payload })
}

// ── HTTP POST（云函数无 fetch，用 Node https）──
async function httpsPostJson(url, body, headers) {
  return new Promise((resolve, reject) => {
    const https = require('https')
    const u = new URL(url)
    const payload = JSON.stringify(body)
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname + u.search,
        method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(payload) }
      },
      (res) => {
        let chunks = ''
        res.on('data', (d) => (chunks += d))
        res.on('end', () => {
          try {
            resolve(JSON.parse(chunks))
          } catch (e) {
            reject(new Error('DeepSeek 返回非 JSON: ' + chunks.slice(0, 200)))
          }
        })
      }
    )
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

const DISCLAIMER = '本解读仅用于帮助理解体检报告和管理健康档案，不构成诊断或治疗建议。如指标持续异常或出现不适，请咨询医生。'

function resolveUserId(event) {
  if (event.userId) return event.userId
  try {
    const c = cloud.getWXContext()
    if (c && c.OPENID) return `wx:${c.OPENID}`
  } catch (e) {}
  return 'anonymous'
}
