let Data = null;
// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDHN_ypZVyGG7OXYuAo21j0tnQNBfGzZKk",
	authDomain: "ivory-link-263318.firebaseapp.com",
	projectId: "ivory-link-263318",
	storageBucket: "ivory-link-263318.appspot.com",
	messagingSenderId: "13119697030",
	appId: "1:13119697030:web:e25509baabb7b5404f6107"
};

firebase.initializeApp(firebaseConfig);
let DB = firebase.firestore();

const _PARAM_RAW = document.location.href.match(new RegExp('(\\?i=[0-9]*)','g'));
const _nullProfileImg = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const _nullImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png';

const moreInfo = Div({ className: 'more-wrapper' })
	.Div({ className: 'empty' })
	.H1({}, 'Select a User to see more')
	.baseNode();



document.addEventListener('DOMContentLoaded', () => {
	render();
});

chrome.runtime.onMessage.addListener((message) => {
	if(message.type !== 'update') {
			document.location.reload();
	}
});

function render() {
	const _BOX = document.querySelector('#main-content');
	_BOX.innerHTML = '';
	_BOX.append(moreInfo, notification, options);
	listItems(_BOX);
}

const importHelper = Input({ className: 'away', type: 'file', onchange: function (){
	const file = this.files[0];
	const validator = file.name.match(/(\.json)/g);
	if (validator === null) {
		alert('The file extension must be .json');
		return;
	}
	const reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(file);
}});

function onReaderLoad(event){
	var obj = JSON.parse(event.target.result);
	console.log('Importing file =>',obj);
	Object.keys(obj).forEach((key) => {
		const user = obj[key];
		writeImported(user, key);
	})
}

async function writeImported(user, id) {
	const base64Location = btoa(id)
	const ref = DB.collection('/users/').doc(base64Location);
	await ref.set(user, { merge: true });
	console.log('imported user:', user.name);
}

const currentUser = Div({ className: 'current-user' });

const options = Div({className: 'app-options'}, [
	Div({},[
		Button({ className: 'export', onclick: exportJson }, 'Export'),
		Button({ className: 'import', onclick: () => {
			importHelper.click();
		} }, 'import'),
	]),
	currentUser,
	importHelper
]);

function exportJson() {
	const blob = new Blob([JSON.stringify(Data)], {type: "application/json"});
	const url = URL.createObjectURL(blob);
	chrome.downloads.download({
		url: url
	});
}

const onMessage = async function _onMessage(next) {
	if (!DB) {
		await delay(.5);
		return onMessage(next);
	}
	return DB.collection('users').onSnapshot(next)
}

async function listItems(box) {
	await onMessage((snap) => {
		let state = {};
		snap.forEach((doc) => {
			const user = doc.data();
			state[user.location] = user;
		})
		Data = state;
		writeList(box, state);
	})
}

function writeList(box, state) {
	const subB = Ul({className: 'all-items'});
	box.appendChild(subB)
	Object.keys(state).forEach(url => {
		const item = state[url];
		subB.appendChild(Li({ onclick: () => { updateMoreInfo(item, url) } }, [
			Img({ src: validateNullImg(item.avatar, _nullProfileImg) }),
			H3({}, item.name),
			item.email ? A({ href: 'mailto:' + item.email }, item.email) : P({}, 'EMAIL-NOT-FOUND'),
			Div({ className: 'notes' }, P({}, item.notes)),
			Div({ className: 'delte-action', onclick: () => {
				notification.classList.remove('hidden');
				notification.setAttributes({ 'u-id': url });
			} },
				Img({ src: 'img/trash-solid.svg' })
			)
		]))
	})
}

const cancelBtn = Button({ className: 'cancel', onclick: () => { 
	notification.classList.add('hidden')
	notification.setAttributes({ 'u-id': '' })
} }, 'Cancel')
const submitBtn = Button({ className: 'submit', onclick:() => {
	const id = notification.getAttribute('u-id');
	deleteUser(id);
}}, 'Acept');

const notification =
	Div({ className: 'modal-wrapper hidden' },
		Div({ className: 'modal' },[ 
				Div({ className: 'modal-msg' }, 'Confirm Delete'),
				Div({ className: 'modal-actions' }, [
					cancelBtn,
					submitBtn
				])
		])
	)

function validateNullImg(src = '', defaultImg) {
	if (!src || (src.match(/(data:)/g) !== null)) {
		return defaultImg;
	} else {
		return src
	}
}

function updateMoreInfo(user, url) {
	moreInfo.innerHTML = '';
	currentUser.innerHTML = '';
	currentUser.append(
		Img({ src: validateNullImg(user.avatar, _nullProfileImg) }),
		H3({}, user.name),
		user.email ? A({ href: 'mailto:' + user.email }, user.email) : P({}, 'EMAIL-NOT-FOUND'),
		Div({ className: 'notes' }, P({}, user.notes)),
	);
	moreInfo.append(
		Div({ className: 'profile' }, A({ href: url }, url)),
		Div({ className: 'section' },
			Div({className: 'experience'},[
				H1({}, 'Experience'),
				...user.experience.map((ex) => {
					return Div({},[
						Img({ src: validateNullImg(ex.logo, _nullImg) }),
						H3({}, ex.c_name),
						Span({}, ex.location),
						H4({}, `Position: ${ex.position}`)
					])
				})
			])
		),
		Div({ className: 'section' },[
			Div({ className: 'education' },[
				H1({}, 'Education'),
				...user.education.map((ed) => {
					return Div({}, [
						Img({ src: validateNullImg(ed.logo, _nullImg) }),
						H3({}, ed.u_name)
					])
				})
			]),
			Div({ className: 'about' }, [H1({},'About'),P({}, user.about)])
		]),
		Div({ className: 'section' },[
			Div({ className: 'skills' },[
				H1({}, 'Skills'),
				...user.skills.map((sk) => {
					return Div({ className: 'badge' }, [
						H3({}, sk.s_name),
						Span({}, '.'),
						H3({}, sk.s_validations),
					])
				})
			])
		]),
	)
}


function deleteUser(id) {
	let base64Location = btoa(id).slice(0, -1);
	console.log(base64Location);
	DB.collection('user').doc(base64Location).delete()
	.then(() => {
		console.log('deleted');
	})
	.catch((err) => {
		console.warn(err)
	})
}

function delay(s=1) {
	return new Promise((resolve) => {
		setTimeout(() => { resolve() }, s * 1000)
	})
}