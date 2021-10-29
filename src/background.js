chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.set({state: {}}, function() {
		console.log("initialate the state");
	});
});
