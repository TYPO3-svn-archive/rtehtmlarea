/**
 * htmlArea v3.0 - Copyright (c) 2003-2005 dynarch.com
 * htmlArea v3.0 - Copyright (c) 2002-2003 interactivetools.com, inc.
 * TYPO3 htmlArea RTE - Copyright (c) 2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
 * This copyright notice MUST stay intact for use (see license.txt).
**/

/***************************************************
 *  GECKO-SPECIFIC FUNCTIONS
 ***************************************************/

/***************************************************
 *  MOZILLA/FIREFOX EDIT MODE INITILIZATION
 ***************************************************/

HTMLArea.prototype._initEditMode = function () {
		// We can't set designMode when we are in a hidden TYPO3 tab
		// Then we will set it when the tab comes in the front.
	var inTYPO3Tab = false;
	var DTMDiv = this._textArea;
	while (DTMDiv && (DTMDiv.nodeType == 1) && (DTMDiv.tagName.toLowerCase() != "body")) {
		if (DTMDiv.tagName.toLowerCase() == "div" && DTMDiv.id.indexOf("DTM-") != -1 && DTMDiv.id.indexOf("-DIV") != -1 && DTMDiv.className == "c-tablayer") {
			inTYPO3Tab = true;
			break;
		} else {
			DTMDiv = DTMDiv.parentNode;
		}
	}
	if (!HTMLArea.is_wamcom) {
		try {
			if (!(inTYPO3Tab && DTMDiv.style.display == "none")) this._doc.designMode = "on";
		} catch(e) { }
	} else {
		try { 
			this._doc.designMode = "on"; 
		} catch(e) {
			if (!(inTYPO3Tab && DTMDiv.style.display == "none")) {
				this._doc.open();
				this._doc.close();
				this._initIframeTimer = window.setTimeout("HTMLArea.initIframe(" + this._editorNumber + ");", 500);
				return false;
			}
		}
	}
		// When the TYPO3 TCA feature div2tab is used, the editor iframe may become hidden with style.display = "none"
		// This breaks the editor in Mozilla/Firefox browsers: the designMode attribute needs to be resetted after the style.display of the containing div is resetted to "block"
		// Here we rely on TYPO3 naming conventions for the div id and class name
	if (inTYPO3Tab) HTMLArea._addEvent(DTMDiv, "DOMAttrModified", HTMLArea.DTMDivHandler(this, DTMDiv));
	return true;
};

/***************************************************
 *  SELECTIONS AND RANGES
 ***************************************************/

/*
 * Get the current selection object
 */
HTMLArea.prototype._getSelection = function() {
	if(HTMLArea.is_safari) return window.getSelection();
	return this._iframe.contentWindow.getSelection();
};

/*
 * Create a range for the current selection
 */
HTMLArea.prototype._createRange = function(sel) {
	if (HTMLArea.is_safari) {
		var range = this._doc.createRange();
		if (typeof(sel) == "undefined") return range;
		switch (sel.type) {
			case "Range": 
				range.setStart(sel.baseNode,sel.baseOffset);
				range.setEnd(sel.extentNode,sel.extentOffset);
				break;
			case "Caret":
				range.setStart(sel.baseNode,sel.baseOffset);
				range.setEnd(sel.baseNode,sel.baseOffset);
				break;
			case "None":
				range.setStart(this._doc.body,0);
				range.setEnd(this._doc.body,0);
		}
		return range;
	}
	if (typeof(sel) == "undefined") return this._doc.createRange();
	try {
		return sel.getRangeAt(0);
	} catch(e) {
		return this._doc.createRange();
 	}
};


/***************************************************
 *  EVENTS HANDLERS
 ***************************************************/

/*
 * TYPO3 hidden tab handler
 */
