<?php
switch( $HTTP_GET_VARS["popupname"] ) {
	case "link" : $title = "Insert/Modify Link"; break;
	case "image" : $title = "Insert Image"; break;
}
$src = $HTTP_GET_VARS["srcpath"];
?>
<html style="width: 500px; height: 300px">
<head>
	<title><?php echo $title;?></title>

<script type="text/javascript" src="htmlarea/popups/popup.js"></script>
<script type="text/javascript">
window.resizeTo(500, 300);

var parent = window.opener;

function _CloseOnEsc() {
  if (event.keyCode == 27) { window.close(); return; }
}

function Init() {
  i18n = window.opener.HTMLArea.I18N.dialogs; // load the HTMLArea lang file
  __dlg_init();
  __dlg_translate(i18n);  // this will translate the window title
  document.body.onkeypress = _CloseOnEsc;

  parent = window.opener;
  self.parent = window.opener;

  setTimeout("idPopup.focus();",3000);
}

<?php

if ($HTTP_GET_VARS["popupname"] == "image") {
	echo '
	setTimeout("init_selectedImageRef();",100);

	function init_selectedImageRef() {
		if (self.parent._selectedImage) {
			if (!idPopup.insertImagePropertiesInForm) {
				setTimeout("init_selectedImageRef();",100);
				return;
			}

			idPopup.selectedImageRef = self.parent._selectedImage;
			idPopup.insertImagePropertiesInForm();
		}
	}

';
}

?>


</script>
</head>

<body style="background:ButtonFace; margin:0px; padding:0px; width: 500px; height: 300px; border: none;" onload="Init();">
<table border="0px" cellspacing="0px" cellpadding="0" width="100%" HEIGHT=100%>
<tr><td>
<?php
//echo $src;
echo '
  <IFRAME ID=idPopup name=idPopup target=idPopup WIDTH=100% HEIGHT=100% STYLE="visibility: visible;border: none;" SRC="' . $src . '?' . $HTTP_SERVER_VARS[QUERY_STRING] . '"></IFRAME>
';
//echo $HTTP_SERVER_VARS[QUERY_STRING];
?>
</td></tr></table>
</body></html>