// Plugin for htmlArea to realtime validate code by a ruleset,
// This ensures semantically clean content.
// By Troels Knak-Nielsen
//
// Distributed under the terms of LGPL
// This notice MUST stay intact for use (see license.txt).
// http://www.opensource.org/licenses/lgpl-license.php

// Begin change by Stanislas Rolland 2004-11-17
// Get labels generated from TYPO3 locallang file
Indite.I18N = Indite_langArray;
// End change by Stanislas Rolland 2004-11-17


function Indite(editor, args) {
	// set to true, to assert validity of transformations
	// really just relevant for debugging xsl
	// also forces the browser to reload external js (see Indite.includeScript)
	this.bDebug = false;

	// load xml-libraries
	//Indite.includeScript("xml/XML_Utility.js");
	//Indite.includeScript("xml/XML_Document.js");
	//Indite.includeScript("xml/DTD_Document.js");

	// some private vars
	this.statusBarColor = "#ffbe6d";
	this.editor = editor;
// Begin change by Stanislas Rolland 2004-11-17
// Get styles from file in onGenerate function
	//this.editor.config.pageStyle = "body {font-family : verdana; font-size : 85%;} p { border : 1px dotted #008000; } ol, ul { border : 1px dotted #287ed1; } h2 { border : 1px dotted #ffa500; } pre { border : 1px dotted #888888; background-color : #eeeeee; } ul, ol, h2, p, pre { margin-top : .5em; margin-bottom : .5em; }";
// Begin change by Stanislas Rolland 2004-11-17
	this.szGeckoEmptyDoc = "<p><br/></p>";
	// witch ruleset to use
	// currently we have only one
	this.szRule = (args[0]) ? args[0] : "article";
	//Indite.includeScript("rules/" + this.szRule + ".js");
};

Indite.__aRules = Array();

Indite.RegExpCache = [
	new RegExp().compile(/<span ([^>\/]*)\/>/g),
	new RegExp().compile(/<span[^>\/]*>.*<\/span>/gi),
	new RegExp().compile(/<br.*\/>/gi)
];


Indite._pluginInfo = {
	name          : "Indite",
	version       : "1.0-RC3",
	developer     : "Troels Knak-Nielsen",
	developer_url : "http://www.kyberfabrikken.dk/opensource/indite/",
	sponsor       : "Kyberfabrikken",
	sponsor_url   : "http://www.kyberfabrikken.dk/",
	license       : "LGPL"
};

Indite.includeScript = function(scriptName) {
	var scriptSrc = _editor_url + "plugins/Indite/" + scriptName;
	if (this.bDebug) {
		// prevents caching by the browser
		scriptSrc += "?" + (new Date()).getTime();
	}
	var oHead = document.getElementsByTagName("head")[0];
	var oScript = document.createElement("script");
	oScript.src = scriptSrc;
	oHead.appendChild(oScript);
};

