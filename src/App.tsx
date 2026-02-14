import { useState } from 'react'
import { useWebsiteBuilder } from './hooks/useWebsiteBuilder'
import { useDragAndDrop } from './hooks/useDragAndDrop'
import { BuilderSidebar } from './components/builder/BuilderSidebar'
import { BuilderCanvas } from './components/builder/BuilderCanvas'
import { LayerManager } from './components/builder/LayerManager'
import { ComponentType, ComponentProps } from './types/website'

function App() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const {
    websiteData,
    selectedComponentId,
    setSelectedComponentId,
    showTabSettings,
    setShowTabSettings,
    isTemplateMode,
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
    moveComponentToPosition,
    findComponent,
    applySidebarContentSticky,
    loadTemplate,
    resetToCustom,
  } = useWebsiteBuilder()

  const activeTab = websiteData.tabs.find((tab) => tab.id === websiteData.activeTabId)
  const selectedComponent = selectedComponentId ? findComponent(selectedComponentId) : null
  
  if (!activeTab) {
    return <div>No active tab</div>
  }

  const dragDrop = useDragAndDrop(
    (type: ComponentType, parentId?: string, index?: number, isCrossTab?: boolean) => {
      addComponent(type, {}, parentId, index, isCrossTab)
    }
  )

  const handleAddComponent = (type: ComponentType, isCrossTab?: boolean) => {
    addComponent(type, {}, undefined, undefined, isCrossTab)
  }

  const handleUpdateComponent = (props: Partial<ComponentProps>) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, props)
    }
  }

  const handleDeleteComponent = () => {
    if (selectedComponentId) {
      removeComponent(selectedComponentId)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <BuilderSidebar
          onAddComponent={handleAddComponent}
          onLoadTemplate={loadTemplate}
          onResetToCustom={resetToCustom}
          isTemplateMode={isTemplateMode}
          tabs={websiteData.tabs}
          activeTabId={websiteData.activeTabId}
          onTabChange={setActiveTab}
          onAddTab={addTab}
          onRemoveTab={removeTab}
          onOpenTabSettings={() => {
            setShowTabSettings(true)
            setSelectedComponentId(null) // Clear component selection when opening tab settings
          }}
          isCollapsed={isLeftPanelCollapsed}
          onToggleCollapse={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
        />
        <BuilderCanvas
          components={activeTab?.content || []}
          selectedComponentId={selectedComponentId}
          onSelectComponent={(id) => {
            setSelectedComponentId(id)
            setShowTabSettings(false) // Close tab settings when selecting component
          }}
          onDrop={(type, parentId, index, isCrossTab) => {
            addComponent(type, {}, parentId, index, isCrossTab)
          }}
          onDragOver={dragDrop.handleDragOver}
          tabs={websiteData.tabs}
          activeTabId={websiteData.activeTabId}
          onTabChange={setActiveTab}
          crossTabComponents={websiteData.crossTabComponents}
          tabStyle={websiteData.tabStyle || 'line'}
          tabSticky={websiteData.tabSticky || false}
          tabIconUrl={websiteData.tabIconUrl}
          tabIconAlt={websiteData.tabIconAlt}
          hideTabBar={websiteData.hideTabBar}
          hideToolbar={websiteData.hideToolbar}
        />
        <LayerManager
          components={activeTab?.content || []}
          selectedComponentId={selectedComponentId}
          onSelectComponent={(id) => {
            setSelectedComponentId(id)
            setShowTabSettings(false) // Close tab settings when selecting component
          }}
          onMoveComponent={moveComponentToPosition}
          onAddComponent={(type, parentId, index) => {
            addComponent(type, {}, parentId, index, false)
          }}
          selectedComponentType={selectedComponent ? selectedComponent.type : null}
          selectedComponentProps={selectedComponent ? selectedComponent.props : {}}
          onUpdateComponent={handleUpdateComponent}
          onSidebarContentStickyChange={applySidebarContentSticky}
          onDeleteComponent={selectedComponentId ? handleDeleteComponent : undefined}
          showTabSettings={showTabSettings}
          allTabs={websiteData.tabs.map(tab => ({
            id: tab.id,
            label: tab.label,
            enabled: tab.enabled,
            position: tab.position,
          }))}
          onUpdateTab={(tabId, updates) => updateTab(tabId, updates)}
          tabStyle={websiteData.tabStyle || 'line'}
          onUpdateTabStyle={updateTabStyle}
          tabSticky={websiteData.tabSticky || false}
          onUpdateTabSticky={updateTabSticky}
          tabIconUrl={websiteData.tabIconUrl}
          tabIconAlt={websiteData.tabIconAlt}
          onUpdateTabIcon={updateTabIcon}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        />
      </div>
    </div>
  )
}

export default App
