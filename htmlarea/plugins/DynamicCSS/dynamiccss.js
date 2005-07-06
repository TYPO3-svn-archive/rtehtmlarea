// Dynamic CSS plugin for TYPO3 htmlArea RTE
// Implementation by Holger Hees, sponsored by http://www.systemconcept.de
// Rewritten by Stanislas Rolland, sponsored by Fructifor Inc.
// (c) 2004, systemconcept.de
// (c) 2004-2005, Stanislas Rolland <stanislas.rolland@fructifor.com>
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).

DynamicCSS = function(editor,args) {
      this.editor = editor;     
      var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var self = this;
	var editornumber = editor._typo3EditerNumber;

	var obj = {
		id		: "DynamicCSS-class",
		tooltip	: DynamicCSS_langArray["DynamicCSSStyleTooltip"],
		options	: {"":""},
		action	: function(editor) { self.onSelect(editor, this); },
		refresh	: function(editor) { self.generate(editor); },
		context	: "*",
		cssArray	: new Array(),
		parseCount	: 1,
		loaded	: false,
		timeout	: null,
		lastTag	: "",
		lastClass	: "",
		showTagFreeClasses	: RTEarea[editornumber]["showTagFreeClasses"]
		};
	cfg.registerDropdown(obj);
};

DynamicCSS.I18N = DynamicCSS_langArray;

DynamicCSS.parseStyleSheet = function(editor){
	var obj = editor.config.customSelects["DynamicCSS-class"];
	var iframe = editor._iframe.contentWindow ? editor._iframe.contentWindow.document : editor._iframe.contentDocument;
	var newCssArray = new Array();
	obj.loaded = true;
	for(var i=0;i<iframe.styleSheets.length;i++){
			// Mozilla
            if(HTMLArea.is_gecko){
			try{ newCssArray = DynamicCSS.applyCSSRule(editor,DynamicCSS.I18N,iframe.styleSheets[i].cssRules,newCssArray); }
			catch(e){ obj.loaded = false; }
		} else {
			try{
					// @import StyleSheets (IE)
				if(iframe.styleSheets[i].imports){
					newCssArray = DynamicCSS.applyCSSIEImport(editor,DynamicCSS.I18N,iframe.styleSheets[i].imports,newCssArray);
				}
				if(iframe.styleSheets[i].rules){
					newCssArray = DynamicCSS.applyCSSRule(editor,DynamicCSS.I18N,iframe.styleSheets[i].rules,newCssArray);
				}
			} catch(e) { obj.loaded = false; }
		}
	}
	return newCssArray;
};

