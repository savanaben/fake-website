import React from 'react'

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
  bgColor?: string
  verticalAlign?: 'start' | 'center' | 'end'
  image?: string
  imagePosition?: Position9
  imageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  imageSize?: 'cover' | 'contain' | 'auto' | 'stretch'
  height?: 'grow' | string // 'grow' = flex:1, or fixed value like "200px"
  sticky?: boolean
  stickyEdge?: 'top' | 'bottom'
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

export function SidebarContent({
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
}: SidebarContentProps) {
  const isGrow = height === 'grow'

  // When sticky + grow + image, the flex child has minHeight: 0 so the sticky container would collapse to 0. Give it a min height so the image is visible.
  const needsStickyMinHeight = sticky && isGrow && !!image
  const stickyMinHeight = needsStickyMinHeight ? 200 : undefined

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    // Height / flex sizing
    ...(isGrow
      ? { flex: '1 1 0%' }
      : { flex: '0 0 auto', height }),
    // Vertical alignment in parent via auto-margins (non-sticky only; sticky overrides margins)
    ...(!sticky && verticalAlign === 'end' ? { marginTop: 'auto' } : {}),
    ...(!sticky && verticalAlign === 'center' ? { marginTop: 'auto', marginBottom: 'auto' } : {}),
    // Sticky positioning: explicit width so the element doesn't collapse to 0 width when stuck
    ...(sticky
      ? {
          position: 'sticky' as const,
          ...(stickyEdge === 'top'
            ? { top: '0px' }
            : {
                bottom: '0px',
                // Push to bottom of parent so the element's natural position is at the end;
                // sticky bottom then keeps it pinned to the viewport bottom while scrolling.
                marginTop: 'auto',
              }),
          alignSelf: 'flex-start',
          zIndex: 5,
          width: '100%',
          minWidth: '100%',
          boxSizing: 'border-box',
          ...(stickyMinHeight ? { minHeight: stickyMinHeight } : {}),
        }
      : { position: 'relative' as const }),
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
    <div className={className} style={style} onClick={onClick}>
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
