import { SHENSHA_INFO } from '../lib/shenshaInfo'

/** 神煞 name that shows its 查法 and meaning in a bubble on hover / focus / tap. */
export function ShenShaTip({ name }: { name: string }) {
  const info = SHENSHA_INFO[name]
  if (!info) return <>{name}</>
  return (
    <span className="tip" tabIndex={0}>
      <span className="tip-label">{name}</span>
      <span className="tip-pop" role="tooltip">
        <strong>{name}</strong>
        <span>
          <b>查法</b>
          {info.rule}
        </span>
        <span>
          <b>含义</b>
          {info.meaning}
        </span>
        <small>传统说法，仅供参考</small>
      </span>
    </span>
  )
}
