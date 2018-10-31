import React from 'react'

import { IconNames } from '@blueprintjs/icons'
import Vega from 'react-vega'
import ContainerDimensions from 'react-container-dimensions'

function handleHover(...args){
  console.log(args)
}

export default (dataFn,spec) => { 
  return {
    id: 'vega',
    icons: [IconNames.CHART],
    title: `Chart`,
    renderer: function (id) {
        return <ContainerDimensions>
                  <Vega spec={spec} data={dataFn()} onSignalHover={handleHover}/>
               </ContainerDimensions>}
  }
}
