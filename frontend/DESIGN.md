# Design System Specification: High-Performance Kineticism

## 1. Overview & Creative North Star
**The Creative North Star: "The Obsidian Pulse"**
This design system moves beyond the "standard dark mode" template to create a high-performance environment that mirrors the intensity and precision of elite athletic training. We are not just building an app; we are building a digital cockpit for the human body. 

To break the "template" look, we utilize **Kinetic Layering**. Instead of a rigid grid, we lean into intentional asymmetry and overlapping elements. Hero sections should feel like editorial spreads—large, aggressive typography scale-contrasts paired with ultra-minimalist data points. The goal is to create a sense of momentum; the UI should feel like it is moving forward even when static.

---

## 2. Colors & Tonal Depth
Our palette is rooted in deep blacks to maximize contrast and focus. We treat light as a scarce resource, used only to guide the eye toward action and progress.

### The Color Tokens
*   **Background:** `#0e0e0e` (The base canvas)
*   **Primary (Action):** `#b1ff24` (The "Neon High-Vis" for peak motivation)
*   **Secondary (Information):** `#6a9cff` (Electric blue for data and coaching feedback)
*   **Surface Hierarchy:**
    *   `surface-container-lowest`: `#000000` (Recessed elements)
    *   `surface-container`: `#1a1919` (Standard cards)
    *   `surface-container-highest`: `#262626` (Active/Elevated cards)

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Traditional borders create visual "noise" that traps the eye. Instead, define boundaries through **Background Shifts**. A `surface-container-low` card sitting on a `surface` background provides all the separation a premium UI needs.

### The "Glass & Gradient" Rule
To inject "soul" into the high-tech aesthetic, use subtle linear gradients (e.g., `primary` to `primary-container`) for progress bars and primary CTAs. For floating navigation or modals, utilize **Glassmorphism**: use semi-transparent surface colors with a `20px` backdrop-blur. This ensures the athlete's data remains the context, even when navigating menus.

---

## 3. Typography: Editorial Authority
We use **Inter** as our typographic engine. The system relies on extreme scale variance to create a clear, professional hierarchy.

*   **Display (3.5rem - 2.25rem):** Reserved for "The Big Wins"—daily streaks, total weight moved, or "Workout Complete." Use `bold` weight with `-0.04em` letter spacing to feel tight and aggressive.
*   **Headlines (2rem - 1.5rem):** For section headers. Pair these with `primary` colored accents for a high-performance feel.
*   **Body (1rem - 0.75rem):** Kept clean and airy. Use `on-surface-variant` (`#adaaaa`) for secondary data to keep the interface from feeling cluttered.
*   **Labels (0.75rem - 0.6875rem):** All-caps for metadata, using `letter-spacing: 0.05em` to maintain legibility at small sizes.

---

## 4. Elevation & Depth: Tonal Layering
We abandon traditional drop shadows in favor of **Tonal Stacking**.

*   **The Layering Principle:** Depth is achieved by placing lighter surfaces on darker ones. An "inner" data card should be `surface-container-highest` placed inside a `surface-container` parent. This mimics physical layers of high-tech gear.
*   **Ambient Shadows:** If an element must float (like a Quick-Start FAB), use a wide, diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft glow, not a hard edge.
*   **The "Ghost Border" Fallback:** If a container lacks sufficient contrast, use a **Ghost Border**: `outline-variant` (`#494847`) at **15% opacity**. This provides a hint of structure without interrupting the visual flow.
*   **Glow States:** For selected items (e.g., choosing a workout plan), use the `primary` token to create a "Glow Border." This is a 1px border with a `box-shadow: 0 0 15px rgba(177, 255, 36, 0.3)`.

---

## 5. Components

### Buttons & Chips
*   **Primary Button:** Pill-shaped (`rounded-full`), `primary` background, `on-primary` text. No border.
*   **Secondary/Action Chips:** Use `surface-container-highest` with `label-md` text. For selection states, apply the "Glow Border" rather than changing the background color.

### Progress Bars (The "Kinetic" Bar)
*   **Track:** `surface-container-highest`.
*   **Indicator:** A gradient from `primary` to `secondary`. This visual transition from blue to green represents the "heat" of the workout.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines between list items. Use 16px or 24px of vertical white space to separate training sets.
*   **Nesting:** Group related exercises within a `surface-container-low` wrapper to visually bundle the data.

### Specialized AI Component: The "Coach Pulse"
A floating, glassmorphic orb or bar that uses a subtle `secondary` blue pulse animation. This indicates the AI is processing data or "listening" during a workout.

---

## 6. Do’s and Don'ts

### Do:
*   **Embrace Negative Space:** Give data room to breathe. High-end design is defined by what you leave out.
*   **Use Intentional Asymmetry:** Align text to the left but place a large, ghosted "Display" number in the background on the right to break the grid.
*   **Prioritize Legibility:** Ensure `primary` text on `surface` backgrounds meets AA accessibility standards.

### Don’t:
*   **No "Pure" Grey Borders:** Never use a solid grey line to separate content. Use tonal shifts.
*   **Avoid Flatness:** A dark UI can feel "dead" if it's purely flat. Use subtle gradients and glass blurs to provide a sense of atmospheric depth.
*   **Don't Overuse the Accent:** If everything is `primary` neon green, nothing is. Save the accent for the single most important action on the screen.