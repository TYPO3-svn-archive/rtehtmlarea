/*---------------------------------------*\
 Insert Smiley Plugin for HTMLArea-3.0
 -----------------------------------------
 author: Ki Master George 
 e-mail: kimastergeorge@gmail.com
\*---------------------------------------*/

InsertSmiley.I18N = InsertSmiley_langArray;

var HTMLAreaeditor;
function InsertSmiley(editor) {
HTMLAreaeditor = editor;
var cfg = editor.config;
var self = this;
var inserted = "xx";
cfg.registerButton("insertsmiley", InsertSmiley.I18N["Insert Smiley"],  editor.imgURL("ed_smiley.gif", "InsertSmiley"), false, function(editor) { self.buttonPress(editor); });

  for(var i = 0; i < cfg.toolbar.length; i++) {
  var joincfg = cfg.toolbar[i].join("|"); 
    if(/inserthorizontalrule/.test(joincfg)) {
    cfg.toolbar[i] = joincfg.replace(/inserthorizontalrule/, "insertsmiley|inserthorizontalrule").split("|");
    inserted = "yy";
    }
  }
  if(inserted == "xx") {
  var line = cfg.toolbar[1] ? 1 : 0;
  cfg.toolbar[line].push("separator","insertsmiley");
  }
};

InsertSmiley.prototype.buttonPress = function(editor) { 
var self = this;
var sel = editor.getSelectedHTML().replace(/(<[^>]*>|&nbsp;|\n|\r)/g,""); 
var param = new Object();
param.editor = editor;
param.editor_url = _typo3_site_url + _editor_url;
if(param.editor_url == "../") {
	param.editor_url = document.URL;
	param.editor_url = param.editor_url.replace(/^(.*\/).*\/.*$/g, "$1");
}
  editor._popupDialog("plugin://InsertSmiley/insertsmiley", function(p) { self.setTag(p); }, param);
};

InsertSmiley.prototype.setTag = function(param) { 
HTMLAreaeditor.insertHTML("<img src=\"" + param.imgURL + "\" alt=\"Smiley\" />");
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
