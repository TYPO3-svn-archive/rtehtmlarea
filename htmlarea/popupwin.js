// (c) dynarch.com 2003-2004
// (c) 2004-2005, Stanislas Rolland <stanislas.rolland@fructifor.com>
// Substantially rewritten to render the popup window modal
// to correct various undesirable behaviours,
// to make it DOM only
// and to close when the parent window is unloaded
// Distributed under the same terms as HTMLArea itself.
// Version 1.10

function PopupWin(editor, _title, handler, initFunction, width, height, _opener) {
	this.editor = editor;
	this.handler = handler;
	if (typeof initFunction == "undefined") {
		initFunction = window;	// pass this window object by default
	}
	this._geckoOpenModal(editor, _title, handler, initFunction, width, height, _opener);
};

PopupWin.prototype._parentEvent = function(ev) {
	if (this.dialogWindow && !this.dialogWindow.closed) {
		var HTMLArea = this.HTMLArea;
		if(!ev) var ev = this.dialogWindow.opener.event;
		HTMLArea._stopEvent(ev);
		this.dialogWindow.focus();
	}
	return false;
};

PopupWin.prototype._geckoOpenModal = function(editor, _title, handler, initFunction, width, height, _opener) {
	var editor = this.editor;
	var dlg = editor._iframe.contentWindow.open("", "", "toolbar=no,menubar=no,personalbar=no,width=" + (width?width:100) + ",height=" + (height?height:100) + ",scrollbars=no,resizable=yes,modal=yes,dependent=yes");
	this.dialogWindow = dlg;
	this._opener = (_opener) ? _opener : this.dialogWindow.opener;
	this._opener.dialog = this;
	if(Dialog._modal && !Dialog._modal.closed) Dialog._dialog = this;
	var doc = this.dialogWindow.document;
	this.doc = doc;
	var self = this;

	var HTMLArea = new Object();
		// browser identification
	HTMLArea.agt = navigator.userAgent.toLowerCase();
	HTMLArea.is_ie	   = ((HTMLArea.agt.indexOf("msie") != -1) && (HTMLArea.agt.indexOf("opera") == -1));
	HTMLArea.is_opera  = (HTMLArea.agt.indexOf("opera") != -1);
	HTMLArea.is_mac	   = (HTMLArea.agt.indexOf("mac") != -1);
	HTMLArea.is_mac_ie = (HTMLArea.is_ie && HTMLArea.is_mac);
	HTMLArea.is_win_ie = (HTMLArea.is_ie && !HTMLArea.is_mac);
	HTMLArea.is_gecko  = (navigator.product == "Gecko");
		// event handling

	HTMLArea._addEvent = function(el, evname, func) {
		if (HTMLArea.is_ie) {
			el.attachEvent("on" + evname, func);
		} else {
			el.addEventListener(evname, func, true);
		}
	};
	HTMLArea._addEvents = function(el, evs, func) {
		for (var i = evs.length; --i >= 0;) {
			HTMLArea._addEvent(el, evs[i], func);
		}
	};
	HTMLArea._removeEvent = function(el, evname, func) {
		if (HTMLArea.is_ie) {
			el.detachEvent("on" + evname, func);
		} else {
			try{ el.removeEventListener(evname, func, true); } catch(e) { };
		}
	};
	HTMLArea._removeEvents = function(el, evs, func) {
		for (var i = evs.length; --i >= 0;) {
			HTMLArea._removeEvent(el, evs[i], func);
		}
	};
	HTMLArea._stopEvent = function(ev) {
		if (HTMLArea.is_ie) {
			ev.cancelBubble = true;
			ev.returnValue = false;
		} else {
			ev.preventDefault();
			ev.stopPropagation();
		}
	};
	this.HTMLArea = HTMLArea;

	if(HTMLArea.is_ie) {
		doc.open();
		var html = "<html><head></head><body></body></html>\n";
	//html += "<base href='" + base + "htmlarea.js' />\n";
		doc.write(html);
		doc.close();
	}
	var html = doc.documentElement;
	html.className = "popupwin";
	var head = doc.getElementsByTagName("head")[0];
	if(HTMLArea.is_gecko) var head = doc.createElement("head");
	var title = doc.createElement("title");
	head.appendChild(title);
	doc.title = _title;
	var link = doc.createElement("link");
	link.rel = "stylesheet";
	link.type ="text/css";
	link.href = editor.config.baseURL + "ext/rtehtmlarea/htmlarea/htmlarea.css";
	head.appendChild(link);
	if(HTMLArea.is_gecko) html.appendChild(head);
	var body = doc.body;
	if(HTMLArea.is_gecko) var body = doc.createElement("body");
	body.className = "popupwin dialog";
	body.id = "--HA-body";
	var content = doc.createElement("div");
	content.className = "content";
	self.content = content;
	body.appendChild(content);
	if(HTMLArea.is_gecko) html.appendChild(body);
	self.element = body;

	initFunction(self);

	this.captureEvents();
	self.dialogWindow.focus();
};

