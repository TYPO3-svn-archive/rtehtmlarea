// Copyright by Troels Knak-Nielsen, 2004
//
// Distributed under the terms of LGPL version 2.1
// http://www.opensource.org/licenses/lgpl-license.php
// This notice MUST stay intact for use
//
// author : troels@kyberfabrikken.dk

XML_Utility = {};

XML_Utility.RegExpCache = [
/*00*/	new RegExp().compile(/[< ]+([^= ]+)/gi),
/*01*/	new RegExp().compile(/(\S*\s*=\s*)?_moz[^=>]*(=\s*[^>]*)?/gi),
/*02*/	new RegExp().compile(/\s*=\s*(['"])?(([^>" ]| (?=[^"=]+['"]))+)\1?/gi),
/*03*/	new RegExp().compile(/\/>/g),
/*04*/	new RegExp().compile(/<(br|hr|img|input|link|meta)([^>]*)>/g),
/*05*/	new RegExp().compile(/(checked|compact|declare|defer|disabled|ismap|multiple|no(href|resize|shade|wrap)|readonly|selected)/gi),
/*06*/	new RegExp().compile(/(="[^']*)'([^'"]*")/),
/*07*/	new RegExp().compile(/&(?=[^<]*>)/g),
/*08*/	new RegExp().compile(/<\s+/g),
/*09*/	new RegExp().compile(/\s+(\/)?>/g),
/*10*/	new RegExp().compile(/\s{2,}/g),
/*11*/	new RegExp().compile(/&\w*;/g),
/*12*/	new RegExp().compile(/^<body>\s*/gi),
/*13*/	new RegExp().compile(/\s*<\/body>/gi),
/*14*/	new RegExp().compile(/<\/?(div|p|table|tr|td|th|ul|ol|li|br|hr|img)[^>]*>/g),
/*15*/	new RegExp().compile(/<\/(div|p|table|tr|td|th|ul|ol|li)[^>]*>/g),
/*16*/	new RegExp().compile(/<(div|p|table|tr|td|th|ul|ol|li)[^>]*>/g),
/*17*/	new RegExp().compile(/<(br|hr|img)[^>]*>/g)
];

/* Used by XML_Utility.replaceEntities */
XML_Utility.namedEntities = [];

// xhtml-special
XML_Utility.namedEntities["&quot;"] = "&#34;";
XML_Utility.namedEntities["&amp;"] = "&#38;";
XML_Utility.namedEntities["&lt;"] = "&#60;";
XML_Utility.namedEntities["&gt;"] = "&#62;";
XML_Utility.namedEntities["&apos;"] = "&#39;";
XML_Utility.namedEntities["&OElig;"] = "&#338;";
XML_Utility.namedEntities["&oelig;"] = "&#339;";
XML_Utility.namedEntities["&Scaron;"] = "&#352;";
XML_Utility.namedEntities["&scaron;"] = "&#353;";
XML_Utility.namedEntities["&Yuml;"] = "&#376;";
XML_Utility.namedEntities["&circ;"] = "&#710;";
XML_Utility.namedEntities["&tilde;"] = "&#732;";
XML_Utility.namedEntities["&ensp;"] = "&#8194;";
XML_Utility.namedEntities["&emsp;"] = "&#8195;";
XML_Utility.namedEntities["&thinsp;"] = "&#8201;";
XML_Utility.namedEntities["&zwnj;"] = "&#8204;";
XML_Utility.namedEntities["&zwj;"] = "&#8205;";
XML_Utility.namedEntities["&lrm;"] = "&#8206;";
XML_Utility.namedEntities["&rlm;"] = "&#8207;";
XML_Utility.namedEntities["&ndash;"] = "&#8211;";
XML_Utility.namedEntities["&mdash;"] = "&#8212;";
XML_Utility.namedEntities["&lsquo;"] = "&#8216;";
XML_Utility.namedEntities["&rsquo;"] = "&#8217;";
XML_Utility.namedEntities["&sbquo;"] = "&#8218;";
XML_Utility.namedEntities["&ldquo;"] = "&#8220;";
XML_Utility.namedEntities["&rdquo;"] = "&#8221;";
XML_Utility.namedEntities["&bdquo;"] = "&#8222;";
XML_Utility.namedEntities["&dagger;"] = "&#8224;";
XML_Utility.namedEntities["&Dagger;"] = "&#8225;";
XML_Utility.namedEntities["&permil;"] = "&#8240;";
XML_Utility.namedEntities["&lsaquo;"] = "&#8249;";
XML_Utility.namedEntities["&rsaquo;"] = "&#8250;";
XML_Utility.namedEntities["&euro;"] = "&#8364;";

// xhtml-lat1
XML_Utility.namedEntities["&nbsp;"] = "&#160;";
XML_Utility.namedEntities["&iexcl;"] = "&#161;";
XML_Utility.namedEntities["&cent;"] = "&#162;";
XML_Utility.namedEntities["&pound;"] = "&#163;";
XML_Utility.namedEntities["&curren;"] = "&#164;";
XML_Utility.namedEntities["&yen;"] = "&#165;";
XML_Utility.namedEntities["&brvbar;"] = "&#166;";
XML_Utility.namedEntities["&sect;"] = "&#167;";
XML_Utility.namedEntities["&uml;"] = "&#168;";
XML_Utility.namedEntities["&copy;"] = "&#169;";
XML_Utility.namedEntities["&ordf;"] = "&#170;";
XML_Utility.namedEntities["&laquo;"] = "&#171;";
XML_Utility.namedEntities["&not;"] = "&#172;";
XML_Utility.namedEntities["&shy;"] = "&#173;";
XML_Utility.namedEntities["&reg;"] = "&#174;";
XML_Utility.namedEntities["&macr;"] = "&#175;";
XML_Utility.namedEntities["&deg;"] = "&#176;";
XML_Utility.namedEntities["&plusmn;"] = "&#177;";
XML_Utility.namedEntities["&sup2;"] = "&#178;";
XML_Utility.namedEntities["&sup3;"] = "&#179;";
XML_Utility.namedEntities["&acute;"] = "&#180;";
XML_Utility.namedEntities["&micro;"] = "&#181;";
XML_Utility.namedEntities["&para;"] = "&#182;";
XML_Utility.namedEntities["&middot;"] = "&#183;";
XML_Utility.namedEntities["&cedil;"] = "&#184;";
XML_Utility.namedEntities["&sup1;"] = "&#185;";
XML_Utility.namedEntities["&ordm;"] = "&#186;";
XML_Utility.namedEntities["&raquo;"] = "&#187;";
XML_Utility.namedEntities["&frac14;"] = "&#188;";
XML_Utility.namedEntities["&frac12;"] = "&#189;";
XML_Utility.namedEntities["&frac34;"] = "&#190;";
XML_Utility.namedEntities["&iquest;"] = "&#191;";
XML_Utility.namedEntities["&Agrave;"] = "&#192;";
XML_Utility.namedEntities["&Aacute;"] = "&#193;";
XML_Utility.namedEntities["&Acirc;"] = "&#194;";
XML_Utility.namedEntities["&Atilde;"] = "&#195;";
XML_Utility.namedEntities["&Auml;"] = "&#196;";
XML_Utility.namedEntities["&Aring;"] = "&#197;";
XML_Utility.namedEntities["&AElig;"] = "&#198;";
XML_Utility.namedEntities["&Ccedil;"] = "&#199;";
XML_Utility.namedEntities["&Egrave;"] = "&#200;";
XML_Utility.namedEntities["&Eacute;"] = "&#201;";
XML_Utility.namedEntities["&Ecirc;"] = "&#202;";
XML_Utility.namedEntities["&Euml;"] = "&#203;";
XML_Utility.namedEntities["&Igrave;"] = "&#204;";
XML_Utility.namedEntities["&Iacute;"] = "&#205;";
XML_Utility.namedEntities["&Icirc;"] = "&#206;";
XML_Utility.namedEntities["&Iuml;"] = "&#207;";
XML_Utility.namedEntities["&ETH;"] = "&#208;";
XML_Utility.namedEntities["&Ntilde;"] = "&#209;";
XML_Utility.namedEntities["&Ograve;"] = "&#210;";
XML_Utility.namedEntities["&Oacute;"] = "&#211;";
XML_Utility.namedEntities["&Ocirc;"] = "&#212;";
XML_Utility.namedEntities["&Otilde;"] = "&#213;";
XML_Utility.namedEntities["&Ouml;"] = "&#214;";
XML_Utility.namedEntities["&times;"] = "&#215;";
XML_Utility.namedEntities["&Oslash;"] = "&#216;";
XML_Utility.namedEntities["&Ugrave;"] = "&#217;";
XML_Utility.namedEntities["&Uacute;"] = "&#218;";
XML_Utility.namedEntities["&Ucirc;"] = "&#219;";
XML_Utility.namedEntities["&Uuml;"] = "&#220;";
XML_Utility.namedEntities["&Yacute;"] = "&#221;";
XML_Utility.namedEntities["&THORN;"] = "&#222;";
XML_Utility.namedEntities["&szlig;"] = "&#223;";
XML_Utility.namedEntities["&agrave;"] = "&#224;";
XML_Utility.namedEntities["&aacute;"] = "&#225;";
XML_Utility.namedEntities["&acirc;"] = "&#226;";
XML_Utility.namedEntities["&atilde;"] = "&#227;";
XML_Utility.namedEntities["&auml;"] = "&#228;";
XML_Utility.namedEntities["&aring;"] = "&#229;";
XML_Utility.namedEntities["&aelig;"] = "&#230;";
XML_Utility.namedEntities["&ccedil;"] = "&#231;";
XML_Utility.namedEntities["&egrave;"] = "&#232;";
XML_Utility.namedEntities["&eacute;"] = "&#233;";
XML_Utility.namedEntities["&ecirc;"] = "&#234;";
XML_Utility.namedEntities["&euml;"] = "&#235;";
XML_Utility.namedEntities["&igrave;"] = "&#236;";
XML_Utility.namedEntities["&iacute;"] = "&#237;";
XML_Utility.namedEntities["&icirc;"] = "&#238;";
XML_Utility.namedEntities["&iuml;"] = "&#239;";
XML_Utility.namedEntities["&eth;"] = "&#240;";
XML_Utility.namedEntities["&ntilde;"] = "&#241;";
XML_Utility.namedEntities["&ograve;"] = "&#242;";
XML_Utility.namedEntities["&oacute;"] = "&#243;";
XML_Utility.namedEntities["&ocirc;"] = "&#244;";
XML_Utility.namedEntities["&otilde;"] = "&#245;";
XML_Utility.namedEntities["&ouml;"] = "&#246;";
XML_Utility.namedEntities["&divide;"] = "&#247;";
XML_Utility.namedEntities["&oslash;"] = "&#248;";
XML_Utility.namedEntities["&ugrave;"] = "&#249;";
XML_Utility.namedEntities["&uacute;"] = "&#250;";
XML_Utility.namedEntities["&ucirc;"] = "&#251;";
XML_Utility.namedEntities["&uuml;"] = "&#252;";
XML_Utility.namedEntities["&yacute;"] = "&#253;";
XML_Utility.namedEntities["&thorn;"] = "&#254;";
XML_Utility.namedEntities["&yuml;"] = "&#255;";

/**
  * Replaces named entities with numeric representations
  * Currently supported charsets are : xhtml-special, xhtml-lat1
  */
XML_Utility.replaceEntities = function(sHtml) {
	return sHtml.replace(
		XML_Utility.RegExpCache[11],
		function(ent) {
			var e = XML_Utility.namedEntities[ent];
			if (typeof e == "undefined") {
				return "?";
			} else {
				return e;
			}
		}
	);
};

/**
  * Returns the content between <body></body>
  */
XML_Utility.stripBody = function(s) {
	var c = XML_Utility.RegExpCache;
	return s.replace(c[12], "").replace(c[13], "");
};

/** 
  * Cleans HTML into wellformed xhtml
  *
  * A much faster way of retrieving the html-source of the document than the default supplied by HtmlArea
  * mishoo should feel free to copy this to the main distribution
  * credits goes to adios, who helped me out with this one :
  * http://www.sitepoint.com/forums/showthread.php?t=201052
  */
XML_Utility.cleanHTML = function(sHtml, bReplaceEntities) {
	var c = XML_Utility.RegExpCache;

	sHtml = sHtml.
		replace(c[0], function($1) { return $1.toLowerCase(); } ).
		replace(c[1], ' ').
		replace(c[2], '="$2"').
		replace(c[3], '>').
		replace(c[9], '$1>').
		replace(c[4], '<$1$2 />').
		replace(c[5], '$1="$1"').
		replace(c[6], '$1$2').
		replace(c[7], '&amp;').
		replace(c[8], '<').
		replace(c[10], ' ');
	if ((typeof(bReplaceEntities) == "boolean") ? bReplaceEntities : true) { // fix entities ? default = yes
		return XML_Utility.replaceEntities(sHtml);
	}
	return sHtml;
};

/**
  * Prettyfies html by inserting linebreaks before tags, and indenting blocklevel tags
  *
  * @todo    linebreaks are not preserved in preformatted tags, witch likely will cause trouble.
  *          some unmotivated extra whitespaces ends up at the end of lines. not really a problem, but
  *          annoying none the less.
  */
XML_Utility.indent = function(s, sindentChar) {
	XML_Utility.__nindent = 0;
	XML_Utility.__sindent = "";
	XML_Utility.__sindentChar = (typeof sindentChar == "undefined") ? "  " : sindentChar;
	var c = XML_Utility.RegExpCache;
	s = s.replace(/\n/gi, "").replace(c[14], function($1) {
			if ($1.match(c[16])) {
				var s = "\n" + XML_Utility.__sindent + $1;
				// blocklevel openingtag - increase indent
				XML_Utility.__sindent += XML_Utility.__sindentChar;
				++XML_Utility.__nindent;
				return s;
			} else if ($1.match(c[15])) {
				// blocklevel closingtag - decrease indent
				--XML_Utility.__nindent;
				XML_Utility.__sindent = "";
				for (var i=XML_Utility.__nindent;i>0;--i) {
					XML_Utility.__sindent += XML_Utility.__sindentChar;
				}
				return "\n" + XML_Utility.__sindent + $1;
			} else if ($1.match(c[17])) {
				// singlet tag
				return "\n" + XML_Utility.__sindent + $1;
			}
			return $1; // this won't actually happen
			});
	if (s.charAt(0) == "\n") {
		return s.substring(1, s.length);
	}
	return s;
};