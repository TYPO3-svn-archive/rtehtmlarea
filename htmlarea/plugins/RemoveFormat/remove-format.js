// Remove Format Plugin for HTMLArea-3.0
// Sponsored by www.fructifor.com
// Implementation by Stanislas Rolland, http://www.fructifor.com/
// Reusing code from anonymous source and from
//
// (c) Stanislas Rolland, 2004.
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).

RemoveFormat.I18N = RemoveFormat_langArray;

function RemoveFormat(editor) {
	this.editor = editor;
	var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var self = this;
	var i18n = RemoveFormat.I18N;

	cfg.registerButton({
                id       : "removeformat",
                tooltip  : i18n["RemoveFormatTooltip"],
                image    : editor.imgURL("ed_clean.gif", "RemoveFormat"),
                textMode : false,
                action   : function(editor) {
                                self.buttonPress(editor);
                           }
            });

	 var a, i, j, found = false;
	 for (i = 0; !found && i < toolbar.length; ++i) {
		a = toolbar[i];
		for (j = 0; j < a.length; ++j) {
			if (a[j] == "bold") {
				found = true;
				break;
			}
		}
	 }

	 if (found)
	    a.splice(j, 0, "removeformat");
        else {
           toolbar[1].splice(0, 0, "separator");
     	 toolbar[1].splice(0, 0, "removeformat");
        }
};

RemoveFormat._pluginInfo = {
	name          : "RemoveFormat",
	version       : "1.0",
	developer     : "Stanislas Rolland",
	developer_url : "mailto:stanislas.rolland@fructifor.com",
	sponsor       : "Fructifor Inc.",
	sponsor_url   : "http://www.fructifor.com/",
	license       : "htmlArea"
};

RemoveFormat.prototype.buttonPress = function(editor){

	editor._popupDialog( "plugin://RemoveFormat/removeformat", function( param){

		editor.focusEditor();

		if (param) {

			if (param["cleaning_area"] == "all") {
				var html = editor._doc.body.innerHTML;
			} else {
				var html = editor.getSelectedHTML();
 			}

			if(html) {

				if (param["html_all"]== true) {
					html = "<p>" + html.replace(/<[\!]*?[^<>]*?>/g, "") + "</p>";

				}
 
				if (param["formatting"] == true) {
						// remove font, b, strong, i, em, u, strike, span and other tags
					reg1 = new RegExp("<\/?(abbr|acronym|b[^r]|big|cite|code|em|font|i|q|s|samp|small|span|strike|strong|sub|sup|u|var)[^>]*>", "gi"); 
					html = html.replace(reg1, ""); 
						// keep tags, strip attributes
					html = html.replace(/ style=\"[^>]*\"/gi, "");
					reg2 = new RegExp(" (class|align)=\[^\s|>]*", "gi"); 
					html = html.replace(reg2, "");
				}

				if (param["images"] == true) {
						// remove any IMG tag
					html = html.replace(/<\/?img[^>]*>/gi, ""); //remove img tags								
				}

				if (param["ms_formatting"] == true) {
						// make one line
					reg3 = new RegExp("(\r\n|\n|\r)", "g"); 
					html = html.replace(reg3, " ");
						//clean up tags
					reg4 = new RegExp("<(b[^r]|strong|i|em|p|li|ul) [^>]*>", "gi")
					html = html.replace(reg4, "<$1>");
						// keep tags, strip attributes
					html = html.replace(/ style=\"[^>]*\"/gi, "");
					reg5 = new RegExp(" (class|align)=\[^\s|>]*", "gi"); 
					html = html.replace(reg5, "");
						// mozilla doesn't like <em> tags
					html = html.replace(/<em>/gi, "<i>").
						replace(/<\/em>/gi, "</i>");
						// kill unwanted tags: span, div, ?xml:, st1:, [a-z]: 
					html = html.replace(/<\/?span[^>]*>/gi, "").
						replace(/<\/?div[^>]*>/gi, "").
						replace(/<\?xml:[^>]*>/gi, "").
						replace(/<\/?st1:[^>]*>/gi, "").
						replace(/<\/?[a-z]:[^>]*>/g, "");
						// remove comments
					html = html.replace(/<!--[^>]*>/gi, "");
						// remove double tags
					oldlen = html.length + 1;
					while(oldlen > html.length) {
						oldlen = html.length;
							// join us now and free the tags
						html = html.replace(/<([a-z][a-z]*)> *<\/\1>/gi, " ").
							replace(/<([a-z][a-z]*)> *<\/?([a-z][^>]*)> *<\/\1>/gi, "<$2>");
							// remove double tags
						html = html.replace(/<([a-z][a-z]*)><\1>/gi, "<$1>").
							replace(/<\/([a-z][a-z]*)><\/\1>/gi, "<\/$1>");
							// remove double spaces
						html = html.replace(/  */gi, " ");
					}
				}

				if (param["cleaning_area"] == "all") { 				 		
					editor._doc.body.innerHTML = html;
				} else { 
					editor.insertHTML(html);
				}
			}
		} else {
			return false;
		}
	}, null, 290, 255);
};