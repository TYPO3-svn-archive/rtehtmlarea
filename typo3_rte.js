var activEditerNumber; // The number of the activ editer: necessary for the image and link popups
var saveUpdateToolbar = null;

var _selectedImage;

/** Set the size of textarea with the RTE. It's called, if we are in fullscreen-mode.
 */
function setRTEsizeByJS(divId, height, width) {
	if (height > 0) {
		document.getElementById(divId).style.height =  (height - 50) + "px";
	}
	if (width > 0) {
		document.getElementById(divId).style.width =  (width - 30) + "px";
	}
}

/** Load a HTMLarea Plugin, but do not load the language file
  * because we are assigning the typo3 generated language array.
  */
function typo3LoadOnlyPlugin(pluginName) {
	var dir = _editor_url + "plugins/" + pluginName;
	var plugin = pluginName.replace(/([a-z])([A-Z])([a-z])/g,
					function (str, l1, l2, l3) {
						return l1 + "-" + l2.toLowerCase() + l3;
					}).toLowerCase() + ".js";
	var plugin_file = dir + "/" + plugin;
	HTMLArea._scripts.push(plugin_file);
}

/** Init each Editor, load the Editor, config the toolbar, setup the plugins, etc.
*/
function initEditor(editornumber) {
	var self = this;

	if(!HTMLArea.is_loaded) {
		setTimeout(function() { self.initEditor(editornumber); }, 150);
	} else {

		var config = new HTMLArea.Config();

			// Toolbar: need change -> typo3-Config
		config.toolbar = RTEarea[editornumber]["toolbar"];

			// create an editor for the textarea
		RTEarea[editornumber]["editor"] = new HTMLArea(RTEarea[editornumber]["id"], config);
		var editor = RTEarea[editornumber]["editor"];

			// Save the editornumber and in the Object
		editor._typo3EditerNumber = editornumber;

		for (var plugin in RTEarea[editornumber]["plugin"]) {
			if (RTEarea[editornumber]["plugin"][plugin]) {
				switch (plugin) {
					default:
						editor.registerPlugin(plugin);
						break;
				}
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
		editor.config.sizeIncludesToolbar = false;
		editor.config.fullPage = false;

		editor.config.useHTTPS = false;
		if(RTEarea[editornumber]["useHTTPS"]) {
			editor.config.useHTTPS = RTEarea[editornumber]["useHTTPS"];
		}

		editor.config.statusBar = true;
		if(HTMLArea.is_ie && editor.config.statusBar) {
			editor._customUndo = true;
		}

		editor.onGenerate = function () {

				// Set killWordOnPaste and intercept paste , dragdrop and drop events for wordClean
			if(RTEarea[editornumber]["enableWordClean"]) {
				editor.config.killWordOnPaste = true;
				editor.config.htmlareaPaste = true;
				HTMLArea._addEvents (HTMLArea.is_ie ? editor._doc.body : editor._doc, ["paste","dragdrop","drop"], 
					function (event) { 
						if (editor.config.killWordOnPaste) { 
							setTimeout(function() { 
								editor._wordClean(editor._doc.body);
							}, 250);
						}
					}
				);
			} else {
				editor.config.killWordOnPaste = false;
			}

			document.getElementById('pleasewait' + editornumber).style.display='none';
			document.getElementById('editorWrap' + editornumber).style.visibility='visible';
		};

		editor.generate();
		return false;
	}
};

/** Hit the Popup */
function edHidePopup() {
	Dialog._modal.close();
};


/*
*  CreateLink: Typo3-RTE function, use this instead the orignal.
*  This is a HTMLArea object function.
*  Open the Typo3 Link-Window
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
		var par = getElementObject(sel, "A");
		if (par != null && par.tagName && par.tagName.toUpperCase() == "A") {
			sel = par;
		}
	}
	
	if (sel != null && sel.tagName && sel.tagName.toUpperCase() == "A") {
		addUrlParams="?curUrl[href]="+escape(sel.getAttribute("href"))+"&curUrl[target]="+escape(sel.getAttribute("target"))+conf_RTEtsConfigParams;
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
	
	editor._popupDialog("../../t3_popup.php" + addUrlParams + "&popupname=link&srcpath="+encodeURI(rtePathLinkFile), null, backreturn);
	
	// don't update the toolbar and don't lose focus on the popup (for fix problems with Mozilla)
	updateToolbarRemove();
	
	return false;
}

/**
*  Insite Image: Typo3-RTE function, use this instead the orignal.
*  This is a HTMLArea object function.
*  Open the Typo3 Image-Window: The php-file is in the orignal rte-extension
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
	
	editor._popupDialog("../../t3_popup.php" + addParams + "&popupname=image&srcpath="+encodeURI(rtePathImageFile), null, backreturn);
	
	// don't update the toolbar and don't lose focus on the popup (for fix problems with Mozilla)
	updateToolbarRemove();
	
	return false;
}

/*
* Other functions
*/


function updateToolbarRestore() {
	var editor = RTEarea[activEditerNumber]["editor"];
	
	editor.updateToolbar = saveUpdateToolbar;
	saveUpdateToolbar = null;
}

function updateToolbarRemove() {
	var editor = RTEarea[activEditerNumber]["editor"];
	
	if (editor.updateToolbar != updateToolbarRestore) {
		saveUpdateToolbar = editor.updateToolbar;
		editor.updateToolbar = updateToolbarRestore;
	}
}


/** IE-Browsers strip URLs to relative URLs. But for the backend wo need absolut URLs.
 *  This function overload the normal stripBaseURL-function (which generate relative URLs).
 */
HTMLArea.prototype.nonStripBaseURL = function(url) {
	return url;
}

