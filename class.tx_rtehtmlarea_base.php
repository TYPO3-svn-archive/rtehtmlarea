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
 * An RTE using the htmlArea editor
 *
 * @author	Philipp Borgmann <philipp.borgmann@gmx.de>
 * @coauthor	Stanislas Rolland <stanislas.rolland@fructifor.com>
 */

require_once(PATH_t3lib.'class.t3lib_rteapi.php');
require_once(PATH_t3lib.'class.t3lib_cs.php');

class tx_rtehtmlarea_base extends t3lib_rteapi {

		// Configuration of supported browsers
	var $conf_supported_browser = array (
			'msie' => array (
				1 => array (
					'version' => 5.5,
					'system' => 'win'
				)
			),
			'gecko' => array (
				1 => array (
					'version' => 1.3
				)
			)
		);

		// Always hide these toolbar buttons (TYPO3 button name)
	var $conf_toolbar_hide = array (
		'showhelp',		// Has no content yet
		'user', 	// Not implemant yet and don't know what it is
		);

		// Always show these toolbar buttons (TYPO3 button name)
	var $conf_toolbar_show = array (
		'textindicator',
		'undo',
		'redo',
		//'showhelp',
		'about',
		);

		// The order of the toolbar: the name is the TYPO3-button name when it exists
	var $defaultToolbarOrder = 'blockstylelabel, blockstyle, space, textstylelabel, textstyle, bar, linebreak,
		fontstyle, space, fontsize, space, formatblock, bar, 
		bold, italic, underline, bar, strikethrough, subscript, superscript, bar,
		lefttoright, righttoleft, bar, left, center, right, justifyfull, bar, 
		orderedlist, unorderedlist, outdent, indent, bar, textcolor, bgcolor, textindicator, bar, 
		emoticon, insertcharacter, line, link, image, table, bar, findreplace, spellcheck, bar, 
		chMode, inserttag, removeformat, bar, copy, cut, paste, bar, undo, redo, bar, showhelp, about';
			
		// Conversion array: TYPO3 button names to htmlArea button names
	var $conf_toolbar_convert = array (
			// 'TYPO3 name' => 'htmlArea name'
		'fontstyle' => 'fontname',
		'fontsize' => 'fontsize',
		'textcolor' => 'forecolor',
		'bgcolor' => 'hilitecolor',
		'bold' => 'bold',
		'italic' => 'italic',
		'underline' => 'underline',
		'left' => 'justifyleft',
		'center' => 'justifycenter',
		'right' => 'justifyright',
		'orderedlist' => 'insertorderedlist',
		'unorderedlist' => 'insertunorderedlist',
		'outdent' => 'outdent',
		'indent' => 'indent',
		'emoticon' => 'insertsmiley',
		'line' => 'inserthorizontalrule',
		'link' => 'createlink',
		'table' => 'inserttable',
		'image' => 'insertimage',
		'cut' => 'cut',
		'copy' => 'copy',
		'paste' => 'paste',
		'formatblock' => 'formatblock',
		'chMode' => 'htmlmode',
		'user' => '', /*not implement yet*/
			
			// htmlArea extra buttons
		'lefttoright' => 'lefttoright',
		'righttoleft' => 'righttoleft',
		'justifyfull' => 'justifyfull',
		'strikethrough' => 'strikethrough',
		'superscript' => 'superscript',
		'subscript' => 'subscript',
		'showhelp' => 'showhelp',
		'insertcharacter' => 'insertcharacter',
		'findreplace' => 'findreplace',
		'spellcheck' => 'spellcheck',
		'removeformat' => 'removeformat',
		'inserttag' => 'inserttag',
		'blockstylelabel' => 'I[style]',	
		'blockstyle' => 'DynamicCSS-class',
		'textstylelabel' => 'I[text_style]',
		'textstyle' => 'InlineCSS-class',
			
			// Toolbar formating
		'space' => 'space',
		'bar' => 'separator',
		'linebreak' => 'linebreak',
			
			// Always show
		'undo' => 'undo',
		'redo' => 'redo',
		'textindicator' => 'textindicator',
		'about' => 'about',
		);

	var $defaultParagraphs = array(
		'p' =>	'Normal',
		'h1' =>	'Heading 1',
		'h2' =>	'Heading 2',
		'h3' =>	'Heading 3',
		'h4' =>	'Heading 4',
		'h5' =>	'Heading 5',
		'h6' =>	'Heading 6',
		'pre' => 'Preformatted',
		);

	var $defaultFontSizes = array(
		'1' =>	'8 pt',
		'2' =>	'10 pt',
		'3' =>	'12 pt',
		'4' =>	'14 pt',
		'5' =>	'18 pt',
		'6' =>	'24 pt',
		'7' =>	'36 pt',
		);

	var $pluginList = 'TableOperations, ContextMenu, SpellChecker, SelectColor, TYPO3Browsers, InsertSmiley, FindReplace, RemoveFormat, CharacterMap, QuickTag, InlineCSS, DynamicCSS';

