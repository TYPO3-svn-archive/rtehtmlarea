// Acronym Plugin for TYPO3 htmlArea RTE
// Copyright (c) 2005 Stanislas Rolland
// Sponsored by http://www.fructifor.com
//
// htmlArea v3.0 - Copyright (c) 2002 interactivetools.com, inc.
// This notice MUST stay intact for use (see license.txt).

Acronym = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var self = this;
	cfg.registerButton("Acronym",
				Acronym_langArray["Insert/Modify Acronym"], 
				editor.imgURL("ed_acronym.gif", "Acronym"), 
				false,
				function(editor) {self.buttonPress(editor);}
	);
};
Acronym.I18N = Acronym_langArray;

Acronym._pluginInfo = {
	name			: "Acronym",
	version		: "1.0",
	developer		: "Stanislas Rolland",
	developer_url	: "http://www.fructifor.com/",
	c_owner		: "Stanislas Rolland",
	sponsor		: "Fructifor Inc.",
	sponsor_url		: "http://www.fructifor.com",
	license		: "htmlArea"
};

Acronym.prototype.buttonPress = function(editor) {
	var editorNo = editor._doc._editorNo;
	var backreturn;
	var addUrlParams = "?" + conf_RTEtsConfigParams;
	editor._popupDialog("../../t3_popup.php" + addUrlParams + "&editorNo=" + editorNo + "&popupname=acronym&srcpath="+encodeURI(rtePathAcronymFile),null,null,570,300);
	return false;
};
