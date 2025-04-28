<!-- views/terminal_readme.ejs -->
<div align="center" style="max-width: 700px; margin: 0 auto; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
    <!-- Terminal-style header -->
    <div style="background: var(--color-canvas-default); border: 1px solid var(--color-border-default); border-radius: 8px 8px 0 0; padding: 8px 15px; text-align: left; display: flex; gap: 8px;">
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
    </div>
    
    <!-- Terminal body with typing animation -->
    <div style="background: var(--color-canvas-subtle); border: 1px solid var(--color-border-default); border-top: none; border-radius: 0 0 8px 8px; padding: 20px; text-align: left;">
      <div style="margin-bottom: 15px;">
        <span style="color: var(--color-success-fg);">$</span> cat README.md
      </div>
      
      <div style="margin-bottom: 15px; animation: typewriter 4s steps(44) 1s 1 normal both;">
        <h1 style="color: var(--color-accent-fg); margin: 0;">git-readme-action</h1>
        <p style="margin: 10px 0 0 0;">Public repository by @KanishkChhajed</p>
      </div>
      
      <div style="margin-bottom: 15px; animation: typewriter 4s steps(44) 2s 1 normal both;">
        <span style="color: var(--color-success-fg);">$</span> gh repo stats
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; animation: fadeIn 1s ease-out 3s forwards; opacity: 0;">
        <div>Stars: <span style="color: var(--color-accent-fg);">1</span></div>
        <div>Forks: <span style="color: var(--color-accent-fg);">0</span></div>
        <div>Watchers: <span style="color: var(--color-accent-fg);">1</span></div>
        <div>Issues: <span style="color: var(--color-accent-fg);">3 open</span></div>
      </div>
      
      <div style="margin-bottom: 15px; animation: typewriter 4s steps(44) 4s 1 normal both;">
        <span style="color: var(--color-success-fg);">$</span> gh lang breakdown
      </div>
      
      <div style="margin-bottom: 20px; animation: fadeIn 1s ease-out 5s forwards; opacity: 0;">
        
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 10px; height: 10px; background: var(--color-accent-fg); margin-right: 8px;"></div>
            <div style="flex: 1;"></div>
            <div>%</div>
          </div>
        
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 10px; height: 10px; background: var(--color-accent-fg); margin-right: 8px;"></div>
            <div style="flex: 1;"></div>
            <div>%</div>
          </div>
        
      </div>
      
      <div style="animation: blink 1s step-end infinite; color: var(--color-success-fg);">
        █
      </div>
    </div>
  </div>
  
  <style>
    @keyframes typewriter {
      from { width: 0; }
      to { width: 100%; }
    }
    @keyframes blink {
      from, to { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }
  </style>