Indite.prototype.onGenerate = function() {
	if (typeof Indite.__aRules[this.szRule] == "undefined") {
		throw new Error("Ruleset '" + this.szRule + "' not loaded");
	}

	this.dtd = Indite.__aRules[this.szRule].dtd;
	this.xsl = Indite.__aRules[this.szRule].xsl;
	
	// internationalize error-messages
	this.dtd.I18N = Indite.I18N;
	
	var self = this;
	var doc = this.editor._iframe.contentWindow.document;

// Begin change by Stanislas Rolland 2004-11-17
// Get styles from file in onGenerate function
	var oHead = doc.getElementsByTagName("head")[0];
	var oLink = doc.createElement("link");
	oLink.rel = "stylesheet";
	oLink.href = _editor_url + "plugins/Indite/indite.css";
	oHead.appendChild(oLink);
// Begin change by Stanislas Rolland 2004-11-17
	
	// here we hook the runtime transformer up to some events, that may modify our document.
	// most notably dragdrop and paste
	var realDoc = HTMLArea.is_ie ? doc.body : doc;
	HTMLArea._addEvents(realDoc, ["paste","dragdrop","drop","resizeend"],
		 function (event) {
		 	return self.invokeTransform(HTMLArea.is_ie ? self.editor._iframe.contentWindow.event : event);
		 });


	// since htmlarea provides no means to trigger an event on submit,
	// we hook it manually here. it should work, but it's rather un-elegant
	var editor = self.editor;
	if (self.editor._textArea.form) {
		// we have a form, on submit get the HTMLArea content and
		// update original textarea.
		var f = self.editor._textArea.form;
		if (typeof f.onsubmit == "function") {
			var funcref = f.onsubmit;
			if (typeof f.__msh_prevOnSubmit == "undefined") {
				f.__msh_prevOnSubmit = [];
			}
			f.__msh_prevOnSubmit.push(funcref);
		}
// from this release on, i have skipped the final transform ... i'm still not sure if it's a good idea or not
/*
		f.onsubmit = function() {
//			editor.plugins["Indite"].instance.finalTransformer.transformDoc();
			var a = this.__msh_prevOnSubmit;
			// call previous submit methods if they were there.
			if (typeof a != "undefined") {
				for (var i in a) {
					a[i]();
				}
			}
		};
*/
		var old = (self.editor._textArea.onkeyup) ? self.editor._textArea.onkeyup : function () {};
		self.editor._textArea.onkeyup = function () {
			try { old() } catch(e) { alert(e.message); }
			editor.plugins["Indite"].instance.sourceModeValidate();
		};

	}

	// intercept setMode, in order to provide a better formatted getHTML
	// this really is something that the main developers of htmlarea should be dealing with,
	// but until then, this will stay

	this.editor._setMode = this.editor.setMode;
	this.editor.setMode = function(mode) {
		// intercept getHTML()
		HTMLArea.__getHTML = HTMLArea.getHTML;
		var editor = this;
		HTMLArea.getHTML = function(doc, arg1, arg2) {
			return XML_Utility.indent( HTMLArea.__getHTML(doc, arg1, arg2) );
		};
		this._setMode(mode);
		HTMLArea.getHTML = HTMLArea.__getHTML;
	};
	
	// disable moz css-mode
	if (HTMLArea.is_gecko) {
		this.editor._doc.execCommand("useCSS", false, true);
	}

	// fire the initial transform at loadtime
	this.invokeTransform(null);
};

Indite.strLimit = function(s, max, sAlign, sElipse) {
	max = (typeof max == "number") ? max : 100;
	sAlign = (typeof bAlign == "string") ? bAlign : "left";
	sElipse = (typeof sElipse == "string") ? sElipse : "...";
	if (s.length > max) {
		if (sAlign == "left") {
			return s.substring(0, max) + sElipse;
		} else if (sAlign == "right") {
			return sElipse + s.substring(s.length - max, s.length);
		} else {
			throw new Error("Wrong argument #3 for strLimit. Should be 'left' or 'right'");
		}
	}
	return s;
};

Indite.prototype.onUpdateToolbar = function(ev) {
	this.editor._statusBar.style.backgroundColor = "";
	if (this.editor._editMode == "wysiwyg") {
		this.invokeTransform(ev);
	}
};

/**
  * validates document while in sourcemode.
  * mozilla uses custom DTD-assertion to test beyond wellformedness
  */
Indite.prototype.sourceModeValidate = function() {
	var xmlDoc = XML_Document.loadXmlContent(
		"<body>" + XML_Utility.cleanHTML(this.editor.getInnerHTML()) + "</body>",
		this.dtd,
		false
		);
	if (xmlDoc.parseError.errorCode == 0) {
		this.editor._statusBar.innerHTML = HTMLArea.I18N.msg["TEXT_MODE"];
		this.editor._statusBar.style.backgroundColor = "";
	} else {
		this.editor._statusBar.innerHTML = HTMLArea.htmlEncode(
			xmlDoc.parseError.reason) + "<br />" + 
			Indite.I18N["Close to"] + " : <strong>" + HTMLArea.htmlEncode(Indite.strLimit(xmlDoc.parseError.srcText)) + "</strong>";
		this.editor._statusBar.style.backgroundColor = this.statusBarColor;
	}
};

Indite.__lock = false;
/**
  * This is the main engine of the plug
  * Here we perform runtime transformation of the document to suit our evil needs
  */
