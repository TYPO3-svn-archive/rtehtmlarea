// Dynamic CSS (className) plugin for HTMLArea
// Sponsored by http://www.systemconcept.de
// Implementation by Holger Hees
//
// (c) systemconcept.de 2004
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).
// Rewritten by Stanislas Rolland 2004-11-08
// 	Cleaned up to allow multiple instances in the same document
// 	Added function applyCSSIEImport to recursively import IE CSS
// 	Get the timeout right
// 	Assign language array generated by TYPO3 extension
//    Make the text in the toolbar translatable through HTMLArea.i18n.custom
// (c) Stanislas Rolland <stanislas.rolland@fructifor.com> 2004

DynamicCSS.I18N = DynamicCSS_langArray;

function DynamicCSS(editor, args) {
      this.editor = editor;     
      var cfg = editor.config;
	var toolbar = cfg.toolbar;
	var self = this;
	var i18n = DynamicCSS.I18N;

	var obj = {
		id		: "DynamicCSS-class",
		tooltip	: i18n["DynamicCSSStyleTooltip"],
		options	: {"":""},
		action	: function(editor) { self.onSelect(editor, this); },
		refresh	: function(editor) { self.generate(); },
		context	: "*",
		cssArray	: new Array(),
		parseCount	: 1,
		loaded	: false,
		timeout	: null,
		lastTag	: "",
		lastClass	: ""
		};
	cfg.registerDropdown(obj);
	toolbar[0].splice(0, 0, "I[style]", "DynamicCSS-class", "separator");
};

DynamicCSS.prototype.parseStyleSheet=function(editor){
	var i18n = DynamicCSS.I18N;
	var iframe = editor._iframe.contentWindow.document;
	var newCssArray = new Array();
        
        for(var i=0;i<iframe.styleSheets.length;i++){
            // Mozilla
            if(HTMLArea.is_gecko){
                try{
                    newCssArray=this.applyCSSRule(editor,i18n,iframe.styleSheets[i].cssRules,newCssArray);
                }
                catch(e){
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
                //	alert(e);
                }
		}
	}
	return newCssArray;
};

DynamicCSS.prototype.applyCSSRule=function(editor,i18n,cssRules,cssArray){
	var cssElements = new Array();
	var cssElement = new Array();
	var newCssArray = new Array();
	var tagName;
	var className;

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
			// ImportRule (Mozilla)
		else if(cssRules[rule].styleSheet){
			newCssArray=this.applyCSSRule(editor,i18n,cssRules[rule].styleSheet.cssRules,newCssArray);
		}
	}
	return newCssArray;
};

DynamicCSS.prototype.applyCSSIEImport=function(editor,i18n,cssIEImport,cssArray){
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

DynamicCSS._pluginInfo = {
	name          : "DynamicCSS",
	version       : "1.5.2",
	developer     : "Holger Hees",
	developer_url : "http://www.systemconcept.de/",
	c_owner       : "Holger Hees",
	sponsor       : "System Concept GmbH",
	sponsor_url   : "http://www.systemconcept.de/",
	license       : "htmlArea"
};

DynamicCSS.prototype.onSelect = function(editor, obj) {
    var tbobj = editor._toolbarObjects[obj.id];
    var index = tbobj.element.selectedIndex;
    var className = tbobj.element.value;
        
    var parent = editor.getParentElement();
    
    if(className!='none'){
        parent.className=className;
        obj.lastClass=className;
    } else {
        if(HTMLArea.is_gecko) parent.removeAttribute('class');
        else parent.removeAttribute('className');
    }
    editor.updateToolbar();
};

DynamicCSS.prototype.onGenerate = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["DynamicCSS-class"];
	if(HTMLArea.is_gecko) this.generate();
};

DynamicCSS.prototype.onUpdateToolbar = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["DynamicCSS-class"];
	if(HTMLArea.is_gecko && editor._editMode != "textmode") {
		if(obj.timeout) {
			editor._iframe.contentWindow.clearTimeout(obj.timeout);
			obj.timeout = null;
		}
		this.generate();
	}
};

DynamicCSS.prototype.generate = function() {
	var editor = this.editor;
	var obj = editor.config.customSelects["DynamicCSS-class"];
	var self = this;

        // Let us load the style sheets
	function getCSSArray(){
		var oldLength = 0;
		for(var x in obj.cssArray) ++oldLength;   //   .length will not work with this object structure
		obj.cssArray = self.parseStyleSheet(editor);
		var newLength = 0;
		for(var y in obj.cssArray) ++newLength;
		if( (oldLength != newLength) && (obj.parseCount<17) ) {
			obj.timeout = editor._iframe.contentWindow.setTimeout(getCSSArray,obj.parseCount*500);
			obj.parseCount = obj.parseCount*2;
			// now let us wait for the gecko doc and body! 
		} else {
			obj.timeout = null;
			obj.loaded = true;
			self.updateValue(editor,obj);
		}
	};
	getCSSArray();
};
/*
DynamicCSS.prototype.onMode = function(mode) {
	var editor = this.editor;
	if(mode=='wysiwyg'){
		var obj = editor.config.customSelects["DynamicCSS-class"];
		obj.cssArray=null;
		obj.cssArray=new Array();
		obj.parseCount = 1;
		obj.lastTag = "";
		obj.lastClass = "";
		obj.loaded = false;
		if(obj.timeout) {
			editor._iframe.contentWindow.clearTimeout(obj.timeout);
			obj.timeout = null;
		}
		this.generate();
	}
};
*/

DynamicCSS.prototype.updateValue = function(editor,obj) {

	if(!obj.loaded) {
		if(obj.timeout) {
			editor._iframe.contentWindow.clearTimeout(obj.timeout);
			obj.timeout = null;
		}
		this.generate();
	}

	var cssArray = obj.cssArray;
	var tagName = "";
	var className = "";
	var parent = editor.getParentElement();
	if(parent) {
		tagName = parent.nodeName.toLowerCase();
		className = parent.className;
	}

	if( obj.lastTag!=tagName || obj.lastClass!=className ){        
		obj.lastTag=tagName;
		obj.lastClass=className;
            var i18n = DynamicCSS.I18N;
            var select = editor._toolbarObjects[obj.id].element;
		while(select.options.length>0){
			select.options[select.length-1] = null;
		}

		select.options[0]=new Option(i18n["Default"],'none');
		if(cssArray){
				// style class only allowed if parent tag is not body or editor is in fullpage mode
			if(tagName!='body' || editor.config.fullPage){
				if(cssArray[tagName]){
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
			else if(cssArray[tagName] && cssArray[tagName]['none']) select.options[0]=new Option(cssArray[tagName]['none'],'none');
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

		if(select.options.length>1) select.disabled=false;
		else select.disabled=true;
	}
};
