// Inline CSS plugin for HTMLArea
// Sponsored by http://www.fructifor.com
// Implementation by Stanislas Rolland
//
// (c) Stanislas Rolland 2004
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).

InlineCSS.I18N = InlineCSS_langArray;

function InlineCSS(editor, args) {
      this.editor = editor;     
      var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var self = this;
	var i18n = InlineCSS.I18N;
	var editornumber = editor._typo3EditerNumber;

	var obj = {
		id		: "InlineCSS-class",
		tooltip	: i18n["InlineCSSStyleTooltip"],
		options	: {"":""},
		action	: function(editor) { self.onSelect(editor, this); },
		refresh	: function(editor) { self.generate(); },
		context	: "*",
		cssArray	: new Array(),
		parseCount	: 1,
		loaded	: false,
		timeout	: null,
		lastTag	: "",
		lastClass	: "",
		classesCharacter : RTEarea[editornumber]["classesCharacter"]
		};

	cfg.registerDropdown(obj);
};

InlineCSS.prototype.parseStyleSheet=function(editor){
	var editor = this.editor;
	var obj = editor.config.customSelects["InlineCSS-class"];
	var i18n = InlineCSS.I18N;
	var iframe = editor._iframe.contentWindow.document;
	var newCssArray = new Array();
	obj.loaded = true;

	for(var i=0;i<iframe.styleSheets.length;i++){
			// Mozilla
            if(HTMLArea.is_gecko){
			try{
				newCssArray=this.applyCSSRule(editor,i18n,iframe.styleSheets[i].cssRules,newCssArray);
			}
			catch(e){
				obj.loaded = false;
			//	alert(e);
			}
		}
			// IE
            else {
                try{
                    // @import StyleSheets (IE)
                    if(iframe.styleSheets[i].imports){
                        newCssArray=this.applyCSSIEImport(editor,i18n,iframe.styleSheets[i].imports,newCssArray);
                    }
                    if(iframe.styleSheets[i].rules){
                        newCssArray=this.applyCSSRule(editor,i18n,iframe.styleSheets[i].rules,newCssArray);
                    }
                }
                catch(e){
				obj.loaded = false;
                //	alert(e);
                }
		}
	}
	return newCssArray;
};

InlineCSS.prototype.applyCSSRule=function(editor,i18n,cssRules,cssArray){
	var cssElements = new Array();
	var cssElement = new Array();
	var newCssArray = new Array();
	var tagName;
	var className;
	var obj = editor.config.customSelects["InlineCSS-class"];

	newCssArray = cssArray;

	for(var rule in cssRules){
			// StyleRule
		if(cssRules[rule].selectorText){
			if(cssRules[rule].selectorText.search(/:+/)==-1){

					// split equal Styles (Mozilla-specific) e.q. head, body {border:0px}
					// for ie not relevant. returns allways one element
				cssElements = cssRules[rule].selectorText.split(",");
				for(var k=0;k<cssElements.length;k++){
					cssElement = cssElements[k].split(".");
					tagName=cssElement[0].toLowerCase().trim();
					className=cssElement[1];

					if( obj["classesCharacter"].indexOf(className) != -1 ) {

						if(!tagName) tagName='all';
						if(!newCssArray[tagName]) newCssArray[tagName]=new Array();

						if(className){
							if(tagName=='all') cssName=className;
							else cssName='<'+className+'>';
						} else {
							className='none';
							if(tagName=='all') cssName=i18n["Default"];
							else cssName='<'+i18n["Default"]+'>';
						}
						newCssArray[tagName][className]=cssName;
					}
				}
			}
		}
			// ImportRule (Mozilla)
		else if(cssRules[rule].styleSheet){
			newCssArray=this.applyCSSRule(editor,i18n,cssRules[rule].styleSheet.cssRules,newCssArray);
		}
	}
	return newCssArray;
};

InlineCSS.prototype.applyCSSIEImport=function(editor,i18n,cssIEImport,cssArray){
	var newCssArray = new Array();
	newCssArray = cssArray;

	for(var i=0;i<cssIEImport.length;i++){
		if(cssIEImport[i].imports){
			newCssArray=this.applyCSSIEImport(editor,i18n,cssIEImport[i].imports,newCssArray);
		}
		if(cssIEImport[i].rules){
			newCssArray=this.applyCSSRule(editor,i18n,cssIEImport[i].rules,newCssArray);
		}
	}
	return newCssArray;
};

