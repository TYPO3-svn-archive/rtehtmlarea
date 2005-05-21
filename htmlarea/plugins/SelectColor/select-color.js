// Color Select Plugin for TYPO3 htmlArea RTE 
// Copyright (c) 2004-2005 Stanislas Rolland
// Sponsored by http://www.fructifor.com
// Using some initial code from TYPO3 RTE color selector http://typo3.org
//
// htmlArea v3.0 - Copyright (c) 2002 interactivetools.com, inc.
// This notice MUST stay intact for use (see license.txt).
//

SelectColor = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var bl = SelectColor.btnList;
	var self = this;

		// register the toolbar buttons provided by this plugin
	for (var i = 0; i < bl.length; ++i) {
		var btn = bl[i];
		var id = "CO-" + btn[0];
		cfg.registerButton(
			id, 
			SelectColor_langArray[id],
			editor.imgURL(id + ".gif", "SelectColor"),
			false,
			function(editor, id) { self.buttonPress(editor, id); },
		 	btn[1]
		);
	}
};

SelectColor.I18N = SelectColor_langArray;

SelectColor._pluginInfo = {
	name          : "SelectColor",
	version       : "1.2",
	developer     : "Stanislas Rolland",
	developer_url : "http://www.fructifor.com/",
	c_owner       : "Stanislas Rolland",
	sponsor       : "Fructifor Inc.",
	sponsor_url   : "http://www.fructifor.com",
	license       : "htmlArea"
};

// the list of buttons added by this plugin
SelectColor.btnList = [
	["forecolor", null],
	["hilitecolor", null]
	];

// This function gets called when some button from the SelectColor was pressed
SelectColor.prototype.buttonPress = function(editor, button_id) {
	this.editor = editor;
	switch (button_id) {
		case "CO-forecolor":
			this.dialogSelectColor(button_id,"","");
			break;
		case "CO-hilitecolor":
			this.dialogSelectColor(button_id,"","");
			break;
		default:
			alert("Button [" + button_id + "] not yet implemented");
	}
};

// this function requires the file PopupWin
SelectColor.prototype.dialogSelectColor = function(button_id,element,field,opener) {
	var editor = this.editor;
	var self = this;
	var windowWidth = 348;
	var windowHeight = 220;

		// button_id's  "color" and "tag" are not registered but used to interface with the Table Operations and QuickTag plugins	switch (button_id) {
	switch (button_id) {
	   case "CO-forecolor":
	   case "CO-hilitecolor":
		var dialog = new PopupWin(this.editor, SelectColor.I18N[button_id + "_title"],
			function(dialog, params) {
				var editor = dialog.editor;
				self.processStyle(dialog, params, "", "");
				dialog.releaseEvents();
				editor.focusEditor();
				editor.updateToolbar();
				dialog.close();
			},

				// this function gets called when the dialog needs to be initialized
			function (dialog) {
				var editor = dialog.editor;
				var doc = editor._doc;
				dialog.content.innerHTML = self.renderPopupSelectColor(button_id, dialog, SelectColor.I18N[button_id + "_title"]);
				var colorTable = dialog.doc.getElementById("colorTable");
				colorTable.onclick = function(e) {
					if(!e) { var e = dialog.dialogWindow.event; }
					var targ = (e.target) ? e.target : e.srcElement;
					if (targ.nodeType == 3) { targ = targ.parentNode; }
					dialog.doc.getElementById(button_id).value=targ.bgColor;
					dialog.callHandler();
					return false;
				};
				var colorUnset = dialog.doc.getElementById("colorUnset");
				colorUnset.onclick = function(e) {
					dialog.doc.getElementById(button_id).value="";
					dialog.callHandler();
					return false;
				};
				try {with (dialog.doc.getElementById(button_id+"Current").style) {
					switch (button_id) {
						case "CO-forecolor":
							backgroundColor = HTMLArea._makeColor(doc.queryCommandValue("ForeColor"));
							break;
						case "CO-hilitecolor":
							backgroundColor = HTMLArea._makeColor(
							doc.queryCommandValue(((HTMLArea.is_ie || HTMLArea.is_safari) ? "BackColor" : "HiliteColor")));
							if (/transparent/i.test(backgroundColor)) {
								// Mozilla
								backgroundColor = HTMLArea._makeColor(doc.queryCommandValue("BackColor"));
							}
							break;
					}
				}} catch (e) {
					// alert(e + "\n\n" );
				}
				dialog.showAtElement();
			},
		windowWidth, windowHeight, editor._iframe.contentWindow);
		break;
	   case "color":
		var dialog = new PopupWin(this.editor, SelectColor.I18N[button_id + "_title"], 
			function(dialog,params) {
				self.processStyle(dialog, params, element, field);
				dialog.releaseEvents();
				dialog.close();
			},

				// this function gets called when the dialog needs to be initialized
			function (dialog) {
				dialog.content.innerHTML = self.renderPopupSelectColor(button_id, dialog, SelectColor.I18N[button_id + "_title"]);
				var colorTable = dialog.doc.getElementById("colorTable");
				colorTable.onclick = function(e) {
					if(!e) { var e = dialog.dialogWindow.event; }
					var targ = (e.target) ? e.target : e.srcElement;
					if (targ.nodeType == 3) { targ = targ.parentNode; }
					dialog.doc.getElementById(button_id).value=targ.bgColor;
					dialog.callHandler();
					return false;
				};
				var colorUnset = dialog.doc.getElementById("colorUnset");
				colorUnset.onclick = function(e) {
					dialog.doc.getElementById(button_id).value="";
					dialog.callHandler();
					return false;
				};
				dialog.doc.getElementById(button_id+"Current").style.backgroundColor = field.value;
				dialog.showAtElement();
			},
		windowWidth, windowHeight, opener);
		break;
	   case "tag":
		var dialog = new PopupWin(this.editor, SelectColor.I18N["color_title"], 
			function(dialog,params) {
				dialog.releaseEvents();
				field._return(params["tag"]);
				dialog.close();
				field.dialog = null;
			},

				// this function gets called when the dialog needs to be initialized
			function (dialog) {
				self.dialog = dialog;
				dialog.content.innerHTML = self.renderPopupSelectColor(button_id, dialog, SelectColor.I18N["color_title"]);
				var colorTable = dialog.doc.getElementById("colorTable");
				colorTable.onclick = function(e) {
					if(!e) { var e = dialog.dialogWindow.event; }
					var targ = (e.target) ? e.target : e.srcElement;
					if (targ.nodeType == 3) { targ = targ.parentNode; }
					dialog.doc.getElementById(button_id).value=targ.bgColor;
					dialog.callHandler();
					return false;
				};
				var colorUnset = dialog.doc.getElementById("colorUnset");
				colorUnset.onclick = function(e) {
					dialog.doc.getElementById(button_id).value="";
					dialog.callHandler();
					return false;
				};
				dialog.doc.getElementById(button_id+"Current").style.backgroundColor = "";
				dialog.showAtElement();
			},
		windowWidth, windowHeight, opener);
	}
};

