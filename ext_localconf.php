<?php
if (!defined ("TYPO3_MODE")) 	die ("Access denied.");

// Configuration of class ux_parsehtml_proc extending class t3lib_parsehtml_proc
$TYPO3_CONF_VARS[TYPO3_MODE]["XCLASS"]["t3lib/class.t3lib_parsehtml_proc.php"]=t3lib_extMgm::extPath($_EXTKEY)."class.ux_t3lib_parsehtml_proc.php";

if(!$TYPO3_CONF_VARS['BE']['RTEenabled'])  $TYPO3_CONF_VARS['BE']['RTEenabled'] = 1;
$TYPO3_CONF_VARS['BE']['RTE_reg'][$_EXTKEY] = array('objRef' => 'EXT:'.$_EXTKEY.'/class.tx_rtehtmlarea_base.php:&tx_rtehtmlarea_base');

$_EXTCONF = unserialize($_EXTCONF);    // unserializing the configuration so we can use it here:

$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['enableAllOptions'] = $_EXTCONF["enableAllOptions"] ? $_EXTCONF["enableAllOptions"] : 0;
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['enableMozillaExtension'] = $_EXTCONF["enableMozillaExtension"] ? $_EXTCONF["enableMozillaExtension"] : 0;
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['forceCommandMode'] = $_EXTCONF["forceCommandMode"] ? $_EXTCONF["forceCommandMode"] : 0;
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['enableDebugMode'] = $_EXTCONF['enableDebugMode'] ? $_EXTCONF['enableDebugMode'] : 0;
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['dictionaryList'] = $_EXTCONF["dictionaryList"] ? $_EXTCONF["dictionaryList"] : 'en';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['defaultDictionary'] = $_EXTCONF["defaultDictionary"] ? $_EXTCONF["defaultDictionary"] : 'en';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['AspellDirectory'] = $_EXTCONF["AspellDirectory"] ? $_EXTCONF["AspellDirectory"] : '/usr/bin/aspell';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages'] = $_EXTCONF["noSpellCheckLanguages"] ? $_EXTCONF["noSpellCheckLanguages"] : 'ja,km,ko,lo,th,zh,b5,gb';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList'] = $_EXTCONF["HTMLAreaPluginList"] ? $_EXTCONF["HTMLAreaPluginList"] : 'TableOperations,SpellChecker,ContextMenu,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace,RemoveFormat,CharacterMap,QuickTag,InlineCSS,DynamicCSS,UserElements';

//$GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['rtehtmlarea']['safari_test'] = 1;

if ($_EXTCONF["enableAllOptions"])  {

	t3lib_extMgm::addUserTSConfig('
		setup.default.edit_RTE = 1
		options.HTMLAreaPspellMode = normal
		options.RTEkeyList = *
		');

	// options.HTMLAreaPspellMode may be PSPELL_FAST or PSPELL_NORMAL or PSPELL_BAD_SPELLERS
	// see http://ca3.php.net/manual/en/function.pspell-config-mode.php

	t3lib_extMgm::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:' . $_EXTKEY . '/pageTSConfigFull.txt">');

} else {

	t3lib_extMgm::addUserTSConfig('
		setup.default.edit_RTE = 1
		options.HTMLAreaPspellMode = normal
		options.RTEkeyList = bold, italic, underline, textindicator, copy, cut, paste, undo, redo, about
		');

	t3lib_extMgm::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:' . $_EXTKEY . '/pageTSConfigMinimal.txt">');
}
?>
