// Table Operations Plugin for HTMLArea-3.0
// Implementation by Mihai Bazon.  Sponsored by http://www.bloki.com
// Substantially rewritten by Stanislas Rolland <stanislas.rolland@fructifor.com>. Sponsored by Fructifor Inc.
// Copyright (c) 2002 interactivetools.com, inc.
// Copyright (c) 2004-2005 Stanislas Rolland
// Copyright (c) 2005 Xinha, http://xinha.gogo.co.nz/ for the original toggle borders function
// This notice MUST stay intact for use (see license.txt).
/*
 * Initialize the plugin and register its buttons
 */
TableOperations = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var bl = TableOperations.btnList;
	var self = this;
	var hideInToolbar = _tableOperations_hideInToolbar;
	for(var i=0;i < bl.length;++i) {
		var btn = bl[i];
		var id = "TO-" + btn[0];
		cfg.registerButton(id,TableOperations_langArray[id],editor.imgURL(btn[0] + ".gif","TableOperations"),false,
			function(editor,id) {self.buttonPress(editor,id);},btn[1],hideInToolbar);
	}
};
/*
 * Set the language file for the plugin
 */
TableOperations.I18N = TableOperations_langArray;
/*
 * The information about the plugin
 */
TableOperations._pluginInfo = {
	name			: "TableOperations",
	version 		: "3.0",
	developer 		: "Mihai Bazon & Stanislas Rolland",
	developer_url 	: "http://dynarch.com/mishoo/",
	c_owner 		: "Mihai Bazon & Stanislas Rolland",
	sponsor 		: "Zapatec Inc. & Fructifor Inc.",
	sponsor_url 	: "http://www.bloki.com",
	license 		: "htmlArea"
};
/*
 * The list of buttons added by this plugin
 */
TableOperations.btnList = [
	["toggle-borders",       null],
	["table-prop",       "table"],
	["row-prop",         "tr"],
	["row-insert-above", "tr"],
	["row-insert-under", "tr"],
	["row-delete",       "tr"],
	["row-split",        "td[rowSpan!=1]"],
	["col-insert-before", "td"],
	["col-insert-after",  "td"],
	["col-delete",        "td"],
	["col-split",         "td[colSpan!=1]"],
	["cell-prop",          "td"],
	["cell-insert-before", "td"],
	["cell-insert-after",  "td"],
	["cell-delete",        "td"],
	["cell-merge",         "tr"],
	["cell-split",         "td[colSpan!=1,rowSpan!=1]"]
	];

/************************
 * UTILITIES
 ************************/

// retrieves the closest element having the specified tagName in the list of
// ancestors of the current selection/caret.
TableOperations.prototype.getClosest = function(tagName) {
	var editor = this.editor;
	var ancestors = editor.getAllAncestors();
	var ret = null;
	tagName = ("" + tagName).toLowerCase();
	for(var i=0; i < ancestors.length;++i) {
		var el = ancestors[i];
		if (el.tagName.toLowerCase() == tagName) {
			ret = el;
			break;
		}
	}
	return ret;
};

// this function requires the file PopupWin to be loaded from browser
TableOperations.prototype.dialogTableProperties = function() {
	var editor = this.editor;
		// retrieve existing values
	var table = this.getClosest("table");

	var dialog = new PopupWin(this.editor, TableOperations.I18N["Table Properties"], function(dialog, params) {
		dialog.editor.focusEditor();
		TableOperations.processStyle(params, table);
		for (var i in params) {
			var val = params[i];
			switch (i) {
			    case "f_caption":
				if (/\S/.test(val)) {
					// contains non white-space characters
					var caption = table.getElementsByTagName("caption")[0];
					if (!caption) {
						caption = dialog.editor._doc.createElement("caption");
						table.insertBefore(caption, table.firstChild);
					}
					caption.innerHTML = val;
				} else {
					// search for caption and delete it if found
					var caption = table.getElementsByTagName("caption")[0];
					if (caption) {
						caption.parentNode.removeChild(caption);
					}
				}
				break;
			    case "f_summary":
				table.summary = val;
				break;
			    case "f_width":
				table.style.width = ("" + val) + params.f_unit;
				break;
			    case "f_align":
				table.align = val;
				break;
			    case "f_spacing":
				table.cellSpacing = val;
				break;
			    case "f_padding":
				table.cellPadding = val;
				break;
			    case "f_frames":
				table.frame = (val != "not set") ? val : "";
				break;
			    case "f_rules":
				table.rules = (val != "not set") ? val : "";
				break;
			    case "f_class":
				if(val != 'none'){
					table.className = val;
				} else if(table.className) {
					if(HTMLArea.is_gecko) {
						table.removeAttribute('class');
					} else {
						table.removeAttribute('className');
					}
				}
				break;
			}
		}
		dialog.editor.forceRedraw();
		dialog.editor.focusEditor();
		dialog.editor.updateToolbar();
			// Apparently required to force Mozilla to redraw borders
		if(HTMLArea.is_gecko) {
			var save_collapse = table.style.borderCollapse;
			table.style.borderCollapse = "collapse";
			table.style.borderCollapse = "separate";
			table.style.borderCollapse = save_collapse;
		}
	},

		// this function gets called when the dialog needs to be initialized
	function (dialog) {
		TableOperations.buildTitle(dialog.doc, TableOperations.I18N, dialog.content, "Table Properties");
		TableOperations.buildDescriptionFieldset(dialog.doc, table, TableOperations.I18N, dialog.content);
		var obj = dialog.editor.config.customSelects["DynamicCSS-class"];
		if (obj && obj.loaded) {
			var cssArray = obj.cssArray;
			TableOperations.buildStylingFieldset(dialog.doc, table, TableOperations.I18N, dialog.content, cssArray);
		}
		TableOperations.buildLayoutFieldset(dialog.doc, table, TableOperations.I18N, dialog.content);
		TableOperations.buildAlignmentFieldset(dialog.doc, table, TableOperations.I18N, dialog.content, "floating");
		TableOperations.buildSpacingFieldset(dialog.doc, table, TableOperations.I18N, dialog.content);
		TableOperations.buildBordersFieldset(dialog.dialogWindow, dialog.doc, dialog.editor, table, TableOperations.I18N, dialog.content);
		TableOperations.buildColorsFieldset(dialog.dialogWindow, dialog.doc, dialog.editor, table, TableOperations.I18N, dialog.content);
		dialog.modal = true;
		dialog.addButtons("ok", "cancel");
		dialog.showAtElement();
	}, 520, 585);
};

