// Spell Checker Plugin for HTMLArea-3.0
// Sponsored by www.americanbible.org
// Implementation by Mihai Bazon, http://dynarch.com/mishoo/
//
// (c) dynarch.com 2003.
// (c) 2004-2005, Stanislas Rolland <stanislas.rolland@fructifor.com>
// Modified to use the standard dialog API
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).
//
// $Id$

SpellChecker.I18N = SpellChecker_langArray;

function SpellChecker(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var tt = SpellChecker.I18N;
	var bl = SpellChecker.btnList;
	var self = this;

		// Try to insert after the FindReplace
	var a, i, j, found = false;
	for (i = 0; !found && i < toolbar.length; ++i) {
		a = toolbar[i];
		for (j = 0; j < a.length; ++j) {
			if (a[j] == "FR-findreplace") {
				++j;
				found = true;
				break;
			}
		}
	}

	// register the toolbar buttons provided by this plugin
	var tool = [];
	for (var i = 0; i < bl.length; ++i) {
		var btn = bl[i];
		if (!btn) {
			tool.push("separator");
		} else {
			var id = "SC-" + btn[0];
			cfg.registerButton(id, tt[id], editor.imgURL(btn[0] + ".gif", "SpellChecker"), false,
					   function(editor, id) {
						   // dispatch button press event
						   self.buttonPress(editor, id);
					   }, btn[1]);
			tool.push(id);
		}
	}
	if (found) {
		for (var i = 0; i < tool.length; ++i) {
			a.splice(j+i, 0, tool[i]);
		}
	} else {
			// If FindReplace is not found, add at the end o the first line of the toolbar
		for (var i = 0; i < tool.length; ++i) {
			cfg.toolbar[0].push(tool[i]);
			cfg.toolbar[0].push("separator");
		}
	}
};

SpellChecker._pluginInfo = {
	name          : "SpellChecker",
	version       : "1.8",
	developer     : "Mihai Bazon",
	developer_url : "http://dynarch.com/mishoo/",
	c_owner       : "Mihai Bazon",
	sponsor       : "American Bible Society",
	sponsor_url   : "http://www.americanbible.org",
	license       : "htmlArea"
};

SpellChecker.btnList = [
	["spell-check"]
	];

SpellChecker.prototype.buttonPress = function(editor, id) {
	var self = this;
	switch (id) {
	    case "SC-spell-check":
		SpellChecker.editor = editor;
		SpellChecker.init = true;
		SpellChecker.f_dictionary = _spellChecker_lang;
		SpellChecker.f_charset = _spellChecker_charset;
		SpellChecker.f_pspell_mode = _spellChecker_mode;
		var param = new Object();
		param.editor = editor;
		param.HTMLArea = HTMLArea;
    		editor._popupDialog("plugin://SpellChecker/spell-check-ui", null, param, 660, 500);
		break;
	}
};

// this needs to be global, it's accessed from spell-check-ui.html
SpellChecker.editor = null;
