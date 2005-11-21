<?php
/***************************************************************
*  Copyright notice
*
*  (c) 1999-2004 Kasper Skaarhoj (kasper@typo3.com)
*  (c) 2004-2005 Stanislas Rolland (stanislas.rolland@fructifor.ca)
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
 * Modification by Stanislas Rolland 2005-03-27 to avoid insertion of superfluous linebreaks by transform_db
 * Modification by Stanislas Rolland 2005-04-06 to eliminate true linebreaks inside hx tags
 * Modification by Johannes Bornhold 2005-05-09 to convert linebreaks to spaces instead of deleting them
 * Modification by Stanislas Rolland 2005-07-28 to include address and dl in headListTags
 * Modification by Dimitrij Denissenko 2005-11-15 to wrap a-tags that contain a style attribute with a span-tag
 */
class ux_t3lib_parsehtml_proc extends t3lib_parsehtml_proc {
	
 // <Stanislas Rolland 2005-02-10 and 2005-07-28 to include hr, address and dl in headListTags>
	var $headListTags = 'PRE,UL,OL,H1,H2,H3,H4,H5,H6,HR,ADDRESS,DL';
 // </Stanislas Rolland 2005-02-10 and 2005-07-28 to include hr, address and dl in headListTags>

	/**
	 * Transformation handler: 'ts_links' / direction: "db"
	 * Converting <A>-tags to <LINK tags>
	 *
	 * @param	string		Content input
	 * @return	string		Content output
	 * @see TS_links_rte()
	 */
	 /*
	function TS_links_db($value)	{

			// Split content into <a> tag blocks and process:
		$blockSplit = $this->splitIntoBlock('A',$value);
		foreach($blockSplit as $k => $v)	{
			if ($k%2)	{	// If an A-tag was found:
				$attribArray = $this->get_tag_attributes_classic($this->getFirstTag($v),1);
				$info = $this->urlInfoForLinkTags($attribArray['href']);

					// Check options:
				$attribArray_copy = $attribArray;
				unset($attribArray_copy['href']);
				unset($attribArray_copy['target']);
				unset($attribArray_copy['class']);
//
				unset($attribArray_copy['title']);
//
				if ($attribArray_copy['rteerror'])	{	// Unset "rteerror" and "style" attributes if "rteerror" is set!
					unset($attribArray_copy['style']);
					unset($attribArray_copy['rteerror']);
				}
				if (!count($attribArray_copy))	{	// Only if href, target and class are the only attributes, we can alter the link!
						// Creating the TYPO3 pseudo-tag "<LINK>" for the link (includes href/url, target and class attributes):
//					$bTag='<LINK '.$info['url'].($attribArray['target']?' '.$attribArray['target']:($attribArray['class']?' -':'')).($attribArray['class']?' '.$attribArray['class']:'').'>';
					$bTag='<LINK '.$info['url'].($attribArray['target']?' '.$attribArray['target']:(($attribArray['class'] || $attribArray['title'])?' -':'')).($attribArray['class']?' '.$attribArray['class']:($attribArray['title']?' -':'')).($attribArray['title']?' "'.$attribArray['title'].'"':'').'>';
					$eTag='</LINK>';
					$blockSplit[$k] = $bTag.$this->TS_links_db($this->removeFirstAndLastTag($blockSplit[$k])).$eTag;
				} else {	// ... otherwise store the link as a-tag.
						// Unsetting 'rtekeep' attribute if that had been set.
					unset($attribArray['rtekeep']);
						// If the url is local, remove url-prefix
					$siteURL = $this->siteUrl();
					if ($siteURL && substr($attribArray['href'],0,strlen($siteURL))==$siteURL)	{
						$attribArray['href']=$this->relBackPath.substr($attribArray['href'],strlen($siteURL));
					}
					$bTag='<a '.t3lib_div::implodeAttributes($attribArray,1).'>';
					$eTag='</a>';
					$blockSplit[$k] = $bTag.$this->TS_links_db($this->removeFirstAndLastTag($blockSplit[$k])).$eTag;
				}
			}
		}
		return implode('',$blockSplit);
	}
	*/
		/**
	 * Transformation handler: 'ts_links' / direction: "rte"
	 * Converting <LINK tags> to <A>-tags
	 *
	 * @param	string		Content input
	 * @return	string		Content output
	 * @see TS_links_rte()
	 */
	 /*
	function TS_links_rte($value)	{
		$value = $this->TS_AtagToAbs($value);

			// Split content by the TYPO3 pseudo tag "<LINK>":
		$blockSplit = $this->splitIntoBlock('link',$value,1);
		foreach($blockSplit as $k => $v)	{
			$error = '';
			if ($k%2)	{	// block:
//				$tagCode = t3lib_div::trimExplode(' ',trim(substr($this->getFirstTag($v),0,-1)),1);
				$tagCode = t3lib_div::unQuoteFilenames(trim(substr($this->getFirstTag($v),0,-1)),true);
				$link_param = $tagCode[1];
				$href = '';
				$siteUrl = $this->siteUrl();
					// Parsing the typolink data. This parsing is roughly done like in tslib_content->typolink()
				if(strstr($link_param,'@'))	{		// mailadr
					$href = 'mailto:'.eregi_replace('^mailto:','',$link_param);
				} elseif (substr($link_param,0,1)=='#') {	// check if anchor
					$href = $siteUrl.$link_param;
				} else {
					$fileChar=intval(strpos($link_param, '/'));
					$urlChar=intval(strpos($link_param, '.'));

						// Detects if a file is found in site-root OR is a simulateStaticDocument.
					list($rootFileDat) = explode('?',$link_param);
					$rFD_fI = pathinfo($rootFileDat);
					if (trim($rootFileDat) && !strstr($link_param,'/') && (@is_file(PATH_site.$rootFileDat) || t3lib_div::inList('php,html,htm',strtolower($rFD_fI['extension']))))	{
						$href = $siteUrl.$link_param;
					} elseif($urlChar && (strstr($link_param,'//') || !$fileChar || $urlChar<$fileChar))	{	// url (external): If doubleSlash or if a '.' comes before a '/'.
						if (!ereg('^[a-z]*://',trim(strtolower($link_param))))	{$scheme='http://';} else {$scheme='';}
						$href = $scheme.$link_param;
					} elseif($fileChar)	{	// file (internal)
						$href = $siteUrl.$link_param;
					} else {	// integer or alias (alias is without slashes or periods or commas, that is 'nospace,alphanum_x,lower,unique' according to tables.php!!)
						$link_params_parts = explode('#',$link_param);
						$idPart = trim($link_params_parts[0]);		// Link-data del
						if (!strcmp($idPart,''))	{ $idPart=$this->recPid; }	// If no id or alias is given, set it to class record pid
						if ($link_params_parts[1] && !$sectionMark)	{
							$sectionMark = '#'.trim($link_params_parts[1]);
						}
							// Splitting the parameter by ',' and if the array counts more than 1 element it's a id/type/? pair
						$pairParts = t3lib_div::trimExplode(',',$idPart);
						if (count($pairParts)>1)	{
							$idPart = $pairParts[0];
							// Type ? future support for?
						}
							// Checking if the id-parameter is an alias.
						if (!t3lib_div::testInt($idPart))	{
							list($idPartR) = t3lib_BEfunc::getRecordsByField('pages','alias',$idPart);
							$idPart = intval($idPartR['uid']);
						}
						$page = t3lib_BEfunc::getRecord('pages', $idPart);
						if (is_array($page))	{	// Page must exist...
							$href = $siteUrl.'?id='.$link_param;
						} else {
							#$href = '';
							$href = $siteUrl.'?id='.$link_param;
							$error = 'No page found: '.$idPart;
						}
					}
				}

				// Setting the A-tag:
				$bTag = '<a href="'.htmlspecialchars($href).'"'.
							($tagCode[2]&&$tagCode[2]!='-' ? ' target="'.htmlspecialchars($tagCode[2]).'"' : '').
//							($tagCode[3] ? ' class="'.htmlspecialchars($tagCode[3]).'"' : '').
							($tagCode[3]&&$tagCode[3]!='-' ? ' class="'.htmlspecialchars($tagCode[3]).'"' : '').
							($tagCode[4] ? ' title="'.htmlspecialchars($tagCode[4]).'"' : '').
							($error ? ' rteerror="'.htmlspecialchars($error).'" style="background-color: yellow; border:2px red solid; color: black;"' : '').	// Should be OK to add the style; the transformation back to databsae will remove it...
							'>';
				$eTag = '</a>';
				$blockSplit[$k] = $bTag.$this->TS_links_rte($this->removeFirstAndLastTag($blockSplit[$k])).$eTag;
			}
		}

			// Return content:
		return implode('',$blockSplit);
	}
*/
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
 // <Stanislas Rolland 2004-12-10 to allow style attribute on span tags>
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
 // </Stanislas Rolland 2004-12-10 to allow style attribute on span tags>
						// Setting up font tags if they are allowed:
					if (isset($keepTags['font']))		{
						$colors=array_merge(array(''),t3lib_div::trimExplode(',',$this->procOptions['allowedFontColors'],1));
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

	/**
	 * Transformation handler: 'ts_transform' + 'css_transform' / direction: "db"
	 * Cleaning (->db) for standard content elements (ts)
	 *
	 * @param	string		Content input
	 * @param	boolean		If true, the transformation was "css_transform", otherwise "ts_transform"
	 * @return	string		Content output
	 * @see TS_transform_rte()
	 */
	function TS_transform_db($value,$css=FALSE)	{
			// safety... so forever loops are avoided (they should not occur, but an error would potentially do this...)
		$this->TS_transform_db_safecounter--;
		if ($this->TS_transform_db_safecounter<0)	return $value;
			// Split the content from RTE by the occurence of these blocks:
		$blockSplit = $this->splitIntoBlock('TABLE,BLOCKQUOTE,'.$this->headListTags,$value);
		$cc=0;
		$aC = count($blockSplit);
// <Stanislas Rolland 2005-04-02 to avoid superfluous linebreak after ending headListTag>
		while($aC && !strcmp(trim($blockSplit[$aC-1]),'')) {
			unset($blockSplit[$aC-1]);
			$aC = count($blockSplit);
		}
// </Stanislas Rolland 2005-04-02 to avoid superfluous linebreak>

			// Traverse the blocks
		foreach($blockSplit as $k => $v)	{
			$cc++;
			$lastBR = $cc==$aC ? '' : chr(10);
			if ($k%2)	{	// Inside block:
					// Init:
				$tag=$this->getFirstTag($v);
				$tagName=strtolower($this->getFirstTagName($v));

					// Process based on the tag:
				switch($tagName)	{
					case 'blockquote':	// Keep blockquotes, but clean the inside recursively in the same manner as the main code
						$blockSplit[$k]='<'.$tagName.'>'.$this->TS_transform_db($this->removeFirstAndLastTag($blockSplit[$k]),$css).'</'.$tagName.'>'.$lastBR;
					break;
					
					case 'ol':
					case 'ul':	// Transform lists into <typolist>-tags:
						if (!$css)	{
							if (!isset($this->procOptions['typolist']) || $this->procOptions['typolist'])	{
								$parts = $this->getAllParts($this->splitIntoBlock('LI',$this->removeFirstAndLastTag($blockSplit[$k])),1,0);
								while(list($k2)=each($parts))	{
									$parts[$k2]=ereg_replace(chr(10).'|'.chr(13),'',$parts[$k2]);	// remove all linesbreaks!
									$parts[$k2]=$this->defaultTStagMapping($parts[$k2],'db');
									$parts[$k2]=$this->cleanFontTags($parts[$k2],0,0,0);
									$parts[$k2] = $this->HTMLcleaner_db($parts[$k2],strtolower($this->procOptions['allowTagsInTypolists']?$this->procOptions['allowTagsInTypolists']:'br,font,b,i,u,a,img,span,strong,em'));
								}
								if ($tagName=='ol')	{ $params=' type="1"'; } else { $params=''; }
								$blockSplit[$k]='<typolist'.$params.'>'.chr(10).implode(chr(10),$parts).chr(10).'</typolist>'.$lastBR;
							}
						} else {
							//$blockSplit[$k].=$lastBR;
							$blockSplit[$k]=$this->transformStyledATags($blockSplit[$k]).$lastBR;
						}
					break;
					
					case 'table':	// Tables are NOT allowed in any form (unless preserveTables is set or CSS is the mode)
						if (!$this->procOptions['preserveTables'] && !$css)	{
							$blockSplit[$k]=$this->TS_transform_db($this->removeTables($blockSplit[$k]));
						} else {
// <Johannes Bornhold 2005-05-09 linebreaks are spaces>
							$blockSplit[$k]=str_replace(chr(10),chr(32),$this->transformStyledATags($blockSplit[$k])).$lastBR;
// </Johannes Bornhold 2005-05-09 linebreaks are spaces>
							//$blockSplit[$k]=str_replace(chr(10),'',$blockSplit[$k]).$lastBR;
						}
					break;
					
					case 'h1':
					case 'h2':
					case 'h3':
					case 'h4':
					case 'h5':
					case 'h6':
						if (!$css)	{
							$attribArray=$this->get_tag_attributes_classic($tag);
								// Processing inner content here:
							$innerContent = $this->HTMLcleaner_db($this->removeFirstAndLastTag($blockSplit[$k]));
							if (!isset($this->procOptions['typohead']) || $this->procOptions['typohead'])	{
								$type = intval(substr($tagName,1));
								$blockSplit[$k]='<typohead'.
												($type!=6?' type="'.$type.'"':'').
												($attribArray['align']?' align="'.$attribArray['align'].'"':'').
												($attribArray['class']?' class="'.$attribArray['class'].'"':'').
												'>'.
												$innerContent.
												'</typohead>'.
												$lastBR;
							} else {
								$blockSplit[$k]='<'.$tagName.
												($attribArray['align']?' align="'.htmlspecialchars($attribArray['align']).'"':'').
												($attribArray['class']?' class="'.htmlspecialchars($attribArray['class']).'"':'').
												'>'.
												$innerContent.
												'</'.$tagName.'>'.
												$lastBR;
							}
						} else {
// <Stanislas Rolland 2005-04-06 to eliminate true linebreaks inside hx tags>
// <Johannes Bornhold 2005-05-09 linebreaks are spaces>
							$blockSplit[$k]=str_replace(chr(10),chr(32),$this->transformStyledATags($blockSplit[$k])).$lastBR;
// </Johannes Bornhold 2005-05-09 linebreaks are spaces>
							//$blockSplit[$k].=$lastBR;
// </Stanislas Rolland 2005-04-06 to eliminate true linebreaks inside hx tags>
						}
					break;
					
					default:
						//$blockSplit[$k].=$lastBR;
						$blockSplit[$k]=$this->transformStyledATags($blockSplit[$k]).$lastBR;
					break;
					
				}
			} else {	// NON-block:
				if (strcmp(trim($blockSplit[$k]),''))	{
// <Johannes Bornhold 2005-05-09 linebreaks are spaces>
					$blockSplit[$k]=$this->divideIntoLines(str_replace(chr(10),chr(32), $blockSplit[$k])).$lastBR;
					//$blockSplit[$k]=$this->divideIntoLines($blockSplit[$k]).$lastBR;
// </Johannes Bornhold 2005-05-09 linebreaks are spaces>
// <Dimitrij Denissenko 2005-11-15 wrap a-tags that contain a style attribute with a span-tag>
					$blockSplit[$k]=$this->transformStyledATags($blockSplit[$k]);
// </Dimitrij Denissenko 2005-11-15>
				} else unset($blockSplit[$k]);
			}
		}
		$this->TS_transform_db_safecounter++;

		if($this->procOptions['windows_remap'])  {
			return $this->remap_chars(implode('',$blockSplit));
		} else {
			return implode('',$blockSplit);
		}
	}
	
// <Dimitrij Denissenko 2005-11-15 wraps a-tags that contain a style attribute with a span-tag>
	function transformStyledATags($value) {
		$blockSplit = $this->splitIntoBlock('A',$value);
		foreach($blockSplit as $k => $v)	{
			if ($k%2)	{	// If an A-tag was found:
				$attribArray = $this->get_tag_attributes_classic($this->getFirstTag($v),1);
				if ($attribArray['style'])	{	// If "style" attribute is set!
					$attribArray_copy['style'] = $attribArray['style'];
					unset($attribArray['style']);
					$bTag='<span '.t3lib_div::implodeAttributes($attribArray_copy,1).'><a '.t3lib_div::implodeAttributes($attribArray,1).'>';
					$eTag='</a></span>';
					$blockSplit[$k] = $bTag.$this->removeFirstAndLastTag($blockSplit[$k]).$eTag;
				}
			}
		}
		return implode('',$blockSplit);
	}
// </Dimitrij Denissenko 2005-11-15>

	/**
	 * Function for cleaning content going into the database.
	 * Content is cleaned eg. by removing unallowed HTML and ds-HSC content
	 * It is basically calling HTMLcleaner from the parent class with some preset configuration specifically set up for cleaning content going from the RTE into the db
	 *
	 * @param	string		Content to clean up
	 * @param	string		Comma list of tags to specifically allow. Default comes from getKeepTags and is ""
	 * @return	string		Clean content
	 * @see getKeepTags()
	 */
	 function HTMLcleaner_db($content,$tagList='')	{
	 	if (!$tagList)	{
			$keepTags = $this->getKeepTags('db');
		} else {
			$keepTags = $this->getKeepTags('db',$tagList);
		}
		$kUknown = $this->procOptions['dontRemoveUnknownTags_db'] ? 1 : 0;		// Default: remove unknown tags.
		$hSC = $this->procOptions['dontUndoHSC_db'] ? 0 : -1;				// Default: re-convert literals to characters (that is &lt; to <)
		
// <Stanislas Rolland 2005-11-18 Honor setting RTE.default.proc.HTMLparser_db.xhtml_cleaning=1>
			// Create additional configuration:
		$addConfig=array();
		if (is_array($this->procOptions['entryHTMLparser_db.']) && $this->procOptions['entryHTMLparser_db.']['xhtml_cleaning'])	{
			$addConfig['xhtml']=1;
		}

	 	return $this->HTMLcleaner($content,$keepTags,$kUknown,$hSC,$addConfig);
// </Stanislas Rolland 2005-11-18 Honor setting RTE.default.proc.HTMLparser_db.xhtml_cleaning=1>
	 }

	function remap_chars($html) {
		$replacements = array(
			chr(128) => '&#8364;',
			chr(129) => '',
			chr(130) => '&#8218',
			chr(131) => '&#402;',
			chr(132) => '&#8222;',
			chr(133) => '&#8230;',
			chr(134) => '&#8224;',
			chr(135) => '&#8225;',
			chr(136) => '&#710;',
			chr(137) => '&#8240;',
			chr(138) => '&#352;',
			chr(139) => '&#8249;',
			chr(140) => '&#338;',
			chr(141) => '',
			chr(142) => '&#381;',
			chr(143) => '',
			chr(144) => '',
			chr(145) => '&#8216;',
			chr(146) => '&#8217;',
			chr(147) => '&#8220;',
			chr(148) => '&#8221;',
			chr(149) => '&#8226;',
			chr(150) => '&#8211',
			chr(151) => '&#8212;',
			chr(152) => '&#732;',
			chr(153) => '&#8482;',
			chr(154) => '&#353;',
			chr(155) => '&#8250;',
			chr(156) => '&#339;',
			chr(157) => '',
			chr(158) => '&#382;',
			chr(159) => '&#376;'
		);
		return str_replace(array_keys($replacements),array_values($replacements),$html);
	}
}
?>