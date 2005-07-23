/**
 * htmlArea v3.0 - Copyright (c) 2003-2005 dynarch.com
 * htmlArea v3.0 - Copyright (c) 2002-2003 interactivetools.com, inc.
 * TYPO3 htmlArea RTE - Copyright (c) 2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
 * This copyright notice MUST stay intact for use (see license.txt).
**/

/***************************************************
 *  EDITOR INITIALIZATION AND CONFIGURATION
 ***************************************************/

/*
 * Set some basic paths
 */
if (typeof(_editor_url) == "string") {
		// Leave exactly one backslash at the end of _editor_url
	_editor_url = _editor_url.replace(/\x2f*$/, '/');
} else {
	alert("WARNING: _editor_url is not set!");
	var _editor_url = '';
}
if (typeof(_editor_skin) == "string") _editor_skin = _editor_skin.replace(/\x2f*$/, '/');
	else var _editor_skin = _editor_url + "skins/default/";
if (typeof(_editor_CSS) != "string") var _editor_CSS = _editor_url + "skins/default/htmlarea.css";
if (typeof(_editor_edited_content_CSS) != "string") var _editor_edited_content_CSS = _editor_skin + "htmlarea-edited-content.css";
if (typeof(_editor_lang) == "string") _editor_lang = _editor_lang ? _editor_lang.toLowerCase() : "en";

/*
 * HTMLArea object constructor.
 */
var HTMLArea = function(textarea, config) {
	if (HTMLArea.checkSupportedBrowser()) {
		if (typeof(config) == "undefined") this.config = new HTMLArea.Config();
			else this.config = config;
		this._htmlArea = null;
		this._textArea = textarea;
		this._editMode = "wysiwyg";
		this.plugins = {};
		this._timerToolbar = null;
		this._undoQueue = new Array();
		this._undoPos = -1;
		this._customUndo = true;
		this.doctype = '';
		this.eventHandlers = {};
	}
};

/*
 * Browser identification
 */
HTMLArea.agt = navigator.userAgent.toLowerCase();
HTMLArea.is_opera  = (HTMLArea.agt.indexOf("opera") != -1);
HTMLArea.is_ie = (HTMLArea.agt.indexOf("msie") != -1) && !HTMLArea.is_opera;
HTMLArea.is_safari = (HTMLArea.agt.indexOf("webkit") != -1);
HTMLArea.is_gecko  = (navigator.product == "Gecko");
HTMLArea.is_wamcom  = (HTMLArea.agt.indexOf("wamcom") != -1) || (HTMLArea.is_gecko && (HTMLArea.agt.indexOf("1.3") != -1));

/*
 * A log for troubleshooting
 */
HTMLArea._debugMode = false;
if (typeof(_editor_debug_mode) != "undefined") HTMLArea._debugMode = _editor_debug_mode;

HTMLArea._appendToLog = function(str){
	if(HTMLArea._debugMode) {
		var log = document.getElementById("HTMLAreaLog");
		if(log) {
			log.appendChild(document.createTextNode(str));
			log.appendChild(document.createElement("br"));
		}
	}
};

/*
 * Using compressed scripts
 */
HTMLArea._compressedScripts = false;
if (typeof(_editor_compressed_scripts) != "undefined") HTMLArea._compressedScripts = _editor_compressed_scripts;

/*
 * Localization of core script
 */
HTMLArea.I18N = HTMLArea_langArray;

/*
 * Build array of scripts to be loaded
 */
HTMLArea.is_loaded = false;
HTMLArea.onload = function(){ 
	HTMLArea.is_loaded = true; 
	HTMLArea._appendToLog("All scripts successfully loaded.");
};
HTMLArea.loadTimer;
HTMLArea._scripts = [];
HTMLArea._scriptLoaded = [];
HTMLArea._scriptRequest = [];
HTMLArea._request = [];
HTMLArea.loadScript = function(url, plugin) {
	if (plugin) url = _editor_url + "/plugins/" + plugin + '/' + url;
	if(HTMLArea._compressedScripts) url.replace(/\.js$/gi, "-compressed.js");
	HTMLArea._scripts.push(url);
};
HTMLArea.loadScript(_editor_url + "popupwin.js");

/*
 * Get a script using asynchronous XMLHttpRequest
 */
HTMLArea.MSXML_XMLHTTP_PROGIDS = new Array("MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP");
HTMLArea.XMLHTTPResponseHandler = function (i) {
	return (function() {
		var url = HTMLArea._scripts[i];
		if (HTMLArea._request[i].readyState != 4) return;
		if (HTMLArea._request[i].status == 200) { 
			try {
				eval(HTMLArea._request[i].responseText);
				HTMLArea._scriptLoaded[i] = true;
				i = null;
			} catch (e) {
				HTMLArea._appendToLog("ERROR [HTMLArea::getScript]: Unable to get script " + url + ": " + e);
			}
		} else {
			HTMLArea._appendToLog("ERROR [HTMLArea::getScript]: Unable to get " + url + " . Server reported " + HTMLArea._request[i].status);
		}
	});
};
HTMLArea._getScript = function (i,asynchronous) {
	var url = HTMLArea._scripts[i];
	if (typeof(asynchronous) == "undefined") var asynchronous = true;
	if (window.XMLHttpRequest && !window.ActiveXObject) HTMLArea._request[i] = new XMLHttpRequest();
		else if (window.ActiveXObject) {
			var success = false;
			for (var k = 0; k < HTMLArea.MSXML_XMLHTTP_PROGIDS.length && !success; k++) {
				try {
					HTMLArea._request[i] = new ActiveXObject(HTMLArea.MSXML_XMLHTTP_PROGIDS[k]);
					success = true;
				} catch (e) {}
			}
		}
	var request = HTMLArea._request[i];
	if (request) {
		request.open("GET", url, asynchronous);
		if (asynchronous) request.onreadystatechange = HTMLArea.XMLHTTPResponseHandler(i);
		if (window.XMLHttpRequest && !window.ActiveXObject) request.send(null);
			else request.send();
		if (!asynchronous) {
			if (request.status == 200) return request.responseText;
				else return '';
		}
	}
};

/*
 * Wait for the loading process to complete
 */
HTMLArea.checkInitialLoad = function() {
	var scriptsLoaded = true;
	for (var i = HTMLArea._scripts.length; --i >= 0;) {
		scriptsLoaded = scriptsLoaded && HTMLArea._scriptLoaded[i];
	}
	if(HTMLArea.loadTimer) window.clearTimeout(HTMLArea.loadTimer);
	if (scriptsLoaded) {
		HTMLArea.is_loaded = true;
		HTMLArea._appendToLog("[HTMLArea::init]: All scripts successfully loaded.");
		if (window.ActiveXObject) {
			for (var i = HTMLArea._scripts.length; --i >= 0;) {
				HTMLArea._request[i].onreadystatechange = new Function();
				HTMLArea._request[i] = null;
			}
		}
	} else {
		HTMLArea.loadTimer = window.setTimeout("HTMLArea.checkInitialLoad();", 200);
		return false;
	}
};

/*
 * Get all the scripts
 */
HTMLArea.init = function() {
	HTMLArea._eventCache = HTMLArea._eventCacheConstructor();
	if (window.XMLHttpRequest || window.ActiveXObject) {
		try { 
			for (var i = HTMLArea._scripts.length; --i >= 0;) {
				HTMLArea._getScript(i);
			}
		} catch (e) {
			HTMLArea._appendToLog("ERROR [HTMLArea::init]: Unable to use XMLHttpRequest: "+ e);
		}
		HTMLArea.checkInitialLoad();
	}
};

/*
 * Compile some regular expressions
 */
HTMLArea.RE_tagName = /(<\/|<)\s*([^ \t\n>]+)/ig;
HTMLArea.RE_doctype = /(<!doctype((.|\n)*?)>)\n?/i;
HTMLArea.RE_head    = /<head>((.|\n)*?)<\/head>/i;
HTMLArea.RE_body    = /<body>((.|\n)*?)<\/body>/i;
HTMLArea.Reg_body = new RegExp("<\/?(body)[^>]*>", "gi");
HTMLArea.reservedClassNames = /htmlarea/;
HTMLArea.RE_email    = /[0-9a-z]([-.\w]*[0-9a-z])*@([0-9a-z][-\w]*[0-9a-z]\.)+[a-z]{2,9}/i;
HTMLArea.RE_url      = /(https?:\/\/)?(([a-z0-9_]+:[a-z0-9_]+@)?[a-z0-9_-]{2,}(\.[a-z0-9_-]{2,}){2,}(:[0-9]+)?(\/\S+)*)/i;

/*
 * Editor configuration object constructor
 */

HTMLArea.Config = function () {
	this.version = "3.0";
	this.width = "auto";
	this.height = "auto";
		// enable creation of a status bar?
	this.statusBar = true;
		// maximum size of the undo queue
	this.undoSteps = 20;
		// the time interval at which undo samples are taken: 1/2 sec.
	this.undoTimeout = 500;
		// whether the toolbar should be included in the size or not.
	this.sizeIncludesToolbar = true;
		// if true then HTMLArea will retrieve the full HTML, starting with the <HTML> tag.
	this.fullPage = false;
		// if the site is secure, create a secure iframe
	this.useHTTPS = false;
		// for Mozilla
	this.useCSS = false;
	this.enableMozillaExtension = true;
	this.disableEnterParagraphs = false;
		// style included in the iframe document
	this.editedContentStyle = _editor_edited_content_CSS;
		// content style
	this.pageStyle = "";
		// set to true if you want Word code to be cleaned upon Paste
	this.killWordOnPaste = true;
		// enable the 'Target' field in the Make Link dialog
	this.makeLinkShowsTarget = true;
		// remove tags (these have to be a regexp, or null if this functionality is not desired)
	this.htmlRemoveTags = null;
		// remove tags and any contents (these have to be a regexp, or null if this functionality is not desired)
	this.htmlRemoveTagsAndContents = null;
		// remove comments
	this.htmlRemoveComments = false;
		// custom tags (these have to be a regexp, or null if this functionality is not desired)
	this.customTags = /rougegras/ig;
		// BaseURL included in the iframe document
	this.baseURL = document.baseURI || document.URL;
	if(this.baseURL && this.baseURL.match(/(.*)\/([^\/]+)/)) this.baseURL = RegExp.$1 + "/";
		// URL-s
	this.imgURL = "images/";
	this.popupURL = "popups/";
		// Default toolbar
	this.toolbar = [
		[ "FontName", "space", "FontSize", "space", "FormatBlock", "space", "Bold", "Italic", "Underline", "StrikeThrough", "separator",
		  "Subscript", "Superscript", "separator", "Copy", "Cut", "Paste", "space", "Undo", "Redo" ],
		[ "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyFull", "separator", "LeftToRight", "RightToLeft", "separator",
		  "InsertOrderedList", "InsertUnorderedList", "Outdent", "Indent", "separator", "ForeColor", "HiliteColor", "separator",
		  "InsertHorizontalRule", "CreateLink", "InsertImage", "InsertTable", "htmlmode", "separator", "showhelp", "about" ]
	];
		// Default fonts
	this.FontName = {
		"Arial":		'arial,helvetica,sans-serif',
		"Courier New":		'courier new,courier,monospace',
		"Georgia":		'georgia,times new roman,times,serif',
		"Tahoma":		'tahoma,arial,helvetica,sans-serif',
		"Times New Roman":	'times new roman,times,serif',
		"Verdana":		'verdana,arial,helvetica,sans-serif',
		"impact":		'impact',
		"WingDings":		'wingdings'
	};
		// Default font sizes
	this.FontSize = { "1 (8 pt)":  "1", "2 (10 pt)": "2", "3 (12 pt)": "3", "4 (14 pt)": "4", "5 (18 pt)": "5", "6 (24 pt)": "6", "7 (36 pt)": "7" };
		// Default block elements
	this.FormatBlock = {"Heading 1": "h1", "Heading 2": "h2", "Heading 3": "h3", "Heading 4": "h4", "Heading 5": "h5", "Heading 6": "h6", "Normal": "p", "Address": "address", "Formatted": "pre" };

	this.btnList = {
		Bold:			["Bold", "ed_format_bold", false, function(editor) {editor.execCommand("Bold");}],
		Italic:			["Italic", "ed_format_italic", false, function(editor) {editor.execCommand("Italic");}],
		Underline:		["Underline", "ed_format_underline", false, function(editor) {editor.execCommand("Underline");}],
		StrikeThrough:		["Strikethrough", "ed_format_strike", false, function(editor) {editor.execCommand("StrikeThrough");}],
		Subscript:		["Subscript", "ed_format_sub", false, function(editor) {editor.execCommand("Subscript");}],
		Superscript:		["Superscript", "ed_format_sup", false, function(editor) {editor.execCommand("Superscript");}],
		JustifyLeft:		["Justify Left", "ed_align_left.gif", false, function(editor) {editor.execCommand("JustifyLeft");}],
		JustifyCenter:		["Justify Center", "ed_align_center.gif", false, function(editor) {editor.execCommand("JustifyCenter");}],
		JustifyRight:		["Justify Right", "ed_align_right.gif", false, function(editor) {editor.execCommand("JustifyRight");}],
		JustifyFull:		["Justify Full", "ed_align_justify.gif", false, function(editor) {editor.execCommand("JustifyFull");}],
		InsertOrderedList:	["Ordered List", "ed_list_num.gif", false, function(editor) {editor.execCommand("InsertOrderedList");}],
		InsertUnorderedList:	["Bulleted List", "ed_list_bullet", false, function(editor) {editor.execCommand("InsertUnorderedList");}],
		Outdent:		["Decrease Indent", "ed_indent_less.gif", false, function(editor) {editor.execCommand("Outdent");}],
		Indent:			["Increase Indent", "ed_indent_more.gif", false, function(editor) {editor.execCommand("Indent");}],
		ForeColor:		["Font Color", "ed_color_fg.gif",false, function(editor) {editor.execCommand("ForeColor");}],
		HiliteColor:		["Background Color", "ed_color_bg.gif",false, function(editor) {editor.execCommand("HiliteColor");}],
		InsertHorizontalRule:	["Horizontal Rule", "ed_hr.gif",false, function(editor) {editor.execCommand("InsertHorizontalRule");}],
		CreateLink:		["Insert Web Link", "ed_link.gif", false, function(editor) {editor.execCommand("CreateLink", true);}, null, false, true],
		InsertImage:		["Insert/Modify Image", "ed_image.gif", false, function(editor) {editor.execCommand("InsertImage");}],
		InsertTable:		["Insert Table", "insert_table.gif", false, function(editor) {editor.execCommand("InsertTable");}],
		htmlmode:		["Toggle HTML Source", "ed_html.gif", true, function(editor) {editor.execCommand("htmlmode");}],
		about:			["About this editor", "ed_about.gif", true, function(editor) {editor.execCommand("about");}],
		showhelp:		["Help using editor", "ed_help.gif", true, function(editor) {editor.execCommand("showhelp");}],
		Undo:			["Undoes your last action", "ed_undo.gif", false, function(editor) {editor.execCommand("Undo");}],
		Redo:			["Redoes your last action", "ed_redo.gif", false, function(editor) {editor.execCommand("Redo");}],
		Cut:			["Cut selection", "ed_cut.gif", false, function(editor,command,obj) {editor.execCommand("Cut");}],
		Copy:			["Copy selection", "ed_copy.gif", false, function(editor,command,obj) {editor.execCommand("Copy");}],
		Paste:			["Paste from clipboard", "ed_paste.gif", false, function(editor,command,obj) {editor.execCommand("Paste");}],
		LeftToRight:		["Direction left to right", "ed_left_to_right.gif", false, function(editor) {editor.execCommand("LeftToRight");}],
		RightToLeft:		["Direction right to left", "ed_right_to_left.gif", false, function(editor) {editor.execCommand("RightToLeft");}]
	};

		// Initialize tooltips from the I18N module, generate correct image path
	for (var i in this.btnList) {
		var btn = this.btnList[i];

		if (typeof(HTMLArea.I18N.tooltips[i.toLowerCase()]) != "undefined") btn[0] = HTMLArea.I18N.tooltips[i.toLowerCase()];

		if (typeof(btn[1]) == "string") btn[1] = _editor_skin + this.imgURL + btn[1];
			else btn[1][0] = _editor_skin + this.imgURL + btn[1][0];
	}		
	this.customSelects = {};
};

