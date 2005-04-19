// htmlArea v3.0 - Copyright (c) 2003-2005 dynarch.com
//					   2002-2003 interactivetools.com, inc.
//					   2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
// This copyright notice MUST stay intact for use (see license.txt).
//
// A free WYSIWYG editor replacement for <textarea> fields.
// Version 3.0 developed by Mihai Bazon.   http://dynarch.com/mishoo
// TYPO3 integration by Stanislas Rolland <stanislas.rolland@fructifor.com>

if (typeof _editor_url == "string") {
	// Leave exactly one backslash at the end of _editor_url
	_editor_url = _editor_url.replace(/\x2f*$/, '/');
} else {
	alert("WARNING: _editor_url is not set!  You should set this variable to the editor files path; it should preferably be an absolute path, like in '/htmlarea/', but it can be relative if you prefer.  Further we will try to load the editor files correctly but we'll probably fail.");
	_editor_url = '';
}
if (typeof _editor_skin != "string") {
	_editor_skin = _editor_url + "skins/default/";
} else {
	_editor_skin = _editor_skin.replace(/\x2f*$/, '/');
}
if (typeof _editor_CSS != "string") {
	_editor_CSS = _editor_url + "skins/default/htmlarea.css";
}
if (typeof _editor_lang == "string") {
	_editor_lang = _editor_lang.toLowerCase();
} else {
	_editor_lang = "en";
}

// Browser identification
HTMLArea.agt = navigator.userAgent.toLowerCase();
HTMLArea.is_ie	   = ((HTMLArea.agt.indexOf("msie") != -1) && (HTMLArea.agt.indexOf("opera") == -1));
HTMLArea.is_opera  = (HTMLArea.agt.indexOf("opera") != -1);
HTMLArea.is_mac	   = (HTMLArea.agt.indexOf("mac") != -1);
HTMLArea.is_mac_ie = (HTMLArea.is_ie && HTMLArea.is_mac);
HTMLArea.is_win_ie = (HTMLArea.is_ie && !HTMLArea.is_mac);
HTMLArea.is_gecko  = (navigator.product == "Gecko");
HTMLArea.is_wamcom  = (HTMLArea.agt.indexOf("wamcom") != -1) || (HTMLArea.is_gecko && (HTMLArea.agt.indexOf("1.3") != -1));

// Creates a new HTMLArea object.  Tries to replace the textarea with the given ID with it.
function HTMLArea(textarea, config) {
	var editor = this;
	if (HTMLArea.checkSupportedBrowser()) {
		if (typeof config == "undefined") {
			this.config = new HTMLArea.Config();
		} else {
			this.config = config;
		}
		this._htmlArea = null;
		this._textArea = textarea;
		this._editMode = "wysiwyg";
		this.plugins = {};
		this._timerToolbar = null;
		this._timerUndo = setInterval(function() { if(editor._doc) editor._undoTakeSnapshot(); }, this.config.undoTimeout);
		this._undoQueue = new Array();
		this._undoPos = -1;
		this._customUndo = true;
		this._mdoc = document; // cache the document, we need it in plugins
		this.doctype = '';
	}
};

// We initialize the editors only after the scripts are loaded
HTMLArea.is_loaded = false;
HTMLArea.onload = function(){ 
	HTMLArea.is_loaded = true;
};
HTMLArea._scripts = [];
HTMLArea.loadScript = function(url, plugin) {
	if (plugin) { url = _editor_url + "/plugins/" + plugin + '/' + url; }
	this._scripts.push(url);
};
HTMLArea.init = function() {
	var head = document.getElementsByTagName("head")[0];
	var current = 0;
	var savetitle = document.title;
	var evt = HTMLArea.is_ie ? "onreadystatechange" : "onload";
	function loadNextScript() {
		if (current > 0 && HTMLArea.is_ie && !/loaded|complete/.test(window.event.srcElement.readyState)) return;
		if (current < HTMLArea._scripts.length) {
			var url = HTMLArea._scripts[current++];
			document.title = "[HTMLArea: loading script " + current + "/" + HTMLArea._scripts.length + "]";
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			script[evt] = loadNextScript;
			head.appendChild(script);
		} else {
			document.title = savetitle;
			HTMLArea.onload();
		}
	};
	loadNextScript();
};

HTMLArea.loadScript(_editor_url + "dialog.js");
HTMLArea.loadScript(_editor_url + "popupwin.js");
// We will get the language labels from the arrays generated from the TYPO3 locallang files
//HTMLArea.loadScript(_editor_url + "lang/" + _editor_lang + ".js");

// Cache some regexps
HTMLArea.RE_tagName = /(<\/|<)\s*([^ \t\n>]+)/ig;
HTMLArea.RE_doctype = /(<!doctype((.|\n)*?)>)\n?/i;
HTMLArea.RE_head    = /<head>((.|\n)*?)<\/head>/i;
HTMLArea.RE_body    = /<body>((.|\n)*?)<\/body>/i;

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
	this.pageStyle = "";
		// set to true if you want Word code to be cleaned upon Paste
	this.killWordOnPaste = true;
		// enable the 'Target' field in the Make Link dialog
	this.makeLinkShowsTarget = true;
		// BaseURL included in the iframe document
	this.baseURL = document.baseURI || document.URL;
	if (this.baseURL && this.baseURL.match(/(.*)\/([^\/]+)/)) { this.baseURL = RegExp.$1 + "/"; }
		// URL-s
	this.imgURL = "images/";
	this.popupURL = "popups/";

	/** CUSTOMIZING THE TOOLBAR
	 * -------------------------
	 * It is recommended that you customize the toolbar contents in an
	 * external file (i.e. the one calling HTMLArea) and leave this one
	 * unchanged.  That's because when we (InteractiveTools.com) release a
	 * new official version, it's less likely that you will have problems
	 * upgrading HTMLArea.
	 */
	this.toolbar = [
		[ "fontname", "space",
		  "fontsize", "space",
		  "formatblock", "space",
		  "bold", "italic", "underline", "strikethrough", "separator",
		  "subscript", "superscript", "separator",
		  "copy", "cut", "paste", "space", "undo", "redo" ],

		[ "justifyleft", "justifycenter", "justifyright", "justifyfull", "separator",
		  "lefttoright", "righttoleft", "separator",
		  "insertorderedlist", "insertunorderedlist", "outdent", "indent", "separator",
		  "forecolor", "hilitecolor", "separator",
		  "inserthorizontalrule", "createlink", "insertimage", "inserttable", "htmlmode", "separator",
		  "popupeditor", "separator", "showhelp", "about" ]
	];
	this.fontname = {
		"Arial":	   'arial,helvetica,sans-serif',
		"Courier New":	   'courier new,courier,monospace',
		"Georgia":	   'georgia,times new roman,times,serif',
		"Tahoma":	   'tahoma,arial,helvetica,sans-serif',
		"Times New Roman": 'times new roman,times,serif',
		"Verdana":	   'verdana,arial,helvetica,sans-serif',
		"impact":	   'impact',
		"WingDings":	   'wingdings'
	};
	this.fontsize = {
		"1 (8 pt)":  "1",
		"2 (10 pt)": "2",
		"3 (12 pt)": "3",
		"4 (14 pt)": "4",
		"5 (18 pt)": "5",
		"6 (24 pt)": "6",
		"7 (36 pt)": "7"
	};
	this.formatblock = {
		"Heading 1": "h1",
		"Heading 2": "h2",
		"Heading 3": "h3",
		"Heading 4": "h4",
		"Heading 5": "h5",
		"Heading 6": "h6",
		"Normal": "p",
		"Address": "address",
		"Formatted": "pre"
	};
	this.customSelects = {};

	function cut_copy_paste(e, cmd, obj) {
		e.execCommand(cmd);
	};

	// ADDING CUSTOM BUTTONS: please read below!
	// format of the btnList elements is "ID: [ ToolTip, Icon, Enabled in text mode?, ACTION ]"
	//    - ID: unique ID for the button.  If the button calls document.execCommand
	//	    it's wise to give it the same name as the called command.
	//    - ACTION: function that gets called when the button is clicked.
	//              it has the following prototype:
	//                 function(editor, buttonName)
	//              - editor is the HTMLArea object that triggered the call
	//              - buttonName is the ID of the clicked button
	//              These 2 parameters makes it possible for you to use the same
	//              handler for more HTMLArea objects or for more different buttons.
	//    - ToolTip: default tooltip, for cases when it is not defined in the -lang- file (HTMLArea.I18N)
	//    - Icon: path to an icon image file for the button (TODO: use one image for all buttons!)
	//    - Enabled in text mode: if false the button gets disabled for text-only mode; otherwise enabled all the time.
	this.btnList = {
		bold: [ "Bold", "ed_format_bold.gif", false, function(e) {e.execCommand("bold");} ],
		italic: [ "Italic", "ed_format_italic.gif", false, function(e) {e.execCommand("italic");} ],
		underline: [ "Underline", "ed_format_underline.gif", false, function(e) {e.execCommand("underline");} ],
		strikethrough: [ "Strikethrough", "ed_format_strike.gif", false, function(e) {e.execCommand("strikethrough");} ],
		subscript: [ "Subscript", "ed_format_sub.gif", false, function(e) {e.execCommand("subscript");} ],
		superscript: [ "Superscript", "ed_format_sup.gif", false, function(e) {e.execCommand("superscript");} ],
		justifyleft: [ "Justify Left", "ed_align_left.gif", false, function(e) {e.execCommand("justifyleft");} ],
		justifycenter: [ "Justify Center", "ed_align_center.gif", false, function(e) {e.execCommand("justifycenter");} ],
		justifyright: [ "Justify Right", "ed_align_right.gif", false, function(e) {e.execCommand("justifyright");} ],
		justifyfull: [ "Justify Full", "ed_align_justify.gif", false, function(e) {e.execCommand("justifyfull");} ],
		insertorderedlist: [ "Ordered List", "ed_list_num.gif", false, function(e) {e.execCommand("insertorderedlist");} ],
		insertunorderedlist: [ "Bulleted List", "ed_list_bullet.gif", false, function(e) {e.execCommand("insertunorderedlist");} ],
		outdent: [ "Decrease Indent", "ed_indent_less.gif", false, function(e) {e.execCommand("outdent");} ],
		indent: [ "Increase Indent", "ed_indent_more.gif", false, function(e) {e.execCommand("indent");} ],
		forecolor: [ "Font Color", "ed_color_fg.gif", false, function(e) {e.execCommand("forecolor");} ],
		hilitecolor: [ "Background Color", "ed_color_bg.gif", false, function(e) {e.execCommand("hilitecolor");} ],
		inserthorizontalrule: [ "Horizontal Rule", "ed_hr.gif", false, function(e) {e.execCommand("inserthorizontalrule");} ],
		createlink: [ "Insert Web Link", "ed_link.gif", false, function(e) {e.execCommand("createlink", true);} ],
		insertimage: [ "Insert/Modify Image", "ed_image.gif", false, function(e) {e.execCommand("insertimage");} ],
		inserttable: [ "Insert Table", "insert_table.gif", false, function(e) {e.execCommand("inserttable");} ],
		htmlmode: [ "Toggle HTML Source", "ed_html.gif", true, function(e) {e.execCommand("htmlmode");} ],
		popupeditor: [ "Enlarge Editor", "fullscreen_maximize.gif", true, function(e) {e.execCommand("popupeditor");} ],
		about: [ "About this editor", "ed_about.gif", true, function(e) {e.execCommand("about");} ],
		showhelp: [ "Help using editor", "ed_help.gif", true, function(e) {e.execCommand("showhelp");} ],
		undo: [ "Undoes your last action", "ed_undo.gif", false, function(e) {e.execCommand("undo");} ],
		redo: [ "Redoes your last action", "ed_redo.gif", false, function(e) {e.execCommand("redo");} ],
		cut: [ "Cut selection", "ed_cut.gif", false, cut_copy_paste ],
		copy: [ "Copy selection", "ed_copy.gif", false, cut_copy_paste ],
		paste: [ "Paste from clipboard", "ed_paste.gif", false, cut_copy_paste ],
		lefttoright: [ "Direction left to right", "ed_left_to_right.gif", false, function(e) {e.execCommand("lefttoright");} ],
		righttoleft: [ "Direction right to left", "ed_right_to_left.gif", false, function(e) {e.execCommand("righttoleft");} ]
	};
		// initialize tooltips from the I18N module and generate correct image path
	for (var i in this.btnList) {
		var btn = this.btnList[i];
		btn[1] = _editor_skin + this.imgURL + btn[1];
		if (typeof HTMLArea.I18N.tooltips[i] != "undefined") {
			btn[0] = HTMLArea.I18N.tooltips[i];
		}
	}
};

