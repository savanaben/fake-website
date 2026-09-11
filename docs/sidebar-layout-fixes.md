# Sidebar layout fixes: vertical alignment stacking and sticky items

Handoff notes for the SidebarColumn / SidebarContent layout bugs. Written to be
portable: the root causes are pure CSS flexbox behavior, so the same fixes apply to
any framework as long as the DOM/CSS shape matches. The reference implementation is
this prototype (`src/components/layout/sidebarLayout.ts`, `SidebarColumn.tsx`,
`SidebarContent.tsx`, the `sidebarColumn` case in `src/utils/componentFactory.tsx`, and
the scroll container in `src/components/builder/BuilderCanvas.tsx`).

Three fixes are covered:

1. Vertical alignment groups did not stack (section 3).
2. Sticky items reserved space in the column (section 5).
3. Percent heights on sticky items should mean percent of the *visible* area (section 7).

## 1. Symptoms

1. **"Bottom" alignment does not stack at the bottom.** Setting several SidebarContent
   items to *Vertical Alignment in Parent = Top* packs them at the top of the column as
   expected. Setting them to *Bottom* does not pack them at the bottom; they end up
   spread out / vaguely centered. *Center* has the same problem with more than one item.
2. **Sticky items reserve space but also overlap.** A SidebarContent set to *Stick To
   Top* keeps a slot at the top of the column, so a non-sticky Top-aligned item sits
   *below* it at rest. Once the page scrolls, the sticky item pins to the viewport and
   rides over the non-sticky item anyway. Expected: sticky items live in their own layer,
   and non-sticky items lay out as if sticky items did not exist (a Top-aligned item
   starts at the very top of the column, behind the sticky one).
3. **Sticky percent heights are relative to the whole column.** After fix 2, a sticky
   item at `100%` spans the full column, which can be many screens tall. Since a pinned
   element is effectively anchored to the screen, `100%` on a sticky item should mean
   "100% of the visible area" and shrink when the browser gets shorter.

## 2. Root cause 1: per-item auto margins share free space equally

The item component mapped its own alignment to auto margins:

```ts
// per SidebarContent item (old)
verticalAlign === 'end'    -> margin-top: auto
verticalAlign === 'center' -> margin-top: auto; margin-bottom: auto
verticalAlign === 'start'  -> (nothing)
```

CSS Flexbox (css-flexbox-1 §8.1, "Aligning with auto margins") distributes the free
space on the main axis **equally among all auto margins in the line**. With three
Bottom items there are three `margin-top: auto`, so each item receives one third of the
gap above it:

```
old, 3 x Bottom              expected
+------------+               +------------+
|  (1/3 gap) |               |            |
| [ item A ] |               |            |
|  (1/3 gap) |               |            |
| [ item B ] |               | [ item A ] |
|  (1/3 gap) |               | [ item B ] |
| [ item C ] |               | [ item C ] |
+------------+               +------------+
```

*Top* only appeared to work because `'start'` emits no margins at all, so items fall
into default flex-start packing.

Two related facts worth knowing:

- If **any** non-sticky sibling has *Height = Grow* (`flex: 1 1 0%`) it absorbs all
  free space, every auto margin resolves to `0`, and alignment has no visible effect.
  That is correct CSS; the config panel now says so.
- `justify-content` on the column cannot express "some items top, some bottom, some
  centered" either. The zones need auto margins at the boundaries, and only there.

## 3. Fix 1: compute margins once per column (boundary rule)

Move the decision to the parent, which can see all siblings. Walk the **non-sticky**
children in DOM order and emit an auto margin only where the alignment zone changes.
For item *i* with alignment `a`, previous item alignment `p` (none if first) and next
item alignment `n` (none if last):

| condition                                      | emit                  |
|------------------------------------------------|-----------------------|
| `a === 'center' && p !== 'center'`             | `margin-top: auto`    |
| `a === 'center' && n !== 'center'`             | `margin-bottom: auto` |
| `a === 'end' && p !== 'end' && p !== 'center'` | `margin-top: auto`    |
| `a === 'start'`                                | nothing               |

Result: exactly one auto margin per zone boundary. Top items pack at the top, Bottom
items pack flush at the bottom, Center items cluster and are centered between the top
group and the bottom group. Items are assumed to be ordered top / center / bottom in
the outline; an out-of-order item simply follows DOM order (that is a data issue, not
something the renderer should silently fix).