InlineCSS._pluginInfo = {
	name          : "InlineCSS",
	version       : "1.0.0",
	developer     : "Stanislas Rolland",
	developer_url : "http://www.fructifor.com/",
	c_owner       : "Stanislas Rolland",
	sponsor       : "Fructifor Inc.",
	sponsor_url   : "http://www.fructifor.com/",
	license       : "htmlArea"
};

InlineCSS.prototype.onSelect = function(editor, obj) {
	var tbobj = editor._toolbarObjects[obj.id];
	var index = tbobj.element.selectedIndex;
	var className = tbobj.element.value;
	var selTrimmed;

	editor.focusEditor();
	var selectedHTML = editor.getSelectedHTML();
	if(selectedHTML) selTrimmed = selectedHTML.replace(/(<[^>]*>|&nbsp;|\n|\r)/g,"");
	var parent = editor.getParentElement();
	if(/\w/.test(selTrimmed)) {
		var sel = editor._getSelection();
		var range = editor._createRange(sel);
		if( className != 'none' ) {
			obj.lastClass = className;
			if(parent && !HTMLArea.isBlockElement(parent) && selectedHTML.replace(/^\s*|\s*$/g,"") == parent.innerHTML.replace(/^\s*|\s*$/g,"") ) {
				parent.className = className;
			} else {
				if(HTMLArea.is_gecko) {
					var rangeClone = range.cloneRange();
					var span = editor._doc.createElement("span");
					span.className = className;
					span.appendChild(range.extractContents());
					range.insertNode(span);
					sel.removeRange(range);
					range.detach();
					sel.addRange(rangeClone);
				} else {
					var tagopen = '<span class="' + className + '">';
					var tagclose = "</span>";
					editor.surroundHTML(tagopen,tagclose);
				}
			}
		} else {
			if (parent && !HTMLArea.isBlockElement(parent)) {
				if(HTMLArea.is_gecko) {
					parent.removeAttribute('class');
				} else {
					parent.removeAttribute('className');
				}
				if(parent.tagName.toLowerCase() == "span") {
					p = parent.parentNode;
					while (parent.firstChild)
						p.insertBefore(parent.firstChild, parent);
					p.removeChild(parent);
				}
			}
		}
		editor.updateToolbar();
	} else {
		editor.updateToolbar();
		alert(InlineCSS.I18N['You have to select some text']);
	}
};

InlineCSS.prototype.onGenerate = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["InlineCSS-class"];
	if(HTMLArea.is_gecko) this.generate();
};

InlineCSS.prototype.onUpdateToolbar = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["InlineCSS-class"];
	if(HTMLArea.is_gecko && editor._editMode != "textmode") {
		if(obj.loaded) { 
			this.updateValue(editor,obj);
		} else {
			if(obj.timeout) {
				editor._iframe.contentWindow.clearTimeout(obj.timeout);
				obj.timeout = null;
			}
			this.generate();
		}
	}
};

InlineCSS.prototype.generate = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["InlineCSS-class"];
	var self = this;

        // Let us load the style sheets
	function getCSSArray(){
		obj.cssArray = self.parseStyleSheet(editor);
		if( !obj.loaded && obj.parseCount<17 ) {
			obj.timeout = editor._iframe.contentWindow.setTimeout(getCSSArray, 200);
			obj.parseCount++ ;
		} else {
			obj.timeout = null;
			obj.loaded = true;
			self.updateValue(editor,obj);
		}
	};
	if(obj.loaded) {
		self.updateValue(editor,obj);
	} else {
 		getCSSArray();
	}
};

InlineCSS.prototype.onMode = function(mode) {
	var editor = this.editor;
	if(mode=='wysiwyg'){
		var obj = editor.config.customSelects["InlineCSS-class"];
		if(obj.loaded) { 
			this.updateValue(editor,obj);
		} else {
			if(obj.timeout) {
				editor._iframe.contentWindow.clearTimeout(obj.timeout);
				obj.timeout = null;
			}
			this.generate();
		}
	}
};

