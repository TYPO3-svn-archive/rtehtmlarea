/*---------------------------------------*\
 Quick Tag Editor Plugin for HTMLArea-3.0
 -----------------------------------------
 author: Cau guanabara 
 e-mail: caugb@ibest.com.br
\*---------------------------------------*/

QuickTag = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var self = this;
	cfg.registerButton({
		id		: "InsertTag",
		tooltip	: QuickTag_langArray["Quick Tag Editor"],
		image		: editor.imgURL("ed_quicktag.gif", "QuickTag"),
		textMode	: false,
  		action	: function(editor) { self.buttonPress(editor); },
		context	: null,
		hide		: false,
		selection	: true
		});
};

QuickTag.I18N = QuickTag_langArray;

QuickTag.prototype.buttonPress = function(editor) { 
	var self = this;
	var sel = editor.getSelectedHTML().replace(/(<[^>]*>|&nbsp;|\n|\r)/g,""); 
	var param = new Object();
	param.editor = editor;

  	if(/\w/.test(sel)) {
    		editor._popupDialog("plugin://QuickTag/quicktag", function(p) { self.setTag(p); }, param, 450, 108);
  	} else {
		alert(QuickTag.I18N['You have to select some text']);
	}
};

QuickTag.prototype.setTag = function(param) { 
	if(param && typeof param.tagopen != "undefined") {
		this.editor.focusEditor();
		this.editor.surroundHTML(param.tagopen,param.tagclose);
	}
};

QuickTag._pluginInfo = {
	name          : "QuickTag",
	version       : "1.0 - beta",
	developer     : "Cau Guanabara",
	developer_url : "mailto:caugb@ibest.com.br",
	c_owner       : "Cau Guanabara",
	sponsor       : "Independent production",
	sponsor_url   : "http://www.netflash.com.br/gb/HA3-rc1/examples/quick-tag.html",
	license       : "htmlArea"
};
