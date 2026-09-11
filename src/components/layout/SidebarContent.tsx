import React, { useContext } from 'react'
import { SidebarLayoutContext } from './sidebarLayout'

type Position9 = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/** Maps the 9-position value to CSS background-position */
function mapBgPosition(pos?: Position9): string {
  switch (pos) {
    case 'top-left': return 'top left'
    case 'top': return 'top center'
    case 'top-right': return 'top right'
    case 'left': return 'center left'
    case 'right': return 'center right'
    case 'bottom-left': return 'bottom left'
    case 'bottom': return 'bottom center'
    case 'bottom-right': return 'bottom right'
    case 'center':
    default: return 'center'
  }
}

/** Maps the friendly size names to CSS background-size values */
function mapBgSize(size?: 'cover' | 'contain' | 'auto' | 'stretch'): string {
  switch (size) {
    case 'cover': return 'cover'
    case 'contain': return 'contain'
    case 'stretch': return '100% 100%'
    case 'auto':
    default: return 'auto'
  }
}

interface SidebarContentProps {
  /** Component id; used to look up sibling-aware alignment margins from SidebarColumn. */
  id?: string
  bgColor?: string
  /**
   * Requested vertical zone (Top / Center / Bottom). The actual auto margins are computed
   * per column by computeSidebarFlowHints so that groups pack correctly; this prop is
   * exposed as a data attribute for debugging / CSS hooks.
   */
  verticalAlign?: 'start' | 'center' | 'end'
  image?: string
  imagePosition?: Position9
  imageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  imageSize?: 'cover' | 'contain' | 'auto' | 'stretch'
  height?: 'grow' | string // 'grow' = flex:1, or fixed value like "200px"
  /**
   * Sticky items are rendered by SidebarColumn inside an overlay layer, so they do not
   * take up space in the flow. Requires a fixed height (see isEffectivelySticky).
   */
  sticky?: boolean
  stickyEdge?: 'top' | 'bottom'
  onClick?: (e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
}

export function SidebarContent({
  id,
  bgColor,
  verticalAlign = 'start',
  image,
  imagePosition = 'center',
  imageRepeat = 'no-repeat',
  imageSize = 'cover',
  height = 'grow',
  sticky = false,
  stickyEdge = 'top',
  onClick,
  className,
  style: styleOverride,
}: SidebarContentProps) {
  const isGrow = height === 'grow'
  const flowHints = useContext(SidebarLayoutContext)
  const alignHint = (!sticky && id && flowHints[id]) || {}

  // Sticky items interpret percent heights as percent of the VISIBLE scroll area, not of
  // the column, since a pinned element is effectively viewport-anchored. Container query
  // units do this without JS: `Ncqh` is N% of the nearest `container-type: size` ancestor,
  // which is the content scroll container (see BuilderCanvas). max-height clamps to the
  // column so a short passage does not get a sticky item taller than the column.
  const percentMatch = typeof height === 'string' ? /^\s*(\d+(?:\.\d+)?)%\s*$/.exec(height) : null
  const stickyViewportHeight = sticky && percentMatch ? `${percentMatch[1]}cqh` : undefined

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    // Height / flex sizing. Flow items: percent resolves against the SidebarColumn.
    // Sticky items: percent is translated to cqh (percent of the visible scroll area).
    ...(isGrow
      ? { flex: '1 1 0%' }
      : stickyViewportHeight
        ? { flex: '0 0 auto', height: stickyViewportHeight, maxHeight: '100%' }
        : { flex: '0 0 auto', height }),
    // Vertical alignment: auto margins computed once per column (see sidebarLayout.ts)
    ...alignHint,
    ...(sticky
      ? {
          position: 'sticky' as const,
          ...(stickyEdge === 'top'
            ? { top: '0px' }
            : {
                bottom: '0px',
                // Natural position at the bottom of the overlay layer; sticky bottom then
                // keeps it pinned to the scrollport bottom while scrolling.
                marginTop: 'auto',
              }),
          width: '100%',
          boxSizing: 'border-box',
          // The overlay layer has pointer-events: none so clicks reach flow items; re-enable
          // on the sticky item itself so it can still be selected.
          pointerEvents: 'auto',
        }
      : { position: 'relative' as const }),
    ...styleOverride,
  }

  // Image layer always fills the container; only the container's height is set (e.g. 50%).
  // We do not pass height to the image layer so percent values don't make the image a fraction of the container.
  const imageLayerStyle: React.CSSProperties = image
    ? {
        flex: '1 1 0%',
        minHeight: 0,
        width: '100%',
        backgroundImage: `url(${image})`,
        backgroundRepeat: imageRepeat,
        backgroundSize: mapBgSize(imageSize),
        backgroundPosition: mapBgPosition(imagePosition),
      }
    : {}

  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      data-sidebar-valign={verticalAlign}
      data-sidebar-sticky={sticky ? stickyEdge : undefined}
    >
      {image ? (
        <div style={imageLayerStyle} aria-hidden />
      ) : (
        /* Empty placeholder when no image and no bg color */
        !bgColor && (
          <div
            style={{
              width: '100%',
              minHeight: isGrow ? '60px' : undefined,
              flex: isGrow ? 1 : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #d1d5db',
              borderRadius: '0.25rem',
              color: '#9ca3af',
              fontSize: '0.675rem',
              padding: '0.5rem',
              textAlign: 'center',
            }}
          >
            SidebarContent
          </div>
        )
      )}
    </div>
  )
}
