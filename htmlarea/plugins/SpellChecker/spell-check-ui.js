// Spell Checker Plugin for HTMLArea-3.0
// Sponsored by www.americanbible.org
// Implementation by Mihai Bazon, http://dynarch.com/mishoo/
// (c) dynarch.com 2003.
// (c) 2005, Stanislas Rolland <stanislas.rolland@fructifor.ca>
// Modified to use the standard dialog API
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).
//

// internationalization file was already loaded in parent ;-)
var SpellChecker = window.opener.SpellChecker;
var i18n = SpellChecker.I18N;

// initial_dictonary, charset and pspell_mode added by Stanislas Rolland 2004-09-16
var initial_dictionary = SpellChecker.f_dictionary;
var pspell_charset = SpellChecker.f_charset;
var pspell_mode = SpellChecker.f_pspell_mode;

var editor = SpellChecker.editor;
var frame = null;
var currentElement = null;
var wrongWords = null;
var modified = false;
var allWords = {};
var fixedWords = [];
var suggested_words = {};

var to_p_dict = []; // List of words to add to personal dictionary
var to_r_list = []; // List of words to add to replacement list

function makeCleanDoc(leaveFixed) {
	// document.getElementById("status").innerHTML = 'Please wait: rendering valid HTML';
	var words = wrongWords.concat(fixedWords);
	for (var i = words.length; --i >= 0;) {
		var el = words[i];
		if (!(leaveFixed && /HA-spellcheck-fixed/.test(el.className))) {
			el.parentNode.insertBefore(el.firstChild, el);
			el.parentNode.removeChild(el);
		} else
			el.className = "HA-spellcheck-fixed";
	}
	return window.opener.HTMLArea.getHTML(frame.contentWindow.document.body, false, editor);
};

function recheckClicked() {
	document.getElementById("status").innerHTML = i18n["Please wait: changing dictionary to"] + ': "' + document.getElementById("f_dictionary").value + '".';
	var field = document.getElementById("f_content");
	field.value = makeCleanDoc(true);
	field.form.submit();
};

function saveClicked() {
	if (modified) {
		editor.setHTML(makeCleanDoc(false));
	}
	if ((to_p_dict.length || to_r_list.length) && SpellChecker.enablePersonalDicts) {
		var data = {};
		for (var i = 0;i < to_p_dict.length;i++) {
			data['to_p_dict[' + i + ']'] = to_p_dict[i];
		}
		for (var i = 0;i < to_r_list.length;i++) {
			data['to_r_list[' + i + '][0]'] = to_r_list[i][0];
			data['to_r_list[' + i + '][1]'] = to_r_list[i][1];
		}
		data['cmd'] = 'learn';
		data['enablePersonalDicts'] = SpellChecker.enablePersonalDicts;
		data['userUid'] = SpellChecker.userUid;
		data['dictionary'] = SpellChecker.f_dictionary;
		data['pspell_charset'] = SpellChecker.f_charset;
		data['pspell_mode'] = SpellChecker.f_pspell_mode;
		window.opener.HTMLArea._postback('plugins/SpellChecker/spell-check-logic.php', data);
	}
	window.close();
	return false;
};

function cancelClicked() {
	var ok = true;
	if (modified) {
		ok = confirm(i18n["QUIT_CONFIRMATION"]);
	}
	if (ok) {
		window.close();
	}
	return false;
};

function replaceWord(el) {
	var replacement = document.getElementById("v_replacement").value;
	var this_word_modified = (el.innerHTML != replacement);
	if (this_word_modified)
		modified = true;
	if (el) {
		el.className = el.className.replace(/\s*HA-spellcheck-(hover|fixed)\s*/g, " ");
	}
	el.className += " HA-spellcheck-fixed";
	el.__msh_fixed = true;
	if (!this_word_modified) {
		return false;
	}
	to_r_list.push([el.innerHTML, replacement]);
	el.innerHTML = replacement;
};

function replaceClicked() {
	replaceWord(currentElement);
	var start = currentElement.__msh_id;
	var index = start;
	do { 
		++index;
		if (index == wrongWords.length) index = 0;
	}while((index != start) && wrongWords[index].__msh_fixed);
	if (index == start) {
		index = 0;
		alert(i18n["Finished list of mispelled words"]);
	}
	wrongWords[index].__msh_wordClicked(true);
	return false;
};

function revertClicked() {
	document.getElementById("v_replacement").value = currentElement.__msh_origWord;
	replaceWord(currentElement);
	currentElement.className = "HA-spellcheck-error HA-spellcheck-current";
	return false;
};

