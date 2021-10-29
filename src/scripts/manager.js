const _PARAM_RAW = document.location.href.match(new RegExp('(\\?i=[0-9]*)','g'));
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
	_BOX.append(moreInfo, notification);
	listItems(_BOX);
}


function listItems(box) {
	chrome.storage.local.get(['state'], (data) => { 
		const {state} = data;
		const subB = Ul({className: 'all-items'});
		box.appendChild(subB)
		console.log(state);
		Object.keys(state).forEach(url => {
			const item = state[url];
			subB.appendChild(Li({ onclick: () => { updateMoreInfo(item, url) } }, [
				Img({ src: item.avatar }),
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

function updateMoreInfo(user, url) {
	moreInfo.innerHTML = '';
	moreInfo.append(
		Div({ className: 'profile' }, A({ href: url }, url)),
		Div({ className: 'about' }, P({}, user.about)),

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