	var $pluginButton = array(
		'InlineCSS' 	=> 'textstyle',
		'DynamicCSS' 	=> 'blockstyle',
		'SpellChecker' 	=> 'spellcheck',
		'InsertSmiley' 	=> 'emoticon',
		'FindReplace' 	=> 'findreplace',
		'RemoveFormat' 	=> 'removeformat',
		'QuickTag' 		=> 'inserttag',
		'CharacterMap' 	=> 'insertcharacter',
		'TableOperations'	=> 'table',
		);
	var $pluginLabel = array(
		'InlineCSS' 	=> 'textstylelabel',
		'DynamicCSS' 	=> 'blockstylelabel',
		);

	var $spellCheckerModes = array( 'ultra', 'fast', 'normal', 'bad-spellers');
		
		// External:
	var $RTEdivStyle;			// Alternative style for RTE <div> tag.
	var $extHttpPath;			// full Path to this extension for http (so no Server path). It ends with "/"
	var $rtePathImageFile;			// Path to the php-file for selection images
	var $rtePathLinkFile;			// Path to the php-file for create a link
	var $rtePathColorFile;			// Path to the php-file for the color picker
	var $siteURL;				// TYPO3 site url
	var $hostURL;				// TYPO3 host url

		// Internal, static:
	var $ID = 'rtehtmlarea';				// Identifies the RTE as being the one from the "rte" extension if any external code needs to know...
	var $debugMode = FALSE;			// If set, the content goes into a regular TEXT area field - for developing testing of transformations. (Also any browser will load the field!)
	
		// For the editor
	var $client;
	var $TCEform;
	var $elementId;
	var $elementParts;
	var $tscPID;
	var $typeVal;
	var $thePid;
	var $RTEsetup;
	var $thisConfig;
	var $confValues;
	var $language;
	var $BECharset;
	var $OutputCharset;
	var $editorCSS;
	var $spellCheckerLanguage;
	var $spellCheckerCharset;
	var $spellCheckerMode;
	var $quickTagHideTags;
	var $specConf;
	var $toolBar = array();			// Save the buttons for the toolbar
	var $toolbar_level_size;		// The size for each level in the toolbar:
	var $toolbarOrderArray = array();
	var $pluginEnableList;
	var $pluginEnableArray = array();

