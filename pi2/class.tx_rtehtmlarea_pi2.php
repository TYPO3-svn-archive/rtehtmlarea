<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2005 Stanislas Rolland (stanislas.rolland@fructifor.com)
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
 * Front end RTE based on htmlArea
 *
 * @author Stanislas Rolland <stanislas.rolland@fructifor.com>
 */

require_once(t3lib_extMgm::extPath('rtehtmlarea').'class.tx_rtehtmlarea_base.php');

class tx_rtehtmlarea_pi2 extends tx_rtehtmlarea_base {
		
		// External:

	var $RTEdivStyle;				// Alternative style for RTE <div> tag.
	var $extHttpPath;				// full Path to this extension for http (so no Server path). It ends with "/"
	var $rtePathImageFile;			// Path to the php-file for selection images
	var $rtePathLinkFile;			// Path to the php-file for create a link

		// For the editor
	var $elementId;
	var $elementParts;
	var $tscPID;
	var $typeVal;
	var $thePid;
	var $RTEsetup;
	var $thisConfig;
	var $confValues;
	var $language;
	var $spellCheckerLanguage;
	var $spellCheckerCharset;
	var $spellCheckerMode;
	var $specConf;
	var $LOCAL_LANG;

	/**
	 * Draws the RTE as an iframe
	 *
	 * @param	object		Reference to parent object, which is an instance of the TCEforms.
	 * @param	string		The table name
	 * @param	string		The field name
	 * @param	array		The current row from which field is being rendered
	 * @param	array		Array of standard content for rendering form fields from TCEforms. See TCEforms for details on this. Includes for instance the value and the form field name, java script actions and more.
	 * @param	array		"special" configuration - what is found at position 4 in the types configuration of a field from record, parsed into an array.
	 * @param	array		Configuration for RTEs; A mix between TSconfig and otherwise. Contains configuration for display, which buttons are enabled, additional transformation information etc.
	 * @param	string		Record "type" field value.
	 * @param	string		Relative path for images/links in RTE; this is used when the RTE edits content from static files where the path of such media has to be transformed forth and back!
	 * @param	integer		PID value of record (true parent page id)
	 * @return	string		HTML code for RTE!
	 */
	function drawRTE(&$pObj,$table,$field,$row,$PA,$specConf,$thisConfig,$RTEtypeVal,$RTErelPath,$thePidValue) {
			//call $this->transformContent
			//call $this->triggerField
                $this->TCEform = $pObj;
		$this->LOCAL_LANG = $GLOBALS['TSFE']->readLLfile('EXT:' . $this->ID . '/locallang.php');
		$this->client = $this->clientInfo();
		$this->typoVersion = t3lib_div::int_from_ver($GLOBALS['TYPO_VERSION']);

		/* =======================================
		 * INIT THE EDITOR-SETTINGS
		 * =======================================
		 */

			// first get the http-path to typo3:
		$this->httpTypo3Path = substr( substr( t3lib_div::getIndpEnv('TYPO3_SITE_URL'), strlen( t3lib_div::getIndpEnv('TYPO3_REQUEST_HOST') ) ), 0, -1 );
		if (strlen($this->httpTypo3Path) == 1) {
			$this->httpTypo3Path = "/";
		} else {
			$this->httpTypo3Path .= "/";
		}
			// Get the path to this extension:
		$this->extHttpPath = $this->httpTypo3Path.t3lib_extMgm::siteRelPath($this->ID);
			// Get the Path to the script for selecting an image
		$this->rtePathImageFile = $this->extHttpPath . 'rtehtmlarea_select_image.php';
			// Get the Path to the script for create a link
		$this->rtePathLinkFile = $this->extHttpPath . 'rtehtmlarea_browse_links.php';
			// Get the Path to the script for inserting a user element
		$this->rtePathUserFile = $this->extHttpPath . 'rtehtmlarea_user.php';
			// Get the site URL
		$this->siteURL = t3lib_div::getIndpEnv('TYPO3_SITE_URL');
			// Get the host URL
		$this->hostURL = t3lib_div::getIndpEnv('TYPO3_REQUEST_HOST');
			// Check if we should enable the Mozilla extension
		if($this->client['BROWSER'] == 'gecko' && $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['enableMozillaExtension'] && extension_loaded('zlib')) {
			$this->makeMozillaExtension();
		}

			// Element ID + pid
		$this->elementId = $PA['itemFormElName'];
		$this->elementParts[0] = $table;
		$this->elementParts[1] = $row['uid'];
		$this->tscPID = $thePidValue;
		$this->thePid = $thePidValue;

			// Record "type" field value:
		$this->typeVal = $RTEtypeVal; // TCA "type" value for record

		unset($this->RTEsetup);
		$pageTSConfig = $GLOBALS['TSFE']->getPagesTSconfig();
		$this->RTEsetup = $pageTSConfig['RTE.'];
		$this->thisConfig = $this->RTEsetup['default.'];
		$this->thisConfig = $this->thisConfig['FE.'];

			// Special configuration (line) and default extras:
		$this->specConf = $specConf;
			
			// Language
		$GLOBALS['TSFE']->initLLvars();
		$this->language = $GLOBALS['TSFE']->lang;
		if ($this->language=='default' || !$this->language)	{
			$this->language='en';
		}
			// Character set
		$this->csObj = t3lib_div::makeInstance('t3lib_cs');
		$this->charset = $GLOBALS['TSFE']->labelsCharset;
		if($this->typoVersion >= 3007000 ) {
			$this->OutputCharset  = $GLOBALS['TSFE']->metaCharset ? $GLOBALS['TSFE']->metaCharset : $GLOBALS['TSFE']->renderCharset;
		} else {
			$renderCharset = $GLOBALS['TSFE']->csConvObj->parse_charset($GLOBALS['TSFE']->config['config']['renderCharset'] ? $GLOBALS['TSFE']->config['config']['renderCharset'] : ($GLOBALS['TSFE']->TYPO3_CONF_VARS['BE']['forceCharset'] ? $GLOBALS['TSFE']->TYPO3_CONF_VARS['BE']['forceCharset'] : $GLOBALS['TSFE']->defaultCharSet));    // REndering charset of HTML page.
			$metaCharset = $GLOBALS['TSFE']->csConvObj->parse_charset($GLOBALS['TSFE']->config['config']['metaCharset'] ? $GLOBALS['TSFE']->config['config']['metaCharset'] : $renderCharset);
			$this->OutputCharset  = $metaCharset ? $metaCharset : $renderCharset;
		}
		/* =======================================
		 * TOOLBAR CONFIGURATION
		 * =======================================
		 */
			// htmlArea plugins list
		$this->pluginEnableArray = array_intersect(t3lib_div::trimExplode(',', $this->pluginList , 1), t3lib_div::trimExplode(',', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['HTMLAreaPluginList'], 1));
		$hidePlugins = array('TYPO3Browsers', 'UserElements', 'Acronym');
		if(!t3lib_extMgm::isLoaded('sr_static_info') || in_array($this->language, t3lib_div::trimExplode(',', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['noSpellCheckLanguages']))) $hidePlugins[] = 'SpellChecker';
		$this->pluginEnableArray = array_diff($this->pluginEnableArray, $hidePlugins);

			// Toolbar
		$this->setToolBar();

			// Check if some plugins need to be disabled
		$this->setPlugins();

		/* =======================================
		 * PLUGIN-SPECIFIC CONFIGURATION
		 * =======================================
		 */

		if( $this->isPluginEnable('SpellChecker') ) {
				// Set the language of the content for the SpellChecker
			$this->spellCheckerLanguage = $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['rtehtmlarea']['defaultDictionary'];
			if($row['sys_language_uid']) {
				$tableA = 'sys_language';
				$tableB = 'static_languages';
				$languagesUidsList = $row['sys_language_uid'];
				$selectFields = $tableA . '.uid,' . $tableB . '.lg_iso_2,' . $tableB . '.lg_country_iso_2,' . $tableB . '.lg_typo3';
				$table = $tableA . ' LEFT JOIN ' . $tableB . ' ON ' . $tableA . '.static_lang_isocode=' . $tableB . '.uid';
				$whereClause = $tableA . '.uid IN (' . $languagesUidsList . ') ';
				$whereClause .= $GLOBALS['TSFE']->cObj->enableFields($tableA);
				$res = $GLOBALS['TYPO3_DB']->exec_SELECTquery($selectFields, $table, $whereClause);
				while ( $languageRow = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res) ) {
					$this->spellCheckerLanguage = strtolower(trim($languageRow['lg_iso_2']).(trim($languageRow['lg_country_iso_2'])?'_'.trim($languageRow['lg_country_iso_2']):''));
					$this->spellCheckerTypo3Language = strtolower(trim($languageRow['lg_typo3']));
				}
			}
			$this->spellCheckerLanguage = $this->spellCheckerLanguage?$this->spellCheckerLanguage:$this->language;
			$this->spellCheckerTypo3Language = $this->spellCheckerTypo3Language?$this->spellCheckerTypo3Language:$GLOBALS['TSFE']->lang;
			if ($this->spellCheckerTypo3Language=='default') {
				$this->spellCheckerTypo3Language='en';
			}

				// Set the charset of the content for the SpellChecker
			$this->spellCheckerCharset = $this->csObj->$charSetArray[$this->spellCheckerTypo3Language];
			$this->spellCheckerCharset = $this->spellCheckerCharset ? $this->spellCheckerCharset : 'iso-8859-1';
			$this->spellCheckerCharset = trim($GLOBALS['TSFE']->config['config']['metaCharset']) ? trim($GLOBALS['TSFE']->config['config']['metaCharset']) : $this->spellCheckerCharset;

				// Set the SpellChecker mode
			$this->spellCheckerMode = isset($this->thisConfig['HTMLAreaPspellMode']) ? trim($this->thisConfig['HTMLAreaPspellMode']) : 'normal';
			if( !in_array($this->spellCheckerMode, $this->spellCheckerModes)) {
				$this->spellCheckerMode = 'normal';
			}
		}

