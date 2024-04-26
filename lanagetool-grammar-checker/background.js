
try {
    importScripts("libs/lz-string.min.js");
} catch (e) {
    console.log(e);
}

function updateContext() {
  chrome.contextMenus.removeAll();
	chrome.contextMenus.create({
		"id": "ControlG", 
		"title": 'Check Grammar', 
		"contexts":["selection"]
	});
}
updateContext();

chrome.contextMenus.onClicked.addListener(function(info, tab) { openGrammarTab(info, tab); } );

chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);
	openGrammarTab()
  });

function openGrammarTab(info, tab) {
	// console.log(info)
	var selectionText = info.selectionText.trim();
	selectionText = LZString.compressToEncodedURIComponent(selectionText);
	// selectionText = encodeURIComponent(selectionText);
	selectionText = (selectionText && '?text=' + selectionText) || '';
	console.log(selectionText)
	var url = 'https://linangdata.com/grammar-checker/' + selectionText;
	// var url = 'http://localhost/development/linang/grammar-checker/' + selectionText;
	chrome.tabs.create({ url });
}