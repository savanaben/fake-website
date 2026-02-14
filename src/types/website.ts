export type ComponentType =
  | 'tab'
  | 'flexContainer'
  | 'column'
  | 'title'
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'image'
  | 'bannerImage'
  | 'card'
  | 'fakeURLBar'
  | 'websiteHeaderBar'
  | 'sidebarPage'
  | 'sidebarColumn'
  | 'sidebarContent'

export interface ComponentProps {
  // Tab props
  tabs?: Array<{ id: string; label: string }>
  
  // Title props
  title?: string
  logoUrl?: string
  logoAlt?: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  titleColor?: string
  titleFontFamily?: string
  
  // Paragraph props
  content?: string
  
  // Heading props
  text?: string
  
  // Image props
  src?: string
  alt?: string
  imageWidth?: string | number
  height?: string | number
  
  // Card props
  cardType?: 'overBackground' | 'inline' | 'custom'
  cardRounding?: 'small' | 'medium' | 'large'
  cardShadow?: 'none' | 'low' | 'high'
  cardBackgroundColor?: string
  cardBorderColor?: string
  cardBorder?: 'none' | 'thin' | 'thick' | 'bordered' // 'bordered' legacy, treated as thick
  cardWidth?: 'default' | 'manual'
  cardWidthManual?: string
  cardPadding?: 'space-16' | 'space-24' | 'space-32' | 'space-48'
  
  // Layout props
  gap?: string
  flexDirection?: 'row' | 'column' // row = columns side-by-side, column = columns stacked
  flexContainerMaxWidth?: 'default' | 'full' // default = max 900px centered, full = 100% width
  flexContainerFlex?: number // when inside SidebarPage, flex ratio (e.g. 4 for 1:4:1 layout)
  columnDistribution?: string // e.g., "1:1", "1:2", "2:1", "1:1:1", "1:2:1"
  columnWidth?: string // Legacy/override for individual columns
  columnMaxWidth?: 'default' | 'full' // default = max 900px, full = fill available area
  columnHasPadding?: boolean // Whether column has padding (default: true)
  
  // FakeURLBar props
  urlText?: string
  visible?: boolean
  urlBarSticky?: boolean // Whether the URL bar should be sticky
  
  // WebsiteHeaderBar props
  headerTitle?: string
  headerFontFamily?: string
  headerBackgroundColor?: string
  headerTitleColor?: string
  headerIconUrl?: string
  headerIconAlt?: string
  headerTextAlign?: 'left' | 'center' // Text alignment (default: 'left')
  headerHeadingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' // Heading level (default: 'h3')
  headerBarSticky?: boolean // Whether the header bar should be sticky
  
  // SidebarColumn props
  sidebarColumnWidth?: string // flex ratio "1", "2", "3" or fixed "200px", "25%"
  sidebarColumnBgColor?: string // background color
  sidebarColumnBgImage?: string // background image URL
  sidebarColumnBgImageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  sidebarColumnBgImageSize?: 'cover' | 'contain' | 'auto' | 'stretch'
  sidebarColumnBgImagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // SidebarContent props
  sidebarContentBgColor?: string // container background color
  sidebarContentVerticalAlign?: 'start' | 'center' | 'end' // vertical position in parent SidebarColumn via auto-margins
  sidebarContentImage?: string // image URL (rendered as CSS background for repeat/size support)
  sidebarContentImagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  sidebarContentImageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  sidebarContentImageSize?: 'cover' | 'contain' | 'auto' | 'stretch'
  sidebarContentHeight?: 'grow' | string // 'grow' = flex:1, or fixed value like "200px"
  sidebarContentSticky?: boolean // sticky positioning
  sidebarContentStickyEdge?: 'top' | 'bottom' // stick to top or bottom

  // Layer props (available for all components)
  name?: string // Custom name for the layer
  enabled?: boolean // Whether the layer is enabled (default: true)
}

export interface WebsiteComponent {
  id: string
  type: ComponentType
  props: ComponentProps
  children?: WebsiteComponent[]
}

export interface TabData {
  id: string
  label: string
  content: WebsiteComponent[]
  name?: string // Custom name for the tab
  enabled?: boolean // Whether the tab is enabled (default: true)
  position?: number // Position in the tab bar (1 = leftmost, higher = right)
}

export type TabStyle = 'line' | 'classic'

export interface WebsiteData {
  tabs: TabData[]
  activeTabId: string
  tabStyle?: TabStyle // Style variant for tabs: 'line' (default) or 'classic'
  tabSticky?: boolean // Whether the tab bar should be sticky
  tabIconUrl?: string // Icon image URL for the tab bar (displayed to the left of tabs)
  tabIconAlt?: string // Alt text for the tab bar icon
  crossTabComponents?: WebsiteComponent[] // Components that appear across all tabs (e.g., FakeURLBar)
  hideTabBar?: boolean // When true, hide tab bar and show only active tab content (e.g., for Card example)
  hideToolbar?: boolean // When true, hide the top builder toolbar (e.g., for Sidebar example)
}