/** Registers a new button with the configuration.  It can be
 * called with all 5 arguments, or with only one (first one).  When called with
 * only one argument it must be an object with the following properties: id,
 * tooltip, image, textMode, action.  Examples:
 *
 * 1. config.registerButton("my-hilite", "Hilite text", "my-hilite.gif", false, function(editor) {...});
 * 2. config.registerButton({
 *      id       : "my-hilite",      // the ID of your button
 *      tooltip  : "Hilite text",    // the tooltip
 *      image    : "my-hilite.gif",  // image to be displayed in the toolbar
 *      textMode : false,            // disabled in text mode
 *      action   : function(editor) { // called when the button is clicked
 *                   editor.surroundHTML('<span class="hilite">', '</span>');
 *                 },
 *      context  : "p"               // will be disabled if outside a <p> element
 *    });
 */
HTMLArea.Config.prototype.registerButton = function(id, tooltip, image, textMode, action, context) {
	var the_id;
	if (typeof id == "string") {
		the_id = id;
	} else if (typeof id == "object") {
		the_id = id.id;
	} else {
		alert("ERROR [HTMLArea.Config::registerButton]:\ninvalid arguments");
		return false;
	}
	if (typeof this.customSelects[the_id] != "undefined") {
		alert("WARNING [HTMLArea.Config::registerButton]:\nA dropdown with the same ID already exists.");
	}
	if (typeof this.btnList[the_id] != "undefined") {
		alert("WARNING [HTMLArea.Config::registerButton]:\nA button with the same ID already exists.");
	}
	switch (typeof id) {
	    case "string": this.btnList[id] = [ tooltip, image, textMode, action, context ]; break;
	    case "object": this.btnList[id.id] = [ id.tooltip, id.image, id.textMode, id.action, id.context ]; break;
	}
};

// Registers a dropdown box with the editor configuration.
HTMLArea.Config.prototype.registerDropdown = function(object) {
	if (typeof this.customSelects[object.id] != "undefined") {
		alert("WARNING [HTMLArea.Config::registerDropdown]:\nA dropdown with the same ID already exists.");
	}
	if (typeof this.btnList[object.id] != "undefined") {
		alert("WARNING [HTMLArea.Config::registerDropdown]:\nA button with the same ID already exists.");
	}
	this.customSelects[object.id] = object;
};

/***************************************************
 *  Category: EDITOR FRAMEWORK
 ***************************************************/
// Updates the state of a toolbar element. This function is member of a toolbar element object, unnamed object created by createButton or createSelect functions below.
HTMLArea.setButtonStatus = function(id,newval) {
	var oldval = this[id];
	var el = document.getElementById(this.elementId);
	if (oldval != newval) {
		switch (id) {
			case "enabled":
				if (newval) {
					HTMLArea._removeClass(el, "buttonDisabled");
					el.disabled = false;

				} else {
					HTMLArea._addClass(el, "buttonDisabled");
					el.disabled = true;
				}
				break;
			    case "active":
				if (newval) {
					HTMLArea._addClass(el, "buttonPressed");
				} else {
					HTMLArea._removeClass(el, "buttonPressed");
				}
				break;
		}
		this[id] = newval;
	}
};

// Creates the toolbar and appends it to the _htmlarea
HTMLArea.prototype._createToolbar = function () {
	var editor = this;
	var toolbar = document.createElement("div");
	this._toolbar = toolbar;
	toolbar.className = "toolbar";
	toolbar.unselectable = "1";
	var tb_line = null;
	var first_cell_on_line = true;
	var tb_objects = new Object();
	this._toolbarObjects = tb_objects;

		// create a new line in the toolbar
	function newLine() {
		var table = document.createElement("table");
		table.border = "0px";
		table.cellSpacing = "0px";
		table.cellPadding = "0px";
		toolbar.appendChild(table);
			// TBODY is required for IE, otherwise you don't see anything in the TABLE.
		var tb_body = document.createElement("tbody");
		table.appendChild(tb_body);
		tb_row = document.createElement("tr");
		tb_body.appendChild(tb_row);
		tb_line = document.createElement("td");
		tb_line.className = "tb-line";
		tb_row.appendChild(tb_line);
		first_cell_on_line = true;
	};
		// init first line
	newLine();

	// This function will handle creation of combo boxes.  Receives as parameter the name of a button as defined in the toolBar config.
	// This function is called from createButton, above, if the given "txt" doesn't match a button.
	function createSelect(txt) {
		var options = null;
		var el = null;
		var cmd = null;
		var customSelects = editor.config.customSelects;
		var context = null;
		var tooltip = "";
		switch (txt) {
		    case "fontsize":
		    case "fontname":
		    case "formatblock":
			// the following line retrieves the correct configuration option because the variable name
			// inside the Config object is named the same as the button/select in the toolbar.  For instance, if txt
			// == "formatblock" we retrieve config.formatblock (or a different way to write it in JS is config["formatblock"].
			options = editor.config[txt];
			tooltip = HTMLArea.I18N.tooltips[txt];
			cmd = txt;
			break;
		    default:
			// try to fetch it from the list of registered selects
			cmd = txt;
			var dropdown = customSelects[cmd];
			if (typeof dropdown != "undefined") {
				options = dropdown.options;
				context = dropdown.context;
				if (typeof dropdown.tooltip != "undefined") {
					tooltip = dropdown.tooltip;
				}
			} else {
				alert("ERROR [createSelect]:\nCan't find the requested dropdown definition");
			}
			break;
		}
		if (options) {
			el = document.createElement("select");
			el.title = tooltip;
			var elementId = editor._typo3EditerNumber + "-" + txt;
			el.id = elementId;
			var obj = {
				name	: txt, // field name
				elementId : elementId, // unique id for the UI element (SELECT)
				enabled : true, // is it enabled?
				text	: false, // enabled in text mode?
				cmd	: cmd, // command ID
				state	: HTMLArea.setButtonStatus, // for changing state
				context : context,
				editor : editor
			};
			tb_objects[txt] = obj;
			el._obj = obj;
			for (var i in options) {
				var op = document.createElement("option");
				op.innerHTML = i;
				op.value = options[i];
				el.appendChild(op);
			}
			HTMLArea._addEvent(el, "change", HTMLArea.toolBarButtonHandler);
		}

		return el;
	}; // END of function: createSelect
	// appends a new button to toolbar
	function createButton(txt) {
		// the element that will be created
		var el = null;
		var btn = null;
		switch (txt) {
		    case "separator":
			el = document.createElement("div");
			el.className = "separator";
			break;
		    case "space":
			el = document.createElement("div");
			el.className = "space";
			el.innerHTML = "&nbsp;";
			break;
		    case "linebreak":
			newLine();
			return false;
		    case "textindicator":
			el = document.createElement("div");
			el.appendChild(document.createTextNode("A"));
			el.className = "indicator";
			el.title = HTMLArea.I18N.tooltips.textindicator;
			var elementId = editor._typo3EditerNumber + "-" + txt;
			el.id = elementId;
			var obj = {
				name	: txt, // the button name (i.e. 'bold')
				elementId : elementId, // unique id for the UI element (DIV)
				enabled : true, // is it enabled?
				active : false, // is it pressed?
				text	: false, // enabled in text mode?
				cmd	: "textindicator", // the command ID
				state	: HTMLArea.setButtonStatus // for changing state
			};
			tb_objects[txt] = obj;
			break;
		    default:
			btn = editor.config.btnList[txt];
		}
		if (!el && btn) {
			el = document.createElement("div");
			el.title = btn[0];
			el.className = "button";
			var elementId = editor._typo3EditerNumber + "-" + txt;
			el.id = elementId;
				// let's just pretend we have a button object and assign all the needed information to it.
			var obj = {
				name	: txt, // the button name (i.e. 'bold')
				elementId : elementId, // unique id for the UI element (DIV)
				enabled : true, // is it enabled?
				active	: false, // is it pressed?
				text	: btn[2], // enabled in text mode?
				cmd	: btn[3], // the command ID
				state	: HTMLArea.setButtonStatus, // for changing state
				context : btn[4] || null, // enabled in a certain context?
				editor : editor
			};
			tb_objects[txt] = obj;
			el._obj = obj;
			HTMLArea._addEvents(el, ["mouseover", "mouseout", "mousedown", "click"], HTMLArea.toolBarButtonHandler);
			/* Image problem on Windows XP
			var img = document.createElement("img");
			img.setAttribute("src", btn[1]);
			img.style.width = "18px";
			img.style.height = "18px";
			el.appendChild(img);
			Image problem on Windows XP */
			el.innerHTML = '<img src="'+ btn[1] +'" width="18" height="18" />';
		} else if (!el) {
			el = createSelect(txt);
		}
		if (el) {
			var tb_cell = document.createElement("div");
			if(first_cell_on_line) {
				tb_cell.className = "tb-first-cell";
				first_cell_on_line = false;
			} else {
				tb_cell.className = "tb-cell";
			}
			tb_cell.appendChild(el);
			tb_line.appendChild(tb_cell);
		} else {
			alert("FIXME: Unknown toolbar item: " + txt);
		}
		return el;
	};

	var first = true;
	for (var i = 0; i < this.config.toolbar.length; ++i) {
		if (!first) {
			createButton("linebreak");
		} else {
			first = false;
		}
		var group = this.config.toolbar[i];
		for (var j = 0; j < group.length; ++j) {
			var code = group[j];
			if (/^([IT])\[(.*?)\]/.test(code)) {
				// special case, create text label
				var l7ed = RegExp.$1 == "I"; // localized?
				var label = RegExp.$2;
				if (l7ed) {
					label = HTMLArea.I18N.custom[label];
				}
				var labelElement = document.createElement("div");
				labelElement.className = "label";
				labelElement.innerHTML = label;
				var tb_cell = document.createElement("div");
				tb_cell.className = "tb-cell";
				tb_cell.appendChild(labelElement);
				tb_line.appendChild(tb_cell);
			} else {
				createButton(code);
			}
		}
	}
	this._htmlArea.appendChild(toolbar);
};