Reference implementation (TypeScript, framework-free):

```ts
type Align = 'start' | 'center' | 'end'
type Hint = { marginTop?: 'auto'; marginBottom?: 'auto' }

function computeSidebarFlowHints(items: { id: string; verticalAlign?: Align }[]): Record<string, Hint> {
  const hints: Record<string, Hint> = {}
  for (let i = 0; i < items.length; i++) {
    const a = items[i].verticalAlign || 'start'
    const p = i > 0 ? items[i - 1].verticalAlign || 'start' : undefined
    const n = i < items.length - 1 ? items[i + 1].verticalAlign || 'start' : undefined
    const hint: Hint = {}
    if (a === 'center') {
      if (p !== 'center') hint.marginTop = 'auto'
      if (n !== 'center') hint.marginBottom = 'auto'
    } else if (a === 'end') {
      if (p !== 'end' && p !== 'center') hint.marginTop = 'auto'
    }
    if (hint.marginTop || hint.marginBottom) hints[items[i].id] = hint
  }
  return hints
}
```

Wiring in the prototype: the factory computes the hints for a column and hands them to
`SidebarColumn`, which exposes them through a React context keyed by child id.
`SidebarContent` reads its own entry and spreads it into its inline style. Any other
mechanism that gets the per-child margins from the parent to the child works equally
well (props, a data attribute plus CSS, a computed class name).

### CSS-only alternative

If the production renderer cannot easily compute per-child styles, the same rule can be
written with sibling selectors, given `data-valign="start|center|end"` on each
non-sticky item:

```css
.sidebar-column > [data-valign="center"]:not([data-valign="center"] + *)     { margin-top: auto; }
.sidebar-column > [data-valign="center"]:not(:has(+ [data-valign="center"])) { margin-bottom: auto; }
.sidebar-column > [data-valign="end"]:not([data-valign="center"] + *):not([data-valign="end"] + *) { margin-top: auto; }
```

Caveat: the second rule needs `:has()` (Chrome 105+, Safari 15.4+, Firefox 121+). If
assessment delivery devices are older than that, use the JS rule.

## 4. Root cause 2: `position: sticky` stays in normal flow

A sticky element is, by definition, a normally positioned element whose box is
*visually* offset once its scroll container scrolls past a threshold. It still occupies
its slot in the flow. The prototype also moves a sticky-top item to index 0 (and
sticky-bottom to the last index), so the non-sticky items are laid out after / before
that slot. At rest the space looks "reserved"; while scrolled, the sticky item pins and
overlaps whatever scrolls beneath it. Both observations are the same mechanism.

Negative-margin tricks (`margin-bottom: -<height>`) are not a general fix: percent
margins resolve against the containing block **width**, so a `50%` tall sticky item
cannot be cancelled that way.

## 5. Fix 2: render sticky items in an overlay layer

Take sticky items out of the column's flow while keeping `position: sticky`:

```html
<div class="sidebar-column">
  <!-- column: display:flex; flex-direction:column; position:relative;
       overflow:visible; align-self:stretch (gives it a definite height) -->

  <!-- flow (non-sticky) items: normal flex items, fill the whole column -->
  <div class="sidebar-content"></div>
  <div class="sidebar-content"></div>

  <!-- overlay layer, only rendered when there is at least one sticky item -->
  <div class="sidebar-sticky-layer">
    <!-- layer: position:absolute; top:0; right:0; bottom:0; left:0;
         display:flex; flex-direction:column; pointer-events:none; z-index:5 -->

    <!-- sticky top: position:sticky; top:0; width:100%; pointer-events:auto -->
    <div class="sidebar-content"></div>

    <!-- sticky bottom: position:sticky; bottom:0; margin-top:auto; width:100%; pointer-events:auto -->
    <div class="sidebar-content"></div>
  </div>
</div>
```

Why this keeps sticky working:

- Sticky positioning is relative to the **nearest scrolling ancestor**, which is
  unchanged (the page / content scroll container). Absolute positioning of the parent
  layer does not interfere with that.
- A sticky element is clamped to its **containing block**, which is now the layer. The
  layer has `top/right/bottom/left: 0`, so it is exactly the column box. The sticky item
  therefore travels the same range it did before.
- The flow items never see the sticky items, so a Top-aligned flow item starts at `y=0`
  (behind the sticky-top item) and a Grow item fills the full column height.

Requirements and gotchas:

