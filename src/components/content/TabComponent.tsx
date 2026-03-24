import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TabStyle } from '@/types/website'
import { IconImage } from './IconImage'

interface Tab {
  id: string
  label: string
  content: ReactNode
  enabled?: boolean
}

interface TabComponentProps {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  className?: string
  style?: TabStyle
  isSticky?: boolean
  stickyTop?: string
  iconUrl?: string
  iconAlt?: string
}

export function TabComponent({ tabs, activeTabId, onTabChange, className, style = 'line', isSticky = false, stickyTop, iconUrl, iconAlt }: TabComponentProps) {
  const isClassic = style === 'classic'
  
  const stickyClasses = isSticky ? `sticky z-[13]` : ''
  const stickyStyle = isSticky && stickyTop ? { top: stickyTop } : {}
  const stickyWrapperStyle = isSticky ? { backgroundColor: 'white', ...stickyStyle } : {}

  if (isClassic) {
    return (
      <div className={cn('w-full', className)}>
        <div className={cn('relative', stickyClasses)} style={{ height: '64px', paddingTop: '8px', paddingLeft: '8px', paddingRight: '8px', ...stickyWrapperStyle }}>
          <div className="flex items-end" style={{ height: '100%' }}>
            {iconUrl && (
              <div className="flex items-center" style={{ height: '100%', paddingBottom: '8px', paddingRight: '16px' }}>
                <IconImage iconUrl={iconUrl} iconAlt={iconAlt || 'Tab icon'} />
              </div>
            )}
            {tabs.map((tab, index) => {
              const isEnabled = tab.enabled !== false
              const isActive = activeTabId === tab.id
              const isLast = index === tabs.length - 1
              // Remove right border from inactive tabs (except last tab)
              // Active tab always keeps both borders
              const shouldRemoveRightBorder = !isActive && !isLast
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isEnabled) {
                      onTabChange(tab.id)
                    }
                  }}
                  disabled={!isEnabled}
                  className={cn(
                    'text-base transition-colors flex items-center relative z-10',
                    'rounded-t-lg',
                    !isEnabled && 'cursor-not-allowed',
                    isActive && isEnabled && 'cursor-default',
                    isActive && isEnabled
                      ? 'bg-white'
                      : 'bg-[rgb(245,245,245)]'
                  )}
                  style={{
                    marginTop: isActive && isEnabled ? '0' : '8px',
                    height: isActive && isEnabled ? '100%' : undefined,
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px',
                    borderTop: '1px solid rgb(175, 175, 175)',
                    borderLeft: '1px solid rgb(175, 175, 175)',
                    borderRight: shouldRemoveRightBorder ? 'none' : '1px solid rgb(175, 175, 175)',
                    borderBottom: isActive && isEnabled ? 'none' : '1px solid rgb(175, 175, 175)',
                    color: isEnabled 
                      ? '#000000'
                      : 'rgb(144, 144, 144)',
                    lineHeight: 'normal',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
          {/* Bottom border line that runs along the container */}
          <div 
            className="absolute bottom-0 left-0 right-0" 
            style={{ 
              height: '1px', 
              backgroundColor: 'rgb(175, 175, 175)',
              zIndex: 0,
            }}
          />
        </div>
        <div>
          {tabs.find((tab) => tab.id === activeTabId)?.content}
        </div>
      </div>
    )
  }

  // Line style (default)
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('relative z-10 flex border-b border-[#afafaf] shadow-[0_2px_0_0_white]', stickyClasses)} style={{ minHeight: '55px', ...stickyWrapperStyle }}>
        {iconUrl && (
          <div className="flex items-center self-stretch" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}>
            <IconImage iconUrl={iconUrl} iconAlt={iconAlt || 'Tab icon'} />
          </div>
        )}
        {tabs.map((tab, index) => {
          const isEnabled = tab.enabled !== false // Default to true if not set
          const isActive = activeTabId === tab.id
          const isLast = index === tabs.length - 1
          
          return (
            <>
              <button
                key={tab.id}
                onClick={() => {
                  if (isEnabled) {
                    onTabChange(tab.id)
                  }
                }}
                disabled={!isEnabled}
                className={cn(
                  'text-base transition-colors flex items-center',
                  'border-b-2',
                  !isEnabled && 'cursor-not-allowed',
                  isActive && isEnabled && 'cursor-default',
                  isEnabled && 'font-bold',
                  isActive && isEnabled && 'border-b-[5px]'
                )}
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  ...(isEnabled ? {
                    color: '#1159A7',
                    borderBottomColor: isActive ? '#1159A7' : 'transparent',
                    lineHeight: 'normal',
                  } : {
                    color: '#696969',
                    borderBottomColor: 'transparent',
                    lineHeight: 'normal',
                  }),
                }}
                onMouseEnter={(e) => {
                  if (isEnabled && !isActive) {
                    e.currentTarget.style.borderBottomColor = '#1159A7'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isEnabled && !isActive) {
                    e.currentTarget.style.borderBottomColor = 'transparent'
                  }
                }}
              >
                {tab.label}
              </button>
              {!isLast && (
                <div
                  className="self-stretch flex items-center"
                  style={{
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '1px',
                      height: '100%',
                      backgroundColor: '#C7C7C7',
                    }}
                  />
                </div>
              )}
            </>
          )
        })}
      </div>
      <div>
        {tabs.find((tab) => tab.id === activeTabId)?.content}
      </div>
    </div>
  )
}
