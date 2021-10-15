const loc = document.location.href;

console.log(loc);
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
	const scanner = document.querySelector('.scanner-wrapper');
	scanner.classList.remove('hidden');
	document.querySelector(jsonMap.contact_info).click();
	await preloadPage(0);
	const sMoreBtn = document.querySelector(jsonMap.skills.see_more);
	sMoreBtn.click();
	const userObj = scrapeBasicData(jsonMap);
	document.querySelector(jsonMap.close_btn).click();
	console.log(userObj);
	sMoreBtn.click();
	sendData(userObj);
	scanner.classList.add('hidden');
}


function scrapeBasicData(map) {
	const name = document.querySelector(map.name).textContent;
	let about = document.querySelector(map.about).textContent;
	about = trim(about);
	let experience = Array.from(document.querySelectorAll(map.experience.parent) || [])
	experience = parseExp(experience, map);
	const avatar = document.querySelector(map.avatar).src;
	const email = trim(document.querySelector(map.email).textContent);
	let education = Array.from(document.querySelectorAll(map.education.parent));
	education = parseEdu(education, map);
	let skills = Array.from(document.querySelectorAll(map.skills.parent));
	skills = parseSkills(skills, map)
	return { email, name, about, avatar, experience, skills, education }
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
			logo: exp.querySelector(map.experience.logo).src,
			c_name: trim(exp.querySelector(map.experience.c_name).textContent),
			position: exp.querySelector(map.experience.position).textContent,
			period: exp.querySelector(map.experience.period).textContent,
			location: exp.querySelector(map.experience.location).textContent
		}
	})
}

function parseEdu(eduArr, map) {
	return eduArr.map((edu) => {
		return {
			logo: edu.querySelector(map.education.logo).src,
			u_name: edu.querySelector(map.education.u_name).textContent
		}
	})
}

function parseSkills(skillArr, map) {
	return skillArr.map((_s) => {
		const valNum = _s.querySelector(map.skills.s_validations);
		return {
			s_name: trim(_s.querySelector(map.skills.s_name).textContent),
			s_validations: valNum !== null ? valNum.textContent : 0
		}
	})
}

function trim(str) {
	return str.replace(/(    )|(  )|(see more)|\n|(…)/g, '');
}

