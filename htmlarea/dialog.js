// htmlArea v3.0 - Copyright (c) 2003-2004 interactivetools.com, inc.
// This copyright notice MUST stay intact for use (see license.txt).
//
// Portions (c) dynarch.com, 2003-2004
//
// A free WYSIWYG editor replacement for <textarea> fields.
// For full source code and docs, visit http://www.interactivetools.com/
//
// Version 3.0 developed by Mihai Bazon.
//   http://dynarch.com/mishoo
//
// $Id$

// Though "Dialog" looks like an object, it isn't really an object.  Instead
// it's just namespace for protecting global symbols.

Dialog = function(url, action, init, width, height, opener, editor) {
	if (typeof(init) == "undefined" || !init) { var init = window; }
	Dialog._open(url, action, init, (width?width:100), (height?height:100), opener, editor);
};

// should be a function, the return handler of the currently opened dialog.
Dialog._return = null;

// constant, the currently opened dialog
Dialog._modal = null;
Dialog._dialog = null;

// the dialog will read it's args from this variable
Dialog._arguments = null;

Dialog._open = function(url, action, init, width, height, _opener, editor) {

	var dlg = window.open(url, 'hadialog', "toolbar=no,location=no,directories=no,menubar=no,width=" + width + ",height=" + height + ",scrollbars=no,resizable=yes,modal=yes,dependent=yes");
	if(Dialog._modal && !Dialog._modal.closed) {
		var obj = new Object();
		obj.dialogWindow = dlg;
		Dialog._dialog = obj;
	}
	Dialog._modal = dlg;
	Dialog._arguments = init;

	Dialog._parentEvent = function(ev) {
		if (Dialog._modal && !Dialog._modal.closed) {
			if(!ev) var ev = Dialog._modal.opener.event;
			HTMLArea._stopEvent(ev);
			Dialog._modal.focus();
		}
		return false;
	};

		// capture focus events
	function capwin(w) {
		if(HTMLArea.is_gecko) {
			w.addEventListener("focus", function(ev) { Dialog._parentEvent(ev); }, false);
		} else {
			HTMLArea._addEvent(w, "focus", function(ev) { Dialog._parentEvent(ev); });
		}
		for (var i = 0; i < w.frames.length; i++) { capwin(w.frames[i]); }
	};
	capwin(window);

		// make up a function to be called when the Dialog ends.
	Dialog._return = function (val) {
		if (val && action) {
			action(val);
		}

			// release the captured events
		function relwin(w) {
			HTMLArea._removeEvent(w, "focus", function(ev) { Dialog._parentEvent(ev); });
			try { for (var i = 0; i < w.frames.length; i++) { relwin(w.frames[i]); }; } catch(e) { };
		};
		relwin(window);

		HTMLArea._removeEvent(window, "unload", function() { if(Dialog._dialog && Dialog._dialog.dialogWindow) { Dialog._dialog.dialogWindow.close(); Dialog._dialog = null; };  dlg.close(); return false; });
		Dialog._dialog = null;
	};

		// capture unload events
	HTMLArea._addEvent(dlg, "unload", function() { if(typeof Dialog != "undefined") Dialog._return(null); return false; });
	HTMLArea._addEvent(window, "unload", function() { if(Dialog._dialog && Dialog._dialog.dialogWindow) { Dialog._dialog.dialogWindow.close(); Dialog._dialog = null; };  dlg.close(); return false; });
};
