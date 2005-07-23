// Context Menu Plugin for TYPO3 htmlArea RTE
// Implementation by Mihai Bazon, http://dynarch.com/mishoo/. Sponsored by www.americanbible.org
// Substantially rewritten by Stanislas Rolland <stanislas.rolland(arobas)fructifor.com>. Sponsored by Fructifor Inc.
// Copyright (c) 2003 dynarch.com
// Copyright (c) 2004-2005 Stanislas Rolland
// This notice MUST stay intact for use (see license.txt).

ContextMenu = function(editor) {
	this.editor = editor;
	this.currentMenu = null;
	this.eventHandlers = {};
};

ContextMenu.I18N = ContextMenu_langArray;

ContextMenu._pluginInfo = {
	name          : "ContextMenu",
	version       : "1.5",
	developer     : "Mihai Bazon & Stanislas Rolland",
	developer_url : "http://dynarch.com/mishoo/",
	c_owner       : "dynarch.com",
	sponsor       : "American Bible Society & Fructifor Inc.",
	sponsor_url   : "http://www.americanbible.org",
	license       : "htmlArea"
};

ContextMenu.prototype.onGenerate = function() {
	this.editor.eventHandlers["contextMenu"] = ContextMenu.contextMenuHandler(this);
	HTMLArea._addEvent(this.editor._doc, "contextmenu", this.editor.eventHandlers["contextMenu"]);
};

ContextMenu.contextMenuHandler = function(instance) {
	return (function(ev) {
		instance.popupMenu(ev);
	});
};

ContextMenu.tableOperationsHandler = function(editor,tbo,opcode) {
	return (function() {
		tbo.buttonPress(editor,opcode);
	});
};

ContextMenu.imageHandler = function(editor,img) {
	return (function() {
		editor._insertImage(img);
	});
};

ContextMenu.linkHandler = function(editor,link,opcode) {
	switch (opcode) {
		case "ModifyLink":
			return (function() {
				editor.execCommand("CreateLink", true);
			});
		case "CheckLink":
			return (function() {
				window.open(link.href);
			});
		case "RemoveLink":
			return (function() {
				if (confirm(ContextMenu.I18N["Please confirm that you want to unlink this element."] + "\n" +
					ContextMenu.I18N["Link points to:"] + " " + link.href)) {
						while(link.firstChild) link.parentNode.insertBefore(link.firstChild, link);
						link.parentNode.removeChild(link);
				}
			});
	}
};

ContextMenu.execCommandHandler = function(editor,opcode) {
	return (function() {
		editor.execCommand(opcode);
	});
};

ContextMenu.insertParagraphHandler = function(editor,currentTarget,after) {
	return (function() {
		var el = currentTarget;
		var par = el.parentNode;
		var p = editor._doc.createElement("p");
		p.appendChild(editor._doc.createElement("br"));
		par.insertBefore(p, after ? el.nextSibling : el);
		var sel = editor._getSelection();
		var range = editor._createRange(sel);
		if(HTMLArea.is_gecko) {
			range.selectNodeContents(p);
			range.collapse(true);
			if(HTMLArea.is_safari) {
				sel.empty();
				sel.setBaseAndExtent(range.startContainer,range.startOffset,range.endContainer,range.endOffset);
			} else {
				sel.removeAllRanges();
				sel.addRange(range);
			}
		} else {
			range.moveToElementText(p);
			range.collapse(true);
			range.select();
		}
	});
};

ContextMenu.deleteElementHandler = function(editor,tmp,table) {
	return (function() {
		if(confirm(ContextMenu.I18N["Please confirm that you want to remove this element:"] + " " + tmp.tagName.toLowerCase())) {
			var el = tmp;
			var p = el.parentNode;
			p.removeChild(el);
			if(HTMLArea.is_gecko) {
				if(p.tagName.toLowerCase() == "td" && !p.hasChildNodes()) p.appendChild(editor._doc.createElement("br"));
				editor.forceRedraw();
				editor.focusEditor();
				editor.updateToolbar();
				if(table) {
					var save_collapse = table.style.borderCollapse;
					table.style.borderCollapse = "collapse";
					table.style.borderCollapse = "separate";
					table.style.borderCollapse = save_collapse;
				}
			}
		}
	});
};