/*
 * Register a new button with the configuration.
 * It can be called with all arguments, or with only one (first one).  When called with
 * only one argument it must be an object with the following properties:
 * id, tooltip, image, textMode, action, context.  Examples:
 *
 * 1. config.registerButton("my-hilite", "Hilite text", "my-hilite.gif", false, function(editor) {...}, context);
 * 2. config.registerButton({
 *	id		: "my-hilite",		// Unique id for the button
 *	tooltip		: "Hilite text",	// the tooltip
 *	image		: "my-hilite.gif",	// image to be displayed in the toolbar
 *	textMode	: false,		// disabled in text mode
 *	action		: function(editor) {	// called when the button is clicked
 *				editor.surroundHTML('<span class="hilite">', '</span>');
 *				},
 *	context		: "p"			// will be disabled if not inside a <p> element
 *	hide		: false			// hide in menu and show only in context menu
 *	selection	: false			// will be disabled if there is no selection
 *    });
 */

HTMLArea.Config.prototype.registerButton = function(id,tooltip,image,textMode,action,context,hide,selection) {
	var the_id;
	switch (typeof(id)) {
		case "string": the_id = id; break;
		case "object": the_id = id.id; break;
		default: HTMLArea._appendToLog("ERROR [HTMLArea.Config::registerButton]: invalid arguments"); return false;
	}
	if (typeof(this.customSelects[the_id]) != "undefined") HTMLArea._appendToLog("WARNING [HTMLArea.Config::registerButton]: A dropdown with the same ID " + id + " already exists.");
	if (typeof(this.btnList[the_id]) != "undefined") HTMLArea._appendToLog("WARNING [HTMLArea.Config::registerButton]: A button with the same ID " + id + " already exists.");
	switch (typeof(id)) {
		case "string":
			if (typeof(hide) == "undefined") var hide = false;
			if (typeof(selection) == "undefined") var selection = false;
			this.btnList[id] = [tooltip, image, textMode, action, context, hide, selection];
			break;
		case "object":
			if (typeof(id.hide) == "undefined") id.hide = false;
			if (typeof(id.selection) == "undefined") id.selection = false;
			this.btnList[id.id] = [id.tooltip, id.image, id.textMode, id.action, id.context, id.hide, id.selection];
			break;
	}
};

/*
 * Register a dropdown box with the editor configuration.
 */
HTMLArea.Config.prototype.registerDropdown = function(object) {
	if (typeof(this.customSelects[object.id]) != "undefined") HTMLArea._appendToLog("WARNING [HTMLArea.Config::registerDropdown]: A dropdown with the same ID " + object.id + " already exists.");
	if (typeof(this.btnList[object.id]) != "undefined") HTMLArea._appendToLog("WARNING [HTMLArea.Config::registerDropdown]: A button with the same ID " + object.id + " already exists.");
	this.customSelects[object.id] = object;
};

/***************************************************
 *  EDITOR FRAMEWORK
 ***************************************************/
/*
 * Update the state of a toolbar element.
 * This function is member of a toolbar element object, unnamed object created by createButton or createSelect functions.
 */
HTMLArea.setButtonStatus = function(id,newval) {
	var oldval = this[id];
	var el = document.getElementById(this.elementId);
	if (oldval != newval) {
		switch (id) {
			case "enabled":
				if (newval) {
					if (!HTMLArea.is_wamcom) HTMLArea._removeClass(el, "buttonDisabled");
					el.disabled = false;
				} else {
					if (!HTMLArea.is_wamcom) HTMLArea._addClass(el, "buttonDisabled");
					el.disabled = true;
				}
				break;
			    case "active":
				if (newval) HTMLArea._addClass(el, "buttonPressed");
					else HTMLArea._removeClass(el, "buttonPressed");
				break;
		}
		this[id] = newval;
	}
};

/*
 * Create a new line in the toolbar
 */
HTMLArea.newLine = function(toolbar) {
	tb_line = document.createElement("ul");
	tb_line.className = "tb-line";
	toolbar.appendChild(tb_line);
	return tb_line;
};

/*
 * Add a toolbar element to the current line
 */
HTMLArea.addTbElement = function(element, tb_line, first_cell_on_line) {
	var tb_cell = document.createElement("li");
	if (first_cell_on_line) tb_cell.className = "tb-first-cell";
		else tb_cell.className = "tb-cell";
	tb_line.appendChild(tb_cell);
	tb_cell.appendChild(element);
	return false;
};

/*
 * Create a combo box and add it to the toolbar
 */
HTMLArea.prototype.createSelect = function(txt,tb_line,first_cell_on_line,labelObj) {
	var options = null,
		cmd = null,
		context = null,
		tooltip = "",
		newObj = {
			created : false,
			el : null,
			first : first_cell_on_line,
			labelUsed : false
		};

	switch (txt) {
		case "FontSize":
		case "FontName":
		case "FormatBlock":
			options = this.config[txt];
			tooltip = HTMLArea.I18N.tooltips[txt.toLowerCase()];
			cmd = txt;
			break;
		default:
			cmd = txt;
			var dropdown = this.config.customSelects[cmd];
			if (typeof(dropdown) != "undefined") {
				options = dropdown.options;
				context = dropdown.context;
				if (typeof(dropdown.tooltip) != "undefined") tooltip = dropdown.tooltip;
			}
			break;
	}
	if(options) {
		newObj["el"] = document.createElement("select");
		newObj["first"] = HTMLArea.addTbElement(newObj["el"], tb_line, first_cell_on_line);
		newObj["el"].title = tooltip;
		newObj["el"].id = this._editorNumber + "-" + txt;
		var obj = {
			name 		: txt,				// field name
			elementId 	: newObj["el"].id,		// unique id for the UI element
			enabled 	: true,				// is it enabled?
			text 		: false,			// enabled in text mode?
			cmd 		: cmd,				// command ID
			state		: HTMLArea.setButtonStatus,	// for changing state
			context 	: context,
			editorNumber	: this._editorNumber
		};
		this._toolbarObjects[txt] = obj;
		newObj["el"]._obj = obj;
		if (labelObj["labelRef"]) {
			labelObj["el"].htmlFor = newObj["el"].id;
			newObj["labelUsed"] = true;
		}
		HTMLArea._addEvent(newObj["el"], "change", HTMLArea.toolBarButtonHandler);

		for (var i in options) {
			var op = document.createElement("option");
			op.innerHTML = i;
			op.value = options[i];
			newObj["el"].appendChild(op);
		}

		newObj["created"] = true;
	}

	return newObj;
};

/*
 * Create a button and add it to the toolbar
 */
HTMLArea.prototype.createButton = function (txt,tb_line,first_cell_on_line,labelObj) {
	var btn = null,
		btnImg = null,
		newObj = {
			created : false,
			el : null,
			first : first_cell_on_line,
			labelUsed : false
		};

	switch (txt) {
		case "separator":
			newObj["el"] = document.createElement("div");
			newObj["first"] = HTMLArea.addTbElement(newObj["el"], tb_line, first_cell_on_line);
			newObj["el"].className = "separator";
			newObj["created"] = true;
			break;
		case "space":
			newObj["el"] = document.createElement("div");
			newObj["first"] = HTMLArea.addTbElement(newObj["el"], tb_line, first_cell_on_line);
			newObj["el"].className = "space";
			newObj["el"].innerHTML = "&nbsp;";
			newObj["created"] = true;
			break;
		case "textindicator":
			newObj["el"] = document.createElement("div");
			newObj["first"] = HTMLArea.addTbElement(newObj["el"], tb_line, first_cell_on_line);
			newObj["el"].appendChild(document.createTextNode("A"));
			newObj["el"].className = "indicator";
			newObj["el"].title = HTMLArea.I18N.tooltips.textindicator;
			newObj["el"].id = this._editorNumber + "-" + txt;
			var obj = {
				name		: txt,
				elementId	: newObj["el"].id,
				enabled		: true,
				active		: false,
				text		: false,
				cmd		: "textindicator",
				state		: HTMLArea.setButtonStatus
			};
			this._toolbarObjects[txt] = obj;
			newObj["created"] = true;
			break;
		default:
			btn = this.config.btnList[txt];
	}
	if(!newObj["created"] && btn) {
		newObj["el"] = document.createElement("button");
		newObj["first"] = HTMLArea.addTbElement(newObj["el"], tb_line, first_cell_on_line);
		newObj["el"].title = btn[0];
		newObj["el"].className = "button";
		newObj["el"].id = this._editorNumber + "-" + txt;
		if (btn[5]) newObj["el"].id.style.display = "none";
		var obj = {
			name 		: txt, 				// the button name
			elementId	: newObj["el"].id, 		// unique id for the UI element
			enabled 	: true,				// is it enabled?
			active		: false,			// is it pressed?
			text 		: btn[2],			// enabled in text mode?
			cmd 		: btn[3],			// the command ID
			state		: HTMLArea.setButtonStatus,	// for changing state
			context 	: btn[4] || null,		// enabled in a certain context?
			selection	: btn[6],			// disabled when no selection?
			editorNumber	: this._editorNumber
		};
		this._toolbarObjects[txt] = obj;
		newObj["el"]._obj = obj;
		if (labelObj["labelRef"]) {
			labelObj["el"].htmlFor = newObj["el"].id;
			newObj["labelUsed"] = true;
		}
		HTMLArea._addEvents(newObj["el"],["mouseover", "mouseout", "mousedown", "click"], HTMLArea.toolBarButtonHandler);
		if (typeof(btn[1]) != "string" && HTMLArea.is_ie) {
			var btnImgContainer = document.createElement("div");
			btnImgContainer.className = "buttonImgContainer";
			btnImgContainer.innerHTML = '<img src="' + btn[1][0] + '" style="position: relative; top: -' + (18*(btn[1][1]+1)) + 'px; left: -' + (18*(btn[1][2]+1)) + 'px;" alt="' + btn[0] + '" />';
			newObj["el"].appendChild(btnImgContainer);
		} else {
			newObj["el"].className += " " + txt;
			if (this.plugins["TYPO3Browsers"] && (txt == "CreateLink" || txt == "InsertImage")) newObj["el"].className += "-TYPO3Browsers";
		}
		newObj["created"] = true;
	}
	return newObj;
};

/*
 * Create a label and add it to the toolbar
 */
HTMLArea.createLabel = function(txt,tb_line,first_cell_on_line) {
	var newObj = {
		created : false,
		el : null,
		labelRef : false,
		first : first_cell_on_line
	};
	if (/^([IT])\[(.*?)\]/.test(txt)) {
		var l7ed = RegExp.$1 == "I"; // localized?
		var label = RegExp.$2;
		if (l7ed) label = HTMLArea.I18N.custom[label];
		newObj["el"] = document.createElement("label");
		newObj["el"].className = "label";
		newObj["el"].innerHTML = label;
		newObj["labelRef"] = true;
		newObj["created"] = true;
		newObj["first"] = HTMLArea.addTbElement(newObj["el"], tb_line, first_cell_on_line);
	}
	return newObj;
};

/*
 * Create the toolbar and append it to the _htmlarea.
 */
HTMLArea.prototype._createToolbar = function () {
	var j, k, code,
		tb_line = null,
		first_cell_on_line = true,
		labelObj = new Object(),
		tbObj = new Object(),
		tb_objects = new Object();

	var toolbar = document.createElement("div");
	this._toolbar = toolbar;
	toolbar.className = "toolbar";
	toolbar.unselectable = "1";
	this._htmlArea.appendChild(toolbar);
	this._toolbarObjects = tb_objects;

	for (j=0; j < this.config.toolbar.length; ++j) {
		tb_line = HTMLArea.newLine(toolbar);
		first_cell_on_line = true;
		var group = this.config.toolbar[j];
		for (k=0; k < group.length; ++k) {
			code = group[k];
			if (code == "linebreak") {
				tb_line = HTMLArea.newLine(toolbar);
				first_cell_on_line = true;
			} else {
				created = false;
				if (/^([IT])\[(.*?)\]/.test(code)) {
					labelObj = HTMLArea.createLabel(code, tb_line, first_cell_on_line);
					created = labelObj["created"] ;
					first_cell_on_line = labelObj["first"];
				}
				if (!created) {
					tbObj = this.createButton(code, tb_line, first_cell_on_line, labelObj);
					created = tbObj["created"];
					first_cell_on_line = tbObj["first"];
					if(tbObj["labelUsed"]) labelObj["labelRef"] = false;
				}
				if (!created) {
					tbObj = this.createSelect(code, tb_line, first_cell_on_line, labelObj);
					created = tbObj["created"];
					first_cell_on_line = tbObj["first"];
					if(tbObj["labelUsed"]) labelObj["labelRef"] = false;
				}
				if (!created) HTMLArea._appendToLog("ERROR [HTMLArea::createToolbar]: Unknown toolbar item: " + code);
			}
		}
	}
	
	tb_line = HTMLArea.newLine(toolbar);
};

