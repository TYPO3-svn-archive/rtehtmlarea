<?php
if (!defined ("TYPO3_MODE")) 	die ("Access denied.");

if(!$TYPO3_CONF_VARS['BE']['RTEenabled'])  $TYPO3_CONF_VARS['BE']['RTEenabled'] = 1;

$TYPO3_CONF_VARS['BE']['RTE_reg'][$_EXTKEY] = array('objRef' => 'EXT:'.$_EXTKEY.'/class.tx_rtepbhtmlarea_base.php:&tx_rtepbhtmlarea_base');

if(!is_array($GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY])) {
		$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY] = array( 
				'dictionaryList' => 'en', 
				'defaultDictionary' => 'en',
				'noSpellCheckLanguages' => 'ja,km,ko,lo,th,zh,b5,gb,ja-enc,ja-jis,ja-sjis,ja-utf8',
				'AspellDirectory' => '/usr/bin/aspell',
				'forceCommandMode' => 0,
				'HTMLAreaPluginList' => 'TableOperations,SpellChecker,ContextMenu,DynamicCSS,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace',
		);
} else {
		if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['dictionaryList']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['dictionaryList'] = 'en';
		if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['defaultDictionary']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['defaultDictionary'] = 'fr';
		if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages'] = 'ja,km,ko,lo,th,zh,b5,gb,ja-enc,ja-jis,ja-sjis,ja-utf8';
		if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['AspellDirectory']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['AspellDirectory'] = '/usr/bin/aspell';
		if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['forceCommandMode']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['forceCommandMode'] = 0;
		if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList'] = 'TableOperations,SpellChecker,ContextMenu,DynamicCSS,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace';
}

// regarding 'noSpellCheckLanguages', see http://aspell.net/man-html/Unsupported.html#Unsupported


t3lib_extMgm::addUserTSConfig('
		setup.default.edit_RTE = 1
		options.HTMLAreaPluginList = TableOperations, SpellChecker, ContextMenu, DynamicCSS, SelectColor, TYPO3Browsers, InsertSmiley, FindReplace
		options.HTMLAreaPspellMode = normal
		options.RTEkeyList = fontstyle,fontsize,formatblock,bold,italic,underline,strikethrough,superscript,subscript,left,center,right,justifyfull,lefttoright,righttoleft,orderedlist,unorderedlist,outdent,indent,textcolor,bgcolor,textindicator,line,link,image,table,chMode,copy,cut,paste,undo,redo,about
		');

// options.HTMLAreaPspellMode may be PSPELL_FAST or PSPELL_NORMAL or PSPELL_BAD_SPELLERS
// see http://ca3.php.net/manual/en/function.pspell-config-mode.php


// Preserving <table>-html tags by default
t3lib_extMgm::addPageTSConfig('
		RTE.default.proc.preserveTables = 1
		RTE.default.contentCSS = EXT:$_EXTKEY/htmlarea/plugins/DynamicCSS/dynamiccss.css
		RTE.default.enableWordClean = 1
		RTE.default.showButtons =  *
		RTE.default.hideButtons =
		RTE.default.proc.overruleMode = ts_css
		RTE.defaultproc.entryHTMLparser_db.allowTags = table, tbody, tr, th, td, h1, h2, h3, h4, h5, h6, div, p, br, span, ul, ol, li, pre, blockquote, strong, em, b, i, u, sub, sup, strike, a, img, nobr, hr, center, font

		## Setting these defaults for the eventual front end RTE:
		RTE.default.HTMLAreaPluginList = TableOperations, SpellChecker, ContextMenu, DynamicCSS, InsertSmiley, FindReplace
		RTE.default.HTMLAreaPspellMode = normal
		');

?>
