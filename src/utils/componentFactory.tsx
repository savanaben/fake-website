import React, { ReactNode } from 'react'
import { WebsiteComponent } from '@/types/website'
import { cn } from '@/lib/utils'
import { TitleComponent } from '@/components/content/TitleComponent'
import { ParagraphComponent } from '@/components/content/ParagraphComponent'
import { H1, H2, H3, H4, H5, H6 } from '@/components/content/HeadingComponents'
import { ImageComponent } from '@/components/content/ImageComponent'
import { BannerImageComponent } from '@/components/content/BannerImageComponent'
import { WebsiteHeaderBar } from '@/components/content/WebsiteHeaderBar'
import { FlexContainer } from '@/components/layout/FlexContainer'
import { Column } from '@/components/layout/Column'
import { CardComponent } from '@/components/content/CardComponent'
import { FakeURLBar } from '@/components/layout/FakeURLBar'
import { SidebarPage } from '@/components/layout/SidebarPage'
import { SidebarColumn } from '@/components/layout/SidebarColumn'
import { SidebarContent } from '@/components/layout/SidebarContent'

interface RenderComponentProps {
  component: WebsiteComponent
  onSelect?: (id: string) => void
  isSelected?: boolean
  renderChildren?: (children: WebsiteComponent[]) => ReactNode
  onDragOver?: (e: React.DragEvent, parentId?: string) => void
  onDrop?: (e: React.DragEvent, componentType: string, parentId?: string) => void
  parentDistribution?: string // Distribution from parent FlexContainer
  columnIndex?: number // Index of column in parent
  isSticky?: boolean // Whether component should be sticky
  stickyTop?: string // Top position for sticky component
}