/*
 * Handle toolbar element events
 */
HTMLArea.toolBarButtonHandler = function(ev) {
	if(!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	while (target.tagName.toLowerCase() == "img" || target.tagName.toLowerCase() == "div") target = target.parentNode;
	var obj = target._obj;
	var editorNumber = obj["editorNumber"];
	var editor = RTEarea[editorNumber]["editor"];
	if (obj.enabled) {
		switch (ev.type) {
			case "mouseover":
				HTMLArea._addClass(target, "buttonHover");
				break;
			case "mouseout":
				HTMLArea._removeClass(target, "buttonHover");
				HTMLArea._removeClass(target, "buttonActive");
				if (obj.active) HTMLArea._addClass(target, "buttonPressed");
				break;
			case "mousedown":
				HTMLArea._addClass(target, "buttonActive");
				HTMLArea._removeClass(target, "buttonPressed");
				HTMLArea._stopEvent(ev);
				break;
			case "click":
				HTMLArea._removeClass(target, "buttonActive");
				HTMLArea._removeClass(target, "buttonHover");
				obj.cmd(editor, obj.name, obj);
				HTMLArea._stopEvent(ev);
				break;
			case "change":
				editor.focusEditor();
				var value = target.options[target.selectedIndex].value;
				switch (obj.name) {
					case "FontName":
					case "FontSize": 
						editor.execCommand(obj.name, false, value);
						break;
					case "FormatBlock":
						(HTMLArea.is_ie || HTMLArea.is_safari) && (value = "<" + value + ">");
						editor.execCommand(obj.name, false, value);
						break;
					default:
						var dropdown = editor.config.customSelects[obj.name];
						if (typeof(dropdown) != "undefined") dropdown.action(editor);
							else HTMLArea._appendToLog("ERROR [HTMLArea::toolBarButtonHandler]: Combo box " + obj.name + " not registered.");
				}
		}
	}
};

/*
 * Create the status bar
 */
HTMLArea.prototype._createStatusBar = function() {
	var statusbar = document.createElement("div");
	statusbar.className = "statusBar";
	if (!this.config.statusBar) statusbar.style.display = "none";
	this._htmlArea.appendChild(statusbar);
	this._statusBar = statusbar;
	var statusBarTree = document.createElement("span");
	statusBarTree.className = "statusBarTree";
	this._statusBar.appendChild(statusBarTree);
	this._statusBarTree = statusBarTree;
	statusBarTree.appendChild(document.createTextNode(HTMLArea.I18N.msg["Path"] + ": "));
};

/*
 * Create the htmlArea iframe and replace the textarea with it.
 */
HTMLArea.prototype.generate = function () {

		// get the textarea and hide it
	var textarea = this._textArea;
	if (typeof(textarea) == "string") {
		textarea = HTMLArea.getElementById("textarea", textarea);
		this._textArea = textarea;
	}
	textarea.style.display = "none";

		// create the editor framework and insert the editor before the textarea
	var htmlarea = document.createElement("div");
	htmlarea.className = "htmlarea";
	htmlarea.style.width = textarea.style.width;
	this._htmlArea = htmlarea;
	textarea.parentNode.insertBefore(htmlarea, textarea);

	if(textarea.form) {
			// we have a form, on reset, re-initialize the HTMLArea content and update the toolbar
		var f = textarea.form;
		if (typeof(f.onreset) == "function") {
			var funcref = f.onreset;
			if (typeof(f.__msh_prevOnReset) == "undefined") f.__msh_prevOnReset = [];
			f.__msh_prevOnReset.push(funcref);
		}
		f._editorNumber = this._editorNumber;
		HTMLArea._addEvent(f, "reset", HTMLArea.resetHandler);
	}

		// create & append the toolbar
	this._createToolbar();
	HTMLArea._appendToLog("[HTMLArea::generate]: Toolbar successfully created.");

		// create and append the IFRAME
	var iframe = document.createElement("iframe");
	if(HTMLArea.is_ie || HTMLArea.is_safari || HTMLArea.is_wamcom) iframe.setAttribute("src",_editor_url + "popups/blank.html");
		else iframe.setAttribute("src","javascript:void(0);");
	iframe.className = "editorIframe";
	htmlarea.appendChild(iframe);
	this._iframe = iframe;

		// create & append the status bar
	this._createStatusBar();

		// size the width and height of the iframe according to user's prefs or initial textarea
	var height = (this.config.height == "auto" ? (textarea.style.height) : this.config.height);
	var textareaHeight = height;
	if(height.indexOf("%") == -1) {
		height = parseInt(height) - 2;
		if (this.config.sizeIncludesToolbar) {
			height -= this._toolbar.offsetHeight;
			height -= this._statusBar.offsetHeight;
		}
		if (height < 0) height = 0;
		textareaHeight = (height - 4);
		if (textareaHeight < 0) textareaHeight = 0;
		height += "px";
		textareaHeight += "px";
	}
	iframe.style.height = height;
	textarea.style.height = textareaHeight;
	var textareaWidth = (this.config.width == "auto" ? (textarea.style.width) : this.config.width);
	if(textareaWidth.indexOf("%") == -1) {
		textareaWidth = parseInt(textareaWidth) - 2;
		if (textareaWidth < 0) textareaWidth = 0;
		textareaWidth += "px";
	}
	iframe.style.width = "100%";
	textarea.style.width = textareaWidth;

	HTMLArea._appendToLog("[HTMLArea::generate]: Editor iframe successfully created.");
	this.initIframe();
	return this;
};

/*
 * Initialize the iframe
 */
HTMLArea.initIframe = function(editorNumber) {
	var editor = RTEarea[editorNumber]["editor"];
	editor.initIframe();
};

HTMLArea.prototype.initIframe = function() {
	if (this._initIframeTimer) window.clearTimeout(this._initIframeTimer);
	if (!this._iframe || (!this._iframe.contentWindow && !this._iframe.contentDocument)) {
		this._initIframeTimer = window.setTimeout("HTMLArea.initIframe(" + this._editorNumber + ");", 50);
		return false;
	} else if (this._iframe.contentWindow) {
		if (!this._iframe.contentWindow.document || !this._iframe.contentWindow.document.documentElement) {
			this._initIframeTimer = window.setTimeout("HTMLArea.initIframe(" + this._editorNumber + ");", 50);
			return false;
		}
	} else if (!this._iframe.contentDocument.documentElement) {
		this._initIframeTimer = window.setTimeout("HTMLArea.initIframe(" + this._editorNumber + ");", 50);
		return false;
	}
	var doc = this._iframe.contentWindow ? this._iframe.contentWindow.document : this._iframe.contentDocument;
	this._doc = doc;

	if (!this.config.fullPage) {
		var head = doc.getElementsByTagName("head")[0];
		if (!head) {
			head = doc.createElement("head");
			doc.documentElement.appendChild(head);
		}
		if (this.config.baseURL) {
			var base = doc.getElementsByTagName("base")[0];
			if (!base) {
				base = doc.createElement("base");
				base.href = this.config.baseURL;
				head.appendChild(base);
			}
		}
		var link0 = doc.getElementsByTagName("link")[0];
		if (!link0) {
 			link0 = doc.createElement("link");
			link0.rel = "stylesheet";
			link0.href = this.config.editedContentStyle;
			head.appendChild(link0);
		}
		if (this.config.pageStyle) {
			var link = doc.getElementsByTagName("link")[1];
			if (!link) {
 				link = doc.createElement("link");
				link.rel = "stylesheet";
				link.href = this.config.pageStyle;
				head.appendChild(link);
			}
		}
	} else {
		var html = this._textArea.value;
		this.setFullHTML(html);
	}
	HTMLArea._appendToLog("[HTMLArea::initIframe]: Editor iframe head successfully initialized.");

	this.stylesLoaded();
};

/*
 * Finalize editor Iframe initialization after loading the style sheets
 */
HTMLArea.stylesLoaded = function(editorNumber) {
	var editor = RTEarea[editorNumber]["editor"];
	editor.stylesLoaded();
};

HTMLArea.prototype.stylesLoaded = function() {
	var doc = this._doc;

		// check if the stylesheets have been loaded
	if (this._stylesLoadedTimer) window.clearTimeout(this._stylesLoadedTimer);
	var stylesAreLoaded = true;
	var rules;
	for (var rule = 0; rule < doc.styleSheets.length; rule++) {
		if (HTMLArea.is_gecko) try { rules = doc.styleSheets[rule].cssRules; } catch(e) { stylesAreLoaded = false; }
		if (HTMLArea.is_ie) try { rules = doc.styleSheets[rule].rules; } catch(e) { stylesAreLoaded = false; }
		if (HTMLArea.is_ie) try { rules = doc.styleSheets[rule].imports; } catch(e) { stylesAreLoaded = false; }
	}
	if (!stylesAreLoaded && !HTMLArea.is_wamcom) {
		this._stylesLoadedTimer = window.setTimeout("HTMLArea.stylesLoaded(" + this._editorNumber + ");", 100);
		return false;
	}
	HTMLArea._appendToLog("[HTMLArea::initIframe]: Stylesheets successfully loaded.");

	if (!this.config.fullPage) {
		doc.body.style.borderWidth = "0px";
		doc.body.className = "htmlarea-content-body";
		doc.body.innerHTML = this._textArea.value;
	}
		// Start undo snapshots
	this._timerUndo = window.setInterval("HTMLArea.undoTakeSnapshot(" + this._editorNumber + ");", this.config.undoTimeout);

		// Set contents editable
	if(HTMLArea.is_gecko && !HTMLArea.is_safari) {
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
				if (!(inTYPO3Tab && DTMDiv.style.display == "none")) doc.designMode = "on";
			} catch(e) {}
		} else {
			try { doc.designMode = "on"; }
			catch(e) {
				if (!(inTYPO3Tab && DTMDiv.style.display == "none")) {
					doc.open();
					doc.close();
					this._initIframeTimer = window.setTimeout("HTMLArea.initIframe(" + this._editorNumber + ");", 500);
					return false;
				}
			}
		}
	}
	if (HTMLArea.is_ie || HTMLArea.is_safari) doc.body.contentEditable = true;
	this._editMode = "wysiwyg";
	if (doc.body.contentEditable || doc.designMode == "on") HTMLArea._appendToLog("[HTMLArea::initIframe]: Design mode successfully set.");

		// set editor number in iframe and document for retrieval in event handlers
	doc._editorNo = this._editorNumber;
	if (HTMLArea.is_ie) doc.documentElement._editorNo = this._editorNumber;

	if (HTMLArea.is_gecko && inTYPO3Tab && !HTMLArea.is_safari) {
			// When the TYPO3 TCA feature div2tab is used, the editor iframe may become hidden with style.display = "none"
			// This breaks the editor in Mozilla/Firefox browsers: the designMode attribute needs to be resetted after the style.display of the containing div is resetted to "block"
			// Here we rely on TYPO3 naming conventions for the div id and class name
		HTMLArea._addEvent(DTMDiv, "DOMAttrModified", HTMLArea.DTMDivHandler(this, DTMDiv));
	}
		// intercept events for updating the toolbar & for keyboard handlers
	HTMLArea._addEvents(doc, ["keydown","keypress","mousedown","mouseup","drag"], HTMLArea._editorEvent);
	
		// add unload handler
	HTMLArea._addEvent((this._iframe.contentWindow ? this._iframe.contentWindow : this._iframe.contentDocument), "unload", HTMLArea.removeEditorEvents);

		// set killWordOnPaste and intercept paste, dragdrop and drop events for wordClean
	if (this.config.killWordOnPaste) HTMLArea._addEvents((HTMLArea.is_ie ? doc.body : doc), ["paste","dragdrop","drop"], HTMLArea.killWordOnPaste);

	window.setTimeout("HTMLArea.generatePlugins(" + this._editorNumber + ");", 100);
};

HTMLArea.generatePlugins = function(editorNumber) {
	var editor = RTEarea[editorNumber]["editor"];
		// check if any plugins have registered generate handlers
	for (var i in editor.plugins) {
		var plugin = editor.plugins[i].instance;
		if (typeof(plugin.onGenerate) == "function") plugin.onGenerate();
		if (typeof(plugin.onGenerateOnce) == "function") {
			plugin.onGenerateOnce();
			plugin.onGenerateOnce = null;
		}
	}
	if (typeof(editor.onGenerate) == "function") {
		editor.onGenerate();
		editor.onGenerate = null;
	}
	HTMLArea._appendToLog("[HTMLArea::initIframe]: All plugins successfully generated.");
	editor.updateToolbar();
};

/*
 * When we have a form, on reset, re-initialize the HTMLArea content and update the toolbar
 */
HTMLArea.resetHandler = function(ev) {
	if(!ev) var ev = window.event;
	var form = (ev.target) ? ev.target : ev.srcElement;
	var editor = RTEarea[form._editorNumber]["editor"];
	editor.setHTML(editor._textArea.value);
	editor.updateToolbar();
	var a = form.__msh_prevOnReset;
		// call previous reset methods if they were there.
	if (typeof(a) != "undefined") {
		for (var i=a.length; --i >= 0; ) { a[i](); }
	}
};

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
 * Clean up event handlers and object references, undo/redo snapshots, update the textarea for submission
 */
HTMLArea.removeEditorEvents = function(ev) {
	if(!ev) var ev = window.event;
	HTMLArea._stopEvent(ev);
	for (var ed = RTEarea.length; --ed > 0 ;) {
		var editor = RTEarea[ed]["editor"];
		if(editor) {
			RTEarea[ed]["editor"] = null;
				// save the HTML content into the original textarea for submit, back/forward, etc.
			editor._textArea.value = editor.getHTML();
				// release undo/redo snapshots
			window.clearInterval(editor._timerUndo);
			editor._undoQueue = null;
				// release events
			if (HTMLArea._eventCache) HTMLArea._eventCache.flush();
			
			if (HTMLArea.is_ie) {
					// nullify envent handlers
				for (var handler in editor.eventHandlers) editor.eventHandlers[handler] = null;
				for (var button in editor.btnList) editor.btnList[button][3] = null;
				editor.onGenerate = null;
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
			}
		}
	}
};

/*
 * Switch editor mode; parameter can be "textmode" or "wysiwyg".
 *  If no parameter was passed, toggle between modes.
 */
