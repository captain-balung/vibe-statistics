// 唯一可對外發出網路請求的模組：呼叫 Google Gemini REST API。
// 端點固定為 Gemini REST，模型名稱由參數傳入（不可寫死單一字串）。
// 紅線：除此處送往 Gemini 外，不得將使用者資料送往任何其他伺服器。
// 錯誤不得吞掉——失敗時 throw，由 UI 顯示。

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

export const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash（穩定，預設）' },
  { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro（更強，較慢）' },
  { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash（備選）' },
]

export async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  if (!apiKey) throw new Error('尚未設定 API key')
  const url = `${ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] }),
  })
  if (!res.ok) {
    let msg = `Gemini 回應錯誤（HTTP ${res.status}）`
    try {
      const j = await res.json()
      if (j?.error?.message) msg += `：${j.error.message}`
    } catch {
      // 保留原訊息
    }
    throw new Error(msg)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini 沒有回傳可用的文字內容')
  return text
}
