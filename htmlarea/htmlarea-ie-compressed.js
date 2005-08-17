HTMLArea._cleanup=function(editor){for(var handler in editor.eventHandlers)editor.eventHandlers[handler]=null;for(var button in editor.btnList)editor.btnList[button][3]=null;for(var dropdown in editor.config.customSelects){dropdown.action=null;dropdown.refresh=null;}editor.onGenerate=null;HTMLArea._editorEvent=null;if(editor._textArea.form){editor._textArea.form.__msh_prevOnReset=null;editor._textArea.form._editorNumber=null;};HTMLArea.onload=null;if(HTMLArea._eventCache){HTMLArea._eventCache.listEvents=null;HTMLArea._eventCache.add=null;HTMLArea._eventCache.flush=null;HTMLArea._eventCache=null;};for(var i in editor.plugins){var plugin=editor.plugins[i].instance;plugin.onGenerate=null;plugin.onMode=null;plugin.onKeyPress=null;plugin.onSelect=null;plugin.onUpdateTolbar=null;};var obj;for(var txt in editor._toolbarObjects){obj=editor._toolbarObjects[txt];obj["state"]=null;document.getElementById(obj["elementId"])._obj=null;};if(editor._statusBarTree.hasChildNodes()){for(var i=editor._statusBarTree.firstChild;i;i=i.nextSibling){if(i.nodeName.toLowerCase()=="a"){HTMLArea._removeEvents(i,["click","contextmenu"],HTMLArea.statusBarHandler);i.el=null;i.editor=null;}}}};HTMLArea.prototype._getSelection=function(){return this._doc.selection;};HTMLArea.prototype._createRange=function(sel){if(typeof(sel)!="undefined")return sel.createRange();return this._doc.selection.createRange();};HTMLArea.prototype.selectNode=function(node){this.focusEditor();this.forceRedraw();var range=this._doc.body.createTextRange();range.moveToElementText(node);range.select();};HTMLArea.prototype.selectNodeContents=function(node,pos){this.focusEditor();this.forceRedraw();var collapsed=(typeof(pos)!="undefined");var range=this._doc.body.createTextRange();range.moveToElementText(node);(collapsed)&&range.collapse(pos);range.select();};HTMLArea.prototype.getSelectedHTML=function(){var sel=this._getSelection();var range=this._createRange(sel);if(sel.type.toLowerCase()=="control"){var r1=this._doc.body.createTextRange();r1.moveToElementText(range(0));return r1.htmlText;}else{return range.htmlText;}};HTMLArea.prototype.getSelectedHTMLContents=function(){var sel=this._getSelection();var range=this._createRange(sel);return range.htmlText;};HTMLArea.prototype.getParentElement=function(sel){if(!sel)var sel=this._getSelection();var range=this._createRange(sel);switch(sel.type){case "Text":case "None":var el=range.parentElement();if(el.nodeName.toLowerCase()=="li"&&range.htmlText.replace(/\s/g,"")==el.parentNode.outerHTML.replace(/\s/g,""))return el.parentNode;return el;case "Control":return range.item(0);default:return this._doc.body;}};HTMLArea.prototype.insertNodeAtSelection=function(toBeInserted){var sel=this._getSelection();var range=this._createRange(sel);range.pasteHTML(toBeInserted.outerHTML);};HTMLArea.prototype.insertHTML=function(html){this.focusEditor();var sel=this._getSelection();var range=this._createRange(sel);range.pasteHTML(html);};HTMLArea.statusBarHandler=function(ev){if(!ev)var ev=window.event;var target=(ev.target)?ev.target:ev.srcElement;var editor=target.editor;target.blur();var tagname=target.el.tagName.toLowerCase();if(tagname=="table"||tagname=="img"){var range=editor._doc.body.createControlRange();range.addElement(target.el);range.select();}else{editor.selectNode(target.el);}editor.updateToolbar(true);switch(ev.type){case "click":return false;case "contextmenu":return editor.plugins["ContextMenu"].instance.popupMenu(ev,target.el);}};HTMLArea.prototype._checkBackspace=function(){var sel=this._getSelection();var range=this._createRange(sel);if(sel.type=="Control"){var el=this.getParentElement();var p=el.parentNode;p.removeChild(el);return true;}else{var r2=range.duplicate();r2.moveStart("character",-1);var a=r2.parentElement();if(a!=range.parentElement()&&/^a$/i.test(a.tagName)){r2.collapse(true);r2.moveEnd("character",1);r2.pasteHTML('');r2.select();return true;};return false;}};