HTMLArea.prototype.setMode = function(mode) {
	if (typeof(mode) == "undefined") var mode = (this._editMode == "textmode") ? "wysiwyg" : "textmode";
	switch (mode) {
		case "textmode":
			this._textArea.value = this.getHTML();
			this._iframe.style.display = "none";
			this._textArea.style.display = "block";
			if(this.config.statusBar) {
				var statusBarTextMode = document.createElement("span");
				statusBarTextMode.className = "statusBarTextMode";
				statusBarTextMode.appendChild(document.createTextNode(HTMLArea.I18N.msg["TEXT_MODE"]));
				this._statusBar.innerHTML = '';
				this._statusBar.appendChild(statusBarTextMode);
			}
			break;
		case "wysiwyg":
			if(HTMLArea.is_gecko && !HTMLArea.is_safari) this._doc.designMode = "off";
			if(!this.config.fullPage) this._doc.body.innerHTML = this.getHTML();
				else this.setFullHTML(this.getHTML());
			this._textArea.style.display = "none";
			this._iframe.style.display = "block";
			if(HTMLArea.is_gecko && !HTMLArea.is_safari) this._doc.designMode = "on";
			if(this.config.statusBar) {
				this._statusBar.innerHTML = "";
				this._statusBar.appendChild(this._statusBarTree);
			}
			break;
		default:
			return false;
	}
	this._editMode = mode;
	this.focusEditor();
	for (var i in this.plugins) {
		var plugin = this.plugins[i].instance;
		if (typeof(plugin.onMode) == "function") { plugin.onMode(mode); }
	}
};

/*
 * Initialize iframe content when in full page mode
 */
HTMLArea.prototype.setFullHTML = function(html) {
	var save_multiline = RegExp.multiline;
	RegExp.multiline = true;
	if(html.match(HTMLArea.RE_doctype)) {
		this.setDoctype(RegExp.$1);
		html = html.replace(HTMLArea.RE_doctype, "");
	};
	RegExp.multiline = save_multiline;
	if(!HTMLArea.is_ie) {
		if(html.match(HTMLArea.RE_head)) this._doc.getElementsByTagName("head")[0].innerHTML = RegExp.$1;
		if(html.match(HTMLArea.RE_body)) this._doc.getElementsByTagName("body")[0].innerHTML = RegExp.$1;
	} else {
		var html_re = /<html>((.|\n)*?)<\/html>/i;
		html = html.replace(html_re, "$1");
		this._doc.open();
		this._doc.write(html);
		this._doc.close();
		this._doc.body.contentEditable = true;
		return true;
	};
};

/***************************************************
 *  PLUGINS, STYLESHEETS, AND IMAGE AND POPUP URL'S
 ***************************************************/

/*
 * Create the specified plugin and register it with this HTMLArea
 */
HTMLArea.prototype.registerPlugin = function() {
	var plugin = arguments[0];
	var args = [];
	for (var i=1; i < arguments.length; ++i) { args.push(arguments[i]); }
	this.registerPlugin2(plugin, args);
};

/*
 * A variant of the function above where the plugin arguments are already packed in an array.
 * Externally, it should be only used in the full-screen editor code, 
 * in order to initialize plugins with the same parameters as in the opener window.
 */
HTMLArea.prototype.registerPlugin2 = function(plugin, args) {
	if (typeof(plugin) == "string") {
		var plugin = eval(plugin);
	};
	if (typeof(plugin) == "undefined") {
		HTMLArea._appendToLog("ERROR [HTMLArea::registerPlugin]: Can't register undefined plugin.");
		return false;
	};
	var obj = new plugin(this, args);
	if (obj) {
		var clone = {};
		var info = plugin._pluginInfo;
		for (var i in info) {
			clone[i] = info[i];
		}
		clone.instance = obj;
		clone.args = args;
		this.plugins[plugin._pluginInfo.name] = clone;
	} else {
		HTMLArea._appendToLog("ERROR [HTMLArea::registerPlugin]: Can't register plugin " + plugin.toString() + ".");
	};
};

/*
 * Load the required plugin script and, unless not requested, the language file
 */
HTMLArea.loadPlugin = function(pluginName,noLangFile) {
	var dir = _editor_url + "plugins/" + pluginName;
	var plugin = pluginName.replace(/([a-z])([A-Z])([a-z])/g, "$1" + "-" + "$2" + "$3").toLowerCase() + ".js";
	var plugin_file = dir + "/" + plugin;
	HTMLArea._scripts.push(plugin_file);
	if (typeof(noLangFile) == "undefined" || !noLangFile) {
		var plugin_lang = dir + "/lang/" + _editor_lang + ".js";
		HTMLArea._scripts.push(plugin_lang);
	}
};

/*
 * Load a stylesheet file
 */