	/**
	 * Returns true if the RTE is available. Here you check if the browser requirements are met.
	 * If there are reasons why the RTE cannot be displayed you simply enter them as text in ->errorLog
	 *
	 * @return	boolean		TRUE if this RTE object offers an RTE in the current browser environment
	 */
	function isAvailable()	{
		$this->client = $this->clientInfo();
		$this->errorLog = array();
		if (!$this->debugMode)	{	// If debug-mode, let any browser through
			$rteIsAvailable = 0;
			
			$rteConfBrowser = $this->conf_supported_browser;
			if (is_array($rteConfBrowser)) {
				reset($rteConfBrowser);
				while(list ($browser, $browserConf) = each($rteConfBrowser)){
					if ($browser == $this->client['BROWSER']) {
				    	// Config for Browser found, check it:
						if (is_array($browserConf)) {
					    	reset($browserConf);
							while(list ($browserConfNr, $browserConfSub) = each($browserConf)){
								if ($browserConfSub['version'] <= $this->client['VERSION']
									|| empty($browserConfSub['version'])) {
									// Version is correctly
							    	if ($browserConfSub['system'] == $this->client['SYSTEM']
										|| empty($browserConfSub['system'])) {
										// System is correctly
										$rteIsAvailable = 1;
									}// End of System
								}// End of Version
							}// End of while-BrowserSubpart
						}
						else {
							// no config for this browser found, so all versions or system with this browsers are allow
							$rteIsAvailable = 1;
						}
					} // End of Browser Check
				} // while: Browser Check
			}
			else {
			   // no Browser config for this RTE-Editor, so all Clients are allow			   
			}
			
			if (!$rteIsAvailable) {
				$this->errorLog[] = "rte: Browser not supported. Only msie Version 5 or higher and Mozilla based client 1 and higher.";
			}
		}
		if ($rteIsAvailable)	return true;
	}

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
	function drawRTE(&$pObj,$table,$field,$row,$PA,$specConf,$thisConfig,$RTEtypeVal,$RTErelPath,$thePidValue)	{
		global $BE_USER,$LANG;

		$this->TCEform = $pObj;
		$LANG->includeLLFile('EXT:' . $this->ID . '/locallang.php');
		$this->client = $this->clientInfo();
		
			// Draw form element:
		if ($this->debugMode)	{	// Draws regular text area (debug mode)
			$item = parent::drawRTE($pObj,$table,$field,$row,$PA,$specConf,$thisConfig,$RTEtypeVal,$RTErelPath,$thePidValue);
		} else {	// Draw real RTE
		
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
			$this->extHttpPath = $this->httpTypo3Path . t3lib_extMgm::siteRelPath($this->ID);
				// Get the Path to the script for selecting an image
			$this->rtePathImageFile = $this->extHttpPath . 'rtehtmlarea_select_image.php';
				// Get the Path to the script for create a link
			$this->rtePathLinkFile = $this->extHttpPath . 'rtehtmlarea_browse_links.php';
				// Get the site URL
			$this->siteURL = t3lib_div::getIndpEnv('TYPO3_SITE_URL');
				// Get the host URL
			$this->hostURL = t3lib_div::getIndpEnv('TYPO3_REQUEST_HOST');
				// Check if we should enable the Mozilla extension
			if($this->client['BROWSER'] == 'gecko' && $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['enableMozillaExtension'] && extension_loaded('zlib')) {
				$this->makeMozillaExtension();
			}

				// Element ID + pid
			$this->elementId = $PA['itemFormElName']; // Form element name
			$this->elementParts = explode('][',ereg_replace('\]$','',ereg_replace('^(TSFE_EDIT\[data\]\[|data\[)','',$this->elementId)));

				// Find the page PIDs:
			list($this->tscPID,$this->thePid) = t3lib_BEfunc::getTSCpid(trim($this->elementParts[0]),trim($this->elementParts[1]),$thePidValue);

				// Record "types" field value:
			$this->typeVal = $RTEtypeVal; // TCA "types" value for record

				// Find "thisConfig" for record/editor:
			unset($this->RTEsetup);
			$this->RTEsetup = $BE_USER->getTSConfig('RTE',t3lib_BEfunc::getPagesTSconfig($this->tscPID));
			$this->thisConfig = $thisConfig;

				// Special configuration and default extras:
			$this->specConf = $specConf;

				// Language
			$this->language = $LANG->lang;
			if ($this->language=='default' || !$this->language)	{
				$this->language='en';
			}
				// Character set
			$this->csObj = t3lib_div::makeInstance('t3lib_cs');
			$this->charset = $this->csObj->charSetArray[$this->language];
			$this->charset = $this->charset ? $this->charset : 'iso-8859-1';
			$this->BECharset = trim($GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset']) ? trim($GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset']) : $this->charset;
			$this->OutputCharset = $this->BECharset;

			/* =======================================
			 * TOOLBAR CONFIGURATION
			 * =======================================
			 */
				// htmlArea plugins list
			$this->pluginEnableArray = array_intersect(t3lib_div::trimExplode(',', $this->pluginList , 1), t3lib_div::trimExplode(',', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['HTMLAreaPluginList'], 1));
			$hidePlugins = array();
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
				$this->spellCheckerLanguage = $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['defaultDictionary'];
				if($row['sys_language_uid']) {
					$tableA = 'sys_language';
					$tableB = 'static_languages';
					$languagesUidsList = $row['sys_language_uid'];
					$query  = "SELECT $tableA.uid, $tableB.lg_iso_2, $tableB.lg_country_iso_2, $tableB.lg_typo3 FROM $tableA LEFT JOIN $tableB ON $tableA.static_lang_isocode=$tableB.uid WHERE $tableA.uid IN (" . $languagesUidsList . ") ";
						$query .= t3lib_BEfunc::BEenableFields($tableA);
						$query .= t3lib_BEfunc::deleteClause($tableA);

					$res = mysql(TYPO3_db,$query);
					while ( $languageRow = @mysql_fetch_assoc($res)) {
						$this->spellCheckerLanguage = strtolower(trim($languageRow['lg_iso_2']).(trim($languageRow['lg_country_iso_2'])?'_'.trim($languageRow['lg_country_iso_2']):''));
						$this->spellCheckerTypo3Language = strtolower(trim($languageRow['lg_typo3']));
					}
				}
				$this->spellCheckerLanguage = $this->spellCheckerLanguage?$this->spellCheckerLanguage:'en';
				$this->spellCheckerTypo3Language = $this->spellCheckerTypo3Language?$this->spellCheckerTypo3Language:'en';

					// Set the charset of the content for the SpellChecker
				$this->spellCheckerCharset = $this->csObj->$charSetArray[$this->spellCheckerTypo3Language];
				$this->spellCheckerCharset = $this->spellCheckerCharset ? $this->spellCheckerCharset : 'iso-8859-1';
				$this->spellCheckerCharset = trim($GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset']) ? trim($GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset']) : $this->spellCheckerCharset;

					// Set the SpellChecker mode
				$this->spellCheckerMode = isset($BE_USER->userTS['options.']['HTMLAreaPspellMode']) ? trim($BE_USER->userTS['options.']['HTMLAreaPspellMode']) : 'normal';
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
			$this->RTEdivStyle = $this->RTEdivStyle ? $this->RTEdivStyle : 'position:relative; left:0px; top:0px; height:' . $RTEHeight . 'px; width:'.$RTEWidth.'px; border: 1px solid black; padding: 2px 0px 2px 2px;';
			$this->toolbar_level_size = $RTEWidth;

			/* =======================================
			 * LOAD CSS, JS and more
			 * =======================================
			 */

				// Preloading the pageStyle
			if(trim($this->thisConfig['contentCSS'])) {
				$filename = trim($this->thisConfig['contentCSS']);
				if (substr($filename,0,4)=='EXT:')      {       // extension
					list($extKey,$local) = explode('/',substr($filename,4),2);
					$filename='';
					if (strcmp($extKey,'') &&  t3lib_extMgm::isLoaded($extKey) && strcmp($local,'')) {
						$filename = '/' . t3lib_extMgm::siteRelPath($extKey).$local;
					}
				} elseif (substr($filename,0,1) != '/') {
					$filename = $this->siteURL.$filename;
				}
				$pObj->additionalCode_pre['loadCSS'] = '
					<link rel="alternate stylesheet" type="text/css" href="' . $filename . '" />';
			} else {
				$pObj->additionalCode_pre['loadCSS'] = '
					<link rel="alternate stylesheet" type="text/css" href="' . $this->extHttpPath . 'htmlarea/plugins/DynamicCSS/dynamiccss.css" />';
			}

