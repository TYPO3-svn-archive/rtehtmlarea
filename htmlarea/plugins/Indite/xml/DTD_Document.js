// Copyright by Troels Knak-Nielsen, 2004
//
// Distributed under the terms of LGPL version 2.1
// http://www.opensource.org/licenses/lgpl-license.php
// This notice MUST stay intact for use
//
// author : troels@kyberfabrikken.dk

/////////////////////////////////////////////////////////////////////////////
// DTD_Document
function DTD_Document(rootElementName) {
	this.rootElementName = rootElementName;
	this.elements = Array();
	this.attributeLists = Array();
	
	this.createElement("CDATA", false);
	this.createElement("#PCDATA", false);
	this.createElement("EMPTY", false);
	
	this.__szCachedContent = false;
	this.__szLineLength = -1;
};

DTD_Document.RegExpCache = [
	new RegExp().compile(/\S+/g)
];

DTD_Document.prototype.I18N = {
	0xC00CE01C : "Reference to undeclared element: %1",
	0xC00CE014 : "Content not allowed in this context.",
	0xC00CE014 : "Node not allowed in this context. Expected %1",
	0xC00CE011 : "Element cannot be empty according to the DTD or schema.",
	0xC00CE015 : "The attribute '%1' on this element is not defined in the DTD or schema.",
	0xC00CE020 : "Required attribute '%1' is missing.",
	0xC00CE018 : "Text is not allowed in this element according to DTD or schema. Expected %1"
};

DTD_Document.prototype.toString = function() {
	if (this.__szCachedContent) {
		return this.__szCachedContent;
	}
	this.__szCachedContent = "<!DOCTYPE " + this.rootElementName + " [\n";
	for (var i in this.elements) {
		if (i != "CDATA" && i != "#PCDATA" && i != "EMPTY") {
			this.__szCachedContent += "  " + this.elements[i].toString();
		}
	}
	for (var i in this.attributeLists) {
		this.__szCachedContent += this.attributeLists[i].toString();
	}
	this.__szCachedContent += "]>\n";
	return this.__szCachedContent;
};

DTD_Document.prototype.lineLength = function() {
	if (this.__szLineLength > -1) {
		return this.__szLineLength;
	}
	var s = this.toString();
	this.__szLineLength = 1;
	for (var i=0, l=s.length;i<l;++i) {
		if (s.charAt(i) == "\n") {
			this.__szLineLength++;
		}
	}
	return this.__szLineLength;
};

DTD_Document.prototype.createElement = function(name, bReplace) {
	var e = this.elements[name];
	if (bReplace || !e) {
		e = this.elements[name] = new DTD_Element(name);
		e.DTD_Document = this;
	}
	return e;
};

DTD_Document.prototype.createAttributeList = function(name) {
	var a = this.attributeLists[name];
	if (!a) {
		a = this.attributeLists[name] = new DTD_AttributeList(name);
	}
	return a;
};

DTD_Document.prototype.assert = function(xmlDoc) {
	var _stack = Array();
	for (var i=0,c=xmlDoc.childNodes,l=c.length; i < l; ++i) {
		_stack.push(c[i]);
	}
	var nOverflow=0;
	var n=null;
	while (_stack.length > 0) {
		++nOverflow;
		if (nOverflow > 8000) {
			alert("Stack overflow error");
			return false;
		}
		n = _stack.pop();
		for (var i=0,c=n.childNodes,l=c.length; i < l; ++i) {
			_stack.push(c[i]);
		}
		var nodeType = n.nodeType;
		if (nodeType == 1) {
			var nTagName = n.tagName.toLowerCase();
			if (typeof this.elements[nTagName] == "undefined") {
				return {
					errorCode	: 0xC00CE01C,
					reason		: this.I18N[0xC00CE01C].replace(/%1/, nTagName),
					srcText		: XML_Document.getXML(n.parentNode),
					line		: -1,
					linepos		: -1,
					url		: ""
				};
			}
		}
		
		var pEnt = this.elements[n.parentNode.tagName.toLowerCase()];
		if (!pEnt) {
			throw new Error("Not a valid parent : " + n.parentNode.tagName.toLowerCase());
		}
		if (pEnt.mustBeEmpty) {
			return {
				errorCode	: 0xC00CE014,
				reason		: this.I18N[0xC00CE014],
				srcText		: XML_Document.getXML(n.parentNode),
				line		: -1,
				linepos		: -1,
				url		: ""
			};
		}
		if (nodeType == 1) {
			if (!pEnt.assertChildNode(n)) {
				return {
					errorCode	: 0xC00CE014,
					reason		: this.I18N[0xC00CE014].replace(/%1/, pEnt.getValidChildNames()),
					srcText		: XML_Document.getXML(n.parentNode),
					line		: -1,
					linepos		: -1,
					url		: ""
				};
			}
			if (l == 0) {
				var nEnt = this.elements[nTagName];
				if (!nEnt.allowEmpty) {
					return {
						errorCode	: 0xC00CE011,
						reason		: this.I18N[0xC00CE011],
						srcText		: XML_Document.getXML(n),
						line		: -1,
						linepos		: -1,
						url		: ""
					};
				}
			}

			var nAttr = this.attributeLists[nTagName];
			// test validity of specified attributes
			var errNotAllowed = false;
			if (nAttr) {
				var aAttr = nAttr.elements;
			}

			var specifiedAttributes = Array();
			for (var i=0,a=n.attributes,l=a.length; i < l; ++i) {
				if (a[i].specified) {
					specifiedAttributes.push(a[i]);	// caching them for the next loop
					if (!nAttr) {	// no attr allowed at all
						errNotAllowed = true;
					} else {	// test each defined attribute
						var aDef = aAttr[ a[i].name.toLowerCase() ];
						if (!aDef) {
							errNotAllowed = true;
						}
					}
					if (errNotAllowed) {
						return {
							errorCode	: 0xC00CE015,
							reason		: this.I18N[0xC00CE015].replace(/%1/, a[i].name.toLowerCase()),
							srcText		: XML_Document.getXML(n),
							line		: -1,
							linepos		: -1,
							url		: ""
						};
					}
				}
			}
			if (nAttr) {
				// test existence of required attributes
				for (var i=0,a=nAttr.elementsRequired,l=a.length; i < l; ++i) {
					var b = false;
					for (var j=0,aj=specifiedAttributes,lj=aj.length; j < lj; ++j) {
						if (aj[j].name.toLowerCase() == a[i]) {
							b = true;
							break;
						}
					}
					if (!b) {
						return {
							errorCode	: 0xC00CE020,
							reason		: this.I18N[0xC00CE020].replace(/%1/, a[i]),
							srcText		: XML_Document.getXML(n),
							line		: -1,
							linepos		: -1,
							url		: ""
						};
					}
				}
			}
			
		} else if (nodeType == 3) {
			// really bizarre ... in 1 : 20 times, mozilla fails, if i use a compiled regex
			if (!pEnt.allowTextChildren && (new RegExp(/\S+/g)).test(n.data)) {
//			if (!pEnt.allowTextChildren && (DTD_Document.RegExpCache[0].test(n.data))) {
				return {
					errorCode	: 0xC00CE018,
					reason		: this.I18N[0xC00CE018].replace(/%1/, pEnt.getValidChildNames()),
					srcText		: n.data,
					line		: -1,
					linepos		: -1,
					url		: ""
				};
			}
		}
	}
	return { errorCode : 0 };
};