- The column must be `position: relative` and must have a **definite height**. In the
  prototype it gets one from `align-self: stretch` inside the row (SidebarPage), whose
  height comes from the tallest sibling (the passage).
- **No `overflow: hidden | auto | scroll` on any ancestor** between the sticky item and
  the intended scroll container. The prototype's column is explicitly `overflow: visible`
  for this reason. This is the most common way sticky silently stops working.
- The layer has `pointer-events: none` so clicks and drag-and-drop pass through to flow
  items and the column; each sticky item sets `pointer-events: auto` so it can still be
  selected / interacted with.
- The layer carries the `z-index` (5 in the prototype). Keep it below any page-level
  sticky toolbars.
- Treat **sticky + Grow as non-sticky**. A `flex: 1` item inside the layer would fill the
  whole column and cover everything. The prototype's `isEffectivelySticky()` returns true
  only when `sticky` is set *and* the height is fixed; the config UI already enforces
  that combination.
- Because sticky items are no longer in the flow, the outline reordering (sticky-top to
  index 0, sticky-bottom to last) is now cosmetic. It can stay for a predictable outline,
  or be removed.

## 6. Percent heights and responsiveness of the overlay layer

**Without fix 3, percent heights on sticky items resolve against the SidebarColumn.**
The overlay layer has all four inset edges pinned, so it has a definite height equal to
the column's border box, and it is a column-direction flex container. A sticky child's
`height: 100%` resolves against that height, i.e. the column, exactly as the old
in-flow layout did. Section 7 changes that for sticky items on purpose. Non-sticky
(flow) items keep resolving percent against the column. Corollary of the overlay: sticky
items no longer contribute to the column's height. A column that contains only sticky
items is as tall as the row (passage) makes it.

**Responsiveness is preserved.** No `position: fixed`, no `vh` / `vw` units, and no
measured pixel values are introduced. The layer's `inset: 0` is relative to the column
box, which is sized by normal flex layout (width from the column's flex ratio or fixed
width, height from `align-self: stretch`). When the browser narrows, the row reflows,
the column narrows, and the layer follows. When the browser gets shorter, only the
scrollport shrinks; the column's height depends on content, not viewport, and sticky
items pin inside whatever scrollport is visible, exactly as before. The only
viewport-dependent behavior is sticky pinning itself, which is inherent to
`position: sticky` and unchanged. Known, unchanged edges: a sticky item taller than the
visible scrollport overflows the viewport while pinned; a sticky-top plus sticky-bottom
whose heights exceed the visible height overlap each other.

In production, where sticky toolbars sit above the content area, the sticky-top offset
should be `top: <combined height of those toolbars>` rather than `0`, or the item slides
under them.

## 7. Fix 3: sticky percent heights mean percent of the visible area

### Why plain CSS percent cannot do it

A percent height resolves against the containing block. For a sticky item that is the
overlay layer, which is the whole column. There is no percent unit that means "the
scrollport", and `100vh` is wrong whenever the content area sits below toolbars or inside
a frame, because it includes their height. Measuring toolbars with JavaScript works but
is not self-contained.

### The fix: container query height units (`cqh`)

Mark the **scroll container** (the element that actually has the scrollbar for the content
area) as a size query container:

```css
.content-scroll-area { container-type: size; }
```

Then give sticky items their height in `cqh` instead of `%`:

```css
/* 1cqh = 1% of the height of the nearest ancestor with container-type: size */
.sidebar-content[data-sidebar-sticky] { height: 100cqh; max-height: 100%; }
```

For a scroll container, the container's box is the *visible* area (its client box), not
the scrolled content, so `100cqh` is exactly the height the user can see. The browser
recomputes it on every resize, so it is responsive with no JavaScript and no knowledge
of what sits above the content area. `max-height: 100%` clamps the item to the column
when the passage is shorter than the screen.

In the prototype the user still types a percent. `SidebarContent` translates it only for
sticky items: `50%` renders as `height: 50cqh; max-height: 100%`. Non-sticky items keep
`50%` of the column. Pixel heights are untouched. The scroll container is the
`overflow-auto` canvas div in `BuilderCanvas.tsx`, which gets `container-type: size`
inline.

### What the production environment has to provide

- **One declaration** on the scroll container: `container-type: size` (optionally with a
  `container-name`, though the units always use the nearest size container). The sidebar
  template itself stays self-contained.
