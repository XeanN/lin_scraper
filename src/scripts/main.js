let DB;
// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDHN_ypZVyGG7OXYuAo21j0tnQNBfGzZKk",
	authDomain: "ivory-link-263318.firebaseapp.com",
	projectId: "ivory-link-263318",
	storageBucket: "ivory-link-263318.appspot.com",
	messagingSenderId: "13119697030",
	appId: "1:13119697030:web:e25509baabb7b5404f6107"
};

const _nullProfileImg = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

function validateNullImg(src = '', defaultImg) {
	if (!src || (src.match(/(data:)/g) !== null)) {
		return defaultImg;
	} else {
		return src
	}
}

document.addEventListener('DOMContentLoaded', () => {
	render();
	firebase.initializeApp(firebaseConfig);
	DB = firebase.firestore();
	console.log(DB);
});

let scriptBox;
const note = TextArea({ placeholder: 'Notes' });
const scanBtn = Button({id: 're-scan', onclick: () => { reScan() }}, 'Scan');
function render() {
	chrome.storage.local.get(['state'], (storage) => {
		const { state } = storage;
		// get element
		const _d = document.querySelector('#main-content');
		// set title
		_d.Div({ className: 'header' }, [
			H3({}, 'User Data:'),
			Button({ onclick: () => { openManager() } }, 'Open Manager')
		])
		scriptBox = _d.Div({className: 'scripts-box'});
		scriptBox.appendChild(getEmptyState())
		_d.appendChild(scanBtn);
	})
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'user_data') {
		console.log(request.data);
		scanBtn.classList.add('hidden');
		getUser(request.data);
	}
});

function reScan() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, { type: 're_scan' }, function(response) {});
	});
}


function getUser(data) {
	const img = Img({ src: validateNullImg(data.avatar, _nullProfileImg) });
	const name = P({}, data.name);
	const email = data.email ? A({ href: 'mailto:' + data.email }, data.email) : P({}, 'EMAIL-NOT-FOUND')
	const btn = Button({ onclick: () => { openManager(data) } }, 'Save User');
	scriptBox.innerHTML = '';
	scriptBox.append(img, name, email, note, btn);
}

function getEmptyState() {
	return Div({className: 'empty-state'})
}

async function openManager(data) {
	if (data) {
		data.notes = note.value;
		const base64Location = btoa(data.location)
		const ref = DB.collection('/users/').doc(base64Location);
		await ref.set(data, { merge: true });
	}

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