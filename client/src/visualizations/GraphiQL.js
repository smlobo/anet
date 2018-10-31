import React from 'react'

import { IconNames } from '@blueprintjs/icons'
import GraphiQLComponent from 'graphiql'
import 'graphiql/graphiql.css'


const fetcher = function (params) {
    return fetch('/graphql', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(params),
    }).then(response => response.json())
}

export default (queryParams) => { 
    return {
        id: 'graphiql',
        icons: [IconNames.SEARCH_AROUND],
        title: `GraphiQL`,
        renderer: function (id) {
            return <GraphiQLComponent fetcher={fetcher}  variables={JSON.stringify({queryParams: queryParams})} query='
                query ($queryParams: ReportSearchQueryInput) {
                    reportList(query: $queryParams) {
                    totalCount
                    list {
                        uuid
                        location {
                        lat
                        lng
                        }
                    }
                    }
                }'/>
        }
    }
}