// Applies the style found in "params" to the given element.
SelectColor.prototype.processStyle = function(dialog, params, element, field) {
	var editor = this.editor;
	for (var i in params) {
		var val = params[i];
		switch (i) {
		    	case "CO-forecolor":
				if(val) {
					editor._doc.execCommand("ForeColor", false, val);
				} else {
					var parentElement = editor.getParentElement();
					parentElement.style.color = "";
				}
				break;
			case "CO-hilitecolor":
				if(val) {
					if(HTMLArea.is_ie || HTMLArea.is_safari) {
						editor._doc.execCommand("BackColor", false, val);
					} else {
						editor._doc.execCommand("HiliteColor", false, val);
					}
				} else {
					var parentElement = editor.getParentElement();
					parentElement.style.backgroundColor = "";
				}
				break;
			case "color":
				element.style.backgroundColor = val;
				field.value = val;
				break;
		}
	}
};

/**
 * Making color selector table
 */
SelectColor.prototype.renderPopupSelectColor = function(sID,dialog,title) {
	var editor = this.editor;
	var cfg = editor.config;
	var cfgColors = cfg.colors;
	var colorDef;
	var szID = sID + "Current";
	var sz;
	var cPick = new Array("00","33","66","99","CC","FF");
	var iColors = cPick.length;
	var szColor = "";
	var szColorId = "";

	sz = '<div class="title">' + title + '</div>';
	sz += '<table style="width:100%"><tr><td id="--HA-layout"><fieldset>';
	sz += '<input type="hidden" name="' + sID + '" id="' + sID + '" value="" />';
	sz += '<table style="width:100%;"><tr><td style="vertical-align: middle;"><span style="margin-left: 5px; height: 1em;" class="dialog buttonColor" \
				onMouseover="className += \' buttonColor-hilite\';" \
				onMouseout="className = \'buttonColor\';"> \
			<span id="' + szID + '" class="chooser"></span> \
			<span id="colorUnset" class="nocolor" title="' + SelectColor.I18N["no_color"] + '" \
				onMouseover="className += \' nocolor-hilite\';" \
				onMouseout="className = \'nocolor\';" \
			>&#x00d7;</span></span></td><td>';
	sz += '<table \
			onMouseout="document.getElementById(\'' + szID + '\').style.backgroundColor=\'\';" \
			onMouseover="if(' + HTMLArea.is_ie + '){ document.getElementById(\'' + szID + '\').style.backgroundColor=event.srcElement.bgColor; } else { document.getElementById(\'' + szID + '\').style.backgroundColor=event.target.bgColor; }" \
			class="colorTable" cellspacing="0" cellpadding="0" id="colorTable">';
		// Making colorPicker
	if (!cfg.disableColorPicker)	{
		for (var r=0;r<iColors;r++) {
			sz+='<tr>'
			for (var g=iColors-1;g>=0;g--)	{
				for (var b=iColors-1;b>=0;b--) {
					szColor = cPick[r]+cPick[g]+cPick[b];
					sz+='<td bgcolor="#'+szColor+'" title="#'+szColor+'">&nbsp;</td>';
				}
			}
			sz+='</tr>';
		}
	}

		// Making specific color selector:
	if (cfgColors)	{
		var iCfgColors = cfgColors.length;
		if(iCfgColors && !cfg.disableColorPicker) {
			sz += '<tr><td colspan="36"></td></tr>';
		}
		for( var theColor=0; theColor<iCfgColors; theColor++) {
			colorDef = cfgColors[theColor];
			szColor = colorDef[1];
			sz += '<tr>';
			sz += '<td style="width:36px;" colspan="6" bgcolor="'+szColor+'" title="'+szColor+'">&nbsp;</td>';
			sz += '<td colspan=2></td>';
			sz += '<td colspan=28><nobr>'+colorDef[0]+'</nobr></td>';
			sz += '</tr>';
		}
	}

	sz += '</table></td></tr></table>';
	sz += '</fieldset></td></tr><tr><td id="--HA-style"></td></tr></table>';
	return sz;
};
