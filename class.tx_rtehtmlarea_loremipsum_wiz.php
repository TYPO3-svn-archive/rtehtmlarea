<?php
/***************************************************************
*  Copyright notice
*
*  (c) 1999-2004 Kasper Skaarhoj (kasper@typo3.com)
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
 * Lorem Ipsum dummy text wizard
 *
 * @author	Kasper Skaarhoj <kasper@typo3.com>
 * @coauthor	Stanislas Rolland <stanislas.rolland@fructifor.com>
 */

if(t3lib_extMgm::isLoaded('lorem_ipsum')) {

require_once(t3lib_extMgm::extPath('lorem_ipsum').'class.tx_loremipsum_wiz.php');


/**
 * Lorem Ipsum dummy text wizard
 * Extended to enable insertion of dummy text in the htmlArea RTE (rtehtmlarea) in html mode
 *
 * @author	Kasper Skaarhoj <kasper@typo3.com>
 * @package TYPO3
 * @subpackage tx_loremipsum
 */
class tx_rtehtmlarea_loremipsum_wiz extends tx_loremipsum_wiz {

	var $extKey = 'lorem_ipsum';


	/**
	 * Main function for TCEforms wizard.

	 *
	 * @param	array		Parameter array for "userFunc" wizard type
	 * @param	object		Parent object
	 * @return	string		HTML for the wizard.
	 */
	function main($PA,$pObj)	{
		#debug($PA);

			// Load Lorem Ipsum sources from text file:
		$this->loadLoremIpsumArray();

		switch($PA['params']['type'])	{
			case 'title':
			case 'header':
			case 'description':
			case 'word':
			case 'paragraph':
			case 'loremipsum':
					// Add the element name as first parameter
				$onclick = $this->getHeaderTitleJS(
								"document.".$PA['formName']."['".$PA['itemName']."']",
								"document.".$PA['formName']."['".$PA['itemName']."'].value",
								$PA['params']['type'],
								$PA['params']['endSequence'],
								$PA['params']['add'],
								t3lib_div::intInRange($PA['params']['count'],2,100,10)
							) . ';' .
							implode('',$PA['fieldChangeFunc']).		// Necessary to tell TCEforms that the value is updated.
							'return false;';

				$output.= '<a href="#" onclick="'.htmlspecialchars($onclick).'">'.
							$this->getIcon($PA['params']['type']).
							'</a>';
			break;
			case 'images':

				$ordA = ord('a');
				$extPath = t3lib_extMgm::extPath($this->extKey);

				$tRows = array();
				for($a=0;$a<6;$a++)	{
					$tCells = array();
					for($b=0;$b<7;$b++)	{
						$absfile = $extPath.'images/'.chr($ordA+$a).($b+1).'.jpg';
						$onclick = "setFormValueFromBrowseWin('".$PA['itemName']."',unescape('".rawurlencode($absfile)."'),unescape('".rawurlencode(basename($absfile))."')); return false;";
						$tCells[].= '<a href="#" onclick="'.htmlspecialchars($onclick).'">'.
									t3lib_BEfunc::getThumbNail('thumbs.php', $absfile).
									'</a>';
					}

					$tdAttrib = ' style="width: 56px;" align="center" bgcolor="#cccccc"';
					$tRows[] = '
						<tr>
							<td'.$tdAttrib.'>
							'.implode('</td><td'.$tdAttrib.'>', $tCells).'
							</td>
						</tr>';
				}

				$output = '
					<table border="0" cellpadding="2" cellspacing="2" style="border: 1px solid black; margin-top: 5px; margin-bottom: 15px;">
						<tr><td colspan="7" bgcolor="#aaaaaa"><b>Click a dummy image to select it:</b></td></tr>
						'.implode('',$tRows).'
						<tr><td colspan="7"><em>All images are copyright &#169; Kasper Sk&#229;rh&#248;j 2001-2004 and licensed in these resolutions under Open Content License.</em></td></tr>
					</table>';

			break;
		}

		return $output;
	}

	/**
	 * Create rotating Lipsum text for JS variable
	 * Can be used by other non TCEform fields as well.
	 *
	 * @param	string		JavaScript variable name, eg. a form field value property reference.
	 * @param	string		Type = key from $this->lindex array
	 * @param	string		List of character numbers to end sequence with.
	 * @param	integer		Number of options to cycle through.
	 * @param	integer		Number of texts to cycle through
	 * @return	string		JavaScript applying a lipsum string to input javascript variable.
	 */
		// Add the element name as first parameter
	function getHeaderTitleJS($varElement, $varName, $type, $endSequence='', $add=FALSE, $count=10)	{

			// Load data:
		$this->loadLoremIpsumArray();

			// Type must exist:
		if (is_array($this->lindex[$type]))	{

				// Shuffle index:
			shuffle($this->lindex[$type]);

				// Init vars: Creates pointer. Currently random based on time value. Can it be cycling through 0-$count instead?
			if ($type == 'loremipsum')	{
				$code = "
				var lipsum_temp_pointer = 0;
				var lipsum_temp_strings = new Array();";
			} else {
				$code = "
				var lipsum_temp_date = new Date();
				var lipsum_temp_pointer = lipsum_temp_date.getTime()%".$count.";
				var lipsum_temp_strings = new Array();";
			}


				// End-sequence:
			$chars = t3lib_div::trimExplode(',',$endSequence,1);
			$addJS = '';
			foreach($chars as $charVal)	{
				if (intval($charVal)>0)	{
					$addJS.="+unescape('".rawurlencode(chr(intval($charVal)))."')";
				}
			}

				// Add Lipsum content to array:
			for ($a=0;$a<$count;$a++)	{
				$code.= "
				lipsum_temp_strings[".$a."]='".$this->lindex[$type][$a]."'".$addJS.";";
			}

				// Insert in htmlArea RTE 
			$code .= "
				if (typeof lorem_ipsum == 'function' && " . $varElement . ".tagName.toLowerCase() == 'textarea' ) lorem_ipsum(" . $varElement . ", lipsum_temp_strings[lipsum_temp_pointer]);
			";
				// Set variable value:
			$code.="
				".$varName.($add?'+':'')."=lipsum_temp_strings[lipsum_temp_pointer];
			";

				// Return:


			return $code;
		}
	}

} // end of class

if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/rtehtmlarea/class.tx_rtehtmlarea_loremipsum_wiz.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/rtehtmlarea/class.tx_rtehtmlarea_loremipsum_wiz.php']);
}

} // end of conditional class extension

?>
