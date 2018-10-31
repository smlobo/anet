import React from 'react'

import { IconNames } from '@blueprintjs/icons'
import Leaflet from 'components/Leaflet'
import ContainerDimensions from 'react-container-dimensions'

export default (dataFn) => { 
  return {
    id: 'map',
    icons: [IconNames.MAP],
    title: `Map`,
    renderer: function (id) {
        let markers = []
        // reports.forEach(report => {
        //     if (Location.hasCoordinates(report.location)) {
        //         markers.push({id: report.uuid, lat: report.location.lat, lng: report.location.lng, name: report.intent})
        //     }
        // })
        return <ContainerDimensions>
                 <Leaflet markers={markers}/>
               </ContainerDimensions>
    }
  }
}
