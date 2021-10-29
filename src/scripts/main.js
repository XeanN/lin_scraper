document.addEventListener('DOMContentLoaded', () => {
	render();
});

let scriptBox;
const note = TextArea({ placeholder: 'Notes' });

function render() {
	chrome.storage.local.get(['state'], (storage) => {
		const { state } = storage;
		// get element
		const _d = document.querySelector('#main-content');
		// set title
		_d.H3({}, 'User Data:');
		scriptBox = _d.Div({className: 'scripts-box'});
		scriptBox.appendChild(getEmptyState())
		_d.Button({id: 're-scan', onclick: () => { reScan() }}, 'Scan');
	})
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'user_data') {
		console.log(request.data);
		getUser(request.data);
	}
});

function reScan() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, { type: 're_scan' }, function(response) {});
	});
}


function getUser(data) {
	const img = Img({ src: data.avatar });
	const name = P({}, data.name);
	const email = data.email ? A({ href: 'mailto:' + data.email }, data.email) : P({}, 'EMAIL-NOT-FOUND')
	const btn = Button({ onclick: () => { openManager(data) } }, 'Save User');
	scriptBox.innerHTML = '';
	scriptBox.append(img, name, email, note, btn);
}

function getEmptyState() {
	return Div({className: 'empty-state'},[
		H3({}, 'No Scan is available for this site.'),
		Img({src: 'img/empty-state.png'})
	])
}

function openManager(data) {
	chrome.storage.local.get(['state'], (resp) => {
		let { state } = resp;
		console.log(state);
		data.notes = note.value;
		state = {...state, [data.location]: data };
		console.log(state);
		chrome.storage.local.set({ 'state': state }, function() {
			console.log('Value is set');
		});
	});
	chrome.tabs.getAllInWindow(null, (tabs) => {
		let isFound = false;
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab?.title === 'Scripter||manager') {
				isFound = true;
				chrome.tabs.update(tab.id, { active: true })
				chrome.tabs.sendMessage(tab.id, { type: 'update' })
			}
		}
		if(!isFound) {
			chrome.tabs.create({url: chrome.extension.getURL('/src/manager.html')});
		}
	});
}

chrome.storage.local.get(['state'], (resp) => {
	let { state } = resp;
	console.log(state);
})