				// Loading the editor skin
			$skinFilename = trim($this->thisConfig['skin']) ? trim($this->thisConfig['skin']) : 'EXT:' . $this->ID . '/htmlarea/skins/default/htmlarea.css';
			if (substr($skinFilename,0,4) == 'EXT:')      {       // extension
				list($extKey,$local) = explode('/',substr($skinFilename,4),2);
				$skinFilename='';
				if (strcmp($extKey,'') &&  t3lib_extMgm::isLoaded($extKey) && strcmp($local,'')) {
					$skinFilename = $this->httpTypo3Path.t3lib_extMgm::siteRelPath($extKey).$local;
				}
			} elseif (substr($skinFilename,0,1) != '/') {
				$skinFilename = $this->siteURL.$skinFilename;
			}
			$this->editorCSS = $skinFilename;
			$pObj->additionalCode_pre['loadCSS'] .= '
				<link rel="stylesheet" type="text/css" href="' . $this->editorCSS . '" />';

				// Loading JavaScript files and code
			$pObj->additionalCode_pre['loadJSfiles'] = $this->loadJSfiles();
			$pObj->additionalJS_pre['loadJScode'] = $this->loadJScode();		 

			/* =======================================
			 * DRAW THE EDITOR
			 * =======================================
			 */
				// Transform value:
			$value = $this->transformContent('rte',$PA['itemFormElValue'],$table,$field,$row,$specConf,$thisConfig,$RTErelPath,$thePidValue);
			if ($this->client['BROWSER'] == 'gecko') {
				// need to change some tags:
				// change <strong> to <b>
				$value = preg_replace("/<(\/?)strong>/i", "<$1b>", $value);
				// change <em> to <i>
				$value = preg_replace("/<(\/?)em>/i", "<$1i>", $value);
			}

				// Register RTE windows:
			$pObj->RTEwindows[] = $PA['itemFormElName'];

				// Check if wizard_rte called this for fullscreen edtition; if so, change the size of the RTE to fullscreen using JS
			if (basename(PATH_thisScript) == 'wizard_rte.php') {
				$height = 'window.innerHeight';
				$width = 'window.innerWidth';
				
				if ($this->client['BROWSER'] == 'msie') {
					$height = 'document.body.offsetHeight';
					$width = 'document.body.offsetWidth';
				}
				$editorWrapWidth = '100%';
				$editorWrapHeight = '100%';
				$this->RTEdivStyle = 'position:relative; left:0px; top:0px; height:100%; width:100%; border: 1px solid black; padding: 2px 0px 2px 2px;';
				$pObj->additionalJS_post[] = $this->setRTEsizeByJS('RTEarea'.$pObj->RTEcounter, $height, $width);
			}
			
			// Register RTE in JS:
			$pObj->additionalJS_post[] = $this->registerRTEinJS($pObj->RTEcounter);

			// Set the save option for the RTE:
			$pObj->additionalJS_submit[] = $this->setSaveRTE($pObj->RTEcounter, $pObj->formName, htmlspecialchars($PA['itemFormElName']));
			