		if( $this->isPluginEnable('QuickTag') && trim($this->thisConfig['hideTags'])) {
			$this->quickTagHideTags = implode(',', t3lib_div::trimExplode(',', $this->thisConfig['hideTags'], 1));
		}

		/* =======================================
		 * SET STYLES
		 * =======================================
		 */

		$RTEWidth = 460+($pObj->docLarge ? 150 : 0);
		$RTEHeight = 380;
		$editorWrapWidth = $RTEWidth . 'px';
		$editorWrapHeight = $RTEHeight . 'px';
		$this->RTEdivStyle = $this->RTEdivStyle ? $this->RTEdivStyle : 'position:relative; left:0px; top:0px; height:' . $RTEHeight . 'px; width:'.$RTEWidth.'px; border: 1px solid black;';
		$this->toolbar_level_size = $RTEWidth;
			
		/* =======================================
		 * LOAD JS, CSS and more
		 * =======================================
		 */
			// Preloading the pageStyle
		if(trim($this->thisConfig['contentCSS'])) {
			$filename = trim($this->thisConfig['contentCSS']);
			if (substr($filename,0,4)=='EXT:')      {       // extension
				list($extKey,$local) = explode('/',substr($filename,4),2);
				$filename='';
				if (strcmp($extKey,'') &&  t3lib_extMgm::isLoaded($extKey) && strcmp($local,'')) {
					$filename = $this->httpTypo3Path . t3lib_extMgm::siteRelPath($extKey).$local;
					//$filename = '/' . t3lib_extMgm::siteRelPath($extKey).$local;
				}
			} elseif (substr($filename,0,1) != '/') {
				$filename = $this->siteURL.$filename;
			}
			$additionalCode_loadCSS = '
		<link rel="alternate stylesheet" type="text/css" href="' . $filename . '" />';
		} else {
			$additionalCode_loadCSS = '
		<link rel="alternate stylesheet" type="text/css" href="' . $this->extHttpPath . 'htmlarea/plugins/DynamicCSS/dynamiccss.css" />';
		}

