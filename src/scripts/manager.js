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
	_BOX.appendChild(moreInfo);
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
				A({ href: 'mailto:' + item.email }, item.email),
			]))
		})
	});
}

function updateMoreInfo(user, url) {
	moreInfo.innerHTML = '';
	moreInfo.append(
		Div({ className: 'profile' }, A({ href: url }, url)),
		Div({ className: 'about' }, P({}, user.about)),

	)
}