// Handler to emulate nice flat toolbar buttons and process toolbar element events
HTMLArea.toolBarButtonHandler = function(ev) {
	if (!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	if(target.tagName.toLowerCase() == "img") target = target.parentNode;
	var obj = target._obj;
	if(obj.enabled) {
		switch(ev.type) {
			case "mouseover":
				HTMLArea._addClass(target, "buttonHover");
				break;
			case "mouseout":
				HTMLArea._removeClass(target, "buttonHover");
				HTMLArea._removeClass(target, "buttonActive");
				if(obj.active) HTMLArea._addClass(target, "buttonPressed");
				break;
			case "mousedown":
				HTMLArea._addClass(target, "buttonActive");
				HTMLArea._removeClass(target, "buttonPressed");
				HTMLArea._stopEvent(ev);
				break;
			case "click":
				HTMLArea._removeClass(target, "buttonActive");
				HTMLArea._removeClass(target, "buttonHover");
				obj.cmd(obj.editor, obj.name, obj);
				HTMLArea._stopEvent(ev);
				break;
			case "change":
				obj.editor.focusEditor();
				var value = target.options[target.selectedIndex].value;
				switch (obj.name) {
					case "fontname":
					case "fontsize": 
						obj.editor.execCommand(obj.name, false, value);
						break;
					case "formatblock":
						(HTMLArea.is_ie) && (value = "<" + value + ">");
						obj.editor.execCommand(obj.name, false, value);
						break;
					default:
						var dropdown = obj.editor.config.customSelects[obj.name];
						if (typeof dropdown != "undefined") {
							dropdown.action(obj.editor);
						} else {
							alert("FIXME: combo box " + obj.name + " not implemented");
						}
				}
		}
	}
};

// Creates the status bar
HTMLArea.prototype._createStatusBar = function() {
	var statusbar = document.createElement("div");
	statusbar.className = "statusBar";
	this._statusBar = statusbar;
	var statusBarTree = document.createElement("span");
	statusBarTree.className = "statusBarTree";
	statusBarTree.appendChild(document.createTextNode(HTMLArea.I18N.msg["Path"] + ": "));
	this._statusBarTree = statusBarTree;
	this._statusBar.appendChild(statusBarTree);
	if (!this.config.statusBar) statusbar.style.display = "none";
	this._htmlArea.appendChild(statusbar);
};

// Creates the HTMLArea object and replaces the textarea with it.
HTMLArea.prototype.generate = function () {
	var editor = this;

		// get the textarea and hide it
	var textarea = this._textArea;
	if (typeof textarea == "string") {
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

	if (textarea.form) {
			// we have a form, on reset, re-initialize the HTMLArea content and update the toolbar
		var f = textarea.form;
		if (typeof f.onreset == "function") {
			var funcref = f.onreset;
			if (typeof f.__msh_prevOnReset == "undefined") {
				f.__msh_prevOnReset = [];
			}
			f.__msh_prevOnReset.push(funcref);
		}
		f.onreset = function() {
			editor.setHTML(editor._textArea.value);
			editor.updateToolbar();
			var a = this.__msh_prevOnReset;
			// call previous reset methods if they were there.
			if (typeof a != "undefined") {
				for (var i = a.length; --i >= 0;) {
					a[i]();
				}
			}
		};
	}

		// create & append the toolbar
	this._createToolbar();

		// create and append the IFRAME
	var iframe = document.createElement("iframe");
	if(HTMLArea.is_ie || HTMLArea.is_wamcom) {
		iframe.setAttribute("src", _editor_url + "popups/blank.html");
	} else {
		iframe.setAttribute("src", "javascript:void(0);");
	}
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

	editor.initIframe();
	return this;
};

// Initializes the iframe
HTMLArea.prototype.initIframe = function() {
	var editor = this;
	if (!editor._iframe || !editor._iframe.contentWindow 
			|| !editor._iframe.contentWindow.document 
			|| !editor._iframe.contentWindow.document.documentElement) {
		setTimeout(function() { editor.initIframe(); }, 50);
		return false;
	}
	var doc = editor._iframe.contentWindow.document;
	editor._doc = doc;

	if (!editor.config.fullPage) {
		var head = doc.getElementsByTagName("head")[0];
		if(!head) {
			head = doc.createElement("head");
			doc.documentElement.appendChild(head);
		}
		if (editor.config.baseURL) {
			var base = doc.getElementsByTagName("base")[0];
			if(!base) {
				base = doc.createElement("base");
				base.href = editor.config.baseURL;
				head.appendChild(base);
			}
		}
		if(editor.config.pageStyle) {
			var link = doc.getElementsByTagName("link")[0];
			if(!link) {
 				link = doc.createElement("link");
				link.rel = "stylesheet";
				link.href = editor.config.pageStyle;
				head.appendChild(link);
			}
		}
	} else {
		var html = editor._textArea.value;
		editor.setFullHTML(html);
	}

	function stylesLoaded() {

			// check if the stylesheets have been loaded
		var stylesAreLoaded = true;
		var rules;
		for(var rule=0;rule<doc.styleSheets.length;rule++){
			if(HTMLArea.is_gecko) try{ rules = doc.styleSheets[rule].cssRules; } catch(e) { stylesAreLoaded = false; }
			if(HTMLArea.is_ie) try{ rules = doc.styleSheets[rule].rules; } catch(e) { stylesAreLoaded = false; }
			if(HTMLArea.is_ie) try{ rules = doc.styleSheets[rule].imports; } catch(e) { stylesAreLoaded = false; }
		}
		if(!stylesAreLoaded && !HTMLArea.is_wamcom) {
			setTimeout(stylesLoaded, 100);
			return false;
		}

		if (!editor.config.fullPage) {
			doc.body.style.borderWidth = "0px";
			doc.body.innerHTML = editor._textArea.value;
		}

			// set contents editable
		if(HTMLArea.is_gecko) {
				// If we can't set designMode, we may be in a hidden TYPO3 tab
			var inTYPO3Tab = false;
			var DTMDiv = editor._textArea;
			while (DTMDiv && (DTMDiv.nodeType == 1) && (DTMDiv.tagName.toLowerCase() != "body")) {
				if(DTMDiv.tagName.toLowerCase() == "div" && DTMDiv.id.indexOf("DTM-") != -1 && DTMDiv.id.indexOf("-DIV") != -1 && DTMDiv.className == "c-tablayer") {
					inTYPO3Tab = true;
					break;
				} else {
					DTMDiv = DTMDiv.parentNode;
				}
			}
			if(!HTMLArea.is_wamcom) {
				try { doc.designMode = "on"; } catch(e) {}
			} else {
				try { doc.designMode = "on"; }
				catch(e) {
					if(!(inTYPO3Tab && DTMDiv.style.display == "none")) {
						doc.open();
						doc.close();
						setTimeout(function() { editor.initIframe(); }, 500);
						return false;
					}
				}
			}
		}
		if(HTMLArea.is_ie) doc.body.contentEditable = true;
		editor._editMode = "wysiwyg";

			// Set editor number in iframe and document for retrival in event handlers
		doc._editorNo = editor._typo3EditerNumber;
		if(HTMLArea.is_ie) doc.documentElement._editorNo = editor._typo3EditerNumber;

			// FIXME: when the TYPO3 TCA feature div2tab is used, the editor iframe may become hidden with style.display = "none"
			// This breaks the editor in gecko browsers: the designMode attribute needs to be resetted after the style.display of the containing div is resetted to "block"
			// Here we rely on TYPO3 naming conventions for the div id and class name
		if(HTMLArea.is_gecko && inTYPO3Tab) {
			HTMLArea._addEvent(DTMDiv, "DOMAttrModified",
				function(ev) {
					if(ev.target == DTMDiv && editor._editMode == "wysiwyg" && DTMDiv.style.display == "block") {
						setTimeout( function() {
							try { doc.designMode = "on"; } 
							catch(e) {
								doc.open();
								doc.close();
								editor.initIframe();}
							}, 20);
						HTMLArea._stopEvent(ev);
					}
				}
			);
		}

			// intercept some events for updating the toolbar & keyboard handlers
		HTMLArea._addEvents(doc, ["keydown", "keypress", "mousedown", "mouseup", "drag"], HTMLArea._editorEvent);
			// add unload handler
		HTMLArea._addEvent(editor._iframe.contentWindow, "unload", function(ev) { editor.removeEditorEvents(ev); });
			// Set killWordOnPaste and intercept paste, dragdrop and drop events for wordClean
		if(editor.config.killWordOnPaste) { HTMLArea._addEvents(HTMLArea.is_ie ? editor._doc.body : editor._doc, ["paste","dragdrop","drop"], editor.killWordOnPasteHandler); }

		setTimeout( function() {
				// check if any plugins have registered refresh handlers
			for (var i in editor.plugins) {
				var plugin = editor.plugins[i].instance;
				if (typeof plugin.onGenerate == "function") plugin.onGenerate();
				if (typeof plugin.onGenerateOnce == "function") {
					plugin.onGenerateOnce();
					plugin.onGenerateOnce = null;
				}
			}
			if (typeof editor.onGenerate == "function") editor.onGenerate();
			editor.updateToolbar();
		}, 100);
	};
	stylesLoaded();
};

// Cleans up event handlers and undo/redo snapshots, and updates the textarea for submission
HTMLArea.prototype.removeEditorEvents = function(ev) {
	if (!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var editor = this;
		// save the HTML content into the original textarea for submit, back/forward, etc.
	editor._textArea.value = editor.getHTML();
		// release undo/redo snapshots
	clearInterval(editor._timerUndo);
	editor._undoQueue = "undefined";
		// release some events for updating the toolbar & keyboard handlers
	HTMLArea._removeEvents(editor._doc, ["keydown", "keypress", "mousedown", "mouseup", "drag"], HTMLArea._editorEvent);
	if(editor.config.killWordOnPaste) { HTMLArea._removeEvents (HTMLArea.is_ie ? editor._doc.body : editor._doc, ["paste","dragdrop","drop"], editor.killWordOnPasteHandler); }
		// release toolbar button handlers
	for (var i in editor._toolbarObjects) {
		var btn = editor._toolbarObjects[i];
		var el = document.getElementById(btn.elementId);
		HTMLArea._removeEvents(el, ["mouseover", "mouseout", "mousedown", "click", "change"], HTMLArea.toolBarButtonHandler);
	}
};

// Switches editor mode; parameter can be "textmode" or "wysiwyg". If no parameter was passed, toggles between modes.
HTMLArea.prototype.setMode = function(mode) {
	if (typeof mode == "undefined") { mode = ((this._editMode == "textmode") ? "wysiwyg" : "textmode"); }
	switch (mode) {
	    case "textmode":
		this._textArea.value = this.getHTML();
		this._iframe.style.display = "none";
		this._textArea.style.display = "block";
		if (this.config.statusBar) {
			var statusBarTextMode = document.createElement("span");
			statusBarTextMode.className = "statusBarTextMode";
			statusBarTextMode.appendChild(document.createTextNode(HTMLArea.I18N.msg["TEXT_MODE"]));
			this._statusBar.innerHTML = '';
			this._statusBar.appendChild(statusBarTextMode);
		}
		break;
	    case "wysiwyg":
		if (HTMLArea.is_gecko) this._doc.designMode = "off";
		if (!this.config.fullPage)
			this._doc.body.innerHTML = this.getHTML();
		else
			this.setFullHTML(this.getHTML());
		this._textArea.style.display = "none";
		this._iframe.style.display = "block";
		if (HTMLArea.is_gecko) this._doc.designMode = "on";
		if (this.config.statusBar) {
			this._statusBar.innerHTML = '';
			this._statusBar.appendChild(this._statusBarTree);
		}
		break;
	    default:
		alert("Mode <" + mode + "> not defined!");
		return false;
	}
	this._editMode = mode;
	this.focusEditor();
	for (var i in this.plugins) {
		var plugin = this.plugins[i].instance;
		if (typeof plugin.onMode == "function") plugin.onMode(mode);
	}
};

HTMLArea.prototype.setFullHTML = function(html) {
	var save_multiline = RegExp.multiline;
	RegExp.multiline = true;
	if (html.match(HTMLArea.RE_doctype)) {
		this.setDoctype(RegExp.$1);
		html = html.replace(HTMLArea.RE_doctype, "");
	}
	RegExp.multiline = save_multiline;
	if (!HTMLArea.is_ie) {
		if (html.match(HTMLArea.RE_head))
			this._doc.getElementsByTagName("head")[0].innerHTML = RegExp.$1;
		if (html.match(HTMLArea.RE_body))
			this._doc.getElementsByTagName("body")[0].innerHTML = RegExp.$1;
	} else {
		var html_re = /<html>((.|\n)*?)<\/html>/i;
		html = html.replace(html_re, "$1");
		this._doc.open();
		this._doc.write(html);
		this._doc.close();
		this._doc.body.contentEditable = true;
		return true;
	}
};

/***************************************************
 *  Category: PLUGINS
 ***************************************************/
// Creates the specified plugin and registers it with this HTMLArea
HTMLArea.prototype.registerPlugin = function() {
	var plugin = arguments[0];
	var args = [];
	for (var i = 1; i < arguments.length; ++i)
		args.push(arguments[i]);
	this.registerPlugin2(plugin, args);
};

// this is the variant of the function above where the plugin arguments are
// already packed in an array.  Externally, it should be only used in the
// full-screen editor code, in order to initialize plugins with the same
// parameters as in the opener window.
HTMLArea.prototype.registerPlugin2 = function(plugin, args) {
	if (typeof plugin == "string")
		plugin = eval(plugin);
	if (typeof plugin == "undefined") {
		alert("Can't register undefined plugin.");
		return false;
	}
	var obj = new plugin(this, args);
	if (obj) {
		var clone = {};
		var info = plugin._pluginInfo;
		for (var i in info)
			clone[i] = info[i];
		clone.instance = obj;
		clone.args = args;
		this.plugins[plugin._pluginInfo.name] = clone;
	} else
		alert("Can't register plugin " + plugin.toString() + ".");
};

// static function that loads the required plugin and lang file, based on the
// language loaded already for HTMLArea.  You better make sure that the plugin
// _has_ that language, otherwise shit might happen ;-)
HTMLArea.loadPlugin = function(pluginName) {
	var dir = _editor_url + "plugins/" + pluginName;
	var plugin = pluginName.replace(/([a-z])([A-Z])([a-z])/g,
					function (str, l1, l2, l3) {
						return l1 + "-" + l2.toLowerCase() + l3;
					}).toLowerCase() + ".js";
	var plugin_file = dir + "/" + plugin;
	var plugin_lang = dir + "/lang/" + HTMLArea.I18N.lang + ".js";
	HTMLArea._scripts.push(plugin_file, plugin_lang);
	document.write("<script type='text/javascript' src='" + plugin_file + "'></script>");
	document.write("<script type='text/javascript' src='" + plugin_lang + "'></script>");	
};

HTMLArea.loadStyle = function(style, plugin, url) {
	if(typeof url == "undefined") {
		var url = _editor_url || '';
		if (typeof plugin != "undefined") {
			url += "plugins/" + plugin + "/";
		}
		url += style;
		if (/^\//.test(style))
			url = style;
	}
	var head = document.getElementsByTagName("head")[0];
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url;
	head.appendChild(link);
};
HTMLArea.loadStyle('','',_editor_CSS);

/***************************************************
 *  Category: EDITOR UTILITIES
 ***************************************************/
HTMLArea.prototype.debugTree = function() {
	var ta = document.createElement("textarea");
	ta.style.width = "100%";
	ta.style.height = "20em";
	ta.value = "";
	function debug(indent, str) {
		for (; --indent >= 0;)
			ta.value += " ";
		ta.value += str + "\n";
	};
	function _dt(root, level) {
		var tag = root.tagName.toLowerCase(), i;
		var ns = HTMLArea.is_ie ? root.scopeName : root.prefix;
		debug(level, "- " + tag + " [" + ns + "]");
		for (i = root.firstChild; i; i = i.nextSibling)
			if (i.nodeType == 1)
				_dt(i, level + 2);
	};
	_dt(this._doc.body, 0);
	document.body.appendChild(ta);
};

HTMLArea.getInnerText = function(el) {
	var txt = '', i;
	for (i = el.firstChild; i; i = i.nextSibling) {
		if (i.nodeType == 3)
			txt += i.data;
		else if (i.nodeType == 1)
			txt += HTMLArea.getInnerText(i);
	}
	return txt;
};

HTMLArea._wordClean = function(html) {
	var	stats = {
			empty_tags : 0,
			mso_class  : 0,
			mso_style  : 0,
			mso_xmlel  : 0,
			orig_len   : html.innerHTML.length,
			T          : (new Date()).getTime()
		},
		stats_txt = {
			empty_tags : "Empty tags removed: ",
			mso_class  : "MSO class names removed: ",
			mso_style  : "MSO inline style removed: ",
			mso_xmlel  : "MSO XML elements stripped: "
		};
	function showStats() {
		var txt = "HTMLArea word cleaner stats: \n\n";
		for (var i in stats)
			if (stats_txt[i])
				txt += stats_txt[i] + stats[i] + "\n";
		txt += "\nInitial document length: " + stats.orig_len + "\n";
		txt += "Final document length: " + html.innerHTML.length + "\n";
		txt += "Clean-up took " + (((new Date()).getTime() - stats.T) / 1000) + " seconds";
		alert(txt);
	};
	function clearClass(node) {
		var newc = node.className.replace(/(^|\s)mso.*?(\s|$)/ig, ' ');
		if (newc != node.className) {
			node.className = newc;
			if (!/\S/.test(node.className)) {
				node.removeAttribute("className");
				++stats.mso_class;
			}
		}
	};
	function clearStyle(node) {
 		var declarations = node.style.cssText.split(/\s*;\s*/);
		for (var i = declarations.length; --i >= 0;)
			if (/^mso|^tab-stops/i.test(declarations[i]) ||
			    /^margin\s*:\s*0..\s+0..\s+0../i.test(declarations[i])) {
				++stats.mso_style;
				declarations.splice(i, 1);
			}
		node.style.cssText = declarations.join("; ");
	};
	function stripTag(el) {
		if (HTMLArea.is_ie)
			el.outerHTML = HTMLArea.htmlEncode(el.innerText);
		else {
			var txt = document.createTextNode(HTMLArea.getInnerText(el));
			el.parentNode.insertBefore(txt, el);
			el.parentNode.removeChild(el);
		}
		++stats.mso_xmlel;
	};
	function checkEmpty(el) {
		if (/^(span|b|strong|i|em|font)$/i.test(el.tagName) &&
		    !el.firstChild) {
			el.parentNode.removeChild(el);
			++stats.empty_tags;
		}
	};
	function parseTree(root) {
		var tag = root.tagName.toLowerCase(), i, next;
		if ((HTMLArea.is_ie && root.scopeName != 'HTML') || (!HTMLArea.is_ie && /:/.test(tag))) {
			stripTag(root);
			return false;
		} else {
			clearClass(root);
			clearStyle(root);
			for (i = root.firstChild; i; i = next) {
				next = i.nextSibling;
				if (i.nodeType == 1 && parseTree(i))
					checkEmpty(i);
			}
		}
		return true;
	};
	parseTree(html);
	// showStats();
};

// Handler for paste, dragdrop and drop events
HTMLArea.prototype.killWordOnPasteHandler = function (ev) {
	if (!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var owner = (target.ownerDocument) ? target.ownerDocument : target;
	var editor = RTEarea[owner._editorNo]["editor"];
		// if we dropped an image dragged from the TYPO3 Browser, let's close the browser window
	if(typeof browserWin != "undefined") browserWin.close();
	setTimeout(function() { HTMLArea._wordClean(editor._doc.body); editor.updateToolbar(); }, 250);
};

HTMLArea.prototype.forceRedraw = function() {
	this._doc.body.style.visibility = "hidden";
	this._doc.body.style.visibility = "visible";
};

// focuses the iframe window and returns a reference to the editor document.
HTMLArea.prototype.focusEditor = function() {
	switch (this._editMode) {
		case "wysiwyg" :
			try { this._iframe.contentWindow.focus(); } catch(e) { };
			break;
		case "textmode":
			this._textArea.focus();
			break;
		default: 
			alert("ERROR: mode " + this._editMode + " is not defined");
	}
	return this._doc;
};

// takes a snapshot of the current text (for undo)
HTMLArea.prototype._undoTakeSnapshot = function() {
	var curTime = (new Date()).getTime();
	var newOne = true;
	if (this._undoPos >= this.config.undoSteps) {
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
		if (this._undoPos == 0 || this._undoQueue[this._undoPos - 1].text != txt){
			this._undoQueue[this._undoPos] = { text: txt, time: curTime };
			this._undoQueue.length = this._undoPos + 1;
		} else {
			this._undoPos--;
		}
 	} else {
		if (this._undoQueue[this._undoPos].text != txt){
			this._undoQueue[this._undoPos].text = txt;
			this._undoQueue.length = this._undoPos + 1;
		}
 	}
};

HTMLArea.prototype.undo = function() {
	if (this._undoPos > 0){
			// Make shure we would not loose any changes
		this._undoTakeSnapshot();
		this.setHTML(this._undoQueue[--this._undoPos].text);
	}
};

HTMLArea.prototype.redo = function() {
	if (this._undoPos < this._undoQueue.length - 1) {
			// Make shure we would not loose any changes
		this._undoTakeSnapshot();
			// Previous call could make undo queue shorter
		if (this._undoPos < this._undoQueue.length - 1) {
			this.setHTML(this._undoQueue[++this._undoPos].text);
		}
	}
};

// updates enabled/disable/active state of the toolbar elements
HTMLArea.prototype.updateToolbar = function(noStatus) {
	var editor = this;
	var doc = this._doc;
	var text = (this._editMode == "textmode");
	var ancestors = null;
	var i, cmd, inContext, match, k, ka, j, n;
	if (!text) {
		ancestors = this.getAllAncestors();
		if (this.config.statusBar && !noStatus) {
				// Unhook previous events handlers
			if(this._statusBarTree.hasChildNodes()) {
				for (i = this._statusBarTree.firstChild; i; i = i.nextSibling) {
					if(i.nodeName.toLowerCase() == "a") HTMLArea._removeEvents(i, ["click", "contextmenu"], HTMLArea.statusBarHandler);
				}
			}
			this._statusBarTree.innerHTML = '';
			this._statusBarTree.appendChild(document.createTextNode(HTMLArea.I18N.msg["Path"] + ": ")); // clear
			for (i = ancestors.length; --i >= 0;) {
				var el = ancestors[i];
				if (!el) { continue; }
				var a = document.createElement("a");
				a.href = "#";
				a.el = el;
				a.editor = this;
				HTMLArea._addEvents(a, ["click", "contextmenu"], HTMLArea.statusBarHandler);
				var txt = el.tagName.toLowerCase();
				a.title = el.style.cssText;
				if (el.id) { txt += "#" + el.id; }
				if (el.className) { txt += "." + el.className; }
				a.appendChild(document.createTextNode(txt));
				this._statusBarTree.appendChild(a);
				if (i != 0) { this._statusBarTree.appendChild(document.createTextNode(String.fromCharCode(0xbb))); }
			}
		}
	}

	for (i in this._toolbarObjects) {
		var btn = this._toolbarObjects[i];
		cmd = i;
		inContext = true;
		if (btn.context && !text) {
			inContext = false;
			var context = btn.context;
			var attrs = [];
			if (/(.*)\[(.*?)\]/.test(context)) {
				context = RegExp.$1;
				attrs = RegExp.$2.split(",");
			}
			context = context.toLowerCase();
			match = (context == "*");
			for (k = 0; k < ancestors.length; ++k) {
				if (!ancestors[k]) { continue; }
				if (match || (ancestors[k].tagName.toLowerCase() == context)) {
					inContext = true;
					for (ka = 0; ka < attrs.length; ++ka) {
						if (!eval("ancestors[k]." + attrs[ka])) {
							inContext = false;
							break;
						}
					}
					if (inContext) { break; }
				}
			}
		}
		btn.state("enabled", (!text || btn.text) && inContext);
		if (typeof cmd == "function") { continue; }
			// look-it-up in the custom dropdown boxes
		var dropdown = this.config.customSelects[cmd];
		if ((!text || btn.text) && (typeof dropdown != "undefined")) {
			dropdown.refresh(this);
			continue;
		}
		switch (cmd) {
		    case "fontname":
		    case "fontsize":
		    case "formatblock":
			if (!text) try {
				var value = ("" + doc.queryCommandValue(cmd)).toLowerCase();
				if (!value) {
					document.getElementById(btn.elementId).selectedIndex = 0;
					break;
				}
					// IE gives the labels as value and seems to translate the headings labels!
					// This will work at least in English and French...
				if(HTMLArea.is_ie && cmd == "formatblock" && value != "normal") {
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
					if ((j.toLowerCase() == value) ||
						   (options[j].substr(0, value.length).toLowerCase() == value)) {
						document.getElementById(btn.elementId).selectedIndex = k;
						throw "ok";
					}
					++k;
				}
				document.getElementById(btn.elementId).selectedIndex = 0;
			} catch(e) {};
			break;
		    case "textindicator":
			if (!text) {
				try {with (document.getElementById(btn.elementId).style) {
					backgroundColor = HTMLArea._makeColor(doc.queryCommandValue(HTMLArea.is_ie ? "backcolor" : "hilitecolor"));
						// Mozilla
					if (/transparent/i.test(backgroundColor)) { backgroundColor = HTMLArea._makeColor(doc.queryCommandValue("backcolor")); }
					color = HTMLArea._makeColor(doc.queryCommandValue("forecolor"));
					fontFamily = doc.queryCommandValue("fontname");
						// Check if queryCommandState is available
					fontWeight = "normal";
					fontStyle = "normal";
					try { fontWeight = doc.queryCommandState("bold") ? "bold" : "normal"; } catch(ex) { fontWeight = "normal"; };
					try { fontStyle = doc.queryCommandState("italic") ? "italic" : "normal"; } catch(ex) { fontStyle = "normal"; };
				}} catch (e) {
					// alert(e + "\n\n" + cmd);
				}
			}
			break;
		    case "htmlmode": btn.state("active", text); break;
		    case "lefttoright":
		    case "righttoleft":
			var el = this.getParentElement();
			while (el && !HTMLArea.isBlockElement(el)) { el = el.parentNode; }
			if (el) { btn.state("active", (el.style.direction == ((cmd == "righttoleft") ? "rtl" : "ltr"))); }
			break;
		    case "bold":
		    case "italic":
		    case "strikethrough":
		    case "underline":
		    case "subscript":
		    case "superscript":
		    case "justifyleft":
		    case "justifycenter":
		    case "justifyright":
		    case "justifyfull":
		    case "indent":
		    case "outdent":
		    case "insertorderedlist":
		    case "insertunorderedlist":
		    case "orderedlist":
		    case "unorderedlist":
			cmd = cmd.replace(/(un)?orderedlist/i, "insert$1orderedlist");
			var commandState = false;
			if( !text ) { try { commandState = doc.queryCommandState(cmd); } catch(e) { commandState = false; } }
			btn.state("active", commandState);
			break;
		    default:
		}
	}
		// take undo snapshots
	if (this._customUndo) this._undoTakeSnapshot();
		// check if any plugins have registered refresh handlers
	for (i in this.plugins) {
		var plugin = this.plugins[i].instance;
		if (typeof plugin.onUpdateToolbar == "function")
			plugin.onUpdateToolbar();
	}
};

// Handles statusbar element events
HTMLArea.statusBarHandler = function (ev) {
	if (!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var editor = target.editor;
	target.blur();
	if(HTMLArea.is_gecko) { editor.selectNode(target.el); } else { editor.selectNodeContents(target.el); }
	editor.updateToolbar(true);
	switch (ev.type) {
		case "click" : return false;
		case "contextmenu" : return editor.plugins.ContextMenu.instance.popupMenu(ev, target.el);
	}
};

/** Returns a node after which we can insert other nodes, in the current
 * selection.  The selection is removed.  It splits a text node, if needed.
 */
HTMLArea.prototype.insertNodeAtSelection = function(toBeInserted) {
	if (!HTMLArea.is_ie) {
		this.focusEditor();
		var sel = this._getSelection();
		var range = this._createRange(sel);
			// remove the current selection
		sel.removeAllRanges();
		range.deleteContents();
		var node = range.startContainer;
		var pos = range.startOffset;
		switch (node.nodeType) {
		    case 3: // Node.TEXT_NODE
			// we have to split it at the caret position.
			if (toBeInserted.nodeType == 3) {
				// do optimized insertion
				node.insertData(pos, toBeInserted.data);
				range = this._createRange();
				range.setEnd(node, pos + toBeInserted.length);
				range.setStart(node, pos + toBeInserted.length);
				sel.addRange(range);
			} else {
				node = node.splitText(pos);
				var selnode = toBeInserted;
				if (toBeInserted.nodeType == 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
					selnode = selnode.firstChild;
				}
				node.parentNode.insertBefore(toBeInserted, node);
				this.selectNodeContents(selnode);
				this.updateToolbar();
			}
			break;
		    case 1: // Node.ELEMENT_NODE
			var selnode = toBeInserted;
			if (toBeInserted.nodeType == 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
				selnode = selnode.firstChild;
			}
			node.insertBefore(toBeInserted, node.childNodes[pos]);
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

// Returns the deepest node that contains both endpoints of the selection.
HTMLArea.prototype.getParentElement = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	if (HTMLArea.is_ie) {
		switch (sel.type) {
		    case "Text":
		    case "None":
			return range.parentElement();
		    case "Control":
			return range.item(0);
		    default:
			return this._doc.body;
		}
	} else try {
		var p = range.commonAncestorContainer;
		if (!range.collapsed && range.startContainer == range.endContainer &&
		    range.startOffset - range.endOffset <= 1 && range.startContainer.hasChildNodes())
			p = range.startContainer.childNodes[range.startOffset];
		/*
		alert(range.startContainer + ":" + range.startOffset + "\n" +
		      range.endContainer + ":" + range.endOffset);
		*/
		while (p.nodeType == 3) {
			p = p.parentNode;
		}
		return p;
	} catch (e) {
		return null;
	}
};

// Returns an array with all the ancestor nodes of the selection.
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

// Selects the contents inside the given node
HTMLArea.prototype.selectNodeContents = function(node, pos) {
	var editor = this;
	editor.focusEditor();
	editor.forceRedraw();
	var collapsed = (typeof pos != "undefined");
	if (HTMLArea.is_ie) {
		var range = editor._doc.body.createTextRange();
		range.moveToElementText(node);
		(collapsed) && range.collapse(pos);
		range.select();
	} else {
		var sel = editor._getSelection();
		var range = editor._doc.createRange();
		range.selectNodeContents(node);
		(collapsed) && range.collapse(pos);
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

// Selects a node and the contents inside the node
HTMLArea.prototype.selectNode = function(node) {
	var editor = this;
	editor.focusEditor();
	editor.forceRedraw();
	if (HTMLArea.is_ie) {
			//FIXME: Fails to select the full contents of table, ol and ul
		var range = editor._doc.body.createTextRange();
		range.moveToElementText(node);
		range.select();
	} else {
		var sel = editor._getSelection();
		var range = editor._doc.createRange();
		range.selectNode(node);
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

// Inserts HTML code at the current position. Deletes the selection, if any.
HTMLArea.prototype.insertHTML = function(html) {
	this.focusEditor();
	var sel = this._getSelection();
	var range = this._createRange(sel);
	if (HTMLArea.is_ie) {
		range.pasteHTML(html);
	} else {
		// construct a new document fragment with the given HTML
		var fragment = this._doc.createDocumentFragment();
		var div = this._doc.createElement("div");
		div.innerHTML = html;
		while (div.firstChild) {
			// the following call also removes the node from div
			fragment.appendChild(div.firstChild);
		}
		// this also removes the selection
		var node = this.insertNodeAtSelection(fragment);
	}
};

// Surrounds the existing HTML code in the selection with your tags. Deletes the selection, if any.
HTMLArea.prototype.surroundHTML = function(startTag, endTag) {
	var html = this.getSelectedHTML();
	this.insertHTML(startTag + html + endTag);
};

// Retrieves the contents of selected block
HTMLArea.prototype.getSelectedHTML = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	var existing = null;
	if (HTMLArea.is_ie) {
		if(sel.type.toLowerCase() == "control") {
			this.selectNodeContents(range(0));
			sel = this._getSelection();
			range = this._createRange(sel);
		}
		existing = range.htmlText;
	} else {
		var cloneContents = "";
		try { cloneContents = range.cloneContents(); } catch(e) { }
		existing = HTMLArea.getHTML(cloneContents, false, this);
	}
	return existing;
};

// Retrieves simply the selected block
HTMLArea.prototype.getSelectedHTMLContents = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	var existing = null;
	if (HTMLArea.is_ie) {
		existing = range.htmlText;
	} else {
		var cloneContents = "";
		try { cloneContents = range.cloneContents(); } catch(e) { }
		existing = HTMLArea.getHTML(cloneContents, false, this);
	}
	return existing;
};

// Return true if we have some selection
HTMLArea.prototype.hasSelectedText = function() {
	return this.getSelectedHTML() != '';
};

HTMLArea.prototype._createLink = function(link) {
	var editor = this;
	var outparam = null;
	editor.focusEditor();
	if (typeof link == "undefined") {
		link = this.getParentElement();
		if (link) {
			if (/^img$/i.test(link.tagName))
				link = link.parentNode;
			if (!/^a$/i.test(link.tagName))
				link = null;
		}
	}
	if (!link) {
		var sel = editor._getSelection();
		var range = editor._createRange(sel);
		var compare = 0;
		if (HTMLArea.is_ie) {
			compare = range.compareEndPoints("StartToEnd", range);
		} else {
			compare = range.compareBoundaryPoints(range.START_TO_END, range);
		}
		if (compare == 0) {
			alert("You need to select some text before creating a link");
			return;
		}
		outparam = {
			f_href : '',
			f_title : '',
			f_target : '',
			f_usetarget : editor.config.makeLinkShowsTarget
		};
	} else
		outparam = {
			f_href   : HTMLArea.is_ie ? editor.stripBaseURL(link.href) : link.getAttribute("href"),
			f_title  : link.title,
			f_target : link.target,
			f_usetarget : editor.config.makeLinkShowsTarget
		};
	this._popupDialog("link.html", function(param) {
		if (!param || typeof param.f_href == "undefined")
			return false;
		var a = link;
		if (!a) try {
			editor._doc.execCommand("createlink", false, param.f_href);
			a = editor.getParentElement();
			var sel = editor._getSelection();
			var range = editor._createRange(sel);
			if (!HTMLArea.is_ie) {
				a = range.startContainer;
				if (!/^a$/i.test(a.tagName)) {
					a = a.nextSibling;
					if (a == null)
						a = range.startContainer.parentNode;
				}
			}
		} catch(e) {}
		else {
			var href = param.f_href.trim();
			editor.selectNodeContents(a);
			if (href == "") {
				editor._doc.execCommand("unlink", false, null);
				editor.updateToolbar();
				return false;
			}
			else {
				a.href = href;
			}
		}
		if (!(a && /^a$/i.test(a.tagName)))
			return false;
		if(typeof param.f_target != "undefined") a.target = param.f_target.trim();
		if(typeof param.f_title != "undefined") a.title = param.f_title.trim();
		editor.selectNodeContents(a);
		editor.updateToolbar();
	}, outparam, 400, 145);
};

// Called when the user clicks on "InsertImage" button.  If an image is already
// there, it will just modify it's properties.
HTMLArea.prototype._insertImage = function(image) {
	var editor = this;	// for nested functions
	var outparam = null;
	editor.focusEditor();
	if (typeof image == "undefined") {
		image = this.getParentElement();
		if (image && !/^img$/i.test(image.tagName))
			image = null;
	}
	if (image) outparam = {
		f_base   : editor.config.baseURL,
		f_url    : HTMLArea.is_ie ? editor.stripBaseURL(image.src) : image.getAttribute("src"),
		f_alt    : image.alt,
		f_border : image.border,
		f_align  : image.align,
		f_vert   : image.vspace,
		f_horiz  : image.hspace,
 		f_float  : HTMLArea.is_ie ? image.style.styleFloat : image.style.cssFloat
	};
	this._popupDialog("insert_image.html", function(param) {
		if (!param || typeof param.f_url == "undefined") {	// user must have pressed Cancel
			return false;
		}
		var img = image;
		if (!img) {
			var sel = editor._getSelection();
			var range = editor._createRange(sel);
			editor._doc.execCommand("insertimage", false, param.f_url);
			if (HTMLArea.is_ie) {
				img = range.parentElement();
				// wonder if this works...
				if (img.tagName.toLowerCase() != "img") {
					img = img.previousSibling;
				}
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
				case "f_float"  : if (HTMLArea.is_ie) { img.style.styleFloat = value; }  else { img.style.cssFloat = value;} break; 
			}
		}
	}, outparam, 580, 460);
};

// Called when the user clicks the Insert Table button
HTMLArea.prototype._insertTable = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	var editor = this;	// for nested functions
	editor.focusEditor();
	editor._popupDialog("insert_table.html", function(param) {
		if (!param) { return false; } // user must have pressed Cancel
		var doc = editor._doc;
			// create the table element
		var table = doc.createElement("table");
			// assign the given arguments
		for (var field in param) {
			var value = param[field];
			if (!value) { continue; }
			switch (field) {
				case "f_width"   : table.style.width = value + param["f_unit"]; break;
				case "f_align"   : table.style.textAlign = value; break;
				case "f_border"  : 
					table.border = parseInt(value);
					table.style.borderWidth	 = parseInt(value)+"px";
					table.style.borderStyle = "";
					table.frame = "";
					table.rules = "";
					break;
				case "f_spacing" : table.cellSpacing = parseInt(value); break;
				case "f_padding" : table.cellPadding = parseInt(value); break;
				case "f_float"   : 
					if (HTMLArea.is_ie) { 
						table.style.styleFloat = (value != "not set") ? value : ""; 
					} else { 
						table.style.cssFloat = (value != "not set") ? value : "";
					} 
					break; 
			}
		}
		var cellwidth = 0;
		if (param.f_fixed) cellwidth = Math.floor(100 / parseInt(param.f_cols));
		var tbody = doc.createElement("tbody");
		table.appendChild(tbody);
		for (var i = 0; i < param["f_rows"]; ++i) {
			var tr = doc.createElement("tr");
			tbody.appendChild(tr);
			for (var j = 0; j < param["f_cols"]; ++j) {
				var td = doc.createElement("td");
				if (cellwidth)
					td.style.width = cellwidth + "%";
				tr.appendChild(td);
				// Mozilla likes to see something inside the cell.
				(HTMLArea.is_gecko) && td.appendChild(doc.createElement("br"));
			}
		}
		editor.focusEditor();
			// insert the table
		if (HTMLArea.is_ie) {
			range.pasteHTML(table.outerHTML);
		} else {
			editor.insertNodeAtSelection(table);
		}
		editor.forceRedraw();
		editor.updateToolbar();
		return true;
	}, null, 520, 230);
};

/***************************************************
 *  Category: EVENT HANDLERS
 ***************************************************/

// the execCommand function intercepts some commands and replaces them with our own implementation
HTMLArea.prototype.execCommand = function(cmdID, UI, param) {
	var editor = this;	// for nested functions
	this.focusEditor();
	cmdID = cmdID.toLowerCase();
	if (HTMLArea.is_gecko && !this.config.useCSS) try { this._doc.execCommand('useCSS', false, true); } catch (e) {};
	switch (cmdID) {
	    case "htmlmode" : this.setMode(); break;
	    case "hilitecolor":
		(HTMLArea.is_ie) && (cmdID = "backcolor");
	    case "forecolor":
		this._popupDialog("select_color.html", function(color) {
			if (color) { // selection not canceled
				editor._doc.execCommand(cmdID, false, "#" + color);
			}
		}, HTMLArea._colorToRgb(this._doc.queryCommandValue(cmdID)), 200, 182);
		break;
	    case "createlink":
		this._createLink();
		break;
	    case "popupeditor":
		// this object will be passed to the newly opened window
		HTMLArea._object = this;
		if (HTMLArea.is_ie) {
			//if (confirm(HTMLArea.I18N.msg["IE-sucks-full-screen"]))
			//{
				window.open(this.popupURL("fullscreen.html"), "ha_fullscreen",
					    "toolbar=no,location=no,directories=no,status=no,menubar=no," +
					    "scrollbars=no,resizable=yes,width=640,height=480");
			//}
		} else {
			window.open(this.popupURL("fullscreen.html"), "ha_fullscreen",
				    "toolbar=no,menubar=no,personalbar=no,width=640,height=480," +
				    "scrollbars=no,resizable=yes");
		}
		break;
	    case "undo":
	    case "redo":
		if (this._customUndo)
			this[cmdID]();
		else
			this._doc.execCommand(cmdID, UI, param);
		break;
	    case "inserttable": this._insertTable(); break;
	    case "insertimage": this._insertImage(); break;
	    case "about"    : this._popupDialog("about.html", null, this, 475,350); break;
	    case "showhelp" : window.open(_editor_url + "reference.html", "ha_help"); break;
	    case "killword": HTMLArea._wordClean(editor._doc.body); break;
	    case "cut":
	    case "copy":
	    case "paste":
		try {
			this._doc.execCommand(cmdID, UI, param);
			if (this.config.killWordOnPaste)
				HTMLArea._wordClean(editor._doc.body);
		} catch (e) {
			if (HTMLArea.is_gecko) {
				if(this.config.enableMozillaExtension) {
					if (typeof HTMLArea.I18N.msg["Moz-Extension"] == "undefined") {
						HTMLArea.I18N.msg["Moz-Extension"] =
							"Unprivileged scripts cannot access the clipboard programatically " +
							"for security reasons.  Click OK to install a component that will " +
							"enable scripts from this TYPO3 site to access the clipboard.\n\n";
					}
					if (confirm(HTMLArea.I18N.msg["Moz-Extension"])) {
						if (InstallTrigger.enabled()) {
							function mozillaInstallCallback(url,returnCode) {
								if(returnCode == 0) { 
									alert(HTMLArea.I18N.msg["Moz-Extension-Success"]);
									return; 
								} else {
									alert(HTMLArea.I18N.msg["Moz-Extension-Failure"]);
									return; 
								}
							};
							var xpi = new Object();
							xpi["TYPO3 htmlArea RTE Preferences"] = "../uploads/tx_rtehtmlarea/typo3_rtehtmlarea_prefs.xpi";
  							InstallTrigger.install(xpi, mozillaInstallCallback);
						} else {
							alert(HTMLArea.I18N.msg["Moz-Extension-Install-Not-Enabled"]);
							return; 
						}
					}
				} else {
					if (typeof HTMLArea.I18N.msg["Moz-Clipboard"] == "undefined") {
						HTMLArea.I18N.msg["Moz-Clipboard"] =
							"Unprivileged scripts cannot access Cut/Copy/Paste programatically " +
							"for security reasons.  Click OK to see a technical note at mozilla.org " +
							"which shows you how to allow a script to access the clipboard.\n\n";
					}
					if (confirm(HTMLArea.I18N.msg["Moz-Clipboard"])) {
						window.open("http://mozilla.org/editor/midasdemo/securityprefs.html");
					}
				}
			}
		}
		break;
	    case "lefttoright":
	    case "righttoleft":
		var dir = (cmdID == "righttoleft") ? "rtl" : "ltr";
		var el = this.getParentElement();
		while (el && !HTMLArea.isBlockElement(el))
			el = el.parentNode;
		if (el) {
			if (el.style.direction == dir)
				el.style.direction = "";
			else
				el.style.direction = dir;
		}
		break;
	    default: try { this._doc.execCommand(cmdID, UI, param); }
		catch(e) { if (this.config.debug) { alert(e + "\n\nby execCommand(" + cmdID + ");"); } }
	}
	this.updateToolbar();
	return false;
};

/*
* A generic event handler for things that happen in the IFRAME's document.
* This function also handles key bindings.
*/
HTMLArea._editorEvent = function(ev) {
	if (!ev) var ev = window.event;
	var target = (ev.target) ? ev.target : ev.srcElement;
	var owner = (target.ownerDocument) ? target.ownerDocument : target;
	while (HTMLArea.is_ie && owner.parentElement ) { // IE5.5 does not report any ownerDocument
		owner = owner.parentElement;
	}
	var editor = RTEarea[owner._editorNo]["editor"];
	var keyEvent = (HTMLArea.is_ie && ev.type == "keydown") || (!HTMLArea.is_ie && ev.type == "keypress");
	editor.focusEditor();

	if (keyEvent) {
		for (var i in editor.plugins) {
			var plugin = editor.plugins[i].instance;
			if (typeof plugin.onKeyPress == "function") {
				if (plugin.onKeyPress(ev)) return false;
			}
		}
	}
	if (keyEvent && ev.ctrlKey && !ev.altKey) {
		var sel = null;
		var range = null;
		var key = String.fromCharCode(HTMLArea.is_ie ? ev.keyCode : ev.charCode).toLowerCase();
		var cmd = null;
		var value = null;
		switch (key) {
		    case 'a':
			if (!HTMLArea.is_ie) {
				// KEY select all
				sel = editor._getSelection();
				sel.removeAllRanges();
				range = editor._createRange();
				range.selectNodeContents(editor._doc.body);
				sel.addRange(range);
				HTMLArea._stopEvent(ev);
			}
			break;

				// simple key commands follow
		    case 'b': cmd = "bold"; break;
		    case 'i': cmd = "italic"; break;
		    case 'u': cmd = "underline"; break;
		    case 's': cmd = "strikethrough"; break;
		    case 'l': cmd = "justifyleft"; break;
		    case 'e': cmd = "justifycenter"; break;
		    case 'r': cmd = "justifyright"; break;
		    case 'j': cmd = "justifyfull"; break;
		    case 'z': cmd = "undo"; break;
		    case 'y': cmd = "redo"; break;
		    case 'v': if (HTMLArea.is_ie || editor.config.htmlareaPaste) { cmd = "paste"; } break;
		    case 'n': cmd = "formatblock"; value = HTMLArea.is_ie ? "<p>" : "p"; break;
		    case '0': cmd = "killword"; break;

			// headings
		    case '1':
		    case '2':
		    case '3':
		    case '4':
		    case '5':
		    case '6':
			cmd = "formatblock";
			value = "h" + key;
			if (HTMLArea.is_ie)
				value = "<" + value + ">";
			break;
		    case '-':  // Soft hyphen
			editor.focusEditor();
			editor.insertHTML('&shy;');
			HTMLArea._stopEvent(ev);
			break;
		}
		if (cmd) {
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
		// other keys here
		switch (ev.keyCode) {
		    case 13: // KEY enter
			if (HTMLArea.is_gecko && !ev.shiftKey && !editor.config.disableEnterParagraphs) {
				editor.dom_checkInsertP();
				HTMLArea._stopEvent(ev);
			}
			break;
		    case 8: // KEY backspace
		    case 46: // KEY delete
			if (HTMLArea.is_gecko && !ev.shiftKey) {
				if (editor.dom_checkBackspace()) {
					HTMLArea._stopEvent(ev);
				}
			} else if (HTMLArea.is_ie) {
				if (editor.ie_checkBackspace())
					HTMLArea._stopEvent(ev);
			}
			break;
		}
	}

		// update the toolbar state after some time
	if (editor._timerToolbar) { clearTimeout(editor._timerToolbar); }
	editor._timerToolbar = setTimeout(function() {
		editor.updateToolbar();
		editor._timerToolbar = null;
	}, 50);
};

HTMLArea.prototype.scrollToCaret = function() {
	var
		e = this.getParentElement(),
		w = this._iframe.contentWindow,
		h = w.innerHeight || w.height,
		d = this._doc,
		t = d.documentElement.scrollTop || d.body.scrollTop;
	if (typeof h == "undefined")
		return false;
	if (e.offsetTop > h + t)
		w.scrollTo(e.offsetLeft, e.offsetTop - h + e.offsetHeight);
};

HTMLArea.prototype.convertNode = function(el, newTagName) {
	var newel = this._doc.createElement(newTagName), p = el.parentNode;
	while (el.firstChild)
		newel.appendChild(el.firstChild);
	p.insertBefore(newel, el);
	p.removeChild(el);
	return newel;
};

HTMLArea.prototype.ie_checkBackspace = function() {
	var sel = this._getSelection();
	var range = this._createRange(sel);
	if (sel.type == "Control"){   
		var el = this.getParentElement();   
		var p = el.parentNode;   
		p.removeChild(el);   
		return true;  
	} else {
		var r2 = range.duplicate();
		r2.moveStart("character", -1);
		var a = r2.parentElement();
		if (a != range.parentElement() && /^a$/i.test(a.tagName)) {
			r2.collapse(true);
			r2.moveEnd("character", 1);
       		r2.pasteHTML('');
       		r2.select();
       		return true;
		}
	}
};

HTMLArea.prototype.dom_checkBackspace = function() {
	var self = this;
	setTimeout(function() {
		self.focusEditor();
		var sel = self._getSelection();
		var range = self._createRange(sel);
		var SC = range.startContainer;
		var SO = range.startOffset;
		var EC = range.endContainer;
		var EO = range.endOffset;
		var newr = SC.nextSibling;
		if (SC.nodeType == 3)
			SC = SC.parentNode;
		if (!/\S/.test(SC.tagName)) {
			var p = document.createElement("p");
			while (SC.firstChild)
				p.appendChild(SC.firstChild);
			SC.parentNode.insertBefore(p, SC);
			SC.parentNode.removeChild(SC);
			var r = range.cloneRange();
			r.setStartBefore(newr);
			r.setEndAfter(newr);
			r.extractContents();
			sel.removeAllRanges();
			sel.addRange(r);
		}
	}, 10);
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

	for (i = 0; i < p.length; ++i)
		if (HTMLArea.isBlockElement(p[i]) && !/body|html|table|tbody|tr/i.test(p[i].tagName)) {
			block = p[i];
			break;
		}

	if (!r.collapsed)
		r.deleteContents();
	sel.removeAllRanges();
	SC = r.startContainer;

	if (!block || /td/i.test(block.tagName) ) {
		left = SC;
		for (i = SC; i && i != body && !HTMLArea.isBlockElement(i); i = HTMLArea.getPrevNode(i))
			left = i;
		right = SC;
		for (i = SC; i && i != body && !HTMLArea.isBlockElement(i); i = HTMLArea.getNextNode(i))
			right = i;
		if (left != body && right != body && !(block && left == block ) && !(block && right == block )) {
			r2 = r.cloneRange();
			r2.setStartBefore(left);
			r2.surroundContents(block = doc.createElement("p"));
			if (!/\S/.test(HTMLArea.getInnerText(block)))
				block.innerHTML = "<br />";
			block.normalize();
			r.setEndAfter(right);
			r.surroundContents(block = doc.createElement("p"));
			if (!/\S/.test(HTMLArea.getInnerText(block)))
				block.innerHTML = "<br />";
			block.normalize();
		} else { 
			if (!block) {
				r = doc.createRange();
				r.setStart(body, 0);
				r.setEnd(body, 0);
				r.insertNode(block = doc.createElement("p"));
				block.innerHTML = "<br />";
			} else {
				r = doc.createRange();
				r.setStart(block, 0);
				r.setEnd(block, 0);
				r.insertNode(block = doc.createElement("p"));
				block.innerHTML = "<br />";
			}
		}
		r.selectNodeContents(block);
	} else {
		r.setEndAfter(block);
		var df = r.extractContents(), left_empty = false;
		if (!/\S/.test(block.innerHTML)) {
			block.innerHTML = "<br />";
			left_empty = true;
		}
		p = df.firstChild;
		if (p) {
			if (!/\S/.test(HTMLArea.getInnerText(p))) {
 				if (/^h[1-6]$/i.test(p.tagName))
 					p = this.convertNode(p, "p");
				p.innerHTML = "<br />";
			}
			if (/^li$/i.test(p.tagName) && left_empty && !block.nextSibling) {
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
	sel.addRange(r);
	this.forceRedraw();
	this.scrollToCaret();
};

// retrieve the HTML
HTMLArea.prototype.getHTML = function() {
	switch (this._editMode) {
	    case "wysiwyg"  :
		if (!this.config.fullPage) {
			return HTMLArea.getHTML(this._doc.body, false, this);
		} else
			return this.doctype + "\n" + HTMLArea.getHTML(this._doc.documentElement, true, this);
	    case "textmode" : return this._textArea.value;
	    default	    : alert("Mode <" + this._editMode + "> not defined!");
	}
	return false;
};

// retrieve the HTML (fastest version, but uses innerHTML)
HTMLArea.prototype.getInnerHTML = function() {
	switch (this._editMode) {
	    case "wysiwyg"  :
		if (!this.config.fullPage)
			return this._doc.body.innerHTML;
		else
			return this.doctype + "\n" + this._doc.documentElement.innerHTML;
	    case "textmode" : return this._textArea.value;
	    default	    : alert("Mode <" + this._editMode + "> not defined!");
	}
	return false;
};

// completely change the HTML inside
HTMLArea.prototype.setHTML = function(html) {
	switch (this._editMode) {
	    case "wysiwyg"  :
		if (!this.config.fullPage)
			this._doc.body.innerHTML = html;
		else
			// this._doc.documentElement.innerHTML = html;
			this._doc.body.innerHTML = html;
		break;
	    case "textmode" : this._textArea.value = html; break;
	    default	    : alert("Mode <" + this._editMode + "> not defined!");
	}
	return false;
};

// sets the given doctype (useful when config.fullPage is true)
HTMLArea.prototype.setDoctype = function(doctype) {
	this.doctype = doctype;
};

HTMLArea.prototype.editorEventResume = function() {
	var editor = this;
};

HTMLArea.prototype.editorEventSuspend = function() {
	var editor = this;
};

/***************************************************
 *  Category: UTILITY FUNCTIONS
 ***************************************************/

// variable used to pass the object to the popup editor window.
HTMLArea._object = null;

// function that returns a clone of the given object
HTMLArea.cloneObject = function(obj) {
	if (!obj) return null;
	var newObj = new Object;

	// check for array objects
	if (obj.constructor.toString().indexOf("function Array(") == 1) {
		newObj = obj.constructor();
	}

	// check for function objects (as usual, IE is fucked up)
	if (obj.constructor.toString().indexOf("function Function(") == 1) {
		newObj = obj; // just copy reference to it
	} else for (var n in obj) {
		var node = obj[n];
		if (typeof node == 'object') { newObj[n] = HTMLArea.cloneObject(node); }
		else                         { newObj[n] = node; }
	}

	return newObj;
};

HTMLArea.checkSupportedBrowser = function() {
	if (HTMLArea.is_gecko) {
		if (navigator.productSub < 20030210) {
 			return false;
		}
	}
	return HTMLArea.is_gecko || HTMLArea.is_ie;
};

// selection & ranges

// Returns the current selection object
HTMLArea.prototype._getSelection = function() {
	if (this._iframe.contentWindow.getSelection) {
		return this._iframe.contentWindow.getSelection();
	} else if (this._doc.getSelection) {
		return this._doc.getSelection();
	} else if (this._doc.selection) {
		return this._doc.selection;
	}
};

// Returns a range for the current selection
HTMLArea.prototype._createRange = function(sel) {
	if (HTMLArea.is_ie) {
		return sel.createRange();
	} else {
		if (typeof sel != "undefined") {
			try { return sel.getRangeAt(0); } 
			catch(e) { return this._doc.createRange(); }
		} else {
			return this._doc.createRange();
		}
	}
};

// event handling
HTMLArea._addEvent = function(el, evname, func) {
	if (HTMLArea.is_ie) {
		el.attachEvent("on" + evname, func);
	} else {
		el.addEventListener(evname, func, true);
	}
};

HTMLArea._addEvents = function(el, evs, func) {
	for (var i = evs.length; --i >= 0;) {
		HTMLArea._addEvent(el, evs[i], func);
	}
};

HTMLArea._removeEvent = function(el, evname, func) {
	if (HTMLArea.is_ie) {
		el.detachEvent("on" + evname, func);
	} else {
		try { el.removeEventListener(evname, func, true); } catch(e) { };
	}
};

HTMLArea._removeEvents = function(el, evs, func) {
	for (var i = evs.length; --i >= 0;) {
		HTMLArea._removeEvent(el, evs[i], func);
	}
};

HTMLArea._stopEvent = function(ev) {
	if (HTMLArea.is_ie) {
		ev.cancelBubble = true;
		ev.returnValue = false;
	} else {
		ev.preventDefault();
		ev.stopPropagation();
	}
};

HTMLArea._removeClass = function(el, className) {
	if (!(el && el.className)) {
		return;
	}
	var cls = el.className.split(" ");
	var ar = new Array();
	for (var i = cls.length; i > 0;) {
		if (cls[--i] != className) {
			ar[ar.length] = cls[i];
		}
	}
	el.className = ar.join(" ");
};

HTMLArea._addClass = function(el, className) {
	// remove the class first, if already there
	HTMLArea._removeClass(el, className);
	el.className += " " + className;
};

HTMLArea._hasClass = function(el, className) {
	if (!(el && el.className)) {
		return false;
	}
	var cls = el.className.split(" ");
	for (var i = cls.length; i > 0;) {
		if (cls[--i] == className) {
			return true;
		}
	}
	return false;
};

HTMLArea._blockTags = " body form textarea fieldset ul ol dl li div p h1 h2 h3 h4 h5 h6 quote pre table thead tbody tfoot tr td iframe address object ";
HTMLArea.isBlockElement = function(el) {
	return el && el.nodeType == 1 && (HTMLArea._blockTags.indexOf(" " + el.tagName.toLowerCase() + " ") != -1);
};

HTMLArea._closingTags = " head title script style div p span tr td table em i strong b code cite blockquote q dfn abbr acronym font center a ul ol li object tt";
HTMLArea.needsClosingTag = function(el) {
	return el && el.nodeType == 1 && (HTMLArea._closingTags.indexOf(" " + el.tagName.toLowerCase() + " ") != -1);
};

// Performs HTML encoding of some given string
HTMLArea.htmlEncode = function(value) {
  return value.replace(/&/ig,'&amp;').replace(/\"/ig,'&quot;').replace(/</ig,'&lt;').replace(/>/ig,'&gt;');
}

// Retrieves the HTML code from the given node.	 This is a replacement for getting innerHTML, using standard DOM calls.
// Wrapper catch a Mozilla-Exception with non well-formed html source code.
HTMLArea.getHTML = function(root, outputRoot, editor){
    try{ return HTMLArea.getHTMLWrapper(root,outputRoot,editor); }
    catch(e){
        alert('Your Document is not well formed. Check JavaScript console for details.');
        return editor._iframe.contentWindow.document.body.innerHTML;
    }
}

HTMLArea.getHTMLWrapper = function(root, outputRoot, editor) {
	var html = "";
	switch (root.nodeType) {
	    case 1: // ELEMENT_NODE
	    case 11: // DOCUMENT_FRAGMENT_NODE
		var closed, i;
		var root_tag = (root.nodeType == 1) ? root.tagName.toLowerCase() : '';
		if (root_tag == 'br' && !root.nextSibling && !root.previousSibling ) break;
		if (outputRoot) outputRoot = !(editor.config.htmlRemoveTags && editor.config.htmlRemoveTags.test(root_tag));
		if (HTMLArea.is_ie && root_tag == "head") {
			if (outputRoot) html += "<head>";
			var save_multiline = RegExp.multiline;
			RegExp.multiline = true;
			var txt = root.innerHTML.replace(HTMLArea.RE_tagName, function(str, p1, p2) {
				return p1 + p2.toLowerCase();
			});
			RegExp.multiline = save_multiline;
			html += txt;
			if (outputRoot) html += "</head>";
			break;
		} else if (outputRoot) {
			closed = (!(root.hasChildNodes() || HTMLArea.needsClosingTag(root)));
			html = "<" + root.tagName.toLowerCase();
			var attrs = root.attributes;
			for (i = 0; i < attrs.length; ++i) {
				var a = attrs.item(i);
				if (!a.specified && a.nodeName.toLowerCase() != 'value' ) { continue; }
				var name = a.nodeName.toLowerCase();
				if (/_moz_editor_bogus_node/.test(name)) {
					html = "";
					break;
				}
				if (/_moz|contenteditable|_msh/.test(name)) {
					// avoid certain attributes
					continue;
				}
				var value;
				if (name != "style") {
					// IE5.5 reports wrong values. For this reason we extract the values directly from the root node.
					// Using Gecko the values of href and src are converted to absolute links unless we get them using nodeValue()
					if (typeof root[a.nodeName] != "undefined" && name != "href" && name != "src" && !/^on/.test(name)) {
						value = root[a.nodeName];
					} else {
						value = a.nodeValue;
							// Ampersands in URIs need to be escaped to get valid XHTML
						if (name == "href" || name == "src") {
							value = value.replace(/&/g, "&amp;");
							if (HTMLArea.is_ie) value = editor.stripBaseURL(value);
						}
					}
				} else { // IE fails to put style in attributes list.
					value = root.style.cssText;
				}
				if (/(_moz|^$)/.test(value)) { // Mozilla reports some special tags here; we don't need them.
					continue;
				}
					// Strip value="0" reported by IE on all li tags
				if(HTMLArea.is_ie && root.tagName.toLowerCase() == "li" && name == "value" && a.nodeValue == 0) continue;
// Begin change by Stanislas Rolland 2005-04-06
				html += " " + name + '="' + value + '"';
				//html += " " + name + '="' + HTMLArea.htmlEncode(value) + '"';
// End change by Stanislas Rolland 2005-04-06
			}
			if (html != "") {
				html += closed ? " />" : ">";
			}
		}
		for (i = root.firstChild; i; i = i.nextSibling) {
			html += HTMLArea.getHTMLWrapper(i, true, editor);
		}
		if (outputRoot && !closed) {
			html += "</" + root.tagName.toLowerCase() + ">";
		}
		break;
	    case 3: // TEXT_NODE
			// If a text node is alone in an element and all spaces, replace it with an non breaking one
			// This partially undoes the damage done by moz, which translates '&nbsp;'s into spaces in the data element
			// Add a non breaking space in the empty text node an delete any starting non breaking space in the text node
		if ( !root.previousSibling && !root.nextSibling && root.data.match(/^\s*$/i) ) html = '&nbsp;';
			else html = /^script|style$/i.test(root.parentNode.tagName) ? root.data : HTMLArea.htmlEncode(root.data.replace(/^&nbsp;(.*)/gi,"$1"));
		break;
	    case 4: // CDATA_SECTION_NODE
		html = "<![CDATA[" + root.data + "]]>";
		break;
	    case 8: // COMMENT_NODE
		html = "<!--" + root.data + "-->";
		break;
	}
	return html;
};

HTMLArea.getPrevNode = function(node) {
	if (!node)                return null;
	if (node.previousSibling) return node.previousSibling;
	if (node.parentNode)      return node.parentNode;
	return null;
};

HTMLArea.getNextNode = function(node) {
	if (!node)            return null;
	if (node.nextSibling) return node.nextSibling;
	if (node.parentNode)  return node.parentNode;
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
	if (typeof v != "number") {
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

	if (typeof v == "number") {
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

// modal dialogs for Mozilla (for IE we're using the showModalDialog() call).

// receives an URL to the popup dialog and a function that receives one value;
// this function will get called after the dialog is closed, with the return
// value of the dialog.
HTMLArea.prototype._popupDialog = function(url, action, init, width, height, _opener) {
	Dialog(this.popupURL(url), action, init, width, height, (_opener ? _opener : this._iframe.contentWindow ), this);
};

// paths

HTMLArea.prototype.imgURL = function(file, plugin) {
	if (typeof plugin == "undefined") {
		return _editor_skin  + this.config.imgURL + file;
	} else {
		return _editor_skin + this.config.imgURL + plugin + "/" + file;
	}
};

HTMLArea.prototype.popupURL = function(file) {
	var url = "";
	if (file.match(/^plugin:\/\/(.*?)\/(.*)/)) {
		var plugin = RegExp.$1;
		var popup = RegExp.$2;
		if (!/\.html$/.test(popup))
			popup += ".html";
		url = _editor_url + "plugins/" + plugin + "/popups/" + popup;
	} else {
		url = _typo3_host_url + _editor_url + this.config.popupURL + file;
	}
	return url;
};

/**
 * Internet Explorer returns an item having the _name_ equal to the given id, even if it's not having any id.
 * This way it can return a different form field even if it's not a textarea.  This works around the problem by
 * specifically looking to search only elements having a certain tag name.
 */
HTMLArea.getElementById = function(tag, id) {
	var el, i, objs = document.getElementsByTagName(tag);
	for (i = objs.length; --i >= 0 && (el = objs[i]);)
		if (el.id == id)
			return el;
	return null;
};

/*********************************************************************************
 *
 *  TYPO3-FUNCTIONS: HERE ARE FUNCTION FOR TYPO3
 *
 *********************************************************************************/

/** Set the size of textarea with the RTE. It's called, if we are in fullscreen-mode.
 */
function setRTEsizeByJS(divId, height, width) {
	if(HTMLArea.is_gecko) { height = height - 25; } else { height = height - 60; }
	if (height > 0) { document.getElementById(divId).style.height =  height + "px"; }
	if(HTMLArea.is_gecko) { 
		width = "99%";
	} else {
		width = "97%";
	}
	document.getElementById(divId).style.width = width;
};

/** Hide the Popup */
function edHidePopup() {
	Dialog._modal.close();
	if(typeof browserWin != "undefined") setTimeout(function() {browserWin.focus();},200);
};

// Load a HTMLarea Plugin, but do not load the language file because we are assigning the TYPO3 generated language array.
function typo3LoadOnlyPlugin(pluginName) {
	var dir = _editor_url + "plugins/" + pluginName;
	var plugin = pluginName.replace(/([a-z])([A-Z])([a-z])/g,
					function (str, l1, l2, l3) {
						return l1 + "-" + l2.toLowerCase() + l3;
					}).toLowerCase() + ".js";
	var plugin_file = dir + "/" + plugin;
	HTMLArea._scripts.push(plugin_file);
};

function updateToolbarRestore() {
	var editor = RTEarea[activEditerNumber]["editor"];
	editor.updateToolbar = saveUpdateToolbar;
	saveUpdateToolbar = null;
};

function updateToolbarRemove() {
	var editor = RTEarea[activEditerNumber]["editor"];
	if (editor.updateToolbar != updateToolbarRestore) {
		saveUpdateToolbar = editor.updateToolbar;
		editor.updateToolbar = updateToolbarRestore;
	}
};

/** IE-Browsers strip URLs to relative URLs. But for the backend wo need absolut URLs.
 *  This function overload the normal stripBaseURL-function (which generate relative URLs).
 */
HTMLArea.prototype.nonStripBaseURL = function(url) {
	return url;
};

/*
*  CreateLink: Typo3-RTE function, use this instead of the original.
*/
HTMLArea.prototype.renderPopup_link = function() {
	var editor = this;
	//Set activEditerNumber:
	activEditerNumber = editor._typo3EditerNumber;
	
	var backreturn;
	var addUrlParams = "?" + conf_RTEtsConfigParams;
	
	var sel = null;
	var text = null;
	sel = editor.getParentElement();
	if (sel == null || sel.tagName.toUpperCase() != "A") {
		var parent = getElementObject(sel, "A");
		if (parent != null && parent.tagName && parent.tagName.toUpperCase() == "A") {
			sel = parent;
		}
	}
	
	if (sel != null && sel.tagName && sel.tagName.toUpperCase() == "A") {
		addUrlParams = "?curUrl[href]=" + escape(sel.getAttribute("href"));
		if(sel.target) {
			addUrlParams += "&curUrl[target]=" + escape(sel.target);
		}
		if(sel.className) {
			addUrlParams += "&curUrl[class]=" + escape(sel.className);
		}
		addUrlParams += conf_RTEtsConfigParams;
	}
	else if (editor.getSelectedHTML && editor.getSelectedHTML()) {
		var text = editor.getSelectedHTML();
		if (text && text != null) {
			var offset = text.toUpperCase().indexOf("<A");
			if (offset!=-1)	{
				var ATagContent = text.substring(offset+2);
				offset = ATagContent.toUpperCase().indexOf(">");
				ATagContent = ATagContent.substring(0,offset);
				addUrlParams="?curUrl[all]="+escape(ATagContent)+conf_RTEtsConfigParams;
			}
		}
	}
	
	editor._popupDialog("../../t3_popup.php" + addUrlParams + "&popupname=link&srcpath="+encodeURI(rtePathLinkFile), null, backreturn, 550, 350);
	
	// don't update the toolbar and don't lose focus on the popup (for fix problems with Mozilla)
	updateToolbarRemove();
	
	return false;
};

/*
*  Insert Image: Typo3-RTE function, use this instead of the original.
*/
HTMLArea.prototype.renderPopup_image = function() {
	var editor = this;
	//Set activEditerNumber:
	activEditerNumber = editor._typo3EditerNumber;
	
	var backreturn;
	var addParams = "?"+conf_RTEtsConfigParams;
	var image = editor.getParentElement();
	if (image && !/^img$/i.test(image.tagName))
		image = null;
	
	_selectedImage = "";
	
	if (image && image.tagName.toUpperCase() == "IMG") {
		addParams="?act=image"+conf_RTEtsConfigParams;
		_selectedImage = image;
	}
	
	editor._popupDialog("../../t3_popup.php" + addParams + "&popupname=image&srcpath="+encodeURI(rtePathImageFile), null, backreturn, 550, 350);
	
	// don't update the toolbar and don't lose focus on the popup (for fix problems with Mozilla)
	updateToolbarRemove();
	
	return false;
};
 
/**
*   Insert the Image.  This function call from the typo3-image-popup.
*   The problem: In this function, we don't have the right editer-object.
*   So the renderPopup_link function set activEditerNumber and we have access with
*   the RTEarea-Array
*/

function renderPopup_insertImage(image) {
	var editor = RTEarea[activEditerNumber]["editor"];
	editor.focusEditor();

	editor.insertHTML(image);
	_selectedImage="";
	Dialog._modal.close();
	activEditerNumber = -1; // Unset
	editor.updateToolbar();
};

/** Add a link to the selection. This function call from the typo3-link-popup
*   The problem: In this function, we don't have the right editer-object.
*   So the renderPopup_link function set activEditerNumber and we have access with
*   the RTEarea-Array
*/
function renderPopup_addLink(theLink,cur_target,cur_class) {
	var editor = RTEarea[activEditerNumber]["editor"];
	var a, sel = null;
	editor.focusEditor();

	if(!HTMLArea.is_ie) {
		var text = null;
		sel = editor.getParentElement();
		if (sel == null || sel.tagName.toUpperCase() != "A") {
			var parent = getElementObject(sel, "A");
			if (parent != null && parent.tagName && parent.tagName.toUpperCase() == "A") {
				sel = parent;
			}
		}
		if (sel != null && sel.tagName && sel.tagName.toUpperCase() == "A") editor.selectNodeContents(sel);
	}

	editor._doc.execCommand("createlink", false, theLink);

	sel = editor._getSelection();
	var range = editor._createRange(sel);
	a = editor.getParentElement();
	if(a) {
/*
		if (!HTMLArea.is_ie) {
			a = range.startContainer;
			if (!/^a$/i.test(a.tagName)) {
				a = a.nextSibling;
				if (a == null) a = range.startContainer.parentNode;
			}
		}
*/
			// we may have created multiple links in as many blocks
		function setLinkAttributes(node) {
			if (/^a$/i.test(node.tagName)) {
				if((HTMLArea.is_gecko && range.intersectsNode(node)) || (HTMLArea.is_ie)) {
					node.target = cur_target.trim();
					node.className = cur_class.trim();
				}
			} else {
				for (var i = node.firstChild; i; i = i.nextSibling) {
					if(i.nodeType == 1 || i.nodeType == 11) setLinkAttributes(i);
				}
			}
		};
		setLinkAttributes(a);
	}
	
	Dialog._modal.close();
	activEditerNumber = -1; // Unset
};

/**
*   Unlink the selection:  This function call from the typo3-link-popup.
*   The problem: In this function, we don't have the right editer-object.
*   So the renderPopup_link function set activEditerNumber and we have access with
*   the RTEarea-Array
*/
function renderPopup_unLink() {
	var editor = RTEarea[activEditerNumber]["editor"];
	editor.focusEditor();

	if(!HTMLArea.is_ie) {
		var sel = null;
		var text = null;
		sel = editor.getParentElement();
		if (sel == null || sel.tagName.toUpperCase() != "A") {
			var parent = getElementObject(sel, "A");
			if (parent != null && parent.tagName && parent.tagName.toUpperCase() == "A") {
				sel = parent;
			}
		}
		if (sel != null && sel.tagName && sel.tagName.toUpperCase() == "A") editor.selectNodeContents(sel);
	}

	editor._doc.execCommand("unLink", false, "");

	Dialog._modal.close();
	activEditerNumber = -1; // Unset
};

/*
 * Extending the TYPO3 Lorem Ipsum extension
 */
function lorem_ipsum(element,text) {
	if(element.tagName.toLowerCase() == "textarea" && element.id && element.id.substr(0,7) == "RTEarea") {
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
function getElementObject(oEl,sTag) {
	while (oEl!=null && oEl.tagName!=sTag)	{
		oEl = oEl.parentElement;
	}
	return oEl;
};

var activEditerNumber; // The number of the activ editer: necessary for the image and link popups
var saveUpdateToolbar = null;
var _selectedImage;

/** Init each Editor, load the Editor, config the toolbar, setup the plugins, etc.
*/
function initEditor(editornumber) {
	var self = this;

	if(HTMLArea.checkSupportedBrowser()) {

		if(!HTMLArea.is_loaded) {
			setTimeout(function() { self.initEditor(editornumber); }, 150);
		} else {

			var config = new HTMLArea.Config();

				// Get the toolbar config
			config.toolbar = RTEarea[editornumber]["toolbar"];

				// create an editor for the textarea
			RTEarea[editornumber]["editor"] = new HTMLArea(RTEarea[editornumber]["id"], config);
			var editor = RTEarea[editornumber]["editor"];

				// Save the editornumber and in the Object
			editor._typo3EditerNumber = editornumber;

			for (var plugin in RTEarea[editornumber]["plugin"]) {
				if(RTEarea[editornumber]["plugin"][plugin]) {
					editor.registerPlugin(plugin);
				}
			}

			if(RTEarea[editornumber]["pageStyle"]) {
				editor.config.pageStyle = RTEarea[editornumber]["pageStyle"];
			}

			if(RTEarea[editornumber]["fontname"]) {
				editor.config.fontname = RTEarea[editornumber]["fontname"];
			}

			if(RTEarea[editornumber]["fontsize"]) {
				editor.config.fontsize = RTEarea[editornumber]["fontsize"];
			}

			if(RTEarea[editornumber]["colors"]) {
				editor.config.colors = RTEarea[editornumber]["colors"];
			}

			if(RTEarea[editornumber]["disableColorPicker"]) {
				editor.config.disableColorPicker = RTEarea[editornumber]["disableColorPicker"];
			}

			if(RTEarea[editornumber]["paragraphs"]) {
				editor.config.formatblock = RTEarea[editornumber]["paragraphs"];
			}

			editor.config.width = "auto";
			editor.config.height = "auto";
			editor.config.sizeIncludesToolbar = true;
			editor.config.fullPage = false;

			editor.config.useHTTPS = false;
			if(RTEarea[editornumber]["useHTTPS"]) {
				editor.config.useHTTPS = RTEarea[editornumber]["useHTTPS"];
			}

			editor.config.disableEnterParagraphs = false;
			if(RTEarea[editornumber]["disableEnterParagraphs"]) {
				editor.config.disableEnterParagraphs = RTEarea[editornumber]["disableEnterParagraphs"];
			}

			editor.config.useCSS = false;
			if(RTEarea[editornumber]["useCSS"]) {
				editor.config.useCSS = RTEarea[editornumber]["useCSS"];
			}

			editor.config.enableMozillaExtension = false;
			if(RTEarea[editornumber]["enableMozillaExtension"]) {
				editor.config.enableMozillaExtension = RTEarea[editornumber]["enableMozillaExtension"];
			}

			editor.config.statusBar = false;
			if(RTEarea[editornumber]["statusBar"]) {
				editor.config.statusBar = RTEarea[editornumber]["statusBar"];
			}

			editor.config.killWordOnPaste = false;
			editor.config.htmlareaPaste = false;
			if(RTEarea[editornumber]["enableWordClean"]) {
					editor.config.killWordOnPaste = true;
					editor.config.htmlareaPaste = true;
			}

			editor.onGenerate = function () {
				document.getElementById('pleasewait' + editornumber).style.display='none';
				document.getElementById('editorWrap' + editornumber).style.visibility='visible';
			};

			editor.generate();
			return false;
		} 
	} else {
		document.getElementById('pleasewait' + editornumber).style.display='none';
		document.getElementById('editorWrap' + editornumber).style.visibility='visible';
	}
};
