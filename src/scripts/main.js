document.addEventListener('DOMContentLoaded', () => {
	render();
});

let scriptBox;

function render() {
	chrome.storage.sync.get(['state'], (storage) => {
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
	const email = A({ href: 'mailto:' + data.email }, data.email);
	const note = TextArea({ placeholder: 'Notes' });
	const btn = Button({}, 'Save User');
	scriptBox.innerHTML = '';
	scriptBox.append(img, name, email, note, btn);
}

function getEmptyState() {
	return Div({className: 'empty-state'},[
		H3({}, 'No Scan is available for this site.'),
		Img({src: 'img/empty-state.png'})
	])
}

/*
function getJobItem(st, i) {
	const item =  Div({ className:'sc-item' }, [
		getJobSubItem('Target match:', st.target, 'target'),
		getJobSubItem('Script name:', st.name, 'title-job'),
		getJobSubItem('Exec Time:', st.execTime, 'exc-t'),
		Div({className: 'is-active'}, [
			Label({}, 'Actve:'), ToggleSwitch(st.active)
		]),
		Div({className: 'sc-actions'}, [
			Button({
				onclick: () => { openManager(i) }
			}, 'Edit'),
			Button({}, 'Delete')
		])
	]);
	return item
}

function getJobSubItem(title, value, id) {
	return Div({}, [
		Label({}, title),
		Input({id, value, className: 'inp-no-outline', attributes: {disabled:''}})
	])
}

function ToggleSwitch(isActive) {
	const att = isActive ? { checked:'', disabled: '' } : {disabled: ''};
	return Label({className: 'switch'}, [
		Input({type:'checkbox', attributes: att}),
		Span({className: 'slider round'})
	])
}

function Input(props = {}, content = '') {
	props.content = content;
	return HTMLElementCreator('input', props)
}
*/
function openManager(index) {
	const param = (index !== undefined) ? '?i=' + index : '';
	chrome.tabs.getAllInWindow(null, (tabs) => {
		let isFound = false;
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab?.title === 'Scripter||manager') {
				isFound = true;
				chrome.tabs.update(tab.id, { active: true })
				chrome.tabs.sendMessage(tab.id, { index })
			}
		}
		if(!isFound) {
			chrome.tabs.create({url: chrome.extension.getURL('/src/manager.html' + param)});
		}
	});
}