// this function requires the file PopupDiv/PopupWin to be loaded from browser
TableOperations.prototype.dialogRowCellProperties = function(cell) {
	// retrieve existing values
	var element = this.getClosest(cell ? "td" : "tr");
	var table = this.getClosest("table");
	if(element) {
	   var dialog = new PopupWin(this.editor, TableOperations.I18N[cell ? "Cell Properties" : "Row Properties"], function(dialog, params) {
		dialog.editor.focusEditor();
		TableOperations.processStyle(params, element);
		for (var i in params) {
			var val = params[i];
			switch (i) {
			    case "f_align":
				element.align = val;
				break;
			    case "f_char":
				element.ch = val;
				break;
			    case "f_valign":
				element.vAlign = val;
				break;
			    case "f_class":
				if(val != 'none'){
					element.className = val;
				} else if(element.className) {
					if(HTMLArea.is_gecko) {
						element.removeAttribute('class');
					} else {
						element.removeAttribute('className');
					}
				}
				break;
			}
		}
		dialog.editor.forceRedraw();
		dialog.editor.focusEditor();
		dialog.editor.updateToolbar();
			// Apparently required to force Mozilla to redraw borders
		if(HTMLArea.is_gecko) {
			var save_collapse = table.style.borderCollapse;
			table.style.borderCollapse = "collapse";
			table.style.borderCollapse = "separate";
			table.style.borderCollapse = save_collapse;
		}
	},

		// this function gets called when the dialog needs to be initialized
	function (dialog) {
		TableOperations.buildTitle(dialog.doc, TableOperations.I18N, dialog.content, (cell ? "Cell Properties" : "Row Properties"));
		var obj = dialog.editor.config.customSelects["DynamicCSS-class"];
		if (obj && obj.loaded) {
			var cssArray = obj.cssArray;
			TableOperations.buildStylingFieldset(dialog.doc, element, TableOperations.I18N, dialog.content, cssArray);
		} else {
			TableOperations.insertSpace(dialog.doc,dialog.content);
		}
		TableOperations.buildLayoutFieldset(dialog.doc, element, TableOperations.I18N, dialog.content, "floating");
		TableOperations.buildAlignmentFieldset(dialog.doc, element, TableOperations.I18N, dialog.content);
		TableOperations.buildBordersFieldset(dialog.dialogWindow, dialog.doc, dialog.editor, element, TableOperations.I18N, dialog.content);
		TableOperations.buildColorsFieldset(dialog.dialogWindow, dialog.doc, dialog.editor, element, TableOperations.I18N, dialog.content);
		dialog.addButtons("ok", "cancel");
		dialog.modal = true;
		//if(!HTMLArea.is_gecko) dialog.showAtElement();
		dialog.showAtElement();
	   }, 560, 380);
	}
};

