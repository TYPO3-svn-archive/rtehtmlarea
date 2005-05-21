// Context Menu Plugin for TYPO3 htmlArea RTE
// Implementation by Mihai Bazon, http://dynarch.com/mishoo/. Sponsored by www.americanbible.org
// Substantially rewritten by Stanislas Rolland <stanislas.rolland(arobas)fructifor.com>. Sponsored by Fructifor Inc.
// Copyright (c) 2003 dynarch.com
// Copyright (c) 2004-2005 Stanislas Rolland
// This notice MUST stay intact for use (see license.txt).

ContextMenu = function(editor) {
	this.editor = editor;
	this.currentMenu = null;
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
	var self = this;
	HTMLArea._addEvent(this.editor._doc,"contextmenu",function(ev){self.popupMenu(ev);});
};

ContextMenu.prototype.getContextMenu = function(target) {
	var self = this;
	var editor = this.editor;
	var config = editor.config;
	var menu = [];
	var tbo = this.editor.plugins["TableOperations"];
	if(tbo) tbo = tbo.instance;

	var selection = editor.hasSelectedText();
	if(selection) {
		if(editor._toolbarObjects['Cut'] && editor._toolbarObjects['Cut'].enabled)  {
			menu.push([ContextMenu.I18N["Cut"],function(){editor.execCommand("cut");},null,config.btnList["Cut"][1],"Cut"]);
		}
		if(editor._toolbarObjects['Copy'] && editor._toolbarObjects['Copy'].enabled) {
			menu.push([ContextMenu.I18N["Copy"],function(){editor.execCommand("copy");},null,config.btnList["Copy"][1],"Copy"]);
		}
	}
	if(editor._toolbarObjects['Paste'] && editor._toolbarObjects['Paste'].enabled) {
		menu.push([ContextMenu.I18N["Paste"],function(){editor.execCommand("paste");},null,config.btnList["Paste"][1],"Paste"]);
	}

	var 	currentTarget = target,
		elmenus = [],
		tmp,tag,link = false,table = null,tr = null,td = null,img = null;

	function tableOperation(opcode) {
		tbo.buttonPress(editor,opcode);
	};

	function insertPara(currentTarget,after) {
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
	};

	for(; target; target = target.parentNode) {
		tag = target.tagName;
		if(!tag) continue;
		tag = tag.toLowerCase();
		switch (tag) {
		    case "img":
			img = target;
			if(editor._toolbarObjects["InsertImage"] && editor._toolbarObjects["InsertImage"].enabled)  {
				elmenus.push(null,
				     [ContextMenu.I18N["Image Properties"],
				       function(){editor._insertImage(img);},ContextMenu.I18N["Show the image properties dialog"],
				       config.btnList["InsertImage"][1],"InsertImage"]
				);
			}
			break;
		    case "a":
			link = target;
			if(editor._toolbarObjects["CreateLink"] && editor._toolbarObjects["CreateLink"].enabled)  {
				elmenus.push(null,
					[ContextMenu.I18N["Modify Link"],
						function(){editor.execCommand("CreateLink", true);},ContextMenu.I18N["Current URL is"] + ': ' + link.href,
						config.btnList["CreateLink"][1],"CreateLink"],
					[ContextMenu.I18N["Check Link"],
						function(){window.open(link.href);},ContextMenu.I18N["Opens this link in a new window"],
						null,"CreateLink"],
				     [ContextMenu.I18N["Remove Link"],
						function(){
							if (confirm(ContextMenu.I18N["Please confirm that you want to unlink this element."] + "\n" +
								ContextMenu.I18N["Link points to:"] + " " + link.href)) {
									while(link.firstChild) link.parentNode.insertBefore(link.firstChild, link);
									link.parentNode.removeChild(link);
							}
				       },ContextMenu.I18N["Unlink the current element"],null,"CreateLink"]

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
			if(cellPropEnabled) elmenus.push([ContextMenu.I18N["Cell Properties"],
				function(){tableOperation("TO-cell-prop");},ContextMenu.I18N["Show the Table Cell Properties dialog"],
				config.btnList["TO-cell-prop"][1],"TO-cell-prop"]);
			if(cellInsertBeforeEnabled) elmenus.push([ContextMenu.I18N["Insert cell before"],
				function(){tableOperation("TO-cell-insert-before");},ContextMenu.I18N["Insert a new cell before the current one"],
				config.btnList["TO-cell-insert-before"][1],"TO-cell-insert-before"]);
			if(cellInsertAfterEnabled) elmenus.push([ContextMenu.I18N["Insert cell after"],
				function(){tableOperation("TO-cell-insert-after");},ContextMenu.I18N["Insert a new cell after the current one"],
				config.btnList["TO-cell-insert-after"][1],"TO-cell-insert-after"]);
			if(cellDeleteEnabled) elmenus.push([ContextMenu.I18N["Delete Cell"],
  				function(){tableOperation("TO-cell-delete");},ContextMenu.I18N["Delete the current cell"],
  				config.btnList["TO-cell-delete"][1],"TO-cell-delete"]);
			if(cellSplitEnabled) elmenus.push([ContextMenu.I18N["Split Cell"],
  				function(){tableOperation("TO-cell-split");},ContextMenu.I18N["Split the current cell"],
  				config.btnList["TO-cell-split"][1],"TO-cell-split"]);
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
			if(cellMergeEnabled) elmenus.push([ContextMenu.I18N["Merge Cells"],
				function(){tableOperation("TO-cell-merge");},ContextMenu.I18N["Merge the selected cells"],
				config.btnList["TO-cell-merge"][1],"TO-cell-merge"]);
			if(rowPropEnabled || rowInsertBeforeEnabled || rowInsertAfterEnabled || rowDeleteEnabled || rowSplitEnabled) elmenus.push(null);
			if(rowPropEnabled) elmenus.push([ContextMenu.I18N["Row Properties"],
				function(){tableOperation("TO-row-prop");},ContextMenu.I18N["Show the Table Row Properties dialog"],
				config.btnList["TO-row-prop"][1],"TO-row-prop"]);
			if(rowInsertBeforeEnabled) elmenus.push([ContextMenu.I18N["Insert Row Before"],
				function(){tableOperation("TO-row-insert-above");},ContextMenu.I18N["Insert a new row before the current one"],
				config.btnList["TO-row-insert-above"][1],"TO-row-insert-above"]);
			if(rowInsertAfterEnabled) elmenus.push([ContextMenu.I18N["Insert Row After"],
				function(){tableOperation("TO-row-insert-under");},ContextMenu.I18N["Insert a new row after the current one"],
				config.btnList["TO-row-insert-under"][1],"TO-row-insert-under"]);
			if(rowDeleteEnabled) elmenus.push([ContextMenu.I18N["Delete Row"],
				function(){tableOperation("TO-row-delete");},ContextMenu.I18N["Delete the current row"],
				config.btnList["TO-row-delete"][1],"TO-row-delete"]);
			if(rowSplitEnabled) elmenus.push([ContextMenu.I18N["Split Row"],
  				function(){tableOperation("TO-row-split");},ContextMenu.I18N["Split the current row"],
  				config.btnList["TO-row-split"][1],"TO-row-split"]);
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
			if(colInsertBeforeEnabled) elmenus.push([ContextMenu.I18N["Insert Column Before"],
				function(){tableOperation("TO-col-insert-before");},ContextMenu.I18N["Insert a new column before the current one"],
				config.btnList["TO-col-insert-before"][1],"TO-col-insert-before"]);
			if(colInsertAfterEnabled) elmenus.push([ContextMenu.I18N["Insert Column After"],
				function(){tableOperation("TO-col-insert-after");},ContextMenu.I18N["Insert a new column after the current one"],
				config.btnList["TO-col-insert-after"][1],"TO-col-insert-after"]);
			if(colDeleteEnabled) elmenus.push([ContextMenu.I18N["Delete Column"],
				function(){tableOperation("TO-col-delete");},ContextMenu.I18N["Delete the current column"],
				config.btnList["TO-col-delete"][1],"TO-col-delete"]);
			if(colSplitEnabled) elmenus.push([ContextMenu.I18N["Split Column"],
  				function(){tableOperation("TO-col-split");},ContextMenu.I18N["Split the current column"],
  				config.btnList["TO-col-split"][1],"TO-col-split"]);
			if(tablePropEnabled) elmenus.push(null,[ContextMenu.I18N["Table Properties"],
				function(){tableOperation("TO-table-prop");},ContextMenu.I18N["Show the Table Properties dialog"],
				config.btnList["TO-table-prop"][1],"TO-table-prop"]);
			break;
		    case "body":
			var justifyLeftEnabled = (editor._toolbarObjects['JustifyLeft'] && editor._toolbarObjects['JustifyLeft'].enabled);
			var justifyCenterEnabled = (editor._toolbarObjects['JustifyCenter'] && editor._toolbarObjects['JustifyCenter'].enabled);
			var justifyRightEnabled = (editor._toolbarObjects['JustifyRight'] && editor._toolbarObjects['JustifyRight'].enabled);
			var justifyFullEnabled = (editor._toolbarObjects['JustifyFull'] && editor._toolbarObjects['JustifyFull'].enabled);
			if(justifyLeftEnabled || justifyCenterEnabled || justifyRightEnabled || justifyFullEnabled) elmenus.push(null);
			if(justifyLeftEnabled) elmenus.push([ContextMenu.I18N["Justify Left"],
				function(){editor.execCommand("JustifyLeft");},null,
				config.btnList["JustifyLeft"][1],"JustifyLeft"]);
			if(justifyCenterEnabled) elmenus.push([ContextMenu.I18N["Justify Center"],
				function(){editor.execCommand("JustifyCenter");},null,
				config.btnList["JustifyCenter"][1],"JustifyCenter"]);
			if(justifyRightEnabled) elmenus.push([ContextMenu.I18N["Justify Right"],
				function(){editor.execCommand("JustifyRight");},null,
				config.btnList["JustifyRight"][1],"JustifyRight"]);
			if(justifyFullEnabled) elmenus.push([ContextMenu.I18N["Justify Full"],
				function(){editor.execCommand("JustifyFull");},null,
				config.btnList["JustifyFull"][1],"JustifyFull"]);
			break;
		}
	}

	if(selection && !link) menu.push(null,[ContextMenu.I18N["Make link"],
				  function(){editor.execCommand("CreateLink",true);},ContextMenu.I18N["Create a link"],
				  config.btnList["CreateLink"][1],"CreateLink"]);

	for(var i=0;i < elmenus.length;++i) menu.push(elmenus[i]);

	if(!/html|body/i.test(currentTarget.tagName)) {
		table ? (tmp = table, table = null) : (tmp = currentTarget);
		menu.push(null,
		  [ContextMenu.I18N["Remove the"] + " &lt;" + tmp.tagName.toLowerCase() + "&gt; " + ContextMenu.I18N["Element"],
		    function() {
			    if(confirm(ContextMenu.I18N["Please confirm that you want to remove this element:"] + " " + tmp.tagName.toLowerCase())) {
				    var el = tmp;
				    var p = el.parentNode;
				    p.removeChild(el);
				    if(HTMLArea.is_gecko) {
					    if(p.tagName.toLowerCase() == "td" && !p.hasChildNodes())
						    p.appendChild(editor._doc.createElement("br"));
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
		    },ContextMenu.I18N["Remove this node from the document"]],
		  [ContextMenu.I18N["Insert paragraph before"],
			function(){insertPara(tmp,false);},ContextMenu.I18N["Insert a paragraph before the current node"]],
		  [ContextMenu.I18N["Insert paragraph after"],
			function(){insertPara(tmp,true);},ContextMenu.I18N["Insert a paragraph after the current node"]]
		);
	}
	return menu;
};

ContextMenu.prototype.popupMenu = function(ev,target) {
	var self = this;
	var editor = self.editor;
	if(!ev) var ev = window.event;
	if(!target) var target = (ev.target) ? ev.target : ev.srcElement;
	if(this.currentMenu) this.currentMenu.parentNode.removeChild(this.currentMenu);
	function getPos(el) {
		var r = { x: el.offsetLeft, y: el.offsetTop };
		if(el.offsetParent) {
			var tmp = getPos(el.offsetParent);
			r.x += tmp.x;
			r.y += tmp.y;
		}
		return r;
	};
	function documentClick(ev) {
		if(!ev) var ev = window.event;
		if(!self.currentMenu) {
			alert(ContextMenu.I18N["How did you get here? (Please report!)"]);
			return false;
		}
		var el = (ev.target) ? ev.target : ev.srcElement;
		for(; el != null && el != self.currentMenu; el = el.parentNode);
		if(el == null) { 
			self.closeMenu();
			self.editor.updateToolbar();
		}
		
	};
	var keys = [];
	function keyPress(ev) {
		if(!ev) var ev = window.event;
		HTMLArea._stopEvent(ev);
		if(ev.keyCode == 27) {
			self.closeMenu();
			return false;
		}
		var key = String.fromCharCode(HTMLArea.is_ie ? ev.keyCode : ev.charCode).toLowerCase();
		for(var i = keys.length;--i >= 0;) {
			var k = keys[i];
			if(k[0].toLowerCase() == key) k[1].__msh.activate();
		}
	};
	self.closeMenu = function() {
		self.currentMenu.parentNode.removeChild(self.currentMenu);
		self.currentMenu = null;
		HTMLArea._removeEvent(document,"mousedown",documentClick);
		HTMLArea._removeEvent(self.editor._doc,"mousedown",documentClick);
		if(keys.length > 0) {HTMLArea._removeEvent(self.editor._doc,"keypress",keyPress);}
		if(HTMLArea.is_ie) {self.iePopup.hide();}
	};
	var ifpos = getPos(self.editor._iframe);
	var x = ev.clientX + ifpos.x;
	var y = ev.clientY + ifpos.y;

	var 	doc, list, separator = false;

	if(!HTMLArea.is_ie) {
		doc = document;
	} else {
		var popup = this.iePopup = window.createPopup();
		doc = popup.document;
		var head = doc.getElementsByTagName("head")[0];
 		var link = doc.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		if( _editor_CSS.indexOf("http") == -1 ) link.href = _typo3_host_url + _editor_CSS;
			else link.href = _editor_CSS;
		head.appendChild(link);
	}

	list = doc.createElement("ul");
	list.className = "htmlarea-context-menu";
	var options = this.getContextMenu(target);
	for(var i=0;i < options.length;++i) {
		var option = options[i];
		if(!option){
			separator = true;
		}else{
			var item = doc.createElement("li");
			list.appendChild(item);
			var label = option[0];
			if(separator) {
				item.className += " separator";
				separator = false;
			}
			item.__msh = {
				item: item,
				label: label,
				action: option[1],
				tooltip: option[2] || null,
				icon: option[3] || null,
				activate: function(){
					self.closeMenu();
					self.editor.focusEditor();
					this.action();
				},
				cmd: option[4] || null
			};
			label = label.replace(/_([a-zA-Z0-9])/, "<u>$1</u>");
			if(label != option[0]) keys.push([ RegExp.$1, item ]);
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
			item.onmouseover = function(){
				this.className += " hover";
				editor._statusBarTree.innerHTML = this.__msh.tooltip || '&nbsp;';
			};
			item.onmouseout = function(){this.className = this.className.replace(/hover/,"");};
			item.oncontextmenu = function(ev) {
				this.__msh.activate();
				if(!HTMLArea.is_ie) HTMLArea._stopEvent(ev);
				return false;
			};
			if(!HTMLArea.is_ie) item.onmousedown = function(ev){
				HTMLArea._stopEvent(ev);
				return false;
			};
			item.onmouseup = function(ev){
				var timeStamp = (new Date()).getTime();
				if(timeStamp - self.timeStamp > 500) this.__msh.activate();
				if(!HTMLArea.is_ie) HTMLArea._stopEvent(ev);
				return false;
			};
		}
	}
	doc.body.appendChild(list);
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
	HTMLArea._addEvent(document,"mousedown",documentClick);
	HTMLArea._addEvent(editor._doc,"mousedown",documentClick);
	if(keys.length > 0) HTMLArea._addEvent(editor._doc,"keypress",keyPress);
	HTMLArea._stopEvent(ev);
	return false;
};
