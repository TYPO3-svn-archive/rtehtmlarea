<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2004 Kasper Skaarhoj (kasper@typo3.com)
*  (c) 2004 Philipp Borgmann <philipp.borgmann@gmx.de>
*  (c) 2004 Stanislas Rolland <stanislas.rolland@fructifor.com>
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
	
	// Config for the supported browser
	var $conf_supported_browser = array (
				"msie" => array (
					1 => array (
						"version" => 5,
						"system" => "win"
					)
                                 ),
				"net" => array (
					1 => array (
						"version" => 1
					)
				)
			);
			
			
	// Hide this toolbar button always (typo3 button name)
	var $conf_toolbar_hide = array (
				"popupeditor",  //Does not work
				"showhelp",		// Has no content yet
				"emoticon", // Not implemant yet
				"user", 	// Not implemant yet and don't know what it is
			);	
	// Show this toolbar buttons always (typo3 button name)
	var $conf_toolbar_show = array (
				"undo", "redo", // Helpfull
				"textindicator",// Show a info of the style from the activ text
				//"popupeditor",	// Fullscreen in a popup
				//"showhelp",		// Show the Helpbutton
				"about"
			);
	/** The order of the toolbar.
	 * The name is the typ3-button name
	 */
	var $conf_toolbar_order = array (
				"fontstyle",
					"space",
				"fontsize",
					"space",
				"formatblock",
					"space",
				"bold",
				"italic",
				"underline",
					"bar",
				"strikethrough",
				"subscript",
				"superscript",
					"bar",
				"lefttoright",
				"righttoleft",
					"bar",
				"left",
				"center",
				"right",
				"justifyfull",
					"bar",
				"orderedlist",
				"unorderedlist",
				"outdent",
				"indent",
					"bar",
				"textcolor",
				"bgcolor",
				"textindicator",
					"bar",
				"line",
				"link",
				"image",
				"table",
				"chMode",
					"bar",
				"copy",
				"cut",
				"paste",
					"bar",
				"undo",
				"redo",
					"bar",
				"popupeditor",
				"showhelp",
				"about",
					"bar",

			);// It musst ends with a bar
			
	/* The lenght of the button.
	 * The lenght isn't the real lenght, it is just for greate an JS-array: In one
	 * level of the toolbar can be for eg. 10 normal-size buttons. But some buttons
	 * needs more than other (e.g. fontstyle). So the size is just for greate a
	 * generate a better toolbar.
	 */
	var $conf_toolbar_button_size = array (
			// "button name" => size
		'std'			=> 22,	// The standard size
		'space'			=> 5,
		'fontstyle' 	=> 118,					
		'fontsize'		=> 73,
		'formatblock'	=> 81,
		'textindicator'	=> 28,
		'bar'			=> 8,
		'DynamicCSS'		=> 150,
		'SpellChecker'		=> 30,
		'SelectColor'		=> 49,
		'InsertSmiley'		=> 22,
		'FindReplace'		=> 22,
		'RemoveFormat'		=> 22,
		'CharacterMap'		=> 22,
	);
			
	// Config: Convert for the typo3 button name and the HTML-Area button name.
	var $conf_toolbar_convert = array (
			// "typo3name" 	=> "HTMLAreaName"
 			"fontstyle" 	=> "fontname",
 			"fontsize" 		=> "fontsize",
 			"textcolor" 	=> "forecolor",
 			"bold" 			=> "bold",
 			"italic" 		=> "italic",
 			"underline" 	=> "underline",
 			"left" 			=> "justifyleft",
 			"center" 		=> "justifycenter",
 			"right" 		=> "justifyright",
 			"orderedlist" 	=> "insertorderedlist",
 			"unorderedlist"	=> "insertunorderedlist",
 			"outdent" 		=> "outdent",
			"indent" 		=> "indent",
			"link" 			=> "createlink",
			"table" 		=> "inserttable",
			"image" 		=> "insertimage",
			"line" 			=> "inserthorizontalrule",
			"cut" 			=> "cut",
			"copy" 			=> "copy",
			"paste" 		=> "paste",
			"formatblock" 	=> "formatblock",
			"chMode" 		=> "htmlmode",
			"bgcolor" 		=> "hilitecolor",
			"emoticon"		=> "", /*implemented as a htlmArea plugin*/
			"user" 			=> "", /*not implement yet*/
			
			// HTML-Area extra buttons
			"lefttoright" 	=> "lefttoright",
			"righttoleft" 	=> "righttoleft",
			"justifyfull" 	=> "justifyfull",
			"strikethrough" => "strikethrough",
			"superscript" 	=> "superscript",
			"subscript" 	=> "subscript",
			"showhelp" 		=> "showhelp",
			
			// Toolbar formating
			"space" 		=> "space",
			"bar" 			=> "separator",
			
			// always show
			"undo" 			=> "undo",
			"redo" 			=> "redo",
			"textindicator" => "textindicator",
			"popupeditor" 	=> "popupeditor",
			"about" 		=> "about"
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

	var $pluginList = 'DynamicCSS, TableOperations, ContextMenu, SpellChecker, SelectColor, TYPO3Browsers, InsertSmiley, FindReplace, RemoveFormat, CharacterMap, EnterParagraphs';
	var $spellCheckerModes = array( 'ultra', 'fast', 'normal', 'bad-spellers');
		
		// External:
	var $RTEdivStyle;			// Alternative style for RTE <div> tag.
	var $extHttpPath;			// full Path to this extension for http (so no Server path). It ends with "/"
	var $rtePathImageFile;			// Path to the php-file for selection images
	var $rtePathLinkFile;			// Path to the php-file for create a link
	var $rtePathColorFile;			// Path to the php-file for the color picker
	var $siteURL;				// TYPO3 site url

		// Internal, static:
	var $ID = 'rtehtmlarea';				// Identifies the RTE as being the one from the "rte" extension if any external code needs to know...
	var $debugMode = FALSE;			// If set, the content goes into a regular TEXT area field - for developing testing of transformations. (Also any browser will load the field!)
	
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
	var $toolBar = array();			// Save the buttons for the toolbar
	var $toolbar_level_size;		// The size for each level in the toolbar:

	/**
	 * Returns true if the RTE is available. Here you check if the browser requirements are met.
	 * If there are reasons why the RTE cannot be displayed you simply enter them as text in ->errorLog
	 *
	 * @return	boolean		TRUE if this RTE object offers an RTE in the current browser environment
	 */
	function isAvailable()	{
		global $CLIENT;

		if (TYPO3_DLOG)	t3lib_div::devLog('Checking for availability...',$this->ID);

		$this->errorLog = array();
		if (!$this->debugMode)	{	// If debug-mode, let any browser through
			$rteIsAvailable = 0;
			
			$rteConfBrowser = $this->conf_supported_browser;
			if (is_array($rteConfBrowser)) {
				reset($rteConfBrowser);
				while(list ($browser, $browserConf) = each($rteConfBrowser)){
					if ($browser == $CLIENT['BROWSER']) {
				    	// Config for Browser found, check it:
						if (is_array($browserConf)) {
					    	reset($browserConf);
							while(list ($browserConfNr, $browserConfSub) = each($browserConf)){
								if ($browserConfSub["version"] <= $CLIENT['VERSION']
									|| !sizeof($browserConfSub["version"])) {
									// Version is correctly
							    	if ($browserConfSub["system"] == $CLIENT['SYSTEM']
										|| !sizeof($browserConfSub["system"])) {
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
		if (!count($this->errorLog))	return TRUE;
	}

	/**
	 * Draws the RTE as an iframe for MSIE 5+
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
		global $CLIENT;
		global $BE_USER,$LANG,$HTTP_GET_VARS,$TBE_TEMPLATE,$TCA;

		$LANG->includeLLFile('EXT:' . $this->ID . '/locallang.php');
		
			// Draw form element:
		if ($this->debugMode)	{	// Draws regular text area (debug mode)



			$item = parent::drawRTE($pObj,$table,$field,$row,$PA,$specConf,$thisConfig,$RTEtypeVal,$RTErelPath,$thePidValue);
		} else {	// Draw real RTE
		
			/* =======================================
			 * INIT THE EDITOR-SETTINGS
			 * =======================================
			 */
			// set the path: we need the absolut path:
			// first get the http-path to typo3:
			$this->httpTypo3Path = dirname(dirname($_SERVER['SCRIPT_NAME']));

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
			$this->rtePathLinkFile = $this->httpTypo3Path . 'typo3/browse_links.php';
				// Get the site URL
			$this->siteURL = t3lib_div::getIndpEnv('TYPO3_SITE_URL');

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
	
			if ($this->thisConfig['disabled'])	{
				die ('System Error: Apparently the RTE is disabled and this script should not have been loaded anyway.');
			}

				// Special configuration (line) and default extras:
			$this->specConf = $specConf;

				// HTMLArea plugins list
			$this->pluginList = implode(',', array_intersect(t3lib_div::trimExplode(',', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['HTMLAreaPluginList'] , 1), t3lib_div::trimExplode(',', $this->pluginList, 1)));

				// Language
			$this->language = $LANG->lang;
			if ($this->language=='default' || !$this->language)	{
				$this->language='en';
			}
				// Character set
			$this->csObj = t3lib_div::makeInstance('t3lib_cs');
			$this->charset = $this->csObj->$charSetArray[$this->language];
			$this->charset = $this->charset ? $this->charset : 'iso-8859-1';
			$this->BECharset = trim($GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset']) ? trim($GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset']) : $this->charset;

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
			
			// Setting style: for the div-Tag
			$RTEWidth = 460+($pObj->docLarge ? 150 : 0);
			$RTEdivStyle = $this->RTEdivStyle ? $this->RTEdivStyle : 'height:380px; width:'.$RTEWidth.'px;';
			
			/* =======================================
			 * SET THE TOOLBAR AND PLUGINS

			 * =======================================
			 */
			$this->toolbar_level_size = $RTEWidth;
			$this->setToolBar();

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

			$pObj->additionalCode_pre['loadCSS'] .= '
				<link rel="stylesheet" type="text/css" href="' . $this->extHttpPath . 'htmlarea/htmlarea.css" />';
			$pObj->additionalCode_pre['loadJSfiles'] = $this->loadJSfiles();
			$pObj->additionalJS_pre['loadJScode'] = $this->loadJScode();		 

			/* =======================================
			 * DRAW THE EDITOR
			 * =======================================
			 */
				// Transform value:
			$value = $this->transformContent('rte',$PA['itemFormElValue'],$table,$field,$row,$specConf,$thisConfig,$RTErelPath,$thePidValue);
			if ($CLIENT['BROWSER'] == "net") {
				// need to change some tags:
				// change <strong> to <b>
				$value = preg_replace("/<(\/?)strong>/i", "<$1b>", $value);
				// change <em> to <i>
				$value = preg_replace("/<(\/?)em>/i", "<$1i>", $value);
				
				// the change-back to em and strong make the backend
			}

				// Register RTE windows:
			$pObj->RTEwindows[] = $PA['itemFormElName'];

			// Check if we in Fullscreen mode: or check if wizard_rte call this
			if (basename(PATH_thisScript)=="wizard_rte.php") {
				// change the size of the RTE to fullscreen: use JS for this
				$height = "window.innerHeight";
				$wight = "window.innerWidth";
				
				if ($CLIENT['BROWSER'] == "msie") {
					$height = "document.body.offsetHeight";
					$wight = "document.body.offsetWidth";
				}
				$pObj->additionalJS_post[] = $this->setRTEsizeByJS('RTEarea'.$pObj->RTEcounter, $height, $wight);
			}
			
			// Register RTE in JS:
			$pObj->additionalJS_post[] = $this->registerRTEinJS($pObj->RTEcounter);


			// Set the save option for the RTE:
			$pObj->additionalJS_submit[] = $this->setSaveRTE($pObj->RTEcounter, $pObj->formName, htmlspecialchars($PA['itemFormElName']));
			
			// draw the textarea
			$item = 
				$this->triggerField($PA['itemFormElName']).'
				<div id="pleasewait' . $pObj->RTEcounter . '" class="pleasewait">' . $LANG->getLL('Please wait') . '</div>
				<div id="editorWrap' . $pObj->RTEcounter . '" style="visibility:hidden">
				<textarea id="RTEarea'.$pObj->RTEcounter.'" rows="24" cols="80" name="'.htmlspecialchars($PA['itemFormElName']).'" style="'.htmlspecialchars($RTEdivStyle).'">
				'.t3lib_div::formatForTextarea($value).'
				</textarea>
				</div>
				';
		}

			// Return form item:
		return $item;
	}
	
	/**
	 * Set the toolbar-config (only in this PHP-Object, not in JS):
	 * This set $this-toolBar to all allow buttons
	 *
	 * 
	 */
	function setToolBar() {

		global $BE_USER;

		//toolBar

		/* ===================================
		 * LOAD THE SHOW-BUTTON
		 * ===================================
		 */
		// Show all 
		$show = array_values($this->conf_toolbar_order);

			// specConf for field from backend
		$pList = is_array($this->specConf['richtext']['parameters']) ? implode(',',$this->specConf['richtext']['parameters']) : '*';
		if ($pList!='*')	{	// If not all
			$show = $this->specConf['richtext']['parameters'];
			if ($this->thisConfig['showButtons'])	{
				$show = array_unique(array_merge($show,t3lib_div::trimExplode(',',$this->thisConfig['showButtons'],1)));
			}
		}
		
			// RTEkeyList for backend user
		$RTEkeyList = isset($BE_USER->userTS['options.']['RTEkeyList']) ? $BE_USER->userTS['options.']['RTEkeyList'] : '*';
		if ($RTEkeyList!='*')	{
			$show = t3lib_div::trimExplode(',',$RTEkeyList,1);
		} else {
			$show[] = 'chMode'; // Show the HTML-Mode button
		}

		/* ===================================
		 * LOAD THE HIDE-BUTTON
		 * ===================================
		 */
		$hide = $this->conf_toolbar_hide;
		if( $this->isPluginEnable('SelectColor') ) {
			$hide[] = 'textcolor';
			$hide[] = 'bgcolor';
		}

		if ($this->thisConfig['hideButtons'])	{
			$hide = array_unique(array_merge($hide,t3lib_div::trimExplode(',',$this->thisConfig['hideButtons'],1)));
		}

		// Hide the buttons:
		$show = array_diff($show, $hide);

		// Load the always show bottons:
		$show = array_merge($show, $this->conf_toolbar_show);

		$this->toolBar = $show;
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
	 	//echo "Brauche $button <br>\n";
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
		global $BE_USER;
		return '
		<script type="text/javascript">
			_editor_url = "' . $this->extHttpPath . 'htmlarea";
			_editor_lang = "' . $this->language . '";
			_typo3_site_url = "' . $this->siteURL . '";
			_spellChecker_lang = "' . $this->spellCheckerLanguage . '";
			_spellChecker_charset = "' . $this->spellCheckerCharset . '";
			_spellChecker_mode = "' . $this->spellCheckerMode . '";
			' . $this->buildJSMainLangArray() . '
		</script>
		<script type="text/javascript" src="' . $this->extHttpPath . 'htmlarea/htmlarea.js"></script>
		<script type="text/javascript" src="' . $this->extHttpPath . 'typo3_rte.js"></script>
		';
	}
	
	
	/**
	 * Return the JS-Code for init the Editor
	 *
	 * @return string		the html-code for loading the Javascript-Files
	 */
	function loadJScode() {
		$loadPluginCode = '';
		$pluginArray = t3lib_div::trimExplode(',', $this->pluginList , 1);
		while( list(,$plugin) = each($pluginArray) ) {
			if ($this->isPluginEnable($plugin)) {
				$loadPluginCode .= $this->buildJSLangArray($plugin) . chr(10);
				$loadPluginCode .= 'typo3LoadOnlyPlugin("' . $plugin . '");' . chr(10);
			}
		}

		return '
			var conf_RTEtsConfigParams = "&RTEtsConfigParams='.rawurlencode($this->RTEtsConfigParams()).'";
					// Save the Configs
			var RTEarea = new Array(); '
					/* Save data for each RTE: RTEarea[i][key]:
					* key are: 
					* number 		- the number of the RTE
					* textarea		- the textarea of the editor
					* inputField	- the hidden input-field with the htmlcode (the object not the name)
					* editor		- the HTMLarea object
					* plugin		- an array with enable the plugins
					* toolbar		- the HTMLarea toolbar-array
					*/
			.'
			var extHttpPath = "'.$this->extHttpPath.'"; // Path to this extension
			var rtePathImageFile = "'.$this->rtePathImageFile.'"; // Path to the php-file for selection images
			var rtePathLinkFile = "'.$this->rtePathLinkFile.'"; // Path to the php-file for create a link'
			// Load the Plugins:
			. $loadPluginCode
			.  '
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
					$filename = '/' . t3lib_extMgm::siteRelPath($extKey).$local;
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
		global $BE_USER;
		$pluginEnableList = isset($BE_USER->userTS['options.']['HTMLAreaPluginList']) ? $BE_USER->userTS['options.']['HTMLAreaPluginList'] : $this->pluginList;
		$pluginEnableArray = array_intersect(t3lib_div::trimExplode(',', $pluginEnableList , 1), t3lib_div::trimExplode(',', $this->pluginList, 1));
		switch ($plugin) {
			case 'TableOperations':
				return (in_array($plugin, $pluginEnableArray) && in_array('table', $this->toolBar)) ? true : false;
				break;
			case 'SpellChecker':
				return (in_array($plugin, $pluginEnableArray) && t3lib_extMgm::isLoaded('sr_static_info') && !in_array($this->language, t3lib_div::trimExplode(' ', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF'][$this->ID]['noSpellCheckLanguages']))) ? true : false;
				break;
			default:
				return in_array($plugin, $pluginEnableArray);
				break;
		}	
	}


	/**
	 * Return a JS language array for HTMLArea
	 *
	 * @return array		JS language array
	 */
	function buildJSMainLangArray() { 

		$JSLanguageArray .= 'var HTMLArea_langArray = new Array();' . chr(10);
		$JSLanguageArray .= 'var HTMLArea_langArray = { ' . chr(10);

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
				$JSLanguageArray .=  (($index++)?',':'') . ' "' . $labelKey . '" : "' . $labelValue . '"' . chr(10);
			}

			$JSLanguageArray .= ' }' . chr(10);
		}
		$JSLanguageArray .= ' };' . chr(10);

		return $this->csObj->conv($JSLanguageArray, $this->charset, $this->BECharset);
	}

	/**
	 * Return a JS language array for the plugin
	 *
	 * @return array		JS language array
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
			$JSLanguageArray .=  (($index++)?',':'') . ' "' . $labelKey . '" : "' . $labelValue . '"' . chr(10);
		} 
		$JSLanguageArray .= ' };' . chr(10);

		return $this->csObj->conv($JSLanguageArray, $this->charset, $this->BECharset);
	}
	
	/**
	 * Return the JS-Code for the Toolbar-Config-Array for HTML-Area
	 *
	 * @return string		the JS-Code as an JS-Array
	 */
	function getJSToolbarArray() {
		$toolbar = "";		// The JS-Code for the toolbar
		$toolbar_size = 0;	// The size of all buttons in one level of the toolbar, at start it's 0
		$group = "";		// The TS-Code for the groub in the moment, each groub are between "bar"s
		$group_size = 0;	// same as $toolbar_size, but for the groub.
		$group_has_button = false; // True if the group has any enable buttons
		$conf_toolbar_button_size = array();
		$conf_toolbar_button_size['textindicator'] = $this->conf_toolbar_button_size['textindicator'];
		$conf_toolbar_button_size['inserthorizontalrule'] = $this->conf_toolbar_button_size['inserthorizontalrule']?$this->conf_toolbar_button_size['inserthorizontalrule']:$this->conf_toolbar_button_size['std'];


		if($this->isPluginEnable('DynamicCSS')) {
			$toolbar_size += $this->conf_toolbar_button_size['DynamicCSS'];	
		}
		if($this->isPluginEnable('SpellChecker')) {
			$toolbar_size += $this->conf_toolbar_button_size['SpellChecker'];	
		}
		if($this->isPluginEnable('FindReplace')) {
			$toolbar_size += $this->conf_toolbar_button_size['FindReplace'];	
		}
		if($this->isPluginEnable('SelectColor')) {
			$conf_toolbar_button_size['textindicator'] += $this->conf_toolbar_button_size['SelectColor'];
		}
		if($this->isPluginEnable('InsertSmiley')) {
			$conf_toolbar_button_size['inserthorizontalrule'] += $this->conf_toolbar_button_size['InsertSmiley'];
		}

		reset($this->conf_toolbar_order);
		// each	button in the order list
		while (list($num, $button) = each($this->conf_toolbar_order) ) {
			// check if a new groub start:
			if ($button == "bar" && $group_has_button) {
				// Yes new group:
				// Add the "bar" to the group
				
				$convertButton = $this->convertToolBarForHTMLArea($button);
				if ($convertButton) {
					$convertButton = '"' . $convertButton . '"';
					$group = ($group!="") ? ($group . ", " . $convertButton) : $convertButton;
					$group_size += ($this->conf_toolbar_button_size[$button]) ? ($conf_toolbar_button_size[$button]?$conf_toolbar_button_size[$button]:$this->conf_toolbar_button_size[$button]) : $this->conf_toolbar_button_size["std"];
				}
				
				// check if the group fit in the level, and it is not the first group in the toolbar
				if (($toolbar_size + $group_size <= $this->toolbar_level_size) && $toolbar!="") {
					// Yes it fit:
					$toolbar_size += $group_size;
					$toolbar = $toolbar . ", " . $group;
				}
				// check if it's the first group in the toolbar
				elseif ($toolbar == "") {
					$toolbar_size += $group_size;
					$toolbar = "[\n[" . $group;
				}
				else {
					// No it doesn't fit:
					$toolbar_size = $group_size;
					$toolbar = $toolbar . "],\n[" . $group;
				}
				
				$group = "";
				$group_size = "";
				$group_has_button = false;
				
			}
			elseif (in_array($button, $this->toolBar)) {
				// Add the button to the groub:
				$convertButton = $this->convertToolBarForHTMLArea($button);
				if ($convertButton) {
					$convertButton = '"' . $convertButton . '"';
					$group = ($group!="") ? ($group . ", " . $convertButton) : $convertButton;
					$group_size += ($this->conf_toolbar_button_size[$button]) ? ($conf_toolbar_button_size[$button]?$conf_toolbar_button_size[$button]:$this->conf_toolbar_button_size[$button]) : $this->conf_toolbar_button_size["std"];
					$group_has_button = true;
				}
			}
			// else ignore
			
		}
		
		$toolbar = $toolbar . "]\n]";
		
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