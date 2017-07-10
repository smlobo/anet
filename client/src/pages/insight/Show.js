import React from 'react'
import Page from 'components/Page'

import Breadcrumbs from 'components/Breadcrumbs'

import API from 'api'

import SearchBar from 'components/SearchBar'


var d3 = null/* required later */

const graphCss = {
	width: '100%',
	height: '500px'
}

export default class InsightShow extends Page {
	static propTypes = {
		date: React.PropTypes.object,
	}

	static pageProps = {
		useNavigation: false,
		fluidContainer: true,
	}

	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			graphData: {},
			radius: function (d) { return Math.max(20,(5 +  0.3 * d.attendedReports.totalCount)) },
			nodeColor: function (d) { return d3.rgb(d.role === 'ADVISOR' ? "blue" : "green"); },
			linkWidth: function (d) { return d.meetings },
			linkLabel: function (d) { return ""+d.meetings+","+d.cancelled }
		}
	}

	previousSearchFunction = SearchBar.self.onSubmit

	componentDidMount() {
		super.componentDidMount()

		//@vassil, ugly hack to highjack the search bar from insight page
		SearchBar.self.onSubmit = event =>
		{
			API.query(
				this.constructQuery(SearchBar.self.state.query) , null, '')
				.then(data => {
				this.setState({ graphData: data })
				this.forceUpdate()
			})

		}

		if (d3) {
			return
		}

		require.ensure([], () => {
			d3 = Object.assign({}, require("d3"), require("d3-force"), require("d3-scale"));
			this.forceUpdate()
		})
	}


	componentWillUnmount() {
		SearchBar.self.onSubmit = this.previousSearchFunction
	}


	constructQuery(text)
	{
		/* GraphQL */
		let query = `personList(f:getAll, pageNum:0, pageSize:10000)
		  	{
		    	list
		    	{
		    		id, name, role, attendedReports(pageSize:1000, pageNum:0)
          				{
            			totalCount
          				}
		    	}
		  	} 
			 reportList(`
		if (!text || text==="")
			query += "f:getAll"
		else
			query += "f:search, query:{text:\"" + text + "\"}"
		query += `, pageNum:0, pageSize:1000)
			{
			 	list
			 	{
					id, state, intent, cancelledReason
        			attendees
					{
            			id
          			}
				}
		  	}
		`
	return query;
	}


	fetchData(props) {
		API.query(
			this.constructQuery() , null, '')
			.then(data => {
				this.setState({ graphData: data })
			})

	}


	


	componentDidUpdate() {

		let state = this.state
		if (!state.graphData || !d3 || !state.graphData.personList) {
			return
		}

		let nodes = state.graphData.personList.list
		let links = []
		let linksTable = [];

		
		this.state.graphData.reportList.list.forEach( (report, reporti) => {
			for (let i = 0; i < report.attendees.length; i++) {
				for (let j = i + 1; j < report.attendees.length; j++) {


					let linkId = linksTable["" + report.attendees[i].id + "," + report.attendees[j].id]
					if (!linkId)
						linkId = linksTable["" + report.attendees[j].id + "," + report.attendees[i].id]
					if (!linkId) {
						link = {
							source: report.attendees[i].id,
							target: report.attendees[j].id,
							meetings: 0,
							cancelled: 0
						}
						console.log( link.source + " -> " + link.target);
						links.push(link);
						linksTable["" + report.attendees[i].id + "," + report.attendees[j].id] = links.length-1;
						linkId = links.length-1;
						linksTable.length++;
					}

					let link = links[linkId]

					if (report.cancelledReason === null)
						link.meetings = link.meetings + 1
					else
						link.cancelled = link.cancelled + 1

				}
			}
		})

		let svg = d3.select(this.svgElement),
			margin = { top: 0, right: 0, bottom: 0, left: 0 }

		let width = this.svgElement.clientWidth - margin.left - margin.right
		let height = this.svgElement.clientHeight - margin.top - margin.bottom

		this.link = svg.selectAll("line")
			.data(links)

		this.link.enter().append("line")
			.style("stroke", "black")
			.style("stroke-width",state.linkWidth)

		this.link.exit().remove()

		this.node = svg.selectAll("g.node")
			.data(nodes,d => {return  d.id})
			
		let nodeEnter = this.node.enter().append("g").attr("class","node")
		
		nodeEnter.append("circle")
			.attr("r", state.radius)
			.style("fill", function (d) { let col = state.nodeColor(d); col.opacity = 0.2; return col })
			.style("stroke-width", "2px")
			.style("stroke", state.nodeColor)

		nodeEnter.append("svg:text").text(function (d, i) {
			return d.name
		}).style("fill", "#555").style("font-family", "Arial").style("font-size", 10).attr("y", function (d) { return 9 + state.radius(d) })

		this.node.exit().remove()



		if (!this.force)
		{
			this.force = d3.forceSimulation()
			.force("charge", d3.forceManyBody().strength(-30))
			.force("link", d3.forceLink().id(function(d){return d.id}).strength(function(d){return d.meetings/13}))
			.force("center", d3.forceCenter(width / 2, height / 2))
			.on("tick", () => {
			this.link.attr("x1", function (d) {return d.source.x })
				.attr("y1", function (d) { return d.source.y })
				.attr("x2", function (d) { return d.target.x })
				.attr("y2", function (d) { return d.target.y })
			this.node.attr("transform", (d) => {
				return "translate(" + Math.max(state.radius(d), Math.min(width - state.radius(d), d.x)) + "," + Math.max(state.radius(d), Math.min(height - state.radius(d), d.y)) + ")";
			})
		})
		}

		this.force.nodes(nodes)
			.alpha(1)
			.alphaMin(.5)
			.force("link").links(links)
	
		this.force.restart()
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['Insight', '/insight']]} />
				<fieldset>
					<svg ref={el => this.svgElement = el} style={graphCss} />
				</fieldset>
			</div>
		)
	}

}
