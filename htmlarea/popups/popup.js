// htmlArea v3.0 - Copyright (c) 2002, 2003 interactivetools.com, inc.
// This copyright notice MUST stay intact for use (see license.txt).
//
// Portions (c) dynarch.com, 2003
//
// A free WYSIWYG editor replacement for <textarea> fields.
// For full source code and docs, visit http://www.interactivetools.com/
//
// Version 3.0 developed by Mihai Bazon.
//   http://dynarch.com/mishoo
//
// $Id$

function getAbsolutePos(el) {
	var r = { x: el.offsetLeft, y: el.offsetTop };
	if (el.offsetParent) {
		var tmp = getAbsolutePos(el.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

function comboSelectValue(c, val) {
	var ops = c.getElementsByTagName("option");
	for (var i = ops.length; --i >= 0;) {
		var op = ops[i];
		op.selected = (op.value == val);
	}
	c.value = val;
};

function __dlg_init(bottom,noResize) {
	var body = document.body;
	window.focus();
	window.dialogArguments = window.opener.Dialog._arguments;
	if (!document.all) {
			// resize to contents if allowed
		if(!noResize) {
			setTimeout( function() {
					// resize if allowed
				try {
					window.sizeToContent();
				} catch(e) { };
					// center on parent if allowed
				var x = window.opener.screenX + (window.opener.outerWidth - window.outerWidth) / 2;
				var y = window.opener.screenY + (window.opener.outerHeight - window.outerHeight) / 2;
				try {
					window.moveTo(x, y);
				} catch(e) { };
			}, 25);
		}
	} else {
			// resize if allowed
		var w = body.scrollWidth + 4;
		var h = body.scrollHeight + 4;
		window.resizeTo(w + 8, h + 25);
			// center on parent if allowed
		var W = body.offsetWidth;
		var H = body.offsetHeight;
		var x = (screen.availWidth - W) / 2;
		var y = (screen.availHeight - H) / 2;
		window.moveTo(x, y);
	}
		// capture escape events
	HTMLArea._addEvent(document, "keypress", __dlg_close_on_esc);
};

function __dlg_translate(i18n) {
	var types = ["input", "option", "select", "legend", "span", "td", "button", "div", "h1", "h2", "a"];
	for (var type = 0; type < types.length; ++type) {
		var spans = document.getElementsByTagName(types[type]);
		for (var i = spans.length; --i >= 0;) {
			var span = spans[i];
			if (span.firstChild && span.firstChild.data) {
				var txt = i18n[span.firstChild.data];
				if (txt) {
					span.firstChild.data = txt;
				}
			}
			if (span.title) {
				var txt = i18n[span.title];
				if (txt) {
					span.title = txt;
				}
			}
		}
	}
	var txt = i18n[document.title];
	if (txt)
		document.title = txt;
};

// closes the dialog and passes the return info upper.
function __dlg_close(val) {
	if(window.opener && window.opener.Dialog) window.opener.Dialog._return(val);
	window.close();
};

function __dlg_close_on_esc(ev) {
	if(!ev) var ev = window.event;
	if (ev.keyCode == 27) {
		if(window.opener && window.opener.Dialog) window.opener.Dialog._return(null);
		window.close();
		return false;
	}
	return true;
};
