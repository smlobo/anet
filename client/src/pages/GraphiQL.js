import React from 'react'
import Page, {mapDispatchToProps, propTypes as pagePropTypes} from 'components/Page'

import { connect } from 'react-redux'
import MosaicLayout from 'components/MosaicLayout'
import GraphiQLVisualizaion from 'visualizations/GraphiQL'
import MapVisualization from 'visualizations/Map'
import Vega from 'visualizations/Vega'
import {SimpleBarChart} from 'visualizations/specs'
import { DEFAULT_PAGE_PROPS } from 'actions'

class GraphiQL extends Page {

	static propTypes = {...pagePropTypes}

	constructor(props) {
 			super(props, DEFAULT_PAGE_PROPS, Object.assign({}, 	{onSearchGoToSearchPage: false}))
	}

	getData = () =>
	{
		return {
		  table: [
			{category: "A", amount: 28},
			{category: "B", amount: 55},
			{category: "C", amount: 43},
			{category: "D", amount: 91},
			{category: "E", amount: 81},
			{category: "F", amount: 53},
			{category: "G", amount: 19},
			{category: "H", amount: 87}
		  ]
		}
	}

	render() {
		const chartQueryParams = {}
		Object.assign(chartQueryParams, this.getSearchQuery())
		Object.assign(chartQueryParams, {
		  pageNum: 0,
		  pageSize: 0,  // retrieve all the filtered reports
		})

	const visualizations = [
		GraphiQLVisualizaion(chartQueryParams),
		MapVisualization(this.getData),
		Vega(this.getData,SimpleBarChart)]


	return <MosaicLayout style={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}
		visualizations={visualizations}
		initialNode={visualizations[0].id}/>
	}
}

const mapStateToProps = (state, ownProps) => ({
	searchQuery: state.searchQuery
})

export default connect(mapStateToProps, mapDispatchToProps)(GraphiQL)
