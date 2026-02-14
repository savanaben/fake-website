import { useState, useCallback } from 'react'
import { WebsiteData, WebsiteComponent, ComponentType, ComponentProps, TabData, TabStyle } from '@/types/website'
import sampleConfigsData from '@/config/sampleConfigs.json'

function generateId(): string {
  return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface SampleConfig {
  name: string
  data: WebsiteData
}

interface SampleConfigsData {
  configs: SampleConfig[]
}

// Get the "Full Features Usage" config as the default
const sampleConfigs: SampleConfig[] = (sampleConfigsData as SampleConfigsData).configs
const fullFeaturesConfig = sampleConfigs.find(config => config.name === 'Full Features Usage')

// Normalize tabs for initial data
const getInitialWebsiteData = (): WebsiteData => {
  if (fullFeaturesConfig) {
    const template = fullFeaturesConfig.data
    const normalizedTabs = template.tabs.map((tab, index) => ({
      ...tab,
      position: tab.position || index + 1,
    })).sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((tab, index) => ({
        ...tab,
        position: index + 1,
      }))
    
    return {
      ...template,
      tabs: normalizedTabs,
      crossTabComponents: template.crossTabComponents || [],
    }
  }
  
  // Fallback to default if config not found
  return {
    tabs: [
      {
        id: 'tab-introduction',
        label: 'Introduction',
        content: [],
        enabled: true,
        position: 1,
      },
      {
        id: 'tab-about',
        label: 'About',
        content: [],
        enabled: true,
        position: 2,
      },
      {
        id: 'tab-history',
        label: 'History',
        content: [],
        enabled: false,
        position: 3,
      },
    ],
    activeTabId: 'tab-introduction',
    crossTabComponents: [
      {
        id: 'fake-url-bar-1',
        type: 'fakeURLBar',
        props: {
          urlText: 'https://example.com',
          visible: true,
          enabled: true,
        },
      },
    ],
  }
}

const initialWebsiteData: WebsiteData = getInitialWebsiteData()

export function useWebsiteBuilder() {
  const [websiteData, setWebsiteData] = useState<WebsiteData>(initialWebsiteData)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [showTabSettings, setShowTabSettings] = useState(false)
  const [isTemplateMode, setIsTemplateMode] = useState(true) // Start in template mode since we're loading a sample config

  const setActiveTab = useCallback((tabId: string) => {
    setWebsiteData((prev) => {
      // Check if the tab is enabled before switching
      const tab = prev.tabs.find((t) => t.id === tabId)
      if (tab && tab.enabled === false) {
        // Don't switch to disabled tabs
        return prev
      }
      
      return {
        ...prev,
        activeTabId: tabId,
      }
    })
    setSelectedComponentId(null)
  }, [])

  const updateTab = useCallback((tabId: string, updates: Partial<Pick<TabData, 'label' | 'name' | 'enabled' | 'position'>>) => {
    setWebsiteData((prev) => {
      let updatedTabs = prev.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
      
      // If position is being updated, we need to handle reordering
      if (updates.position !== undefined) {
        const targetPosition = updates.position
        const tabBeingMoved = updatedTabs.find(tab => tab.id === tabId)
        if (!tabBeingMoved) return prev
        
        // Clamp position to valid range (1 to number of tabs)
        const clampedPosition = Math.max(1, Math.min(targetPosition, updatedTabs.length))
        const oldPosition = tabBeingMoved.position || 1
        
        // If position actually changed, swap with the tab at the target position
        if (clampedPosition !== oldPosition) {
          updatedTabs = updatedTabs.map(tab => {
            if (tab.id === tabId) {
              return { ...tab, position: clampedPosition }
            } else if ((tab.position || 0) === clampedPosition) {
              // Swap: move the tab that was at target position to old position
              return { ...tab, position: oldPosition }
            }
            return tab
          })
        }
      }
      
      // If the active tab is being disabled, switch to the first enabled tab
      let newActiveTabId = prev.activeTabId
      if (updates.enabled === false && prev.activeTabId === tabId) {
        const firstEnabledTab = updatedTabs.find((tab) => tab.enabled !== false)
        if (firstEnabledTab) {
          newActiveTabId = firstEnabledTab.id
        }
      }
      
      // Sort tabs by position before returning
      const sortedTabs = [...updatedTabs].sort((a, b) => (a.position || 0) - (b.position || 0))
      
      return {
        ...prev,
        tabs: sortedTabs,
        activeTabId: newActiveTabId,
      }
    })
  }, [])

  const addTab = useCallback((label: string) => {
    setWebsiteData((prev) => {
      // Calculate the next position (rightmost position + 1)
      const maxPosition = prev.tabs.length > 0 
        ? Math.max(...prev.tabs.map(tab => tab.position || 0))
        : 0
      const newPosition = maxPosition + 1
      
      const newTab = {
        id: `tab-${Date.now()}`,
        label,
        content: [],
        enabled: true, // Default to enabled
        position: newPosition,
      }
      
      return {
        ...prev,
        tabs: [...prev.tabs, newTab],
        activeTabId: newTab.id,
      }
    })
  }, [])

  const removeTab = useCallback((tabId: string) => {
    setWebsiteData((prev) => {
      const newTabs = prev.tabs.filter((tab) => tab.id !== tabId)
      if (newTabs.length === 0) {
        return prev
      }
      
      // Reassign positions after removal (normalize to 1, 2, 3, etc.)
      const sortedTabs = [...newTabs].sort((a, b) => (a.position || 0) - (b.position || 0))
      const normalizedTabs = sortedTabs.map((tab, index) => ({
        ...tab,
        position: index + 1,
      }))
      
      return {
        ...prev,
        tabs: normalizedTabs,
        activeTabId: prev.activeTabId === tabId ? normalizedTabs[0].id : prev.activeTabId,
      }
    })
  }, [])

  const getDefaultProps = (type: ComponentType): ComponentProps => {
    const baseProps = { enabled: true } // All components are enabled by default
    
    switch (type) {
      case 'title':
        return { ...baseProps, title: 'Website Title', logoUrl: '', logoAlt: '', headingLevel: 'h1' }
      case 'paragraph':
        return { ...baseProps, content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.' }
      case 'h1':
        return { ...baseProps, text: 'Heading 1' }
      case 'h2':
        return { ...baseProps, text: 'Heading 2' }
      case 'h3':
        return { ...baseProps, text: 'Heading 3' }
      case 'h4':
        return { ...baseProps, text: 'Heading 4' }
      case 'h5':
        return { ...baseProps, text: 'Heading 5' }
      case 'h6':
        return { ...baseProps, text: 'Heading 6' }
      case 'image':
        return { ...baseProps, src: 'https://placehold.co/400x300', alt: 'Placeholder image' }
      case 'bannerImage':
        return { ...baseProps, src: 'https://placehold.co/1200x300', alt: 'Banner image' }
      case 'websiteHeaderBar':
        return { 
          ...baseProps, 
          headerTitle: 'Header Title', 
          headerBackgroundColor: '#f0f0f0',
          headerIconUrl: '/assets/images/history.png',
          headerIconAlt: 'History icon'
        }
      case 'fakeURLBar':
        return { ...baseProps, urlText: 'https://example.com', visible: true }
      case 'card':
        return {
          ...baseProps,
          cardType: 'overBackground',
          cardRounding: 'large',
          cardShadow: 'high',
          cardBackgroundColor: '#ffffff',
          cardBorderColor: '#909090',
          cardBorder: 'thin',
          cardWidth: 'default',
          cardPadding: 'space-24',
        }
      case 'flexContainer':
        return { ...baseProps, gap: 'gap-4', flexDirection: 'row', flexContainerMaxWidth: 'default', columnDistribution: '1:1' }
      case 'column':
        return { ...baseProps }
      case 'sidebarPage':
        return { ...baseProps }
      case 'sidebarColumn':
        return { ...baseProps, sidebarColumnWidth: '200px' }
      case 'sidebarContent':
        return { ...baseProps, sidebarContentHeight: 'grow', sidebarContentVerticalAlign: 'start', sidebarContentImageRepeat: 'no-repeat', sidebarContentImageSize: 'cover' }
      default:
        return { ...baseProps }
    }
  }

  const addComponent = useCallback((
    type: ComponentType,
    props: ComponentProps = {},
    parentId?: string,
    index?: number,
    isCrossTab?: boolean
  ) => {
    const defaultProps = getDefaultProps(type)
    const newComponent: WebsiteComponent = {
      id: generateId(),
      type,
      props: { ...defaultProps, ...props },
      children: ['flexContainer', 'column', 'card', 'sidebarPage', 'sidebarColumn'].includes(type) ? [] : undefined,
    }

    setWebsiteData((prev) => {
      // Handle cross-tab components (like fakeURLBar and websiteHeaderBar when isCrossTab is true)
      if (type === 'fakeURLBar' || (type === 'websiteHeaderBar' && isCrossTab)) {
        // Check if component already exists, if so replace it
        const existingIndex = prev.crossTabComponents?.findIndex(comp => comp.type === type) ?? -1
        if (existingIndex >= 0 && prev.crossTabComponents) {
          const updated = [...prev.crossTabComponents]
          updated[existingIndex] = newComponent
          return {
            ...prev,
            crossTabComponents: updated,
          }
        }
        return {
          ...prev,
          crossTabComponents: [...(prev.crossTabComponents || []), newComponent],
        }
      }

      // Regular components go to active tab
      const activeTab = prev.tabs.find((tab) => tab.id === prev.activeTabId)
      if (!activeTab) return prev

      const addToTree = (components: WebsiteComponent[]): WebsiteComponent[] => {
        if (!parentId) {
          // Add to root level
          if (index !== undefined) {
            const newComponents = [...components]
            newComponents.splice(index, 0, newComponent)
            return newComponents
          }
          return [...components, newComponent]
        }

        // Find parent and add to it
        return components.map((comp) => {
          if (comp.id === parentId) {
            if (comp.children) {
              const newChildren = [...comp.children]
              if (index !== undefined) {
                newChildren.splice(index, 0, newComponent)
              } else {
                newChildren.push(newComponent)
              }
              return { ...comp, children: newChildren }
            }
          }
          if (comp.children) {
            return { ...comp, children: addToTree(comp.children) }
          }
          return comp
        })
      }

      const newContent = addToTree(activeTab.content)

      return {
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === prev.activeTabId ? { ...tab, content: newContent } : tab
        ),
      }
    })
  }, [])

  const removeComponent = useCallback((componentId: string) => {
    setWebsiteData((prev) => {
      // Check if it's a cross-tab component
      if (prev.crossTabComponents) {
        const foundInCrossTab = prev.crossTabComponents.find(comp => comp.id === componentId)
        if (foundInCrossTab) {
          return {
            ...prev,
            crossTabComponents: prev.crossTabComponents.filter(comp => comp.id !== componentId),
          }
        }
      }

      // Regular component in tab content
      const activeTab = prev.tabs.find((tab) => tab.id === prev.activeTabId)
      if (!activeTab) return prev

      const removeFromTree = (components: WebsiteComponent[]): WebsiteComponent[] => {
        return components
          .filter((comp) => comp.id !== componentId)
          .map((comp) => {
            if (comp.children) {
              return { ...comp, children: removeFromTree(comp.children) }
            }
            return comp
          })
      }

      const newContent = removeFromTree(activeTab.content)

      return {
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === prev.activeTabId ? { ...tab, content: newContent } : tab
        ),
      }
    })
    setSelectedComponentId(null)
  }, [])

  const updateComponent = useCallback((componentId: string, props: Partial<ComponentProps>) => {
    setWebsiteData((prev) => {
      // Check if it's a cross-tab component
      if (prev.crossTabComponents) {
        const foundIndex = prev.crossTabComponents.findIndex(comp => comp.id === componentId)
        if (foundIndex >= 0) {
          const updated = [...prev.crossTabComponents]
          updated[foundIndex] = { ...updated[foundIndex], props: { ...updated[foundIndex].props, ...props } }
          return {
            ...prev,
            crossTabComponents: updated,
          }
        }
      }

      // Regular component in tab content
      const activeTab = prev.tabs.find((tab) => tab.id === prev.activeTabId)
      if (!activeTab) return prev

      const updateInTree = (components: WebsiteComponent[]): WebsiteComponent[] => {
        return components.map((comp) => {
          if (comp.id === componentId) {
            return { ...comp, props: { ...comp.props, ...props } }
          }
          if (comp.children) {
            return { ...comp, children: updateInTree(comp.children) }
          }
          return comp
        })
      }

      const newContent = updateInTree(activeTab.content)

      return {
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === prev.activeTabId ? { ...tab, content: newContent } : tab
        ),
      }
    })
  }, [])

  const moveComponentToPosition = useCallback((
    componentId: string,
    targetParentId: string | null,
    targetIndex: number
  ) => {
    setWebsiteData((prev) => {
      const activeTab = prev.tabs.find((tab) => tab.id === prev.activeTabId)
      if (!activeTab) return prev

      // Find current position
      let currentIndex = -1
      let currentParentChildren: WebsiteComponent[] | null = null

      const findCurrentPosition = (components: WebsiteComponent[], _parentId: string | null = null): boolean => {
        for (let i = 0; i < components.length; i++) {
          if (components[i].id === componentId) {
            currentIndex = i
            currentParentChildren = components
            return true
          }
          if (components[i].children) {
            if (findCurrentPosition(components[i].children!, components[i].id)) {
              return true
            }
          }
        }
        return false
      }

      findCurrentPosition(activeTab.content)
      if (currentIndex === -1) return prev

      // Get the component to move
      const componentToMove = currentParentChildren![currentIndex]

      // Remove from current position
      const removeFromTree = (components: WebsiteComponent[]): WebsiteComponent[] => {
        return components
          .filter((comp) => comp.id !== componentId)
          .map((comp) => {
            if (comp.children) {
              return { ...comp, children: removeFromTree(comp.children) }
            }
            return comp
          })
      }

      let newContent = removeFromTree(activeTab.content)

      // When moving within same parent, the array we insert into already has the component removed,
      // so we use targetIndex as-is (e.g. siblings.length - 1 for "last" inserts at the end).
      const adjustedTargetIndex = targetIndex

      // Insert at target position
      const insertAtPosition = (components: WebsiteComponent[]): WebsiteComponent[] => {
        if (targetParentId === null) {
          // Insert at root level
          const newArray = [...components]
          newArray.splice(adjustedTargetIndex, 0, componentToMove)
          return newArray
        }

        // Find the target parent and insert
        return components.map((comp) => {
          if (comp.id === targetParentId) {
            if (comp.children) {
              const newChildren = [...comp.children]
              newChildren.splice(adjustedTargetIndex, 0, componentToMove)
              return { ...comp, children: newChildren }
            }
            return { ...comp, children: [componentToMove] }
          }
          if (comp.children) {
            return { ...comp, children: insertAtPosition(comp.children) }
          }
          return comp
        })
      }

      const finalContent = insertAtPosition(newContent)

      return {
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === prev.activeTabId ? { ...tab, content: finalContent } : tab
        ),
      }
    })
  }, [])

  const moveComponent = useCallback((componentId: string, direction: 'up' | 'down', parentId?: string) => {
    setWebsiteData((prev) => {
      const activeTab = prev.tabs.find((tab) => tab.id === prev.activeTabId)
      if (!activeTab) return prev

      const moveInTree = (components: WebsiteComponent[]): WebsiteComponent[] => {
        const targetArray = parentId
          ? (() => {
              const findParent = (comps: WebsiteComponent[]): WebsiteComponent | null => {
                for (const comp of comps) {
                  if (comp.id === parentId) return comp
                  if (comp.children) {
                    const found = findParent(comp.children)
                    if (found) return found
                  }
                }
                return null
              }
              return findParent(components)?.children || []
            })()
          : activeTab.content

        const index = targetArray.findIndex((comp) => comp.id === componentId)
        if (index === -1) {
          // Component not in this array, search children
          return components.map((comp) => {
            if (comp.children) {
              return { ...comp, children: moveInTree(comp.children) }
            }
            return comp
          })
        }

        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= targetArray.length) {
          return components
        }

        const newArray = [...targetArray]
        ;[newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]]

        if (parentId) {
          return components.map((comp) => {
            if (comp.id === parentId && comp.children) {
              return { ...comp, children: newArray }
            }
            if (comp.children) {
              return { ...comp, children: moveInTree(comp.children) }
            }
            return comp
          })
        }

        return newArray
      }

      const newContent = moveInTree(activeTab.content)

      return {
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === prev.activeTabId ? { ...tab, content: newContent } : tab
        ),
      }
    })
  }, [])

  const findComponent = useCallback((componentId: string): WebsiteComponent | null => {
    // First check cross-tab components
    if (websiteData.crossTabComponents) {
      const found = websiteData.crossTabComponents.find(comp => comp.id === componentId)
      if (found) return found
    }

    // Then check tab content
    const activeTab = websiteData.tabs.find((tab) => tab.id === websiteData.activeTabId)
    if (!activeTab) return null

    const findInTree = (components: WebsiteComponent[]): WebsiteComponent | null => {
      for (const comp of components) {
        if (comp.id === componentId) return comp
        if (comp.children) {
          const found = findInTree(comp.children)
          if (found) return found
        }
      }
      return null
    }

    return findInTree(activeTab.content)
  }, [websiteData])

  /** Find a component's parent id, siblings array, and index within parent (for active tab content only). */
  const findParentAndSiblings = useCallback((componentId: string): { parentId: string | null; siblings: WebsiteComponent[]; indexInParent: number } | null => {
    const activeTab = websiteData.tabs.find((tab) => tab.id === websiteData.activeTabId)
    if (!activeTab) return null

    type Result = { parentId: string | null; siblings: WebsiteComponent[]; indexInParent: number } | null
    const search = (components: WebsiteComponent[], parentId: string | null): Result => {
      for (let i = 0; i < components.length; i++) {
        if (components[i].id === componentId) {
          return { parentId, siblings: components, indexInParent: i }
        }
        if (components[i].children) {
          const result = search(components[i].children!, components[i].id)
          if (result) return result
        }
      }
      return null
    }
    return search(activeTab.content, null)
  }, [websiteData])

  const applySidebarContentSticky = useCallback((componentId: string, sticky: boolean, edge?: 'top' | 'bottom') => {
    if (!sticky) {
      updateComponent(componentId, { sidebarContentSticky: false })
      return
    }
    if (edge !== 'top' && edge !== 'bottom') return

    const result = findParentAndSiblings(componentId)
    if (!result) {
      updateComponent(componentId, { sidebarContentSticky: true, sidebarContentStickyEdge: edge })
      return
    }
    const { parentId, siblings } = result
    const parent = parentId ? findComponent(parentId) : null
    if (parent?.type !== 'sidebarColumn' || siblings.length === 0) {
      updateComponent(componentId, { sidebarContentSticky: true, sidebarContentStickyEdge: edge })
      return
    }

    for (const sibling of siblings) {
      if (sibling.type === 'sidebarContent' && sibling.id !== componentId && sibling.props.sidebarContentSticky === true && sibling.props.sidebarContentStickyEdge === edge) {
        updateComponent(sibling.id, { sidebarContentSticky: false })
      }
    }
    moveComponentToPosition(componentId, parentId!, edge === 'top' ? 0 : siblings.length - 1)
    updateComponent(componentId, { sidebarContentSticky: true, sidebarContentStickyEdge: edge })
  }, [findParentAndSiblings, findComponent, updateComponent, moveComponentToPosition])

  const loadTemplate = useCallback((template: WebsiteData) => {
    // Normalize positions for tabs (ensure all tabs have valid positions)
    const normalizedTabs = template.tabs.map((tab, index) => ({
      ...tab,
      position: tab.position || index + 1,
    })).sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((tab, index) => ({
        ...tab,
        position: index + 1, // Ensure positions are 1, 2, 3, etc.
      }))
    
    // Ensure crossTabComponents is an array (even if empty)
    const crossTabComponents = template.crossTabComponents || []
    
    setWebsiteData({
      ...template,
      tabs: normalizedTabs,
      crossTabComponents,
      // Explicitly include all tab bar settings
      tabStyle: template.tabStyle,
      tabSticky: template.tabSticky,
      tabIconUrl: template.tabIconUrl,
      tabIconAlt: template.tabIconAlt,
      hideTabBar: template.hideTabBar,
      hideToolbar: template.hideToolbar,
    })
    setIsTemplateMode(true)
  }, [])

  const resetToCustom = useCallback(() => {
    setWebsiteData(initialWebsiteData)
    setIsTemplateMode(false)
    setSelectedComponentId(null)
  }, [])

  const updateTabStyle = useCallback((style: TabStyle) => {
    setWebsiteData((prev) => ({
      ...prev,
      tabStyle: style,
    }))
  }, [])

  const updateTabSticky = useCallback((sticky: boolean) => {
    setWebsiteData((prev) => ({
      ...prev,
      tabSticky: sticky,
    }))
  }, [])

  const updateTabIcon = useCallback((iconUrl?: string, iconAlt?: string) => {
    setWebsiteData((prev) => ({
      ...prev,
      tabIconUrl: iconUrl,
      tabIconAlt: iconAlt,
    }))
  }, [])

  return {
    websiteData,
    selectedComponentId,
    setSelectedComponentId,
    showTabSettings,
    setShowTabSettings,
    isTemplateMode,
    setIsTemplateMode,
    setActiveTab,
    addTab,
    removeTab,
    updateTab,
    updateTabStyle,
    updateTabSticky,
    updateTabIcon,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    moveComponentToPosition,
    findComponent,
    applySidebarContentSticky,
    loadTemplate,
    resetToCustom,
  }
}
