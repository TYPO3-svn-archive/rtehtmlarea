// Character Map plugin for HTMLArea
// Sponsored by http://www.systemconcept.de
// Implementation by Holger Hees based on HTMLArea XTD 1.5 (http://mosforge.net/projects/htmlarea3xtd/)
// Original Author - Bernhard Pfeifer novocaine@gmx.net 
//
// (c) systemconcept.de 2004
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).

CharacterMap = function(editor) {
	this.editor = editor;
	var cfg = this.editor.config;
	var self = this;
	cfg.registerButton({
		id 		: "InsertCharacter",
		tooltip 	: CharacterMap_langArray["CharacterMapTooltip"],
		image 	: editor.imgURL("ed_charmap.gif", "CharacterMap"),
		textMode 	: false,
		action 	: function(editor) { self.buttonPress(editor); }
	});
};

CharacterMap.I18N = CharacterMap_langArray;

CharacterMap._pluginInfo = {
	name 			: "CharacterMap",
	version 		: "1.0",
	developer 		: "Holger Hees & Bernhard Pfeifer",
	developer_url 	: "http://www.systemconcept.de/",
	c_owner 		: "Holger Hees & Bernhard Pfeifer",
	sponsor 		: "System Concept GmbH & Bernhard Pfeifer",
	sponsor_url 	: "http://www.systemconcept.de/",
	license 		: "htmlArea"
};

CharacterMap.prototype.buttonPress = function(editor) {
	var self = this;
	var param = new Object();
	param.editor = editor;
	editor._popupDialog( "plugin://CharacterMap/select_character", function(entity) { self.insertChar(entity); }, param, 485, 330);
};

CharacterMap.prototype.insertChar = function(entity) { 
	if (typeof entity != "undefined") {
		this.editor.focusEditor();
		this.editor.insertHTML(entity);
	}
};