import React, { useRef, useEffect, useState } from 'react'
import { WebsiteComponent, ComponentType } from '@/types/website'
import { renderComponent } from '@/utils/componentFactory'
import { Container } from '@/components/layout/Container'
import { TabComponent } from '@/components/content/TabComponent'
import { Toolbar } from '@/components/layout/Toolbar'
import { FillerTabBar } from '@/components/layout/FillerTabBar'

import { TabStyle } from '@/types/website'

interface BuilderCanvasProps {
  components: WebsiteComponent[]
  selectedComponentId: string | null
  onSelectComponent: (id: string) => void
  onDrop: (componentType: ComponentType, parentId?: string, index?: number, isCrossTab?: boolean) => void
  onDragOver: (e: React.DragEvent, parentId?: string, index?: number) => void
  tabs: Array<{ id: string; label: string; content: WebsiteComponent[]; enabled?: boolean; position?: number }>
  activeTabId: string
  onTabChange: (tabId: string) => void
  crossTabComponents?: WebsiteComponent[]
  tabStyle?: TabStyle
  tabSticky?: boolean
  tabIconUrl?: string
  tabIconAlt?: string
  hideTabBar?: boolean
  hideToolbar?: boolean
}


export function BuilderCanvas({
  components: _components, // Used indirectly through tabs
  selectedComponentId,
  onSelectComponent,
  onDrop,
  onDragOver,
  tabs,
  activeTabId,
  onTabChange,
  crossTabComponents = [],
  tabStyle = 'line',
  tabSticky = false,
  tabIconUrl,
  tabIconAlt,
  hideTabBar = false,
  hideToolbar = false,
}: BuilderCanvasProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const componentType = e.dataTransfer.getData('componentType') as ComponentType
    if (componentType) {
      onDrop(componentType)
    }
  }

  const handleContainerDragOver = (e: React.DragEvent, parentId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    onDragOver(e, parentId)
  }

  const handleContainerDrop = (e: React.DragEvent, componentType: string, parentId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    onDrop(componentType as ComponentType, parentId)
  }

  const renderChildren = (children: WebsiteComponent[]): React.ReactNode => {
    return children.map((child) => (
      <React.Fragment key={child.id}>
        {renderComponent({
          component: child,
          onSelect: onSelectComponent,
          isSelected: selectedComponentId === child.id,
          renderChildren,
          onDragOver: handleContainerDragOver,
          onDrop: handleContainerDrop,
        })}
      </React.Fragment>
    ))
  }

  // Get cross-tab components (FakeURLBar and WebsiteHeaderBar)
  const fakeURLBarComponents = crossTabComponents.filter((comp) => comp.type === 'fakeURLBar')
  const websiteHeaderBarComponents = crossTabComponents.filter((comp) => comp.type === 'websiteHeaderBar')

  // State for measured heights and calculated sticky positions
  const [heights, setHeights] = useState({
    toolbar: 60,
    fillerTabBar: 64,
    urlBar: 0,
    headerBar: 0,
  })

  const [stickyPositions, setStickyPositions] = useState({
    urlBar: undefined as string | undefined,
    headerBar: undefined as string | undefined,
    tabComponent: undefined as string | undefined,
  })

  // Container ref to measure heights of child elements
  const containerRef = useRef<HTMLDivElement>(null)

  // Measure heights after render by querying the DOM
  useEffect(() => {
    const measureHeights = () => {
      if (!containerRef.current) return

      const newHeights = { ...heights }

      // When toolbar is hidden, its height is 0 for sticky offset calculations
      if (hideToolbar) {
        newHeights.toolbar = 0
      } else {
        // Measure Toolbar - find the sticky element with z-20 (first sticky element)
        const allSticky = containerRef.current.querySelectorAll('.sticky')
        const toolbar = Array.from(allSticky).find(el => {
          const zIndex = window.getComputedStyle(el).zIndex
          return zIndex === '20'
        }) as HTMLElement
        if (toolbar) {
          newHeights.toolbar = toolbar.getBoundingClientRect().height
        }
      }

      // Measure FillerTabBar - find sticky element with z-10 (only when toolbar is rendered)
      const allSticky = containerRef.current.querySelectorAll('.sticky')
      const fillerTabBar = Array.from(allSticky).find(el => {
        const zIndex = window.getComputedStyle(el).zIndex
        return zIndex === '10'
      }) as HTMLElement
      if (fillerTabBar) {
        newHeights.fillerTabBar = fillerTabBar.getBoundingClientRect().height
      }

      // Measure FakeURLBar - find sticky element with z-15
      const urlBar = Array.from(allSticky).find(el => {
        const zIndex = window.getComputedStyle(el).zIndex
        return zIndex === '15'
      }) as HTMLElement
      if (urlBar) {
        newHeights.urlBar = urlBar.getBoundingClientRect().height
      }

      // Measure WebsiteHeaderBar - find sticky element with z-14
      const headerBar = Array.from(allSticky).find(el => {
        const zIndex = window.getComputedStyle(el).zIndex
        return zIndex === '14'
      }) as HTMLElement
      if (headerBar) {
        newHeights.headerBar = headerBar.getBoundingClientRect().height
      }

      setHeights(newHeights)

      // Calculate sticky positions based on measured heights
      let currentStickyOffset = newHeights.toolbar + newHeights.fillerTabBar

      const urlBarSticky = fakeURLBarComponents.length > 0 && fakeURLBarComponents[0].props.urlBarSticky === true
      const urlBarTop = urlBarSticky ? `${currentStickyOffset}px` : undefined
      if (urlBarSticky && newHeights.urlBar > 0) {
        currentStickyOffset += newHeights.urlBar
      }

      const headerBarSticky = websiteHeaderBarComponents.length > 0 && websiteHeaderBarComponents[0].props.headerBarSticky === true
      const headerBarTop = headerBarSticky ? `${currentStickyOffset}px` : undefined
      if (headerBarSticky && newHeights.headerBar > 0) {
        currentStickyOffset += newHeights.headerBar
      }

      const tabComponentTop = tabSticky ? `${currentStickyOffset}px` : undefined

      setStickyPositions({
        urlBar: urlBarTop,
        headerBar: headerBarTop,
        tabComponent: tabComponentTop,
      })
    }

    // Measure after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(measureHeights, 0)
    
    // Also measure on window resize
    window.addEventListener('resize', measureHeights)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', measureHeights)
    }
  }, [hideToolbar, fakeURLBarComponents, websiteHeaderBarComponents, tabSticky, heights.toolbar, heights.fillerTabBar, heights.urlBar, heights.headerBar])

  // Sort tabs by position before creating tab data
  const sortedTabs = [...tabs].sort((a, b) => (a.position || 0) - (b.position || 0))
  
  // Create tab data for TabComponent
  const tabData = sortedTabs.map((tab) => {
    return {
      id: tab.id,
      label: tab.label,
      enabled: tab.enabled,
      content: (
        <div className="flex flex-col items-center space-y-0">
          {tab.content.length === 0 ? (
            <div className="text-center text-gray-400 py-12 border-2 border-dashed rounded-lg w-full">
              <p>Drag components here or click to add</p>
            </div>
          ) : (
            tab.content.map((component) => (
              <React.Fragment key={component.id}>
                {renderComponent({
                  component,
                  onSelect: onSelectComponent,
                  isSelected: selectedComponentId === component.id,
                  renderChildren,
                  onDragOver: handleContainerDragOver,
                  onDrop: handleContainerDrop,
                })}
              </React.Fragment>
            ))
          )}
        </div>
      ),
    }
  })

  return (
    <div
      className="flex-1 overflow-auto bg-gray-100 min-h-0"
      // Size query container: lets sticky SidebarContent use container query units
      // (`Ncqh`) so a percent height means "percent of the visible scroll area", not of
      // the full column. This element gets its size from flex in both axes, so the size
      // containment implied by container-type: size is safe here.
      style={{ containerType: 'size' }}
      onDragOver={(e) => onDragOver(e)}
      onDrop={handleDrop}
    >
      <Container>
        <div ref={containerRef} className="space-y-0">
          {/* Toolbar - hidden when hideToolbar (e.g., Sidebar example) */}
          {!hideToolbar && <Toolbar variant="primary" />}
          {/* FillerTabBar - hide when hideTabBar (e.g., Card example) */}
          {!hideTabBar && <FillerTabBar />}
          
          {/* FakeURLBar components - rendered above tabs */}
          {!hideTabBar && fakeURLBarComponents.map((component) => {
            const urlBarSticky = component.props.urlBarSticky === true
            return (
              <React.Fragment key={component.id}>
                {renderComponent({
                  component,
                  onSelect: onSelectComponent,
                  isSelected: selectedComponentId === component.id,
                  renderChildren,
                  onDragOver: handleContainerDragOver,
                  onDrop: handleContainerDrop,
                  isSticky: urlBarSticky,
                  stickyTop: stickyPositions.urlBar,
                })}
              </React.Fragment>
            )
          })}
          
          {/* WebsiteHeaderBar components - rendered above tabs */}
          {!hideTabBar && websiteHeaderBarComponents.map((component) => {
            const headerBarSticky = component.props.headerBarSticky === true
            return (
              <React.Fragment key={component.id}>
                {renderComponent({
                  component,
                  onSelect: onSelectComponent,
                  isSelected: selectedComponentId === component.id,
                  renderChildren,
                  onDragOver: handleContainerDragOver,
                  onDrop: handleContainerDrop,
                  isSticky: headerBarSticky,
                  stickyTop: stickyPositions.headerBar,
                })}
              </React.Fragment>
            )
          })}
          
          <div className="space-y-4">
            {/* Tabs - show tabs unless hideTabBar */}
            {!hideTabBar && (
            <div className="mb-6">
              <TabComponent
                tabs={tabData}
                activeTabId={activeTabId}
                onTabChange={onTabChange}
                style={tabStyle}
                isSticky={tabSticky}
                stickyTop={stickyPositions.tabComponent}
                iconUrl={tabIconUrl}
                iconAlt={tabIconAlt}
              />
            </div>
            )}
            {hideTabBar && (
              <div className="">
                {tabData.find((t) => t.id === activeTabId)?.content}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
