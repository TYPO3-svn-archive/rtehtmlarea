// User Elements Plugin for TYPO3 htmlArea RTE
// Copyright (c) 2005 Stanislas Rolland
// Sponsored by http://www.fructifor.com
//
// htmlArea v3.0 - Copyright (c) 2002 interactivetools.com, inc.
// This notice MUST stay intact for use (see license.txt).

UserElements = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var self = this;
	cfg.registerButton("UserElements",
				UserElements_langArray["Insert custom element"], 
				editor.imgURL("ed_user.gif", "UserElements"), 
				false,
				function(editor) {self.buttonPress(editor);}
	);
};
UserElements.I18N = UserElements_langArray;

UserElements.prototype.buttonPress = function(editor) { 
	var sel = editor.getSelectedHTML();
	if(/\w/.test(sel)) {
		sel = sel.replace(/<[^>]*>/g,"");
		sel = sel.replace(/&nbsp;/g,"");
	}
	var param = /\w/.test(sel) ? {fr_pattern: sel} : null;
	editor._popupDialog("plugin://UserElements/user_elements",null,param,420,220);
};

UserElements._pluginInfo = {
	name			: "UserElements",
	version		: "1.0",
	developer		: "Stanislas Rolland",
	developer_url	: "http://www.fructifor.com/",
	c_owner		: "Stanislas Rolland",
	sponsor		: "Fructifor Inc.",
	sponsor_url		: "http://www.fructifor.com",
	license		: "htmlArea"
};

UserElements.prototype.buttonPress = function(editor) {
	var editorNo = editor._doc._editorNo;
	var backreturn;
	var addUrlParams = "?" + conf_RTEtsConfigParams;

	editor._popupDialog("../../t3_popup.php" + addUrlParams + "&editorNo=" + editorNo + "&popupname=user&srcpath="+encodeURI(rtePathUserFile),null,backreturn,550,350);
	
	// don't update the toolbar and don't lose focus on the popup (for fix problems with Mozilla)
	//updateToolbarRemove();
	
	return false;
};
