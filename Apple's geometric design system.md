<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apple Design Token Reference</title>
  <style>
    :root {
      color-scheme: light dark;
      --space-2: 8px;
      --space-4: 16px;
      --space-6: 24px;
      --color-surface: light-dark(#ffffff, #1e1e1e);
      --color-text: light-dark(#000000, #ffffff);
      --color-border: light-dark(#e0e0e0, #404040);
      --radius-md: 8px;
    }
    
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      padding: var(--space-6);
      background: var(--color-surface);
      color: var(--color-text);
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: var(--space-4);
      font-weight: 700;
    }
    
    h2 {
      font-size: 20px;
      margin: var(--space-6) 0 var(--space-4);
      font-weight: 600;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-2);
    }
    
    .grid {
      display: grid;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    
    .token-card {
      padding: var(--space-4);
      background: light-dark(#f5f5f5, #2a2a2a);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    
    .token-name {
      font-family: 'SF Mono', monospace;
      font-size: 13px;
      color: light-dark(#0066cc, #4da6ff);
      margin-bottom: var(--space-2);
    }
    
    .token-value {
      font-size: 14px;
      color: var(--color-text);
      opacity: 0.8;
    }
    
    .spacing-visual {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
    
    .spacing-box {
      background: light-dark(#0066cc, #4da6ff);
      height: 24px;
    }
    
    .radius-visual {
      width: 80px;
      height: 80px;
      background: light-dark(#0066cc, #4da6ff);
      margin-top: var(--space-2);
    }
    
    .color-swatch {
      width: 100%;
      height: 60px;
      border-radius: 6px;
      margin-top: var(--space-2);
      border: 1px solid var(--color-border);
    }
    
    .shadow-visual {
      width: 100%;
      height: 80px;
      background: var(--color-surface);
      border-radius: 8px;
      margin-top: var(--space-2);
    }
    
    .text-visual {
      margin-top: var(--space-2);
    }
    
    code {
      background: light-dark(#f0f0f0, #333);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', monospace;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <h1>Apple Design Token Reference</h1>
  <p>Quick reference for all design tokens in the Apple Design System</p>
  
  <h2>Spacing (8pt Grid)</h2>
  <div class="grid grid-4">
    <div class="token-card">
      <div class="token-name">--space-1</div>
      <div class="token-value">4px (half-step)</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 4px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-2</div>
      <div class="token-value">8px (base)</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 8px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-3</div>
      <div class="token-value">12px (half-step)</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 12px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-4</div>
      <div class="token-value">16px</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 16px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-6</div>
      <div class="token-value">24px</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 24px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-8</div>
      <div class="token-value">32px</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 32px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-12</div>
      <div class="token-value">48px</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 48px;"></div>
      </div>
    </div>
    <div class="token-card">
      <div class="token-name">--space-16</div>
      <div class="token-value">64px</div>
      <div class="spacing-visual">
        <div class="spacing-box" style="width: 64px;"></div>
      </div>
    </div>
  </div>
  
  <h2>Border Radius</h2>
  <div class="grid grid-4">
    <div class="token-card">
      <div class="token-name">--radius-sm</div>
      <div class="token-value">4px (chips, tags)</div>
      <div class="radius-visual" style="border-radius: 4px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-md</div>
      <div class="token-value">6px</div>
      <div class="radius-visual" style="border-radius: 6px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-lg</div>
      <div class="token-value">8px (buttons)</div>
      <div class="radius-visual" style="border-radius: 8px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-xl</div>
      <div class="token-value">10px</div>
      <div class="radius-visual" style="border-radius: 10px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-2xl</div>
      <div class="token-value">12px (cards)</div>
      <div class="radius-visual" style="border-radius: 12px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-3xl</div>
      <div class="token-value">16px (modals)</div>
      <div class="radius-visual" style="border-radius: 16px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-4xl</div>
      <div class="token-value">20px</div>
      <div class="radius-visual" style="border-radius: 20px;"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--radius-full</div>
      <div class="token-value">9999px (pill)</div>
      <div class="radius-visual" style="border-radius: 9999px;"></div>
    </div>
  </div>
  
  <h2>Colors (Automatic Theme)</h2>
  <div class="grid grid-3">
    <div class="token-card">
      <div class="token-name">--color-surface-primary</div>
      <div class="token-value">Main background</div>
      <div class="color-swatch" style="background: light-dark(#ffffff, #1e1e1e);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-surface-secondary</div>
      <div class="token-value">Card backgrounds</div>
      <div class="color-swatch" style="background: light-dark(#f5f5f5, #2a2a2a);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-accent</div>
      <div class="token-value">System accent (AccentColor)</div>
      <div class="color-swatch" style="background: light-dark(#007AFF, #0A84FF);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-text-primary</div>
      <div class="token-value">Primary text</div>
      <div class="color-swatch" style="background: light-dark(#000000, #ffffff);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-text-secondary</div>
      <div class="token-value">Secondary text</div>
      <div class="color-swatch" style="background: light-dark(#666666, #a0a0a0);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-border-primary</div>
      <div class="token-value">Borders, dividers</div>
      <div class="color-swatch" style="background: light-dark(#d1d1d6, #38383a);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-success</div>
      <div class="token-value">Success states</div>
      <div class="color-swatch" style="background: light-dark(#34C759, #32D74B);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-warning</div>
      <div class="token-value">Warning states</div>
      <div class="color-swatch" style="background: light-dark(#FF9500, #FF9F0A);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--color-danger</div>
      <div class="token-value">Error states</div>
      <div class="color-swatch" style="background: light-dark(#FF3B30, #FF453A);"></div>
    </div>
  </div>
  
  <h2>Typography</h2>
  <div class="grid grid-3">
    <div class="token-card">
      <div class="token-name">--text-xs</div>
      <div class="token-value">11px</div>
      <div class="text-visual" style="font-size: 11px;">The quick brown fox</div>
    </div>
    <div class="token-card">
      <div class="token-name">--text-sm</div>
      <div class="token-value">13px</div>
      <div class="text-visual" style="font-size: 13px;">The quick brown fox</div>
    </div>
    <div class="token-card">
      <div class="token-name">--text-base</div>
      <div class="token-value">15px (default)</div>
      <div class="text-visual" style="font-size: 15px;">The quick brown fox</div>
    </div>
    <div class="token-card">
      <div class="token-name">--text-lg</div>
      <div class="token-value">17px</div>
      <div class="text-visual" style="font-size: 17px;">The quick brown fox</div>
    </div>
    <div class="token-card">
      <div class="token-name">--text-xl</div>
      <div class="token-value">20px</div>
      <div class="text-visual" style="font-size: 20px;">The quick brown fox</div>
    </div>
    <div class="token-card">
      <div class="token-name">--text-2xl</div>
      <div class="token-value">24px</div>
      <div class="text-visual" style="font-size: 24px;">The quick brown fox</div>
    </div>
  </div>
  
  <h2>Shadows</h2>
  <div class="grid grid-3">
    <div class="token-card">
      <div class="token-name">--shadow-sm</div>
      <div class="token-value">Small elevation</div>
      <div class="shadow-visual" style="box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--shadow-md</div>
      <div class="token-value">Medium elevation</div>
      <div class="shadow-visual" style="box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--shadow-lg</div>
      <div class="token-value">Large elevation</div>
      <div class="shadow-visual" style="box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--shadow-xl</div>
      <div class="token-value">Extra large</div>
      <div class="shadow-visual" style="box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--shadow-2xl</div>
      <div class="token-value">Maximum elevation</div>
      <div class="shadow-visual" style="box-shadow: 0 25px 50px rgba(0,0,0,0.15);"></div>
    </div>
    <div class="token-card">
      <div class="token-name">--shadow-inner</div>
      <div class="token-value">Inset shadow</div>
      <div class="shadow-visual" style="box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);"></div>
    </div>
  </div>
  
  <h2>Sizing & Touch Targets</h2>
  <div class="grid grid-3">
    <div class="token-card">
      <div class="token-name">--size-touch-macos</div>
      <div class="token-value">28px (min clickable)</div>
    </div>
    <div class="token-card">
      <div class="token-name">--size-touch-ios</div>
      <div class="token-value">44px (min touchable)</div>
    </div>
    <div class="token-card">
      <div class="token-name">--size-button-md</div>
      <div class="token-value">32px (standard button)</div>
    </div>
    <div class="token-card">
      <div class="token-name">--size-input-md</div>
      <div class="token-value">32px (standard input)</div>
    </div>
    <div class="token-card">
      <div class="token-name">--size-icon-md</div>
      <div class="token-value">20px (standard icon)</div>
    </div>
    <div class="token-card">
      <div class="token-name">--size-icon-lg</div>
      <div class="token-value">24px (large icon)</div>
    </div>
  </div>
  
  <h2>Quick Reference</h2>
  <div class="grid grid-2">
    <div class="token-card">
      <h3 style="margin-top: 0;">Most Common Patterns</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li><code>padding: var(--space-4)</code></li>
        <li><code>gap: var(--space-3)</code></li>
        <li><code>border-radius: var(--radius-lg)</code></li>
        <li><code>background: var(--color-surface-primary)</code></li>
        <li><code>color: var(--color-text-primary)</code></li>
        <li><code>box-shadow: var(--shadow-sm)</code></li>
      </ul>
    </div>
    <div class="token-card">
      <h3 style="margin-top: 0;">Nested Radius Formula</h3>
      <p style="margin: 0;">
        <code>outer_radius = inner_radius + padding</code>
      </p>
      <p style="margin-top: 8px; font-size: 14px; opacity: 0.8;">
        Example: Card with 16px padding and 12px radius should have inner elements with 4px radius (12 - 2×4 = 4)
      </p>
    </div>
  </div>
  
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--color-border); opacity: 0.6; text-align: center; font-size: 14px;">
    <p>This reference uses the actual design tokens. Toggle your system theme to see colors adapt automatically.</p>
  </div>
</body>
</html>