			// Loading the editor skin
		$skinFilename = trim($this->thisConfig['skin']) ? trim($this->thisConfig['skin']) : 'EXT:' . $this->ID . '/htmlarea/skins/default/htmlarea.css';
		if (substr($skinFilename,0,4) == 'EXT:')      {       // extension
			list($extKey,$local) = explode('/',substr($skinFilename,4),2);
			$skinFilename='';
			if (strcmp($extKey,'') &&  t3lib_extMgm::isLoaded($extKey) && strcmp($local,'')) {
				$skinFilename = $this->httpTypo3Path . t3lib_extMgm::siteRelPath($extKey).$local;
			}
		} elseif (substr($skinFilename,0,1) != '/') {
			$skinFilename = $this->siteURL.$skinFilename;
		} 

		$this->editorCSS = $skinFilename;
		$additionalCode_loadCSS .= '
		<link rel="alternate stylesheet" type="text/css" href="' .  ((substr($this->editorCSS,0,1) == '/')?substr($this->siteURL,0,-1):'') . dirname($this->editorCSS) . '/htmlarea-edited-content.css" />';
		$additionalCode_loadCSS .= '
		<link rel="stylesheet" type="text/css" href="' . $this->editorCSS . '" />';

			// Loading CSS, JavaScript files and code
		$GLOBALS['TSFE']->additionalHeaderData['htmlArea'] = $additionalCode_loadCSS . $this->loadJSfiles() . '<script type="text/javascript">' . $this->loadJScode() . '</script>'; 

