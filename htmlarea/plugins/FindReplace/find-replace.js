/*---------------------------------------*\
 Find and Replace Plugin for HTMLArea-3.0
 -----------------------------------------
 author: Cau guanabara 
 e-mail: caugb@ibest.com.br
\*---------------------------------------*/

FindReplace.I18N = FindReplace_langArray;

function FindReplace(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var self = this;
	var i18n = FindReplace.I18N

	cfg.registerButton("findreplace",
				i18n["Find and Replace"], 
				editor.imgURL("ed_find.gif", "FindReplace"), 
				false,
				function(editor) { self.buttonPress(editor); }
	);
};

FindReplace.prototype.buttonPress = function(editor) { 
	FindReplace.editor = editor;
	var sel = editor.getSelectedHTML();
	if(/\w/.test(sel)) {
		sel = sel.replace(/<[^>]*>/g,"");
		sel = sel.replace(/&nbsp;/g,"");
	}
	var param = /\w/.test(sel) ? {fr_pattern: sel} : null;
	editor._popupDialog("plugin://FindReplace/find_replace", null, param, 365, 220);
};

FindReplace._pluginInfo = {
  name          : "FindReplace",
  version       : "1.0 - beta",
  developer     : "Cau Guanabara",
  developer_url : "mailto:caugb@ibest.com.br",
  c_owner       : "Cau Guanabara",
  sponsor       : "Independent production",
  sponsor_url   : "http://www.netflash.com.br/gb/HA3-rc1/examples/find-replace.html",
  license       : "htmlArea"
};