// this function gets called when some button from the TableOperations toolbar
// was pressed.
TableOperations.prototype.buttonPress = function(editor,button_id) {
	this.editor = editor;
	var mozbr = HTMLArea.is_gecko ? "<br />" : "";

	// helper function that clears the content in a table row
	function clearRow(tr) {
		var tds = tr.getElementsByTagName("td");
		for (var i = tds.length; --i >= 0;) {
			var td = tds[i];
			td.rowSpan = 1;
			td.innerHTML = mozbr;
		}
	};

	function splitRow(td) {
		var n = parseInt("" + td.rowSpan);
		var nc = parseInt("" + td.colSpan);
		td.rowSpan = 1;
		tr = td.parentNode;
		var itr = tr.rowIndex;
		var trs = tr.parentNode.rows;
		var index = td.cellIndex;
		while (--n > 0) {
			tr = trs[++itr];
			var otd = editor._doc.createElement("td");
			otd.colSpan = td.colSpan;
			otd.innerHTML = mozbr;
			tr.insertBefore(otd, tr.cells[index]);
		}
		editor.forceRedraw();
		editor.updateToolbar();
	};

	function splitCol(td) {
		var nc = parseInt("" + td.colSpan);
		td.colSpan = 1;
		tr = td.parentNode;
		var ref = td.nextSibling;
		while (--nc > 0) {
			var otd = editor._doc.createElement("td");
			otd.rowSpan = td.rowSpan;
			otd.innerHTML = mozbr;
			tr.insertBefore(otd, ref);
		}
		editor.forceRedraw();
		editor.updateToolbar();
	};

	function splitCell(td) {
		var nc = parseInt("" + td.colSpan);
		splitCol(td);
		var items = td.parentNode.cells;
		var index = td.cellIndex;
		while (nc-- > 0) {
			splitRow(items[index++]);
		}
	};

	function selectNextNode(el) {
		var node = el.nextSibling;
		while (node && node.nodeType != 1) {
			node = node.nextSibling;
		}
		if (!node) {
			node = el.previousSibling;
			while (node && node.nodeType != 1) {
				node = node.previousSibling;
			}
		}
		if (!node) {
			node = el.parentNode;
		}
		editor.selectNodeContents(node);
	};

	switch (button_id) {
		// ROWS
	    case "TO-row-insert-above":
	    case "TO-row-insert-under":
		var tr = this.getClosest("tr");
		if (!tr) {
			break;
		}
		var otr = tr.cloneNode(true);
		clearRow(otr);
		tr.parentNode.insertBefore(otr, /under/.test(button_id) ? tr.nextSibling : tr);
		editor.forceRedraw();
		editor.focusEditor();
		break;
	    case "TO-row-delete":
		var tr = this.getClosest("tr");
		if (!tr) { break; }
		var rowParent = tr.parentNode;
		var tableParent = rowParent.parentNode;
		if(rowParent.rows.length == 1) {  // this the last row, delete the whole table
			while(rowParent.tagName.toLowerCase() != "table") {
				rowParent = tableParent;
				tableParent = rowParent.parentNode;
			}
			selectNextNode(rowParent);
			tableParent.removeChild(rowParent);
		} else {
				// set the caret first to a position that doesn't disappear.
			selectNextNode(tr);
			rowParent.removeChild(tr);
		}
		editor.forceRedraw();
		editor.focusEditor();
		editor.updateToolbar();
		break;
	    case "TO-row-split":
		var td = this.getClosest("td");
		if (!td) {
			break;
		}
		splitRow(td);
		break;

		// COLUMNS
	    case "TO-col-insert-before":
	    case "TO-col-insert-after":
		var td = this.getClosest("td");
		if (!td) { break; }
		var rows = td.parentNode.parentNode.rows;
		var index = td.cellIndex;
		for (var i = rows.length; --i >= 0;) {
			var tr = rows[i];
			var ref = tr.cells[index + (/after/.test(button_id) ? 1 : 0)];
			var otd = editor._doc.createElement("td");
			otd.innerHTML = mozbr;
			if(!ref) {
				tr.appendChild(otd);
			} else {
				tr.insertBefore(otd, ref);
			}
		}
		editor.focusEditor();
		break;
	    case "TO-col-split":
		var td = this.getClosest("td");
		if (!td) { break; }
		splitCol(td);
		break;
	    case "TO-col-delete":
		var cell = this.getClosest("td");
		if (!cell) { break; }
		var index = cell.cellIndex;
		var rows = cell.parentNode.parentNode.rows;
		var lastColumn = true;
		for(var i = rows.length; --i >= 0;) {
			if(rows[i].cells.length > 1) lastColumn = false;
		}
		if(lastColumn) {   // this is the last column, delete the whole table
			var row = cell.parentNode;
			var rowParent = row.parentNode;
			var tableParent = rowParent.parentNode;
			while(rowParent.tagName.toLowerCase() != "table") {
				rowParent = tableParent;
				tableParent = rowParent.parentNode;
			}
				// set the caret first to a position that doesn't disappear
			selectNextNode(rowParent);
			tableParent.removeChild(rowParent);
		} else {
				// set the caret first to a position that doesn't disappear
			selectNextNode(cell);
			for (var i = rows.length; --i >= 0;) {
				if(rows[i].cells[index]) rows[i].removeChild(rows[i].cells[index]);
			}
		}
		editor.forceRedraw();
		editor.focusEditor();
		editor.updateToolbar();
		break;

		// CELLS
	    case "TO-cell-split":
		var cell = this.getClosest("td");
		if (!cell) { break; }
		splitCell(cell);
		break;
	    case "TO-cell-insert-before":
	    case "TO-cell-insert-after":
		var td = this.getClosest("td");
		if (!td) { break; }
		var tr = td.parentNode;
		var otd = editor._doc.createElement("td");
		otd.innerHTML = mozbr;
		tr.insertBefore(otd, /after/.test(button_id) ? td.nextSibling : td);
		editor.forceRedraw();
		editor.focusEditor();
		break;
	    case "TO-cell-delete":
		var cell = this.getClosest("td");
		if (!cell) { break; }
		var row = cell.parentNode;
		if(row.cells.length == 1) {  // this is the cell in the row, delete the row
			var rowParent = row.parentNode;
			var tableParent = rowParent.parentNode;
			if(rowParent.rows.length == 1) {  // this the last row, delete the whole table
				while(rowParent.tagName.toLowerCase() != "table") {
					rowParent = tableParent;
					tableParent = rowParent.parentNode;
				}
				selectNextNode(rowParent);
				tableParent.removeChild(rowParent);
			} else {
				selectNextNode(row);
				rowParent.removeChild(row);
			}
		} else {
				// set the caret first to a position that doesn't disappear
			selectNextNode(cell);
			row.removeChild(cell);
		}
		editor.forceRedraw();
		editor.focusEditor();
		editor.updateToolbar();
		break;
	    case "TO-cell-merge":
		var sel = editor._getSelection();
		var range, i = 0;
		var rows = [];
		var row = null;
		var cells = null;
		if(HTMLArea.is_gecko && !HTMLArea.is_safari) {
			try {
				while (range = sel.getRangeAt(i++)) {
					var td = range.startContainer.childNodes[range.startOffset];
					if (td.parentNode != row) {
						row = td.parentNode;
						(cells) && rows.push(cells);
						cells = [];
					}
					cells.push(td);
				}
			} catch(e) {/* finished walking through selection */}
			rows.push(cells);
		} else {
			// Internet Explorer and Safari
			var td = this.getClosest("td");
			if (!td) {
				alert(TableOperations.I18N["Please click into some cell"]);
				break;
			}
			var tr = td.parentElement;
			var no_cols = prompt(TableOperations.I18N["How many columns would you like to merge?"], 2);
			if (!no_cols) { break; }
			var no_rows = prompt(TableOperations.I18N["How many rows would you like to merge?"], 2);
			if (!no_rows) { break; }
			var cell_index = td.cellIndex;
			while (no_rows-- > 0) {
				td = tr.cells[cell_index];
				cells = [td];
				for (var i = 1; i < no_cols; ++i) {
					td = td.nextSibling;
					if (!td) { break; }
					cells.push(td);
				}
				rows.push(cells);
				tr = tr.nextSibling;
				if (!tr) { break; }
			}
		}
		var cellHTML = "";
		for(i=0; i < rows.length; ++i) {
			// i && (cellHTML += "<br />");
			var cells = rows[i];
			if(!cells) continue;
			for(var j=0; j < cells.length; ++j) {
				// j && (cellHTML += "&nbsp;");
				var cell = cells[j];
				cellHTML += cell.innerHTML;
				if(i || j) {
					if(cell.parentNode.cells.length == 1) {
						cell.parentNode.parentNode.removeChild(cell.parentNode);
					} else {
						cell.parentNode.removeChild(cell);
					}
				}
			}
		}
		try {
			var td = rows[0][0];
			td.innerHTML = cellHTML;
			td.rowSpan = rows.length;
			td.colSpan = rows[0].length;
			editor.selectNodeContents(td);
		} catch(e) { }
		editor.forceRedraw();
		editor.focusEditor();
		break;

		// PROPERTIES
	    case "TO-table-prop":
		this.dialogTableProperties();
		break;
	    case "TO-row-prop":
		this.dialogRowCellProperties(false);
		break;
	    case "TO-cell-prop":
		this.dialogRowCellProperties(true);
		break;
	    case "TO-toggle-borders":
		var tables = editor._doc.getElementsByTagName("table");
		if(tables.length != 0){
			if(!editor.borders) editor.borders = true;
				else editor.borders = false;
			for(var ix=0;ix < tables.length;ix++){
				if(editor.borders){
						// flashing the display forces moz to listen (JB:18-04-2005) - #102
					if(HTMLArea.is_gecko){
						tables[ix].style.display="none";
						tables[ix].style.display="table";
					}
					HTMLArea._addClass(tables[ix],'showtableborders');
				} else {
					HTMLArea._removeClass(tables[ix],'showtableborders');
				}
			}
		}
		break;
	    default:
		alert("Button [" + button_id + "] not yet implemented");
	}
};

