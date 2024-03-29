<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2005 Stanislas Rolland <stanislas.rolland(arobas)fructifor.ca>
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
 * Configuration of the htmlArea RTE extension
 *
 * @author	Stanislas Rolland <stanislas.rolland(arobas)fructifor.ca>
 *
 * $Id$  *
 */

if (!defined ("TYPO3_MODE")) 	die ("Access denied.");

// Configuration of class ux_parsehtml_proc extending class t3lib_parsehtml_proc for TYPO3 older than 4.0
if (t3lib_div::int_from_ver(TYPO3_VERSION) < 4000000 ) {
	$TYPO3_CONF_VARS[TYPO3_MODE]["XCLASS"]["t3lib/class.t3lib_parsehtml_proc.php"] = t3lib_extMgm::extPath($_EXTKEY)."class.ux_t3lib_parsehtml_proc.php";
}

if(!$TYPO3_CONF_VARS['BE']['RTEenabled'])  $TYPO3_CONF_VARS['BE']['RTEenabled'] = 1;

// Registering the RTE object
$TYPO3_CONF_VARS['BE']['RTE_reg'][$_EXTKEY] = array('objRef' => 'EXT:'.$_EXTKEY.'/class.tx_rtehtmlarea_base.php:&tx_rtehtmlarea_base');

$_EXTCONF = unserialize($_EXTCONF);    // unserializing the configuration so we can use it here:

$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['defaultConfiguration'] = $_EXTCONF['defaultConfiguration'] ? $_EXTCONF['defaultConfiguration'] : 'Typical';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['enableImages'] = $_EXTCONF['enableImages'] ? $_EXTCONF['enableImages'] : 0;
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['enableMozillaExtension'] = $_EXTCONF['enableMozillaExtension'] ? $_EXTCONF['enableMozillaExtension'] : 0;
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['mozAllowClipboardUrl'] = $_EXTCONF['mozAllowClipboardUrl'] ? $_EXTCONF['mozAllowClipboardUrl'] : 'http://ftp.mozilla.org/pub/mozilla.org/extensions/allowclipboard_helper/allowclipboard_helper-0.3.4-fx+mz.xpi';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['forceCommandMode'] = $_EXTCONF["forceCommandMode"] ? $_EXTCONF["forceCommandMode"] : 0;
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['enableDebugMode'] = $_EXTCONF['enableDebugMode'] ? $_EXTCONF['enableDebugMode'] : 0;
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['enableCompressedScripts'] = $_EXTCONF['enableCompressedScripts'] ? $_EXTCONF['enableCompressedScripts'] : 0;
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['dictionaryList'] = $_EXTCONF["dictionaryList"] ? $_EXTCONF["dictionaryList"] : 'en';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['defaultDictionary'] = $_EXTCONF["defaultDictionary"] ? $_EXTCONF["defaultDictionary"] : 'en';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['AspellDirectory'] = $_EXTCONF["AspellDirectory"] ? $_EXTCONF["AspellDirectory"] : '/usr/bin/aspell';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages'] = $_EXTCONF["noSpellCheckLanguages"] ? $_EXTCONF["noSpellCheckLanguages"] : 'ja,km,ko,lo,th,zh,b5,gb';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList'] = $_EXTCONF["HTMLAreaPluginList"] ? $_EXTCONF["HTMLAreaPluginList"] : 'TableOperations,SpellChecker,ContextMenu,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace,RemoveFormat,CharacterMap,QuickTag,InlineCSS,DynamicCSS,UserElements,TYPO3HtmlParser';
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['plainImageMaxWidth'] = $_EXTCONF['plainImageMaxWidth'] ? $_EXTCONF['plainImageMaxWidth'] : 640;
$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['plainImageMaxHeight'] = $_EXTCONF['plainImageMaxHeight'] ? $_EXTCONF['plainImageMaxHeight'] : 680;

//$TYPO3_CONF_VARS['EXTCONF']['rtehtmlarea']['safari_test'] = 1;
//$TYPO3_CONF_VARS['EXTCONF']['rtehtmlarea']['opera_test'] = 1;

	// Add default RTE transformation configuration
t3lib_extMgm::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:' . $_EXTKEY . '/pageTSConfigProc.txt">');

	// Add default Page TSonfig RTE configuration
t3lib_extMgm::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:' . $_EXTKEY . '/pageTSConfig' .$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['defaultConfiguration'] . '.txt">');

	// Add default Page TSonfig RTE configuration for enabling images with the Typical default configuration
if (($TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['defaultConfiguration'] == 'Typical') && $TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['enableImages']) {
	t3lib_extMgm::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:' . $_EXTKEY . '/pageTSConfigImage.txt">');
}

	// Add default User TSonfig RTE configuration
t3lib_extMgm::addUserTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:' . $_EXTKEY . '/userTSConfig' .$TYPO3_CONF_VARS['EXTCONF'][$_EXTKEY]['defaultConfiguration'] . '.txt">');

	// Configure Lorem Ipsum hook to insert nonsense in wysiwyg mode
if (t3lib_extMgm::isLoaded('lorem_ipsum') && (TYPO3_MODE == 'BE')) {
    $TYPO3_CONF_VARS['EXTCONF']['lorem_ipsum']['RTE_insert'][] = 'tx_rtehtmlarea_base->loremIpsumInsert';
}

?>
