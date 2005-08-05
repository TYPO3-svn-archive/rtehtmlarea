/**
 * htmlArea v3.0 - Copyright (c) 2003-2005 dynarch.com
 * htmlArea v3.0 - Copyright (c) 2002-2003 interactivetools.com, inc.
 * TYPO3 htmlArea RTE - Copyright (c) 2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
 * This copyright notice MUST stay intact for use (see license.txt).
**/

/***************************************************
 *  IE-SPECIFIC FUNCTIONS
 ***************************************************/

/***************************************************
 *  FINAL IE CLEANUP
 ***************************************************/
 HTMLArea._cleanup = function (editor) {
		// nullify envent handlers
	for (var handler in editor.eventHandlers) editor.eventHandlers[handler] = null;
	for (var button in editor.btnList) editor.btnList[button][3] = null;
	for (var dropdown in editor.config.customSelects) {
		dropdown.action = null;
		dropdown.refresh = null;
	}
	editor.onGenerate = null;
	HTMLArea._editorEvent = null;
	if(editor._textArea.form) {
		editor._textArea.form.__msh_prevOnReset = null;
		editor._textArea.form._editorNumber = null;
	}
	HTMLArea.onload = null;
	if(HTMLArea._eventCache) {
		HTMLArea._eventCache.listEvents = null;
		HTMLArea._eventCache.add = null;
		HTMLArea._eventCache.flush = null;
		HTMLArea._eventCache = null;
	}
				
		// cleaning plugin handlers
	for (var i in editor.plugins) {
		var plugin = editor.plugins[i].instance;
		plugin.onGenerate = null;
		plugin.onMode = null;
		plugin.onKeyPress = null;
		plugin.onSelect = null;
		plugin.onUpdateTolbar = null;
	}
				
		// cleaning the toolbar elements
	var obj;
	for (var txt in editor._toolbarObjects) {
		obj = editor._toolbarObjects[txt];
		obj["state"] = null;
		document.getElementById(obj["elementId"])._obj = null;
	}
				
		// cleaning the statusbar elements
	if(editor._statusBarTree.hasChildNodes()) {
		for (var i = editor._statusBarTree.firstChild; i; i = i.nextSibling) {
			if (i.nodeName.toLowerCase() == "a") {
				HTMLArea._removeEvents(i, ["click", "contextmenu"], HTMLArea.statusBarHandler);
				i.el = null;
				i.editor = null;
			}
		}
	}
};

/***************************************************
 *  SELECTIONS AND RANGES
 ***************************************************/
/*
 * Get the current selection object
 */
HTMLArea.prototype._getSelection = function() {
	return this._doc.selection;
};

/*
 * Create a range for the current selection
 */
HTMLArea.prototype._createRange = function(sel) {
	if (typeof(sel) != "undefined") return sel.createRange();
	return this._doc.selection.createRange();
};

/***************************************************
 *  EVENT HANDLERS
 ***************************************************/

/*
 * Handle the backspace event in IE browsers
 */
HTMLArea.prototype.ie_checkBackspace = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	if(sel.type == "Control"){   
		var el = this.getParentElement();   
		var p = el.parentNode;   
		p.removeChild(el);   
		return true;  
	} else {
		var r2 = range.duplicate();
		r2.moveStart("character", -1);
		var a = r2.parentElement();
		if(a != range.parentElement() && /^a$/i.test(a.tagName)) {
			r2.collapse(true);
			r2.moveEnd("character", 1);
       		r2.pasteHTML('');
       		r2.select();
       		return true;
		}
	}
};