- The scroll container must already get its **height and width from layout** (flex, grid,
  fixed size). `container-type: size` applies size containment, so an element whose height
  came from its content would collapse. A real scroll container gets its height from
  layout by definition, so this is normally already true.
- **Browser support:** Chrome 105+, Safari 16+, Firefox 110+ (same generation as `:has()`).
  On older browsers the `cqh` declaration is invalid and ignored, so pair it with a
  fallback (`height: 100%` first, then `height: 100cqh`) if those devices matter.
- **Toolbars inside vs. outside the scroll container.** If the frame's toolbars are
  outside the scroll container, `100cqh` is exact. If they are sticky bars *inside* the
  same scroll container, the visible area is smaller by their height; use
  `height: calc(100cqh - var(--sticky-offset))` with the same offset applied to `top`.
- **No other size container in between.** An intermediate ancestor with
  `container-type: size` would become the unit's reference. Grep for it once.
- Layout containment also makes the scroll container a stacking context and the
  containing block for any `position: fixed` descendants. Neither affects sticky, but
  check for fixed-position elements rendered inside the scroll area.

### Fallback if container queries are not available

Observe the scroll container with a `ResizeObserver`, write its `clientHeight` into a
CSS custom property on the sidebar wrapper (`--scrollport-h`), and size sticky items with
`height: calc(var(--scrollport-h) * 1px * <pct> / 100)`. This works in every browser but is
not self-contained: something must know which element is the scroll container.

## 8. Side findings in the prototype (fixed or noted)

- **Selection outline was never applied to SidebarContent.** The factory passed only
  `className` / `onClick`, not the `style` that carries the outline. Fixed by passing
  `style` through.
- **Sticky-top uses a hard-coded `top: 0`.** The builder computes `stickyPositions` for
  the URL bar / header bar / tab bar but SidebarContent does not consume it, so with those
  bars visible a sticky-top sidebar item slides under them. Not changed here; the Sidebar
  Example config hides those bars. See the production note in section 6.
- **Sticky + Grow** previously had a `minHeight: 200px` hack so the image stayed visible.
  Removed; sticky + Grow now renders as a normal flow item.

## 9. Port checklist

1. Parent (column) partitions children into `flow` and `sticky` (`sticky && fixed height`).
2. Parent computes `computeSidebarFlowHints(flow)` and passes each child its margins.
3. Item stops emitting its own alignment margins; applies the passed margins instead.
4. Column renders flow children normally, then an absolutely positioned overlay layer
   (`inset: 0`, flex column, `pointer-events: none`, z-index) containing the sticky children.
5. Sticky items: `position: sticky`, `top: <toolbar offset>` or `bottom: 0` +
   `margin-top: auto`, `width: 100%`, `pointer-events: auto`. Drop any `align-self`,
   `min-width`, or per-item `z-index` that compensated for the old flow layout.
6. Confirm no ancestor between the sticky item and the scroll container has non-visible
   overflow.
7. Add `container-type: size` to the content scroll container and render sticky percent
   heights as `Ncqh` with `max-height: 100%` (section 7).

## 10. Manual test matrix

| # | Setup | Expected |
|---|-------|----------|
| 1 | Three items, Fixed 100px, all **Bottom** | Packed flush at the column bottom, no gaps |
| 2 | Three items: Top / Center / Bottom | One at top, one vertically centered between them, one at bottom |
| 3 | Two Center + one Bottom | The two center items adjacent, centered above the bottom item |
| 4 | Any flow item set to Grow | Alignment has no effect (Grow absorbs free space); helper text explains |
| 5 | Item 1 Fixed 200px **Stick To Top**; item 2 Grow, Top | Item 2 fills the full column; its top is behind item 1 at rest; on scroll item 1 pins, item 2 scrolls beneath |
| 6 | Item Fixed 150px **Stick To Bottom** + a Bottom-aligned fixed flow item | Flow item sits at the column bottom behind the sticky item; sticky pins to the viewport bottom while scrolling |
| 7 | Click a sticky item; drop a new SidebarContent on the column | Sticky item becomes selected; drop lands on the column |
| 8 | Sticky-top item Fixed `100%`, then `50%` | Height equals the visible scroll area, then half of it (not the column, not the browser window); a non-sticky item at `50%` is still half the column |
| 9 | Resize the browser shorter with a `100%` sticky item | The sticky item shrinks to the new visible height with no reload or JS |
| 10 | Resize the browser narrower | Column and overlay stay coincident; sticky items still pin inside the smaller scrollport |
