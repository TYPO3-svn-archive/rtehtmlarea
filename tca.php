<?php
if (!defined ('TYPO3_MODE')) 	die ('Access denied.');

$TCA['tx_rtehtmlarea_acronym'] = Array (
	'ctrl' => $TCA['tx_rtehtmlarea_acronym']['ctrl'],
	'interface' => Array (
		'showRecordFieldList' => 'hidden,sys_language_uid,term,acronym'
	),
	'columns' => Array (
		'hidden' => Array (
			'exclude' => 0,
			'label' => 'LLL:EXT:lang/locallang_general.php:LGL.hidden',
			'config' => Array (
				'type' => 'check',
				'default' => '0'
			)
		),
		'starttime' => Array (
			'exclude' => 0,
			"label" => "LLL:EXT:lang/locallang_general.php:LGL.starttime",
			"config" => Array (
				"type" => "input",
				"size" => "8",
				"max" => "20",
				"eval" => "date",
				"default" => "0",
				"checkbox" => "0"
			)
		),
		'endtime' => Array (
			'exclude' => 0,
			"label" => "LLL:EXT:lang/locallang_general.php:LGL.endtime",
			"config" => Array (
				"type" => "input",
				"size" => "8",
				"max" => "20",
				"eval" => "date",
				"checkbox" => "0",
				"default" => "0",
				"range" => Array (
					"upper" => mktime(0,0,0,12,31,2020),
					"lower" => mktime(0,0,0,date("m")-1,date("d"),date("Y"))
				)

			)
		),
		'sys_language_uid' => Array (
			'exclude' => 0,
			'label' => 'LLL:EXT:lang/locallang_general.php:LGL.language',
			'config' => Array (
				'type' => 'select',
				'foreign_table' => 'sys_language',
				'foreign_table_where' => 'ORDER BY sys_language.title',
				'items' => Array (
					Array('LLL:EXT:lang/locallang_general.php:LGL.allLanguages', '-1'),
					Array('LLL:EXT:lang/locallang_general.php:LGL.default_value', '0'),
				),
			)
		),
		'type' => Array (		
			'exclude' => 0,		
			'label' => 'LLL:EXT:rtehtmlarea/locallang_db.php:tx_rtehtmlarea_acronym.type',		
			'config' => Array (
				'type' => 'radio',	
				'items' => Array (
					Array('LLL:EXT:rtehtmlarea/locallang_db.php:tx_rtehtmlarea_acronym.type.I.0', '1'),
					Array('LLL:EXT:rtehtmlarea/locallang_db.php:tx_rtehtmlarea_acronym.type.I.1', '2'),
				),
			)
		),
		'term' => Array (		
			'exclude' => 0,		
			'label' => 'LLL:EXT:rtehtmlarea/locallang_db.php:tx_rtehtmlarea_acronym.term',		
			'config' => Array (
				'type' => 'input',
				'size' => '30',
				'eval' => 'trim,required',
			)
		),
		'acronym' => Array (		
			'exclude' => 0,		
			'label' => 'LLL:EXT:rtehtmlarea/locallang_db.php:tx_rtehtmlarea_acronym.acronym',		
			'config' => Array (
				'type' => 'input',
				'size' => '30',
				'eval' => 'trim,required',
			)
		),
	),
	'types' => Array (
		'0' => Array( 'showitem' => 'hidden;;1;;1-1-1, sys_language_uid, type, term, acronym')
	),
	"palettes" => Array (
		"1" => Array("showitem" => "starttime, endtime")
	)
);
?>