ContextMenu.prototype.getContextMenu = function(target) {
	var editor = this.editor;
	var config = editor.config;
	var menu = [];
	var handlerFunctRef, opcode;
	var tbo = this.editor.plugins["TableOperations"];
	if(tbo) tbo = tbo.instance;

	var selection = editor.hasSelectedText();
	if(selection) {
		if(editor._toolbarObjects['Cut'] && editor._toolbarObjects['Cut'].enabled)  {
			opcode = "Cut";
			handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
			menu.push([ContextMenu.I18N[opcode], handlerFunctRef, null, config.btnList[opcode][1], opcode]);
		}
		if(editor._toolbarObjects['Copy'] && editor._toolbarObjects['Copy'].enabled) {
			opcode = "Copy";
			handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
			menu.push([ContextMenu.I18N[opcode], handlerFunctRef, null, config.btnList[opcode][1], opcode]);
		}
	}
	if(editor._toolbarObjects['Paste'] && editor._toolbarObjects['Paste'].enabled) {
		opcode = "Paste";
		handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
		menu.push([ContextMenu.I18N[opcode], handlerFunctRef, null, config.btnList[opcode][1], opcode]);
	}
	
	var currentTarget = target,
		elmenus = [], tmp, tag, link = false,
		table = null, tr = null, td = null, img = null, list = null;
	
	for(; target; target = target.parentNode) {
		tag = target.tagName;
		if(!tag) continue;
		tag = tag.toLowerCase();
		switch (tag) {
		    case "img":
			img = target;
			if(editor._toolbarObjects["InsertImage"] && editor._toolbarObjects["InsertImage"].enabled)  {
				handlerFunctRef = ContextMenu.imageHandler(editor, img);
				elmenus.push(null,
				     [ContextMenu.I18N["Image Properties"],
				       handlerFunctRef, ContextMenu.I18N["Show the image properties dialog"],
				       config.btnList["InsertImage"][1],"InsertImage"]
				);
			}
			break;
		    case "a":
			link = target;
			if(editor._toolbarObjects["CreateLink"] && editor._toolbarObjects["CreateLink"].enabled)  {
				opcode = "ModifyLink";
				var modifyLinkHandlerFunctRef = ContextMenu.linkHandler(editor, link, opcode);
				opcode = "CheckLink";
				var checkLinkHandlerFunctRef = ContextMenu.linkHandler(editor, link, opcode);
				opcode = "RemoveLink";
				var removeLinkHandlerFunctRef = ContextMenu.linkHandler(editor, link, opcode);
				elmenus.push(null,
					[ContextMenu.I18N["Modify Link"],
						modifyLinkHandlerFunctRef, ContextMenu.I18N["Current URL is"] + ': ' + link.href,
						config.btnList["CreateLink"][1], "CreateLink"],
					[ContextMenu.I18N["Check Link"],
						checkLinkHandlerFunctRef, ContextMenu.I18N["Opens this link in a new window"],
						null, "CreateLink"],
					[ContextMenu.I18N["Remove Link"],
						removeLinkHandlerFunctRef, ContextMenu.I18N["Unlink the current element"],
						null, "CreateLink"]

				);
			}
			break;
		    case "td":
			td = target;
			if(!tbo) break;
			var cellPropEnabled = (editor._toolbarObjects['TO-cell-prop']  && editor._toolbarObjects['TO-cell-prop'].enabled);
			var cellInsertBeforeEnabled = (editor._toolbarObjects['TO-cell-insert-before']  && editor._toolbarObjects['TO-cell-insert-before'].enabled);
			var cellInsertAfterEnabled = (editor._toolbarObjects['TO-cell-insert-after']  && editor._toolbarObjects['TO-cell-insert-after'].enabled);
			var cellDeleteEnabled = (editor._toolbarObjects['TO-cell-delete']  && editor._toolbarObjects['TO-cell-delete'].enabled);
			var cellSplitEnabled = (editor._toolbarObjects['TO-cell-split']  && editor._toolbarObjects['TO-cell-split'].enabled);
			if(cellPropEnabled || cellInsertBeforeEnabled || cellInsertAfterEnabled || cellDeleteEnabled || cellSplitEnabled) elmenus.push(null);
			if(cellPropEnabled) {
				opcode = "TO-cell-prop";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Cell Properties"],
				handlerFunctRef, ContextMenu.I18N["Show the Table Cell Properties dialog"],
				config.btnList[opcode][1], opcode]);
			}
			if(cellInsertBeforeEnabled) {
				opcode = "TO-cell-insert-before";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Insert cell before"],
				handlerFunctRef, ContextMenu.I18N["Insert a new cell before the current one"],
				config.btnList[opcode][1], opcode]);
			}
			if(cellInsertAfterEnabled) {
				opcode = "TO-cell-insert-after";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Insert cell after"],
				handlerFunctRef, ContextMenu.I18N["Insert a new cell after the current one"],
				config.btnList[opcode][1], opcode]);
			}
			if(cellDeleteEnabled) {
				opcode = "TO-cell-delete";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Delete Cell"],
				handlerFunctRef, ContextMenu.I18N["Delete the current cell"],
				config.btnList[opcode][1], opcode]);
			}
			if(cellSplitEnabled) {
				opcode = "TO-cell-split";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Split Cell"],
				handlerFunctRef, ContextMenu.I18N["Split the current cell"],
				config.btnList[opcode][1], opcode]);
			}
			break;
		    case "tr":
			tr = target;
			if(!tbo) break;
			var cellMergeEnabled = (editor._toolbarObjects['TO-cell-merge']  && editor._toolbarObjects['TO-cell-merge'].enabled);
			var rowPropEnabled = (editor._toolbarObjects['TO-row-prop']  && editor._toolbarObjects['TO-row-prop'].enabled);
			var rowInsertBeforeEnabled = (editor._toolbarObjects['TO-row-insert-above'] && editor._toolbarObjects['TO-row-insert-above'].enabled);
			var rowInsertAfterEnabled = (editor._toolbarObjects['TO-row-insert-under'] && editor._toolbarObjects['TO-row-insert-under'].enabled);
			var rowDeleteEnabled = (editor._toolbarObjects['TO-row-delete'] && editor._toolbarObjects['TO-row-delete'].enabled);
			var rowSplitEnabled = (editor._toolbarObjects['TO-row-split'] && editor._toolbarObjects['TO-row-split'].enabled);
			if(cellMergeEnabled) {
				opcode = "TO-cell-merge";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Merge Cells"],
				handlerFunctRef, ContextMenu.I18N["Merge the selected cells"],
				config.btnList[opcode][1], opcode]);
			}
			if(rowPropEnabled || rowInsertBeforeEnabled || rowInsertAfterEnabled || rowDeleteEnabled || rowSplitEnabled) elmenus.push(null);
			if(rowPropEnabled) {
				opcode = "TO-row-prop";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Row Properties"],
				handlerFunctRef, ContextMenu.I18N["Show the Table Row Properties dialog"],
				config.btnList[opcode][1], opcode]);
			}
			if(rowInsertBeforeEnabled) {
				opcode = "TO-row-insert-above";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Insert Row Before"],
				handlerFunctRef, ContextMenu.I18N["Insert a new row before the current one"],
				config.btnList[opcode][1], opcode]);
			}
			if(rowInsertAfterEnabled) {
				opcode = "TO-row-insert-under";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Insert Row After"],
				handlerFunctRef, ContextMenu.I18N["Insert a new row after the current one"],
				config.btnList[opcode][1], opcode]);
			}
			if(rowDeleteEnabled) {
				opcode = "TO-row-delete";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Delete Row"],
				handlerFunctRef, ContextMenu.I18N["Delete the current row"],
				config.btnList[opcode][1], opcode]);
			}
			if(rowSplitEnabled) {
				opcode = "TO-row-split";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Split Row"],
				handlerFunctRef, ContextMenu.I18N["Split the current row"],
				config.btnList[opcode][1], opcode]);
			}
			break;
		    case "table":
			table = target;
			if(!tbo) break;
			var tablePropEnabled = (editor._toolbarObjects['TO-table-prop']  && editor._toolbarObjects['TO-table-prop'].enabled);
			var colInsertBeforeEnabled = (editor._toolbarObjects['TO-col-insert-before'] && editor._toolbarObjects['TO-col-insert-before'].enabled);
			var colInsertAfterEnabled = (editor._toolbarObjects['TO-col-insert-after'] && editor._toolbarObjects['TO-col-insert-after'].enabled);
			var colDeleteEnabled = (editor._toolbarObjects['TO-col-delete'] && editor._toolbarObjects['TO-col-delete'].enabled);
			var colSplitEnabled = (editor._toolbarObjects['TO-col-split'] && editor._toolbarObjects['TO-col-split'].enabled);
			if(colInsertBeforeEnabled || colInsertAfterEnabled || colDeleteEnabled || colSplitEnabled) elmenus.push(null);
			if(colInsertBeforeEnabled) {
				opcode = "TO-col-insert-before";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Insert Column Before"],
				handlerFunctRef, ContextMenu.I18N["Insert a new column before the current one"],
				config.btnList[opcode][1], opcode]);
			}
			if(colInsertAfterEnabled) {
				opcode = "TO-col-insert-after";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Insert Column After"],
				handlerFunctRef, ContextMenu.I18N["Insert a new column after the current one"],
				config.btnList[opcode][1], opcode]);
			}
			if(colDeleteEnabled) {
				opcode = "TO-col-delete";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Delete Column"],
				handlerFunctRef, ContextMenu.I18N["Delete the current column"],
				config.btnList[opcode][1], opcode]);
			}
			if(colSplitEnabled) {
				opcode = "TO-col-split";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push([ContextMenu.I18N["Split Column"],
				handlerFunctRef, ContextMenu.I18N["Split the current column"],
  				config.btnList[opcode][1], opcode]);
			}
			if(tablePropEnabled) {
				opcode = "TO-table-prop";
				handlerFunctRef = ContextMenu.tableOperationsHandler(editor,tbo,opcode);
				elmenus.push(null,[ContextMenu.I18N["Table Properties"],
				handlerFunctRef, ContextMenu.I18N["Show the Table Properties dialog"],
				config.btnList[opcode][1], opcode]);
			}
			break;
		    case "ol":
		    case "ul":
		    case "dl":
			list = target;
			break;
		    case "body":
			var justifyLeftEnabled = (editor._toolbarObjects['JustifyLeft'] && editor._toolbarObjects['JustifyLeft'].enabled);
			var justifyCenterEnabled = (editor._toolbarObjects['JustifyCenter'] && editor._toolbarObjects['JustifyCenter'].enabled);
			var justifyRightEnabled = (editor._toolbarObjects['JustifyRight'] && editor._toolbarObjects['JustifyRight'].enabled);
			var justifyFullEnabled = (editor._toolbarObjects['JustifyFull'] && editor._toolbarObjects['JustifyFull'].enabled);
			if(justifyLeftEnabled || justifyCenterEnabled || justifyRightEnabled || justifyFullEnabled) elmenus.push(null);
			if(justifyLeftEnabled) {
				opcode = "JustifyLeft";
				handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
				elmenus.push([ContextMenu.I18N["Justify Left"],
				handlerFunctRef, null,
				config.btnList[opcode][1], opcode]);
			}
			if(justifyCenterEnabled) {
				opcode = "JustifyCenter";
				handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
				elmenus.push([ContextMenu.I18N["Justify Center"],
				handlerFunctRef, null,
				config.btnList[opcode][1], opcode]);
			}
			if(justifyRightEnabled) {
				opcode = "JustifyRight";
				handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
				elmenus.push([ContextMenu.I18N["Justify Right"],
				handlerFunctRef, null,
				config.btnList[opcode][1], opcode]);
			}
			if(justifyFullEnabled) {
				opcode = "JustifyFull";
				handlerFunctRef = ContextMenu.execCommandHandler(editor, opcode);
				elmenus.push([ContextMenu.I18N["Justify Full"],
				handlerFunctRef, null,
				config.btnList[opcode][1], opcode]);
			}
			break;
		}
	}
	
	if (selection && !link) menu.push(null,[ContextMenu.I18N["Make link"],
				  function(){editor.execCommand("CreateLink",true);},ContextMenu.I18N["Create a link"],
				  config.btnList["CreateLink"][1],"CreateLink"]);

	for (var i = 0; i < elmenus.length; ++i) menu.push(elmenus[i]);

	if (!/html|body/i.test(currentTarget.tagName)) {
		if(table) {
			tmp = table;
			table = null;
		} else if(list) {
			tmp = list;
			list = null;
		} else {
			tmp = currentTarget;
		}
		handlerFunctRef = ContextMenu.deleteElementHandler(editor, tmp, table);
		var insertParBeforeHandlerFunctRef = ContextMenu.insertParagraphHandler(editor, tmp, false);
		var insertParAfterHandlerFunctRef = ContextMenu.insertParagraphHandler(editor, tmp, true);
		menu.push(null,
		  [ContextMenu.I18N["Remove the"] + " &lt;" + tmp.tagName.toLowerCase() + "&gt; " + ContextMenu.I18N["Element"],
			handlerFunctRef, ContextMenu.I18N["Remove this node from the document"]],
		  [ContextMenu.I18N["Insert paragraph before"],
			insertParBeforeHandlerFunctRef, ContextMenu.I18N["Insert a paragraph before the current node"]],
		  [ContextMenu.I18N["Insert paragraph after"],
			insertParAfterHandlerFunctRef, ContextMenu.I18N["Insert a paragraph after the current node"]]
		);
	}
	return menu;
};