PopupWin.prototype._dlg_close_on_esc = function(ev) {
	if (ev.keyCode == 27) {
		this.releaseEvents();
		this.close();
		return false;
	}
	return true;
};

PopupWin.prototype.callHandler = function() {
	var tags = ["input", "textarea", "select"];
	var params = new Object();
	for (var ti = tags.length; --ti >= 0;) {
		var tag = tags[ti];
		var els = this.content.getElementsByTagName(tag);
		for (var j = 0; j < els.length; ++j) {
			var el = els[j];
			var val = el.value;
			if (el.tagName.toLowerCase() == "input") {
				if (el.type == "checkbox") {
					val = el.checked;
				}
			}
			params[el.name] = val;
		}
	}
	this.handler(this, params);
	return false;
};

PopupWin.prototype.captureEvents = function() {
		// capture some events on the opener window
	var editor = this.editor;
	var _opener = this._opener;
	var HTMLArea = this.HTMLArea;
	var self = this;
	function capwin(w) {
		HTMLArea._addEvent(w, "focus", function(ev) {self._parentEvent(ev); });
		for (var i = 0; i < w.frames.length; i++) { capwin(w.frames[i]); }
	};
		// suspend editor events
	if(_opener == editor._iframe.contentWindow) { editor.editorEventSuspend(); }

	capwin(window);

		// capture unload events
	HTMLArea._addEvent(_opener, "unload", function() { self.releaseEvents(); self.close(); return false; });
	HTMLArea._addEvent(self.dialogWindow, "unload", function() { self.releaseEvents(); self.close(); return false; });
		// capture escape events
	HTMLArea._addEvent(self.doc, "keypress", function(ev) { return self._dlg_close_on_esc(HTMLArea.is_ie ? self.dialogWindow.event : ev); });
};

PopupWin.prototype.releaseEvents = function() {
	var editor = this.editor;
	var _opener = this._opener;
	var HTMLArea = this.HTMLArea;
	if(_opener) {
		var self = this;
			// release the capturing of events
		function relwin(w) {
			HTMLArea._removeEvent(w, "focus", function(ev) {self._parentEvent(ev); });
			try { for (var i = 0; i < w.frames.length; i++) { relwin(w.frames[i]); }; } catch(e) { };
		};
		relwin(window);

			// resume editor events
		if(_opener == editor._iframe.contentWindow) { editor.editorEventResume(); }

		HTMLArea._removeEvent(_opener, "unload", function() { self.releaseEvents(); self.close(); return false; });	
	}
};

PopupWin.prototype.close = function() {
	if(this.dialogWindow && this.dialogWindow.dialog) {
		this.dialogWindow.dialog.releaseEvents();
		this.dialogWindow.dialog.close();
		this.dialogWindow.dialog = null;
	}
	if(this.dialogWindow) {
		this.dialogWindow.close();
		this.dialogWindow = null;
	}
	if(this._opener) this._opener.focus();
	if(this._opener.dialog) this._opener.dialog = null;
};

PopupWin.prototype.addButtons = function() {
	var self = this;
	var div = this.doc.createElement("div");
	this.content.appendChild(div);
	div.className = "buttons";
	for (var i = 0; i < arguments.length; ++i) {
		var btn = arguments[i];
		var button = this.doc.createElement("button");
		div.appendChild(button);
		button.innerHTML = HTMLArea.I18N.buttons[btn];
		switch (btn) {
		    case "ok":
			button.onclick = function() {
				try { self.callHandler(); } catch(e) { };
				self.releaseEvents();
				self.close();
				return false;
			};
			break;
		    case "cancel":
			button.onclick = function() {
				self.releaseEvents();
				self.close();
				return false;
			};
			break;
		}
	}
};

PopupWin.prototype.showAtElement = function() {
	var HTMLArea = this.HTMLArea;
	var self = this;
	var body = self.doc.body;

	if (HTMLArea.is_gecko) {
		setTimeout( function() {
				// resize if allowed
			try {
				self.dialogWindow.sizeToContent();
			} catch(e) { };
				// center on parent if allowed
			var x = self._opener.screenX + (self._opener.outerWidth - self.dialogWindow.outerWidth) / 2;
			var y = self._opener.screenY + (self._opener.outerHeight - self.dialogWindow.outerHeight) / 2;
			try {
				self.dialogWindow.moveTo(x, y);
			} catch(e) { };
		}, 25);
	} else {
			// resize if allowed
		var w = self.content.offsetWidth + 4;
		var h = self.content.offsetHeight + 4;
		self.dialogWindow.resizeTo(w + 8, h + 35);
		var ch = body.clientHeight;
		var cw = body.clientWidth;
		window.resizeBy(w - cw, h - ch);
			// center on parent if allowed
		var W = body.offsetWidth;
		var H = 2 * body.offsetHeight - ch;
		var x = (screen.availWidth - W) / 2;
		var y = (screen.availHeight - H) / 2;
		self.dialogWindow.moveTo(x, y);
	}
};
