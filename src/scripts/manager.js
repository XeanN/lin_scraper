HTMLElement.prototype.ToggleSwitch = function(isActive) {
	const newSwitch = ToggleSwitch(isActive);
	this.appendChild(newSwitch);
	return newSwitch;
}

const _PARAM_RAW = document.location.href.match(new RegExp('(\\?i=[0-9]*)','g'));
const editor = Form({});
//target input
const _target = editor.Input({type: 'text', value: '', placeholder: 'Target RegExp'});
// active input
const _active = editor.ToggleSwitch(true);
console.log(_active)
// execution time input
const _excTime = editor.Select({}, [
	Option({value: 'ONLOAD'}, 'ONLOAD'),
	Option({value: 'WAIT'}, 'WAIT'),
	Option({value: 'ACTION'}, 'ACTION')
])
// Wait time input
const _waitTime = editor.Input({type: 'text', placeholder:'Wait time (ms)'})
// name input
const _name = editor.Input({type: 'text', value: '', placeholder: 'Name'});
// code input
const _code = editor.TextArea({className: 'code-area', value: ''});


document.addEventListener('DOMContentLoaded', () => {
	render();
	chrome.runtime.onMessage.addListener((message) => {
		console.log(message)
		if(message.index !== undefined) {
			// edit
			console.log('edit: ',message.index)
			setValues(message.index);
		} else {
			// new
		}
	});
	if(_PARAM_RAW !== null) {
		//edit
		const i = parseInt(_PARAM_RAW[0].split('=')[1]);
		console.log('edit: ' ,i);
		setValues(i);
	} else {
		//new
	}
});
/**
 * Set inputs values as data
 * @param {Number} i Array index
 */
function setValues(i) {
	chrome.storage.sync.get(['state'], (data) => {
		console.log(data.state);
		const item = data.state[i];
		_target.value = item.target;
		_name.value = item.name;
		_waitTime.value = item.waitTime;
		_excTime.value = item.execTime;
		_code.value = item.script;
		_active.setValue(item.active)
	})
}

function render() {
	const _BOX = document.querySelector('#main-content');
	_BOX.appendChild(editor)
	listItems(_BOX);
	var myCodeMirror = CodeMirror.fromTextArea(_code, {
		lineNumbers: true,
		mode: "javascript"
	});
	myCodeMirror.value = 'D'
}

function listItems(box) {
	chrome.storage.sync.get(['state'], (data) => { 
		const {state} = data;
		const subB = Div({className: 'all-items'});
		box.appendChild(subB)
		state.forEach((st, i) => {
			subB.appendChild(getJobItem(st, i));
		});
	});
}

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
				onclick: () => { setValues(i) }
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

/**
 * helper toggle switch
 * @param {*} isActive 
 */
function ToggleSwitch(isActive) {
	const att = isActive ? { checked:'', } : {};
	return Label({className: 'switch'}, [
		Input({type:'checkbox', attributes: att}),
		Span({className: 'slider round'})
	])
}
/**
 * 
 */
HTMLLabelElement.prototype.getValue = function () {
	return this.querySelector('input').checked;
}

HTMLLabelElement.prototype.setValue = function(isActive) {
	if(isActive) {
		this.querySelector('input').setAttribute('checked', '');
	} else {
		this.querySelector('input').removeAttribute('checked');
	}
}


