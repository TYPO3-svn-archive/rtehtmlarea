const author = "Stanislas Rolland";
const displayName = "TYPO3 htmlaArea RTE Preferences";
const name = "user";
const version = "1.0";
const fileName = name + ".js";

var error = initInstall(displayName, name, version);
logComment("initInstall of " + displayName + " returned: " + error);

var folder = getFolder("Current User");
logComment("getFolder of " + displayName + " returned: " + folder);
setPackageFolder(folder);

if(folder != null) {
	error = addFile(name, version, fileName, folder, null);
	logComment("addFile of " + displayName + " returned: " + error);

	if (error == SUCCESS) {
		error = performInstall();
		logComment("Install of " + displayName + " returned: " + error);
	} else {
		cancelInstall(error);
		logComment("Install of " + displayName + " failed due to error: " + error);
	}
} else {
	logComment("Install of " + displayName + " failed due to missing directory");
}