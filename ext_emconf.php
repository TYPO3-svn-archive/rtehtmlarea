<?php

########################################################################
# Extension Manager/Repository config file for ext: "sr_htmlarea"
# 
# Auto generated 23-11-2004 16:02
# 
# Manual updates:
# Only the data in the array - anything else is removed by next write
########################################################################

$EM_CONF[$_EXTKEY] = Array (
	'title' => 'htmlArea RTE',
	'description' => 'Rich Text Editor based on the open source htmlArea editor. Pursuing work initiated by Kasper Sk�rh�j and Philipp Borgmann.',
	'category' => 'be',
	'shy' => 0,
	'dependencies' => 'cms,sr_static_info',
	'conflicts' => 'rte,rte_pb_htmlarea,sr_spellcheck,rte_chooser,rtehtmlarea',
	'priority' => '',
	'loadOrder' => '',
	'TYPO3_version' => '3.6.3-0.0.4',
	'PHP_version' => '0.0.4-0.0.4',
	'module' => '',
	'state' => 'beta',
	'internal' => 0,
	'uploadfolder' => 0,
	'createDirs' => '',
	'modify_tables' => '',
	'clearCacheOnLoad' => 0,
	'lockType' => '',
	'author' => 'Stanislas Rolland',
	'author_email' => 'stanislas.rolland@fructifor.com',
	'author_company' => 'Fructifor Inc.',
	'CGLcompliance' => '',
	'CGLcompliance_note' => '',
	'private' => 0,
	'download_password' => '',
	'version' => '0.3.12',	// Don't modify this! Managed automatically during upload to repository.
	'_md5_values_when_last_written' => 'a:170:{s:31:"class.tx_rtepbhtmlarea_base.php";s:4:"fc89";s:12:"ext_icon.gif";s:4:"2f41";s:17:"ext_localconf.php";s:4:"3fa6";s:13:"locallang.php";s:4:"ab48";s:40:"locallang_rtepbhtmlarea_select_image.php";s:4:"f290";s:30:"rtepbhtmlarea_select_image.php";s:4:"63d1";s:12:"t3_popup.php";s:4:"2b87";s:12:"typo3_rte.js";s:4:"8e87";s:14:"doc/manual.sxw";s:4:"4434";s:18:"htmlarea/dialog.js";s:4:"6e16";s:21:"htmlarea/htmlarea.css";s:4:"c7ba";s:20:"htmlarea/htmlarea.js";s:4:"87eb";s:20:"htmlarea/license.txt";s:4:"f260";s:30:"htmlarea/locallang_buttons.php";s:4:"2b33";s:29:"htmlarea/locallang_custom.php";s:4:"6e92";s:30:"htmlarea/locallang_dialogs.php";s:4:"c085";s:26:"htmlarea/locallang_msg.php";s:4:"cba1";s:31:"htmlarea/locallang_tooltips.php";s:4:"c48d";s:20:"htmlarea/popupdiv.js";s:4:"1e47";s:20:"htmlarea/popupwin.js";s:4:"77ac";s:43:"htmlarea/plugins/SpellChecker/locallang.php";s:4:"7564";s:51:"htmlarea/plugins/SpellChecker/spell-check-logic.php";s:4:"17e8";s:51:"htmlarea/plugins/SpellChecker/spell-check-style.css";s:4:"ee1d";s:49:"htmlarea/plugins/SpellChecker/spell-check-ui.html";s:4:"ea87";s:47:"htmlarea/plugins/SpellChecker/spell-check-ui.js";s:4:"2cca";s:46:"htmlarea/plugins/SpellChecker/spell-checker.js";s:4:"8e35";s:49:"htmlarea/plugins/SpellChecker/img/spell-check.gif";s:4:"15cf";s:46:"htmlarea/plugins/TableOperations/locallang.php";s:4:"20cf";s:52:"htmlarea/plugins/TableOperations/table-operations.js";s:4:"bddd";s:52:"htmlarea/plugins/TableOperations/img/cell-delete.gif";s:4:"031c";s:58:"htmlarea/plugins/TableOperations/img/cell-insert-after.gif";s:4:"4d36";s:59:"htmlarea/plugins/TableOperations/img/cell-insert-before.gif";s:4:"9ead";s:51:"htmlarea/plugins/TableOperations/img/cell-merge.gif";s:4:"a2d2";s:50:"htmlarea/plugins/TableOperations/img/cell-prop.gif";s:4:"bf67";s:51:"htmlarea/plugins/TableOperations/img/cell-split.gif";s:4:"d87c";s:51:"htmlarea/plugins/TableOperations/img/col-delete.gif";s:4:"b0f6";s:57:"htmlarea/plugins/TableOperations/img/col-insert-after.gif";s:4:"f5f7";s:58:"htmlarea/plugins/TableOperations/img/col-insert-before.gif";s:4:"5711";s:50:"htmlarea/plugins/TableOperations/img/col-split.gif";s:4:"eacc";s:51:"htmlarea/plugins/TableOperations/img/row-delete.gif";s:4:"7cdb";s:57:"htmlarea/plugins/TableOperations/img/row-insert-above.gif";s:4:"d034";s:57:"htmlarea/plugins/TableOperations/img/row-insert-under.gif";s:4:"59f9";s:49:"htmlarea/plugins/TableOperations/img/row-prop.gif";s:4:"b11e";s:50:"htmlarea/plugins/TableOperations/img/row-split.gif";s:4:"a712";s:51:"htmlarea/plugins/TableOperations/img/table-prop.gif";s:4:"2a21";s:38:"htmlarea/plugins/FullPage/full-page.js";s:4:"59a8";s:35:"htmlarea/plugins/FullPage/test.html";s:4:"a584";s:36:"htmlarea/plugins/FullPage/lang/en.js";s:4:"6e13";s:36:"htmlarea/plugins/FullPage/lang/ro.js";s:4:"a23a";s:41:"htmlarea/plugins/FullPage/img/docprop.gif";s:4:"a6d8";s:45:"htmlarea/plugins/FullPage/popups/docprop.html";s:4:"7c80";s:44:"htmlarea/plugins/ContextMenu/context-menu.js";s:4:"da29";s:42:"htmlarea/plugins/ContextMenu/locallang.php";s:4:"3abe";s:37:"htmlarea/plugins/ContextMenu/menu.css";s:4:"ff93";s:42:"htmlarea/plugins/DynamicCSS/dynamiccss.css";s:4:"a081";s:41:"htmlarea/plugins/DynamicCSS/dynamiccss.js";s:4:"2bdb";s:41:"htmlarea/plugins/DynamicCSS/locallang.php";s:4:"911f";s:42:"htmlarea/plugins/SelectColor/locallang.php";s:4:"c0ca";s:44:"htmlarea/plugins/SelectColor/select-color.js";s:4:"94ff";s:49:"htmlarea/plugins/SelectColor/img/CO-forecolor.gif";s:4:"5d7f";s:51:"htmlarea/plugins/SelectColor/img/CO-hilitecolor.gif";s:4:"c6e2";s:44:"htmlarea/plugins/TYPO3Browsers/locallang.php";s:4:"5405";s:47:"htmlarea/plugins/TYPO3Browsers/typo3browsers.js";s:4:"08b5";s:47:"htmlarea/plugins/TYPO3Browsers/img/ed_image.gif";s:4:"666e";s:46:"htmlarea/plugins/TYPO3Browsers/img/ed_link.gif";s:4:"9a55";s:46:"htmlarea/plugins/InsertSmiley/insert-smiley.js";s:4:"0a67";s:43:"htmlarea/plugins/InsertSmiley/locallang.php";s:4:"6481";s:47:"htmlarea/plugins/InsertSmiley/img/ed_smiley.gif";s:4:"810e";s:54:"htmlarea/plugins/InsertSmiley/popups/insertsmiley.html";s:4:"1324";s:46:"htmlarea/plugins/InsertSmiley/smileys/0001.gif";s:4:"4aff";s:46:"htmlarea/plugins/InsertSmiley/smileys/0002.gif";s:4:"02c4";s:46:"htmlarea/plugins/InsertSmiley/smileys/0003.gif";s:4:"834f";s:46:"htmlarea/plugins/InsertSmiley/smileys/0004.gif";s:4:"fb6a";s:46:"htmlarea/plugins/InsertSmiley/smileys/0005.gif";s:4:"2a48";s:46:"htmlarea/plugins/InsertSmiley/smileys/0006.gif";s:4:"f970";s:46:"htmlarea/plugins/InsertSmiley/smileys/0007.gif";s:4:"97ee";s:46:"htmlarea/plugins/InsertSmiley/smileys/0008.gif";s:4:"10a6";s:46:"htmlarea/plugins/InsertSmiley/smileys/0009.gif";s:4:"1907";s:46:"htmlarea/plugins/InsertSmiley/smileys/0010.gif";s:4:"9ee6";s:46:"htmlarea/plugins/InsertSmiley/smileys/0011.gif";s:4:"ae73";s:46:"htmlarea/plugins/InsertSmiley/smileys/0012.gif";s:4:"f058";s:46:"htmlarea/plugins/InsertSmiley/smileys/0013.gif";s:4:"3ed8";s:46:"htmlarea/plugins/InsertSmiley/smileys/0014.gif";s:4:"a948";s:46:"htmlarea/plugins/InsertSmiley/smileys/0015.gif";s:4:"218d";s:46:"htmlarea/plugins/InsertSmiley/smileys/0016.gif";s:4:"3539";s:46:"htmlarea/plugins/InsertSmiley/smileys/0017.gif";s:4:"ee2e";s:46:"htmlarea/plugins/InsertSmiley/smileys/0018.gif";s:4:"8c66";s:46:"htmlarea/plugins/InsertSmiley/smileys/0019.gif";s:4:"ac36";s:46:"htmlarea/plugins/InsertSmiley/smileys/0020.gif";s:4:"71ef";s:43:"htmlarea/plugins/RemoveFormat/locallang.php";s:4:"6be3";s:46:"htmlarea/plugins/RemoveFormat/remove-format.js";s:4:"7d76";s:46:"htmlarea/plugins/RemoveFormat/img/ed_clean.gif";s:4:"c936";s:51:"htmlarea/plugins/RemoveFormat/img/ed_clean_back.gif";s:4:"5beb";s:55:"htmlarea/plugins/RemoveFormat/img/removeformat-back.gif";s:4:"6a7d";s:54:"htmlarea/plugins/RemoveFormat/popups/removeformat.html";s:4:"8539";s:44:"htmlarea/plugins/FindReplace/find-replace.js";s:4:"117d";s:41:"htmlarea/plugins/FindReplace/fr_engine.js";s:4:"ef83";s:42:"htmlarea/plugins/FindReplace/locallang.php";s:4:"df8c";s:49:"htmlarea/plugins/FindReplace/img/ed_find-back.gif";s:4:"3377";s:50:"htmlarea/plugins/FindReplace/img/ed_find-back2.gif";s:4:"aae2";s:50:"htmlarea/plugins/FindReplace/img/ed_find-back3.gif";s:4:"fbe8";s:44:"htmlarea/plugins/FindReplace/img/ed_find.gif";s:4:"d01c";s:53:"htmlarea/plugins/FindReplace/popups/find_replace.html";s:4:"6ede";s:34:"htmlarea/plugins/Indite/indite.css";s:4:"e6a2";s:33:"htmlarea/plugins/Indite/indite.js";s:4:"fcbe";s:37:"htmlarea/plugins/Indite/locallang.php";s:4:"bfeb";s:34:"htmlarea/plugins/Indite/lang/da.js";s:4:"7599";s:34:"htmlarea/plugins/Indite/lang/en.js";s:4:"f19f";s:40:"htmlarea/plugins/Indite/rules/article.js";s:4:"3f18";s:41:"htmlarea/plugins/Indite/rules/article.xsl";s:4:"d88b";s:43:"htmlarea/plugins/Indite/xml/DTD_Document.js";s:4:"f33d";s:43:"htmlarea/plugins/Indite/xml/XML_Document.js";s:4:"5409";s:42:"htmlarea/plugins/Indite/xml/XML_Utility.js";s:4:"b832";s:46:"htmlarea/plugins/CharacterMap/character-map.js";s:4:"b9ff";s:43:"htmlarea/plugins/CharacterMap/locallang.php";s:4:"eee6";s:48:"htmlarea/plugins/CharacterMap/img/ed_charmap.gif";s:4:"5aa6";s:58:"htmlarea/plugins/CharacterMap/popups/select_character.html";s:4:"b4cf";s:26:"htmlarea/popups/about.html";s:4:"0d11";s:26:"htmlarea/popups/blank.html";s:4:"0883";s:28:"htmlarea/popups/custom2.html";s:4:"a893";s:32:"htmlarea/popups/editor_help.html";s:4:"72f5";s:31:"htmlarea/popups/fullscreen.html";s:4:"e11a";s:33:"htmlarea/popups/insert_image.html";s:4:"1aa3";s:33:"htmlarea/popups/insert_table.html";s:4:"67d6";s:25:"htmlarea/popups/link.html";s:4:"d601";s:24:"htmlarea/popups/popup.js";s:4:"3101";s:33:"htmlarea/popups/select_color.html";s:4:"f802";s:28:"htmlarea/images/ed_about.gif";s:4:"2763";s:35:"htmlarea/images/ed_align_center.gif";s:4:"419a";s:36:"htmlarea/images/ed_align_justify.gif";s:4:"9c31";s:33:"htmlarea/images/ed_align_left.gif";s:4:"9c22";s:34:"htmlarea/images/ed_align_right.gif";s:4:"9386";s:28:"htmlarea/images/ed_blank.gif";s:4:"0208";s:30:"htmlarea/images/ed_charmap.gif";s:4:"a9ba";s:31:"htmlarea/images/ed_color_bg.gif";s:4:"c6e2";s:31:"htmlarea/images/ed_color_fg.gif";s:4:"5d7f";s:27:"htmlarea/images/ed_copy.gif";s:4:"4f55";s:29:"htmlarea/images/ed_custom.gif";s:4:"e7b2";s:26:"htmlarea/images/ed_cut.gif";s:4:"1b00";s:29:"htmlarea/images/ed_delete.gif";s:4:"926b";s:34:"htmlarea/images/ed_format_bold.gif";s:4:"f4f6";s:36:"htmlarea/images/ed_format_italic.gif";s:4:"a800";s:36:"htmlarea/images/ed_format_strike.gif";s:4:"3aa0";s:33:"htmlarea/images/ed_format_sub.gif";s:4:"a840";s:33:"htmlarea/images/ed_format_sup.gif";s:4:"cad7";s:39:"htmlarea/images/ed_format_underline.gif";s:4:"505a";s:27:"htmlarea/images/ed_help.gif";s:4:"e7fc";s:25:"htmlarea/images/ed_hr.gif";s:4:"ff70";s:27:"htmlarea/images/ed_html.gif";s:4:"fa6e";s:28:"htmlarea/images/ed_image.gif";s:4:"4ab7";s:34:"htmlarea/images/ed_indent_less.gif";s:4:"8503";s:34:"htmlarea/images/ed_indent_more.gif";s:4:"3835";s:36:"htmlarea/images/ed_left_to_right.gif";s:4:"a0f9";s:27:"htmlarea/images/ed_link.gif";s:4:"d6a3";s:34:"htmlarea/images/ed_list_bullet.gif";s:4:"236b";s:31:"htmlarea/images/ed_list_num.gif";s:4:"48d3";s:28:"htmlarea/images/ed_paste.gif";s:4:"eef3";s:27:"htmlarea/images/ed_redo.gif";s:4:"e9e8";s:36:"htmlarea/images/ed_right_to_left.gif";s:4:"5149";s:27:"htmlarea/images/ed_save.gif";s:4:"07ad";s:34:"htmlarea/images/ed_show_border.gif";s:4:"ae22";s:31:"htmlarea/images/ed_splitcel.gif";s:4:"2c04";s:27:"htmlarea/images/ed_undo.gif";s:4:"b9ba";s:39:"htmlarea/images/fullscreen_maximize.gif";s:4:"2118";s:39:"htmlarea/images/fullscreen_minimize.gif";s:4:"91d6";s:32:"htmlarea/images/insert_table.gif";s:4:"bf88";s:31:"pi1/class.tx_srhtmlarea_pi1.php";s:4:"8af2";s:17:"pi1/locallang.php";s:4:"8949";s:31:"pi2/class.tx_srhtmlarea_pi2.php";s:4:"b8c3";s:17:"pi2/locallang.php";s:4:"e2b7";}',
);

?>