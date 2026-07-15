import { StatusRow } from '@/components/chat/status-row'
import { useI18n } from '@/i18n'

/**
 * Manual `/compress` indicator, rendered in the composer status stack (above the
 * input). `/compress` runs as a standalone RPC while the session is idle, so the
 * turn-scoped thread spinners never surface it — this row shows the same shimmer
 * + pulse chrome as auto-compaction. Pure presentation: the stack owns the
 * gate ($compressActive) and only mounts this row while a compress is in flight.
 */
export function CompressStatusRow() {
  const { t } = useI18n()

  return (
    <StatusRow
      className="min-h-7 px-3.5"
      leading={
        <span
          aria-hidden="true"
          className="dither inline-block size-3 rounded-[2px] text-midground/80 animate-pulse"
        />
      }
    >
      <span aria-live="polite" className="shimmer min-w-0 truncate text-xs text-muted-foreground/70" role="status">
        {t.statusStack.compressing}
      </span>
    </StatusRow>
  )
}
