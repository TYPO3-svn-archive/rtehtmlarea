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

/*
 * Select a node AND the contents inside the node
 */
HTMLArea.prototype.selectNode = function(node) {
	this.focusEditor();
	this.forceRedraw();
	var sel = this._getSelection();
	var range = this._doc.createRange();
	if(node.nodeType == 1 && node.tagName.toLowerCase() == "body") range.selectNodeContents(node);
		else range.selectNode(node);
	if(HTMLArea.is_safari) {
		sel.empty();
		sel.setBaseAndExtent(range.startContainer,range.startOffset,range.endContainer,range.endOffset);
	} else {
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

/*
 * Select ONLY the contents inside the given node
 */
HTMLArea.prototype.selectNodeContents = function(node,pos) {
	this.focusEditor();
	this.forceRedraw();
	var collapsed = (typeof(pos) != "undefined");
	var sel = this._getSelection();
	var range = this._doc.createRange();
	range.selectNodeContents(node);
	(collapsed) && range.collapse(pos);
	if(HTMLArea.is_safari) {
		sel.empty();
		sel.setBaseAndExtent(range.startContainer,range.startOffset,range.endContainer,range.endOffset);
	} else {
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

/*
 * Retrieve the HTML contents of selected block
 */
HTMLArea.prototype.getSelectedHTML = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	var cloneContents = "";
	try {cloneContents = range.cloneContents();} catch(e) { }
	return (cloneContents ? HTMLArea.getHTML(cloneContents,false,this) : "");
};

/*
 * Retrieve simply HTML contents of the selected block, IE ignoring control ranges
 */
HTMLArea.prototype.getSelectedHTMLContents = function() {
	return this.getSelectedHTML();
};

/*
 * Get the deepest node that contains both endpoints of the current selection.
 */
HTMLArea.prototype.getParentElement = function(sel) {
	if(!sel) var sel = this._getSelection();
	var range = this._createRange(sel);
	try {
		var p = range.commonAncestorContainer;
		if(!range.collapsed && range.startContainer == range.endContainer &&
		    range.startOffset - range.endOffset <= 1 && range.startContainer.hasChildNodes())
			p = range.startContainer.childNodes[range.startOffset];
		while (p.nodeType == 3) {p = p.parentNode;}
		return p;
	} catch (e) {
		return this._doc.body;
	}
};

/***************************************************
 *  DOM TREE MANIPULATION
 ***************************************************/

 /*
 * Insert a node at the current position.
 * Delete the current selection, if any.
 * Split the text node, if needed.
 */
HTMLArea.prototype.insertNodeAtSelection = function(toBeInserted) {
	this.focusEditor();
	var sel = this._getSelection(),
		range = this._createRange(sel),
		node = range.startContainer,
		pos = range.startOffset,
		selnode = toBeInserted;
	if(HTMLArea.is_safari) sel.empty();
		else sel.removeAllRanges();
	range.deleteContents();
	switch (node.nodeType) {
	    case 3: // Node.TEXT_NODE: we have to split it at the caret position.
		if(toBeInserted.nodeType == 3) {
			node.insertData(pos,toBeInserted.data);
			range = this._createRange();
			range.setEnd(node, pos + toBeInserted.length);
			range.setStart(node, pos + toBeInserted.length);
			if(HTMLArea.is_safari) sel.setBaseAndExtent(range.startContainer,range.startOffset,range.endContainer,range.endOffset);
				else sel.addRange(range);
		} else {
			node = node.splitText(pos);
			if(toBeInserted.nodeType == 11) selnode = selnode.firstChild;
			node = node.parentNode.insertBefore(toBeInserted,node);
			this.selectNodeContents(selnode);
			this.updateToolbar();
		}
		break;
	    case 1:
		if(toBeInserted.nodeType == 11) selnode = selnode.firstChild;
		node = node.insertBefore(toBeInserted,node.childNodes[pos]);
		this.selectNodeContents(selnode);
		this.updateToolbar();
		break;
	}
};

/* 
 * Insert HTML source code at the current position.
 * Delete the current selection, if any.
 */
HTMLArea.prototype.insertHTML = function(html) {
	this.focusEditor();
	var fragment = this._doc.createDocumentFragment();
	var div = this._doc.createElement("div");
	div.innerHTML = html;
	while (div.firstChild) {fragment.appendChild(div.firstChild);}
	this.insertNodeAtSelection(fragment);
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
HTMLArea.prototype._checkBackspace = function() {
	var self = this;
	//window.setTimeout(function() {
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
			return true;
		}
	//},10);
	return false;
};

/*
 * Enter event handler
 */
HTMLArea.prototype._checkInsertP = function() {
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

/*
 * Detect emails and urls as they are typed in Mozilla
 * Borrowed from Xinha (is not htmlArea) - http://xinha.gogo.co.nz/
 */
 // Not yet revised for Safari
HTMLArea.prototype._detectURL = function(ev) {
	var editor = this;
	var s = editor._getSelection();
	var autoWrap = function (textNode, tag) {
		var rightText = textNode.nextSibling;
		if (typeof(tag) == 'string') tag = editor._doc.createElement(tag);
		var a = textNode.parentNode.insertBefore(tag, rightText);
		textNode.parentNode.removeChild(textNode);
		a.appendChild(textNode);
		rightText.data = ' ' + rightText.data;
		s.collapse(rightText, 1);
		HTMLArea._stopEvent(ev);

		editor._unLink = function() {
			var t = a.firstChild, parent = a.parentNode;
			a.removeChild(t);
			parent.insertBefore(t, a);
			parent.removeChild(a);
			editor._unLink = null;
			editor._unlinkOnUndo = false;
		};
		
		editor._unlinkOnUndo = true;
		return a;
	};

	switch(ev.which) {
			// Space, see if the text just typed looks like a URL, or email address and link it appropriatly
		case 32:
			if(s && s.isCollapsed && s.anchorNode.nodeType == 3 && s.anchorNode.data.length > 3 && s.anchorNode.data.indexOf('.') >= 0) {
				var midStart = s.anchorNode.data.substring(0,s.anchorOffset).search(/\S{4,}$/);
				if(midStart == -1) break;
				if(editor._getFirstAncestor(s, 'a')) break; // already in an anchor
				var matchData = s.anchorNode.data.substring(0,s.anchorOffset).replace(/^.*?(\S*)$/, '$1');
				var m = matchData.match(HTMLArea.RE_email);
				if(m) {
					var leftText  = s.anchorNode;
					var rightText = leftText.splitText(s.anchorOffset);
					var midText   = leftText.splitText(midStart);
					autoWrap(midText, 'a').href = 'mailto:' + m[0];
					break;
				}
				var m = matchData.match(HTMLArea.RE_url);
				if(m) {
					var leftText  = s.anchorNode;
					var rightText = leftText.splitText(s.anchorOffset);
					var midText   = leftText.splitText(midStart);
					autoWrap(midText, 'a').href = (m[1] ? m[1] : 'http://') + m[2];
					break;
				}
			}
			break;
		default:
			if(ev.keyCode == 27 || (editor._unlinkOnUndo && ev.ctrlKey && ev.which == 122) ) {
				if(editor._unLink) {
					editor._unLink();
					HTMLArea._stopEvent(ev);
				}
				break;
			} else if(ev.which || ev.keyCode == 8 || ev.keyCode == 46) {
				editor._unlinkOnUndo = false;
				if(s.anchorNode && s.anchorNode.nodeType == 3) {
						// See if we might be changing a link
					var a = editor._getFirstAncestor(s, 'a');
					if(!a) break; // not an anchor
					if(!a._updateAnchTimeout) {
						if(s.anchorNode.data.match(HTMLArea.RE_email) && (a.href.match('mailto:' + s.anchorNode.data.trim()))) {
							var textNode = s.anchorNode;
							var fn = function() {
								a.href = 'mailto:' + textNode.data.trim();
								a._updateAnchTimeout = setTimeout(fn, 250);
							};
							a._updateAnchTimeout = setTimeout(fn, 250);
							break;
						}
						var m = s.anchorNode.data.match(HTMLArea.RE_url);
						if(m &&  a.href.match(s.anchorNode.data.trim())) {
							var textNode = s.anchorNode;
							var fn = function() {
								var m = textNode.data.match(HTMLArea.RE_url);
								a.href = (m[1] ? m[1] : 'http://') + m[2];
								a._updateAnchTimeout = setTimeout(fn, 250);
							}
							a._updateAnchTimeout = setTimeout(fn, 250);
						}
					}
				}
			}
			break;
	}
};