ContextMenu.mouseOverHandler = function(editor,item) {
	return (function() {
		item.className += " hover";
		editor._statusBarTree.innerHTML = item.__msh.tooltip || '&nbsp;';
	});
};

ContextMenu.mouseOutHandler = function(item) {
	return (function() {
		item.className = item.className.replace(/hover/,"");
	});
};

ContextMenu.itemContextMenuHandler = function(item) {
	return (function(ev) {
		item.__msh.activate();
		if(!HTMLArea.is_ie) HTMLArea._stopEvent(ev);
		return false;
	});
};

ContextMenu.mouseDownHandler = function(item) {
	return (function(ev) {
		HTMLArea._stopEvent(ev);
		return false;
	});
};

ContextMenu.mouseUpHandler = function(item,instance) {
	return (function(ev) {
		var timeStamp = (new Date()).getTime();
		if (timeStamp - instance.timeStamp > 500) item.__msh.activate();
		if (!HTMLArea.is_ie) HTMLArea._stopEvent(ev);
		instance.editor.updateToolbar();
		return false;
	});
};

ContextMenu.activateHandler = function(item,instance,keys) {
	return (function() {
		instance.closeMenu(keys);
		item.__msh.action();
	});
};

ContextMenu.documentClickHandler = function(instance,keys) {
	return (function(ev) {
		if (!ev) var ev = window.event;
		if (!instance.currentMenu) {
			alert(ContextMenu.I18N["How did you get here? (Please report!)"]);
			return false;
		}
		var el = (ev.target) ? ev.target : ev.srcElement;
		for (; el != null && el != instance.currentMenu; el = el.parentNode);
		if (el == null) { 
			instance.closeMenu(keys);
			instance.editor.updateToolbar();
		}
	});
};