HTMLArea.DTMDivHandler = function (editor,DTMDiv) {
	return (function(ev) {
		if(!ev) var ev = window.event;
		var target = (ev.target) ? ev.target : ev.srcElement;
		if(target == DTMDiv && editor._editMode == "wysiwyg" && DTMDiv.style.display == "block") {
			window.setTimeout( function() {
				try { editor._doc.designMode = "on"; } 
				catch(e) {
					editor._doc.open();
					editor._doc.close();
					editor.initIframe();}
				}, 20);
			HTMLArea._stopEvent(ev);
		}
	});
};

/*
 * Paste exception handler
 */
HTMLArea.prototype._mozillaPasteException = function(cmdID, UI, param) {
		// Mozilla lauches an exception, but can paste anyway on ctrl-V
		// UI is false on keyboard shortcut, and undefined on button click
	if(typeof(UI) != "undefined") {
		this._doc.execCommand(cmdID, UI, param);
		if (cmdID == "Paste" && this.config.killWordOnPaste) HTMLArea._wordClean(this._doc.body);
	} else if (this.config.enableMozillaExtension) {
		if (HTMLArea.agt.indexOf("firefox/1.") != -1) {
			if (confirm(HTMLArea.I18N.msg["Allow-Clipboard-Helper-Extension"])) {
				if (InstallTrigger.enabled()) {
					HTMLArea._mozillaXpi = new Object();
					HTMLArea._mozillaXpi["AllowClipboard Helper"] = _editor_mozAllowClipboard_url;
					InstallTrigger.install(HTMLArea._mozillaXpi,HTMLArea._mozillaInstallCallback);
				} else {
					alert(HTMLArea.I18N.msg["Mozilla-Org-Install-Not-Enabled"]);
					HTMLArea._appendToLog("WARNING [HTMLArea::execCommand]: Mozilla install was not enabled.");
					return; 
				}
			}
		} else if (confirm(HTMLArea.I18N.msg["Moz-Extension"])) {
			if (InstallTrigger.enabled()) {
				HTMLArea._mozillaXpi = new Object();
				HTMLArea._mozillaXpi["TYPO3 htmlArea RTE Preferences"] = _typo3_host_url + "/uploads/tx_rtehtmlarea/typo3_rtehtmlarea_prefs.xpi";
  				InstallTrigger.install(HTMLArea._mozillaXpi,HTMLArea._mozillaInstallCallback);
			} else {
				alert(HTMLArea.I18N.msg["Moz-Extension-Install-Not-Enabled"]);
				HTMLArea._appendToLog("WARNING [HTMLArea::execCommand]: Mozilla install was not enabled.");
				return; 
			}
		}
	} else if (confirm(HTMLArea.I18N.msg["Moz-Clipboard"])) {
		window.open("http://mozilla.org/editor/midasdemo/securityprefs.html");
	}
}

HTMLArea._mozillaInstallCallback = function(url,returnCode) {
	if (returnCode == 0) {
		if (HTMLArea._mozillaXpi["TYPO3 htmlArea RTE Preferences"]) alert(HTMLArea.I18N.msg["Moz-Extension-Success"]);
			else alert(HTMLArea.I18N.msg["Allow-Clipboard-Helper-Extension-Success"]);
		return; 
	} else {
		alert(HTMLArea.I18N.msg["Moz-Extension-Failure"]);
		HTMLArea._appendToLog("WARNING [HTMLArea::execCommand]: Mozilla install return code was: " + returnCode + ".");
		return; 
	}
};

/*
 * Backspace event handler
 */
