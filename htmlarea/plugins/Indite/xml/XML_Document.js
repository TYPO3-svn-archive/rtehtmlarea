// Copyright by Troels Knak-Nielsen, 2004
//
// Distributed under the terms of LGPL version 2.1
// http://www.opensource.org/licenses/lgpl-license.php
// This notice MUST stay intact for use
//
// author : troels@kyberfabrikken.dk
// some methods are loosely based on
//       http://webfx.eae.net/dhtml/xmlextras/xmlextras.html

//////////////////////////////////////////////////////////////////////////////
// XML_Document
XML_Document = {};

XML_Document.RegExpCache = [
	new RegExp().compile("Line Number ([0-9]+), Column ([0-9]+):")
];

XML_Document.getXML = function(node) {
	if (window.ActiveXObject) return node.xml;
	return (new XMLSerializer()).serializeToString(node);
};

XML_Document.__domDocumentPrefix = false;

// used to find the Automation server name
XML_Document.getDomDocumentPrefix = function() {
	if (XML_Document.__domDocumentPrefix)
		return XML_Document.__domDocumentPrefix;
	var prefixes = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
	var o;
	for (var i = 0; i < prefixes.length; ++i) {
		try {
			// try to create the objects
			o = new ActiveXObject(prefixes[i] + ".DomDocument");
			return XML_Document.__domDocumentPrefix = prefixes[i];
		} catch (ex) {};
	}
	throw new Error("Could not find an installed XML parser");
}

// creates a XmlDocument
XML_Document.create = function() {
	try {
		// moz
		if (document.implementation && document.implementation.createDocument) {
			var xmlDoc = document.implementation.createDocument("", "", null);
			xmlDoc.async = false;
			return XML_Document.__extendMoz(xmlDoc);
		}
		// ie
		if (window.ActiveXObject) {
			var xmlDoc = new ActiveXObject(XML_Document.getDomDocumentPrefix() + ".DomDocument");
			xmlDoc.async = false;
			return xmlDoc;
		}
	} catch (ex) {}
	throw new Error("Your browser does not support XmlDocument objects");
};
/**
  * Loads xml-content and validates it against the DTD-object
  * @param string       String representing the documentElement of the xml-document.
  * @param DTD_Document The DTD-object to validate against
  * @param boolean      Set to FALSE turns off native DTD-validation for MSXML
  *
  * @usage You shouldn't pass an entires xml-document as first argument. Only the part making up the
  *        documentElement of the document should be passed.
  *        var xmlDoc = XML_Document.loadXmlContent("<body>foobar</body>", objDTD);
  */
XML_Document.loadXmlContent = function(strXmlDocumentElement, objDTD, bUseNativeValidation) {
	// moz
	if (document.implementation && document.implementation.createDocument) {
		var strXml = "<?xml version=\"1.0\" ?>\n";
		strXml += strXmlDocumentElement;
		var xmlDoc = (new DOMParser()).parseFromString(strXml, "text/xml");
		XML_Document.__extendMoz(xmlDoc);
		//check for a parsing error
		if (!xmlDoc.documentElement) {
			return { parseError : {
				errorCode	: -9999999,
				reason		: "Unknown error",
				srcText		: "",
				line		: -1,
				linepos		: -1,
				url		: ""
			} };
		} else if (xmlDoc.documentElement.tagName == "parsererror") {
			var aReason = xmlDoc.documentElement.firstChild.data.split("\n");
			var matches = XML_Document.RegExpCache[0].exec(aReason[2]);
			var srcText = xmlDoc.documentElement.childNodes[1].firstChild.data.split("\n");
			return { parseError : {
				errorCode	: -9999999,
				reason		: aReason[0],
				srcText		: srcText[0],
				line		: matches[1],
				linepos		: matches[2],
				url		: aReason[1]
			} };
		} else {
			if (objDTD) {
				xmlDoc.parseError = objDTD.assert(xmlDoc.documentElement);
			} else {
				xmlDoc.parseError = { errorCode : 0 }
			}
			return xmlDoc;
		}
	}
	// ie
	if (window.ActiveXObject) {
		var strXml = "<?xml version=\"1.0\" ?>\n";
		var xmlDoc = new ActiveXObject(XML_Document.getDomDocumentPrefix() + ".DomDocument");
		xmlDoc.async = false;
		xmlDoc.validateOnParse = true;
		var bUseNativeValidation = (typeof bUseNativeValidation == "boolean") ? bUseNativeValidation : true;
		if (bUseNativeValidation) {
			if (objDTD) {
				if (!objDTD.cachedStringContent) {
					objDTD.cachedStringContent = objDTD.toString();
				}
				strXml += objDTD.cachedStringContent;
			}
			strXml += strXmlDocumentElement;
			xmlDoc.loadXML(strXml);
		} else {
			strXml += strXmlDocumentElement;
			xmlDoc.loadXML(strXml);
			if (objDTD && xmlDoc.parseError.errorCode == 0) {
				var parseError = objDTD.assert(xmlDoc.documentElement);
				if (parseError.errorCode != 0) {
					return { parseError : parseError };
				}
			}
		}
		return xmlDoc;
	}
	throw new Error("Your browser does not support XmlDocument objects");
};
/**
  * Applies missing methods to mozilla's implementation of XmlDocument
  * Please note that even though the attribute .xml thus gets available on the document,
  * it will not be for each node. To get the xml-representation of a node you should use
  * XML_Document.getXML(node)
  */
XML_Document.__extendMoz = function(xmlDoc) {
	if (xmlDoc .readyState == null) {
		xmlDoc.readyState = 1;
		xmlDoc.addEventListener("load", function () {
			xmlDoc.readyState = 4;
			if (typeof xmlDoc.onreadystatechange == "function")
				xmlDoc.onreadystatechange();
		}, false);
	}

	xmlDoc.__defineGetter__("xml", function () {
		return (new XMLSerializer()).serializeToString(this);
	});
	xmlDoc.loadXML = function (s) {
		var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
		while (this.hasChildNodes())
			this.removeChild(this.lastChild);
		for (var i=0,a=doc2.childNodes,l=a.length; i < l; ++i) {
			this.appendChild(this.importNode(a[i], true));
		}
	};
	/**
	  * Note that there are differences between the returned result
	  * In IE
	  */
	xmlDoc.transformNode = function(xslDoc) {
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xslDoc);
		var doc = xsltProcessor.transformToDocument(this);
		return XML_Document.getXML(doc);
	};
	return xmlDoc;
};