//////////////////////////////////////////////////////////////////////////////
// DTD_Element
function DTD_Element(name) {
	this.DTD_Document = null;
	this.name = name;
	this.elements = Array();
	this.diversity = "*"; // * +

	this.allowTextChildren = false;
	this.mustBeEmpty = true;
	this.allowEmpty = false;
};

DTD_Element.prototype.toString = function() {
	var sPadding = " ";
	for (var i=this.name.length; i < 10; ++i) {
		sPadding += " ";
	}
	var s = "<!ELEMENT " + this.name + sPadding + "(";
	var n=0;
	for (var i in this.elements) {
		if (n>0) s += "|"; ++n;
		s += this.elements[i].name;
	}
	s += ")" + this.diversity + ">\n";
	return s;
};

DTD_Element.prototype.getValidChildNames = function() {
	var s = "";
	var n=0;
	for (var i in this.elements) {
		if (n>0) s += ","; ++n;
		s += this.elements[i].name;
	}
	return s;
};

DTD_Element.prototype.addElement = function(name) {
	this.elements[name] = this.DTD_Document.createElement(name);
	// kind of hack'ish
	if (name == "#PCDATA" || name == "CDATA") {
		this.allowTextChildren = true;
	}
	if (name == "EMPTY") {
		this.allowEmpty = true;
	} else {
		this.mustBeEmpty = false;
	}
};

/** returns TRUE if the element is a valid childnode */
DTD_Element.prototype.assertChildNode = function(e) {
	if (e.nodeType != 1) {
		return false;
	}
	return (typeof this.elements[e.tagName.toLowerCase()] != "undefined");
};

DTD_Element.prototype.addAttribute = function(attrName, bRequired) {
	var a = this.DTD_Document.createAttributeList(this.name);
	a.addAttribute(attrName, bRequired);
};

//////////////////////////////////////////////////////////////////////////////
// DTD_AttributeList
function DTD_AttributeList(name) {
	this.name = name;
	this.elements = Array();
	this.elementsRequired = Array();
};

DTD_AttributeList.prototype.toString = function() {
	var sPadding = " ";
	for (var i=this.name.length; i < 10; ++i) {
		sPadding += " ";
	}
	var s = "  <!ATTLIST " + this.name + sPadding + "\n";
	for (var i in this.elements) {
		sPadding = "    ";
		for (var j=this.elements[i].name.length; j < 14; ++j) {
			sPadding += " ";
		}
		s += "    " + this.elements[i].name + sPadding + " CDATA " + (this.elements[i].bRequired ? "#REQUIRED" : "#IMPLIED") + "\n";
	}
	s += "  >\n";
	return s;
};

DTD_AttributeList.prototype.addAttribute = function(attrName, bRequired) {
	this.elements[attrName] = { name : attrName, bRequired : ((typeof bRequired == "boolean") ? bRequired : true) };
	if (this.elements[attrName].bRequired) {
		this.elementsRequired[this.elementsRequired.length] = attrName;
	}
};