HTMLArea.prototype.dom_checkBackspace = function() {
	var self = this;
	window.setTimeout(function() {
		self.focusEditor();
		var sel = self._getSelection();
		var range = self._createRange(sel);
		var SC = range.startContainer;
		var SO = range.startOffset;
		var EC = range.endContainer;
		var EO = range.endOffset;
		var newr = SC.nextSibling;
		if(SC.nodeType == 3) SC = SC.parentNode;
		if(!/\S/.test(SC.tagName)) {
			var p = document.createElement("p");
			while (SC.firstChild) p.appendChild(SC.firstChild);
			SC.parentNode.insertBefore(p, SC);
			SC.parentNode.removeChild(SC);
			var r = range.cloneRange();
			r.setStartBefore(newr);
			r.setEndAfter(newr);
			r.extractContents();
			if(HTMLArea.is_safari) {
				sel.empty();
				sel.setBaseAndExtent(r.startContainer,r.startOffset,r.endContainer,r.endOffset);
			} else {
				sel.removeAllRanges();
				sel.addRange(r);
			}
		}
	},10);
};

/*
 * Enter event handler
 */
HTMLArea.prototype.dom_checkInsertP = function() {
	this.focusEditor();
	var i, SC, left, right, r2,
		sel   = this._getSelection(),
		r     = this._createRange(sel),
		p     = this.getAllAncestors(),
		block = null,
		doc   = this._doc,
		body  = doc.body;

	for (i = 0; i < p.length; ++i) {
		if (HTMLArea.isBlockElement(p[i]) && !/body|html|table|tbody|tr/i.test(p[i].tagName)) {
			block = p[i];
			break;
		}
	}
	if(!r.collapsed) r.deleteContents();
	if(HTMLArea.is_safari) sel.empty();
		else sel.removeAllRanges();
	SC = r.startContainer;
	if(!block || /td/i.test(block.tagName)) {
		left = SC;
		for (i=SC;i && (i != body) && !HTMLArea.isBlockElement(i);i=HTMLArea.getPrevNode(i)) { left = i; }
		right = SC;
		for (i=SC;i && (i != body) && !HTMLArea.isBlockElement(i);i=HTMLArea.getNextNode(i)) { right = i; }
		if(left != body && right != body && !(block && left == block ) && !(block && right == block )) {
			r2 = r.cloneRange();
			r2.setStartBefore(left);
			r2.surroundContents(block = doc.createElement('p'));
			if (!/\S/.test(HTMLArea.getInnerText(block))) block.appendChild(this._doc.createElement('br'));
			block.normalize();
			r.setEndAfter(right);
			r.surroundContents(block = doc.createElement('p'));
			if (!/\S/.test(HTMLArea.getInnerText(block))) block.appendChild(this._doc.createElement('br'));
			block.normalize();
		} else { 
			if(!block) {
				r = doc.createRange();
				r.setStart(body, 0);
				r.setEnd(body, 0);
				r.insertNode(block = doc.createElement('p'));
				block.appendChild(this._doc.createElement('br'));
			} else {
				r = doc.createRange();
				r.setStart(block, 0);
				r.setEnd(block, 0);
				r.insertNode(block = doc.createElement('p'));
				block.appendChild(this._doc.createElement('br'));
			}
		}
		r.selectNodeContents(block);
	} else {
		r.setEndAfter(block);
		var df = r.extractContents(), left_empty = false;
		if(!/\S/.test(block.innerHTML)) {
			block.innerHTML = "<br />";
			left_empty = true;
		}
		p = df.firstChild;
		if (p) {
			if(!/\S/.test(HTMLArea.getInnerText(p))) {
 				if (/^h[1-6]$/i.test(p.tagName)) p = this.convertNode(p,"p");
				p.innerHTML = "<br />";
			}
			if(/^li$/i.test(p.tagName) && left_empty && !block.nextSibling) {
				left = block.parentNode;
				left.removeChild(block);
				r.setEndAfter(left);
				r.collapse(false);
				p = this.convertNode(p, /^[uo]l$/i.test(left.parentNode.tagName) ? "li" : "p");
			}
			r.insertNode(df);
			r.selectNodeContents(p);
		}
	}
	r.collapse(true);
	if(HTMLArea.is_safari) sel.setBaseAndExtent(r.startContainer,r.startOffset,r.endContainer,r.endOffset);
		else sel.addRange(r);
	//this.forceRedraw();
	this.scrollToCaret();
};
