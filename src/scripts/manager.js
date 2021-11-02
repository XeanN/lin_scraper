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
	chrome.storage.local.set({ 'state': obj }, function() {
		console.log('Value is set');
		document.location.reload();
	});
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
	chrome.storage.local.get(['state'], (data) => {
		const { state } = data;
		const blob = new Blob([JSON.stringify(state)], {type: "application/json"});
		const url = URL.createObjectURL(blob);
		chrome.downloads.download({
			url: url
		});
	})
}

function listItems(box) {
	chrome.storage.local.get(['state'], (data) => { 
		const {state} = data;
		const subB = Ul({className: 'all-items'});
		box.appendChild(subB)
		console.log(state);
		Object.keys(state).forEach(url => {
			const item = state[url];
			console.log(item.pdf_btn);
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
	});
}

const cancelBtn = Button({ className: 'cancel', onclick: () => { 
	notification.classList.add('hidden')
	notification.setAttributes({ 'u-id': '' })
} }, 'Cancel')
const submitBtn = Button({ className: 'submit', onclick:() => {
	const id = notification.getAttribute('u-id');
	deleteUser(id);
	document.location.reload();
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
	chrome.storage.local.get(['state'], (data) => {
		let { state } = data
		state[id] = undefined;
		chrome.storage.local.set({ 'state': state }, function() {
			console.log('Value is set');
		});
	})
}