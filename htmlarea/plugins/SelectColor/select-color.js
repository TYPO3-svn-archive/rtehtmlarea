// Color Select Plugin for TYPO3 RTE HTMLArea-3.0 Copyright (c) 2004 Stanislas Rolland
// Implementation by Stanislas Rolland.  Sponsored by http://www.fructifor.com
// Using some initial code from TYPO3 RTE color selector http://typo3.org
//
// htmlArea v3.0 - Copyright (c) 2002 interactivetools.com, inc.
// This notice MUST stay intact for use (see license.txt).
//
// A free WYSIWYG editor replacement for <textarea> fields.
// For full source code and docs, visit http://www.interactivetools.com/
//
// Version 3.0 developed by Mihai Bazon for InteractiveTools.
//   http://dynarch.com/mishoo
//
// $Id: select-color.js,v 1.1 2004/11/05

SelectColor.I18N = SelectColor_langArray;

// Object that encapsulates color selection
function SelectColor(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var tt = SelectColor.I18N;
	var bl = SelectColor.btnList;
	var self = this;

	// register the toolbar buttons provided by this plugin
	var toolbar = [];
	for (var i = 0; i < bl.length; ++i) {
		var btn = bl[i];
		if (!btn) {
			toolbar.push("separator");
		} else {
			var id = "CO-" + btn[0];
			cfg.registerButton(id, tt[id], editor.imgURL(id + ".gif", "SelectColor"), false,
					   function(editor, id) {
						   // dispatch button press event
						   self.buttonPress(editor, id);
					   }, btn[1]);
			toolbar.push(id);
		}
	}

	var a, i, j, found = false;
	for (i = 0; !found && i < toolbar.length; ++i) {
		a = cfg.toolbar[i];
		for (j = 0; j < a.length; ++j) {
			if (a[j] == "textindicator") {
				found = true;
				break;
			}
		}
	}
	if (found) {
			a.splice(j, 0, toolbar[0], toolbar[1], "space");
	} else {
		for (var i = 0; i < toolbar.length; ++i) {
			cfg.toolbar[0].push(toolbar[i]);
		}
	}
};

SelectColor._pluginInfo = {
	name          : "SelectColor",
	version       : "1.1",
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
	var i18n = SelectColor.I18N;
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

// this function requires the file PopupDiv/PopupWin to be loaded from browser
SelectColor.prototype.dialogSelectColor = function(button_id,element,field) {
	var editor = this.editor;
	var self = this;
	var i18n = SelectColor.I18N;

		// button_id "color" is not registered but used to interface with the Table Operations plugin (and any other)
	if( button_id != "color" ) {
		var dialog = new PopupWin(this.editor, i18n[button_id + "_title"],
			function(dialog, params) {
				var editor = dialog.editor;
				self.processStyle(params, "", "");
				editor.focusEditor();
				editor.updateToolbar();
				dialog.close();
			},

				// this function gets called when the dialog needs to be initialized
			function (dialog) {
				var editor = dialog.editor;
				var doc = editor._doc;
				dialog.content.style.width = "400px";
				dialog.content.innerHTML = self.renderPopupSelectColor(button_id, dialog);
				var colorTable = dialog.doc.getElementById("colorTable");
				colorTable.onclick = function(e) {
					var targ;
					if(!e) {
						var e = dialog.window.event;
					}
					if (e.target) {
						targ = e.target;
					} else if (e.srcElement) {
						targ = e.srcElement;
					}
					if (targ.nodeType == 3) { // defeat Safari bug
						targ = targ.parentNode;
					}
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
							backgroundColor = HTMLArea._makeColor(doc.queryCommandValue("forecolor"));
							break;
						case "CO-hilitecolor":
							backgroundColor = HTMLArea._makeColor(
							doc.queryCommandValue(HTMLArea.is_ie ? "backcolor" : "hilitecolor"));
							if (/transparent/i.test(backgroundColor)) {
								// Mozilla
								backgroundColor = HTMLArea._makeColor(doc.queryCommandValue("backcolor"));
							}
							break;
					}
				}} catch (e) {
					// alert(e + "\n\n" );
				}
				dialog.modal = true;
				dialog.showAtElement(dialog.editor._iframe, "c");
			}
		);
	} else {
		var dialog = new PopupWin(this.editor, i18n[button_id + "_title"], 
			function(dialog,params) {
				self.processStyle(params, element, field);
				dialog.close();
				//dialog.opener.focus();
			},

				// this function gets called when the dialog needs to be initialized
			function (dialog) {
				dialog.content.style.width = "400px";
				dialog.content.innerHTML = self.renderPopupSelectColor(button_id, dialog);
				var colorTable = dialog.doc.getElementById("colorTable");
				colorTable.onclick = function(e) {
					var targ;
					if(!e) {
						var e = dialog.window.event;
					}
					if (e.target) {
						targ = e.target;
					} else if (e.srcElement) {
						targ = e.srcElement;
					}
					if (targ.nodeType == 3) { // defeat Safari bug
						targ = targ.parentNode;
					}
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
				dialog.modal = true;
				dialog.showAtElement(dialog.editor._iframe, "c");
			}
		);
	}
};

// Applies the style found in "params" to the given element.
SelectColor.prototype.processStyle = function(params, element, field) {
	var editor = this.editor;
	for (var i in params) {
		var val = params[i];
		switch (i) {
		    	case "CO-forecolor":
				if(val) {
					editor._doc.execCommand("forecolor", false, val);
				} else {
					var parentElement = editor.getParentElement();
					parentElement.style.color = "";
				}
				break;
			case "CO-hilitecolor":
				if(val) {
					if( HTMLArea.is_ie) {
						editor._doc.execCommand("backcolor", false, val);
					} else {
						editor._doc.execCommand("hilitecolor", false, val);
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
SelectColor.prototype.renderPopupSelectColor = function(sID,dialog) {
	var editor = this.editor;
	var cfg = editor.config;
	var i18n = SelectColor.I18N;
	var cfgColors = cfg.colors;
	var colorDef;
	var szID = sID + "Current";
	var sz;
	var cPick = new Array("00","33","66","99","CC","FF");
	var iColors = cPick.length;
	var szColor = "";
	var szColorId = "";

	sz = '<table style="width:100%"><tr><td id="--HA-layout"><fieldset>';
	sz += '<input type="hidden" name="' + sID + '" id="' + sID + '" value="" />';
	sz += '<table style="width:100%"><tr><td valign="middle"><span class="buttonColor" \
				onMouseover="className += \' buttonColor-hilite\';" \
				onMouseout="className = \'buttonColor\';"> \
			<span class="chooser" id="' + szID + '"></span> \
			<span id="colorUnset" class="nocolor" title="' + i18n["no_color"] + '" \
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