function replaceAllClicked() {
	var replacement = document.getElementById("v_replacement").value;
	var ok = true;
	var spans = allWords[currentElement.__msh_origWord];
	if (spans.length == 0) {
		alert("An impossible condition just happened.  Call FBI.  ;-)");
	} else if (spans.length == 1) {
		replaceClicked();
		return false;
	}
	/*
	var message = "The word \"" + currentElement.__msh_origWord + "\" occurs " + spans.length + " times.\n";
	if (replacement == currentElement.__msh_origWord) {
		ok = confirm(message + "Ignore all occurrences?");
	} else {
		ok = confirm(message + "Replace all occurrences with \"" + replacement + "\"?");
	}
	*/
	if (ok) {
		for (var i = 0; i < spans.length; ++i) {
			if (spans[i] != currentElement) {
				replaceWord(spans[i]);
			}
		}
		// replace current element the last, so that we jump to the next word ;-)
		replaceClicked();
	}
	return false;
};

function ignoreClicked() {
	document.getElementById("v_replacement").value = currentElement.__msh_origWord;
	replaceClicked();
	return false;
};

function ignoreAllClicked() {
	document.getElementById("v_replacement").value = currentElement.__msh_origWord;
	replaceAllClicked();
	return false;
};

function learnClicked() {
	to_p_dict.push(currentElement.__msh_origWord);
	return ignoreAllClicked();
};

function initDocument() {
	__dlg_translate(i18n);
	__dlg_init();
	var param = window.dialogArguments;
	editor = param['editor'];
	HTMLArea = param['HTMLArea'];
	modified = false;
	document.title = i18n["Spell Checker"];
	frame = document.getElementById("i_framecontent");
	var field = document.getElementById("f_content");
	field.value = HTMLArea.getHTML(editor._doc.body, false, editor);
	document.getElementById("f_init").value = "0";
// initial_dictonary, pspell_charset and pspell_mode added and order changed by Stanislas Rolland 2004-09-16
	document.getElementById("f_dictionary").value = initial_dictionary;
	document.getElementById("f_charset").value = pspell_charset;
	document.getElementById("f_pspell_mode").value = pspell_mode;
	document.getElementById("f_user_uid").value = SpellChecker.userUid;
	document.getElementById("f_personal_dicts").value = SpellChecker.enablePersonalDicts;
	field.form.submit();

		// assign some global event handlers
	var select = document.getElementById("v_suggestions");
	select.onchange = function() {
		document.getElementById("v_replacement").value = this.value;
	};
	HTMLArea._addEvent(select, "dblclick", replaceClicked);

	document.getElementById("b_replace").onclick = replaceClicked;
	if (SpellChecker.enablePersonalDicts) document.getElementById("b_learn").onclick = learnClicked;
		else document.getElementById("b_learn").style.display = 'none';
	document.getElementById("b_replall").onclick = replaceAllClicked;
	document.getElementById("b_ignore").onclick = ignoreClicked;
	document.getElementById("b_ignall").onclick = ignoreAllClicked;
	document.getElementById("b_recheck").onclick = recheckClicked;
	document.getElementById("b_revert").onclick = revertClicked;
	document.getElementById("b_info").onclick = displayInfo;

	document.getElementById("b_ok").onclick = saveClicked;
	document.getElementById("b_cancel").onclick = cancelClicked;

	select = document.getElementById("v_dictionaries");
	select.onchange = function() {
		document.getElementById("f_dictionary").value = this.value;
	};
};