//// GENERIC CODE [style of any element; this should be moved into a separate
//// file as it'll be very useful]
//// BEGIN GENERIC CODE -----------------------------------------------------

TableOperations.getLength = function(value) {
	var len = parseInt(value);
	if (isNaN(len)) {
		len = "";
	}
	return len;
};

// Applies the style found in "params" to the given element.
TableOperations.processStyle = function(params, element) {
	var style = element.style;
	for (var i in params) {
		var val = params[i];
		switch (i) {
		    case "f_st_backgroundColor":
			style.backgroundColor = val;
			break;
		    case "f_st_color":
			style.color = val;
			break;
		    case "f_st_backgroundImage":
			if (/\S/.test(val)) {
				style.backgroundImage = "url(" + val + ")";
			} else {
				style.backgroundImage = "none";
			}
			break;
		    case "f_st_borderWidth":
			style.borderWidth = val;
			if(element.tagName.toLowerCase() == "table") element.border = val;
			break;
		    case "f_st_borderStyle":
			style.borderStyle = (val != "not set") ? val : "";
			break;
		    case "f_st_borderColor":
			style.borderColor = val;
			break;
		    case "f_st_borderCollapse":
			style.borderCollapse = val ? "collapse" : "";
			break;
		    case "f_st_width":
			if (/\S/.test(val)) {
				style.width = val + params["f_st_widthUnit"];
			} else {
				style.width = "";
			}
			break;
		    case "f_st_height":
			if (/\S/.test(val)) {
				style.height = val + params["f_st_heightUnit"];
			} else {
				style.height = "";
			}
			break;
		    case "f_st_textAlign":
			if (val == "character") {
				var ch = params["f_st_textAlignChar"];
				if (ch == '"') {
					ch = '\\"';
				}
				style.textAlign = '"' + ch + '"';
			} else {
				style.textAlign = (val != "not set") ? val : "";
			}
			break;
		    case "f_st_vertAlign":
			style.verticalAlign = (val != "not set") ? val : "";
			break;
		    case "f_st_float":
				if (HTMLArea.is_ie) { 
					style.styleFloat = (val != "not set") ? val : "";
				} else { 
					style.cssFloat = (val != "not set") ? val : "";
				}
				break;
// 		    case "f_st_margin":
// 			style.margin = val + "px";
// 			break;
// 		    case "f_st_padding":
// 			style.padding = val + "px";
// 			break;
		}
	}
};