ContextMenu.keyPressHandler = function(instance,keys) {
	return (function(ev) {
		if (!ev) var ev = window.event;
		HTMLArea._stopEvent(ev);
		if (ev.keyCode == 27) {
			instance.closeMenu(keys);
			return false;
		}
		var key = String.fromCharCode(HTMLArea.is_ie ? ev.keyCode : ev.charCode).toLowerCase();
		for (var i = keys.length; --i >= 0;) {
			var k = keys[i];
			if (k[0].toLowerCase() == key) k[1].__msh.activate();
		}
	});
};

ContextMenu.prototype.closeMenu = function(keys) {
	this.currentMenu.parentNode.removeChild(this.currentMenu);
	this.currentMenu = null;
	HTMLArea._removeEvent(document, "mousedown", this.eventHandlers["documentClick"]);
	HTMLArea._removeEvent(this.editor._doc, "mousedown", this.eventHandlers["documentClick"]);
	if (keys.length > 0) HTMLArea._removeEvent(this.editor._doc, "keypress", this.eventHandlers["keyPress"]);
	for (var handler in this.eventHandlers) this.eventHandlers[handler] = null;
	var doc = document;
	if (HTMLArea.is_ie) doc = this.iePopup.document;
	var e, i = 0;
	while ( e = doc.getElementsByTagName("li").item(i++) ) {
		if ( e.__msh ) {
			HTMLArea._removeEvent(e, "mouseover", e.__msh.mouseover);
			HTMLArea._removeEvent(e, "mouseout", e.__msh.mouseout);
			HTMLArea._removeEvent(e, "contextmenu", e.__msh.contextmenu);
			if (!HTMLArea.is_ie) HTMLArea._removeEvent(e, "mousedown", e.__msh.mousedown);
			HTMLArea._removeEvent(e, "mouseup", e.__msh.mouseup);
			e.__msh = null;
		}
	}
	if (HTMLArea.is_ie) this.iePopup.hide();
};

