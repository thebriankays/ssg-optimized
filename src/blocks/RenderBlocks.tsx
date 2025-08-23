import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TravelDataGlobeBlock } from '@/blocks/TravelDataGlobe/Component'
import { BackgroundBlock } from '@/blocks/Background/Component'
import { WebGLTextBlock } from '@/blocks/WebGLText/Component'
import { AreaExplorerBlock } from '@/blocks/AreaExplorer/Component'
import { StorytellingBlock } from '@/blocks/Storytelling/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { DestinationDetailBlock } from '@/blocks/DestinationDetailBlock/Component'
import { WhatameshBlock } from '@/blocks/Whatamesh/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  'travel-data-globe': TravelDataGlobeBlock,
  background: BackgroundBlock,
  'webgl-text': WebGLTextBlock,
  'area-explorer': AreaExplorerBlock,
  storytelling: StorytellingBlock,
  banner: BannerBlock,
  code: CodeBlock,
  destinationDetailBlock: DestinationDetailBlock,
  whatamesh: WhatameshBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
