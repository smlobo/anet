import React, { Component } from 'react'
import './legacyCopyPasteInput.css'

const isIe = (navigator.userAgent.toLowerCase().indexOf("msie") !== -1 || navigator.userAgent.toLowerCase().indexOf("trident") !== -1)

class LegacyCopyPasteInput extends Component {
	constructor(props) {
		super(props)
		this.legacyCopyPasteInputRef = React.createRef()
	}

	// Focuses an element to be ready for copy/paste (used exclusively for IE)
	focusIeClipboardDiv = () => {
		document.getElementById("legacy-clipboard-contenteditable").focus()
		let range = document.createRange()
		range.selectNodeContents((document.getElementById("legacy-clipboard-contenteditable")))
		let selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
	}

	handleBeforePaste = (e) => {
		if (true) {
			this.focusIeClipboardDiv()
		}
	}

	componentDidMount() {
		if (isIe) {
			window.addEventListener('beforepaste', this.handleBeforePaste)
			window.addEventListener('paste', this.handlePaste)
		}
	}

	componentWillUnmount() {
		if (isIe) {
			window.removeEventListener('beforepaste', this.handleBeforePaste)
			window.removeEventListener('paste', this.handlePaste)
		}
	}
	// For IE, we can get/set Text or URL just as we normally would, but to get HTML, we need to let the browser perform the copy or paste
	// in a contenteditable div.
	handlePaste = () => {
		const clipboardData = window.clipboardData
		const clipboardText = clipboardData.getData('Text')
		document.getElementById("legacy-clipboard-contenteditable").innerHTML = ""
		setTimeout(function() {
			console.log('Clipboard Plain Text: ' + clipboardText)
			console.log('Clipboard HTML: ' + document.getElementById("legacy-clipboard-contenteditable").innerHTML)
			document.getElementById("legacy-clipboard-contenteditable").innerHTML = ""
		}, 0)

		return isIe
	}

	render() {
		return (isIe === false)
			? ""
			:	<div
					id="legacy-clipboard-contenteditable"
					className="legacyCopyPasteInput-hidden"
					ref={this.legacyCopyPasteInputRef}
					contentEditable />
	}
}

export default LegacyCopyPasteInput