ContextMenu.prototype.popupMenu = function(ev,target) {
	var editor = this.editor;
	if (!ev) var ev = window.event;
	if (!target) var target = (ev.target) ? ev.target : ev.srcElement;
	if (this.currentMenu) this.currentMenu.parentNode.removeChild(this.currentMenu);
	function getPos(el) {
		var r = { x: el.offsetLeft, y: el.offsetTop };
		if (el.offsetParent) {
			var tmp = getPos(el.offsetParent);
			r.x += tmp.x;
			r.y += tmp.y;
		}
		return r;
	};
	var keys = [];
	var ifpos = getPos(this.editor._iframe);
	var x = ev.clientX + ifpos.x;
	var y = ev.clientY + ifpos.y;

	var doc, list, separator = false;

	if (!HTMLArea.is_ie) {
		doc = document;
	} else {
		var popup = this.iePopup = window.createPopup();
		doc = popup.document;
		var head = doc.getElementsByTagName("head")[0];
 		var link = doc.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		if ( _editor_CSS.indexOf("http") == -1 ) link.href = _typo3_host_url + _editor_CSS;
			else link.href = _editor_CSS;
		head.appendChild(link);
	}

	list = doc.createElement("ul");
	list.className = "htmlarea-context-menu";
	doc.body.appendChild(list);
	
	var options = this.getContextMenu(target);
	for (var i=0; i < options.length; ++i) {
		var option = options[i];
		if (!option){
			separator = true;
		} else {
			var item = doc.createElement("li");
			list.appendChild(item);
			var label = option[0];
			if(separator) {
				item.className += " separator";
				separator = false;
			}
			var handlerFunctRef = ContextMenu.activateHandler(item, this, keys);
			item.__msh = {
				item:		item,
				label:		label,
				action:		option[1],
				tooltip:	option[2] || null,
				icon:		option[3] || null,
				activate:	handlerFunctRef,
				cmd:		option[4] || null
			};
			label = label.replace(/_([a-zA-Z0-9])/, "<u>$1</u>");
			if (label != option[0]) keys.push([ RegExp.$1, item ]);
			label = label.replace(/__/, "_");
			var button = doc.createElement("button");
			button.className = "button";
			if(item.__msh.cmd) {
				button.className += " " + item.__msh.cmd;
				if(typeof(editor.plugins["TYPO3Browsers"]) != "undefined" && (item.__msh.cmd == "CreateLink" || item.__msh.cmd == "InsertImage")) button.className += "-TYPO3Browsers";
				button.innerHTML = label;
			} else if(item.__msh.icon) {
				button.innerHTML = "<img src='" + item.__msh.icon + "' />" + label;
			} else {
				button.innerHTML = label;
			}
			item.appendChild(button);

			handlerFunctRef = ContextMenu.mouseOverHandler(editor, item);
			item.__msh.mouseover = handlerFunctRef;
			HTMLArea._addEvent(item, "mouseover", handlerFunctRef);
			handlerFunctRef = ContextMenu.mouseOutHandler(item);
			item.__msh.mouseout = handlerFunctRef;
			HTMLArea._addEvent(item, "mouseout", handlerFunctRef);
			handlerFunctRef = ContextMenu.itemContextMenuHandler(item);
			item.__msh.contextmenu = handlerFunctRef;
			HTMLArea._addEvent(item, "contextmenu", handlerFunctRef);
			if(!HTMLArea.is_ie) {
				handlerFunctRef = ContextMenu.mouseDownHandler(item);
				item.__msh.mousedown = handlerFunctRef;
				HTMLArea._addEvent(item, "mousedown", handlerFunctRef);
			}
			handlerFunctRef = ContextMenu.mouseUpHandler(item, this);
			item.__msh.mouseup = handlerFunctRef;
			HTMLArea._addEvent(item, "mouseup", handlerFunctRef);
		}
	}
	if(!HTMLArea.is_ie) {
		var dx = x + list.offsetWidth - window.innerWidth - window.pageXOffset + 4;
		var dy = y + list.offsetHeight - window.innerHeight - window.pageYOffset + 4;
		if(dx > 0) x -= dx;
		if(dy > 0) y -= dy;
		list.style.left = x + "px";
		list.style.top = y + "px";
	} else {
			// determine the size
		list.style.left = "0px";
		list.style.top = "0px";
		var foobar = document.createElement("ul");
		foobar.className = "htmlarea-context-menu";
		foobar.innerHTML = list.innerHTML;
		document.body.appendChild(foobar);
		var w = foobar.clientWidth;
		var h = foobar.clientHeight;
		document.body.removeChild(foobar);
		this.iePopup.show(ev.screenX,ev.screenY,w,h);
	}
	this.currentMenu = list;
	this.timeStamp = (new Date()).getTime();
	this.eventHandlers["documentClick"] = ContextMenu.documentClickHandler(this, keys);
	HTMLArea._addEvent(document, "mousedown", this.eventHandlers["documentClick"]);
	HTMLArea._addEvent(editor._doc, "mousedown", this.eventHandlers["documentClick"]);
	if (keys.length > 0) {
		this.eventHandlers["keyPress"] = ContextMenu.keyPressHandler(this, keys);
		HTMLArea._addEvent(editor._doc, "keypress", this.eventHandlers["keyPress"]);
	}
	HTMLArea._stopEvent(ev);
	return false;
};