HTMLArea.loadStyle = function(style, plugin, url) {
	if (typeof(url) == "undefined") {
		var url = _editor_url || '';
		if (typeof(plugin) != "undefined") { url += "plugins/" + plugin + "/"; }
		url += style;
		if (/^\//.test(style)) { url = style; }
	}
	var head = document.getElementsByTagName("head")[0];
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url;
	head.appendChild(link);
};

/*
 * Load the editor skin
 */
HTMLArea.loadStyle('','',_editor_CSS);

/*
 * Get the url of some image
 */
HTMLArea.prototype.imgURL = function(file, plugin) {
	if (typeof(plugin) == "undefined") return _editor_skin + this.config.imgURL + file;
		else return _editor_skin + this.config.imgURL + plugin + "/" + file;
};

/*
 * Get the url of some popup
 */
HTMLArea.prototype.popupURL = function(file) {
	var url = "";
	if(file.match(/^plugin:\/\/(.*?)\/(.*)/)) {
		var plugin = RegExp.$1;
		var popup = RegExp.$2;
		if(!/\.html$/.test(popup)) popup += ".html";
		url = _editor_url + "plugins/" + plugin + "/popups/" + popup;
	} else {
		url = _typo3_host_url + _editor_url + this.config.popupURL + file;
	}
	return url;
};

/***************************************************
 *  EDITOR UTILITIES
 ***************************************************/
HTMLArea.getInnerText = function(el) {
	var txt = '', i;
	for(i=el.firstChild;i;i =i.nextSibling) {
		if(i.nodeType == 3) txt += i.data;
		else if(i.nodeType == 1) txt += HTMLArea.getInnerText(i);
	}
	return txt;
};

HTMLArea._wordClean = function(html) {
	function clearClass(node) {
		var newc = node.className.replace(/(^|\s)mso.*?(\s|$)/ig,' ');
		if(newc != node.className) {
			node.className = newc;
			if(!/\S/.test(node.className)) node.removeAttribute("className");
		}
	}
	function clearStyle(node) {
 		var declarations = node.style.cssText.split(/\s*;\s*/);
		for (var i = declarations.length; --i >= 0;) {
			if(/^mso|^tab-stops/i.test(declarations[i]) || /^margin\s*:\s*0..\s+0..\s+0../i.test(declarations[i])) declarations.splice(i,1);
		}
		node.style.cssText = declarations.join("; ");
	}
	function stripTag(el) {
		if(HTMLArea.is_ie) {
			el.outerHTML = HTMLArea.htmlEncode(el.innerText);
		} else {
			var txt = document.createTextNode(HTMLArea.getInnerText(el));
			el.parentNode.insertBefore(txt,el);
			el.parentNode.removeChild(el);
		}
	}
	function checkEmpty(el) {
		if(/^(span|b|strong|i|em|font)$/i.test(el.tagName) && !el.firstChild) el.parentNode.removeChild(el);
	}
	function parseTree(root) {
		var tag = root.tagName.toLowerCase(), i, next;
		if((HTMLArea.is_ie && root.scopeName != 'HTML') || (!HTMLArea.is_ie && /:/.test(tag))) {
			stripTag(root);
			return false;
		} else {
			clearClass(root);
			clearStyle(root);
			for (i=root.firstChild;i;i=next) {
				next = i.nextSibling;
				if(i.nodeType == 1 && parseTree(i)) { checkEmpty(i); }
			}
		}
		return true;
	}
	parseTree(html);
};

HTMLArea.wordCleanLater = function(editorNumber,doUpdateToolbar) {
	var editor = RTEarea[editorNumber]["editor"];
	HTMLArea._wordClean(editor._doc.body);
	if (doUpdateToolbar) editor.updateToolbar();
};

/*
 * Handler for paste, dragdrop and drop events
 */
HTMLArea.killWordOnPaste = function(ev) {
	if(!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var owner = (target.ownerDocument) ? target.ownerDocument : target;
	while (HTMLArea.is_ie && owner.parentElement ) { // IE5.5 does not report any ownerDocument
		owner = owner.parentElement;
	}
		// if we dropped an image dragged from the TYPO3 Browser, let's close the browser window
	if (typeof(browserWin) != "undefined") browserWin.close();
	window.setTimeout("HTMLArea.wordCleanLater(" + owner._editorNo + ", true);", 250);
};

HTMLArea.prototype.forceRedraw = function() {
	this._doc.body.style.visibility = "hidden";
	this._doc.body.style.visibility = "visible";
};

/*
 * Focus the editor iframe document or the textarea.
 */
HTMLArea.prototype.focusEditor = function() {
	switch (this._editMode) {
		case "wysiwyg" :
			try { 
				if(HTMLArea.is_safari) this._doc.focus();
					else this._iframe.contentWindow.focus();
			} catch(e) { };
			break;
		case "textmode":
			this._textArea.focus();
			break;
	}
	return this._doc;
};

HTMLArea.undoTakeSnapshot = function(editorNumber) {
	var editor = RTEarea[editorNumber]["editor"];
	if (editor._doc) editor._undoTakeSnapshot();
};

/*
 * Take a snapshot of the current contents for undo
 */
HTMLArea.prototype._undoTakeSnapshot = function() {
	var curTime = (new Date()).getTime();
	var newOne = true;
	if(this._undoPos >= this.config.undoSteps) {
			// remove the first element
		this._undoQueue.shift();
		--this._undoPos;
	}
		// New undo slot should be used if this is first undoTakeSnapshot call or if undoTimeout is elapsed
	if (this._undoPos < 0 || this._undoQueue[this._undoPos].time < curTime - this.config.undoTimeout) {
		++this._undoPos;
	} else {
		newOne = false;
	}
 		// use the fasted method (getInnerHTML);
 	var txt = this.getInnerHTML();
	if (newOne){
			// If previous slot contain same text new one should not be used
		if(this._undoPos == 0 || this._undoQueue[this._undoPos - 1].text != txt){
			this._undoQueue[this._undoPos] = { text: txt, time: curTime };
			this._undoQueue.length = this._undoPos + 1;
		} else {
			this._undoPos--;
		}
 	} else {
		if(this._undoQueue[this._undoPos].text != txt){
			this._undoQueue[this._undoPos].text = txt;
			this._undoQueue.length = this._undoPos + 1;
		}
 	}
};

HTMLArea.prototype.undo = function() {
	if(this._undoPos > 0){
			// Make sure we would not loose any changes
		this._undoTakeSnapshot();
		this.setHTML(this._undoQueue[--this._undoPos].text);
	}
};

HTMLArea.prototype.redo = function() {
	if(this._undoPos < this._undoQueue.length - 1) {
			// Make sure we would not loose any changes
		this._undoTakeSnapshot();
			// Previous call could make undo queue shorter
		if(this._undoPos < this._undoQueue.length - 1) this.setHTML(this._undoQueue[++this._undoPos].text);
	}
};

/*
 * Update the enabled/disabled/active state of the toolbar elements
 */
HTMLArea.updateToolbar = function(editorNumber) {
	var editor = RTEarea[editorNumber]["editor"];
	editor.updateToolbar();
	editor._timerToolbar = null;
};

HTMLArea.prototype.updateToolbar = function(noStatus) {
	var doc = this._doc,
		text = (this._editMode == "textmode"),
		selection = this.hasSelectedText(),
		ancestors = null, cls = new Array(),
		txt, txtClass, i, ia, cmd, inContext, match, k, ka, j, n, commandState;
	if(!text) {
		ancestors = this.getAllAncestors();
		if(this.config.statusBar && !noStatus) {
				// Unhook previous events handlers
			if(this._statusBarTree.hasChildNodes()) {
				for (i=this._statusBarTree.firstChild;i;i=i.nextSibling) {
					if(i.nodeName.toLowerCase() == "a") {
						HTMLArea._removeEvents(i,["click", "contextmenu"],HTMLArea.statusBarHandler);
						i.el = null;
						i.editor = null;
					}
				}
			}
			this._statusBarTree.innerHTML = '';
			this._statusBarTree.appendChild(document.createTextNode(HTMLArea.I18N.msg["Path"] + ": ")); // clear
			for (i = ancestors.length; --i >= 0;) {
				var el = ancestors[i];
				if(!el) continue;
				var a = document.createElement("a");
				a.href = "#";
				a.el = el;
				a.editor = this;
				HTMLArea._addEvents(a, ["click", "contextmenu"], HTMLArea.statusBarHandler);
				txt = el.tagName.toLowerCase();
				a.title = el.style.cssText;
				if (el.id) { txt += "#" + el.id; }
				if (el.className) {
					txtClass = "";
					cls = el.className.trim().split(" ");
					for(ia = cls.length; ia > 0;) {
						if(!HTMLArea.reservedClassNames.test(cls[--ia])) { txtClass = "." + cls[ia]; }
					}
					txt += txtClass;
				}
				a.appendChild(document.createTextNode(txt));
				this._statusBarTree.appendChild(a);
				if (i != 0) this._statusBarTree.appendChild(document.createTextNode(String.fromCharCode(0xbb)));
			}
		}
	}
	for (i in this._toolbarObjects) {
		var btn = this._toolbarObjects[i];
		cmd = i;
		inContext = true;
		if(btn.context && !text) {
			inContext = false;
			var context = btn.context;
			var attrs = [];
			if(/(.*)\[(.*?)\]/.test(context)) {
				context = RegExp.$1;
				attrs = RegExp.$2.split(",");
			}
			context = context.toLowerCase();
			match = (context == "*");
			for (k=0;k < ancestors.length;++k) {
				if (!ancestors[k]) {continue;};
				if (match || (ancestors[k].tagName.toLowerCase() == context)) {
					inContext = true;
					for (ka=0;ka < attrs.length;++ka) {
						if (!eval("ancestors[k]." + attrs[ka])) {
							inContext = false;
							break;
						}
					}
					if (inContext) { break; }
				}
			}
		}
		btn.state("enabled", (!text || btn.text) && inContext && (selection || !btn.selection));
		if (typeof(cmd) == "function") { continue; };
			// look-it-up in the custom dropdown boxes
		var dropdown = this.config.customSelects[cmd];
		if((!text || btn.text) && (typeof(dropdown) != "undefined")) {
			dropdown.refresh(this);
			continue;
		}
		switch (cmd) {
		    case "FontName":
		    case "FontSize":
		    case "FormatBlock":
			if(!text) try {
				var value = ("" + doc.queryCommandValue(cmd)).toLowerCase();
				if(!value) {
					document.getElementById(btn.elementId).selectedIndex = 0;
					break;
				}
					// IE gives the labels as value and seems to translate the headings labels!
					// This will work at least in English and French...
				if(HTMLArea.is_ie && cmd == "FormatBlock" && value != "normal") {
					var heading = false;
					n = 0;
					while(n<7 && !heading ) { 
						n++;
						if(value.indexOf(n) != -1) {
							value = "h"+n;
							heading = true;
						}
					}
					value = heading ? value : "pre";
				}
					// We rely on the fact that the variable in config has the same name as button name in the toolbar.
				var options = this.config[cmd];
				k = 0;
				for (j in options) {
					// FIXME: the following line is scary.
					if((j.toLowerCase() == value) ||
						   (options[j].substr(0, value.length).toLowerCase() == value)) {
						document.getElementById(btn.elementId).selectedIndex = k;
						throw "ok";
					}
					++k;
				}
				document.getElementById(btn.elementId).selectedIndex = 0;
			} catch(e) {}
			break;
		    case "textindicator":
			if(!text) {
				try {with (document.getElementById(btn.elementId).style) {
					backgroundColor = HTMLArea._makeColor(doc.queryCommandValue((HTMLArea.is_ie || HTMLArea.is_safari) ? "BackColor" : "HiliteColor"));
						// Mozilla
					if(/transparent/i.test(backgroundColor)) { backgroundColor = HTMLArea._makeColor(doc.queryCommandValue("BackColor")); }
					color = HTMLArea._makeColor(doc.queryCommandValue("ForeColor"));
					fontFamily = doc.queryCommandValue("FontName");
						// Check if queryCommandState is available
					fontWeight = "normal";
					fontStyle = "normal";
					try { fontWeight = doc.queryCommandState("Bold") ? "bold" : "normal"; } catch(ex) { fontWeight = "normal"; };
					try { fontStyle = doc.queryCommandState("Italic") ? "italic" : "normal"; } catch(ex) { fontStyle = "normal"; };
				}} catch (e) {
					// alert(e + "\n\n" + cmd);
				}
			}
			break;
		    case "htmlmode": btn.state("active", text); break;
		    case "LeftToRight":
		    case "RightToLeft":
			var el = this.getParentElement();
			while (el && !HTMLArea.isBlockElement(el)) { el = el.parentNode; }
			if (el) btn.state("active",(el.style.direction == ((cmd == "RightToLeft") ? "rtl" : "ltr")));
			break;
		    case "Bold":
		    case "Italic":
		    case "StrikeThrough":
		    case "Underline":
		    case "Subscript":
		    case "Superscript":
		    case "JustifyLeft":
		    case "JustifyCenter":
		    case "JustifyRight":
		    case "JustifyFull":
		    case "Indent":
		    case "Outdent":
		    case "InsertOrderedList":
		    case "InsertUnorderedList":
			commandState = false;
			if(!text) try { commandState = doc.queryCommandState(cmd); } catch(e) { commandState = false; }
			btn.state("active",commandState);
			break;
		    default: break;
		}
	}
	if (this._customUndo) this._undoTakeSnapshot();
	for (i in this.plugins) {
		var plugin = this.plugins[i].instance;
		if (typeof(plugin.onUpdateToolbar) == "function") plugin.onUpdateToolbar();
	}
};

/*
 * Handle statusbar element events
 */
HTMLArea.statusBarHandler = function (ev) {
	if(!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var editor = target.editor;
	target.blur();
	if(HTMLArea.is_gecko) {
		editor.selectNode(target.el);
	} else { 
		var tagname = target.el.tagName.toLowerCase();
		if(tagname == "table" || tagname == "img") {
			var range = editor._doc.body.createControlRange();
			range.addElement(target.el);
			range.select();
		} else {
			editor.selectNode(target.el);
		}
	}
	editor.updateToolbar(true);
	switch (ev.type) {
		case "click" : return false;
		case "contextmenu" : return editor.plugins["ContextMenu"].instance.popupMenu(ev,target.el);
	}
};

/***************************************************
 *  DOM TREE MANIPULATION
 ***************************************************/
/*
 * Insert a node at the current position.
 * Deletes the current selection, if any.
 * Splits the text node, if needed.
 */
HTMLArea.prototype.insertNodeAtSelection = function(toBeInserted) {
	if(!HTMLArea.is_ie) {
		this.focusEditor();
		var 	sel = this._getSelection(),
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
	} else {
		var sel = this._getSelection();
		var range = this._createRange(sel);
		range.pasteHTML(toBeInserted.outerHTML);
	}
};

/*
 * Get the deepest node that contains both endpoints of the current selection.
 */
HTMLArea.prototype.getParentElement = function(sel) {
	if(!sel) var sel = this._getSelection();
	var range = this._createRange(sel);
	if(HTMLArea.is_ie) {
		switch(sel.type) {
			case "Text":
			case "None":
				var el = range.parentElement();
				if(el.nodeName.toLowerCase() == "li" && range.htmlText.replace(/\s/g,"") == el.parentNode.outerHTML.replace(/\s/g,"")) return el.parentNode;
				return el;
			case "Control": return range.item(0);
			default: return this._doc.body;
		}
	}
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

/*
 * Get an array with all the ancestor nodes of the selection.
 */
HTMLArea.prototype.getAllAncestors = function() {
	var p = this.getParentElement();
	var a = [];
	while (p && (p.nodeType == 1) && (p.tagName.toLowerCase() != 'body')) {
		a.push(p);
		p = p.parentNode;
	}
	a.push(this._doc.body);
	return a;
};

/*
 * Get the deepest ancestor of the selection that is of the specified type
 * Borrowed from Xinha (is not htmlArea) - http://xinha.gogo.co.nz/
 */
HTMLArea.prototype._getFirstAncestor = function(sel,types) {
	var prnt = this._activeElement(sel);
	if (prnt == null) {
		try { 
			prnt = (HTMLArea.is_ie ? this._createRange(sel).parentElement() : this._createRange(sel).commonAncestorContainer);
		} catch(e) {
			return null;
		}
	}
	if (typeof(types) == 'string') types = [types];

	while (prnt) {
		if (prnt.nodeType == 1) {
			if (types == null) return prnt;
			for (var i = 0; i < types.length; i++) { 
				if(prnt.tagName.toLowerCase() == types[i]) return prnt;
			}
			if(prnt.tagName.toLowerCase() == 'body') break;
			if(prnt.tagName.toLowerCase() == 'table') break;
		}
		prnt = prnt.parentNode;
	}
	return null;
};

/*
 * Get the selected element, if any.  That is, the element that you have last selected in the "path"
 * at the bottom of the editor, or a "control" (eg image)
 *
 * @returns null | element
 * Borrowed from Xinha (is not htmlArea) - http://xinha.gogo.co.nz/
 */
HTMLArea.prototype._activeElement = function(sel) {
	if(sel == null) return null;
	if(this._selectionEmpty(sel)) return null;
	if(HTMLArea.is_ie) {
		if(sel.type.toLowerCase() == "control") {
			return sel.createRange().item(0);
		} else {
			// If it's not a control, then we need to see if the selection is the _entire_ text of a parent node
			// (this happens when a node is clicked in the tree)
			var range = sel.createRange();
			var p_elm = this.getParentElement(sel);
			if(p_elm.innerHTML == range.htmlText) return p_elm;
			return null;
    		}
	} else {
		// For Mozilla we just see if the selection is not collapsed (something is selected)
		// and that the anchor (start of selection) is an element.  This might not be totally
		// correct, we possibly should do a simlar check to IE?
		if(!sel.isCollapsed) {
			if(sel.anchorNode.nodeType == 1) return sel.anchorNode;
		}
	return null;
	}
};

HTMLArea.prototype._selectionEmpty = function(sel) {
	if (!sel) return true;
	if (HTMLArea.is_ie) {
		return this._createRange(sel).htmlText == '';
	} else if (typeof(sel.isCollapsed) != 'undefined') {
		return sel.isCollapsed;
	}
	return true;
};

/* 
 * Insert HTML source code at the current position.
 * Deletes the current selection, if any.
 */
HTMLArea.prototype.insertHTML = function(html) {
	this.focusEditor();
	if(HTMLArea.is_ie) {
		var sel = this._getSelection();
		var range = this._createRange(sel);
		range.pasteHTML(html);
	} else {
		var fragment = this._doc.createDocumentFragment();
		var div = this._doc.createElement("div");
		div.innerHTML = html;
		while (div.firstChild) {fragment.appendChild(div.firstChild);}
		this.insertNodeAtSelection(fragment);
	}
};

/* 
 * Surround the currently selected HTML source code with the given tags.
 * Deletes the selection, if any.
 */
HTMLArea.prototype.surroundHTML = function(startTag,endTag) {
	this.insertHTML(startTag + this.getSelectedHTML().replace(HTMLArea.Reg_body, "") + endTag);
};

/***************************************************
 *  SELECTIONS AND RANGES
 ***************************************************/
/*
 * Get the current selection object
 */
HTMLArea.prototype._getSelection = function() {
	if(HTMLArea.is_ie) return this._doc.selection;
	if(HTMLArea.is_safari) return window.getSelection();
	return this._iframe.contentWindow.getSelection();
};

/*
 * Create a range for the current selection
 */
HTMLArea.prototype._createRange = function(sel) {
	if (HTMLArea.is_ie) {
		if (typeof(sel) != "undefined") return sel.createRange();
		return this._doc.selection.createRange();
	}
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
	if(HTMLArea.is_ie) {
		var range = this._doc.body.createTextRange();
		range.moveToElementText(node);
		range.select();
	} else {
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
	}
};

/*
 * Select ONLY the contents inside the given node
 */
HTMLArea.prototype.selectNodeContents = function(node,pos) {
	this.focusEditor();
	this.forceRedraw();
	var collapsed = (typeof(pos) != "undefined");
	if (HTMLArea.is_ie) {
		var range = this._doc.body.createTextRange();
		range.moveToElementText(node);
		(collapsed) && range.collapse(pos);
		range.select();
	} else {
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
	}
};

/*
 * Retrieve the HTML contents of selected block
 */
HTMLArea.prototype.getSelectedHTML = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	if (HTMLArea.is_ie) {
		if (sel.type.toLowerCase() == "control") {
			var r1 = this._doc.body.createTextRange();
			r1.moveToElementText(range(0));
			return r1.htmlText;
		} else {
			return range.htmlText;
		}
	} else {
		var cloneContents = "";
		try {cloneContents = range.cloneContents();} catch(e) { }
		return (cloneContents ? HTMLArea.getHTML(cloneContents,false,this) : "");
	}
};

/*
 * Retrieves simply HTML contents of the selected block, IE ignoring control ranges
 */
HTMLArea.prototype.getSelectedHTMLContents = function() {
	if (HTMLArea.is_ie) {
		var sel = this._getSelection();
		var range = this._createRange(sel);
		return range.htmlText;
	} else {
		return this.getSelectedHTML();
	}
};

/*
 * Return true if we have some selected content
 */
HTMLArea.prototype.hasSelectedText = function() {
	return this.getSelectedHTML() != "";
};

/*
 * Get the create link action function
 */
HTMLArea.createLinkDialog = function(editor,link) {
	return (function(param) {
		if (!param || typeof(param.f_href) == "undefined") return false;
		var a = link;
		if(!a) try {
			editor._doc.execCommand("CreateLink",false,param.f_href);
			a = editor.getParentElement();
			var sel = editor._getSelection();
			var range = editor._createRange(sel);
			if (!HTMLArea.is_ie) {
				a = range.startContainer;
				if (!/^a$/i.test(a.tagName)) {
					a = a.nextSibling;
					if(a == null) a = range.startContainer.parentNode;
				}
			}
		} catch(e) {}
		else {
			var href = param.f_href.trim();
			editor.selectNodeContents(a);
			if (href == "") {
				editor._doc.execCommand("Unlink", false, null);
				editor.updateToolbar();
				return false;
			}
			else {
				a.href = href;
			}
		}
		if (!(a && /^a$/i.test(a.tagName))) return false;
		if (typeof(param.f_target) != "undefined") a.target = param.f_target.trim();
		if (typeof(param.f_title) != "undefined") a.title = param.f_title.trim();
		editor.selectNodeContents(a);
		editor.updateToolbar();
		editor = null;
		link = null;
	});
};

/*
 * Process the create link request
 */
HTMLArea.prototype._createLink = function(link) {
	var outparam = null;
	this.focusEditor();
	if (typeof(link) == "undefined") {
		link = this.getParentElement();
		if(link) {
			if(/^img$/i.test(link.tagName)) link = link.parentNode;
			if(!/^a$/i.test(link.tagName)) link = null;
		}
	}
	if (!link) {
		var sel = this._getSelection();
		var range = this._createRange(sel);
		var compare = 0;
		compare = HTMLArea.is_ie ? range.compareEndPoints("StartToEnd", range) : range.compareBoundaryPoints(range.START_TO_END, range);
		if (compare == 0) {
			alert("You need to select some text before creating a link");
			return;
		}
		outparam = {
			f_href : '',
			f_title : '',
			f_target : '',
			f_usetarget : this.config.makeLinkShowsTarget
		};
	} else {
		outparam = {
			f_href   : HTMLArea.is_ie ? this.stripBaseURL(link.href) : link.getAttribute("href"),
			f_title  : link.title,
			f_target : link.target,
			f_usetarget : this.config.makeLinkShowsTarget
		};
	}
	var createLinkDialogFunctRef = HTMLArea.createLinkDialog(this, link);
	this._popupDialog("link.html", createLinkDialogFunctRef, outparam, 400, 145);
};

/*
 * Get the insert image action function
 */
HTMLArea.insertImageDialog = function(editor,image) {
	return (function(param) {
		if (!param || typeof(param.f_url) == "undefined") return false;
		var img = image;
		if (!img) {
			var sel = editor._getSelection();
			var range = editor._createRange(sel);
			editor._doc.execCommand("InsertImage",false,param.f_url);
			if(HTMLArea.is_ie) {
				img = range.parentElement();
				if(img.tagName.toLowerCase() != "img") img = img.previousSibling;
			} else {
				img = range.startContainer.previousSibling;
			}
		} else {
			img.src = param.f_url;
		}

		for (var field in param) {
			var value = param[field];
			switch (field) {
				case "f_alt"    : img.alt	 = value; break;
				case "f_border" : img.border = parseInt(value || "0"); break;
				case "f_align"  : img.align	 = value; break;
				case "f_vert"   : img.vspace = parseInt(value || "0"); break;
				case "f_horiz"  : img.hspace = parseInt(value || "0"); break;
				case "f_float"  : if (HTMLArea.is_ie) { img.style.styleFloat = value; }  else { img.style.cssFloat = value;}; break; 
			}
		}
		editor = null;
		image = null;
	});
};

/*
 * Called when the "InsertImage" button is clicked.
 * If an image is already there, it will just modify it's properties.
 */
HTMLArea.prototype._insertImage = function(image) {
	var outparam = null;
	this.focusEditor();
	if (typeof(image) == "undefined") {
		var image = this.getParentElement();
		if(image && !/^img$/i.test(image.tagName)) image = null;
	}
	if(image) outparam = {
		f_base		: this.config.baseURL,
		f_url		: HTMLArea.is_ie ? this.stripBaseURL(image.src) : image.getAttribute("src"),
		f_alt		: image.alt,
		f_border	: image.border,
		f_align 	: image.align,
		f_vert		: image.vspace,
		f_horiz 	: image.hspace,
 		f_float 	: HTMLArea.is_ie ? image.style.styleFloat : image.style.cssFloat
	};
	var insertImageDialogFunctRef = HTMLArea.insertImageDialog(this, image);
	this._popupDialog("insert_image.html", insertImageDialogFunctRef, outparam, 580, 460);
};

/*
 * Get the insert table action function
 */
HTMLArea.insertTableDialog = function(editor, sel, range) {
	return (function(param) {
		if(!param) return false;
		var doc = editor._doc;
		var table = doc.createElement("table");
		for (var field in param) {
			var value = param[field];
			if(!value) continue;
			switch (field) {
				case "f_width"   : table.style.width = value + param["f_unit"]; break;
				case "f_align"   : table.style.textAlign = value; break;
				case "f_border"  : 
					if(parseInt(value)) {
						table.style.borderWidth	 = parseInt(value)+"px";
						table.style.borderStyle = "solid";
					}
					break;
				case "f_spacing" : table.cellSpacing = parseInt(value); break;
				case "f_padding" : table.cellPadding = parseInt(value); break;
				case "f_float"   : 
					if (HTMLArea.is_ie) table.style.styleFloat = ((value != "not set") ? value : "");
						else table.style.cssFloat = ((value != "not set") ? value : "");
					break;
			}
		}
		var cellwidth = 0;
		if(param.f_fixed) cellwidth = Math.floor(100 / parseInt(param.f_cols));
		var tbody = doc.createElement("tbody");
		table.appendChild(tbody);
		for (var i=0;i < param["f_rows"];++i) {
			var tr = doc.createElement("tr");
			tbody.appendChild(tr);
			for (var j=0;j < param["f_cols"];++j) {
				var td = doc.createElement("td");
				if (cellwidth) { td.style.width = cellwidth + "%"; }
				tr.appendChild(td);
			}
		}
		editor.focusEditor();
		if(HTMLArea.is_ie) range.pasteHTML(table.outerHTML);
			else editor.insertNodeAtSelection(table);
		editor.forceRedraw();
		if (HTMLArea.is_gecko && !HTMLArea.is_safari) editor.setMode("wysiwyg");
		editor.updateToolbar();
		editor = null;
		sel = null;
		range = null;
		return true;
	});
};

/*
 * Process insert table request
 */
HTMLArea.prototype._insertTable = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	this.focusEditor();
	var insertTableDialogFunctRef = HTMLArea.insertTableDialog(this, sel, range);
	this._popupDialog("insert_table.html", insertTableDialogFunctRef, null, 520, 230);
};

/***************************************************
 *  Category: EVENT HANDLERS
 ***************************************************/
HTMLArea.selectColorDialog = function(editor,cmdID) {
	return (function(color) {
		if(color) editor._doc.execCommand(cmdID, false, "#" + color);
	});
};

/*
 * Intercept some commands and replace them with our own implementation
 */
HTMLArea.prototype.execCommand = function(cmdID, UI, param) {
	this.focusEditor();
	if(HTMLArea.is_gecko && !this.config.useCSS && !HTMLArea.is_safari) try { this._doc.execCommand('useCSS', false, true); } catch (e) {};
	switch (cmdID) {
	    case "htmlmode"	: this.setMode(); break;
	    case "HiliteColor"	:
		(HTMLArea.is_ie || HTMLArea.is_safari) && (cmdID = "BackColor");
	    case "ForeColor"	:
		var colorDialogFunctRef = HTMLArea.selectColorDialog(this, cmdID);
		this._popupDialog("select_color.html", colorDialogFunctRef, HTMLArea._colorToRgb(this._doc.queryCommandValue(cmdID)), 200, 182);
		break;
	    case "CreateLink"	:
		this._createLink();
		break;
	    case "Undo"		:
	    case "Redo"		:
		if(this._customUndo) this[cmdID.toLowerCase()]();
			else this._doc.execCommand(cmdID,UI,param);
		break;
	    case "InsertTable"	: this._insertTable(); break;
	    case "InsertImage"	: this._insertImage(); break;
	    case "about"	: this._popupDialog("about.html", null, this,475,350); break;
	    case "showhelp"	: window.open(_editor_url + "reference.html","ha_help"); break;
	    case "killword"	: HTMLArea._wordClean(this._doc.body); break;
	    case "Cut"		:
	    case "Copy"		:
	    case "Paste"	:
		try {
			this._doc.execCommand(cmdID,false,null);
			if (cmdID == "Paste" && this.config.killWordOnPaste) HTMLArea._wordClean(this._doc.body);
		} catch (e) {
			if (HTMLArea.is_gecko && !HTMLArea.is_safari) {
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
								HTMLArea._mozillaXpi["AllowClipboard Helper"] = "http://ftp.mozilla.org/pub/mozilla.org/extensions/allowclipboard_helper/allowclipboard_helper-0.1-fx.xpi";
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
		}
		break;
	    case "LeftToRight":
	    case "RightToLeft":
		var dir = (cmdID == "RightToLeft") ? "rtl" : "ltr";
		var el = this.getParentElement();
		while (el && !HTMLArea.isBlockElement(el)) el = el.parentNode;
		if(el) {
			if(el.style.direction == dir) el.style.direction = "";
				else el.style.direction = dir;
		}
		break;
	    default: try { this._doc.execCommand(cmdID, UI, param); }
		catch(e) { if(this.config.debug) alert(e + "\n\nby execCommand(" + cmdID + ");"); }
	}
	this.updateToolbar();
	return false;
};

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
* A generic event handler for things that happen in the IFRAME's document.
* This function also handles key bindings.
*/
HTMLArea._editorEvent = function(ev) {
	if(!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var owner = (target.ownerDocument) ? target.ownerDocument : target;
	while (HTMLArea.is_ie && owner.parentElement ) { // IE5.5 does not report any ownerDocument
		owner = owner.parentElement;
	}
	var editor = RTEarea[owner._editorNo]["editor"];
	var keyEvent = ((HTMLArea.is_ie || HTMLArea.is_safari) && ev.type == "keydown") || (!HTMLArea.is_ie && ev.type == "keypress");
	editor.focusEditor();

	if(keyEvent) {
		for (var i in editor.plugins) {
			var plugin = editor.plugins[i].instance;
			if (typeof(plugin.onKeyPress) == "function") {
				if (plugin.onKeyPress(ev)) return false;
			}
		}
	}
	if(keyEvent && ev.ctrlKey && !ev.altKey) {
		var sel = null;
		var range = null;
		var key = String.fromCharCode((HTMLArea.is_ie || HTMLArea.is_safari) ? ev.keyCode : ev.charCode).toLowerCase();
		var cmd = null;
		var value = null;
		switch (key) {
		    case 'a':
			if(!HTMLArea.is_ie) {
				// KEY select all
				sel = editor._getSelection();
				range = editor._createRange();
				range.selectNodeContents(editor._doc.body);
				if(HTMLArea.is_safari) {
					sel.empty();
					sel.setBaseAndExtent(range.startContainer,range.startOffset,range.endContainer,range.endOffset);
				} else {
					sel.removeAllRanges();
					sel.addRange(range);
				}
				HTMLArea._stopEvent(ev);
			}
			break;
				// simple key commands follow
		    case 'b': cmd = "Bold"; break;
		    case 'i': cmd = "Italic"; break;
		    case 'u': cmd = "Underline"; break;
		    case 's': cmd = "StrikeThrough"; break;
		    case 'l': cmd = "JustifyLeft"; break;
		    case 'e': cmd = "JustifyCenter"; break;
		    case 'r': cmd = "JustifyRight"; break;
		    case 'j': cmd = "JustifyFull"; break;
		    case 'z': cmd = "Undo"; break;
		    case 'y': cmd = "Redo"; break;
		    case 'v': 
				if(HTMLArea.is_ie || HTMLArea.is_safari) {
					 cmd = "Paste";
				} else if(editor.config.killWordOnPaste) {
					window.setTimeout("HTMLArea.wordCleanLater(" + owner._editorNo + ", false);", 50);
				}
				break;
		    case 'n': cmd = "FormatBlock"; value = (HTMLArea.is_ie || HTMLArea.is_safari) ? "<p>" : "p"; break;
		    case '0': cmd = "killword"; break;

			// headings
		    case '1':
		    case '2':
		    case '3':
		    case '4':
		    case '5':
		    case '6':
			cmd = "FormatBlock";
			value = "h" + key;
			if(HTMLArea.is_ie || HTMLArea.is_safari) value = "<" + value + ">";
			break;
		    case '-':  // Soft hyphen
			editor.focusEditor();
			editor.insertHTML('&shy;');
			HTMLArea._stopEvent(ev);
			break;
		}
		if(cmd) {
			// execute simple command
			editor.execCommand(cmd, false, value);
			HTMLArea._stopEvent(ev);
		}
/*
		if (ev.keyCode == 45) { // Soft hyphen
			editor.focusEditor();
			editor.insertHTML('&shy;');
			HTMLArea._stopEvent(ev);
		}
*/
	} else if (keyEvent) {

		if(HTMLArea.is_gecko) {
/*
 * Detect emails and urls as they are typed in Mozilla
 * Borrowed from Xinha (is not htmlArea) - http://xinha.gogo.co.nz/
 */
			var s = editor._getSelection();
			var autoWrap = function (textNode, tag) {
				var rightText = textNode.nextSibling;
				if (typeof(tag) == 'string') tag = editor._doc.createElement(tag);
				var a = textNode.parentNode.insertBefore(tag, rightText);
				textNode.parentNode.removeChild(textNode);
				a.appendChild(textNode);
				rightText.data = ' ' + rightText.data;
// Not yet revised for Safari
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
		}
		// other keys here
		switch (ev.keyCode) {
		    case 13: // KEY enter
			if(HTMLArea.is_gecko && !ev.shiftKey && !editor.config.disableEnterParagraphs) {
				editor.dom_checkInsertP();
				HTMLArea._stopEvent(ev);
			}
			break;
		    case 8: // KEY backspace
		    case 46: // KEY delete
			if(HTMLArea.is_gecko && !ev.shiftKey) {
				if(editor.dom_checkBackspace()) HTMLArea._stopEvent(ev);
			} else if(HTMLArea.is_ie) {
				if(editor.ie_checkBackspace()) HTMLArea._stopEvent(ev);
			}
			break;
		}
	}

		// update the toolbar state after some time
	if (editor._timerToolbar) window.clearTimeout(editor._timerToolbar);
	editor._timerToolbar = window.setTimeout("HTMLArea.updateToolbar(" + editor._editorNumber + ");", 50);
};

HTMLArea.prototype.scrollToCaret = function() {
	var e = this.getParentElement(),
		w = this._iframe.contentWindow ? this._iframe.contentWindow : window,
		h = w.innerHeight || w.height,
		d = this._doc,
		t = d.documentElement.scrollTop || d.body.scrollTop;
	if (typeof(h) == "undefined") return false;
	if(e.offsetTop > h + t) w.scrollTo(e.offsetLeft,e.offsetTop - h + e.offsetHeight);
};

HTMLArea.prototype.convertNode = function(el, newTagName) {
	var newel = this._doc.createElement(newTagName), p = el.parentNode;
	while (el.firstChild) newel.appendChild(el.firstChild);
	p.insertBefore(newel, el);
	p.removeChild(el);
	return newel;
};

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

/*
 * Handle the backspace event in gecko browsers
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

HTMLArea.prototype.dom_checkInsertP = function() {
	this.focusEditor();
	var i, SC, left, right, r2,
		sel   = this._getSelection(),
		r     = this._createRange(sel),
		p     = this.getAllAncestors(),
		block = null,
		doc   = this._doc,
		body  = doc.body;

	for(i=0;i < p.length;++i) {
		if(HTMLArea.isBlockElement(p[i]) && !/body|html|table|tbody|tr/i.test(p[i].tagName)) {
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
 * Retrieve the HTML
 */
HTMLArea.prototype.getHTML = function() {
	switch (this._editMode) {
		case "wysiwyg":
			if(!this.config.fullPage) { return HTMLArea.getHTML(this._doc.body,false,this); }
				else { return this.doctype + "\n" + HTMLArea.getHTML(this._doc.documentElement,true,this); }
		case "textmode": return this._textArea.value;
	}
	return false;
};

/*
 * Retrieve the HTML using the fastest method
 */
HTMLArea.prototype.getInnerHTML = function() {
	switch (this._editMode) {
		case "wysiwyg":
			if(!this.config.fullPage) return this._doc.body.innerHTML;
				else return this.doctype + "\n" + this._doc.documentElement.innerHTML;
		case "textmode": return this._textArea.value;
	}
	return false;
};

/*
 * Replace the HTML inside
 */
HTMLArea.prototype.setHTML = function(html) {
	switch (this._editMode) {
		case "wysiwyg":
			if(!this.config.fullPage) this._doc.body.innerHTML = html;
				else this._doc.body.innerHTML = html;
			break;
		case "textmode": this._textArea.value = html; break;
	}
	return false;
};

/*
 * Set the given doctype when config.fullPage is true
 */
HTMLArea.prototype.setDoctype = function(doctype) {
	this.doctype = doctype;
};

/***************************************************
 *  UTILITY FUNCTIONS
 ***************************************************/

// variable used to pass the object to the popup editor window.
HTMLArea._object = null;

/*
 * Check if the client agent is supported
 */
HTMLArea.checkSupportedBrowser = function() {
	if(HTMLArea.is_gecko && !HTMLArea.is_safari) {
		if(navigator.productSub < 20030210) return false;
	}
	return HTMLArea.is_gecko || HTMLArea.is_ie;
};

/*	EventCache Version 1.0
 *	Copyright 2005 Mark Wubben
 *	Adaptation by Stanislas Rolland
 *	Provides a way for automatically removing events from nodes and thus preventing memory leakage.
 *	See <http://novemberborn.net/javascript/event-cache> for more information.
 *	This software is licensed under the CC-GNU LGPL <http://creativecommons.org/licenses/LGPL/2.1/>
 *	Event Cache uses an anonymous function to create a hidden scope chain. This is to prevent scoping issues.
 */
HTMLArea._eventCacheConstructor = function() {
	var listEvents = [];

	return ({
		listEvents : listEvents,

		add : function(node, sEventName, fHandler) {
			listEvents.push(arguments);
		},

		flush : function() {
			var item;
			for (var i = listEvents.length; --i >= 0;) {
				item = listEvents[i];
				try {
					HTMLArea._removeEvent(item[0], item[1], item[2]);
					item[0][item[1]] = null;
					item[0] = null;
					item[2] = null;
				} catch(e) { }
			}
		}
	});
};

/*
 * Register an event
 */
HTMLArea._addEvent = function(el,evname,func) {
	if (el.addEventListener) el.addEventListener(evname,func,true);
		else el.attachEvent("on" + evname, func);
	HTMLArea._eventCache.add(el, evname, func);
};

/*
 * Register a list of events
 */
HTMLArea._addEvents = function(el,evs,func) {
	for (var i = evs.length; --i >= 0;) {
		HTMLArea._addEvent(el,evs[i],func);
	}
};

/*
 * Remove an event
 */
HTMLArea._removeEvent = function(el, evname, func) {
	if(el.removeEventListener) {
		try { el.removeEventListener(evname, func, true); } catch(e) { }
	} else {
		try { el.detachEvent("on" + evname, func); } catch(e) { }
	}
};

/*
 * Remove a list of events
 */
HTMLArea._removeEvents = function(el,evs,func) {
	for (var i = evs.length; --i >= 0;) { HTMLArea._removeEvent(el, evs[i], func); }
};

/*
 * Stop event propagation
 */
HTMLArea._stopEvent = function(ev) {
	if(ev.stopPropagation) {
		ev.stopPropagation();
		ev.preventDefault();
	} else {
		ev.cancelBubble = true;
		ev.returnValue = false;
	}
};

/*
 * Remove a class name from the class attribute
 */
HTMLArea._removeClass = function(el, className) {
	if(!(el && el.className)) return;
	var cls = el.className.trim().split(" ");
	var ar = new Array();
	for(var i = cls.length; i > 0;) {
		if(cls[--i] != className) { ar[ar.length] = cls[i]; }
	}
	el.className = ar.join(" ");
	if(ar.length == 0) {
		if(HTMLArea.is_gecko) el.removeAttribute('class');
			else el.removeAttribute('className');
	}
};

/*
 * Add a class name to the class attribute
 */
HTMLArea._addClass = function(el, className) {
	HTMLArea._removeClass(el, className);
	el.className += (el.className ? (" " + className) : className);
};

/*
 * Check if a class name is in the class attribute
 */
HTMLArea._hasClass = function(el, className) {
	if (!(el && el.className)) { return false; }
	var cls = el.className.split(" ");
	for (var i = cls.length; i > 0;) {
		if(cls[--i] == className) { return true; }
	}
	return false;
};

HTMLArea.RE_blockTags = /^(body|p|h1|h2|h3|h4|h5|h6|ul|ol|pre|dl|div|noscript|blockquote|form|hr|table|fieldset|address|td|tr|th|li|tbody|thead|tfoot|iframe|object)$/;
HTMLArea.isBlockElement = function(el) { return el && el.nodeType == 1 && HTMLArea.RE_blockTags.test(el.nodeName.toLowerCase()); };
HTMLArea.RE_closingTags = /^(p|span|a|li|ol|ul|td|tr|tbody|thead|tfoot|table|div|em|i|strong|b|code|cite|blockquote|q|dfn|abbr|acronym|font|center|object|tt|style|script|title|head)$/;
HTMLArea.RE_noClosingTag = /^(img|br|hr|input|area|base|link|meta|param)$/;
HTMLArea.needsClosingTag = function(el) { return el && el.nodeType == 1 && !HTMLArea.RE_noClosingTag.test(el.tagName.toLowerCase()); };

/*
 * Perform HTML encoding of some given string
 * Borrowed from Xinha (is not htmlArea) - http://xinha.gogo.co.nz/
 */
HTMLArea.htmlEncode = function(str) {
	if (typeof(str.replace) == 'undefined') str = str.toString(); // we don't need regexp for that, but.. so be it for now.
	str = str.replace(/&/g, "&amp;");
	str = str.replace(/</g, "&lt;");
	str = str.replace(/>/g, "&gt;");
	str = str.replace(/\xA0/g, "&nbsp;"); // Decimal 160, non-breaking-space
	str = str.replace(/\x22/g, "&quot;");
	// \x22 means '"' -- we use hex reprezentation so that we don't disturb JS compressors
	str = str.replace(/'/g, "&#39;") ;
	return str;
};

/*
 * Retrieve the HTML code from the given node.
 * This is a replacement for getting innerHTML, using standard DOM calls.
 * Wrapper catches a Mozilla-Exception with non well-formed html source code.
 */
HTMLArea.getHTML = function(root, outputRoot, editor){
	try{ 
		return HTMLArea.getHTMLWrapper(root,outputRoot,editor); 
	}
	catch(e){
		HTMLArea._appendToLog("The HTML document is not well-formed.");
		if(!HTMLArea._debugMode) { alert("The HTML document is not well-formed."); }
		return editor._doc.body.innerHTML;
	}
};

HTMLArea.getHTMLWrapper = function(root, outputRoot, editor) {
	var html = "";
	if(!root) return html;
	switch (root.nodeType) {
	   case 10:// Node.DOCUMENT_TYPE_NODE
	   case 6: // Node.ENTITY_NODE
	   case 12:// Node.NOTATION_NODE
			// this all are for the document type, probably not necessary
		break;
	   case 2: // Node.ATTRIBUTE_NODE
			// Never get here, this has to be handled in the ELEMENT case because of IE requiring that some attributes are grabbed directly from
			// the attribute (nodeValue doesn't return correct values), see
			//http://groups.google.com/groups?hl=en&lr=&ie=UTF-8&oe=UTF-8&safe=off&selm=3porgu4mc4ofcoa1uqkf7u8kvv064kjjb4%404ax.com
			// for information
		break;
	   case 4: // Node.CDATA_SECTION_NODE
			// Mozilla seems to convert CDATA into a comment when going into wysiwyg mode, don't know about IE
		html += '<![CDATA[' + root.data + ']]>';
		break;
	   case 5: // Node.ENTITY_REFERENCE_NODE
		html += '&' + root.nodeValue + ';';
		break;
	   case 7: // Node.PROCESSING_INSTRUCTION_NODE
		// PI's don't seem to survive going into the wysiwyg mode, (at least in moz) so this is purely academic
		html += '<?' + root.target + ' ' + root.data + ' ?>';
		break;
	   case 1: // ELEMENT_NODE
	   case 11: // DOCUMENT_FRAGMENT_NODE
	   case 9: // DOCUMENT_NODE
		var closed, i;
		var root_tag = (root.nodeType == 1) ? root.tagName.toLowerCase() : '';
		if (root_tag == 'br' && !root.nextSibling && !root.previousSibling ) break;
		if (editor.config.htmlRemoveTagsAndContents && editor.config.htmlRemoveTagsAndContents.test(root_tag)) break;
		var custom_tag = (editor.config.customTags && editor.config.customTags.test(root_tag));
		if (outputRoot) outputRoot = !(editor.config.htmlRemoveTags && editor.config.htmlRemoveTags.test(root_tag));
		if ((HTMLArea.is_ie || HTMLArea.is_safari) && root_tag == "head") {
			if(outputRoot) html += "<head>";
			var save_multiline = RegExp.multiline;
			RegExp.multiline = true;
			var txt = root.innerHTML.replace(HTMLArea.RE_tagName, function(str, p1, p2) {
				return p1 + p2.toLowerCase();
			});
			RegExp.multiline = save_multiline;
			html += txt;
			if(outputRoot) html += "</head>";
			break;
		} else if (outputRoot) {
			closed = (!(root.hasChildNodes() || HTMLArea.needsClosingTag(root) || custom_tag));
			html = "<" + root.tagName.toLowerCase();
			var attrs = root.attributes;
			for (i=0; i < attrs.length; ++i) {
				var a = attrs.item(i);
				if (!a.specified && a.nodeName.toLowerCase() != 'value') continue;
				var name = a.nodeName.toLowerCase();
				if (/_moz_editor_bogus_node/.test(name)) {
					html = "";
					break;
				}
				if (/_moz|contenteditable|_msh/.test(name)) continue;
				var value;
				if (name != "style") {
						// IE5.5 reports wrong values. For this reason we extract the values directly from the root node.
						// Using Gecko the values of href and src are converted to absolute links unless we get them using nodeValue()
					if (typeof(root[a.nodeName]) != "undefined" && name != "href" && name != "src" && !/^on/.test(name)) {
						value = root[a.nodeName];
					} else {
						value = a.nodeValue;
							// Ampersands in URIs need to be escaped to get valid XHTML
						if(name == "href" || name == "src") {
							value = value.replace(/&/g, "&amp;");
							if(HTMLArea.is_ie) value = editor.stripBaseURL(value);
						}
					}
				} else { // IE fails to put style in attributes list.
					value = root.style.cssText;
				}
					// Mozilla reports some special attributes here; we don't need them.
				if(/(_moz|^$)/.test(value)) continue;
					// Strip value="0" reported by IE on all li tags
				if(HTMLArea.is_ie && root.tagName.toLowerCase() == "li" && name == "value" && a.nodeValue == 0) continue;
//				html += " " + name + '="' + value + '"';
				html += " " + name + '="' + HTMLArea.htmlEncode(value) + '"';
			}
			if(html != "") { html += closed ? " />" : ">"; }
		}
		for(i=root.firstChild;i;i=i.nextSibling) { html += HTMLArea.getHTMLWrapper(i, true, editor); }
		if(outputRoot && !closed) { html += "</" + root.tagName.toLowerCase() + ">"; }
		break;
	    case 3: // TEXT_NODE
			// If a text node is alone in an element and all spaces, replace it with an non breaking one
			// This partially undoes the damage done by moz, which translates '&nbsp;'s into spaces in the data element
			// Add a non breaking space in the empty text node an delete any starting non breaking space in the text node
//		if(!root.previousSibling && !root.nextSibling && root.data.match(/^\s*$/i) ) html = '&nbsp;';
//			else html = /^script|style$/i.test(root.parentNode.tagName) ? root.data : HTMLArea.htmlEncode(root.data.replace(/^&nbsp;(.*)/gi,"$1"));
		html = /^script|style$/i.test(root.parentNode.tagName) ? root.data : HTMLArea.htmlEncode(root.data);
		break;
	    case 8: // COMMENT_NODE
		if(!editor.config.htmlRemoveComments) html = "<!--" + root.data + "-->";
		break;
	}
	return html;
};

HTMLArea.getPrevNode = function(node) {
	if(!node)                return null;
	if(node.previousSibling) return node.previousSibling;
	if(node.parentNode)      return node.parentNode;
	return null;
};

HTMLArea.getNextNode = function(node) {
	if(!node)            return null;
	if(node.nextSibling) return node.nextSibling;
	if(node.parentNode)  return node.parentNode;
	return null;
};

HTMLArea.prototype.stripBaseURL = function(string) {
	var baseurl = this.config.baseURL;

	// strip to last directory in case baseurl points to a file
	baseurl = baseurl.replace(/[^\/]+$/, '');
	var basere = new RegExp(baseurl);
	string = string.replace(basere, "");

	// strip host-part of URL which is added by MSIE to links relative to server root
	baseurl = baseurl.replace(/^(https?:\/\/[^\/]+)(.*)$/, '$1');
	basere = new RegExp(baseurl);
	return string.replace(basere, "");
};

String.prototype.trim = function() {
	return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

// creates a rgb-style color from a number
HTMLArea._makeColor = function(v) {
	if (typeof(v) != "number") {
		// already in rgb (hopefully); IE doesn't get here.
		return v;
	}
	// IE sends number; convert to rgb.
	var r = v & 0xFF;
	var g = (v >> 8) & 0xFF;
	var b = (v >> 16) & 0xFF;
	return "rgb(" + r + "," + g + "," + b + ")";
};

// returns hexadecimal color representation from a number or a rgb-style color.
HTMLArea._colorToRgb = function(v) {
	if (!v)
		return '';

	// returns the hex representation of one byte (2 digits)
	function hex(d) {
		return (d < 16) ? ("0" + d.toString(16)) : d.toString(16);
	};

	if (typeof(v) == "number") {
		// we're talking to IE here
		var r = v & 0xFF;
		var g = (v >> 8) & 0xFF;
		var b = (v >> 16) & 0xFF;
		return "#" + hex(r) + hex(g) + hex(b);
	}

	if (v.substr(0, 3) == "rgb") {
		// in rgb(...) form -- Mozilla
		var re = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/;
		if (v.match(re)) {
			var r = parseInt(RegExp.$1);
			var g = parseInt(RegExp.$2);
			var b = parseInt(RegExp.$3);
			return "#" + hex(r) + hex(g) + hex(b);
		}
		// doesn't match RE?!  maybe uses percentages or float numbers
		// -- FIXME: not yet implemented.
		return null;
	}

	if (v.substr(0, 1) == "#") {
		// already hex rgb (hopefully :D )
		return v;
	}

	// if everything else fails ;)
	return null;
};

/***************************************************
 *  MODAL DIALOG
 ***************************************************/
/*
 * Modal dialog pseudo-object
 */
Dialog = function(url, action, init, width, height, opener, editor) {
	Dialog._open(url, action, init, (width?width:100), (height?height:100), opener, editor);
};

/*
 * Open modal popup window
 */
Dialog._open = function(url, action, init, width, height, _opener, editor) {

	var dlg = window.open(url, 'hadialog', "toolbar=no,location=no,directories=no,menubar=no,width=" + width + ",height=" + height + ",scrollbars=no,resizable=yes,modal=yes,dependent=yes");
	if (Dialog._modal && !Dialog._modal.closed) {
		var obj = new Object();
		obj.dialogWindow = dlg;
		Dialog._dialog = obj;
	}
	Dialog._modal = dlg;
	Dialog._arguments = null;
	if (typeof(init) != "undefined") { Dialog._arguments = init; }

		// Capture focus events
	function capwin(w) {
		if (w.addEventListener) { w.addEventListener("focus", function(ev) { Dialog._parentEvent(ev); }, false); }
			else { HTMLArea._addEvent(w, "focus", function(ev) { Dialog._parentEvent(ev); }); }
		for (var i=0;i < w.frames.length;i++) { capwin(w.frames[i]); }
	}
	capwin(window);

		// make up a function to be called when the Dialog ends.
	Dialog._return = function (val) {
		if(val && action) { action(val); }

			// release the captured events
		function relwin(w) {
			HTMLArea._removeEvent(w, "focus", function(ev) { Dialog._parentEvent(ev); });
			try { for (var i=0;i < w.frames.length;i++) { relwin(w.frames[i]); } } catch(e) { }
		}
		relwin(window);

		HTMLArea._removeEvent(window, "unload", function() { if(Dialog._dialog && Dialog._dialog.dialogWindow) { Dialog._dialog.dialogWindow.close(); Dialog._dialog = null; };  dlg.close(); return false; });
		Dialog._dialog = null;
	};

		// capture unload events
	HTMLArea._addEvent(dlg, "unload", function() { if (typeof(Dialog) != "undefined") Dialog._return(null); return false; });
	HTMLArea._addEvent(window, "unload", function() { if(Dialog._dialog && Dialog._dialog.dialogWindow) { Dialog._dialog.dialogWindow.close(); Dialog._dialog = null; };  dlg.close(); return false; });
};

Dialog._parentEvent = function(ev) {
	if (Dialog._modal && !Dialog._modal.closed) {
		if (!ev) var ev = window.event;
		var target = (ev.target) ? ev.target : ev.srcElement;
		Dialog._modal.focus();
		HTMLArea._stopEvent(ev);
	}
	return false;
};

/*
 * Request modal dialog
 * Receives an URL to the popup dialog, an action function that receives one value and an initialization object.
 * The action function will get called after the dialog is closed, with the return value of the dialog.
 */
HTMLArea.prototype._popupDialog = function(url, action, init, width, height, _opener) {
	if (typeof(_opener) == "undefined" || !_opener) var _opener = (this._iframe.contentWindow ? this._iframe.contentWindow : window);
	Dialog(this.popupURL(url), action, init, width, height, _opener, this);
};

/**
 * Internet Explorer returns an item having the _name_ equal to the given id, even if it's not having any id.
 * This way it can return a different form field even if it's not a textarea.  This works around the problem by
 * specifically looking to search only elements having a certain tag name.
 */
HTMLArea.getElementById = function(tag, id) {
	var el, i, objs = document.getElementsByTagName(tag);
	for (i = objs.length; --i >= 0 && (el = objs[i]);) {
		if (el.id == id) return el;
	}
	return null;
};

/*
 * Hide the popup window
 */
HTMLArea.edHidePopup = function() {
	Dialog._modal.close();
	if (typeof(browserWin) != "undefined") setTimeout("browserWin.focus();", 200);
};

/***************************************************
 * TYPO3-SPECIFIC FUNCTIONS
 ***************************************************/
/*
 * Set the size of textarea with the RTE. It's called, if we are in fullscreen-mode.
 */
var setRTEsizeByJS = function(divId, height, width) {
	if (HTMLArea.is_gecko) { height = height - 25; } else { height = height - 60; }
	if (height > 0) { document.getElementById(divId).style.height =  height + "px"; }
	if (HTMLArea.is_gecko) { width = "99%"; } else { width = "97%"; }
	document.getElementById(divId).style.width = width;
};

/*
 * IE-Browsers strip URL's to relative URL's. But for the TYPO3 backend we need absolute URL's.
 * This function overloads the normal stripBaseURL-function (which generate relative URLs).
 */
HTMLArea.prototype.nonStripBaseURL = function(url) {
	return url;
};

/*
 *  CreateLink: Typo3-RTE function, use this instead of the original.
 */
HTMLArea.prototype.renderPopup_link = function() {
	var editorNo = this._doc._editorNo,
		backreturn,
		addUrlParams = "?" + conf_RTEtsConfigParams,
		sel = this.getParentElement();

	if (sel == null || sel.tagName.toLowerCase() != "a") {
		var parent = getElementObject(sel,"a");
		if (parent != null && parent.tagName && parent.tagName.toLowerCase() == "a") sel = parent;
	}
	if (sel != null && sel.tagName && sel.tagName.toLowerCase() == "a") {
		addUrlParams = "?curUrl[href]=" + escape(sel.getAttribute("href"));
		if (sel.target) addUrlParams += "&curUrl[target]=" + escape(sel.target);
		if (sel.className) addUrlParams += "&curUrl[class]=" + escape(sel.className);
		if (sel.title) addUrlParams += "&curUrl[title]=" + escape(sel.title);
		addUrlParams += conf_RTEtsConfigParams;
	} else if (this.hasSelectedText()) {
		var text = this.getSelectedHTML();
		if (text && text != null) {
			var offset = text.toLowerCase().indexOf("<a");
			if (offset!=-1) {
				var ATagContent = text.substring(offset+2);
				offset = ATagContent.toUpperCase().indexOf(">");
				ATagContent = ATagContent.substring(0,offset);
				addUrlParams = "?curUrl[all]=" + escape(ATagContent) + conf_RTEtsConfigParams;
			}
		}
	}
	this._popupDialog("../../t3_popup.php" + addUrlParams + "&editorNo=" + editorNo + "&popupname=link&srcpath=" + encodeURI(rtePathLinkFile), null, backreturn, 550, 350);
	return false;
};

/*
 *  Insert Image TYPO3 RTE function.
 */

var _selectedImage;

HTMLArea.prototype.renderPopup_image = function() {
	var editorNo = this._doc._editorNo,
		backreturn,
		addParams = "?"+conf_RTEtsConfigParams,
		image = this.getParentElement();

	if (image && !/^img$/i.test(image.tagName)) image = null;
	_selectedImage = "";
	if (image && image.tagName.toLowerCase() == "img") {
		addParams = "?act=image" + conf_RTEtsConfigParams;
		_selectedImage = image;
	}

	this._popupDialog("../../t3_popup.php" + addParams + "&editorNo=" + editorNo + "&popupname=image&srcpath="+encodeURI(rtePathImageFile), null, backreturn, 550, 350);	
	return false;
};

/*
 * Insert the Image.
 * This function is called from the typo3-image-popup.
 */
HTMLArea.prototype.renderPopup_insertImage = function(image) {
	this.focusEditor();
	this.insertHTML(image);
	_selectedImage="";
	Dialog._modal.close();
	this.updateToolbar();
};

/*
 * Add a link to the selection.
 * This function is called from the TYPO3 link popup.
 */
HTMLArea.prototype.renderPopup_addLink = function(theLink,cur_target,cur_class,cur_title) {
	var a, sel = null;
	this.focusEditor();

	if(!HTMLArea.is_ie) {
		var text = null;
		sel = this.getParentElement();
		if (sel == null || sel.tagName.toLowerCase() != "a") {
			var parent = getElementObject(sel, "a");
			if (parent != null && parent.tagName && parent.tagName.toLowerCase() == "a") sel = parent;
		}
		if (sel != null && sel.tagName && sel.tagName.toLowerCase() == "a") this.selectNodeContents(sel);
	}

	this._doc.execCommand("CreateLink", false, theLink);

	sel = this._getSelection();
	var range = this._createRange(sel);
	a = this.getParentElement();
	if (a) {
/*
		if(!HTMLArea.is_ie) {
			a = range.startContainer;
			if(!/^a$/i.test(a.tagName)) {
				a = a.nextSibling;
				if(a == null) a = range.startContainer.parentNode;
			}
		}
*/
			// we may have created multiple links in as many blocks
		function setLinkAttributes(node) {
			if (/^a$/i.test(node.tagName)) {
				if ((HTMLArea.is_gecko && range.intersectsNode(node)) || (HTMLArea.is_ie)) {
					if (cur_target.trim()) { node.target = cur_target.trim(); }
						else { node.removeAttribute("target"); }
					if (cur_class.trim()) {
						node.className = cur_class.trim();
					} else { 
						if (HTMLArea.is_gecko) { node.removeAttribute('class'); }
							else { node.removeAttribute('className'); }
					}
					if (cur_title.trim()) { node.title = cur_title.trim(); }
						else { node.removeAttribute("title"); }
				}
			} else {
				for (var i = node.firstChild;i;i = i.nextSibling) {
					if (i.nodeType == 1 || i.nodeType == 11) { setLinkAttributes(i); }
				}
			}
		}
		setLinkAttributes(a);
	}
	Dialog._modal.close();
};

/*
 * Unlink the selection.
 * This function is called from the TYPO3 link popup.
 */
HTMLArea.prototype.renderPopup_unLink = function() {
	this.focusEditor();
	if(!HTMLArea.is_ie) {
		var sel = null;
		var text = null;
		sel = this.getParentElement();
		if (sel == null || sel.tagName.toLowerCase() != "a") {
			var parent = getElementObject(sel, "a");
			if (parent != null && parent.tagName && parent.tagName.toLowerCase() == "a") sel = parent;
		}
		if (sel != null && sel.tagName && sel.tagName.toLowerCase() == "a") this.selectNodeContents(sel);
	}
	this._doc.execCommand("Unlink", false, "");
	Dialog._modal.close();
};

/*
 * Extending the TYPO3 Lorem Ipsum extension
 */
var lorem_ipsum = function(element,text) {
	if (element.tagName.toLowerCase() == "textarea" && element.id && element.id.substr(0,7) == "RTEarea") {
		var editor = RTEarea[element.id.substr(7,8)]["editor"];
		var doc = editor._doc;
		var p = doc.createElement("p");
		p.appendChild(doc.createTextNode(text));
		doc.body.appendChild(p);
		editor.updateToolbar();
	}
	
};

/*
* Other functions
*/
var getElementObject = function(oEl,sTag) {
	while (oEl != null && oEl.tagName.toLowerCase() != sTag) { oEl = oEl.parentElement; }
	return oEl;
};

/*
 * Initialize the editor, configure the toolbar, setup the plugins, etc.
 */
HTMLArea.initTimer = [];

HTMLArea.onGenerateHandler = function(editorNumber) {
	return (function() {
		document.getElementById('pleasewait' + editorNumber).style.display='none';
		document.getElementById('editorWrap' + editorNumber).style.visibility='visible';
		editorNumber = null;
	});
};

HTMLArea.initEditor = function(editorNumber) {
	if(HTMLArea.checkSupportedBrowser()) {
		if(HTMLArea.initTimer[editorNumber]) window.clearTimeout(HTMLArea.initTimer[editorNumber]);
		if(!HTMLArea.is_loaded) {
			HTMLArea.initTimer[editorNumber] = window.setTimeout( "HTMLArea.initEditor(" + editorNumber + ");", 150);
		} else {
			var config = new HTMLArea.Config();

				// Get the toolbar config
			config.toolbar = RTEarea[editorNumber]["toolbar"];

				// create an editor for the textarea
			RTEarea[editorNumber]["editor"] = new HTMLArea(RTEarea[editorNumber]["id"], config);
			var editor = RTEarea[editorNumber]["editor"];

				// Save the editornumber in the object
			editor._typo3EditerNumber = editorNumber;
			editor._editorNumber = editorNumber;

			for (var plugin in RTEarea[editorNumber]["plugin"]) {
				if(RTEarea[editorNumber]["plugin"][plugin]) { editor.registerPlugin(plugin); }
			}
			if(RTEarea[editorNumber]["pageStyle"]) { editor.config.pageStyle = RTEarea[editorNumber]["pageStyle"]; }
			if(RTEarea[editorNumber]["fontname"]) { editor.config.FontName = RTEarea[editorNumber]["fontname"]; }
			if(RTEarea[editorNumber]["fontsize"]) { editor.config.FontSize = RTEarea[editorNumber]["fontsize"]; }
			if(RTEarea[editorNumber]["colors"]) { editor.config.colors = RTEarea[editorNumber]["colors"]; }
			if(RTEarea[editorNumber]["disableColorPicker"]) { editor.config.disableColorPicker = RTEarea[editorNumber]["disableColorPicker"]; }
			if(RTEarea[editorNumber]["paragraphs"]) { editor.config.FormatBlock = RTEarea[editorNumber]["paragraphs"]; }
			editor.config.width = "auto";
			editor.config.height = "auto";
			editor.config.sizeIncludesToolbar = true;
			editor.config.fullPage = false;
			editor.config.useHTTPS = RTEarea[editorNumber]["useHTTPS"] ? RTEarea[editorNumber]["useHTTPS"] : false;
			editor.config.disableEnterParagraphs = RTEarea[editorNumber]["disableEnterParagraphs"] ? RTEarea[editorNumber]["disableEnterParagraphs"] : false;
			editor.config.useCSS = RTEarea[editorNumber]["useCSS"] ? RTEarea[editorNumber]["useCSS"] : false;
			editor.config.enableMozillaExtension = RTEarea[editorNumber]["enableMozillaExtension"] ? RTEarea[editorNumber]["enableMozillaExtension"] : false;
			editor.config.statusBar = RTEarea[editorNumber]["statusBar"] ? RTEarea[editorNumber]["statusBar"] : false;
			editor.config.killWordOnPaste = RTEarea[editorNumber]["enableWordClean"] ? true : false;
			editor.config.htmlareaPaste = RTEarea[editorNumber]["enableWordClean"] ? true : false;
			editor.config.htmlRemoveTags = RTEarea[editorNumber]["htmlRemoveTags"] ? RTEarea[editorNumber]["htmlRemoveTags"] : null;
			editor.config.htmlRemoveTagsAndContents = RTEarea[editorNumber]["htmlRemoveTagsAndContents"] ? RTEarea[editorNumber]["htmlRemoveTagsAndContents"] : null;
			editor.config.htmlRemoveComments = RTEarea[editorNumber]["htmlRemoveComments"] ? true : false;

			editor.onGenerate = HTMLArea.onGenerateHandler(editorNumber);
			
			editor.generate();
			return false;
		} 
	} else {
		document.getElementById('pleasewait' + editorNumber).style.display='none';
		document.getElementById('editorWrap' + editorNumber).style.visibility='visible';
	}
};
