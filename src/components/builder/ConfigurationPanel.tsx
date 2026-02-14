import React from 'react'
import { ComponentType, ComponentProps, TabStyle } from '@/types/website'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { NAEP_LIGHT_BACKGROUNDS, NAEP_BORDER_COLORS } from '@/lib/naepTokens'

const CARD_WIDTH_OPTIONS = ['max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full'] as const

const CARD_PADDING_OPTIONS = ['space-16', 'space-24', 'space-32', 'space-48'] as const

const DEFAULT_CARD_BORDER_COLOR = '#909090'

/** Transparent swatch: white bg with red diagonal slash (corner to corner) */
const TRANSPARENT_SWATCH_STYLE: React.CSSProperties = {
  backgroundColor: '#ffffff',
  backgroundImage: 'linear-gradient(135deg, transparent 42%, #dc2626 42%, #dc2626 58%, transparent 58%)',
}

const OVER_BACKGROUND_PRESET: Partial<ComponentProps> = {
  cardRounding: 'large',
  cardShadow: 'high',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: DEFAULT_CARD_BORDER_COLOR,
  cardBorder: 'thin',
  cardWidth: 'default',
  cardPadding: 'space-32',
}
const INLINE_PRESET: Partial<ComponentProps> = {
  cardRounding: 'medium',
  cardShadow: 'none',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: DEFAULT_CARD_BORDER_COLOR,
  cardBorder: 'thick',
  cardWidth: 'default',
  cardPadding: 'space-24',
}

function normalizeCardBorder(b: ComponentProps['cardBorder']): 'none' | 'thin' | 'thick' {
  return b === 'bordered' ? 'thick' : (b ?? 'none')
}

function cardPropsMatchPreset(props: ComponentProps, preset: Partial<ComponentProps>): boolean {
  return (
    (props.cardRounding ?? 'medium') === (preset.cardRounding ?? 'medium') &&
    (props.cardShadow ?? 'none') === (preset.cardShadow ?? 'none') &&
    (props.cardBackgroundColor ?? '#ffffff') === (preset.cardBackgroundColor ?? '#ffffff') &&
    (props.cardBorderColor ?? DEFAULT_CARD_BORDER_COLOR) === (preset.cardBorderColor ?? DEFAULT_CARD_BORDER_COLOR) &&
    normalizeCardBorder(props.cardBorder) === normalizeCardBorder(preset.cardBorder) &&
    (props.cardWidth ?? 'default') === (preset.cardWidth ?? 'default') &&
    (props.cardPadding ?? 'space-24') === (preset.cardPadding ?? 'space-24')
  )
}

function effectiveCardType(props: ComponentProps): 'overBackground' | 'inline' | 'custom' {
  if (props.cardType === 'custom') return 'custom'
  if (props.cardType === 'overBackground' && cardPropsMatchPreset(props, OVER_BACKGROUND_PRESET)) return 'overBackground'
  if (props.cardType === 'inline' && cardPropsMatchPreset(props, INLINE_PRESET)) return 'inline'
  if (cardPropsMatchPreset(props, OVER_BACKGROUND_PRESET)) return 'overBackground'
  if (cardPropsMatchPreset(props, INLINE_PRESET)) return 'inline'
  return 'custom'
}

function cardUpdateWithAutoCustom(props: ComponentProps, updates: Partial<ComponentProps>): Partial<ComponentProps> {
  const next = { ...props, ...updates }
  const noLongerOverBg = !cardPropsMatchPreset(next, OVER_BACKGROUND_PRESET)
  const noLongerInline = !cardPropsMatchPreset(next, INLINE_PRESET)
  if (noLongerOverBg && noLongerInline) return { ...updates, cardType: 'custom' }
  return updates
}

interface TabData {
  id: string
  label: string
  enabled?: boolean
  position?: number
}

interface ConfigurationPanelProps {
  componentType: ComponentType | null
  props: ComponentProps
  selectedComponentId?: string | null
  onUpdate: (props: Partial<ComponentProps>) => void
  onSidebarContentStickyChange?: (componentId: string, sticky: boolean, edge?: 'top' | 'bottom') => void
  onDelete?: () => void
  // Tab configuration - show all tabs
  showTabSettings?: boolean
  allTabs?: TabData[]
  onUpdateTab?: (tabId: string, updates: { label?: string; enabled?: boolean; position?: number }) => void
  tabStyle?: TabStyle
  onUpdateTabStyle?: (style: TabStyle) => void
  tabSticky?: boolean
  onUpdateTabSticky?: (sticky: boolean) => void
  tabIconUrl?: string
  tabIconAlt?: string
  onUpdateTabIcon?: (iconUrl?: string, iconAlt?: string) => void
}

