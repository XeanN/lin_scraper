const exapleScript = {
	target: 'https://codemirror.net/', //url or regexp pattern
	script: 'alert(\'test\')',
	active: true,
	execTime: 'ONLOAD', // ONLOAD | ACTION | WAIT
	waitTime: 0, // only when executeTime = WAIT,
	name: 'test'
}

const iniState = [ exapleScript ];

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({state: iniState}, function() {
		console.log("initialate the state");
	});
});
/*
chrome.tabs.executeScript({
	file: './content.js'
});*/