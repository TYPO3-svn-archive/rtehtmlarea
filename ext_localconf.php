<?php
if (!defined ("TYPO3_MODE")) 	die ("Access denied.");

// Configuring of class ux_parsehtml_proc extending class t3lib_parsehtml_proc:
$TYPO3_CONF_VARS[TYPO3_MODE]["XCLASS"]["t3lib/class.t3lib_parsehtml_proc.php"]=t3lib_extMgm::extPath($_EXTKEY)."class.ux_t3lib_parsehtml_proc.php";

if(!$TYPO3_CONF_VARS['BE']['RTEenabled'])  $TYPO3_CONF_VARS['BE']['RTEenabled'] = 1;

$TYPO3_CONF_VARS['BE']['RTE_reg'][$_EXTKEY] = array('objRef' => 'EXT:'.$_EXTKEY.'/class.tx_rtehtmlarea_base.php:&tx_rtehtmlarea_base');

if(!is_array($GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY])) {
		// regarding 'noSpellCheckLanguages', see http://aspell.net/man-html/Unsupported.html#Unsupported
	$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY] = array( 
		'dictionaryList' => 'en', 
		'defaultDictionary' => 'en',
		'noSpellCheckLanguages' => 'ja,km,ko,lo,th,zh,b5,gb,ja-enc,ja-jis,ja-sjis,ja-utf8',
		'AspellDirectory' => '/usr/bin/aspell',
		'forceCommandMode' => 0,
		'HTMLAreaPluginList' => 'TableOperations,SpellChecker,ContextMenu,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace,RemoveFormat,CharacterMap,QuickTag,InlineCSS,DynamicCSS',
		'enableMozillaExtension' => 1,
	);
} else {
	if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['dictionaryList']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['dictionaryList'] = 'en';
	if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['defaultDictionary']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['defaultDictionary'] = 'fr';
	if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages'] = 'ja,km,ko,lo,th,zh,b5,gb,ja-enc,ja-jis,ja-sjis,ja-utf8';
	if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['AspellDirectory']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['AspellDirectory'] = '/usr/bin/aspell';
	if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['forceCommandMode']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['forceCommandMode'] = 0;
	if(!$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList']) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList'] = 'TableOperations,SpellChecker,ContextMenu,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace,RemoveFormat,CharacterMap,QuickTag,InlineCSS,DynamicCSS';
	if(!isset($GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['enableMozillaExtension'])) $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['enableMozillaExtension'] = 1;
}

$_EXTCONF = unserialize($_EXTCONF);    // unserializing the configuration so we can use it here:

if ($_EXTCONF["enableAllOptions"])  {

	t3lib_extMgm::addUserTSConfig('
		setup.default.edit_RTE = 1
		options.HTMLAreaPspellMode = normal
		options.RTEkeyList = *
		');

	// options.HTMLAreaPspellMode may be PSPELL_FAST or PSPELL_NORMAL or PSPELL_BAD_SPELLERS
	// see http://ca3.php.net/manual/en/function.pspell-config-mode.php

	t3lib_extMgm::addPageTSConfig('
	RTE {
			## Default RTE configuration
		default.contentCSS = EXT:' . $_EXTKEY . '/htmlarea/plugins/DynamicCSS/dynamiccss.css
		default.enableWordClean = 1
		default.useCSS = 1
		default.defaultLinkTarget =
		default.showStatusBar =  1
		default.showButtons =  *
		default.hideButtons =
		default.disableContextMenu = 0
		default.disableColorSelect = 0
		default.disableTYPO3Browsers = 0
		default.disableEnterParagraphs = 0
		default.hidePStyleItems =
		default.hideFontSizes =
		default.hideTags = font, font (full)
		default.disableColorPicker = 0
		default.classesCharacter = quote, highlight, deprecated

			## Default proc rules
		default.proc {

			// TRANSFORMATION METHOD
			overruleMode = ts_css

			// LINES CONVERSION
			dontConvBRtoParagraph = 1

			// SPLIT CONTENT INTO FONT TAG CHUNKS
			internalizeFontTags = 1

			// TAGS ALLOWED OUTSIDE P & DIV
			allowTagsOutside = img,hr

			// TAGS ALLOWED IN TYPOLISTS
			allowTagsInTypolists = br,font,b,i,u,a,img,span

			// TAGS ALLOWED
			allowTags = table, tbody, tr, th, td, h1, h2, h3, h4, h5, h6, div, p, br, span, ul, ol, li, pre, blockquote, strong, em, b, i, u, sub, sup, strike, a, img, nobr, hr, center, font, tt, q, cite, abbr, acronym

			// TAGS DENIED
			denyTags >

			// ALLOWED P & DIV ATTRIBUTES
			keepPDIVattribs = align,class,style

			// ALLOW TABLES
			preserveTables = 1 

			// CONTENT TO RTE
			HTMLparser_rte {

				// TAGS ALLOWED
				allowTags < RTE.default.proc.allowTags

				// DO NOT REMOVE UNMATCHED TAGS
				keepNonMatchedTags = 1
			}

			// CONTENT TO DATABASE
			HTMLparser_db {

				// TAGS ALLOWED
				allowTags < RTE.default.proc.allowTags

				// NO ATTRIBUTES ALLOWED ON THESE TAGS
				noAttrib = b,i,u,br,center,sub,sup,strong,em,blockquote,strike,tt

				// DO NOT REMOVE UNMATCHED TAGS
				keepNonMatchedTags = 1
			}
		}

			## tt_content RTE configuration
		config.tt_content.bodytext.showButtons  = *

			## Setting these defaults for the eventual front end RTE:
		default.HTMLAreaPluginList = SpellChecker, ContextMenu, InsertSmiley, FindReplace
		default.HTMLAreaPspellMode = normal
	}
		');
} else {

	t3lib_extMgm::addUserTSConfig('
		setup.default.edit_RTE = 1
		options.HTMLAreaPspellMode = normal
		options.RTEkeyList = bold, italic, underline, textindicator, copy, cut, paste, undo, redo, about
		');

	// options.HTMLAreaPspellMode may be PSPELL_FAST or PSPELL_NORMAL or PSPELL_BAD_SPELLERS
	// see http://ca3.php.net/manual/en/function.pspell-config-mode.php

	//Default RTE configuration
	t3lib_extMgm::addPageTSConfig('
	RTE {
		default.contentCSS = EXT:' . $_EXTKEY . '/htmlarea/plugins/DynamicCSS/dynamiccss.css
		default.enableWordClean = 1
		default.useCSS = 1
		default.defaultLinkTarget =
		default.showStatusBar =  0
		default.showButtons =  bold,italic,underline,textindicator,copy,cut,paste,undo,redo,about
		default.hideButtons = 
		default.disableContextMenu = 0
		default.disableColorSelect = 0
		default.disableTYPO3Browsers = 0
		default.disableEnterParagraphs = 0
		default.hidePStyleItems =
		default.hideFontSizes =
		default.hideTags = 
		default.disableColorPicker = 1
		default.classesCharacter = 

		// DEFAULT PROC RULES
		default.proc {

			// TRANSFORMATION METHOD
			overruleMode = ts_css

			// LINES CONVERSION
			dontConvBRtoParagraph = 1

			// SPLIT CONTENT INTO FONT TAG CHUNKS
			internalizeFontTags = 1

			// TAGS ALLOWED OUTSIDE P & DIV
			allowTagsOutside = 

			// TAGS ALLOWED IN TYPOLISTS
			allowTagsInTypolists = br,font,b,i,u,a,img,span

			// TAGS ALLOWED
			allowTags = h1, h2, h3, h4, h5, h6, div, p, br, span, ul, ol, li, pre, blockquote, strong, em, b, i, u, sub, sup, strike, a, img, nobr, hr, center

			// TAGS DENIED
			denyTags >

			// ALLOWED P & DIV ATTRIBUTES
			keepPDIVattribs = class,style

			// ALLOW TABLES
			preserveTables = 0

			// CONTENT TO RTE
			HTMLparser_rte {

				// TAGS ALLOWED
				allowTags < RTE.default.proc.allowTags
			}

			// CONTENT TO DATABASE
			HTMLparser_db {

				// TAGS ALLOWED
				allowTags < RTE.default.proc.allowTags

				// NO ATTRIBUTES ALLOWED ON THESE TAGS
				noAttrib = b,i,u,br,center,sub,sup,strong,em,blockquote,strike
			}
		}
	}
		');
}
?>