/*---------------------------------------*\
 Insert Smiley Plugin for HTMLArea-3.0
 -----------------------------------------
 author: Ki Master George 
 e-mail: kimastergeorge@gmail.com
\*---------------------------------------*/

var HTMLAreaeditor;

InsertSmiley = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var self = this;
	cfg.registerButton("InsertSmiley", InsertSmiley_langArray["Insert Smiley"],  editor.imgURL("ed_smiley.gif", "InsertSmiley"), false, function(editor) { self.buttonPress(editor); });
};

InsertSmiley.I18N = InsertSmiley_langArray;

InsertSmiley.prototype.buttonPress = function(editor) { 
	var self = this;
	var sel = editor.getSelectedHTML().replace(/(<[^>]*>|&nbsp;|\n|\r)/g,""); 
	var param = new Object();
	param.editor = editor;
	param.editor_url = _typo3_host_url + _editor_url;
	if(param.editor_url == "../") {
		param.editor_url = document.URL;
		param.editor_url = param.editor_url.replace(/^(.*\/).*\/.*$/g, "$1");
	}
  	editor._popupDialog("plugin://InsertSmiley/insertsmiley", function(p) { self.setTag(p); }, param, 250, 220);
};

InsertSmiley.prototype.setTag = function(param) {
	var editor = this.editor;
	if(param && typeof param.imgURL != "undefined") {
		editor.focusEditor();
		editor.insertHTML("<img src=\"" + param.imgURL + "\" alt=\"Smiley\" />");
	}
};

InsertSmiley._pluginInfo = {
	name          : "InsertSmiley",
	version       : "1.0",
	developer     : "Ki Master George",
	developer_url : "http://kimastergeorge.i4host.com/",
	c_owner       : "Ki Master George",
	sponsor       : "Ki Master George",
	sponsor_url   : "http://kimastergeorge.i4host.com/",
	license       : "htmlArea"
};
