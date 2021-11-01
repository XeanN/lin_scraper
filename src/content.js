// json map
let _f; let jsonMap;

const scanerComp = () => Div({ className: 'scanner-wrapper hidden' }, [
	H1({}, 'Scanning'),
	Div({ className: 'dot-pulse' })
]);


window.addEventListener ("load", async () => {
	const scanner = scanerComp();
	document.body.appendChild(scanner);
	_f = await fetch(chrome.extension.getURL('/queryMap.json'));
	// MAP OF QUERIES FOR SCRAPING 
	jsonMap = await _f.json();
}, false);


chrome.runtime.onMessage.addListener(function (request) {
	console.log(request);
	if (request.type === 're_scan') {
		console.log('rescan');
		scan();
	}
});
/**
 * Main Function
 */
async function scan() {
	const loc = document.location.href;
	console.log(loc);
	const scanner = document.querySelector('.scanner-wrapper');
	scanner.classList.remove('hidden');
	document.querySelector(jsonMap.contact_info).click();
	await preloadPage(0);
	const sMoreBtn = document.querySelector(jsonMap.skills.see_more);
	sMoreBtn.click();
	const userObj = scrapeBasicData(jsonMap);
	document.querySelector(jsonMap.close_btn).click();
	userObj.location = loc;
	console.log(userObj);
	sMoreBtn.click();
	sendData(userObj);
	scanner.classList.add('hidden');
}


function scrapeBasicData(map) {
	const name = validateQuery(map.name);
	let about = validateQuery(map.about);
	about = softTrim(about);
	let experience = validateQuery(map.experience.parent, true)
	experience = parseExp(experience, map);
	const avatar = validateQuery(map.avatar, false, false, 'src');
	const email = trim(validateQuery(map.email));
	let education = validateQuery(map.education.parent, true);
	education = parseEdu(education, map);
	let skills = validateQuery(map.skills.parent, true);
	skills = parseSkills(skills, map)
	const pdf_btn = document.querySelector(map.pdf_btn);
	return { email, name, about, avatar, experience, skills, education, pdf_btn }
}

function validateQuery(query, isAll, from, att) {
	let resp = '';
	let attr = att ? att : 'textContent';
	if (isAll) {
		const r = document.querySelectorAll(query)
		resp = Array.from(r);
	} else if(from) {
		const r = from.querySelector(query);
		resp = r === null ? '' : r[attr];
	} else {
		const r = document.querySelector(query);
		resp = r === null ? '' : r[attr];
	}
	return resp;
}
/**
 * Send data to the other parts of extesion
 * @param {*} data 
 */
function sendData(data) {
	chrome.runtime.sendMessage({data, type: 'user_data'});
}

/**
 * Preload the page by scrolling to the end and back
 * @param {Number} n 
 * @returns 
 */
async function preloadPage(n) {
	if (n >= document.body.scrollHeight) {
		window.scrollTo(0,0);
		return;
	}
	window.scrollTo(0,n);
	await delay(0.5);
	return preloadPage(n + 500)
}

function delay(sec = 1) {
	return new Promise((resolve) => {
		setTimeout(() => { resolve() }, sec * 1000)
	})
}

function parseExp(expArr, map) {
	return expArr.map((exp) => {
		return {
			logo: validateQuery(map.experience.logo, false, exp, 'src'),
			c_name: trim(validateQuery(map.experience.c_name, false, exp)),
			position: validateQuery(map.experience.position, false, exp),
			period: validateQuery(map.experience.period, false, exp),
			location: validateQuery(map.experience.location, false, exp)
		}
	})
}

function parseEdu(eduArr, map) {
	return eduArr.map((edu) => {
		return {
			logo: validateQuery(map.education.logo, false, edu, 'src'),
			u_name: validateQuery(map.education.u_name, false, edu)
		}
	})
}

function parseSkills(skillArr, map) {
	return skillArr.map((_s) => {
		const valNum = validateQuery(map.skills.s_validations, false, _s);
		return {
			s_name: trim(validateQuery(map.skills.s_name, false, _s)),
			s_validations: valNum ? valNum : 0
		}
	})
}

function trim(str) {
	return str.replace(/(    )|(  )|(see more)|\n|(…)/g, '');
}

function softTrim(str) {
	return str.replace(/(    )|(  )|(see more)|(…)/g, '');
}

