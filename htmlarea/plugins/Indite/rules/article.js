Indite.__aRules["article"] = {
	dtd : new DTD_Document("body"),
	xsl : XML_Document.create()
};
Indite.__aRules["article"].xsl.load(_editor_url + "plugins/Indite/rules/article.xsl" + "?" + (new Date()).getTime() );

var dtd = Indite.__aRules["article"].dtd;

dtd.createElement("body");
dtd.elements["body"].addElement("h2");
dtd.elements["body"].addElement("p");
dtd.elements["body"].addElement("pre");
dtd.elements["body"].addElement("ul");
dtd.elements["body"].addElement("ol");

dtd.createElement("h2");
dtd.elements["h2"].addElement("#PCDATA");

dtd.createElement("p");
dtd.elements["p"].addElement("#PCDATA");
dtd.elements["p"].addElement("b");
dtd.elements["p"].addElement("i");
dtd.elements["p"].addElement("strike");
dtd.elements["p"].addElement("sub");
dtd.elements["p"].addElement("sup");
dtd.elements["p"].addElement("a");
dtd.elements["p"].addElement("br");
dtd.elements["p"].addElement("img");

dtd.createElement("pre");
dtd.elements["pre"].addElement("#PCDATA");
dtd.elements["pre"].addElement("b");
dtd.elements["pre"].addElement("i");
dtd.elements["pre"].addElement("strike");
dtd.elements["pre"].addElement("sub");
dtd.elements["pre"].addElement("sup");
dtd.elements["pre"].addElement("a");

dtd.createElement("ul");
dtd.elements["ul"].addElement("li");

dtd.createElement("ol");
dtd.elements["ol"].addElement("li");

dtd.createElement("li");
dtd.elements["li"].addElement("#PCDATA");
dtd.elements["li"].addElement("b");
dtd.elements["li"].addElement("i");
dtd.elements["li"].addElement("strike");
dtd.elements["li"].addElement("sub");
dtd.elements["li"].addElement("sup");
dtd.elements["li"].addElement("a");
dtd.elements["li"].addElement("br");

dtd.createElement("b");
dtd.elements["b"].addElement("#PCDATA");
dtd.elements["b"].addElement("a");

dtd.createElement("i");
dtd.elements["i"].addElement("#PCDATA");
dtd.elements["i"].addElement("a");

dtd.createElement("strike");
dtd.elements["strike"].addElement("#PCDATA");
dtd.elements["strike"].addElement("a");

dtd.createElement("sub");
dtd.elements["sub"].addElement("#PCDATA");
dtd.elements["sub"].addElement("a");

dtd.createElement("sup");
dtd.elements["sup"].addElement("#PCDATA");
dtd.elements["sup"].addElement("a");

dtd.createElement("a");
dtd.elements["a"].addElement("#PCDATA");
dtd.elements["a"].addAttribute("href", true);
dtd.elements["a"].addAttribute("target", false);

dtd.createElement("br");
dtd.elements["br"].addElement("EMPTY");

dtd.createElement("img");
dtd.elements["img"].addElement("EMPTY");
dtd.elements["img"].addAttribute("src", true);
dtd.elements["img"].addAttribute("height", true);
dtd.elements["img"].addAttribute("width", true);
dtd.elements["img"].addAttribute("alt", true);
dtd.elements["img"].addAttribute("align", true);
