<?php
/***************************************************************
*  Copyright notice
*
*  (c) 1999-2004 Kasper Skaarhoj (kasper@typo3.com)
*  (c) 2004-2005 Stanislas Rolland (stanislas.rolland@fructifor.com)
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
 * Functions for parsing HTML, specially for TYPO3 processing in relation to TCEmain and Rich Text Editor (RTE)
 *
 * $Id$
 * Revised for TYPO3 3.6 December/2003 by Kasper Skaarhoj
 * XHTML compatible.
 *
 * @author	Kasper Skaarhoj <kasper@typo3.com>
 * @internal
 */

require_once (PATH_t3lib.'class.t3lib_parsehtml_proc.php');


/**
 * Class for parsing HTML for the Rich Text Editor. (also called transformations)
 *
 * @author	Kasper Skaarhoj <kasper@typo3.com>
 * @package TYPO3
 * @subpackage t3lib
 * Modification by Stanislas Rolland 2004-12-10 to allow style attribute on span tags
 * Modification by Stanislas Rolland 2005-02-10 to include hr in headListTags
 */
class ux_t3lib_parsehtml_proc extends t3lib_parsehtml_proc {

	var $headListTags = 'PRE,UL,OL,H1,H2,H3,H4,H5,H6,HR';


	/**
	 * Creates an array of configuration for the HTMLcleaner function based on whether content go TO or FROM the Rich Text Editor ($direction)
	 * Unless "tagList" is given, the function will cache the configuration for next time processing goes on. (In this class that is the case only if we are processing a bulletlist)
	 *
	 * @param	string		The direction of the content being processed by the output configuration; "db" (content going into the database FROM the rte) or "rte" (content going into the form)
	 * @param	string		Comma list of tags to keep (overriding default which is to keep all + take notice of internal configuration)
	 * @return	array		Configuration array
	 * @see HTMLcleaner_db()
	 */
	function getKeepTags($direction='rte',$tagList='')	{
		if (!is_array($this->getKeepTags_cache[$direction]) || $tagList)	{

				// Setting up allowed tags:
			if (strcmp($tagList,''))	{	// If the $tagList input var is set, this will take precedence
				$keepTags = array_flip(t3lib_div::trimExplode(',',$tagList,1));
			} else {	// Default is to get allowed/denied tags from internal array of processing options:
					// Construct default list of tags to keep:
				$typoScript_list = 'b,i,u,a,img,br,div,center,pre,font,hr,sub,sup,p,strong,em,li,ul,ol,blockquote,strike,span';
				$keepTags = array_flip(t3lib_div::trimExplode(',',$typoScript_list.','.strtolower($this->procOptions['allowTags']),1));

					// For tags to deny, remove them from $keepTags array:
				$denyTags = t3lib_div::trimExplode(',',$this->procOptions['denyTags'],1);
				foreach($denyTags as $dKe)	{
					unset($keepTags[$dKe]);
				}
			}

				// Based on the direction of content, set further options:
			switch ($direction)	{

					// GOING from database to Rich Text Editor:
				case 'rte':
						// Transform bold/italics tags to strong/em
					if (isset($keepTags['b']))	{$keepTags['b']=array('remap'=>'STRONG');}
					if (isset($keepTags['i']))	{$keepTags['i']=array('remap'=>'EM');}

						// Transforming keepTags array so it can be understood by the HTMLcleaner function. This basically converts the format of the array from TypoScript (having .'s) to plain multi-dimensional array.
					list($keepTags) = $this->HTMLparserConfig($this->procOptions['HTMLparser_rte.'],$keepTags);
				break;

					// GOING from RTE to database:
				case 'db':
						// Transform strong/em back to bold/italics:
					if (isset($keepTags['strong']))	{ $keepTags['strong']=array('remap'=>'b'); }
					if (isset($keepTags['em']))		{ $keepTags['em']=array('remap'=>'i'); }

						// Setting up span tags if they are allowed:
					if (isset($keepTags['span']))		{
						$classes=array_merge(array(''),$this->allowedClasses);
 // Modification by Stanislas Rolland 2004-12-10 to allow style attribute on span tags
						$keepTags['span']=array(
							'allowedAttribs'=> 'class,style',
							'fixAttrib' => Array(
								'class' => Array (
									'list' => $classes,
									'removeIfFalse' => 1
								)
							),
							'rmTagIfNoAttrib' => 1
						);
						if (!$this->procOptions['allowedClasses'])	unset($keepTags['span']['fixAttrib']['class']['list']);
					}

						// Setting up font tags if they are allowed:
					if (isset($keepTags['font']))		{
						$colors=array_merge(array(''),t3lib_div::trimExplode(',',$this->procOptions['allowedFontColors'],1));
 // Modification by Stanislas Rolland 2005-02-08 to allow style attribute on font tags
						$keepTags['font']=array(
							'allowedAttribs'=>'face,color,size,style',
							'fixAttrib' => Array(
								'face' => Array (
									'removeIfFalse' => 1
								),
								'color' => Array (
									'removeIfFalse' => 1,
									'list'=>$colors
								),
								'size' => Array (
									'removeIfFalse' => 1,
								)
							),
							'rmTagIfNoAttrib' => 1
						);
						if (!$this->procOptions['allowedFontColors'])	unset($keepTags['font']['fixAttrib']['color']['list']);
					}

						// Setting further options, getting them from the processiong options:
					$TSc = $this->procOptions['HTMLparser_db.'];
					if (!$TSc['globalNesting'])	$TSc['globalNesting']='b,i,u,a,center,font,sub,sup,strong,em,strike,span';
					if (!$TSc['noAttrib'])	$TSc['noAttrib']='b,i,u,br,center,hr,sub,sup,strong,em,li,ul,ol,blockquote,strike';

						// Transforming the array from TypoScript to regular array:
					list($keepTags) = $this->HTMLparserConfig($TSc,$keepTags);
				break;
			}

				// Caching (internally, in object memory) the result unless tagList is set:
			if (!$tagList)	{
				$this->getKeepTags_cache[$direction] = $keepTags;
			} else {
				return $keepTags;
			}
		}

			// Return result:
		return $this->getKeepTags_cache[$direction];
	}

}

?>