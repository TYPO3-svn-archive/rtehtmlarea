// TYPO3 Image & Link Browsers Plugin for TYPO3 htmlArea RTE HTMLArea
// Copyright (c) 2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
// Sponsored by http://www.fructifor.com
// This plugin encapsulates de initialization code produced by Philipp Borgmann
// This notice MUST stay intact for use (see license.txt).

TYPO3Browsers = function(editor,args) {
      this.editor = editor;     
      var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var self = this;
	this.editor.config.btnList.InsertImage[1] = this.editor.imgURL("ed_image.gif", "TYPO3Browsers");
	this.editor.config.btnList.CreateLink[1] = this.editor.imgURL("ed_link.gif", "TYPO3Browsers");
};

TYPO3Browsers.I18N = TYPO3Browsers_langArray;

TYPO3Browsers._pluginInfo = {
	name 			: "TYPO3Browsers",
	version 		: "1.0",
	developer 		: "Stanislas Rolland",
	developer_url 	: "http://www.fructifor.com/",
	c_owner 		: "Stanislas Rolland",
	sponsor 		: "Fructifor Inc.",
	sponsor_url 	: "http://www.fructifor.com",
	license 		: "htmlArea"
};

TYPO3Browsers.prototype.onGenerate = function() {
	var editor = this.editor;
	editor._insertImage = editor.renderPopup_image;
	editor._createLink = editor.renderPopup_link;

	// IE-Browsers strip URL's to relative URL's. But for the TYPO3 backend needs absolute URL's.
	// Therefore, we set the function (that strip the URL) to a new non-strip URL
	editor.stripBaseURL = editor.nonStripBaseURL;
};
