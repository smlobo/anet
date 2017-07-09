import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'
import moment from 'moment'

import { DropdownButton, MenuItem, Modal, Alert, Button } from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import ReportSummary from 'components/ReportSummary'
import Form from 'components/Form'

import API from 'api'
import { Report } from 'models'

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
			radius: function (d) { return 7 + 1.4 * d.attendedReports.totalCount },
			nodeColor: function (d) { return d3.rgb(d.role === 'ADVISOR' ? "blue" : "green"); },
			linkWidth: function (d) { return d.meetings },
			linkLabel: function (d) { return ""+d.meetings+","+d.cancelled }
		}
	}

	componentDidMount() {
		super.componentDidMount()

		if (d3) {
			return
		}

		require.ensure([], () => {
			d3 = Object.assign({}, require("d3"), require("d3-force"), require("d3-scale"));
			this.forceUpdate()
		})
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			personList(f:getAll, pageNum:0, pageSize:10)
		  {
		    list
		    {
		    id, name, role, attendedReports(pageSize:1000, pageNum:0)
          {
            totalCount
          }
		    }
		  }

		  reportList(f:getAll, pageNum:0, pageSize:10)
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
		`, null, '')
			.then(data => {
				this.setState({ graphData: data })
			})

	}

	componentDidUpdate() {

		let state = this.state;
		if (!state.graphData || !d3) {
			return
		}

		let nodes = state.graphData.personList.list;
		let linksTable = [];
		let links = [];
		this.state.graphData.reportList.list.forEach(function (report, reporti) {
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
						};
						links.push(link);
						linksTable["" + report.attendees[i].id + "," + report.attendees[j].id] = links.length-1;
						linkId = links.length-1;
						linksTable.length++;
					}

					let link = links[linkId]

					if (report.cancelledReason === null)
						link.meetings = link.meetings + 1;
					else
						link.cancelled = link.cancelled + 1;

				}
			}
		});

		let svg = d3.select(this.svgElement),
			margin = { top: 0, right: 0, bottom: 0, left: 0 },
			width = this.svgElement.clientWidth - margin.left - margin.right,
			height = this.svgElement.clientHeight - margin.top - margin.bottom

		let link = svg.selectAll("line")
			.data(links)
			.enter().append("line")
			.style("stroke", "black")
			.style("stroke-width",state.linkWidth)

		let node = svg.selectAll("g.node")
			.data(nodes)
			.enter().append("g").attr("class","node")

		node.append("circle")
			.attr("r", state.radius)
			.style("fill", function (d) { let col = state.nodeColor(d); col.opacity = 0.2; return col })
			.style("stroke-width", "2px")
			.style("stroke", state.nodeColor)

		node.append("svg:text").text(function (d, i) {
			return d.name
		}).style("fill", "#555").style("font-family", "Arial").style("font-size", 10).attr("y", function (d) { return 9 + state.radius(d) })

		var force = d3.forceSimulation(nodes)
			.force("charge", d3.forceManyBody().strength(-100))
			.force("link", d3.forceLink(links).strength(function(d){return d.meetings/13}))
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("collide", d3.forceCollide(state.radius).strength(.1))
			.on("tick", tick)

		function tick() {
			node.attr("transform", function (d) {
				return "translate(" + Math.max(state.radius(d), Math.min(width - state.radius(d), d.x)) + "," + Math.max(state.radius(d), Math.min(height - state.radius(d), d.y)) + ")";
			});
			link.attr("x1", function (d) { return d.source.x; })
				.attr("y1", function (d) { return d.source.y; })
				.attr("x2", function (d) { return d.target.x; })
				.attr("y2", function (d) { return d.target.y; });
		}
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
