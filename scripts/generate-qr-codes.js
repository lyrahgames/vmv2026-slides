import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import QRCodeStyling from 'qr-code-styling'
import { JSDOM } from 'jsdom'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const outputDirectory = join(projectRoot, 'public', 'generated', 'qr')
const svgNamespace = 'http://www.w3.org/2000/svg'

const githubMark = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z'
const globeMark = 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.92 9h-3.04a15.7 15.7 0 0 0-1.2-5.02A8.03 8.03 0 0 1 18.92 11ZM12 4c.83 1.2 1.57 3.35 1.84 7h-3.68c.27-3.65 1.01-5.8 1.84-7ZM9.32 5.98A15.7 15.7 0 0 0 8.12 11H5.08a8.03 8.03 0 0 1 4.24-5.02ZM5.08 13h3.04c.16 1.9.56 3.64 1.2 5.02A8.03 8.03 0 0 1 5.08 13ZM12 20c-.83-1.2-1.57-3.35-1.84-7h3.68c-.27 3.65-1.01 5.8-1.84 7Zm2.68-1.98c.64-1.38 1.04-3.12 1.2-5.02h3.04a8.03 8.03 0 0 1-4.24 5.02Z'

const presentationMark = {
  // Carbon's presentation-file icon: a screen with a simple chart inside.
  path: 'M15 10h2v8h-2zm5 4h2v4h-2zm-10-2h2v6h-2zM25 4h-8V2h-2v2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v6h-4v2h10v-2h-4v-6h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H7V6h18Z',
  viewBoxWidth: 32,
  viewBoxHeight: 32,
}

const repositories = [
  {
    fileName: 'slides',
    url: 'https://lyrahgames.github.io/vmv2026-slides',
  },
  {
    fileName: 'demo',
    url: 'https://github.com/lyrahgames/vmv2026-demo',
  },
]

function appendElement(document, parent, tagName, attributes) {
  const element = document.createElementNS(svgNamespace, tagName)

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value))
  }

  parent.appendChild(element)
  return element
}

function addCenterBranding(svg, width, height, mark) {
  const document = svg.ownerDocument
  const centerX = width / 2
  const centerY = height / 2
  const panelSize = 132
  const iconSize = 76

  appendElement(document, svg, 'rect', {
    x: 14,
    y: 14,
    width: width - 28,
    height: height - 28,
    rx: 24,
    fill: 'none',
    stroke: '#000',
    'stroke-width': 8,
  })

  appendElement(document, svg, 'rect', {
    x: centerX - panelSize / 2,
    y: centerY - panelSize / 2,
    width: panelSize,
    height: panelSize,
    rx: 30,
    fill: '#fff',
    stroke: '#000',
    'stroke-width': 6,
  })

  appendElement(document, svg, 'path', {
    d: mark.path ?? mark,
    fill: '#000',
    transform: `translate(${centerX - iconSize / 2} ${centerY - iconSize / 2}) scale(${iconSize / (mark.viewBoxWidth ?? 16)} ${iconSize / (mark.viewBoxHeight ?? 16)})`,
  })
}

export async function generateQrCodes() {
  await mkdir(outputDirectory, { recursive: true })

  for (const repository of repositories) {
    const qrCode = new QRCodeStyling({
      type: 'svg',
      width: 480,
      height: 480,
      data: repository.url,
      margin: 34,
      jsdom: JSDOM,
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
      dotsOptions: {
        type: 'rounded',
        color: '#000',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#000',
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#000',
      },
      backgroundOptions: {
        color: '#fff',
      },
    })

    qrCode.applyExtension((svg, options) => {
      addCenterBranding(svg, options.width, options.height, repository.fileName === 'slides' ? presentationMark : githubMark)
    })

    const svg = await qrCode.getRawData('svg')
    const outputPath = join(outputDirectory, `${repository.fileName}.svg`)
    await writeFile(outputPath, svg)
    console.log(`Generated ${outputPath}`)
  }
}
