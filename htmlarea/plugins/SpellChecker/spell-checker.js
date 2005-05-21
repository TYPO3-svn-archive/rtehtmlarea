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

SpellChecker = function(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var self = this;

	cfg.registerButton("SpellCheck", 
		SpellChecker_langArray["SC-spell-check"],
		editor.imgURL("spell-check.gif", "SpellChecker"),
		false,
		function(editor,id) { self.buttonPress(editor, id); }
	);
};

SpellChecker.I18N = SpellChecker_langArray;

SpellChecker._pluginInfo = {
	name 			: "SpellChecker",
	version 		: "1.8",
	developer 		: "Mihai Bazon & Stanislas Rolland",
	developer_url 	: "http://dynarch.com/mishoo/",
	c_owner 		: "Mihai Bazon & Stanislas Rolland",
	sponsor 		: "American Bible Society & Fructifor Inc.",
	sponsor_url 	: "http://www.americanbible.org",
	license 		: "htmlArea"
};

SpellChecker.prototype.buttonPress = function(editor, id) {
	var self = this;
	switch (id) {
	    case "SpellCheck":
		SpellChecker.editor = editor;
		SpellChecker.init = true;
		SpellChecker.f_dictionary = _spellChecker_lang;
		SpellChecker.f_charset = _spellChecker_charset;
		SpellChecker.f_pspell_mode = _spellChecker_mode;
		var param = new Object();
		param.editor = editor;
		param.HTMLArea = HTMLArea;
    		editor._popupDialog("plugin://SpellChecker/spell-check-ui",null,param,670,500);
		break;
	}
};

// this needs to be global, it's accessed from spell-check-ui.html
SpellChecker.editor = null;
