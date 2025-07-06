# macOS Modal Component - Style Guide

## Overview

This Modal component follows Apple's macOS Human Interface Guidelines to create an authentic desktop application experience. It features native-style window controls, backdrop blur effects, and smooth animations.

## Before vs. After Comparison

### Before (Original Implementation)

```jsx
// Old Modal Component
<Dialog.Overlay asChild>
  <motion.div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
    // Simple backdrop with basic blur
  />
</Dialog.Overlay>

<Dialog.Content asChild>
  <motion.div
    className="fixed left-1/2 top-1/2 z-50 bg-white rounded-macos-lg shadow-macos-lg w-full p-6"
    // Basic card-like appearance
  >
    {showCloseButton && (
      <button className="absolute right-4 top-4">
        <X className="h-4 w-4" />
      </button>
    )}
    
    {title && (
      <Dialog.Title className="text-xl font-semibold">
        {title}
      </Dialog.Title>
    )}
    
    <div className="mt-4">
      {children}
    </div>
  </motion.div>
</Dialog.Content>
```

**Issues with Original:**
- Generic card appearance, not window-like
- Simple close button, not macOS traffic lights
- Basic backdrop blur
- No authentic macOS title bar
- Standard web typography

### After (macOS Implementation)

```jsx
// New macOS Modal Component
<Dialog.Overlay asChild>
  <motion.div
    className="fixed inset-0 z-50 bg-black/60"
    style={{
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}
    // Enhanced backdrop with 60% opacity and 20px blur
  />
</Dialog.Overlay>

<Dialog.Content asChild>
  <motion.div
    className="fixed top-1/2 left-1/2 z-[51] max-h-[80vh] overflow-hidden bg-white/95 rounded-lg border border-white/20"
    style={{
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
    }}
    // Window-like appearance with translucency
  >
    {/* macOS Title Bar */}
    <div className="relative flex items-center h-11 px-4 bg-white/80 border-b border-black/10">
      {showTrafficLights && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Authentic Traffic Light Controls */}
          <button className="w-3 h-3 rounded-full bg-gradient-to-br from-[#ff6159] to-[#ff4d43] group">
            <div className="opacity-0 group-hover:opacity-100">
              <svg><!-- Close icon --></svg>
            </div>
          </button>
          {/* Minimize and Maximize buttons */}
        </div>
      )}
      
      <Dialog.Title className="flex-1 text-center text-[13px] font-semibold text-black/85 font-sf">
        {title}
      </Dialog.Title>
    </div>

    {/* Modal Body */}
    <div className="p-5 bg-white/95">
      {children}
    </div>
  </motion.div>
</Dialog.Content>
```

**Improvements in New Version:**
- ✅ Authentic macOS window appearance
- ✅ Traffic light controls (red, yellow, green)
- ✅ Proper title bar with SF Pro typography
- ✅ Enhanced backdrop blur (20px)
- ✅ Window translucency with backdrop-filter
- ✅ Correct sizing and proportions
- ✅ Hover states for controls
- ✅ Smooth 200ms animations

## Design Specifications

### Colors

```css
/* Traffic Light Controls */
--close-button: linear-gradient(135deg, #ff6159 0%, #ff4d43 100%);
--minimize-button: linear-gradient(135deg, #ffbd2e 0%, #ffab00 100%);
--maximize-button: linear-gradient(135deg, #00ca4e 0%, #28cd41 100%);

/* Window Colors */
--window-background: rgba(255, 255, 255, 0.95);
--titlebar-background: rgba(255, 255, 255, 0.8);
--backdrop-color: rgba(0, 0, 0, 0.6);
--border-color: rgba(255, 255, 255, 0.2);
```

### Typography

```css
/* Title Bar Text */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
font-size: 13px;
font-weight: 600;
letter-spacing: -0.01em;
color: rgba(0, 0, 0, 0.85);
```

### Spacing & Layout

```css
/* Modal Dimensions */
--modal-small: 20rem (320px);
--modal-medium: 24rem (384px);
--modal-large: 28rem (448px);

/* Title Bar */
--titlebar-height: 44px;
--titlebar-padding: 16px;

/* Traffic Lights */
--control-size: 12px;
--control-gap: 8px;
--control-left-margin: 16px;

/* Content */
--content-padding: 20px;
--max-height: 80vh;
```

### Animation Easing

```css
/* Recommended Easing Functions */
--ease-out-quart: cubic-bezier(0.25, 0.1, 0.25, 1);
--duration-modal: 200ms;
--duration-control-hover: 150ms;

/* Animation States */
.modal-enter {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### Backdrop Effects

```css
/* Backdrop Blur */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* Window Translucency */
backdrop-filter: blur(40px);
-webkit-backdrop-filter: blur(40px);

/* Shadow Stack */
box-shadow: 
  0 0 0 0.5px rgba(0, 0, 0, 0.1),
  0 4px 20px rgba(0, 0, 0, 0.15),
  0 25px 50px rgba(0, 0, 0, 0.25);
```

## Usage Guidelines

### When to Use Traffic Lights
- ✅ **Use for primary modal dialogs** that represent a window or document
- ✅ **Use when minimize functionality is available** (e.g., move to dock)
- ❌ **Don't use for simple confirmations** or alerts
- ❌ **Don't use for form modals** without window-like behavior

### Size Guidelines
- **Small (320px)**: Simple confirmations, alerts
- **Medium (384px)**: Standard forms, information dialogs
- **Large (448px)**: Complex forms, detailed content

### Accessibility Features
- Escape key support for closing
- Focus management
- ARIA labels for all controls
- Keyboard navigation support
- High contrast mode support
- Reduced motion support

## Implementation Notes

### Browser Support
- **Backdrop blur**: Requires modern browsers (Chrome 76+, Safari 9+, Firefox 103+)
- **Fallbacks**: Background color opacity increased when backdrop-filter unavailable
- **Performance**: GPU acceleration enabled for smooth animations

### Touch Devices
- Traffic light controls increase to 16px on touch devices
- Icons become always visible (no hover state)
- Larger touch targets for better usability

### Dark Mode Support
The component automatically adapts to system dark mode preferences:

```css
@media (prefers-color-scheme: dark) {
  --window-background: rgba(40, 40, 40, 0.95);
  --titlebar-background: rgba(50, 50, 50, 0.9);
  --text-color: rgba(255, 255, 255, 0.9);
}
```

## Testing Checklist

- [ ] Modal opens with smooth fade-in animation
- [ ] Backdrop blur is visible and consistent
- [ ] Traffic lights show hover states
- [ ] Close button functions correctly
- [ ] Minimize button calls onMinimize prop
- [ ] Escape key closes modal
- [ ] Title displays correctly in SF Pro font
- [ ] Content scrolls when exceeding max height
- [ ] Responsive behavior on mobile devices
- [ ] Dark mode styling applies correctly
- [ ] High contrast mode compatibility
- [ ] Reduced motion preferences respected

## Code Examples

### Basic Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="System Information"
  size="medium"
>
  <p>Modal content here...</p>
</Modal>
```

### Modal with Minimize
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onMinimize={() => minimizeToTray()}
  title="User Preferences"
  size="large"
>
  <form>...</form>
</Modal>
```

### Alert Modal (No Traffic Lights)
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="small"
  showTrafficLights={false}
>
  <div className="text-center">
    <p>Are you sure?</p>
  </div>
</Modal>
```