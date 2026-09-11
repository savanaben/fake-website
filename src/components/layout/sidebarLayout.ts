import { createContext } from 'react'

/**
 * Sidebar layout helpers shared by SidebarColumn / SidebarContent.
 *
 * Both bugs these helpers address stem from a SidebarContent item deciding its
 * own vertical placement without knowing its siblings:
 *
 *  1. Vertical alignment was implemented with per-item auto margins. CSS
 *     distributes flex free space *equally among every auto margin*, so three
 *     "Bottom" items each got a third of the gap instead of packing at the
 *     bottom. The fix computes margins once per column so that exactly one auto
 *     margin exists at each zone boundary (top zone -> center zone -> bottom zone).
 *
 *  2. Sticky items are `position: sticky`, which by spec stays in normal flow and
 *     reserves its slot. The column renders sticky items in a separate absolutely
 *     positioned overlay layer, so flow items lay out as if sticky ones did not exist.
 */

export type SidebarVerticalAlign = 'start' | 'center' | 'end'

export interface SidebarFlowHint {
  marginTop?: 'auto'
  marginBottom?: 'auto'
}

/** Map of SidebarContent id -> auto margins it should apply. Provided by SidebarColumn. */
export const SidebarLayoutContext = createContext<Record<string, SidebarFlowHint>>({})

export interface SidebarFlowItem {
  id: string
  verticalAlign?: SidebarVerticalAlign
}

/**
 * Compute auto margins for the non-sticky ("flow") children of a SidebarColumn.
 *
 * Boundary rule (items in DOM order, `p` = previous alignment, `n` = next alignment):
 *   center && p !== center                 -> marginTop: auto
 *   center && n !== center                 -> marginBottom: auto
 *   end && p !== end && p !== center       -> marginTop: auto
 *   start                                  -> nothing
 *
 * Result: one auto margin per zone boundary, so Bottom items pack flush at the
 * bottom, Center items cluster and sit centered between the top and bottom groups,
 * and Top items pack at the top. Items are assumed to be ordered top/center/bottom;
 * out-of-order items simply follow DOM order.
 *
 * Note: if any flow sibling has Height = Grow (flex: 1 1 0%) there is no free space
 * and all auto margins resolve to 0. That is correct CSS, not a bug.
 */
export function computeSidebarFlowHints(items: SidebarFlowItem[]): Record<string, SidebarFlowHint> {
  const hints: Record<string, SidebarFlowHint> = {}
  for (let i = 0; i < items.length; i++) {
    const a: SidebarVerticalAlign = items[i].verticalAlign || 'start'
    const p: SidebarVerticalAlign | undefined = i > 0 ? items[i - 1].verticalAlign || 'start' : undefined
    const n: SidebarVerticalAlign | undefined = i < items.length - 1 ? items[i + 1].verticalAlign || 'start' : undefined
    const hint: SidebarFlowHint = {}
    if (a === 'center') {
      if (p !== 'center') hint.marginTop = 'auto'
      if (n !== 'center') hint.marginBottom = 'auto'
    } else if (a === 'end') {
      if (p !== 'end' && p !== 'center') hint.marginTop = 'auto'
    }
    if (hint.marginTop || hint.marginBottom) hints[items[i].id] = hint
  }
  return hints
}

/**
 * A SidebarContent is only treated as sticky when it also has a fixed height.
 * Sticky + Grow would fill the whole overlay layer and cover the column, so it
 * falls back to a normal flow item (the config UI already disables that combo).
 */
export function isEffectivelySticky(props: { sidebarContentSticky?: boolean; sidebarContentHeight?: string }): boolean {
  return props.sidebarContentSticky === true && (props.sidebarContentHeight || 'grow') !== 'grow'
}
