// TYPO3 Image & Link Browsers Plugin for TYPO3 RTE HTMLArea-3.0 Copyright (c) 2004 Stanislas Rolland
// Implementation by Stanislas Rolland.  Sponsored by http://www.fructifor.com
// This plugin encapsulates de initialization code produced by Philipp Borgmann
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
// $Id: select-color.js,v 1.0 2004/10/31

TYPO3Browsers.I18N = TYPO3Browsers_langArray;

function TYPO3Browsers(editor, args) {
      this.editor = editor;     
      var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var self = this;
	var i18n = TYPO3Browsers.I18N;
};

TYPO3Browsers._pluginInfo = {
	name          : "TYPO3Browsers",
	version       : "1.0",
	developer     : "Stanislas Rolland",
	developer_url : "http://www.fructifor.com/",
	c_owner       : "Stanislas Rolland",
	sponsor       : "Fructifor Inc.",
	sponsor_url   : "http://www.fructifor.com",
	license       : "htmlArea"
};

TYPO3Browsers.prototype.onGenerate = function() {
	var editor = this.editor;
	editor._insertImage = editor.renderPopup_image;
	editor._createLink = editor.renderPopup_link;

	// IE-Browsers strip URLs to relative URLs. But for the backend need absolut URLs.
	// So set the function (that strip the URL) to a new non-strip URL
	editor.stripBaseURL = editor.nonStripBaseURL;

	var editornumber = editor._typo3EditerNumber;
	RTEarea[editornumber]["saveUpdateToolbar"] = editor.updateToolbar;
};
