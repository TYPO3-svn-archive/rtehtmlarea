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

cfg.registerButton("FR-findreplace", i18n["Find and Replace"], 
                   editor.imgURL("ed_find.gif", "FindReplace"), false,
                   function(editor) { self.buttonPress(editor); });

// Begin change by Stanislas Rolland 2004-11-06
// Insert this plugin just in front of the SpellChecker if it exists
//var joincfg = cfg.toolbar[0].join("|"); 
//  if(/formatblock\|/.test(joincfg))
//    cfg.toolbar[0] = joincfg.replace(/formatblock\|(space\|)?/,
//                     "formatblock|space|FR-findreplace|separator|").split("|");
//  else if(/fontsize\|/.test(joincfg))
//    cfg.toolbar[0] = joincfg.replace(/fontsize\|(space\|)?/,
//                     "fontsize|space|FR-findreplace|separator|").split("|");
//  else if(/fontname\|/.test(joincfg))
//    cfg.toolbar[0] = joincfg.replace(/fontname\|(space\|)?/,
//                     "fontname|space|FR-findreplace|separator|").split("|");
//  else 
//    cfg.toolbar[0].splice(0, 0, "FR-findreplace", "separator");

	var toolbar = cfg.toolbar;
		// Try to insert in front of SpellChecker, else in front of about
	var a, i, j, found = false;
	for (i = 0; !found && i < toolbar.length; ++i) {
		a = toolbar[i];
		for (j = 0; j < a.length; ++j) {
			if (a[j] == "SC-spell-check" || a[j] == "about") {
				found = true;
				break;
			}
		}
	}
	if (found) {
		a.splice(j, 0, "FR-findreplace");
	} else {
			// If SpellChecker and about are not found, add at the end of the first line of the toolbar
		cfg.toolbar[0].push("FR-findreplace");
		cfg.toolbar[0].push("separator");
	}
// End change by Stanislas Rolland 2004-11-06
};

FindReplace.prototype.buttonPress = function(editor) { 
	FindReplace.editor = editor;
	var sel = editor.getSelectedHTML();
	if(/\w/.test(sel)) {
		sel = sel.replace(/<[^>]*>/g,"");
		sel = sel.replace(/&nbsp;/g,"");
	}
	var param = /\w/.test(sel) ? {fr_pattern: sel} : null;
	editor._popupDialog("plugin://FindReplace/find_replace", null, param, 345, 220);
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
