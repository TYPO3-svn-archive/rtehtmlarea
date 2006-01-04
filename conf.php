<?php

define('MY_PATH_thisScript', str_replace('//','/', str_replace('\\','/', (php_sapi_name()=='cgi'||php_sapi_name()=='xcgi'||php_sapi_name()=='isapi' ||php_sapi_name()=='cgi-fcgi')&&($_SERVER['ORIG_PATH_TRANSLATED']?$_SERVER['ORIG_PATH_TRANSLATED']:$_SERVER['PATH_TRANSLATED'])? ($_SERVER['ORIG_PATH_TRANSLATED']?$_SERVER['ORIG_PATH_TRANSLATED']:$_SERVER['PATH_TRANSLATED']):($_SERVER['ORIG_SCRIPT_FILENAME']?$_SERVER['ORIG_SCRIPT_FILENAME']:$_SERVER['SCRIPT_FILENAME']))));
if (strstr(MY_PATH_thisScript, 'typo3conf')) {
	define('TYPO3_MOD_PATH', '../typo3conf/ext/rtehtmlarea/');
} elseif ( strstr(MY_PATH_thisScript, 'sysext') ) {
	define('TYPO3_MOD_PATH', 'sysext/rtehtmlarea/');
} else {
	define('TYPO3_MOD_PATH', 'ext/rtehtmlarea/');
}

$BACK_PATH = '../../../typo3/';
$MCONF['name']='xMOD_rtehtmlarea';	// xMOD_[modulename][optional: '_something']

?>