// Returns an HTML element for a widget that allows color selection.  That is,
// a button that contains the given color, if any, and when pressed will popup
// the sooner-or-later-to-be-rewritten select_color.html dialog allowing user
// to select some color.  If a color is selected, an input field with the name
// "f_st_"+name will be updated with the color value in #123456 format.
TableOperations.createColorButton = function(w, doc, editor, color, name) {
	if (!color) {
		color = "";
	} else if (!/#/.test(color)) {
		color = HTMLArea._colorToRgb(color);
	}

	var df = doc.createElement("span");
 	var field = doc.createElement("input");
	field.type = "hidden";
	df.appendChild(field);
 	field.name = "f_st_" + name;
 	field.id = "f_st_" + name;
	field.value = color;
	var button = doc.createElement("span");
	button.className = "buttonColor";
	df.appendChild(button);
	var span = doc.createElement("span");
	span.className = "chooser";
	span.style.backgroundColor = color;
	button.appendChild(span);
	button.onmouseover = function() { if (!this.disabled) { this.className += " buttonColor-hilite"; }};
	button.onmouseout = function() { if (!this.disabled) { this.className = "buttonColor"; }};
	span.onclick = function() {
		if (this.parentNode.disabled) {
			return false;
		}
// Begin change for TYPO3 ColorSelect by Stanislas Rolland 2004-11-03
		var selectColorPlugin = editor.plugins.SelectColor;
		if (selectColorPlugin) selectColorPlugin = selectColorPlugin.instance;
		if (selectColorPlugin) {
			selectColorPlugin.dialogSelectColor("color", span, field, w);
		} else { 
			editor._popupDialog("select_color.html", function(color) {
				if (color) {
					span.style.backgroundColor = "#" + color;
					field.value = "#" + color;
				}
			}, color, 200, 182, w);
		}
// End change for TYPO3 ColorSelect by Stanislas Rolland 2004-11-03
	};
	var span2 = doc.createElement("span");
	span2.innerHTML = "&#x00d7;";
	span2.className = "nocolor";
	span2.title = TableOperations.I18N["Unset color"];
	button.appendChild(span2);
	span2.onmouseover = function() { if (!this.parentNode.disabled) { this.className += " nocolor-hilite"; }};
	span2.onmouseout = function() { if (!this.parentNode.disabled) { this.className = "nocolor"; }};
	span2.onclick = function() {
		span.style.backgroundColor = "";
		field.value = "";
	};
	return df;
};
TableOperations.buildTitle = function(doc,i18n,content,title) {
	var div = doc.createElement("div");
	div.className = "title";
	div.innerHTML = i18n[title];
	content.appendChild(div);
	doc.title = i18n[title];
};
TableOperations.buildDescriptionFieldset = function(doc,el,i18n,content) {
	var fieldset = doc.createElement("fieldset");
	TableOperations.insertLegend(doc, i18n, fieldset, "Description");
	TableOperations.insertSpace(doc, fieldset);
	var f_caption = "";
	var capel = el.getElementsByTagName("caption")[0];
	if (capel) {
		f_caption = capel.innerHTML;
	}
	TableOperations.buildInput(doc, el, i18n, fieldset, "f_caption", "Caption:", "Description of the nature of the table", "", "", f_caption, "fr", "value", "");
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.buildInput(doc, el, i18n, fieldset, "f_summary", "Summary:", "Summary of the table purpose and structure", "", "", el.summary, "fr", "value", "");
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.buildStylingFieldset = function(doc,el,i18n,content,cssArray) {
	var tagName = el.tagName.toLowerCase();
	var cssLabels = new Array();
	var cssClasses = new Array();
	cssLabels[0] = i18n["Default"];
	cssClasses[0] = "none";
	var selected = el.className;
	var found = false, i = 1, cssClass;
	if(cssArray[tagName]) {
		for(cssClass in cssArray[tagName]){
			if(cssClass != "none") {
				cssLabels[i] = cssArray[tagName][cssClass];
				cssClasses[i] = cssClass;
				if(cssClass == selected) found = true;
				i++;
			} else {
				cssLabels[0] = cssArray[tagName][cssClass];
			}
		}
	}
	if(cssArray['all']){
		for(cssClass in cssArray['all']){
			cssLabels[i] = cssArray['all'][cssClass];
			cssClasses[i] = cssClass;
			if(cssClass == selected) found = true;
			i++;
		}
	}
	if(selected && !found) {
		cssLabels[i] = i18n["Undefined"];
		cssClasses[i] = selected;
	}
	var fieldset = doc.createElement("fieldset");
	TableOperations.insertLegend(doc, i18n, fieldset, "CSS Style");
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_class", "Class:", "fr", "floating", "Class selector", cssLabels, cssClasses, new RegExp((selected ? selected : "none"), "i"), "", false);
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.buildLayoutFieldset = function(doc,el,i18n,content,fieldsetClass) {
	var select;
	var selected;
	var fieldset = doc.createElement("fieldset");
	if(fieldsetClass) fieldset.className = fieldsetClass;
	TableOperations.insertLegend(doc, i18n, fieldset, "Layout");
	TableOperations.insertSpace(doc, fieldset);
	var f_st_width = TableOperations.getLength(el.style.width);
	var f_st_height = TableOperations.getLength(el.style.height);
	var selectedWidthUnit = /%/.test(el.style.width) ? '%' : (/px/.test(el.style.width) ? 'px' : 'em');
	var selectedHeightUnit = /%/.test(el.style.height) ? '%' : (/px/.test(el.style.height) ? 'px' : 'em');
	var tag = el.tagName.toLowerCase();
	switch(tag) {
		case "table" :
			TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_width", "Width:", "Table width", "", "5", f_st_width, "fr", "floating", "");
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_widthUnit", "", "", "floating", "Width unit", ["percent", "pixels", "em"], ["%", "px", "em"], new RegExp((f_st_width ? selectedWidthUnit : "%"), "i"));
			TableOperations.insertSpace(doc, fieldset);
			TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_height", "Height:", "Table height", "", "5", f_st_height, "fr", "floating", "");
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_heightUnit", "", "", "floating", "Height unit", ["percent", "pixels", "em"], ["%", "px", "em"], new RegExp((f_st_height ? selectedHeightUnit : "%"), "i"));
			selected = (HTMLArea._is_ie) ? el.style.styleFloat : el.style.cssFloat;
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_float", "Float:", "fr", "floating", "Specifies where the table should float",["Not set", "Non-floating", "Left", "Right"], ["not set", "none", "left", "right"], new RegExp((selected ? selected : "not set"), "i"));
			break;
		case "tr" :
			TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_width", "Width:", "Row width", "", "5", f_st_width, "fr", "floating", "");
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_widthUnit", "", "", "floating", "Width unit", ["percent", "pixels", "em"], ["%", "px", "em"], new RegExp((f_st_width ? selectedWidthUnit : "%"), "i"));
			TableOperations.insertSpace(doc, fieldset);
			TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_height", "Height:", "Row height", "", "5", f_st_height, "fr", "floating", "");
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_heightUnit", "", "", "floating", "Height unit", ["percent", "pixels", "em"], ["%", "px", "em"], new RegExp((f_st_height ? selectedHeightUnit : "%"), "i"));
			break;
		case "td" :
			TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_width", "Width:", "Cell width", "", "5", f_st_width, "fr", "floating", "");
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_widthUnit", "", "", "floating", "Width unit", ["percent", "pixels", "em"], ["%", "px", "em"], new RegExp((f_st_width ? selectedWidthUnit : "%"), "i"));
			TableOperations.insertSpace(doc, fieldset);
			TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_height", "Height:", "Cell height", "", "5", f_st_height, "fr", "floating", "");
			select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_heightUnit", "", "", "floating", "Height unit", ["percent", "pixels", "em"], ["%", "px", "em"], new RegExp((f_st_height ? selectedHeightUnit : "%"), "i"));		
	}
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.buildAlignmentFieldset = function(doc,el,i18n,content,fieldsetClass) {
	var select;
	var tag = el.tagName.toLowerCase();
	var fieldset = doc.createElement("fieldset");
	if(fieldsetClass) fieldset.className = fieldsetClass;
	TableOperations.insertLegend(doc, i18n, fieldset, "Alignment");
	TableOperations.insertSpace(doc, fieldset);
	var options = ["Left", "Center", "Right", "Justify"];
	var values = ["left", "center", "right", "justify"];
	var f_st_textAlign = el.style.textAlign;
/*
	if (tag == "td") {
		options.push("Character");
		values.push("character");
		if(f_st_textAlign.charAt(0) == '"') {
			var splitArray = f_st_textAlign.split('"');
			var f_st_textAlignChar = splitArray[0];
			f_st_textAlign = "character";
		}
	}
*/
	select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_textAlign", "Text alignment:","fl", "floating", "Horizontal alignment of text within cell", options, values, new RegExp((f_st_textAlign ? f_st_textAlign : "left"), "i"));
/*
	if (tag == "td") {
		var characterFields = [];
		TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_textAlignChar", "", "Align on this character", "", "1", f_st_textAlignChar, "", "floating", "", characterFields);
		function setCharVisibility(value) {
			for (var i = 0; i < characterFields.length; ++i) {
				var characterFieldElement = characterFields[i];
				characterFieldElement.style.visibility = value ? "visible" : "hidden";
				if (value && (characterFieldElement.tagName.toLowerCase() == "input" )) {
					characterFieldElement.focus();
					characterFieldElement.select();
				}
			}
		};
		select.onchange = function() { setCharVisibility(this.value == "character"); };
		setCharVisibility(select.value == "character");
	}
*/
	TableOperations.insertSpace(doc, fieldset);
	select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_vertAlign", "Vertical alignment:", "fl", "floating", "Vertical alignment of content within cell", ["Top", "Middle", "Bottom", "Baseline"], ["top", "middle", "bottom", "baseline"], new RegExp((el.style.verticalAlign ? el.style.verticalAlign : "middle"), "i"));
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.buildSpacingFieldset = function(doc,el,i18n,content) {
	var fieldset = doc.createElement("fieldset");
	TableOperations.insertLegend(doc, i18n, fieldset, "Spacing and padding");
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.buildInput(doc, el, i18n, fieldset, "f_spacing", "Cell spacing:", "Space between adjacent cells", "pixels", "5", el.cellSpacing, "fr", "floating", "postlabel");
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.buildInput(doc, el, i18n, fieldset, "f_padding", "Cell padding:", "Space between content and border in cell", "pixels", "5", el.cellPadding, "fr", "floating", "postlabel");
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.buildBordersFieldset = function(w,doc,editor,el,i18n,content,fieldsetClass) {
	var select;
	var selected;
	var borderFields = [];
	function setBorderFieldsVisibility(value) {
		for (var i = 0; i < borderFields.length; ++i) {
			var borderFieldElement = borderFields[i];
			borderFieldElement.style.visibility = value ? "hidden" : "visible";
			if (!value && (borderFieldElement.tagName.toLowerCase() == "input")) {
				borderFieldElement.focus();
				borderFieldElement.select();
			}
		}
	};
	var fieldset = doc.createElement("fieldset");
	fieldset.className = fieldsetClass;
	TableOperations.insertLegend(doc, i18n, fieldset, "Frame and borders");
	TableOperations.insertSpace(doc, fieldset);
		// Gecko reports "solid solid solid solid" for "border-style: solid".
		// That is, "top right bottom left" -- we only consider the first value.
	selected = el.style.borderStyle;
	(selected.match(/([^\s]*)\s/)) && (selected = RegExp.$1);
	selectBorderStyle = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_st_borderStyle", "Border style:", "fr", "floating", "Border style", ["Not set", "No border", "Dotted", "Dashed", "Solid", "Double", "Groove", "Ridge", "Inset", "Outset"], ["not set", "none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"], new RegExp((selected ? selected : "not set"), "i"));
	selectBorderStyle.onchange = function() { setBorderFieldsVisibility(this.value == "none"); };
	TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_borderWidth", "Border width:", "Border width", "pixels", "5", TableOperations.getLength(el.style.borderWidth), "fr", "floating", "postlabel", borderFields);
	TableOperations.insertSpace(doc, fieldset, borderFields);

	if (el.tagName.toLowerCase() == "table") {
		TableOperations.buildColorField(w, doc, editor, el, i18n, fieldset, "", "Color:", "fr", "colorButton", el.style.borderColor, "borderColor", borderFields);
		var label = doc.createElement("label");
		label.className = "fl-borderCollapse";
		label.htmlFor = "f_st_borderCollapse";
		label.innerHTML = i18n["Collapsed borders"];
		fieldset.appendChild(label);
		borderFields.push(label);
		var input = doc.createElement("input");
		input.className ="checkbox";
		input.type = "checkbox";
		input.name = "f_st_borderCollapse";
		input.id = "f_st_borderCollapse";
		var val = (/collapse/i.test(el.style.borderCollapse));
		input.checked = val ? 1 : 0;
		fieldset.appendChild(input);
		borderFields.push(input);
		TableOperations.insertSpace(doc, fieldset, borderFields);
		select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_frames", "Frames:", "fr", "floating", "Specifies which sides should have a border", ["Not set", "No sides", "The top side only", "The bottom side only", "The top and bottom sides only", "The right and left sides only", "The left-hand side only", "The right-hand side only", "All four sides"], ["not set", "void", "above", "below", "hsides", "vsides", "lhs", "rhs", "box"], new RegExp((el.frame ? el.frame : "not set"), "i"), borderFields);
		TableOperations.insertSpace(doc, fieldset, borderFields);
		select = TableOperations.buildSelectField(doc, el, i18n, fieldset, "f_rules", "Rules:", "fr", "floating", "Specifies where rules should be displayed", ["Not set", "No rules", "Rules will appear between rows only", "Rules will appear between columns only", "Rules will appear between all rows and columns"], ["not set", "none", "rows", "cols", "all"], new RegExp((el.rules ? el.rules : "not set"), "i"), borderFields);
	} else {
		TableOperations.insertSpace(doc, fieldset, borderFields);
		TableOperations.buildColorField(w, doc, editor, el, i18n, fieldset, "", "Color:", "fr", "colorButton", el.style.borderColor, "borderColor", borderFields);
	}
	setBorderFieldsVisibility(selectBorderStyle.value == "none");
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.buildColorsFieldset = function(w,doc,editor,el,i18n,content) {
	var fieldset = doc.createElement("fieldset");
	TableOperations.insertLegend(doc, i18n, fieldset, "Background and colors");
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.buildColorField(w, doc, editor, el, i18n, fieldset, "", "FG Color:", "fr", "colorButton", el.style.color, "color");
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.insertSpace(doc, fieldset);
	TableOperations.buildColorField(w, doc, editor, el, i18n, fieldset, "", "Background:", "fr", "colorButton", el.style.backgroundColor, "backgroundColor")
	var url;
	if (el.style.backgroundImage.match(/url\(\s*(.*?)\s*\)/)) url = RegExp.$1;
	TableOperations.buildInput(doc, el, i18n, fieldset, "f_st_backgroundImage", "Image URL:", "URL of the background image", "", "", url, "field", "shorter-value", "");
	TableOperations.insertSpace(doc, fieldset);
	content.appendChild(fieldset);
};
TableOperations.insertLegend = function(doc,i18n, fieldset,legend) {
	var legendNode = doc.createElement("legend");
	legendNode.innerHTML = i18n[legend];
	fieldset.appendChild(legendNode);
};
TableOperations.insertSpace =	function(doc,fieldset,fields) {
	var space = doc.createElement("div");
	space.className = "space";
	fieldset.appendChild(space);
	if(fields) fields.push(space);
};
TableOperations.buildInput = function(doc,el,i18n,fieldset,fieldName,fieldLabel,fieldTitle,postLabel,fieldSize,fieldValue,labelClass,inputClass,postClass,fields) {
	var label;
		// Field label
	if(fieldLabel) {
		label = doc.createElement("div");
		if(labelClass) label.className = labelClass;
		label.innerHTML = i18n[fieldLabel];
		fieldset.appendChild(label);
		if(fields) fields.push(label);
	}
		// Input field
	var input = doc.createElement("input");
	input.type = "text";
	input.id = fieldName;
	input.name =  fieldName;
	if(inputClass) input.className = inputClass;
	if(fieldTitle) input.title = i18n[fieldTitle];
	if(fieldSize) input.size = fieldSize;
	if(fieldValue) input.value = fieldValue;
	fieldset.appendChild(input);
	if(fields) fields.push(input);
		// Field post label
	if(postLabel) {
		label = doc.createElement("span");
		if(postClass) label.className = postClass;
		label.innerHTML = i18n[postLabel];
		fieldset.appendChild(label);
		if(fields) fields.push(label);
	}
};
TableOperations.buildSelectField = function(doc,el,i18n,fieldset,fieldName,fieldLabel,labelClass,selectClass,fieldTitle,options,values,selected,fields,translateOptions) {
	if(typeof translateOptions == "undefined") var translateOptions = true;
		// Field Label
	if(fieldLabel) {
		var label = doc.createElement("div");
		if(labelClass) label.className = labelClass;
		label.innerHTML = i18n[fieldLabel];
		fieldset.appendChild(label);
		if(fields) fields.push(label);
	}
		// Text Alignment Select Box
	var select = doc.createElement("select");
	if(selectClass) select.className = selectClass;
	select.id = fieldName;
	select.name =  fieldName;
	select.title= i18n[fieldTitle];
	var option;
	for (var i = 0; i < options.length; ++i) {
		option = doc.createElement("option");
		option.value = values[i];
		if(translateOptions) {
			option.appendChild(doc.createTextNode(i18n[options[i]]));
		} else {
			option.appendChild(doc.createTextNode(options[i]));
		}
		option.selected = selected.test(option.value);
		select.appendChild(option);
	}
	if(select.options.length>1) select.disabled = false;
	else select.disabled = true;
	fieldset.appendChild(select);
	if(fields) fields.push(select);
	return select;
};
TableOperations.buildColorField = function(w,doc,editor,el,i18n,fieldset,fieldName,fieldLabel,labelClass, buttonClass, fieldValue,fieldType,fields) {
		// Field Label
	if(fieldLabel) {
		var label = doc.createElement("div");
		if(labelClass) label.className = labelClass;
		label.innerHTML = i18n[fieldLabel];
		fieldset.appendChild(label);
		if(fields) fields.push(label);
	}
	var colorButton = TableOperations.createColorButton(w, doc, editor, fieldValue, fieldType);
	colorButton.className = buttonClass;
	fieldset.appendChild(colorButton);
	if(fields) fields.push(colorButton);
};