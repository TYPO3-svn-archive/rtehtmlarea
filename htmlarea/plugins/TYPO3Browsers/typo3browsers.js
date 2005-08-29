// TYPO3 Image & Link Browsers Plugin for TYPO3 htmlArea RTE
// Copyright (c) 2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
// Sponsored by http://www.fructifor.com
// This plugin encapsulates an evolution of the initialization code originally produced by Philipp Borgmann
// This notice MUST stay intact for use (see license.txt).

TYPO3Browsers = function(editor,args) {
	this.editor = editor;
	var cfg = this.editor.config;
	cfg.btnList.InsertImage[1] = this.editor.imgURL("ed_image.gif", "TYPO3Browsers");
	cfg.btnList.CreateLink[1] = this.editor.imgURL("ed_link.gif", "TYPO3Browsers");
};

TYPO3Browsers.I18N = TYPO3Browsers_langArray;

TYPO3Browsers._pluginInfo = {
	name		: "TYPO3Browsers",
	version		: "1.1",
	developer	: "Stanislas Rolland",
	developer_url 	: "http://www.fructifor.com/",
	c_owner		: "Stanislas Rolland",
	sponsor		: "Fructifor Inc.",
	sponsor_url 	: "http://www.fructifor.com",
	license		: "htmlArea"
};

/*
 *  Insert Image TYPO3 RTE function.
 */
HTMLArea.prototype.renderPopup_image = function() {
	var editorNo = this._doc._editorNo,
		backreturn,
		addParams = "?"+conf_RTEtsConfigParams,
		image = this.getParentElement();

	this._selectedImage = null;
	if (image && image.tagName.toLowerCase() == "img") {
		addParams = "?act=image" + conf_RTEtsConfigParams;
		this._selectedImage = image;
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
	this._selectedImage = null;
	Dialog._modal.close();
	this.updateToolbar();
};

/*
 *  CreateLink: Typo3-RTE function, use this instead of the original.
 */
HTMLArea.prototype.renderPopup_link = function() {
	var editorNo = this._doc._editorNo,
		backreturn,
		addUrlParams = "?" + conf_RTEtsConfigParams,
		sel = this.getParentElement();

	var el = HTMLArea.getElementObject(sel,"a");
	if (el != null && el.tagName && el.tagName.toLowerCase() == "a") sel = el;
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
 * Add a link to the selection.
 * This function is called from the TYPO3 link popup.
 */
HTMLArea.prototype.renderPopup_addLink = function(theLink,cur_target,cur_class,cur_title) {
	var a, sel = null;
	this.focusEditor();

	if(!HTMLArea.is_ie) {
		sel = this.getParentElement();
		var el = HTMLArea.getElementObject(sel,"a");
		if (el != null && el.tagName && el.tagName.toLowerCase() == "a") sel = el;
		if (sel != null && sel.tagName && sel.tagName.toLowerCase() == "a") this.selectNode(sel);
	}

	this._doc.execCommand("CreateLink", false, theLink);

	sel = this._getSelection();
	var range = this._createRange(sel);
	a = this.getParentElement();
	var el = HTMLArea.getElementObject(a,"a");
	if (el != null && el.tagName && el.tagName.toLowerCase() == "a") a = el;
	if (a) {
			// we may have created multiple links in as many blocks
		function setLinkAttributes(node) {
			if (node.tagName && node.tagName.toLowerCase() == "a") {
				if ((HTMLArea.is_gecko && range.intersectsNode(node)) || (HTMLArea.is_ie)) {
					if (cur_target.trim()) node.target = cur_target.trim();
						else node.removeAttribute("target");
					if (cur_class.trim()) {
						node.className = cur_class.trim();
					} else { 
						if (HTMLArea.is_gecko) node.removeAttribute('class');
							else node.removeAttribute('className');
					}
					if (cur_title.trim()) { node.title = cur_title.trim(); }
						else {
							node.removeAttribute("title");
							node.removeAttribute("rtekeep");
						}
				}
			} else {
				for (var i = node.firstChild;i;i = i.nextSibling) {
					if (i.nodeType == 1 || i.nodeType == 11) setLinkAttributes(i);
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
		var sel = this.getParentElement();
		var el = HTMLArea.getElementObject(sel,"a");
		if (el != null && el.tagName && el.tagName.toLowerCase() == "a") sel = el;
		if (sel != null && sel.tagName && sel.tagName.toLowerCase() == "a") this.selectNode(sel);
	}
	this._doc.execCommand("Unlink", false, "");
	Dialog._modal.close();
};

/*
 * IE-Browsers strip URL's to relative URL's. But for the TYPO3 backend we need absolute URL's.
 * This function overloads the normal stripBaseURL-function (which generate relative URLs).
 */
HTMLArea.prototype.nonStripBaseURL = function(url) {
	return url;
};

TYPO3Browsers.prototype.onGenerate = function() {
	var editor = this.editor;
	editor._insertImage = editor.renderPopup_image;
	editor._createLink = editor.renderPopup_link;
	editor.stripBaseURL = editor.nonStripBaseURL;
};
