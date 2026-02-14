import React, { useState } from 'react'
import { WebsiteComponent, ComponentType, ComponentProps, TabStyle } from '@/types/website'
import { cn } from '@/lib/utils'
import { ConfigurationPanel } from './ConfigurationPanel'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LayerManagerProps {
  components: WebsiteComponent[]
  selectedComponentId: string | null
  onSelectComponent: (id: string) => void
  onMoveComponent: (componentId: string, targetParentId: string | null, targetIndex: number) => void
  onAddComponent: (type: ComponentType, parentId?: string, index?: number) => void
  selectedComponentType: ComponentType | null
  selectedComponentProps: ComponentProps
  onUpdateComponent: (props: Partial<ComponentProps>) => void
  onSidebarContentStickyChange?: (componentId: string, sticky: boolean, edge?: 'top' | 'bottom') => void
  onDeleteComponent?: () => void
  // Tab configuration
  showTabSettings?: boolean
  allTabs?: Array<{ id: string; label: string; enabled?: boolean; position?: number }>
  onUpdateTab?: (tabId: string, updates: { label?: string; enabled?: boolean; position?: number }) => void
  tabStyle?: TabStyle
  onUpdateTabStyle?: (style: TabStyle) => void
  tabSticky?: boolean
  onUpdateTabSticky?: (sticky: boolean) => void
  tabIconUrl?: string
  tabIconAlt?: string
  onUpdateTabIcon?: (iconUrl?: string, iconAlt?: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const getComponentLabel = (component: WebsiteComponent): string => {
  // Use custom name if provided
  if (component.props.name) {
    return component.props.name
  }
  
  // Otherwise use default labels
  switch (component.type) {
    case 'title':
      return `Title: ${component.props.title || 'Untitled'}`
    case 'paragraph':
      return 'Paragraph'
    case 'h1':
      return `H1: ${component.props.text || 'Heading 1'}`
    case 'h2':
      return `H2: ${component.props.text || 'Heading 2'}`
    case 'h3':
      return `H3: ${component.props.text || 'Heading 3'}`
    case 'h4':
      return `H4: ${component.props.text || 'Heading 4'}`
    case 'h5':
      return `H5: ${component.props.text || 'Heading 5'}`
    case 'h6':
      return `H6: ${component.props.text || 'Heading 6'}`
    case 'image':
      return `Image: ${component.props.alt || 'Image'}`
    case 'bannerImage':
      return `Banner: ${component.props.alt || 'Banner'}`
    case 'flexContainer':
      return 'Flex Container'
    case 'column':
      return 'Column'
    case 'fakeURLBar':
      return `URL Bar: ${component.props.urlText || 'https://example.com'}`
    default:
      return component.type
  }
}

const getComponentIcon = (type: ComponentType): string => {
  switch (type) {
    case 'flexContainer':
      return '📦'
    case 'column':
      return '📋'
    case 'title':
      return '📝'
    case 'paragraph':
      return '📄'
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return '🔤'
    case 'image':
    case 'bannerImage':
      return '🖼️'
    default:
      return '📦'
  }
}

interface LayerItemProps {
  component: WebsiteComponent
  selectedComponentId: string | null
  onSelect: (id: string) => void
  onMove: (componentId: string, targetParentId: string | null, targetIndex: number) => void
  onAdd: (type: ComponentType, parentId?: string, index?: number) => void
  level: number
  index: number
  parentId: string | null
}

function LayerItem({
  component,
  selectedComponentId,
  onSelect,
  onMove,
  onAdd,
  level,
  index,
  parentId,
}: LayerItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragOverDropZone, setDragOverDropZone] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = component.children && component.children.length > 0
  const isContainer = component.type === 'flexContainer' || component.type === 'column'
  const isEnabled = component.props.enabled !== false // Default to true if not set

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.setData('componentType', component.type)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    // Don't allow dropping on disabled components
    if (!isEnabled) return
    
    const draggedComponentId = e.dataTransfer.getData('componentId')
    const draggedComponentType = e.dataTransfer.getData('componentType') as ComponentType
    
    // Check if this is a new component from palette or existing component
    if (draggedComponentType && !draggedComponentId) {
      // New component from palette
      const isContainer = component.type === 'flexContainer' || component.type === 'column'
      if (isContainer && isEnabled) {
        // Add as child of this container
        onAdd(draggedComponentType, component.id, component.children?.length || 0)
      } else if (isEnabled) {
        // Add to this component's parent at this index
        onAdd(draggedComponentType, parentId || undefined, index)
      }
      return
    }
    
    // Existing component - reorder
    if (draggedComponentId && draggedComponentId === component.id) return

    // Check if this is a container type - if so, add as child
    const isContainer = component.type === 'flexContainer' || component.type === 'column'
    if (isContainer && isEnabled && draggedComponentId) {
      // Add as child of this container
      onMove(draggedComponentId, component.id, component.children?.length || 0)
    } else if (isEnabled && draggedComponentId) {
      // Move to this component's parent at this index (reorder)
      onMove(draggedComponentId, parentId, index)
    }
  }

  const handleDropOnSelf = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    // Don't allow dropping on disabled components
    if (!isEnabled) return
    
    const draggedComponentId = e.dataTransfer.getData('componentId')
    const draggedComponentType = e.dataTransfer.getData('componentType') as ComponentType
    
    // Only containers can have children
    const isContainer = component.type === 'flexContainer' || component.type === 'column'
    if (!isContainer || !isEnabled) return
    
    // Check if this is a new component from palette or existing component
    if (draggedComponentType && !draggedComponentId) {
      // New component from palette - add as child
      onAdd(draggedComponentType, component.id, component.children?.length || 0)
      return
    }
    
    // Existing component - move into this container
    if (draggedComponentId && draggedComponentId !== component.id) {
      onMove(draggedComponentId, component.id, component.children?.length || 0)
    }
  }

  const isSelected = selectedComponentId === component.id

  return (
    <div>
      <div
        draggable={isEnabled}
        onDragStart={isEnabled ? handleDragStart : undefined}
        onDragEnd={handleDragEnd}
        onDragOver={isEnabled ? handleDragOver : undefined}
        onDragLeave={isEnabled ? handleDragLeave : undefined}
        onDrop={isEnabled ? handleDrop : undefined}
        onClick={(e) => {
          e.stopPropagation()
          // Don't allow selecting disabled components
          if (isEnabled) {
            onSelect(component.id)
          }
        }}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors',
          isEnabled ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-50',
          isDragging && 'opacity-50',
        )}
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          ...(isSelected && isEnabled ? { 
            backgroundColor: 'rgba(36, 120, 204, 0.1)',
          } : {}),
          ...(dragOver && isEnabled ? {
            backgroundColor: 'rgba(36, 120, 204, 0.05)',
            border: '2px dashed #2478CC',
          } : {}),
        }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="w-4 h-4 flex items-center justify-center text-xs"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span>{getComponentIcon(component.type)}</span>
        <span className="flex-1 truncate">{getComponentLabel(component)}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDrop={handleDropOnSelf}
          className="min-h-[20px]"
        >
          {component.children!.map((child, childIndex) => (
            <LayerItem
              key={child.id}
              component={child}
              selectedComponentId={selectedComponentId}
              onSelect={onSelect}
              onMove={onMove}
              onAdd={onAdd}
              level={level + 1}
              index={childIndex}
              parentId={component.id}
            />
          ))}
        </div>
      )}
      {/* Drop zone for empty or collapsed containers */}
      {isContainer && isEnabled && (!hasChildren || !isExpanded) && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            e.dataTransfer.dropEffect = 'move'
            setDragOverDropZone(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragOverDropZone(false)
          }}
          onDrop={(e) => {
            setDragOverDropZone(false)
            handleDropOnSelf(e)
          }}
          className={cn(
            "min-h-[40px] border-2 border-dashed rounded mx-2 my-1 flex items-center justify-center text-xs transition-colors",
            !dragOverDropZone && !hasChildren 
              ? "border-gray-300 text-gray-400 hover:border-gray-400" 
              : dragOverDropZone
                ? "text-[#2478CC]"
                : "border-transparent"
          )}
          style={{
            marginLeft: `${level * 16 + 24}px`,
            ...(dragOverDropZone ? {
              borderColor: '#2478CC',
              backgroundColor: 'rgba(36, 120, 204, 0.05)',
            } : {})
          }}
        >
          {!hasChildren && "Drop here to add as child"}
        </div>
      )}
    </div>
  )
}