InlineCSS.prototype.updateValue = function(editor,obj) {

	if(!obj.loaded) {
		if(obj.timeout) {
			editor._iframe.contentWindow.clearTimeout(obj.timeout);
			obj.timeout = null;
		}
		this.generate();
	}

	var cssArray = obj.cssArray;
	var tagName = "body";
	var className = "";
	var parent = editor.getParentElement();
	if(parent) {
		tagName = parent.nodeName.toLowerCase();
		className = parent.className;
	}

	var selTrimmed = editor.getSelectedHTML();
	if(selTrimmed) selTrimmed = selTrimmed.replace(/(<[^>]*>|&nbsp;|\n|\r)/g,"");

	var endPointsInSameBlock = false;
	if(/\w/.test(selTrimmed)) {
		var sel = editor._getSelection();
		var range = editor._createRange(sel);
		if(HTMLArea.is_gecko) {
			if(sel.rangeCount == 1) {
				var parentStart = range.startContainer;
				var parentEnd = range.endContainer;
				if( !(parentStart.nodeType == 1 && parentStart.tagName.toLowerCase() == "tr") ) {
					while (parentStart && !HTMLArea.isBlockElement(parentStart)) { parentStart = parentStart.parentNode; }
					while (parentEnd && !HTMLArea.isBlockElement(parentEnd)) { parentEnd = parentEnd.parentNode; }
					endPointsInSameBlock = (parentStart == parentEnd) && (parent.tagName.toLowerCase() != "body") && (parent.tagName.toLowerCase() != "table") && (parent.tagName.toLowerCase() != "tbody") && (parent.tagName.toLowerCase() != "tr");
				}
			}
		} else {
			if (sel.type != "Control" ) {
				var rangeStart = range.duplicate();
				rangeStart.collapse(true);
				var rangeEnd = range.duplicate();
				rangeEnd.collapse(false);
				var parentStart = rangeStart.parentElement();
				var parentEnd = rangeEnd.parentElement();
				while (parentStart && !HTMLArea.isBlockElement(parentStart)) { parentStart = parentStart.parentNode; }
				while (parentEnd && !HTMLArea.isBlockElement(parentEnd)) { parentEnd = parentEnd.parentNode; }
				endPointsInSameBlock = (parentStart == parentEnd) && (parent.tagName.toLowerCase() != "body")  ;
			}
		}
	}

      var select = editor._toolbarObjects[obj.id].element;
	select.disabled = !(/\w/.test(selTrimmed)) || !(endPointsInSameBlock);

	if( obj.lastTag!=tagName || obj.lastClass!=className || true ){        
		obj.lastTag=tagName;
		obj.lastClass=className;
            var i18n = InlineCSS.I18N;
		while(select.options.length>0){
			select.options[select.length-1] = null;
		}

		select.options[0]=new Option(i18n["Default"],'none');
		if(cssArray){
				// style class only allowed if parent tag is not body or editor is in fullpage mode
			if(cssArray[tagName] && (tagName!='body' || editor.config.fullPage)){
				for(var cssClass in cssArray[tagName]){
					if(cssClass=='none') {
						select.options[0]=new Option(cssArray[tagName][cssClass],cssClass);
					} else {
						select.options[select.options.length]=new Option(cssArray[tagName][cssClass],cssClass);
					}
				}
			}
			if(cssArray['all']){
				for(var cssClass in cssArray['all']){
					select.options[select.options.length]=new Option(cssArray['all'][cssClass],cssClass);
				}
			}
		}

		select.selectedIndex = 0;

		if (typeof className != "undefined" && /\S/.test(className)) {
			for (var i = select.options.length; --i >= 0;) {
				var option = select.options[i];
				if (className == option.value) {
					select.selectedIndex = i;
					break;
				}
			}
			if(select.selectedIndex == 0){
				select.options[select.options.length]=new Option(i18n["Undefined"],className);
				select.selectedIndex=select.options.length-1;
			}
		}

		select.disabled = !(select.options.length>1) || !(/\w/.test(selTrimmed)) || !(endPointsInSameBlock);
	}
};