DynamicCSS.applyCSSRule=function(editor,i18n,cssRules,cssArray){
	var	cssElements = new Array(),
		cssElement = new Array(),
		newCssArray = new Array(),
		tagName, className, rule, k,
		obj = editor.config.customSelects["DynamicCSS-class"];
	newCssArray = cssArray;
	for(rule=0;rule<cssRules.length;rule++){
			// StyleRule
		if(cssRules[rule].selectorText){
			if(cssRules[rule].selectorText.search(/:+/)==-1){
					// split equal Styles e.g. head, body {border:0px}
				cssElements = cssRules[rule].selectorText.split(",");
				for(k=0;k<cssElements.length;k++){
					cssElement = cssElements[k].split(".");
					tagName=cssElement[0].toLowerCase().trim();
					className=cssElement[1];
					if(!tagName) tagName = "all";
					if((tagName != "all" || obj["showTagFreeClasses"] == true) && !HTMLArea.reservedClassNames.test(className)) {
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
			newCssArray = DynamicCSS.applyCSSRule(editor,i18n,cssRules[rule].styleSheet.cssRules,newCssArray);
		}
	}
	return newCssArray;
};

DynamicCSS.applyCSSIEImport=function(editor,i18n,cssIEImport,cssArray){
	var newCssArray = new Array();
	newCssArray = cssArray;
	for(var i=0;i<cssIEImport.length;i++){
		if(cssIEImport[i].imports){
			newCssArray = DynamicCSS.applyCSSIEImport(editor,i18n,cssIEImport[i].imports,newCssArray);
		}
		if(cssIEImport[i].rules){
			newCssArray = DynamicCSS.applyCSSRule(editor,i18n,cssIEImport[i].rules,newCssArray);
		}
	}
	return newCssArray;
};

DynamicCSS._pluginInfo = {
	name          : "DynamicCSS",
	version       : "1.5.3",
	developer     : "Holger Hees & Stanislas Rolland",
	developer_url : "http://www.systemconcept.de/",
	c_owner       : "Holger Hees & Stanislas Rolland",
	sponsor       : "System Concept GmbH & Fructifor Inc.",
	sponsor_url   : "http://www.systemconcept.de/",
	license       : "htmlArea"
};

DynamicCSS.prototype.onSelect = function(editor, obj) {
	var tbobj = editor._toolbarObjects[obj.id];
	var index = document.getElementById(tbobj.elementId).selectedIndex;
	var className = document.getElementById(tbobj.elementId).value;

	editor.focusEditor();
    	var parent = editor.getParentElement();
	while(typeof(parent) != "undefined" && !HTMLArea.isBlockElement(parent) && parent.nodeName.toLowerCase() != "img") parent = parent.parentNode;
	var cls = parent.className.trim().split(" ");
	for(var i = cls.length; i > 0;) if(!HTMLArea.reservedClassNames.test(cls[--i])) HTMLArea._removeClass(parent,cls[i]);
	if(className != 'none'){
		HTMLArea._addClass(parent,className);
		obj.lastClass = className;
	}
	editor.updateToolbar();
};

DynamicCSS.prototype.onGenerate = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["DynamicCSS-class"];
	if(HTMLArea.is_gecko) this.generate(editor);
};

DynamicCSS.prototype.onUpdateToolbar = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["DynamicCSS-class"];
	if(HTMLArea.is_gecko && editor._editMode != "textmode") {
		if(obj.loaded) { 
			this.updateValue(editor,obj);
		} else {
			if(obj.timeout) {
				if(editor._iframe.contentWindow) { editor._iframe.contentWindow.clearTimeout(obj.timeout); } else { window.clearTimeout(obj.timeout); }
				obj.timeout = null;
			}
			this.generate(editor);
		}
	}
};

DynamicCSS.prototype.generate = function(editor) {
	var obj = editor.config.customSelects["DynamicCSS-class"];
	var self = this;

        // Let us load the style sheets
	function getCSSArray(){
		obj.cssArray = DynamicCSS.parseStyleSheet(editor);
		if( !obj.loaded && obj.parseCount<17 ) {
			obj.timeout = editor._iframe.contentWindow ? editor._iframe.contentWindow.setTimeout(getCSSArray, 200) : window.setTimeout(getCSSArray, 200);
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

DynamicCSS.prototype.onMode = function(mode) {
	var editor = this.editor;
	if(mode == 'wysiwyg'){
		var obj = editor.config.customSelects["DynamicCSS-class"];
		if(obj.loaded) { 
			this.updateValue(editor,obj);
		} else {
			if(obj.timeout) {
				if(editor._iframe.contentWindow) editor._iframe.contentWindow.clearTimeout(obj.timeout);
					else window.clearTimeout(obj.timeout);
				obj.timeout = null;
			}
			this.generate(editor);
		}
	}
};

DynamicCSS.prototype.updateValue = function(editor,obj) {
	var cssClass, i;
	if(!obj.loaded) {
		if(obj.timeout) {
			if(editor._iframe.contentWindow) editor._iframe.contentWindow.clearTimeout(obj.timeout);
				else window.clearTimeout(obj.timeout);
			obj.timeout = null;
		}
		this.generate(editor);
	}
	var cssArray = obj.cssArray;
	var tagName = "body";
	var className = "";
	var parent = editor.getParentElement();
	while(typeof(parent) != "undefined" && !HTMLArea.isBlockElement(parent) && parent.nodeName.toLowerCase() != "img") parent = parent.parentNode;
	if(parent) {
		tagName = parent.nodeName.toLowerCase();
		className = parent.className;
		if(HTMLArea.reservedClassNames.test(className)) {
			var cls = className.split(" ");
			for(var i = cls.length; i > 0;) if(!HTMLArea.reservedClassNames.test(cls[--i])) className = cls[i];
		}
	}
	if(obj.lastTag != tagName || obj.lastClass != className){        
		obj.lastTag = tagName;
		obj.lastClass = className;
            var select = document.getElementById(editor._toolbarObjects[obj.id].elementId);
		while(select.options.length>0) select.options[select.length-1] = null;
		select.options[0]=new Option(DynamicCSS.I18N["Default"],'none');
		if(cssArray){
				// style class only allowed if parent tag is not body or editor is in fullpage mode
			if(tagName != 'body' || editor.config.fullPage){
				if(cssArray[tagName]){
					for(cssClass in cssArray[tagName]){
						if(cssClass == 'none') {
							select.options[0] = new Option(cssArray[tagName][cssClass],cssClass);
						} else {
							select.options[select.options.length] = new Option(cssArray[tagName][cssClass],cssClass);
						}
					}
				}
				if(cssArray['all']){
					for(cssClass in cssArray['all']){
						select.options[select.options.length] = new Option(cssArray['all'][cssClass],cssClass);
					}
				}
			} else {
				if(cssArray[tagName] && cssArray[tagName]['none']) select.options[0] = new Option(cssArray[tagName]['none'],'none');
			}
		}
		select.selectedIndex = 0;
		if(typeof(className) != "undefined" && /\S/.test(className) && !HTMLArea.reservedClassNames.test(className) ) {
			for(i = select.options.length; --i >= 0;) {
				var option = select.options[i];
				if (className == option.value) {
					select.selectedIndex = i;
					break;
				}
			}
			if(select.selectedIndex == 0) {
				select.options[select.options.length] = new Option(DynamicCSS.I18N["Undefined"],className);
				select.selectedIndex = select.options.length-1;
			}
		}
		if(select.options.length>1) select.disabled = false;
			else select.disabled = true;
		select.className = "";
		if(select.disabled) select.className = "buttonDisabled";
	}
};