export function renderComponent({
  component,
  onSelect,
  isSelected,
  renderChildren,
  onDragOver,
  onDrop,
  parentDistribution,
  columnIndex,
  isSticky,
  stickyTop,
}: RenderComponentProps): ReactNode {
  // Don't render disabled components
  if (component.props.enabled === false) {
    return null
  }

  // Determine if this component should be sticky
  const shouldBeSticky = isSticky !== undefined ? isSticky : 
    (component.type === 'fakeURLBar' ? (component.props.urlBarSticky || false) :
     component.type === 'websiteHeaderBar' ? (component.props.headerBarSticky || false) : false)
  
  const stickyClasses = shouldBeSticky 
    ? (component.type === 'fakeURLBar' ? 'sticky z-[15]' : 
       component.type === 'websiteHeaderBar' ? 'sticky z-[14]' : '')
    : ''
  const stickyStyle = shouldBeSticky && stickyTop ? { top: stickyTop } : {}
  
  // Ensure background color for sticky components
  const stickyBgStyle = shouldBeSticky && component.type === 'fakeURLBar' 
    ? { backgroundColor: 'white' }
    : shouldBeSticky && component.type === 'websiteHeaderBar'
    ? { backgroundColor: component.props.headerBackgroundColor || 'white' }
    : {}

  const commonProps = {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect?.(component.id)
    },
    className: cn(
      isSelected ? '' : '',
      stickyClasses
    ),
    style: {
      ...(isSelected ? { 
        outline: '2px solid #2478CC',
        outlineOffset: '2px',
      } : {}),
      ...stickyStyle,
      ...stickyBgStyle,
    },
  }

  switch (component.type) {
    case 'title':
      return (
        <div {...commonProps}>
          <TitleComponent
            title={component.props.title || ''}
            logoUrl={component.props.logoUrl}
            logoAlt={component.props.logoAlt}
            headingLevel={component.props.headingLevel || 'h1'}
            titleColor={component.props.titleColor}
            fontFamily={component.props.titleFontFamily}
          />
        </div>
      )

    case 'paragraph':
      return (
        <div {...commonProps}>
          <ParagraphComponent content={component.props.content || ''} />
        </div>
      )

    case 'h1':
      return (
        <div {...commonProps}>
          <H1>{component.props.text || ''}</H1>
        </div>
      )

    case 'h2':
      return (
        <div {...commonProps}>
          <H2>{component.props.text || ''}</H2>
        </div>
      )

    case 'h3':
      return (
        <div {...commonProps}>
          <H3>{component.props.text || ''}</H3>
        </div>
      )

    case 'h4':
      return (
        <div {...commonProps}>
          <H4>{component.props.text || ''}</H4>
        </div>
      )

    case 'h5':
      return (
        <div {...commonProps}>
          <H5>{component.props.text || ''}</H5>
        </div>
      )

    case 'h6':
      return (
        <div {...commonProps}>
          <H6>{component.props.text || ''}</H6>
        </div>
      )

    case 'image':
      return (
        <div {...commonProps}>
          <ImageComponent
            src={component.props.src || ''}
            alt={component.props.alt || ''}
            width={component.props.imageWidth}
            height={component.props.height}
          />
        </div>
      )

    case 'bannerImage':
      return (
        <div {...commonProps} className={cn(commonProps.className, 'w-full self-stretch')} style={{ ...commonProps.style, width: '100%' }}>
          <BannerImageComponent
            src={component.props.src || ''}
            alt={component.props.alt || ''}
            height={component.props.height}
          />
        </div>
      )

    case 'flexContainer':
      const handleFlexDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        onDragOver?.(e, component.id)
      }
      
      const handleFlexDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const componentType = e.dataTransfer.getData('componentType')
        if (componentType && onDrop) {
          onDrop(e, componentType, component.id)
        }
      }
      
      // Get distribution for columns
      const distribution = component.props.columnDistribution
      const flexRatio = component.props.flexContainerFlex
      const wrapperFlexStyle =
        flexRatio != null && flexRatio > 0
          ? { flex: `${flexRatio} 1 0%`, minWidth: 0 }
          : {}

      return (
        <div 
          {...commonProps}
          style={{ ...commonProps.style, ...wrapperFlexStyle }}
          key={`flex-${component.id}-${distribution || 'default'}`}
        >
          <FlexContainer 
            gap={component.props.gap}
            direction={component.props.flexDirection || 'row'}
            maxWidthMode={component.props.flexContainerMaxWidth || 'default'}
            columnDistribution={distribution}
            isEmpty={!component.children || component.children.length === 0}
            onDragOver={handleFlexDragOver}
            onDrop={handleFlexDrop}
          >
            {component.children && renderChildren
              ? (() => {
                  let columnIndexCounter = 0
                  
                  return component.children!.map((child) => {
                    // Only pass distribution to Column components
                    const isColumn = child.type === 'column'
                    let columnIndex: number | undefined = undefined
                    
                    if (isColumn) {
                      columnIndex = columnIndexCounter
                      columnIndexCounter++
                    }
                    
                    // Include distribution in key to force re-render when it changes
                    const childKey = isColumn && distribution 
                      ? `${child.id}-dist-${distribution}-idx-${columnIndex}`
                      : child.id
                    
                    return (
                      <React.Fragment key={childKey}>
                        {renderComponent({
                          component: child,
                          onSelect,
                          isSelected: isSelected,
                          renderChildren,
                          onDragOver,
                          onDrop,
                          parentDistribution: isColumn && distribution ? distribution : undefined,
                          columnIndex: columnIndex,
                        })}
                      </React.Fragment>
                    )
                  })
                })()
              : null}
          </FlexContainer>
        </div>
      )

    case 'column':
      const handleColumnDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        onDragOver?.(e, component.id)
      }
      
      const handleColumnDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const componentType = e.dataTransfer.getData('componentType')
        if (componentType && onDrop) {
          onDrop(e, componentType, component.id)
        }
      }
      
      // Determine width: use parent distribution if available, otherwise use columnWidth prop, otherwise default
      let columnWidth: string | undefined
      if (parentDistribution && columnIndex !== undefined && columnIndex >= 0) {
        const distributionValues = parentDistribution.split(':').map(d => d.trim()).filter(d => d && !isNaN(Number(d)))
        if (distributionValues.length > 0 && columnIndex < distributionValues.length) {
          const flexValue = distributionValues[columnIndex]
          if (flexValue) {
            columnWidth = `flex-[${flexValue}]`
          }
        }
      }
      if (!columnWidth) {
        columnWidth = component.props.columnWidth
      }
      
      
      // For Column, we need to pass the selection/click props directly to avoid wrapper div
      return (
        <Column 
          width={columnWidth}
          maxWidthMode={component.props.columnMaxWidth || 'default'}
          isEmpty={!component.children || component.children.length === 0}
          hasPadding={component.props.columnHasPadding !== false}
          onDragOver={handleColumnDragOver}
          onDrop={handleColumnDrop}
          className={cn(commonProps.className)}
          onClick={commonProps.onClick}
        >
          {component.children && renderChildren
            ? renderChildren(component.children)
            : null}
        </Column>
      )

    case 'card':
      const handleCardDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        onDragOver?.(e, component.id)
      }

      const handleCardDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const componentType = e.dataTransfer.getData('componentType')
        if (componentType && onDrop && (componentType === 'title' || componentType === 'paragraph')) {
          onDrop(e, componentType, component.id)
        }
      }

      return (
        <div {...commonProps}>
          <CardComponent
            rounding={component.props.cardRounding || 'medium'}
            shadow={component.props.cardShadow || 'none'}
            backgroundColor={component.props.cardBackgroundColor || '#ffffff'}
            borderColor={component.props.cardBorderColor}
            border={component.props.cardBorder || 'none'}
            width={component.props.cardWidth || 'default'}
            widthManual={component.props.cardWidthManual}
            padding={component.props.cardPadding || 'space-24'}
            isEmpty={!component.children || component.children.length === 0}
            onDragOver={handleCardDragOver}
            onDrop={handleCardDrop}
            onClick={commonProps.onClick}
          >
            {component.children && renderChildren
              ? renderChildren(component.children)
              : null}
          </CardComponent>
        </div>
      )

    case 'websiteHeaderBar':
      return (
        <div {...commonProps} className={cn(commonProps.className, 'w-full self-stretch')} style={{ ...commonProps.style, width: '100%' }}>
          <WebsiteHeaderBar
            title={component.props.headerTitle || ''}
            fontFamily={component.props.headerFontFamily}
            backgroundColor={component.props.headerBackgroundColor}
            titleColor={component.props.headerTitleColor}
            iconUrl={component.props.headerIconUrl}
            iconAlt={component.props.headerIconAlt}
            textAlign={component.props.headerTextAlign || 'left'}
            headingLevel={component.props.headerHeadingLevel || 'h3'}
          />
        </div>
      )

    case 'fakeURLBar':
      return (
        <div {...commonProps}>
          <FakeURLBar
            urlText={component.props.urlText}
            visible={component.props.visible !== false}
          />
        </div>
      )

    case 'sidebarPage': {
      const handleSidebarPageDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        onDragOver?.(e, component.id)
      }
      const handleSidebarPageDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const componentType = e.dataTransfer.getData('componentType')
        if (componentType && onDrop) {
          onDrop(e, componentType, component.id)
        }
      }
      return (
        <div {...commonProps}>
          <SidebarPage
            isEmpty={!component.children || component.children.length === 0}
            onDragOver={handleSidebarPageDragOver}
            onDrop={handleSidebarPageDrop}
            onClick={commonProps.onClick}
          >
            {component.children && renderChildren
              ? renderChildren(component.children)
              : null}
          </SidebarPage>
        </div>
      )
    }

    case 'sidebarColumn': {
      const handleSidebarColDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        onDragOver?.(e, component.id)
      }
      const handleSidebarColDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const componentType = e.dataTransfer.getData('componentType')
        if (componentType && onDrop) {
          onDrop(e, componentType, component.id)
        }
      }
      return (
        <SidebarColumn
          width={component.props.sidebarColumnWidth}
          bgColor={component.props.sidebarColumnBgColor}
          bgImage={component.props.sidebarColumnBgImage}
          bgImageRepeat={component.props.sidebarColumnBgImageRepeat}
          bgImageSize={component.props.sidebarColumnBgImageSize}
          bgImagePosition={component.props.sidebarColumnBgImagePosition}
          isEmpty={!component.children || component.children.length === 0}
          onDragOver={handleSidebarColDragOver}
          onDrop={handleSidebarColDrop}
          onClick={commonProps.onClick}
          className={commonProps.className}
        >
          {component.children && renderChildren
            ? renderChildren(component.children)
            : null}
        </SidebarColumn>
      )
    }

    case 'sidebarContent':
      return (
        <SidebarContent
          bgColor={component.props.sidebarContentBgColor}
          verticalAlign={component.props.sidebarContentVerticalAlign}
          image={component.props.sidebarContentImage}
          imagePosition={component.props.sidebarContentImagePosition}
          imageRepeat={component.props.sidebarContentImageRepeat}
          imageSize={component.props.sidebarContentImageSize}
          height={component.props.sidebarContentHeight}
          sticky={component.props.sidebarContentSticky}
          stickyEdge={component.props.sidebarContentStickyEdge}
          onClick={commonProps.onClick}
          className={commonProps.className}
        />
      )

    default:
      return null
  }
}
