// (c) dynarch.com 2003-2004
// Distributed under the same terms as HTMLArea itself.
// Version 1.10

function PopupWin(editor, title, handler, initFunction, width, height) {
	this.editor = editor;
	this.handler = handler;

// Begin change for by Stanislas Rolland 2004-11-01
	var activEditorNumber = editor._typo3EditerNumber;
//	var dlg = window.open("", "__ha_dialog",
//	var dlg = this.editor._iframe.contentWindow.open("", "__ha_dialog",
	var dlg = this.editor._iframe.contentWindow.open("", "",
		"toolbar=no,menubar=no,personalbar=no,width=" + (width?width:100) + ",height=" + (height?height:100) + ",scrollbars=no,resizable=yes,dependent=yes");
// End change by Stanislas Rolland 2004-11-01

	this.window = dlg;
	var doc = dlg.document;
	this.doc = doc;
	var self = this;

	var base = document.baseURI || document.URL;
	if (base && base.match(/(.*)\/([^\/]+)/)) {
		base = RegExp.$1 + "/";
	}
	if (typeof _editor_url != "undefined" && !/^\//.test(_editor_url) && !/http:\/\//.test(_editor_url)) {
		base += _editor_url;
	} else
		base = _editor_url;
	if (!/\/$/.test(base)) {
		// base does not end in slash, add it now
		base += '/';
	}
	this.baseURL = base;

	doc.open();
	var html = "<html><head><title>" + title + "</title>\n";
	// html += "<base href='" + base + "htmlarea.js' />\n";
	html += "<style type='text/css'>@import url(" + base + "htmlarea.css);</style></head>\n";
	html += "<body class='dialog popupwin' id='--HA-body'></body></html>";
	doc.write(html);
	doc.close();

	// sometimes I Hate Mozilla... ;-(
	function init2() {
		var body = doc.body;
		if (!body) {
			setTimeout(init2, 25);
			return false;
		}
		dlg.title = title;
		doc.documentElement.style.padding = "0px";
		doc.documentElement.style.margin = "0px";
		var content = doc.createElement("div");
		content.className = "content";
		self.content = content;
		body.appendChild(content);
		self.element = body;
		initFunction(self);
		dlg.focus();
	};
	init2();
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

PopupWin.prototype.close = function() {
	this.window.close();
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
				self.callHandler();
				self.close();
				return false;
			};
			break;
		    case "cancel":
			button.onclick = function() {
				self.close();
				return false;
			};
			break;
		}
	}
};

PopupWin.prototype.showAtElement = function() {
	var self = this;

	// Mozilla needs some time to realize what's goin' on..
	setTimeout(function() {
		var w = self.content.offsetWidth + 4;
		var h = self.content.offsetHeight + 4;

		// center...
		var el = self.content;
		var s = el.style;
		// s.width = el.offsetWidth + "px";
		// s.height = el.offsetHeight + "px";
		s.position = "absolute";
		s.left = (w - el.offsetWidth) / 2 + "px";
		s.top = (h - el.offsetHeight) / 2 + "px";
// Begin change for by Stanislas Rolland 2004-11-26
		var body = self.doc.body;
		if (!self.doc.all) {
			self.window.innerWidth = w+14;
			self.window.innerHeight = h+50;
			// center on parent
			var x = self.window.opener.screenX + (self.window.opener.outerWidth - self.window.outerWidth) / 2;
			var y = self.window.opener.screenY + (self.window.opener.outerHeight - self.window.outerHeight) / 2;
			self.window.moveTo(x, y);
		} else {
			self.window.resizeTo(w + 8, h + 35);
			var ch = body.clientHeight;
			var cw = body.clientWidth;
			window.resizeBy(w - cw, h - ch);
			var W = body.offsetWidth;
			var H = 2 * body.offsetHeight - ch;
			var x = (screen.availWidth - W) / 2;
			var y = (screen.availHeight - H) / 2;
			self.window.moveTo(x, y);
		}

// End change for by Stanislas Rolland 2004-11-26
	}, 25);
};