function getAbsolutePos(el) {
	var r = { x: el.offsetLeft, y: el.offsetTop };
	if (el.offsetParent) {
		var tmp = getAbsolutePos(el.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

function wordClicked(scroll) {
	var self = this;
	if (scroll) (function() {
		var pos = getAbsolutePos(self);
		var ws = { x: frame.offsetWidth - 4,
			   y: frame.offsetHeight - 4 };
		var wp = { x: frame.contentWindow.document.body.scrollLeft,
			   y: frame.contentWindow.document.body.scrollTop };
		pos.x -= Math.round(ws.x/2);
		if (pos.x < 0) pos.x = 0;
		pos.y -= Math.round(ws.y/2);
		if (pos.y < 0) pos.y = 0;
		frame.contentWindow.scrollTo(pos.x, pos.y);
	})();
	if (currentElement) {
		var a = allWords[currentElement.__msh_origWord];
		currentElement.className = currentElement.className.replace(/\s*HA-spellcheck-current\s*/g, " ");
		for (var i = 0; i < a.length; ++i) {
			var el = a[i];
			if (el != currentElement) {
				el.className = el.className.replace(/\s*HA-spellcheck-same\s*/g, " ");
			}
		}
	}
	currentElement = this;
	this.className += " HA-spellcheck-current";
	var a = allWords[currentElement.__msh_origWord];
	for (var i = 0; i < a.length; ++i) {
		var el = a[i];
		if (el != currentElement) {
			el.className += " HA-spellcheck-same";
		}
	}
	// document.getElementById("b_replall").disabled = (a.length <= 1);
	// document.getElementById("b_ignall").disabled = (a.length <= 1);

	// 2004-09-08 Stanislas Rolland: Change
	// 2004-09-8 Stanislas Rolland: Modified variables txt and text2 in following lines to make the status translatable
	//
	var txt;
	var txt2;
	if (a.length == 1) {
		txt = i18n["One occurrence"];
		txt2 = i18n["was found."];
	} else if (a.length == 2) {
		txt = i18n["Two occurrences"];
		txt2 = i18n["were found."];
	} else {
		txt = a.length + " " + i18n["occurrences"];
		txt2 = i18n["were found."];
	}
	var suggestions = suggested_words[this.__msh_origWord];
	if (suggestions) suggestions = suggestions.split(/,/);
		else suggestions = [];
	var select = document.getElementById("v_suggestions");
	document.getElementById("statusbar").innerHTML = txt + " " + i18n["of the word"] +
		' "<b>' + currentElement.__msh_origWord + '</b>"' + " " + txt2;
	for (var i = select.length; --i >= 0;) {
		select.remove(i);
	}
	for (var i = 0; i < suggestions.length; ++i) {
		var txt = suggestions[i];
		var option = document.createElement("option");
		option.value = txt;
		option.appendChild(document.createTextNode(txt));
		select.appendChild(option);
	}
	document.getElementById("v_currentWord").innerHTML = this.__msh_origWord;
	if (suggestions.length > 0) {
		select.selectedIndex = 0;
		select.onchange();
	} else {
		document.getElementById("v_replacement").value = this.innerHTML;
	}
	select.style.display = "none";
	select.style.display = "block";
	return false;
};

function wordMouseOver() {
	this.className += " HA-spellcheck-hover";
};

function wordMouseOut() {
	this.className = this.className.replace(/\s*HA-spellcheck-hover\s*/g, " ");
};

function displayInfo() {
	var info = frame.contentWindow.spellcheck_info;
	if (!info)
		alert(i18n["No information available"]);
	else {
		var txt = i18n["Document information"] + "\n" ;
		for (var i in info) {
			txt += "\n" + i18n[i] + " : " + info[i];
		}
		txt += " " + i18n["seconds"];
		alert(txt);
	}
	return false;
};

function finishedSpellChecking() {
	// initialization of global variables
	currentElement = null;
	wrongWords = null;
	allWords = {};
	fixedWords = [];
	suggested_words = frame.contentWindow.suggested_words;

	document.getElementById("status").innerHTML = i18n["HTMLArea Spell Checker"]; 
	var doc = frame.contentWindow.document;
	var spans = doc.getElementsByTagName("span");
	var sps = [];
	var id = 0;
	for (var i = 0; i < spans.length; ++i) {
		var el = spans[i];
		if (/HA-spellcheck-error/.test(el.className)) {
			sps.push(el);
			el.__msh_wordClicked = wordClicked;
			el.onclick = function(ev) {
				ev || (ev = window.event);
				ev && HTMLArea._stopEvent(ev);
				return this.__msh_wordClicked(false);
			};
			el.onmouseover = wordMouseOver;
			el.onmouseout = wordMouseOut;
			el.__msh_id = id++;
			var txt = (el.__msh_origWord = el.firstChild.data);
			el.__msh_fixed = false;
			if (typeof allWords[txt] == "undefined") {
				allWords[txt] = [el];
			} else {
				allWords[txt].push(el);
			}
		} else if (/HA-spellcheck-fixed/.test(el.className)) {
			fixedWords.push(el);
		}
	}
	wrongWords = sps;
	if (sps.length == 0) {
		if (!modified) {
			alert(i18n["NO_ERRORS_CLOSING"]);
			window.close();
		} else {
			alert(i18n["NO_ERRORS"]);
		}
		return false;
	}
	(currentElement = sps[0]).__msh_wordClicked(true);
	var as = doc.getElementsByTagName("a");
	for (var i = as.length; --i >= 0;) {
		var a = as[i];
		a.onclick = function() {
			if (confirm(i18n["CONFIRM_LINK_CLICK"] + ":\n" +
				    this.href + "\n" + i18n["I will open it in a new page."])) {
				window.open(this.href);
			}
			return false;
		};
	}
	var dicts = doc.getElementById("HA-spellcheck-dictionaries");
	if (dicts) {
		dicts.parentNode.removeChild(dicts);
		dicts = dicts.innerHTML.split(/,/);
		var select = document.getElementById("v_dictionaries");
		for (var i = select.length; --i >= 0;) {
			select.remove(i);
		}
		for (var i = 0; i < dicts.length; ++i) {
			var txt = dicts[i];
			var option = document.createElement("option");
			if (/^@(.*)$/.test(txt)) {
				txt = RegExp.$1;
				option.selected = true;
				document.getElementById("f_dictionary").value = txt;
			}
			option.value = txt;
			option.appendChild(document.createTextNode(txt));
			select.appendChild(option);
		}
	}
};
