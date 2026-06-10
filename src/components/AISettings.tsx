import { useState } from 'react'
import { useAi } from '../context/AiContext'
import { GEMINI_MODELS } from '../lib/gemini'
import { maskKey } from '../lib/apiKey'

// F-AI-01 / F-AI-02 AI 設定 modal：模型下拉 + API key 本地管理。
export default function AISettings({ onClose }: { onClose: () => void }) {
  const { apiKey, model, saveKey, clearKey, setModel } = useAi()
  const [draft, setDraft] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')

  function save() {
    if (draft.trim().length < 12) {
      setMsg('API key 看起來太短了（需 > 12 字），請確認貼上完整。')
      return
    }
    saveKey(draft.trim())
    setDraft('')
    setMsg('已儲存到這台裝置的瀏覽器。')
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>AI 評分設定</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <label className="field-label" htmlFor="model-select">
          Gemini 模型
        </label>
        <select
          id="model-select"
          className="num-input"
          style={{ width: '100%' }}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {GEMINI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="key-input">
          Google Gemini API key
        </label>
        {apiKey ? (
          <div className="key-status">
            <span className="tag">已設定：{maskKey(apiKey)}</span>
            <button className="btn btn--secondary" onClick={() => { clearKey(); setMsg('已清除。localStorage 中不再保留 key。') }}>
              清除
            </button>
          </div>
        ) : (
          <div className="key-input-row">
            <input
              id="key-input"
              className="num-input"
              style={{ flex: 1 }}
              type={show ? 'text' : 'password'}
              value={draft}
              placeholder="貼上你的 API key"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="btn btn--secondary" onClick={() => setShow((s) => !s)}>
              {show ? '隱藏' : '顯示'}
            </button>
            <button className="btn" onClick={save}>
              儲存
            </button>
          </div>
        )}

        {msg && <p className="modal-msg">{msg}</p>}

        <p className="modal-note">
          🔒 僅存於這台裝置的瀏覽器（localStorage），不會上傳到任何伺服器。評分時才會送往 Google Gemini。
          你可隨時清除。未設定 key 時，出題、作答、自我對答案都照常可用，只有「AI 評分」按鈕停用。
        </p>
      </div>
    </div>
  )
}
