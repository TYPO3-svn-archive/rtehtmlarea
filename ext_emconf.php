<?php

########################################################################
# Extension Manager/Repository config file for ext: "rtehtmlarea"
# 
# Auto generated 10-11-2005 23:14
# 
# Manual updates:
# Only the data in the array - anything else is removed by next write
########################################################################

$EM_CONF[$_EXTKEY] = Array (
	'title' => 'htmlArea RTE',
	'description' => 'Rich Text Editor based on the open source htmlArea editor.',
	'category' => 'be',
	'shy' => 0,
	'dependencies' => 'cms',
	'conflicts' => 'rte_pb_htmlarea,sr_spellcheck,rte_chooser,sr_htmlarea',
	'priority' => '',
	'loadOrder' => '',
	'TYPO3_version' => '3.6.3-0.0.3',
	'PHP_version' => '0.0.19-0.0.19',
	'module' => '',
	'state' => 'beta',
	'internal' => 0,
	'uploadfolder' => 1,
	'createDirs' => '',
	'modify_tables' => '',
	'clearCacheOnLoad' => 1,
	'lockType' => '',
	'author' => 'Stanislas Rolland',
	'author_email' => 'stanislas.rolland@fructifor.ca',
	'author_company' => 'Fructifor Inc.',
	'CGLcompliance' => '',
	'CGLcompliance_note' => '',
	'private' => 0,
	'download_password' => '',
	'version' => '0.7.6',	// Don't modify this! Managed automatically during upload to repository.
	'_md5_values_when_last_written' => 'a:201:{s:9:"ChangeLog";s:4:"e7d1";s:29:"class.tx_rtehtmlarea_base.php";s:4:"85c4";s:39:"class.tx_rtehtmlarea_loremipsum_wiz.php";s:4:"7fea";s:33:"class.ux_t3lib_parsehtml_proc.php";s:4:"d1bb";s:8:"conf.php";s:4:"016f";s:21:"ext_conf_template.txt";s:4:"6de0";s:12:"ext_icon.gif";s:4:"2f41";s:17:"ext_localconf.php";s:4:"12ad";s:14:"ext_tables.php";s:4:"b932";s:14:"ext_tables.sql";s:4:"e5b1";s:13:"locallang.php";s:4:"30f1";s:16:"locallang_db.php";s:4:"3238";s:33:"locallang_rtehtmlarea_acronym.php";s:4:"0d26";s:38:"locallang_rtehtmlarea_browse_links.php";s:4:"77f9";s:38:"locallang_rtehtmlarea_select_image.php";s:4:"f356";s:30:"locallang_rtehtmlarea_user.php";s:4:"173c";s:20:"pageTSConfigFull.txt";s:4:"8904";s:23:"pageTSConfigMinimal.txt";s:4:"e07a";s:23:"rtehtmlarea_acronym.php";s:4:"e604";s:28:"rtehtmlarea_browse_links.php";s:4:"1f50";s:28:"rtehtmlarea_select_image.php";s:4:"a35c";s:20:"rtehtmlarea_user.php";s:4:"0f7c";s:12:"t3_popup.php";s:4:"c81a";s:7:"tca.php";s:4:"536c";s:31:"htmlarea/htmlarea-compressed.js";s:4:"abb5";s:37:"htmlarea/htmlarea-gecko-compressed.js";s:4:"9d75";s:26:"htmlarea/htmlarea-gecko.js";s:4:"7931";s:34:"htmlarea/htmlarea-ie-compressed.js";s:4:"4990";s:23:"htmlarea/htmlarea-ie.js";s:4:"57ae";s:20:"htmlarea/htmlarea.js";s:4:"bc56";s:20:"htmlarea/license.txt";s:4:"a10f";s:30:"htmlarea/locallang_dialogs.php";s:4:"0d14";s:26:"htmlarea/locallang_msg.php";s:4:"655e";s:31:"htmlarea/locallang_tooltips.php";s:4:"c0db";s:31:"htmlarea/popupwin-compressed.js";s:4:"66da";s:20:"htmlarea/popupwin.js";s:4:"e00b";s:43:"htmlarea/plugins/SpellChecker/locallang.php";s:4:"3a7a";s:51:"htmlarea/plugins/SpellChecker/spell-check-logic.php";s:4:"d41e";s:51:"htmlarea/plugins/SpellChecker/spell-check-style.css";s:4:"d526";s:47:"htmlarea/plugins/SpellChecker/spell-check-ui.js";s:4:"69d2";s:57:"htmlarea/plugins/SpellChecker/spell-checker-compressed.js";s:4:"cf81";s:46:"htmlarea/plugins/SpellChecker/spell-checker.js";s:4:"9082";s:67:"htmlarea/plugins/SpellChecker/popups/spell-check-ui-iso-8859-1.html";s:4:"62b8";s:56:"htmlarea/plugins/SpellChecker/popups/spell-check-ui.html";s:4:"7561";s:46:"htmlarea/plugins/TableOperations/locallang.php";s:4:"1e76";s:63:"htmlarea/plugins/TableOperations/table-operations-compressed.js";s:4:"9950";s:52:"htmlarea/plugins/TableOperations/table-operations.js";s:4:"c39e";s:55:"htmlarea/plugins/ContextMenu/context-menu-compressed.js";s:4:"ed75";s:44:"htmlarea/plugins/ContextMenu/context-menu.js";s:4:"3933";s:42:"htmlarea/plugins/ContextMenu/locallang.php";s:4:"8e25";s:52:"htmlarea/plugins/DynamicCSS/dynamiccss-compressed.js";s:4:"0e6d";s:42:"htmlarea/plugins/DynamicCSS/dynamiccss.css";s:4:"a152";s:41:"htmlarea/plugins/DynamicCSS/dynamiccss.js";s:4:"351b";s:41:"htmlarea/plugins/DynamicCSS/locallang.php";s:4:"359d";s:42:"htmlarea/plugins/SelectColor/locallang.php";s:4:"7dcd";s:55:"htmlarea/plugins/SelectColor/select-color-compressed.js";s:4:"f265";s:44:"htmlarea/plugins/SelectColor/select-color.js";s:4:"5e48";s:44:"htmlarea/plugins/TYPO3Browsers/locallang.php";s:4:"02bb";s:58:"htmlarea/plugins/TYPO3Browsers/typo3browsers-compressed.js";s:4:"8e83";s:47:"htmlarea/plugins/TYPO3Browsers/typo3browsers.js";s:4:"310a";s:47:"htmlarea/plugins/TYPO3Browsers/img/download.gif";s:4:"f6d9";s:52:"htmlarea/plugins/TYPO3Browsers/img/external_link.gif";s:4:"9e48";s:63:"htmlarea/plugins/TYPO3Browsers/img/external_link_new_window.gif";s:4:"6e8d";s:52:"htmlarea/plugins/TYPO3Browsers/img/internal_link.gif";s:4:"12b9";s:63:"htmlarea/plugins/TYPO3Browsers/img/internal_link_new_window.gif";s:4:"402a";s:43:"htmlarea/plugins/TYPO3Browsers/img/mail.gif";s:4:"d5a2";s:57:"htmlarea/plugins/InsertSmiley/insert-smiley-compressed.js";s:4:"f737";s:46:"htmlarea/plugins/InsertSmiley/insert-smiley.js";s:4:"3629";s:43:"htmlarea/plugins/InsertSmiley/locallang.php";s:4:"0f9e";s:54:"htmlarea/plugins/InsertSmiley/popups/insertsmiley.html";s:4:"f6d9";s:46:"htmlarea/plugins/InsertSmiley/smileys/0001.gif";s:4:"4aff";s:46:"htmlarea/plugins/InsertSmiley/smileys/0002.gif";s:4:"02c4";s:46:"htmlarea/plugins/InsertSmiley/smileys/0003.gif";s:4:"834f";s:46:"htmlarea/plugins/InsertSmiley/smileys/0004.gif";s:4:"fb6a";s:46:"htmlarea/plugins/InsertSmiley/smileys/0005.gif";s:4:"2a48";s:46:"htmlarea/plugins/InsertSmiley/smileys/0006.gif";s:4:"f970";s:46:"htmlarea/plugins/InsertSmiley/smileys/0007.gif";s:4:"97ee";s:46:"htmlarea/plugins/InsertSmiley/smileys/0008.gif";s:4:"10a6";s:46:"htmlarea/plugins/InsertSmiley/smileys/0009.gif";s:4:"1907";s:46:"htmlarea/plugins/InsertSmiley/smileys/0010.gif";s:4:"9ee6";s:46:"htmlarea/plugins/InsertSmiley/smileys/0011.gif";s:4:"ae73";s:46:"htmlarea/plugins/InsertSmiley/smileys/0012.gif";s:4:"f058";s:46:"htmlarea/plugins/InsertSmiley/smileys/0013.gif";s:4:"3ed8";s:46:"htmlarea/plugins/InsertSmiley/smileys/0014.gif";s:4:"a948";s:46:"htmlarea/plugins/InsertSmiley/smileys/0015.gif";s:4:"218d";s:46:"htmlarea/plugins/InsertSmiley/smileys/0016.gif";s:4:"3539";s:46:"htmlarea/plugins/InsertSmiley/smileys/0017.gif";s:4:"ee2e";s:46:"htmlarea/plugins/InsertSmiley/smileys/0018.gif";s:4:"8c66";s:46:"htmlarea/plugins/InsertSmiley/smileys/0019.gif";s:4:"ac36";s:46:"htmlarea/plugins/InsertSmiley/smileys/0020.gif";s:4:"71ef";s:43:"htmlarea/plugins/RemoveFormat/locallang.php";s:4:"8b6a";s:57:"htmlarea/plugins/RemoveFormat/remove-format-compressed.js";s:4:"040c";s:46:"htmlarea/plugins/RemoveFormat/remove-format.js";s:4:"3a56";s:54:"htmlarea/plugins/RemoveFormat/popups/removeformat.html";s:4:"55c3";s:55:"htmlarea/plugins/FindReplace/find-replace-compressed.js";s:4:"b0b5";s:44:"htmlarea/plugins/FindReplace/find-replace.js";s:4:"3174";s:46:"htmlarea/plugins/FindReplace/find_replace.html";s:4:"d718";s:41:"htmlarea/plugins/FindReplace/fr_engine.js";s:4:"3482";s:42:"htmlarea/plugins/FindReplace/locallang.php";s:4:"cf9b";s:53:"htmlarea/plugins/FindReplace/popups/find_replace.html";s:4:"3220";s:39:"htmlarea/plugins/QuickTag/locallang.php";s:4:"44ad";s:49:"htmlarea/plugins/QuickTag/quick-tag-compressed.js";s:4:"32f4";s:38:"htmlarea/plugins/QuickTag/quick-tag.js";s:4:"19a8";s:36:"htmlarea/plugins/QuickTag/tag-lib.js";s:4:"4b7d";s:45:"htmlarea/plugins/QuickTag/img/ed_quicktag.gif";s:4:"b783";s:46:"htmlarea/plugins/QuickTag/popups/quicktag.html";s:4:"7115";s:57:"htmlarea/plugins/CharacterMap/character-map-compressed.js";s:4:"3137";s:46:"htmlarea/plugins/CharacterMap/character-map.js";s:4:"2882";s:43:"htmlarea/plugins/CharacterMap/locallang.php";s:4:"4142";s:58:"htmlarea/plugins/CharacterMap/popups/select_character.html";s:4:"d31a";s:50:"htmlarea/plugins/InlineCSS/inlinecss-compressed.js";s:4:"0498";s:39:"htmlarea/plugins/InlineCSS/inlinecss.js";s:4:"a030";s:40:"htmlarea/plugins/InlineCSS/locallang.php";s:4:"c2c6";s:43:"htmlarea/plugins/UserElements/locallang.php";s:4:"e6d8";s:57:"htmlarea/plugins/UserElements/user-elements-compressed.js";s:4:"60c2";s:46:"htmlarea/plugins/UserElements/user-elements.js";s:4:"e90a";s:46:"htmlarea/plugins/Acronym/acronym-compressed.js";s:4:"aa5b";s:35:"htmlarea/plugins/Acronym/acronym.js";s:4:"eb91";s:38:"htmlarea/plugins/Acronym/locallang.php";s:4:"1040";s:26:"htmlarea/popups/about.html";s:4:"8abd";s:26:"htmlarea/popups/blank.html";s:4:"e697";s:32:"htmlarea/popups/editor_help.html";s:4:"398a";s:33:"htmlarea/popups/insert_image.html";s:4:"7c95";s:33:"htmlarea/popups/insert_table.html";s:4:"5473";s:25:"htmlarea/popups/link.html";s:4:"109a";s:24:"htmlarea/popups/popup.js";s:4:"8fbb";s:33:"htmlarea/popups/select_color.html";s:4:"2a08";s:50:"htmlarea/skins/default/htmlarea-edited-content.css";s:4:"c436";s:35:"htmlarea/skins/default/htmlarea.css";s:4:"c3af";s:42:"htmlarea/skins/default/images/ed_about.gif";s:4:"2763";s:49:"htmlarea/skins/default/images/ed_align_center.gif";s:4:"419a";s:50:"htmlarea/skins/default/images/ed_align_justify.gif";s:4:"9c31";s:47:"htmlarea/skins/default/images/ed_align_left.gif";s:4:"9c22";s:48:"htmlarea/skins/default/images/ed_align_right.gif";s:4:"9386";s:40:"htmlarea/skins/default/images/ed_all.gif";s:4:"42e8";s:42:"htmlarea/skins/default/images/ed_blank.gif";s:4:"0208";s:44:"htmlarea/skins/default/images/ed_charmap.gif";s:4:"a9ba";s:45:"htmlarea/skins/default/images/ed_color_bg.gif";s:4:"c6e2";s:45:"htmlarea/skins/default/images/ed_color_fg.gif";s:4:"5d7f";s:41:"htmlarea/skins/default/images/ed_copy.gif";s:4:"4f55";s:43:"htmlarea/skins/default/images/ed_custom.gif";s:4:"e7b2";s:40:"htmlarea/skins/default/images/ed_cut.gif";s:4:"1b00";s:43:"htmlarea/skins/default/images/ed_delete.gif";s:4:"926b";s:48:"htmlarea/skins/default/images/ed_format_bold.gif";s:4:"f4f6";s:50:"htmlarea/skins/default/images/ed_format_italic.gif";s:4:"a800";s:50:"htmlarea/skins/default/images/ed_format_strike.gif";s:4:"3aa0";s:47:"htmlarea/skins/default/images/ed_format_sub.gif";s:4:"a840";s:47:"htmlarea/skins/default/images/ed_format_sup.gif";s:4:"cad7";s:53:"htmlarea/skins/default/images/ed_format_underline.gif";s:4:"505a";s:41:"htmlarea/skins/default/images/ed_help.gif";s:4:"e7fc";s:39:"htmlarea/skins/default/images/ed_hr.gif";s:4:"ff70";s:41:"htmlarea/skins/default/images/ed_html.gif";s:4:"fa6e";s:42:"htmlarea/skins/default/images/ed_image.gif";s:4:"4ab7";s:48:"htmlarea/skins/default/images/ed_indent_less.gif";s:4:"8503";s:48:"htmlarea/skins/default/images/ed_indent_more.gif";s:4:"3835";s:50:"htmlarea/skins/default/images/ed_left_to_right.gif";s:4:"a0f9";s:41:"htmlarea/skins/default/images/ed_link.gif";s:4:"44fe";s:48:"htmlarea/skins/default/images/ed_list_bullet.gif";s:4:"236b";s:45:"htmlarea/skins/default/images/ed_list_num.gif";s:4:"48d3";s:42:"htmlarea/skins/default/images/ed_paste.gif";s:4:"fbd2";s:41:"htmlarea/skins/default/images/ed_redo.gif";s:4:"e9e8";s:50:"htmlarea/skins/default/images/ed_right_to_left.gif";s:4:"5149";s:45:"htmlarea/skins/default/images/ed_splitcel.gif";s:4:"2c04";s:41:"htmlarea/skins/default/images/ed_undo.gif";s:4:"b9ba";s:43:"htmlarea/skins/default/images/ed_unlink.gif";s:4:"a416";s:46:"htmlarea/skins/default/images/insert_table.gif";s:4:"bf88";s:57:"htmlarea/skins/default/images/CharacterMap/ed_charmap.gif";s:4:"5aa6";s:54:"htmlarea/skins/default/images/QuickTag/ed_quicktag.gif";s:4:"b783";s:53:"htmlarea/skins/default/images/FindReplace/ed_find.gif";s:4:"d01c";s:56:"htmlarea/skins/default/images/InsertSmiley/ed_smiley.gif";s:4:"810e";s:58:"htmlarea/skins/default/images/SpellChecker/spell-check.gif";s:4:"15cf";s:58:"htmlarea/skins/default/images/SelectColor/CO-forecolor.gif";s:4:"5d7f";s:60:"htmlarea/skins/default/images/SelectColor/CO-hilitecolor.gif";s:4:"c6e2";s:61:"htmlarea/skins/default/images/TableOperations/cell-delete.gif";s:4:"031c";s:67:"htmlarea/skins/default/images/TableOperations/cell-insert-after.gif";s:4:"4d36";s:68:"htmlarea/skins/default/images/TableOperations/cell-insert-before.gif";s:4:"9ead";s:60:"htmlarea/skins/default/images/TableOperations/cell-merge.gif";s:4:"a2d2";s:59:"htmlarea/skins/default/images/TableOperations/cell-prop.gif";s:4:"bf67";s:60:"htmlarea/skins/default/images/TableOperations/cell-split.gif";s:4:"d87c";s:60:"htmlarea/skins/default/images/TableOperations/col-delete.gif";s:4:"b0f6";s:66:"htmlarea/skins/default/images/TableOperations/col-insert-after.gif";s:4:"f5f7";s:67:"htmlarea/skins/default/images/TableOperations/col-insert-before.gif";s:4:"5711";s:59:"htmlarea/skins/default/images/TableOperations/col-split.gif";s:4:"eacc";s:62:"htmlarea/skins/default/images/TableOperations/insert_table.gif";s:4:"c1db";s:60:"htmlarea/skins/default/images/TableOperations/row-delete.gif";s:4:"7cdb";s:66:"htmlarea/skins/default/images/TableOperations/row-insert-above.gif";s:4:"d034";s:66:"htmlarea/skins/default/images/TableOperations/row-insert-under.gif";s:4:"59f9";s:58:"htmlarea/skins/default/images/TableOperations/row-prop.gif";s:4:"b11e";s:59:"htmlarea/skins/default/images/TableOperations/row-split.gif";s:4:"a712";s:60:"htmlarea/skins/default/images/TableOperations/table-prop.gif";s:4:"2a21";s:64:"htmlarea/skins/default/images/TableOperations/toggle-borders.gif";s:4:"ae22";s:56:"htmlarea/skins/default/images/TYPO3Browsers/ed_image.gif";s:4:"f91c";s:55:"htmlarea/skins/default/images/TYPO3Browsers/ed_link.gif";s:4:"9a55";s:57:"htmlarea/skins/default/images/TYPO3Browsers/ed_unlink.gif";s:4:"2ca8";s:55:"htmlarea/skins/default/images/RemoveFormat/ed_clean.gif";s:4:"c936";s:54:"htmlarea/skins/default/images/UserElements/ed_user.gif";s:4:"a294";s:52:"htmlarea/skins/default/images/Acronym/ed_acronym.gif";s:4:"a2c5";s:32:"pi1/class.tx_rtehtmlarea_pi1.php";s:4:"8503";s:17:"pi1/locallang.php";s:4:"f576";s:32:"pi2/class.tx_rtehtmlarea_pi2.php";s:4:"bdc1";s:14:"doc/manual.sxw";s:4:"9ffd";}',
);

?>