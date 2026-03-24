import { cn } from '@/lib/utils'

export function FillerTabBar() {
  const tabs = [
    { label: 'Website', isActive: true },
    { label: 'Library of Congress', isActive: false },
    { label: 'Speech', isActive: false },
    { label: 'Authors Notes', isActive: false },
  ]

  return (
    <div className="relative h-[64px] w-full sticky top-[60px] z-20" style={{ paddingTop: '8px', paddingLeft: '8px', paddingRight: '8px', backgroundColor: 'rgb(228, 228, 228)' }}>
      <div className="flex items-end" style={{ height: '100%' }}>
        {tabs.map((tab, index) => {
        const isLast = index === tabs.length - 1
        const shouldRemoveRightBorder = !tab.isActive && !isLast

        return (
          <div
            key={tab.label}
            className={cn(
              'text-base flex items-center rounded-t-lg relative z-10',
              tab.isActive ? 'bg-white' : 'bg-[rgb(245,245,245)]'
            )}
            style={{
              marginTop: tab.isActive ? '0' : '8px',
              height: tab.isActive ? '100%' : undefined,
              paddingTop: '8px',
              paddingBottom: '8px',
              paddingLeft: '16px',
              paddingRight: '16px',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              borderTop: '1px solid rgb(175, 175, 175)',
              borderLeft: '1px solid rgb(175, 175, 175)',
              borderRight: shouldRemoveRightBorder ? 'none' : '1px solid rgb(175, 175, 175)',
              borderBottom: tab.isActive ? 'none' : '1px solid rgb(175, 175, 175)',
              color: '#000000',
              lineHeight: 'normal',
            }}
          >
            {tab.label}
          </div>
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
  )
}
