<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2004 Kasper Skaarhoj (kasper@typo3.com)
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
 * Front end RTE based on HTMLArea
 *
 * @author	Philipp Borgmann <philipp.borgmann@gmx.de>
 * @coauthor Stanislas Rolland <stanislas.rolland@fructifor.com>
 */
/**
 * Changes:
 * 20.10.2004 Stanislas Rolland
 *  create this front end version (not yet functional)
 */

require_once(PATH_t3lib.'class.t3lib_rteapi.php');
require_once(PATH_t3lib.'class.t3lib_cs.php');
require_once(t3lib_extMgm::extPath('sr_htmlarea').'class.tx_rtepbhtmlarea_base.php');

class tx_srhtmlarea_pi2 extends tx_rtepbhtmlarea_base {

	var $pluginList = 'TableOperations, ContextMenu, SpellChecker, DynamicCSS, FullPage';
	var $spellCheckerModes = array( 'ultra', 'fast', 'normal', 'bad-spellers');
		
		// External:
	var $RTEdivStyle;				// Alternative style for RTE <div> tag.
	var $extHttpPath;				// full Path to this extension for http (so no Server path). It ends with "/"
	var $rtePathImageFile;			// Path to the php-file for selection images
	var $rtePathLinkFile;			// Path to the php-file for create a link

		// Internal, static:
	var $ID = 'rte_pb_htmlarea';				// Identifies the RTE as being the one from the "rte" extension if any external code needs to know...
	
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

