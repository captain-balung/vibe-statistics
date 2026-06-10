// 唯一讀寫 localStorage 中 Gemini key 與 model 的模組（見 design.md）。
// 紅線：key 只存本機 localStorage，絕不上傳、絕不寫入版控。
const KEY_NAME = 'vibe-stats-gemini-key'
const MODEL_NAME = 'vibe-stats-gemini-model'

export const DEFAULT_MODEL = 'gemini-2.5-flash'

export function getKey(): string {
  try {
    return localStorage.getItem(KEY_NAME) || ''
  } catch {
    return ''
  }
}

export function setKey(key: string): void {
  localStorage.setItem(KEY_NAME, key)
}

export function clearKey(): void {
  localStorage.removeItem(KEY_NAME)
}

export function getModel(): string {
  try {
    return localStorage.getItem(MODEL_NAME) || DEFAULT_MODEL
  } catch {
    return DEFAULT_MODEL
  }
}

export function setModel(model: string): void {
  localStorage.setItem(MODEL_NAME, model)
}

/** 遮蔽預覽，如 AIza••••••xxx */
export function maskKey(key: string): string {
  if (key.length <= 8) return '••••••'
  return key.slice(0, 4) + '••••••' + key.slice(-3)
}
