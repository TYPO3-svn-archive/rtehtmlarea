<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2004 Kasper Skaarhoj (kasper@typo3.com)
*  (c) 2004 Philipp Borgmann <philipp.borgmann@gmx.de>
*  (c) 2004-2005 Stanislas Rolland <stanislas.rolland@fructifor.com>
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*  A copy is found in the textfile GPL.txt and important notices to the license
*  from the author is found in LICENSE.txt distributed with these scripts.
*
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/

/**
 * Internal page and image browsers for the htmlArea RTE
 *
 * @author	Philipp Borgmann <philipp.borgmann@gmx.de>
 * @coauthor	Stanislas Rolland <stanislas.rolland@fructifor.com>
 */

unset($MCONF);

define('MY_PATH_thisScript',str_replace('//','/', str_replace('\\','/', (php_sapi_name()=='cgi'||php_sapi_name()=='xcgi'||php_sapi_name()=='isapi' ||php_sapi_name()=='cgi-fcgi')&&($_SERVER['ORIG_PATH_TRANSLATED']?$_SERVER['ORIG_PATH_TRANSLATED']:$_SERVER['PATH_TRANSLATED'])? ($_SERVER['ORIG_PATH_TRANSLATED']?$_SERVER['ORIG_PATH_TRANSLATED']:$_SERVER['PATH_TRANSLATED']):($_SERVER['ORIG_SCRIPT_FILENAME']?$_SERVER['ORIG_SCRIPT_FILENAME']:$_SERVER['SCRIPT_FILENAME']))));

if( strstr(MY_PATH_thisScript, 'typo3conf') ) {
	define('TYPO3_MOD_PATH', "../typo3conf/ext/rtehtmlarea/");
} else {
	define('TYPO3_MOD_PATH', "ext/rtehtmlarea/");
}

$BACK_PATH = '../../../typo3/';
require ($BACK_PATH.'init.php');
require ($BACK_PATH.'template.php');
require_once (PATH_t3lib.'class.t3lib_div.php');

$query_string = t3lib_div::getIndpEnv('QUERY_STRING');
$popupname = t3lib_div::_GET('popupname');
$src = t3lib_div::_GET('srcpath');

switch( $popupname ) {
	case "link" : $title = "Insert/Modify Link"; break;
	case "image" : $title = "Insert Image"; break;
	default : $title = "Editor configuration problem!";
}
?>
<html style="width: 550px; height: 350px;">
<head>
<title><?php echo $title;?></title>
<script type="text/javascript" src="htmlarea/popups/popup.js"></script>
<script type="text/javascript">
	var parent = window.opener;
	HTMLArea = window.opener.HTMLArea;

	function Init() {
		i18n = window.opener.HTMLArea.I18N.dialogs;
  		__dlg_translate(i18n);
		__dlg_init();
  		document.body.onkeypress = __dlg_close_on_esc;

		parent = window.opener;
		self.parent = window.opener;
		setTimeout("idPopup.focus();",3000);
	};

<?php
if ($popupname == "image") {
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

<body style="background:ButtonFace; margin:0px; padding:0px; width: 550px; height: 350px; border: none;" onload="Init();">
<table border="0px" cellspacing="0px" cellpadding="0" width="100%" height="100%">
<tr><td>
<?php
echo '
  <iframe id="idPopup" name="idPopup" target="idPopup" width="100%" height="100%" style="visibility: visible; border: none;" src="' . $src . '?' . $query_string . '"></iframe>
';
?>
</td></tr></table>
</body></html>
