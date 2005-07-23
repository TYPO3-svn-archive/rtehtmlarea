/*---------------------------------------*\
 Quick Tag Editor Plugin for HTMLArea-3.0
 -----------------------------------------
 author: Cau guanabara 
 e-mail: caugb@ibest.com.br
\*---------------------------------------*/

QuickTag = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var actionHandlerFunctRef = QuickTag.actionHandler(this);
	cfg.registerButton({
		id		: "InsertTag",
		tooltip	: QuickTag_langArray["Quick Tag Editor"],
		image		: editor.imgURL("ed_quicktag.gif", "QuickTag"),
		textMode	: false,
  		action	: actionHandlerFunctRef,
		context	: null,
		hide		: false,
		selection	: true
		});
};

QuickTag.I18N = QuickTag_langArray;

QuickTag.actionHandler = function(instance) {
	return (function(editor) {
		instance.buttonPress(editor);
	});
};

QuickTag.prototype.buttonPress = function(editor) {
	var sel = editor.getSelectedHTML().replace(/(<[^>]*>|&nbsp;|\n|\r)/g,""); 
	var param = new Object();
	param.editor = editor;

  	if(/\w/.test(sel)) {
		var setTagHandlerFunctRef = QuickTag.setTagHandler(this);
    		editor._popupDialog("plugin://QuickTag/quicktag", setTagHandlerFunctRef, param, 450, 108);
  	} else {
		alert(QuickTag.I18N['You have to select some text']);
	}
};

QuickTag.setTagHandler = function(instance) {
	return (function(param) {
		if(param && typeof(param.tagopen) != "undefined") {
			instance.editor.focusEditor();
			instance.editor.surroundHTML(param.tagopen,param.tagclose);
		}
	});
};

QuickTag._pluginInfo = {
	name          : "QuickTag",
	version       : "1.0",
	developer     : "Cau Guanabara",
	developer_url : "mailto:caugb@ibest.com.br",
	c_owner       : "Cau Guanabara",
	sponsor       : "Independent production",
	sponsor_url   : "http://www.netflash.com.br/gb/HA3-rc1/examples/quick-tag.html",
	license       : "htmlArea"
};