			// draw the textarea
			$item = 
				$this->triggerField($PA['itemFormElName']).'
				<div id="pleasewait' . $pObj->RTEcounter . '" class="pleasewait">' . $LANG->getLL('Please wait') . '</div>
				<div id="editorWrap' . $pObj->RTEcounter . '" class="editorWrap" style="visibility:hidden; width:' . $editorWrapWidth . '; height:' . $editorWrapHeight . ';">
				<textarea id="RTEarea'.$pObj->RTEcounter.'" name="'.htmlspecialchars($PA['itemFormElName']).'" style="'.htmlspecialchars($this->RTEdivStyle).'">'.t3lib_div::formatForTextarea($value).'</textarea>
				</div>
				';
		}
			// Return form item:
		return $item;
	}
	
	/**
	 * Set the toolbar config (only in this PHP-Object, not in JS):
	 *
	 */
	function setToolBar() {
		global $BE_USER;

		if($this->client['BROWSER'] == 'gecko' && $this->client['VERSION'] == '1.3')  {
			$this->defaultToolbarOrder = $this->TCEform->docLarge ? 'blockstylelabel, blockstyle, space, textstylelabel, textstyle, linebreak, 
				fontstyle, space, fontsize, space, formatblock, bar, bold, italic, underline, bar, strikethrough, 
				subscript, superscript, lefttoright, righttoleft, bar, left, center, right, justifyfull, linebreak, 
				orderedlist, unorderedlist, outdent, indent, bar, textcolor, bgcolor, textindicator, bar, emoticon, 
				insertcharacter, line, link, image, table, bar, findreplace, spellcheck, bar, chMode, inserttag, 
				removeformat, bar, copy, cut, paste, bar, undo, redo, bar, showhelp, about'
				: 'blockstylelabel, blockstyle, space, textstylelabel, textstyle, linebreak, 
				fontstyle, space, fontsize, space, formatblock, bar, bold, italic, underline, bar, strikethrough, 
				subscript, superscript, linebreak, lefttoright, righttoleft, bar, left, center, right, justifyfull, 
				orderedlist, unorderedlist, outdent, indent, bar, textcolor, bgcolor, textindicator, bar, emoticon, 
				insertcharacter, line, link, image, table, linebreak, findreplace, spellcheck, bar, chMode, inserttag, 
				removeformat, bar, copy, cut, paste, bar, undo, redo, bar, showhelp, about';
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

			// Resticting to RTEkeyList for backend user
		$RTEkeyList = isset($BE_USER->userTS['options.']['RTEkeyList']) ? $BE_USER->userTS['options.']['RTEkeyList'] : '*';
		if ($RTEkeyList != '*')	{ 	// If not all
			$show = array_intersect($show, t3lib_div::trimExplode(',',$RTEkeyList,1));
		}

			// Hiding buttons of disabled plugins
		$hideButtons = array('space', 'bar', 'linebreak');
		reset($this->pluginButton);
		while(list($plugin, $button) = each($this->pluginButton) ) {
			if(!$this->isPluginEnable($plugin)) $hideButtons[] = $button;
		}

			// Hiding labels of disabled plugins
		reset($this->pluginLabel);
		while(list($plugin, $label) = each($this->pluginLabel) ) {
			if(!$this->isPluginEnable($plugin)) $hideButtons[] = $label;
		}

			// Hiding the buttons
		$show = array_diff($show, $this->conf_toolbar_hide, $hideButtons, t3lib_div::trimExplode(',',$this->thisConfig['hideButtons'],1));

			// Adding the always show buttons
		$show = array_unique(array_merge($show, $this->conf_toolbar_show));
		$toolbarOrder = array_unique(array_merge($toolbarOrder, $this->conf_toolbar_show));
		while(list(,$button) = each($this->conf_toolbar_show)) {
			if(!in_array($button, $this->toolbarOrderArray)) $this->toolbarOrderArray[] = $button;
		}

			// Getting rid of the buttons for which we have no position
		$show = array_intersect($show, $toolbarOrder);

		$this->toolBar = $show;
	}

	/**
	 * Disable some plugins
	 *
	 */
	function setPlugins() {

			// Disabling the plugins if their buttons are not in the toolbar
		$hidePlugins = array();
		reset($this->pluginButton);
		while(list($plugin, $button) = each($this->pluginButton) ) {
			if(!in_array($button,$this->toolBar)) $hidePlugins[] = $plugin;
		}

		if($this->thisConfig['disableContextMenu']) $hidePlugins[] = 'ContextMenu';
		if($this->thisConfig['disableSelectColor']) $hidePlugins[] = 'SelectColor';
		if($this->thisConfig['disableTYPO3Browsers']) $hidePlugins[] = 'TYPO3Browsers';
		if(!t3lib_extMgm::isLoaded('sr_static_info') || in_array($this->language, t3lib_div::trimExplode(',', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['noSpellCheckLanguages']))) $hidePlugins[] = 'SpellChecker';

		$this->pluginEnableArray = array_diff($this->pluginEnableArray, $hidePlugins);

			// Hiding labels of disabled plugins
		$hideButtons = array();
		reset($this->pluginLabel);
		while(list($plugin, $label) = each($this->pluginLabel) ) {
			if(!$this->isPluginEnable($plugin)) $hideButtons[] = $label;
		}
		$this->toolBar = array_diff($this->toolBar, $hideButtons);

			// Renaming buttons of replacement plugins
		if( $this->isPluginEnable('SelectColor') ) {
			$this->conf_toolbar_convert['textcolor'] = 'CO-forecolor';
			$this->conf_toolbar_convert['bgcolor'] = 'CO-hilitecolor';
		}
	}
	
	/**
	 * Convert the names for typo3 Buttons into the names for HTML-Area.
	 * HTML-Area and Typo3 use differens names for the button. This function
	 * convert the names
	 * 
	 * @param	string	buttonname (typo3-name)
	 * @return	string	buttonname (htmlarea-name)
	 */
	 function convertToolBarForHTMLArea($button) {
 		return $this->conf_toolbar_convert[$button];
	 }
	 
	/**
	 * Return the JS-function for setting the RTE size.
	 *
	 * @param	string		DivID-Name
	 * @param	int			the height for the RTE
	 * @param	int			the width for the RTE
	 * @return string		Loader function in JS
	 */
	function setRTEsizeByJS($divId, $height, $width) {
		return '
			setRTEsizeByJS(\''.$divId.'\','.$height.', '.$width.');
		';
	}

	/**
	 * Return the HTML-Code for loading the Javascript-Files
	 *
	 * @return string		the html-code for loading the Javascript-Files
	 */
	function loadJSfiles() {
		return '
		<script type="text/javascript">
		/*<![CDATA[*/
			_editor_url = "' . $this->extHttpPath . 'htmlarea";
			_editor_lang = "' . $this->language . '";
			_editor_CSS = "' . $this->editorCSS . '";
			_editor_skin = "' . dirname($this->editorCSS) . '";
			_typo3_host_url = "' . $this->hostURL . '";
			_spellChecker_lang = "' . $this->spellCheckerLanguage . '";
			_spellChecker_charset = "' . $this->spellCheckerCharset . '";
			_spellChecker_mode = "' . $this->spellCheckerMode . '";
			_quickTag_hideTags = "' . $this->quickTagHideTags . '";
		/*]]>*/
		</script>
		<script type="text/javascript" src="' . $this->buildJSMainLangFile() . '"></script>
		<script type="text/javascript" src="' . $this->extHttpPath . 'htmlarea/htmlarea.js"></script>
		';
	}

	/**
	 * Return the JS-Code to initialize the Editor
	 *
	 * @return string	the html-code for loading the Javascript-Files
	 */
	function loadJScode() {
		$loadPluginCode = '';
		$pluginArray = t3lib_div::trimExplode(',', $this->pluginList , 1);
		while( list(,$plugin) = each($pluginArray) ) {
			if ($this->isPluginEnable($plugin)) {
				$loadPluginCode .= '
			typo3LoadOnlyPlugin("' . $plugin . '");';
			}
		}

		return '
			var conf_RTEtsConfigParams = "&RTEtsConfigParams=' . rawurlencode($this->RTEtsConfigParams()) . '";
			var RTEarea = new Array();
			var extHttpPath = "'.$this->extHttpPath.'";
			var rtePathImageFile = "'.$this->rtePathImageFile.'";
			var rtePathLinkFile = "' . $this->rtePathLinkFile . '";'
			. $loadPluginCode .  '
			HTMLArea.init();
			HTMLArea.I18N = HTMLArea_langArray;'
		;
	}

	/**
	 * Return the JS-Code for Register the RTE in JS
	 *
	 * @return string		the JS-Code for Register the RTE in JS
	 */
	function registerRTEinJS($number) {
		global $LANG;

		$registerRTEinJSString = '
			RTEarea['.$number.'] = new Array();
			RTEarea['.$number.']["number"] = '.$number.';
			RTEarea['.$number.']["id"] = "RTEarea'.$number.'";
			RTEarea['.$number.']["enableWordClean"] = ' . (trim($this->thisConfig['enableWordClean'])?'true':'false') . ';
			RTEarea['.$number.']["disableEnterParagraphs"] = ' . (trim($this->thisConfig['disableEnterParagraphs'])?'true':'false') . ';
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
				"' . $LANG->sL($conf['name']) . '" : "' . $conf['value'] . '"';
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
				"' . $LANG->getLL($PStyleLabel) . '" : "' . $PStyleItem . '"';
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
			initEditor('.$number.');
';

		return $registerRTEinJSString;
	}
	
	/**
	 * Return ture, if the plugin can loaded
	 *
	 * @return boolean		1 if the plugin can be loaded
	 */
	function isPluginEnable($plugin) { 
		return in_array($plugin, $this->pluginEnableArray);
	}

	/**
	 * Return a JS language array for HTMLArea
	 *
	 * @return string		JS language array
	 */
	function buildJSMainLangArray() { 

		$JSLanguageArray .= 'var HTMLArea_langArray = new Array();' . chr(10);
		$JSLanguageArray .= 'HTMLArea_langArray = { ' . chr(10);

		$subArrays = array( 'tooltips', 'buttons' , 'msg' , 'dialogs', 'custom');
		$subArraysIndex = 0;

		foreach($subArrays as $labels) {
			$JSLanguageArray .= (($subArraysIndex++)?',':'') . $labels . ': {' . chr(10);

			include (t3lib_extMgm::extPath($this->ID).'htmlarea/locallang_' . $labels . '.php');
			if(empty($LOCAL_LANG[$this->language])) {
				$LOCAL_LANG[$this->language] = $LOCAL_LANG['default'];
			} else {
				$LOCAL_LANG[$this->language] = t3lib_div::array_merge_recursive_overrule($LOCAL_LANG['default'],$LOCAL_LANG[$this->language]);
			}

			$index = 0;
			foreach ( $LOCAL_LANG[$this->language] as $labelKey => $labelValue ) {
				$JSLanguageArray .=  (($index++)?',':'') . ' "' . $labelKey . '" : "' . str_replace('"', '\"', $labelValue) . '"' . chr(10);
			}

			$JSLanguageArray .= ' }' . chr(10);
		}
		$JSLanguageArray .= ' };' . chr(10);
		return $this->csObj->conv($JSLanguageArray, $this->charset, $this->OutputCharset);
	}

	/**
	 * Return a file name containing the main JS language array for HTMLArea
	 *
	 * @return string		filename
	 */
	function buildJSMainLangFile() { 
		$contents = $this->buildJSMainLangArray() . chr(10);
		$pluginArray = t3lib_div::trimExplode(',', $this->pluginList , 1);
		while( list(,$plugin) = each($pluginArray) ) {
			if ($this->isPluginEnable($plugin)) {
				$contents .= $this->buildJSLangArray($plugin) . chr(10);
			}
		}
		$relFilename = 'typo3temp/' . $this->ID . '_' . $this->language . '_' . md5($contents) . '.js';
		$outputFilename = PATH_site . $relFilename;
		if(!file_exists($outputFilename)) {
			$outputHandle = fopen($outputFilename,'wb');
			fwrite($outputHandle, $contents);
			fclose($outputHandle);
		}
		return $this->httpTypo3Path . $relFilename;
	}

	/**
	 * Return a JS language array for the plugin
	 *
	 * @return string		JS language array
	 */
	function buildJSLangArray($plugin) { 
		include (t3lib_extMgm::extPath($this->ID).'htmlarea/plugins/' . $plugin . '/locallang.php');
		if(empty($LOCAL_LANG[$this->language])) {
			$LOCAL_LANG[$this->language] = $LOCAL_LANG['default'];
		} else {
			$LOCAL_LANG[$this->language] = t3lib_div::array_merge_recursive_overrule($LOCAL_LANG['default'],$LOCAL_LANG[$this->language]);
		}
		$JSLanguageArray .= 'var ' . $plugin . '_langArray = new Array();' . chr(10);
		$JSLanguageArray .= $plugin . '_langArray = { ' . chr(10);
		$index = 0;
		foreach ( $LOCAL_LANG[$this->language] as $labelKey => $labelValue ) {
			$JSLanguageArray .=  (($index++)?',':'') . ' "' . $labelKey . '" : "' . str_replace('"', '\"', $labelValue) . '"' . chr(10);
		} 
		$JSLanguageArray .= ' };' . chr(10);
		return $this->csObj->conv($JSLanguageArray, $this->charset, $this->OutputCharset);
	}
	
	/**
	 * Return the JS-Code for the Toolbar-Config-Array for HTML-Area
	 *
	 * @return string		the JS-Code as an JS-Array
	 */
	function getJSToolbarArray() {
		$toolbar = "";			// The JS-Code for the toolbar
		$group = "";			// The TS-Code for the group in the moment, each group are between "bar"s
		$group_has_button = false;	// True if the group has any enabled buttons

			// process each button in the order list
		reset($this->toolbarOrderArray);
		while (list(, $button) = each($this->toolbarOrderArray) ) {
			// check if a new group starts
			if (($button == 'bar' || $button == 'linebreak') && $group_has_button) {
					// Yes new group: add the "bar" to the group
				$convertButton = $this->convertToolBarForHTMLArea($button);
				if ($convertButton) {
					$convertButton = '"' . $convertButton . '"';
					$group = ($group!='') ? ($group . ', ' . $convertButton) : $convertButton;
				}
				$toolbar .= $toolbar ? (', ' . $group) : ('[[' . $group);
				$group = '';
				$group_has_button = false;
			} elseif ($toolbar && $button == 'linebreak' && !$group_has_button) {
					// Insert linebreak if no group is opened
				$group = '';
				$toolbar .= ', "' . $this->convertToolBarForHTMLArea($button) . '"';
			} elseif (in_array($button, $this->toolBar)) {
					// Add the button to the group
				$convertButton = $this->convertToolBarForHTMLArea($button);
				if ($convertButton) {
					$convertButton = '"' . $convertButton . '"';
					$group .= $group ? (', ' . $convertButton) : $convertButton;
					if($button != "space") $group_has_button = true;
				}
			}
			// else ignore
		}
			// add the last group
		if($group_has_button) $toolbar .= $toolbar ? (', ' . $group) : ('[[' . $group);
		$toolbar = $toolbar . "]]";
		return $toolbar;
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
			//fixImageSrc(editornumber);  // IE remove http://domain, so we need to add it.
			document.'.$form.'["'.$textarea.'"].value = RTEarea[editornumber]["editor"].getHTML();
		}
		else {
			OK=0;
		}
		';
	}

	function makeMozillaExtension() {
		$archivePath = PATH_site . 'uploads/tx_' . $this->ID . '/';
		$refArchivePath = PATH_site . 'typo3temp/';
		$archiveName = $archivePath . 'typo3_' . $this->ID . '_prefs.xpi';
		$refArchiveName = $refArchivePath . $this->ID . '_' . md5(t3lib_div::getIndpEnv('TYPO3_REQUEST_HOST')) . '_user.js';
		if(!file_exists($archiveName) || !file_exists($refArchiveName)) {
			require_once(t3lib_extMgm::extPath('rtehtmlarea').'archive_zip/Zip.php');
			$extensionFilesPath = t3lib_extMgm::extPath($this->ID) . 'mozilla/';
			$this->updateMozillaUserFile($archivePath, $refArchivePath, $extensionFilesPath);
			$extensionFiles = array($extensionFilesPath . 'install.js', $extensionFilesPath .  'contents.rdf', $archivePath . 'user.js');
			$params = array('remove_all_path' => true);
			$zip = new Archive_Zip($archiveName);
			$archiveInfo = $zip->create($extensionFiles, $params);
		}

	}

	function updateMozillaUserFile($archivePath,$refArchivePath,$extensionFilesPath) {
		$inputFilename = $extensionFilesPath . 'user.js';
		$inputHandle = fopen($inputFilename, 'rb');
		$contents = fread ($inputHandle, filesize ($inputFilename));
		fclose($inputHandle);
		$contents = str_replace ( 'http://www.mozilla.org', t3lib_div::getIndpEnv('TYPO3_REQUEST_HOST'), $contents);
		$outputFilename = $archivePath . 'user.js';
		$outputHandle = fopen($outputFilename,'wb');
		fwrite($outputHandle, $contents);
		fclose($outputHandle);
		$outputFilename = $refArchivePath . $this->ID . '_' . md5(t3lib_div::getIndpEnv('TYPO3_REQUEST_HOST')) . '_user.js';
		$outputHandle = fopen($outputFilename,'wb');
		fwrite($outputHandle, $contents);
		fclose($outputHandle);
	}

	/**
	 * Copy a file, or recursively copy a folder and its contents
	 *
	 * @author      Aidan Lister <aidan@php.net>
	 * @version     1.0.1
	 * @param       string   $source    Source path
	 * @param       string   $dest      Destination path
	 * @return      bool     Returns TRUE on success, FALSE on failure
	 */
	function copyr($source, $dest) {


			// Simple copy for a file
		if (is_file($source)) {

			return copy($source, $dest);
		}

			// Make destination directory
		if (!is_dir($dest)) {
			mkdir($dest);
		}

			// Loop through the folder
		$dir = dir($source);
		while (false !== $entry = $dir->read()) {
				// Skip pointers
			if ($entry == '.' || $entry == '..') {
				continue;
			}

				// Deep copy directories
			if ($dest !== "$source/$entry") {
				$this->copyr("$source/$entry", "$dest/$entry");
			}
		}
 
			// Clean up
		$dir->close();
		return true;
	}

	/**
	 * Client Browser Information
	 *
	 * Usage: 4
	 *
	 * @param	string		Alternative User Agent string (if empty, t3lib_div::getIndpEnv('HTTP_USER_AGENT') is used)
	 * @return	array		Parsed information about the HTTP_USER_AGENT in categories BROWSER, VERSION, SYSTEM and FORMSTYLE
	 */
	function clientInfo($useragent='')	{
		if (!$useragent) $useragent=t3lib_div::getIndpEnv('HTTP_USER_AGENT');

		$bInfo=array();
			// Which browser?
		if (strstr($useragent,'Konqueror'))	{
			$bInfo['BROWSER']= 'konqu';
		} elseif (strstr($useragent,'Opera'))	{
			$bInfo['BROWSER']= 'opera';
		} elseif (strstr($useragent,'MSIE 4') || strstr($useragent,'MSIE 5') || strstr($useragent,'MSIE 6'))	{
			$bInfo['BROWSER']= 'msie';
		} elseif (strstr($useragent,'Gecko/'))	{
			$bInfo['BROWSER']='gecko';
		} elseif (strstr($useragent,'Mozilla/4')) {
			$bInfo['BROWSER']='net';
		}
		if ($bInfo['BROWSER'])	{
				// Browser version
			switch($bInfo['BROWSER'])	{
				case 'net':
					$bInfo['VERSION']= doubleval(substr($useragent,8));
					if (strstr($useragent,'Netscape6/')) {$bInfo['VERSION']=doubleval(substr(strstr($useragent,'Netscape6/'),10));}
					if (strstr($useragent,'Netscape/7')) {$bInfo['VERSION']=doubleval(substr(strstr($useragent,'Netscape/7'),9));}
				break;
				case 'gecko':
					$tmp = strstr($useragent,'rv:');
					$bInfo['VERSION'] = doubleval(ereg_replace('^[^0-9]*','',substr($tmp,3)));
				break;
				case 'msie':
					$tmp = strstr($useragent,'MSIE');
					$bInfo['VERSION'] = doubleval(ereg_replace('^[^0-9]*','',substr($tmp,4)));
				break;
				case 'opera':
					$tmp = strstr($useragent,'Opera');
					$bInfo['VERSION'] = doubleval(ereg_replace('^[^0-9]*','',substr($tmp,5)));
				break;
				case 'konqu':
					$tmp = strstr($useragent,'Konqueror/');
					$bInfo['VERSION'] = doubleval(substr($tmp,10));
				break;
			}
				// Client system
			if (strstr($useragent,'Win'))	{
				$bInfo['SYSTEM'] = 'win';
			} elseif (strstr($useragent,'Mac'))	{
				$bInfo['SYSTEM'] = 'mac';
			} elseif (strstr($useragent,'Linux') || strstr($useragent,'X11') || strstr($useragent,'SGI') || strstr($useragent,' SunOS ') || strstr($useragent,' HP-UX '))	{
				$bInfo['SYSTEM'] = 'unix';
			}
		}
			// Is true if the browser supports css to format forms, especially the width
		$bInfo['FORMSTYLE']=($bInfo['BROWSER']=='msie' || ($bInfo['BROWSER']=='net'&&$bInfo['VERSION']>=5) || $bInfo['BROWSER']=='opera' || $bInfo['BROWSER']=='konqu');

		return $bInfo;
	}

	/***************************
	 *
	 * OTHER FUNCTIONS:	(from the orginal RTE)
	 *
	 ***************************/
	/**
	 * @return	[type]		...
	 * @desc 
	 */
	function RTEtsConfigParams()	{
		$p = t3lib_BEfunc::getSpecConfParametersFromArray($this->specConf['rte_transform']['parameters']);
		return $this->elementParts[0].':'.$this->elementParts[1].':'.$this->elementParts[2].':'.$this->thePid.':'.$this->typeVal.':'.$this->tscPID.':'.$p['imgpath'];
	}

	function cleanList($str)        {
		if (strstr($str,'*'))   {
			$str = '*';

		} else {
			$str = implode(',',array_unique(t3lib_div::trimExplode(',',$str,1)));
		}
		return $str;
	}
}

if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/rtehtmlarea/class.tx_rtehtmlarea_base.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/rtehtmlarea/class.tx_rtehtmlarea_base.php']);
}
?>