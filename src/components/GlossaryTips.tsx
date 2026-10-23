import { CONCEPTS, SOUND_INFO, TERRAIN_INFO } from '../lib/glossary'
import { useTerm } from '../settingsContext'
import { InfoTip, TipLine } from './InfoTip'

/** A concept label (纳音, 星运, 大运 …) explained on hover. `name` is the 简体 key. */
export function ConceptTip({ name }: { name: string }) {
  const term = useTerm()
  const entry = CONCEPTS[name]
  if (!entry) return <>{term(name)}</>
  return (
    <InfoTip label={term(name)} title={term(name)}>
      <span>{entry.what}</span>
      {entry.read && <span className="muted">{entry.read}</span>}
    </InfoTip>
  )
}

/** A 纳音 value such as 路旁土. */
export function SoundTip({ name }: { name: string }) {
  const term = useTerm()
  const info = SOUND_INFO[name]
  if (!info) return <>{term(name)}</>
  return (
    <InfoTip label={term(name)} title={`${term('纳音')} · ${term(name)}`}>
      <TipLine name="五行">{name.slice(-1)}</TipLine>
      <TipLine name="意象">{info}</TipLine>
      <small>传统意象，仅供参考</small>
    </InfoTip>
  )
}

/** A 十二长生 stage, read either for the 日主 (星运) or the pillar's own stem (自坐). */
export function TerrainTip({ name, stem, branch, kind }: { name: string; stem: string; branch: string; kind: 'terrain' | 'self' }) {
  const term = useTerm()
  const info = TERRAIN_INFO[name]
  if (!info) return <>{term(name)}</>
  const who = kind === 'terrain' ? `日主${stem}` : `本柱天干${stem}`
  return (
    <InfoTip label={term(name)} title={`${term(kind === 'terrain' ? '星运' : '自坐')} · ${term(name)}`}>
      <span>
        {who}在{branch}处于「{term(name)}」。
      </span>
      <TipLine name="含义">{info}</TipLine>
    </InfoTip>
  )
}

/** A pillar's 空亡 pair, with the 旬 it comes from. */
export function EmptyTip({ empty, xun, ganzhi }: { empty: string; xun: string; ganzhi: string }) {
  const term = useTerm()
  return (
    <InfoTip label={empty} title={`${term('空亡')} · ${empty}`}>
      <span>
        {ganzhi}属{xun}旬。这一旬的十个天干只能配十个地支，剩下{[...empty].join('、')}两支无干可配，所以空亡。
      </span>
      <span className="muted">其他柱或岁运的地支遇到{[...empty].join('、')}，传统认为作用减弱。</span>
    </InfoTip>
  )
}
