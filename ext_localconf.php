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
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['dictionaryList'] = $_EXTCONF["dictionaryList"] ? $_EXTCONF["dictionaryList"] : 'en';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['defaultDictionary'] = $_EXTCONF["defaultDictionary"] ? $_EXTCONF["defaultDictionary"] : 'en';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['AspellDirectory'] = $_EXTCONF["AspellDirectory"] ? $_EXTCONF["AspellDirectory"] : '/usr/bin/aspell';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['noSpellCheckLanguages'] = $_EXTCONF["noSpellCheckLanguages"] ? $_EXTCONF["noSpellCheckLanguages"] : 'ja,km,ko,lo,th,zh,b5,gb';
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$_EXTKEY]['HTMLAreaPluginList'] = $_EXTCONF["HTMLAreaPluginList"] ? $_EXTCONF["HTMLAreaPluginList"] : 'TableOperations,SpellChecker,ContextMenu,SelectColor,TYPO3Browsers,InsertSmiley,FindReplace,RemoveFormat,CharacterMap,QuickTag,InlineCSS,DynamicCSS';

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
		default.skin = EXT:' . $_EXTKEY . '/htmlarea/skins/default/htmlarea.css
		default.contentCSS = EXT:' . $_EXTKEY . '/htmlarea/plugins/DynamicCSS/dynamiccss.css
		default.enableWordClean = 1
		default.useCSS = 1
		default.defaultLinkTarget =
		default.showStatusBar = 1
		default.showButtons = *
		default.hideButtons =
		default.disableContextMenu = 0
		default.disableSelectColor = 0
		default.disableTYPO3Browsers = 0
		default.disableEnterParagraphs = 0
		default.hidePStyleItems =
		default.hideFontSizes =
		default.hideTags = font, font (full)
		default.disableColorPicker = 0
		default.classesCharacter = 
		default.classesImage = float-right, blue-background
		default.classesAnchor = 
		default.showTagFreeClasses = 0

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

				// XHTML COMPLIANCE
				xhtml_cleaning = 1
			}
		}
			## tt_content RTE configuration
		config.tt_content.bodytext.showButtons = *
	}

		## default front end RTE configuration
	RTE.default.FE < RTE.default
	RTE.default.FE.showStatusBar = 0
	RTE.default.FE.hideButtons = chMode

		## tt_content TCEFORM configuration
	TCEFORM.tt_content.bodytext.RTEfullScreenWidth= 100%
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
		default.skin = EXT:' . $_EXTKEY . '/htmlarea/skins/default/htmlarea.css
		default.contentCSS = EXT:' . $_EXTKEY . '/htmlarea/plugins/DynamicCSS/dynamiccss.css
		default.enableWordClean = 1
		default.useCSS = 1
		default.defaultLinkTarget =
		default.showStatusBar =  0
		default.showButtons =  bold,italic,underline,textindicator,copy,cut,paste,undo,redo,about
		default.hideButtons = 
		default.disableContextMenu = 0
		default.disableSelectColor = 0
		default.disableTYPO3Browsers = 0
		default.disableEnterParagraphs = 0
		default.hidePStyleItems =
		default.hideFontSizes =
		default.hideTags = 
		default.disableColorPicker = 1
		default.classesCharacter = 
		default.classesImage = 
		default.classesAnchor = 
		default.showTagFreeClasses = 0

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
		## default front end RTE configuration
	RTE.default.FE < RTE.default
	RTE.default.FE.showStatusBar = 0
	RTE.default.FE.hideButtons = chMode

		## tt_content TCEFORM configuration
	TCEFORM.tt_content.bodytext.RTEfullScreenWidth= 100%
	');
}
?>
