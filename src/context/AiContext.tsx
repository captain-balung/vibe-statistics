import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  getKey,
  setKey as persistKey,
  clearKey as persistClear,
  getModel,
  setModel as persistModel,
} from '../lib/apiKey'

type AiCtx = {
  apiKey: string
  model: string
  hasKey: boolean
  saveKey: (k: string) => void
  clearKey: () => void
  setModel: (m: string) => void
}

const Ctx = createContext<AiCtx | null>(null)

export function AiProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState(getKey())
  const [model, setModelState] = useState(getModel())

  const value: AiCtx = {
    apiKey,
    model,
    hasKey: apiKey.length > 0,
    saveKey: (k) => {
      persistKey(k)
      setApiKey(k)
    },
    clearKey: () => {
      persistClear()
      setApiKey('')
    },
    setModel: (m) => {
      persistModel(m)
      setModelState(m)
    },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAi() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAi 必須在 AiProvider 內使用')
  return c
}
