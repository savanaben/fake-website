import React, { ReactNode } from 'react'

/** Maps the friendly position names to CSS background-position values */
function mapBgPosition(
  pos?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
): string {
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

interface SidebarColumnProps {
  width?: string
  bgColor?: string
  bgImage?: string
  bgImageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  bgImageSize?: 'cover' | 'contain' | 'auto' | 'stretch'
  bgImagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  children?: ReactNode
  isEmpty?: boolean
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

/** True if value is a positive number string (flex ratio), e.g. "1", "2.5", "4" */
function isFlexRatio(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const n = parseFloat(trimmed)
  return /^\d+(\.\d+)?$/.test(trimmed) && !isNaN(n) && n > 0
}

export function SidebarColumn({
  width = '200px',
  bgColor,
  bgImage,
  bgImageRepeat = 'no-repeat',
  bgImageSize = 'cover',
  bgImagePosition = 'center',
  children,
  isEmpty,
  onDragOver,
  onDrop,
  onClick,
  className,
}: SidebarColumnProps) {
  const effectiveWidth = (width && String(width).trim() !== '') ? width : '200px'
  const useFlex = isFlexRatio(effectiveWidth)
  const flexValue = useFlex ? String(effectiveWidth).trim() : undefined

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...(useFlex
      ? { flex: `${flexValue} 1 0%`, minWidth: 0 }
      : { width: effectiveWidth, flexShrink: 0 }),
    alignSelf: 'stretch',
    position: 'relative',
    // Avoid overflow: hidden so sticky children (SidebarContent) can stick correctly
    overflow: 'visible',
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(bgImage
      ? {
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: bgImageRepeat,
          backgroundSize: mapBgSize(bgImageSize),
          backgroundPosition: mapBgPosition(bgImagePosition),
        }
      : {}),
  }

  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isEmpty ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #d1d5db',
            margin: '0.5rem',
            borderRadius: '0.375rem',
            padding: '1rem',
            color: '#9ca3af',
            fontSize: '0.75rem',
            textAlign: 'center',
          }}
        >
          Drop SidebarContent here
        </div>
      ) : (
        children
      )}
    </div>
  )
}