export function LayerManager({
  components,
  selectedComponentId,
  onSelectComponent,
  onMoveComponent,
  onAddComponent,
  selectedComponentType,
  selectedComponentProps,
  onUpdateComponent,
  onSidebarContentStickyChange,
  onDeleteComponent,
  showTabSettings,
  allTabs,
  onUpdateTab,
  tabStyle,
  onUpdateTabStyle,
  tabSticky,
  onUpdateTabSticky,
  tabIconUrl,
  tabIconAlt,
  onUpdateTabIcon,
  isCollapsed = false,
  onToggleCollapse,
}: LayerManagerProps) {
  const [dragOverTopZone, setDragOverTopZone] = useState(false)
  const [dragOverBottomZone, setDragOverBottomZone] = useState(false)

  const handleDropOnRoot = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault()
    const draggedComponentId = e.dataTransfer.getData('componentId')
    const draggedComponentType = e.dataTransfer.getData('componentType') as ComponentType
    
    // Check if this is a new component from palette or existing component
    if (draggedComponentType && !draggedComponentId) {
      // New component from palette - add to root
      onAddComponent(draggedComponentType, undefined, targetIndex !== undefined ? targetIndex : components.length)
    } else if (draggedComponentId) {
      // Existing component - move to root
      onMoveComponent(draggedComponentId, null, targetIndex !== undefined ? targetIndex : components.length)
    }
    setDragOverTopZone(false)
    setDragOverBottomZone(false)
  }

  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-gray-200 bg-gray-50 flex flex-col h-full items-center">
        <div className="p-2 border-b border-gray-200 w-full flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50 z-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Layers</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Configuration Panel at the top */}
        <div className="border-b border-gray-200">
          <ConfigurationPanel
            componentType={selectedComponentType}
            props={selectedComponentProps}
            selectedComponentId={selectedComponentId}
            onUpdate={onUpdateComponent}
            onSidebarContentStickyChange={onSidebarContentStickyChange}
            onDelete={onDeleteComponent}
            showTabSettings={showTabSettings}
            allTabs={allTabs}
            onUpdateTab={onUpdateTab}
            tabStyle={tabStyle}
            onUpdateTabStyle={onUpdateTabStyle}
            tabSticky={tabSticky}
            onUpdateTabSticky={onUpdateTabSticky}
            tabIconUrl={tabIconUrl}
            tabIconAlt={tabIconAlt}
            onUpdateTabIcon={onUpdateTabIcon}
          />
        </div>

        {/* Layers list */}
        <div className="p-2">
        {components.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No components yet
          </div>
        ) : (
          <div className="space-y-1">
            {/* Drop zone above first item */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.dataTransfer.dropEffect = 'move'
                setDragOverTopZone(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragOverTopZone(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropOnRoot(e, 0)
              }}
              className={cn(
                "min-h-[40px] border-2 border-dashed rounded mx-2 my-1 flex items-center justify-center text-xs transition-colors",
                dragOverTopZone
                  ? "border-[#2478CC] text-[#2478CC] bg-[rgba(36,120,204,0.05)]"
                  : "border-transparent text-gray-400 hover:border-gray-300"
              )}
            >
              Drop here to move to root
            </div>
            
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={handleDropOnRoot}
            >
              {/* Sort: enabled components first, disabled components last */}
              {[...components]
                .sort((a, b) => {
                  const aEnabled = a.props.enabled !== false
                  const bEnabled = b.props.enabled !== false
                  if (aEnabled === bEnabled) return 0
                  return aEnabled ? -1 : 1
                })
                .map((component, index) => (
                  <LayerItem
                    key={component.id}
                    component={component}
                    selectedComponentId={selectedComponentId}
                    onSelect={onSelectComponent}
                    onMove={onMoveComponent}
                    onAdd={onAddComponent}
                    level={0}
                    index={index}
                    parentId={null}
                  />
                ))}
            </div>
            
            {/* Drop zone below last item */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.dataTransfer.dropEffect = 'move'
                setDragOverBottomZone(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragOverBottomZone(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropOnRoot(e, components.length)
              }}
              className={cn(
                "min-h-[40px] border-2 border-dashed rounded mx-2 my-1 flex items-center justify-center text-xs transition-colors",
                dragOverBottomZone
                  ? "border-[#2478CC] text-[#2478CC] bg-[rgba(36,120,204,0.05)]"
                  : "border-transparent text-gray-400 hover:border-gray-300"
              )}
            >
              Drop here to move to root
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
