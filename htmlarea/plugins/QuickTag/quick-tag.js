/*---------------------------------------*\
 Quick Tag Editor Plugin for HTMLArea-3.0
 -----------------------------------------
 author: Cau guanabara 
 e-mail: caugb@ibest.com.br
\*---------------------------------------*/

QuickTag.I18N = QuickTag_langArray;

function QuickTag(editor) {
this.editor = editor;
var cfg = editor.config;
var self = this;

cfg.registerButton("quickeditor", QuickTag.I18N["Quick Tag Editor"], 
                   editor.imgURL("ed_quicktag.gif", "QuickTag"), false,
                   function(editor) { self.buttonPress(editor); });

  for(i = 0; i < cfg.toolbar.length; i++) {
  var joincfg = cfg.toolbar[i].join("|"); 
    if(/htmlmode/.test(joincfg)) {
    cfg.toolbar[i] = joincfg.replace(/htmlmode/, "htmlmode|quickeditor").split("|");
    var htmok = true;
    }
  }
  if(!htmok) {
  var line = cfg.toolbar[1] ? 1 : 0;
  cfg.toolbar[line].push("separator","quickeditor");
  }
};

QuickTag.prototype.buttonPress = function(editor) { 
var self = this;
var sel = editor.getSelectedHTML().replace(/(<[^>]*>|&nbsp;|\n|\r)/g,""); 
var param = new Object();
param.editor = editor;

  if(/\w/.test(sel))
    editor._popupDialog("plugin://QuickTag/quicktag", function(p) { self.setTag(p); }, param);
  else
    alert(QuickTag.I18N['You have to select some text']);
};

QuickTag.prototype.setTag = function(param) { 
	this.editor.surroundHTML(param.tagopen,param.tagclose);
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
