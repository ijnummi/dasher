import type { WidgetDefinition, WidgetProps } from '../../sdk'

interface HtmlConfig {
  html: string
}

const SAMPLE_HTML = `\
<style>
  html, body {
    margin: 0; padding: 0; height: 100%;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
  }
  .row { display: flex; gap: 1.2rem; font-size: 2.6rem; line-height: 1; }
</style>
<div class="row">🌍 🚀 🎯 ✨ 🦊</div>`

function HtmlWidget({ config }: WidgetProps<HtmlConfig>) {
  return (
    <iframe
      srcDoc={config.html}
      // allow-scripts: lets widgets run JS for dynamic content
      // no allow-same-origin: keeps the iframe in a unique origin, away from the parent
      sandbox="allow-scripts"
      className="w-full h-full border-0"
      title="HTML widget"
    />
  )
}

export const definition: WidgetDefinition<HtmlConfig> = {
  type: 'html',
  label: 'HTML',
  description: 'Renders arbitrary HTML. Edit the html config field to customize.',
  component: HtmlWidget,
  defaultConfig: { html: SAMPLE_HTML },
  defaultSize: { w: 3, h: 2 },
}

export default HtmlWidget