export function ConfigurationPanel({
  componentType,
  props,
  selectedComponentId,
  onUpdate,
  onSidebarContentStickyChange,
  onDelete,
  showTabSettings,
  allTabs,
  onUpdateTab,
  tabStyle = 'line',
  onUpdateTabStyle,
  tabSticky = false,
  onUpdateTabSticky,
  tabIconUrl,
  tabIconAlt,
  onUpdateTabIcon,
}: ConfigurationPanelProps) {
  // Prioritize component selection over tab settings
  // If a component is selected, show its configuration
  if (componentType) {
    // Component configuration will be shown below - skip tab settings
  } else if (showTabSettings && allTabs && onUpdateTab) {
    // If tab settings are open and no component is selected, show all tabs configuration
    const sortedTabs = [...allTabs].sort((a, b) => (a.position || 0) - (b.position || 0))
    
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tab Settings</h3>
        </div>

        {/* Tab Style Selector */}
        {onUpdateTabStyle && (
          <div>
            <Label htmlFor="tab-style">Tab Style</Label>
            <select
              id="tab-style"
              value={tabStyle}
              onChange={(e) => onUpdateTabStyle(e.target.value as TabStyle)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="line">Line</option>
              <option value="classic">Classic</option>
            </select>
          </div>
        )}

        {/* Tab Sticky Toggle */}
        {onUpdateTabSticky && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tab-sticky"
              checked={tabSticky === true}
              onChange={(e) => onUpdateTabSticky(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="tab-sticky" className="cursor-pointer">
              Sticky Tab Bar
            </Label>
          </div>
        )}

        {/* Tab Icon Configuration */}
        {onUpdateTabIcon && (
          <>
            <div>
              <Label htmlFor="tabIconUrl">Tab Icon/Image URL</Label>
              <Input
                id="tabIconUrl"
                value={tabIconUrl || ''}
                onChange={(e) => onUpdateTabIcon(e.target.value || undefined, tabIconAlt)}
                placeholder="/assets/images/history.png or https://example.com/icon.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use /assets/images/history.png for local images, or full URL for external images
              </p>
            </div>
            <div>
              <Label htmlFor="tabIconAlt">Tab Icon Alt Text</Label>
              <Input
                id="tabIconAlt"
                value={tabIconAlt || ''}
                onChange={(e) => onUpdateTabIcon(tabIconUrl, e.target.value || undefined)}
                placeholder="Tab icon"
              />
            </div>
          </>
        )}

        <div className="space-y-6">
          {sortedTabs.map((tab) => (
            <div key={tab.id} className="border-b pb-4 last:border-b-0 last:pb-0 space-y-3">
              <h4 className="font-medium text-sm text-gray-700">{tab.label}</h4>
              
              <div>
                <Label htmlFor={`tab-label-${tab.id}`}>Label</Label>
                <Input
                  id={`tab-label-${tab.id}`}
                  value={tab.label || ''}
                  onChange={(e) => onUpdateTab(tab.id, { label: e.target.value })}
                  placeholder="Enter tab label"
                />
              </div>
              
              <div>
                <Label htmlFor={`tab-position-${tab.id}`}>Position</Label>
                <Input
                  id={`tab-position-${tab.id}`}
                  type="number"
                  min={1}
                  max={allTabs.length}
                  value={tab.position || 1}
                  onChange={(e) => {
                    const position = parseInt(e.target.value, 10)
                    if (!isNaN(position) && position >= 1 && position <= allTabs.length) {
                      onUpdateTab(tab.id, { position })
                    }
                  }}
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Position in tab bar (1 = leftmost, {allTabs.length} = rightmost)
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`tab-enabled-${tab.id}`}
                  checked={tab.enabled !== false}
                  onChange={(e) => onUpdateTab(tab.id, { enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor={`tab-enabled-${tab.id}`} className="cursor-pointer">
                  Enabled
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // No component selected and tab settings not open
  if (!componentType) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a component to configure
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuration</h3>
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Layer Properties - available for all components */}
        <div className="border-t pt-4 space-y-4">
          <div>
            <Label htmlFor="layerName">Layer Name</Label>
            <Input
              id="layerName"
              value={props.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter layer name"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={props.enabled !== false}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enabled
            </Label>
          </div>
        </div>

        {/* Title Component */}
        {(componentType === 'title') && (
          <>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={props.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={props.logoUrl || ''}
                onChange={(e) => onUpdate({ logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="logoAlt">Logo Alt Text</Label>
              <Input
                id="logoAlt"
                value={props.logoAlt || ''}
                onChange={(e) => onUpdate({ logoAlt: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="headingLevel">Heading Level</Label>
              <select
                id="headingLevel"
                value={props.headingLevel || 'h1'}
                onChange={(e) => onUpdate({ headingLevel: e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>
            <div>
              <Label htmlFor="titleColor">Title Text Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="titleColorPicker"
                  value={props.titleColor && /^#[0-9A-Fa-f]{6}$/.test(props.titleColor) 
                    ? props.titleColor 
                    : '#000000'}
                  onChange={(e) => onUpdate({ titleColor: e.target.value })}
                  className="h-10 w-16 cursor-pointer border border-gray-300 rounded"
                />
                <Input
                  id="titleColor"
                  value={props.titleColor || ''}
                  onChange={(e) => onUpdate({ titleColor: e.target.value })}
                  placeholder="#000000 or rgb(0, 0, 0)"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                CSS color value (hex, rgb, or color name)
              </p>
            </div>
            <div>
              <Label htmlFor="titleFontFamily">Font Family</Label>
              <Input
                id="titleFontFamily"
                value={props.titleFontFamily || ''}
                onChange={(e) => onUpdate({ titleFontFamily: e.target.value })}
                placeholder="Arial, sans-serif"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSS font-family value (e.g., "Arial", "Times New Roman", "Georgia, serif")
              </p>
            </div>
          </>
        )}

        {/* Paragraph Component */}
        {componentType === 'paragraph' && (
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={props.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              rows={5}
            />
          </div>
        )}

        {/* Heading Components */}
        {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(componentType) && (
          <div>
            <Label htmlFor="text">Text</Label>
            <Input
              id="text"
              value={props.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
          </div>
        )}

        {/* Image Component */}
        {componentType === 'image' && (
          <>
            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={props.src || ''}
                onChange={(e) => onUpdate({ src: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={props.alt || ''}
                onChange={(e) => onUpdate({ alt: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="imageWidth">Width</Label>
                <Input
                  id="imageWidth"
                  value={props.imageWidth || ''}
                  onChange={(e) => onUpdate({ imageWidth: e.target.value })}
                  placeholder="auto (100%)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for 100% width, or use px (e.g., "400px"), number (e.g., "400"), or Tailwind class (e.g., "w-64")
                </p>
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={props.height || ''}
                  onChange={(e) => onUpdate({ height: e.target.value })}
                  placeholder="auto"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for auto height, or use px (e.g., "300px"), number (e.g., "300"), or Tailwind class (e.g., "h-48")
                </p>
              </div>
            </div>
          </>
        )}

        {/* Banner Image Component */}
        {componentType === 'bannerImage' && (
          <>
            <div>
              <Label htmlFor="bannerSrc">Image URL</Label>
              <Input
                id="bannerSrc"
                value={props.src || ''}
                onChange={(e) => onUpdate({ src: e.target.value })}
                placeholder="https://example.com/banner.jpg or /assets/images/banner.jpg"
              />
            </div>
            <div>
              <Label htmlFor="bannerAlt">Alt Text</Label>
              <Input
                id="bannerAlt"
                value={props.alt || ''}
                onChange={(e) => onUpdate({ alt: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bannerHeight">Height</Label>
              <Input
                id="bannerHeight"
                type="text"
                value={props.height !== undefined ? String(props.height) : ''}
                onChange={(e) => {
                  const value = e.target.value.trim()
                  // Allow empty string, numbers, or CSS values like "300px", "50vh", "50%", etc.
                  if (value === '') {
                    onUpdate({ height: undefined })
                  } else if (/^\d+$/.test(value)) {
                    // Pure number - store as number for consistency with other components
                    onUpdate({ height: parseInt(value, 10) })
                  } else if (/^\d+(\.\d+)?(px|vh|vw|%|rem|em)$/i.test(value)) {
                    // Valid CSS unit value - store as string
                    onUpdate({ height: value })
                  }
                }}
                placeholder="300px, 50vh, 400, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number (pixels) or CSS value (e.g., 300px, 50vh, 400)
              </p>
            </div>
          </>
        )}

        {/* FlexContainer Component */}
        {componentType === 'flexContainer' && (
          <>
            <div>
              <Label>Width</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: 'default' as const, label: 'Default (900px max)' },
                  { value: 'full' as const, label: 'Full width (100%)' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onUpdate({ flexContainerMaxWidth: value })}
                    className={`px-3 py-1.5 rounded text-sm ${
                      (props.flexContainerMaxWidth || 'default') === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default constrains to 900px; full width fills the available area.
              </p>
            </div>
            <div>
              <Label>Column layout</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: 'row' as const, label: 'Side by side' },
                  { value: 'column' as const, label: 'Stacked' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onUpdate({ flexDirection: value })}
                    className={`px-3 py-1.5 rounded text-sm ${
                      (props.flexDirection || 'row') === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Side by side: columns in a row. Stacked: columns in a column.
              </p>
            </div>
            <div>
              <Label htmlFor="gap">Gap</Label>
              <Input
                id="gap"
                value={props.gap || 'gap-4'}
                onChange={(e) => onUpdate({ gap: e.target.value })}
                placeholder="gap-4"
              />
            </div>
            <div>
              <Label htmlFor="columnDistribution">Column Distribution</Label>
              <Input
                id="columnDistribution"
                value={props.columnDistribution || ''}
                onChange={(e) => onUpdate({ columnDistribution: e.target.value })}
                placeholder="1:1, 1:2, 2:1, 1:1:1, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Define column widths using ratios (e.g., "1:1" for equal, "1:2" for 1/3 and 2/3, "2:1:1" for three columns)
              </p>
            </div>
            <div>
              <Label htmlFor="flexContainerFlex">Flex ratio (sidebar layout)</Label>
              <Input
                id="flexContainerFlex"
                type="number"
                min={0.1}
                max={24}
                step="any"
                value={props.flexContainerFlex ?? ''}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  if (v === '') {
                    onUpdate({ flexContainerFlex: undefined })
                    return
                  }
                  const n = parseFloat(v)
                  if (!isNaN(n) && n >= 0.1 && n <= 24) onUpdate({ flexContainerFlex: n })
                }}
                placeholder="e.g. 4 or 2.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                When this container is the passage area inside a SidebarPage, use this as its flex ratio (e.g. 4 or 2.5 for 1:4:1 with sidebars set to 1).
              </p>
            </div>
          </>
        )}

        {/* Card Component */}
        {componentType === 'card' && (
          <>
            <div>
              <Label>Type</Label>
              <div
                role="group"
                aria-label="Card type"
                className="flex flex-col rounded-md border border-gray-300 overflow-hidden mt-1"
              >
                {[
                  { value: 'overBackground' as const, label: 'Over Background' },
                  { value: 'inline' as const, label: 'Inline' },
                  { value: 'custom' as const, label: 'Custom' },
                ].map(({ value, label }) => {
                  const effective = effectiveCardType(props)
                  const isSelected = effective === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (value === 'overBackground') {
                          onUpdate({
                            cardType: 'overBackground',
                            ...OVER_BACKGROUND_PRESET,
                          })
                        } else if (value === 'inline') {
                          onUpdate({
                            cardType: 'inline',
                            ...INLINE_PRESET,
                          })
                        } else {
                          onUpdate({ cardType: 'custom' })
                        }
                      }}
                      className={`px-3 py-2 text-sm w-full border-b border-gray-300 last:border-b-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset -mt-px first:mt-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label>Rounding</Label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden mt-1">
                {(['small', 'medium', 'large'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdate(cardUpdateWithAutoCustom(props, { cardRounding: opt }))}
                    className={`flex-1 min-w-0 px-3 py-1.5 text-sm border-r border-gray-300 last:border-r-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset ${
                      (props.cardRounding || 'medium') === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Shadow</Label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden mt-1">
                {(['none', 'low', 'high'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdate(cardUpdateWithAutoCustom(props, { cardShadow: opt }))}
                    className={`flex-1 min-w-0 px-3 py-1.5 text-sm border-r border-gray-300 last:border-r-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset ${
                      (props.cardShadow || 'none') === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium text-gray-600">Core Colors</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Transparent', value: 'transparent', borderColor: DEFAULT_CARD_BORDER_COLOR },
                    { label: 'White', value: '#ffffff', borderColor: DEFAULT_CARD_BORDER_COLOR },
                    { label: 'Sky', value: NAEP_LIGHT_BACKGROUNDS.Sky, borderColor: NAEP_BORDER_COLORS.Sky },
                    { label: 'Orange', value: NAEP_LIGHT_BACKGROUNDS.Orange, borderColor: NAEP_BORDER_COLORS.Orange },
                  ].map(({ label, value, borderColor }) => {
                    const isSelected = (props.cardBackgroundColor || '#ffffff') === value
                    return (
                      <button
                        key={value}
                        type="button"
                        title={label}
                        onClick={() => onUpdate(cardUpdateWithAutoCustom(props, { cardBackgroundColor: value, cardBorderColor: borderColor }))}
                        className={`w-6 h-6 rounded border-2 ${
                          isSelected
                            ? 'ring-2'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{
                          ...(value === 'transparent' ? TRANSPARENT_SWATCH_STYLE : { backgroundColor: value }),
                          ...(isSelected ? { borderColor, boxShadow: `0 0 0 2px ${borderColor}` } : {}),
                        }}
                      />
                    )
                  })}
                </div>
                <p className="text-xs font-medium text-gray-600 mt-2">Custom (NAEP light)</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(NAEP_LIGHT_BACKGROUNDS).map(([name, hex]) => {
                    const customBorderColor = NAEP_BORDER_COLORS[name] ?? DEFAULT_CARD_BORDER_COLOR
                    const isSelected = (props.cardBackgroundColor || '#ffffff') === hex
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => onUpdate(cardUpdateWithAutoCustom(props, { cardBackgroundColor: hex, cardBorderColor: customBorderColor }))}
                        className={`w-6 h-6 rounded border-2 ${
                          isSelected ? 'ring-2' : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{
                          backgroundColor: hex,
                          ...(isSelected ? { borderColor: customBorderColor, boxShadow: `0 0 0 2px ${customBorderColor}` } : {}),
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
            <div>
              <Label>Border</Label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden mt-1">
                {[
                  { value: 'none' as const, label: 'None' },
                  { value: 'thin' as const, label: 'Thin' },
                  { value: 'thick' as const, label: 'Thick' },
                ].map(({ value, label }) => {
                  const effectiveBorder = normalizeCardBorder(props.cardBorder)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onUpdate(cardUpdateWithAutoCustom(props, { cardBorder: value }))}
                      className={`flex-1 min-w-0 px-3 py-1.5 text-sm border-r border-gray-300 last:border-r-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset ${
                        effectiveBorder === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label>Width</Label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden mt-1">
                {(['default', 'manual'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const updates: Partial<ComponentProps> = { cardWidth: opt }
                      if (opt === 'manual' && !CARD_WIDTH_OPTIONS.includes((props.cardWidthManual || '') as (typeof CARD_WIDTH_OPTIONS)[number])) {
                        updates.cardWidthManual = 'max-w-md'
                      }
                      onUpdate(cardUpdateWithAutoCustom(props, updates))
                    }}
                    className={`flex-1 min-w-0 px-3 py-1.5 text-sm border-r border-gray-300 last:border-r-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset ${
                      (props.cardWidth || 'default') === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
              {(props.cardWidth || 'default') === 'manual' && (
                <div className="mt-2">
                  <Label htmlFor="cardWidthSlider">Max Width</Label>
                  <input
                    id="cardWidthSlider"
                    type="range"
                    min={0}
                    max={CARD_WIDTH_OPTIONS.length - 1}
                    value={(() => {
                      const key = props.cardWidthManual || 'max-w-md'
                      const idx = CARD_WIDTH_OPTIONS.indexOf(key as (typeof CARD_WIDTH_OPTIONS)[number])
                      return idx >= 0 ? idx : 3
                    })()}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value, 10)
                      if (!isNaN(idx) && idx >= 0 && idx < CARD_WIDTH_OPTIONS.length) {
                        onUpdate(cardUpdateWithAutoCustom(props, { cardWidthManual: CARD_WIDTH_OPTIONS[idx] }))
                      }
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {props.cardWidthManual && CARD_WIDTH_OPTIONS.includes(props.cardWidthManual as (typeof CARD_WIDTH_OPTIONS)[number])
                      ? props.cardWidthManual
                      : CARD_WIDTH_OPTIONS[3]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label>Padding (NAEP spacing)</Label>
              <input
                type="range"
                min={0}
                max={3}
                value={(() => {
                  const key = props.cardPadding || 'space-24'
                  const idx = CARD_PADDING_OPTIONS.indexOf(key as (typeof CARD_PADDING_OPTIONS)[number])
                  return idx >= 0 ? idx : 1
                })()}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10)
                  if (!isNaN(idx) && idx >= 0 && idx <= 3) {
                    onUpdate(cardUpdateWithAutoCustom(props, { cardPadding: CARD_PADDING_OPTIONS[idx] }))
                  }
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {props.cardPadding && ['space-16', 'space-24', 'space-32', 'space-48'].includes(props.cardPadding)
                  ? `${props.cardPadding} (${props.cardPadding.replace('space-', '')}px)`
                  : 'space-24 (24px)'}
              </p>
            </div>
          </>
        )}

        {/* Column Component */}
        {componentType === 'column' && (
          <>
            <div className="text-sm text-gray-500 mb-4">
              Column width is controlled by the parent Flex Container's distribution setting.
            </div>
            <div>
              <Label>Width</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: 'default' as const, label: 'Default (900px max)' },
                  { value: 'full' as const, label: 'Full width' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onUpdate({ columnMaxWidth: value })}
                    className={`px-3 py-1.5 rounded text-sm ${
                      (props.columnMaxWidth || 'default') === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default constrains to 900px; full width fills the available area.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="columnHasPadding"
                checked={props.columnHasPadding !== false}
                onChange={(e) => onUpdate({ columnHasPadding: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="columnHasPadding" className="cursor-pointer">
                Has Padding (p-6)
              </Label>
            </div>
          </>
        )}

        {/* WebsiteHeaderBar Component */}
        {componentType === 'websiteHeaderBar' && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="headerIsSticky"
                checked={props.headerBarSticky === true}
                onChange={(e) => onUpdate({ headerBarSticky: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="headerIsSticky" className="cursor-pointer">
                Sticky Header
              </Label>
            </div>
            <div>
              <Label htmlFor="headerTitle">Title Text</Label>
              <Input
                id="headerTitle"
                value={props.headerTitle || ''}
                onChange={(e) => onUpdate({ headerTitle: e.target.value })}
                placeholder="Enter header title"
              />
            </div>
            <div>
              <Label htmlFor="headerFontFamily">Title Font Family</Label>
              <Input
                id="headerFontFamily"
                value={props.headerFontFamily || ''}
                onChange={(e) => onUpdate({ headerFontFamily: e.target.value })}
                placeholder="Arial, sans-serif"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSS font-family value (e.g., "Arial", "Times New Roman", "Georgia, serif")
              </p>
            </div>
            <div>
              <Label htmlFor="headerTitleColor">Title Text Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="headerTitleColorPicker"
                  value={props.headerTitleColor && /^#[0-9A-Fa-f]{6}$/.test(props.headerTitleColor) 
                    ? props.headerTitleColor 
                    : '#000000'}
                  onChange={(e) => onUpdate({ headerTitleColor: e.target.value })}
                  className="h-10 w-16 cursor-pointer border border-gray-300 rounded"
                />
                <Input
                  id="headerTitleColor"
                  value={props.headerTitleColor || ''}
                  onChange={(e) => onUpdate({ headerTitleColor: e.target.value })}
                  placeholder="#000000 or rgb(0, 0, 0)"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                CSS color value (hex, rgb, or color name)
              </p>
            </div>
            <div>
              <Label htmlFor="headerBackgroundColor">Toolbar Background Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="headerBackgroundColorPicker"
                  value={props.headerBackgroundColor && /^#[0-9A-Fa-f]{6}$/.test(props.headerBackgroundColor) 
                    ? props.headerBackgroundColor 
                    : '#ffffff'}
                  onChange={(e) => onUpdate({ headerBackgroundColor: e.target.value })}
                  className="h-10 w-16 cursor-pointer border border-gray-300 rounded"
                />
                <Input
                  id="headerBackgroundColor"
                  value={props.headerBackgroundColor || ''}
                  onChange={(e) => onUpdate({ headerBackgroundColor: e.target.value })}
                  placeholder="#ffffff or rgb(255, 255, 255)"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                CSS color value (hex, rgb, or color name)
              </p>
            </div>
            <div>
              <Label htmlFor="headerIconUrl">Icon/Image URL</Label>
              <Input
                id="headerIconUrl"
                value={props.headerIconUrl || ''}
                onChange={(e) => onUpdate({ headerIconUrl: e.target.value })}
                placeholder="/assets/images/history.png or https://example.com/icon.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use /assets/images/history.png for local images, or full URL for external images
              </p>
            </div>
            <div>
              <Label htmlFor="headerIconAlt">Icon Alt Text</Label>
              <Input
                id="headerIconAlt"
                value={props.headerIconAlt || ''}
                onChange={(e) => onUpdate({ headerIconAlt: e.target.value })}
                placeholder="Header icon"
              />
            </div>
            <div>
              <Label htmlFor="headerTextAlign">Text Alignment</Label>
              <select
                id="headerTextAlign"
                value={props.headerTextAlign || 'left'}
                onChange={(e) => onUpdate({ headerTextAlign: e.target.value as 'left' | 'center' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                If an icon is present, it stays left-aligned and text centers in remaining space
              </p>
            </div>
            <div>
              <Label htmlFor="headerHeadingLevel">Heading Level</Label>
              <select
                id="headerHeadingLevel"
                value={props.headerHeadingLevel || 'h3'}
                onChange={(e) => onUpdate({ headerHeadingLevel: e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>
          </>
        )}

        {/* SidebarPage Component */}
        {componentType === 'sidebarPage' && (
          <div className="text-sm text-gray-500">
            Add SidebarColumn and FlexContainer children to build your sidebar layout.
            Author children in any order (e.g., SidebarColumn, FlexContainer, SidebarColumn).
          </div>
        )}

        {/* SidebarColumn Component */}
        {componentType === 'sidebarColumn' && (
          <>
            <div>
              <Label htmlFor="sidebarColumnWidth">Sidebar Width</Label>
              <Input
                id="sidebarColumnWidth"
                value={props.sidebarColumnWidth ?? ''}
                onChange={(e) => onUpdate({ sidebarColumnWidth: e.target.value || undefined })}
                placeholder="e.g. 1, 2.5, 200px, 25%"
              />
              <p className="text-xs text-gray-500 mt-1">
                Flex ratio (e.g., 1, 2.5, 4) or fixed width (e.g., 200px, 25%). Use flex for 1:4:1-style layouts with the passage.
              </p>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: 'White', value: '#ffffff', borderColor: DEFAULT_CARD_BORDER_COLOR },
                  { label: 'Transparent', value: 'transparent', borderColor: DEFAULT_CARD_BORDER_COLOR },
                  ...Object.entries(NAEP_LIGHT_BACKGROUNDS).map(([name, hex]) => ({
                    label: name,
                    value: hex,
                    borderColor: NAEP_BORDER_COLORS[name] ?? DEFAULT_CARD_BORDER_COLOR,
                  })),
                ].map(({ label, value, borderColor }) => {
                  const isSelected = (props.sidebarColumnBgColor || '') === value
                  return (
                    <button
                      key={value === 'transparent' ? 'transparent' : value}
                      type="button"
                      title={label}
                      onClick={() => onUpdate({ sidebarColumnBgColor: value })}
                      className={`w-6 h-6 rounded border-2 ${
                        isSelected ? 'ring-2' : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{
                        ...(value === 'transparent' ? TRANSPARENT_SWATCH_STYLE : { backgroundColor: value }),
                        ...(isSelected ? { borderColor: borderColor, boxShadow: `0 0 0 2px ${borderColor}` } : {}),
                      }}
                    />
                  )
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="sidebarColumnBgImage">Background Image URL</Label>
              <Input
                id="sidebarColumnBgImage"
                value={props.sidebarColumnBgImage || ''}
                onChange={(e) => onUpdate({ sidebarColumnBgImage: e.target.value || undefined })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {props.sidebarColumnBgImage && (
              <>
                <div>
                  <Label htmlFor="sidebarColumnBgImageRepeat">Background Repeat</Label>
                  <select
                    id="sidebarColumnBgImageRepeat"
                    value={props.sidebarColumnBgImageRepeat || 'no-repeat'}
                    onChange={(e) => onUpdate({ sidebarColumnBgImageRepeat: e.target.value as ComponentProps['sidebarColumnBgImageRepeat'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sidebarColumnBgImageSize">Background Size</Label>
                  <select
                    id="sidebarColumnBgImageSize"
                    value={props.sidebarColumnBgImageSize || 'cover'}
                    onChange={(e) => onUpdate({ sidebarColumnBgImageSize: e.target.value as ComponentProps['sidebarColumnBgImageSize'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="cover">Cover (fill proportionally)</option>
                    <option value="contain">Contain (fit within)</option>
                    <option value="auto">Auto (intrinsic size)</option>
                    <option value="stretch">Stretch (scales to full column height)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    "Stretch" scales the image to the full column height, so it scrolls with the page on long passages.
                  </p>
                </div>
                <div>
                  <Label>Background Position</Label>
                  <div className="grid grid-cols-3 gap-1 mt-1 w-fit">
                    {([
                      ['top-left', 'top', 'top-right'],
                      ['left', 'center', 'right'],
                      ['bottom-left', 'bottom', 'bottom-right'],
                    ] as const).map((row, ri) => (
                      <React.Fragment key={ri}>
                        {row.map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => onUpdate({ sidebarColumnBgImagePosition: pos })}
                            className={`w-8 h-8 rounded text-[10px] leading-tight border ${
                              (props.sidebarColumnBgImagePosition || 'center') === pos
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-gray-100 border-gray-300'
                            }`}
                            title={pos}
                          >
                            {pos === 'center' ? '\u2022' : pos === 'top' ? '\u2191' : pos === 'bottom' ? '\u2193' : pos === 'left' ? '\u2190' : pos === 'right' ? '\u2192' : pos === 'top-left' ? '\u2196' : pos === 'top-right' ? '\u2197' : pos === 'bottom-left' ? '\u2199' : '\u2198'}
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* SidebarContent Component */}
        {componentType === 'sidebarContent' && (
          <>
            <div>
              <Label>Background Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: 'White', value: '#ffffff', borderColor: DEFAULT_CARD_BORDER_COLOR },
                  { label: 'Transparent', value: 'transparent', borderColor: DEFAULT_CARD_BORDER_COLOR },
                  ...Object.entries(NAEP_LIGHT_BACKGROUNDS).map(([name, hex]) => ({
                    label: name,
                    value: hex,
                    borderColor: NAEP_BORDER_COLORS[name] ?? DEFAULT_CARD_BORDER_COLOR,
                  })),
                ].map(({ label, value, borderColor }) => {
                  const isSelected = (props.sidebarContentBgColor || '') === value
                  return (
                    <button
                      key={value === 'transparent' ? 'transparent' : value}
                      type="button"
                      title={label}
                      onClick={() => onUpdate({ sidebarContentBgColor: value })}
                      className={`w-6 h-6 rounded border-2 ${
                        isSelected ? 'ring-2' : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{
                        ...(value === 'transparent' ? TRANSPARENT_SWATCH_STYLE : { backgroundColor: value }),
                        ...(isSelected ? { borderColor: borderColor, boxShadow: `0 0 0 2px ${borderColor}` } : {}),
                      }}
                    />
                  )
                })}
              </div>
            </div>
            <div>
              <Label>Vertical Alignment in Parent</Label>
              <div className="flex flex-col rounded-md border border-gray-300 overflow-hidden mt-1 w-fit">
                {([
                  { value: 'start' as const, label: 'Top' },
                  { value: 'center' as const, label: 'Center' },
                  { value: 'end' as const, label: 'Bottom' },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onUpdate({ sidebarContentVerticalAlign: value })}
                    className={`w-full px-3 py-1.5 text-sm border-b border-gray-300 last:border-b-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset text-left ${
                      (props.sidebarContentVerticalAlign || 'start') === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Positions this container within the parent SidebarColumn.
              </p>
            </div>
            <div>
              <Label htmlFor="sidebarContentImage">Image URL</Label>
              <Input
                id="sidebarContentImage"
                value={props.sidebarContentImage || ''}
                onChange={(e) => onUpdate({ sidebarContentImage: e.target.value || undefined })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {props.sidebarContentImage && (
              <>
                <div>
                  <Label htmlFor="sidebarContentImageRepeat">Image Repeat</Label>
                  <select
                    id="sidebarContentImageRepeat"
                    value={props.sidebarContentImageRepeat || 'no-repeat'}
                    onChange={(e) => onUpdate({ sidebarContentImageRepeat: e.target.value as ComponentProps['sidebarContentImageRepeat'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sidebarContentImageSize">Image Size</Label>
                  <select
                    id="sidebarContentImageSize"
                    value={props.sidebarContentImageSize || 'cover'}
                    onChange={(e) => onUpdate({ sidebarContentImageSize: e.target.value as ComponentProps['sidebarContentImageSize'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="cover">Cover (fill proportionally)</option>
                    <option value="contain">Contain (fit within)</option>
                    <option value="auto">Auto (intrinsic size)</option>
                    <option value="stretch">Stretch (scales to container)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cover/contain preserve aspect ratio; stretch fills the container.
                  </p>
                </div>
                <div>
                  <Label>Image Position</Label>
                  <div className="grid grid-cols-3 gap-1 mt-1 w-fit">
                    {([
                      ['top-left', 'top', 'top-right'],
                      ['left', 'center', 'right'],
                      ['bottom-left', 'bottom', 'bottom-right'],
                    ] as const).map((row, ri) => (
                      <React.Fragment key={ri}>
                        {row.map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => onUpdate({ sidebarContentImagePosition: pos })}
                            className={`w-8 h-8 rounded text-[10px] leading-tight border ${
                              (props.sidebarContentImagePosition || 'center') === pos
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-gray-100 border-gray-300'
                            }`}
                            title={pos}
                          >
                            {pos === 'center' ? '\u2022' : pos === 'top' ? '\u2191' : pos === 'bottom' ? '\u2193' : pos === 'left' ? '\u2190' : pos === 'right' ? '\u2192' : pos === 'top-left' ? '\u2196' : pos === 'top-right' ? '\u2197' : pos === 'bottom-left' ? '\u2199' : '\u2198'}
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div>
              <Label>Height</Label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden mt-1">
                {([
                  { value: 'grow', label: 'Grow / Fill' },
                  { value: 'fixed', label: 'Fixed' },
                ]).map(({ value, label }) => {
                  const isGrow = (props.sidebarContentHeight || 'grow') === 'grow'
                  const isSelected = value === 'grow' ? isGrow : !isGrow
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onUpdate({ sidebarContentHeight: value === 'grow' ? 'grow' : '200px' })}
                      className={`flex-1 min-w-0 px-3 py-1.5 text-sm border-r border-gray-300 last:border-r-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {(props.sidebarContentHeight || 'grow') !== 'grow' && (
                <div className="mt-2">
                  <Input
                    value={props.sidebarContentHeight || '200px'}
                    onChange={(e) => onUpdate({ sidebarContentHeight: e.target.value })}
                    placeholder="200px"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed height value (e.g., "200px", "50%")
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label>Stick To</Label>
              <p className="text-xs text-gray-500 mt-0.5 mb-1">
                SidebarContent must have Height set to Fixed to sticky.
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Only one SidebarContent per SidebarColumn can stick to Top, and one to Bottom. Stickying to Top/Bottom may reorder SidebarContent's in the Outline. 
              </p>
              <div className="flex rounded-md border border-gray-300 overflow-hidden mt-1">
                {([
                  { value: 'none' as const, label: 'None', sticky: false, edge: undefined },
                  { value: 'top' as const, label: 'Top', sticky: true, edge: 'top' as const },
                  { value: 'bottom' as const, label: 'Bottom', sticky: true, edge: 'bottom' as const },
                ]).map(({ value, label, sticky: stickyOn, edge }) => {
                  const isFixedHeight = (props.sidebarContentHeight || 'grow') !== 'grow'
                  const isSelected =
                    value === 'none'
                      ? !props.sidebarContentSticky
                      : props.sidebarContentSticky && (props.sidebarContentStickyEdge || 'top') === edge
                  const isDisabled = value !== 'none' && !isFixedHeight
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (value === 'none') {
                          onUpdate({ sidebarContentSticky: false })
                          return
                        }
                        if (onSidebarContentStickyChange && selectedComponentId && edge) {
                          onSidebarContentStickyChange(selectedComponentId, true, edge)
                        } else {
                          onUpdate({
                            sidebarContentSticky: stickyOn,
                            ...(stickyOn && edge ? { sidebarContentStickyEdge: edge } : {}),
                          })
                        }
                      }}
                      className={`flex-1 min-w-0 px-3 py-1.5 text-sm border-r border-gray-300 last:border-r-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset disabled:opacity-50 disabled:pointer-events-none ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* FakeURLBar Component */}
        {componentType === 'fakeURLBar' && (
          <>
            <div>
              <Label htmlFor="urlText">URL Text</Label>
              <Input
                id="urlText"
                value={props.urlText || 'https://example.com'}
                onChange={(e) => onUpdate({ urlText: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                checked={props.visible !== false}
                onChange={(e) => onUpdate({ visible: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="visible" className="cursor-pointer">
                Show URL Bar
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urlBarIsSticky"
                checked={props.urlBarSticky === true}
                onChange={(e) => onUpdate({ urlBarSticky: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="urlBarIsSticky" className="cursor-pointer">
                Sticky URL Bar
              </Label>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