	/**
	 * Returns true if the RTE is available. Here you check if the browser requirements are met.
	 * If there are reasons why the RTE cannot be displayed you simply enter them as text in ->errorLog
	 *
	 * @return	boolean		TRUE if this RTE object offers an RTE in the current browser environment
	 */
	function isAvailable()	{

		if (TYPO3_DLOG)	t3lib_div::devLog('Checking for availability...','rte_pb_htmlarea');

		$this->errorLog = array();
		if (!$this->debugMode)	{	// If debug-mode, let any browser through
			$rteIsAvailable = 0;
			
			$rteConfBrowser = $this->conf_supported_browser;
			if (is_array($rteConfBrowser)) {
				reset($rteConfBrowser);
				while(list ($browser, $browserConf) = each($rteConfBrowser)){
					if ($browser == $GLOBALS['TSFE']->clientInfo['BROWSER']) {
				    	// Config for Browser found, check it:
						if (is_array($browserConf)) {
					    	reset($browserConf);
							while(list ($browserConfNr, $browserConfSub) = each($browserConf)){
								if ($browserConfSub["version"] <= $GLOBALS['TSFE']->clientInfo['VERSION']
									|| !sizeof($browserConfSub["version"])) {
									// Version is correctly
							    	if ($browserConfSub["system"] == $GLOBALS['TSFE']->clientInfo['SYSTEM']
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

		
		/* =======================================
		 * INIT THE EDITOR-SETTINGS
		 * =======================================
		 */
		// set the path: we need the absolut path:
		// first get the http-path to typo3:
		$httpTypo3Path = dirname(dirname($_SERVER['SCRIPT_NAME']));

		if (strlen($httpTypo3Path) == 1) {
			$httpTypo3Path = "/";
		} else {
			$httpTypo3Path .= "/";
		}
			// Get the path to this extension:
		$this->extHttpPath = $httpTypo3Path.t3lib_extMgm::siteRelPath($this->ID);
			// Get the Path to the script for selecting an image
		$this->rtePathImageFile = $this->extHttpPath."rtepbhtmlarea_select_image.php";
			// Get the Path to the script for create a link
		$this->rtePathLinkFile = $httpTypo3Path."typo3/browse_links.php";

			// Element ID + pid
		$this->elementId = $PA['itemFormElName']; // Form element name
		$this->elementParts = explode('][',ereg_replace('\]$','',ereg_replace('^(TSFE_EDIT\[data\]\[|data\[)','',$this->elementId)));

			// Find the page PIDs:
		//list($this->tscPID,$this->thePid) = t3lib_BEfunc::getTSCpid(trim($this->elementParts[0]),trim($this->elementParts[1]),$thePidValue);
		$this->tscPID = 0;
		$this->thePid = 0;

			// Record "types" field value:
		$this->typeVal = $RTEtypeVal; // TCA "types" value for record

		unset($this->RTEsetup);
		$pageTSConfig = $GLOBALS['TSFE']->getPagesTSconfig();
		$this->RTEsetup = $pageTSConfig['RTE.'];
		$this->thisConfig = $this->RTEsetup['default'];
		//$this->thisConfig = $thisConfig;
	
			if ($this->thisConfig['disabled'])	{
				die ('System Error: Apparently the RTE is disabled and this script should not have been loaded anyway.');
			}

				// Special configuration (line) and default extras:
			$this->specConf = $specConf;
			
				// Language
			$this->language = $GLOBALS['TSFE']->lang;
			if ($this->language=='default' || !$this->language)	{
				$this->language='en';
			}
				// Character set
			$this->csObj = t3lib_div::makeInstance('t3lib_cs');
			$this->charset = $this->csObj->$charSetArray[$this->language];
			$this->charset = $this->charset ? $this->charset : 'iso-8859-1';
			$this->FECharset  = trim($GLOBALS['TSFE']->config['config']['metaCharset']) ? trim($GLOBALS['TSFE']->config['config']['metaCharset']) : $this->charset;

				// Now convert language code from typo3 code to iso code for HTMLArea and Aspell
			if ($new_lang = array_search($this->language, $this->conf_langname_convert)) {
				$this->language = $new_lang;
			}

			if( $this->isPluginEnable('SpellChecker') ) {
					// Set the language of the content for the SpellChecker
				$this->spellCheckerLanguage = $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['rte_pb_htmlarea']['defaultDictionary'];
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
				$this->spellCheckerMode = isset($this->RTEsetup['default.']['HTMLAreaPspellMode']) ? trim($this->RTEsetup['default.']['HTMLAreaPspellMode']) : 'normal';
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
			 * LOAD JS, CSS and more
			 * =======================================
			 */			
			$pObj->additionalCode_pre['loadJSfiles'] = $this->loadJSfiles();
			$pObj->additionalCode_pre['loadCSS'] = '
				<style type="text/css">
					' .$this->loadCSS() .'
				</style>
			';
			
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
				<textarea id="RTEarea'.$pObj->RTEcounter.'" rows="24" cols="80" name="'.htmlspecialchars($PA['itemFormElName']).'" style="'.htmlspecialchars($RTEdivStyle).'">
				'.t3lib_div::formatForTextarea($value).'
				</textarea>
				';

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
	 * Return the JS-Code for Register the RTE in JS
	 *
	 * @return string		the JS-Code for Register the RTE in JS
	 */
	function registerRTEinJS($number) {
		global $LANG;
		$registerRTEinJSString = 'RTEarea['.$number.'] = new array();
			RTEarea['.$number.']["number"] = '.$number.';
			RTEarea['.$number.']["id"] = "RTEarea'.$number.'";
			RTEarea['.$number.']["plugin"] = new array();
			';
		$pluginArray = t3lib_div::trimExplode(',', $this->pluginList , 1);
		while( list(,$plugin) = each($pluginArray) ) {
			if ($this->isPluginEnable($plugin)) {
				$registerRTEinJSString .= 'RTEarea['.$number.']["plugin"]["'.$plugin.'"] = true;
				';
			}
		}
		if ( $this->isPluginEnable('DynamicCSS') ) {
			if($this->thisConfig['contentCSS']) {
				$filename = $this->thisConfig['contentCSS'];
				if (substr($filename,0,4)=='EXT:')      {       // extension
					list($extKey,$local) = explode('/',substr($filename,4),2);
					$filename='';
					if (strcmp($extKey,'') &&  t3lib_extMgm::isLoaded($extKey) && strcmp($local,'')) {
						$filename = '/' . t3lib_extMgm::siteRelPath($extKey).$local;
					}
				} 
				$registerRTEinJSString .= 'RTEarea['.$number.']["pageStyle"] = "@import url(' . $filename . ');";
			';
			} else {
				$registerRTEinJSString .= 'RTEarea['.$number.']["pageStyle"] = "@import url(' . $this->extHttpPath . 'htmlarea/plugins/DynamicCSS/dynamic.css);";
			';
			}
		}
			// Setting the list of fonts if specified in the RTE config

		if (is_array($this->RTEsetup['fonts.']) && $this->isPluginEnable('DynamicCSS') )  {
			$HTMLAreaFontname = array();
			reset($this->RTEsetup['fonts.']);
			while(list($fontName,$conf)=each($this->RTEsetup['fonts.']))      {
				$fontName=substr($fontName,0,-1);
				$HTMLAreaFontname[$fontName] = '"' . $LANG->sL($conf['name']) . '" : "' . $conf['value'] . '"';
			}
		}
		if ($this->thisConfig['fontFace'] ) {
			$HTMLAreaJSFontface = '{
';
			$HTMLAreaFontface = t3lib_div::trimExplode(',' , $this->cleanList($this->thisConfig['fontFace']));
			reset($HTMLAreaFontface);
			$HTMLAreaFontfaceIndex = 0;
			while( list(,$fontName) = each($HTMLAreaFontface)) {
				if($HTMLAreaFontfaceIndex) { 
					$HTMLAreaJSFontface .= ',
';
				}
				$HTMLAreaJSFontface .= $HTMLAreaFontname[$fontName];
				$HTMLAreaFontfaceIndex++;
			}
			$HTMLAreaJSFontface .= '};
';
			$registerRTEinJSString .= 'RTEarea['.$number.']["fontname"] = '. $HTMLAreaJSFontface;
		} else {  // else we use the typo3 defaults
			$HTMLAreaJSFontface = '{
			"Arial" : "Arial,sans-serif",
			"Arial Black" : "Arial Black,sans-serif",
			"Verdana" : "Verdana,Arial,sans-serif",
			"Times New Roman" : "Times New Roman,Times,serif",
			"Garamond" : "Garamond",
			"Lucida Handwriting" : "Lucida Handwriting",
			"Courrier" : "Courrier",
			"Webdings" : "Webdings",
			"Wingdings" : "Wingdings" };
';

			$registerRTEinJSString .= 'RTEarea['.$number.']["fontname"] = '. $HTMLAreaJSFontface;
		}

		$registerRTEinJSString .= 'RTEarea['.$number.']["toolbar"] = '.$this->getJSToolbarArray().';
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
		$pluginEnableList = isset($this->thisConfig['HTMLAreaPluginList']) ? $this->thisConfig['HTMLAreaPluginList'] : $this->pluginList;
		$pluginEnableArray = t3lib_div::trimExplode(',', $pluginEnableList , 1);
		switch ($plugin) {
			case 'TableOperations':
				return (in_array($plugin, $pluginEnableArray) && in_array("table", $this->toolBar)) ? true : false;
				break;
			case 'SpellChecker':
				return (in_array($plugin, $pluginEnableArray) && !in_array($this->language, t3lib_div::trimExplode(' ', $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['rte_pb_htmlarea']['noSpellCheckLanguages']))) ? true : false;
				break;
			case 'ContextMenu':
			case 'DynamicCSS':
				return in_array($plugin, $pluginEnableArray);
				break;
			default:
			return false;
			break;
		}	
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

}

if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/sr_htmlarea/pi2/class.tx_srhtmlarea_pi2.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/sr_htmlarea/pi2/class.tx_srhtmlarea_pi2.php']);
}
?>