		/* =======================================
		 * DRAW THE EDITOR
		 * =======================================
		 */
			// Transform value:
		$value = $this->transformContent('rte',$PA['itemFormElValue'],$table,$field,$row,$specConf,$thisConfig,$RTErelPath,$thePidValue);
		if ($this->client['BROWSER'] == 'gecko') {
				// change <strong> to <b>
			$value = preg_replace("/<(\/?)strong>/i", "<$1b>", $value);
				// change <em> to <i>
			$value = preg_replace("/<(\/?)em>/i", "<$1i>", $value);
		}

			// Register RTE windows:
		$pObj->RTEwindows[] = $PA['itemFormElName'];
			
			// Register RTE in JS:
		$pObj->additionalJS_post[] = $this->registerRTEinJS($pObj->RTEcounter);

			// Set the save option for the RTE:
		$pObj->additionalJS_submit[] = $this->setSaveRTE($pObj->RTEcounter, $pObj->formName, htmlspecialchars($PA['itemFormElName']));
			
			// draw the textarea
		$item = $this->triggerField($PA['itemFormElName']).'
			<div id="pleasewait' . $pObj->RTEcounter . '" class="pleasewait">' . $this->csObj->conv($GLOBALS['TSFE']->getLLL('Please wait',$this->LOCAL_LANG), $this->charset, $this->OutputCharset) . '</div>
			<div id="editorWrap' . $pObj->RTEcounter . '" class="editorWrap" style="visibility:hidden; width:' . $editorWrapWidth . '; height:' . $editorWrapHeight . ';">
			<textarea id="RTEarea'.$pObj->RTEcounter.'" name="'.htmlspecialchars($PA['itemFormElName']).'" style="'.htmlspecialchars($this->RTEdivStyle).'">'.t3lib_div::formatForTextarea($value).'</textarea>
			</div>' . ($GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['enableDebugMode'] ? '<div id="HTMLAreaLog"></div>' : '') . '
			';
		return $item;
	}


	/**
	 * Set the toolbar config
	 *
	 */
	function setToolBar() {
		if($this->client['BROWSER'] == 'gecko' && $this->client['VERSION'] == '1.3')  {
			$this->defaultToolbarOrder = $this->TCEform->docLarge ? 'blockstylelabel, blockstyle, space, textstylelabel, textstyle, linebreak, 
				fontstyle, space, fontsize, space, formatblock, bar, bold, italic, underline, bar, strikethrough, 
				subscript, superscript, lefttoright, righttoleft, bar, left, center, right, justifyfull, linebreak, 
				orderedlist, unorderedlist, outdent, indent, bar, textcolor, bgcolor, textindicator, bar, emoticon, 
				insertcharacter, line, link, image, table, bar, findreplace, spellcheck, bar, chMode, inserttag, 
				removeformat, bar, copy, cut, paste, bar, undo, redo, bar, showhelp, about, linebreak,
				toggleborders, bar, tableproperties, bar, rowproperties, rowinsertabove, rowinsertunder, rowdelete, rowsplit, bar,
				columninsertbefore, columninsertafter, columndelete, columnsplit, bar,
				cellproperties, cellinsertbefore, cellinsertafter, celldelete, cellsplit, cellmerge'
				: 'blockstylelabel, blockstyle, space, textstylelabel, textstyle, linebreak, 
				fontstyle, space, fontsize, space, formatblock, bar, bold, italic, underline, bar, strikethrough, 
				subscript, superscript, linebreak, lefttoright, righttoleft, bar, left, center, right, justifyfull, 
				orderedlist, unorderedlist, outdent, indent, bar, textcolor, bgcolor, textindicator, bar, emoticon, 
				insertcharacter, line, link, image, table, linebreak, findreplace, spellcheck, bar, chMode, inserttag, 
				removeformat, bar, copy, cut, paste, bar, undo, redo, bar, showhelp, about, linebreak,
				toggleborders, bar, tableproperties, bar, rowproperties, rowinsertabove, rowinsertunder, rowdelete, rowsplit, bar,
				columninsertbefore, columninsertafter, columndelete, columnsplit, bar,
				cellproperties, cellinsertbefore, cellinsertafter, celldelete, cellsplit, cellmerge';
		}
		$toolbarOrder = $this->thisConfig['toolbarOrder'] ? $this->thisConfig['toolbarOrder'] : $this->defaultToolbarOrder;

			// Getting rid of undefined buttons
		$this->toolbarOrderArray = array_intersect(t3lib_div::trimExplode(',', $toolbarOrder, 1), t3lib_div::trimExplode(',', $this->defaultToolbarOrder, 1));
		$toolbarOrder = array_unique(array_values($this->toolbarOrderArray));

			// Fetching specConf for field from backend
		$pList = is_array($this->specConf['richtext']['parameters']) ? implode(',',$this->specConf['richtext']['parameters']) : '*';
		if ($pList != '*') {	// If not all
			$show = $this->specConf['richtext']['parameters'];
			if ($this->thisConfig['showButtons'])	{
				if($this->thisConfig['showButtons'] != '*') {
					$show = array_unique(array_merge($show,t3lib_div::trimExplode(',',$this->thisConfig['showButtons'],1)));
				} else {
					$show = array_unique(array_merge($show,$toolbarOrder));
				}
			}
		} else {
			$show = $toolbarOrder;
		}

			// Hiding buttons of disabled plugins
		$hideButtons = array('space', 'bar', 'linebreak');
		reset($this->pluginButton);
		while(list($plugin, $buttonList) = each($this->pluginButton) ) {
			if(!$this->isPluginEnable($plugin)) {
				$buttonArray = t3lib_div::trimExplode(',',$buttonList,1);
				foreach($buttonArray as $button) {
					$hideButtons[] = $button;
				}
			}
		}


			// Hiding labels of disabled plugins
		reset($this->pluginLabel);
		while(list($plugin, $label) = each($this->pluginLabel) ) {
			if(!$this->isPluginEnable($plugin)) $hideButtons[] = $label;
		}

			// Hiding buttons not implemented in Safari
		if ($this->client['BROWSER'] == 'safari') {
			reset($this->conf_toolbar_safari_hide);
			while(list(, $button) = each($this->conf_toolbar_safari_hide) ) {
				$hideButtons[] = $button;
			}
		}

			// Hiding the buttons
		$show = array_diff($show, $this->conf_toolbar_hide, $hideButtons, t3lib_div::trimExplode(',',$this->thisConfig['hideButtons'],1));

			// Adding the always show buttons
		$show = array_unique(array_merge($show, $this->conf_toolbar_show));
		$toolbarOrder = array_unique(array_merge($toolbarOrder, $this->conf_toolbar_show));
		reset($this->conf_toolbar_show);
		while(list(,$button) = each($this->conf_toolbar_show)) {
			if(!in_array($button, $this->toolbarOrderArray)) $this->toolbarOrderArray[] = $button;
		}

			// Getting rid of the buttons for which we have no position
		$show = array_intersect($show, $toolbarOrder);

		$this->toolBar = $show;
	}

	/**
	 * Return the JS-Code for Register the RTE in JS
	 *
	 * @return string		the JS-Code for Register the RTE in JS
	 */
	function registerRTEinJS($number) {

		$registerRTEinJSString = '		/*<![CDATA[*/
			RTEarea['.$number.'] = new Array();
			RTEarea['.$number.']["number"] = '.$number.';
			RTEarea['.$number.']["id"] = "RTEarea'.$number.'";
			RTEarea['.$number.']["enableWordClean"] = ' . (trim($this->thisConfig['enableWordClean'])?'true':'false') . ';
			RTEarea['.$number.']["htmlRemoveComments"] = ' . (trim($this->thisConfig['removeComments'])?'true':'false') . ';
			RTEarea['.$number.']["disableEnterParagraphs"] = ' . (trim($this->thisConfig['disableEnterParagraphs'])?'true':'false') . ';
			RTEarea['.$number.']["removeTrailingBR"] = ' . (trim($this->thisConfig['removeTrailingBR'])?'true':'false') . ';
			RTEarea['.$number.']["useCSS"] = ' . (trim($this->thisConfig['useCSS'])?'true':'false') . ';
			RTEarea['.$number.']["statusBar"] = ' . (trim($this->thisConfig['showStatusBar'])?'true':'false') . ';
			RTEarea['.$number.']["showTagFreeClasses"] = ' . (trim($this->thisConfig['showTagFreeClasses'])?'true':'false') . ';
			RTEarea['.$number.']["useHTTPS"] = ' . (trim(stristr($this->siteURL, 'https'))?'true':'false') . ';
			RTEarea['.$number.']["enableMozillaExtension"] = ' . (($this->client['BROWSER'] == 'gecko' && $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['enableMozillaExtension'])?'true':'false') . ';
			RTEarea['.$number.']["plugin"] = new Array();';
		$pluginArray = t3lib_div::trimExplode(',', $this->pluginList , 1);
		while( list(,$plugin) = each($pluginArray) ) {
			if ($this->isPluginEnable($plugin)) {
				$registerRTEinJSString .= '
			RTEarea['.$number.']["plugin"]["'.$plugin.'"] = true;';
			}
		}
			// Setting the list of classes if specified in the RTE config
		if (is_array($this->RTEsetup['properties']['classes.']) )  {
			$HTMLAreaClassname = array();
			reset($this->RTEsetup['properties']['classes.']);
			while(list($className,$conf)=each($this->RTEsetup['properties']['classes.']))      {
				$className=substr($className,0,-1);
				$HTMLAreaClassname[$className] = '
				["' . $conf['name'] . '" , "' . $conf['value'] . '"]';
			}
		}

			// Setting the list of tags to be removed if specified in the RTE config
		if (trim($this->thisConfig['removeTags']))  {
			$registerRTEinJSString .= '
			RTEarea['.$number.']["htmlRemoveTags"] = /' . implode('|', t3lib_div::trimExplode(',', $this->thisConfig['removeTags'])) . '/i;';
		}
			// Setting the list of tags to be removed with their contents if specified in the RTE config
		if (trim($this->thisConfig['removeTagsAndContents']))  {
			$registerRTEinJSString .= '
			RTEarea['.$number.']["htmlRemoveTagsAndContents"] = /' . implode('|', t3lib_div::trimExplode(',', $this->thisConfig['removeTagsAndContents'])) . '/i;';
		}

			// Setting the pageStyle
		if(trim($this->thisConfig['contentCSS'])) {
			$filename = trim($this->thisConfig['contentCSS']);
			if (substr($filename,0,4)=='EXT:')      {       // extension
				list($extKey,$local) = explode('/',substr($filename,4),2);
				$filename='';
				if (strcmp($extKey,'') &&  t3lib_extMgm::isLoaded($extKey) && strcmp($local,'')) {
					$filename = $this->siteURL . t3lib_extMgm::siteRelPath($extKey).$local;
				}
			} elseif (substr($filename,0,1) != '/') {
                              $filename = $this->siteURL.$filename;
			} 
			$registerRTEinJSString .= '
			RTEarea['.$number.']["pageStyle"] = "' . $filename .'";';
		} else {
			$registerRTEinJSString .= '
			RTEarea['.$number.']["pageStyle"] = "' . $this->extHttpPath . 'htmlarea/plugins/DynamicCSS/dynamiccss.css";';
		}

		if ( $this->isPluginEnable('SelectColor') ) {
			if(trim($this->thisConfig['disableColorPicker'])) {
				$registerRTEinJSString .= '
			RTEarea['.$number.']["disableColorPicker"] = true;';
			} else {
				$registerRTEinJSString .= '
			RTEarea['.$number.']["disableColorPicker"] = false;';
			}
		}
			// Setting the list of colors if specified in the RTE config
		if ($this->isPluginEnable('SelectColor') && is_array($this->RTEsetup['properties']['colors.']) )  {
			$HTMLAreaColorname = array();
			reset($this->RTEsetup['properties']['colors.']);
			while(list($colorName,$conf)=each($this->RTEsetup['properties']['colors.']))      {
				$colorName=substr($colorName,0,-1);
				$HTMLAreaColorname[$colorName] = '
				["' . $conf['name'] . '" , "' . $conf['value'] . '"]';
			}
		}
		if ($this->isPluginEnable('SelectColor') && $this->thisConfig['colors'] ) {
			$HTMLAreaJSColors = '[';
			$HTMLAreaColors = t3lib_div::trimExplode(',' , $this->cleanList($this->thisConfig['colors']));
			reset($HTMLAreaColors);
			$HTMLAreaColorsIndex = 0;
			while( list(,$colorName) = each($HTMLAreaColors)) {
				if($HTMLAreaColorsIndex && $HTMLAreaColorname[$colorName]) { 

					$HTMLAreaJSColors .= ',';
				}
				$HTMLAreaJSColors .= $HTMLAreaColorname[$colorName];
				$HTMLAreaColorsIndex++;
			}
			$HTMLAreaJSColors .= '];';
			$registerRTEinJSString .= '
			RTEarea['.$number.']["colors"] = '. $HTMLAreaJSColors;
		}


			// Setting the list of fonts if specified in the RTE config
		if (is_array($this->RTEsetup['properties']['fonts.']) )  {
			$HTMLAreaFontname = array();
			reset($this->RTEsetup['properties']['fonts.']);
			while(list($fontName,$conf)=each($this->RTEsetup['properties']['fonts.']))      {
				$fontName=substr($fontName,0,-1);
				$HTMLAreaFontname[$fontName] = '
				"' . $this->csObj->conv($GLOBALS['TSFE']->getLLL($conf['name'],$this->LOCAL_LANG), $this->charset, $this->OutputCharset) . '" : "' . $conf['value'] . '"';
			}
		}

		if ($this->isPluginEnable('InlineCSS') ) {
			$HTMLAreaJSClassesCharacter = ($this->thisConfig['classesCharacter'])?('"' . $this->thisConfig['classesCharacter'] . '";'):'null;';
			$registerRTEinJSString .= '
			RTEarea['.$number.']["classesCharacter"] = '. $HTMLAreaJSClassesCharacter;
		}

		if ($this->thisConfig['fontFace'] ) {
			$HTMLAreaJSFontface = '{';
			$HTMLAreaFontface = t3lib_div::trimExplode(',' , $this->cleanList($this->thisConfig['fontFace']));
			reset($HTMLAreaFontface);
			$HTMLAreaFontfaceIndex = 0;

			while( list(,$fontName) = each($HTMLAreaFontface)) {
				if($HTMLAreaFontfaceIndex) { 
					$HTMLAreaJSFontface .= ',';
				}
				$HTMLAreaJSFontface .= $HTMLAreaFontname[$fontName];
				$HTMLAreaFontfaceIndex++;
			}
			$HTMLAreaJSFontface .= '};';
			$registerRTEinJSString .= '
			RTEarea['.$number.']["fontname"] = '. $HTMLAreaJSFontface;
		} else {  // else we use the typo3 defaults
			$HTMLAreaJSFontface = '{
				"Arial" : "Arial,sans-serif",
				"Arial Black" : "Arial Black,sans-serif",
				"Verdana" : "Verdana,Arial,sans-serif",
				"Times New Roman" : "Times New Roman,Times,serif",
				"Garamond" : "Garamond",
				"Lucida Handwriting" : "Lucida Handwriting",
				"Courier" : "Courier",
				"Webdings" : "Webdings",
				"Wingdings" : "Wingdings" };';
			$registerRTEinJSString .= '
			RTEarea['.$number.']["fontname"] = '. $HTMLAreaJSFontface;
		}
			// Paragraphs

		$HTMLAreaParagraphs = $this->defaultParagraphs;
		if ($this->thisConfig['hidePStyleItems'] ) {
			$hidePStyleItems =  t3lib_div::trimExplode(',', $this->thisConfig['hidePStyleItems'], 1);
			foreach($hidePStyleItems as $item)  unset($HTMLAreaParagraphs[strtolower($item)]);
		}
		$HTMLAreaJSParagraph = '{';
		reset($HTMLAreaParagraphs);
		$HTMLAreaParagraphIndex = 0;
		while( list($PStyleItem,$PStyleLabel) = each($HTMLAreaParagraphs)) {
			if($HTMLAreaParagraphIndex) { 
				$HTMLAreaJSParagraph .= ',';
			}
			$HTMLAreaJSParagraph .= '
				"' . $this->csObj->conv($GLOBALS['TSFE']->getLLL($PStyleLabel,$this->LOCAL_LANG), $this->charset, $this->OutputCharset) . '" : "' . $PStyleItem . '"';
			$HTMLAreaParagraphIndex++;
		}
		$HTMLAreaJSParagraph .= '};';
		$registerRTEinJSString .= '
			RTEarea['.$number.']["paragraphs"] = '. $HTMLAreaJSParagraph;

			// Font sizes
		$HTMLAreaFontSizes = $this->defaultFontSizes;
		if ($this->thisConfig['hideFontSizes'] ) {
			$hideFontSizes =  t3lib_div::trimExplode(',', $this->thisConfig['hideFontSizes'], 1);
			foreach($hideFontSizes as $item)  unset($HTMLAreaFontSizes[strtolower($item)]);
		}
		$HTMLAreaJSFontSize = '{';
		reset($HTMLAreaFontSizes);
		$HTMLAreaParagraphIndex = 0;
		while( list($FontSizeItem,$FontSizeLabel) = each($HTMLAreaFontSizes)) {
			if($HTMLAreaFontSizeIndex) { 
				$HTMLAreaJSFontSize .= ',';
			}
			$HTMLAreaJSFontSize .= '
				"' . $FontSizeLabel . '" : "' . $FontSizeItem . '"';
			$HTMLAreaFontSizeIndex++;
		}




		$HTMLAreaJSFontSize .= '};';
		$registerRTEinJSString .= '
			RTEarea['.$number.']["fontsize"] = '. $HTMLAreaJSFontSize;

		$registerRTEinJSString .= '
			RTEarea['.$number.']["toolbar"] = '.$this->getJSToolbarArray().';
			HTMLArea.initEditor('.$number.');
		/*]]>*/';

		return $registerRTEinJSString;
	}

	/**
	 * Return the JS-Code for copy the HTML-Code from the editor in the hidden input field.
	 * This is for submit function from the form.
	 *
	 * @return string		the JS-Code
	 */
	function setSaveRTE($number, $form, $textarea) {
		return '
		editornumber = '.$number.';
		if (RTEarea[editornumber]) {
			fields = document.getElementsByName(\'' . $textarea . '\');
			field = fields.item(0);
			if(field && field.tagName.toLowerCase() == \'textarea\') field.value = RTEarea[editornumber][\'editor\'].getHTML();
		}
		else {
			OK=0;
		}
		';
	}

}

if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/rtehtmlarea/pi2/class.tx_rtehtmlarea_pi2.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/rtehtmlarea/pi2/class.tx_rtehtmlarea_pi2.php']);
}
?>