Indite.prototype.invokeTransform = function(ev) {
	// test lock
	var t = (new Date()).getTime();
	if (Indite.__lock) {
		// lock timeout
		if ((t - Indite.__lock) > 100) {
			Indite.__lock = false;
		} else {
			return ;
		}
	}
	// set lock
	Indite.__lock = t;
	
	var editor = this.editor;
	// test if transform is nescesary
	var szContent = "<body>" + XML_Utility.cleanHTML(editor.getInnerHTML()) + "</body>";
	var xmlDoc = XML_Document.loadXmlContent( szContent, this.dtd );
	if (xmlDoc.parseError.errorCode == 0) {
		Indite.__lock = false;
		return ;
	}
	
	// let's get to work
	try {
		var html = "";
		// gecko goes down in flames on this ... (surprise, surprise)
		if (HTMLArea.is_ie) {
			try {
				var sel = editor._getSelection();
				var range = editor._createRange(sel);
				if (HTMLArea.is_ie) {
					html = range.htmlText;
				} else {
					html = HTMLArea.getHTML(range.cloneContents(), false, editor);
				}
			} catch (e) { };
		}
		editor.insertHTML("<span id=\"indite-cursor-marker\">" + html + "</span>");
		szContent = "<body>" + XML_Utility.cleanHTML(editor.getInnerHTML()) + "</body>";
	} catch (e) { } // this will happen, if the field has no focus

	var xmlDoc = XML_Document.loadXmlContent(szContent);
	
	var szResultDoc = null;
	try {
		szResultDoc = XML_Utility.stripBody(xmlDoc.transformNode(this.xsl));
	} catch (e) {
		// oh no
		throw new Error("Fatal error : Transform failed:\n" + e.message);
	}
	if (HTMLArea.is_gecko) {
		// for some obscure reason, mozilla interprets singlet spantag as an opening tag ...
		szResultDoc = szResultDoc.replace(Indite.RegExpCache[0],
			function ($1,$2) {
				return "<span " + $2 + "></span>";
				}
			);
	}

	// gecko just won't accept an empty document
	if (HTMLArea.is_gecko) {
		szTmp = szResultDoc.replace(Indite.RegExpCache[1], "");
		szTmp = szTmp.replace(Indite.RegExpCache[2], "");
		if (szTmp == "") {
			szResultDoc = this.szGeckoEmptyDoc;
		}
	}
	this.editor.setHTML(szResultDoc);
	
	// kill inserted cursor tag
	var curse = this.editor._doc.getElementById("indite-cursor-marker");
	if (curse && curse.parentNode) {
		// note : selections are not restored
		if (HTMLArea.is_ie) {
			this.editor.selectNodeContents(curse, false);
			curse.removeNode(false);
		} else {
			var p = curse.parentNode;
			var tmp = false;
			var bToStart = false;
			if (curse.nextSibling != null) {
				tmp = curse.nextSibling;
				bToStart = true;
			} else if (curse.previousSibling != null) {
				tmp = curse.previousSibling;
				bToStart = false;
			}
			if (tmp) {
				p.removeChild(curse);
				var sel = this.editor._getSelection();
				sel.removeAllRanges();
				var range = this.editor._doc.createRange();
				if (tmp.nodeType == 1) bToStart = true;
				if (bToStart) {
					range.selectNodeContents(tmp);
					range.collapse(bToStart);
				} else {
					// mozilla is wierd ...
					range.setStartBefore(tmp);
					range.setEndAfter(tmp);
					range.collapse(bToStart);
				}
				sel.addRange(range);
			} else {
				// as far as i can tell this won't happen
				p.removeChild(curse);
			}
			this.editor.forceRedraw();
			this.editor.focusEditor();
		}

		// can't actually test the following code before i got the xslt to accept
		// the cursor-tag inside pure-text tags like h2 and a
/*
		if (HTMLArea.is_ie) {
			if (curse.hasChildNodes()) {
				var cFirst = curse.firstChild;
				curse.removeNode(false);
				var range = this.editor._doc.body.createTextRange();
				range.moveToElementText(cFirst);
				range.select();
			} else {
				var range = this.editor._doc.body.createTextRange();
				range.moveToElementText(curse);
				range.collapse(false);
				range.select();
				curse.removeNode(false);
			}
		} else {
			var p = curse.parentNode;
			var cFirst = curse.firstChild;
			var cLast = curse.lastChild;
			for (var i=0,a=curse.childNodes,l=a.length; i < l; ++i) {
				var tmp = curse.removeChild(a[i]);
				p.insertBefore(tmp, curse);
			}
			p.removeChild(curse);
			this.editor.focusEditor();
			this.editor.forceRedraw();
			var sel = this.editor._getSelection();
			var range = this.editor._doc.createRange();
			range.setStartBefore(cFirst);
			range.setEndAfter(cLast);
			range.select();
		}
*/
	}

	this.editor._undoTakeSnapshot();

	if (!this.bDebug) {
		Indite.__lock = false;
		return ;
	}

	// post-validation
	xmlDoc = XML_Document.loadXmlContent( "<body>" + szResultDoc + "</body>", this.dtd );
	if (xmlDoc.parseError.errorCode == 0) {
		Indite.__lock = false;
		return ;
	}
	throw new Error("post-validation failed : " + xmlDoc.parseError.reason);
};
