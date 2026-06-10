import katex from 'katex'

// 共用 KaTeX 公式元件（F-MATH-01）。block=true 為置中獨立公式，否則行內。
// throwOnError:false → 語法錯誤時顯示紅字而非整頁崩潰（不靜默吞錯）。
export default function Formula({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: block })
  return (
    <span
      className={block ? 'formula formula--block' : 'formula'}
      // KaTeX 輸出為受信任的數學標記
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
