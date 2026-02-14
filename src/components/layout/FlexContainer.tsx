import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FlexContainerProps {
  children: ReactNode
  className?: string
  gap?: string
  direction?: 'row' | 'column'
  maxWidthMode?: 'default' | 'full'
  columnDistribution?: string
  isEmpty?: boolean
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export function FlexContainer({ 
  children, 
  className, 
  gap = 'gap-4',
  direction = 'row',
  maxWidthMode = 'default',
  columnDistribution: _columnDistribution, // Used by parent componentFactory
  isEmpty = false,
  onDragOver,
  onDrop,
}: FlexContainerProps) {
  const hasChildren = React.Children.count(children) > 0

  return (
    <div 
      className={cn(
        'flex w-full min-h-[30px] p-6',
        direction === 'column' ? 'flex-col' : 'flex-row',
        maxWidthMode === 'default' && 'max-w-[900px] mx-auto',
        (!hasChildren || isEmpty) && 'border-2 border-dashed border-gray-300 rounded-lg',
        gap, 
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {!hasChildren ? (
        <div className="w-full text-center text-gray-400 text-sm py-8">
          Drop components here
        </div>
      ) : (
        children
      )}
    </div>
  )
}
