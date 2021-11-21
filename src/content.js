// json map

//debugger;

console.log('content script running');

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
	if (sMoreBtn !== null) sMoreBtn.click();
	const userObj = scrapeBasicData(jsonMap);
	document.querySelector(jsonMap.close_btn).click();
	userObj.location = loc;
	console.log(userObj);
	if (sMoreBtn !== null) sMoreBtn.click();
	sendData(userObj);
	scanner.classList.add('hidden');
}


function scrapeBasicData(map) {
	const pdf_btn = document.querySelector(map.pdf_btn);
	return {
		email:trim(validateQuery(map.email)),
		name:validateQuery(map.name),
		phone:trim(validateQuery(map.phone)),
		phonetype:trim(validateQuery(map.phonetype)),
		about:softTrim( validateQuery(map.about)),
		avatar:validateQuery(map.avatar,false,false,'src'),
		experience:parseExperience(validateQuery(map.experience.parent,true),map),
		skills:parseSkills(validateQuery(map.skills.parent,true),map),
		education:parseEducation(validateQuery(map.education.parent,true),map),
		certifications:parseCertifications(validateQuery(map.certifications.parent,true),map),
		awards:parseAwards(validateQuery(map.awards.parent,true),map),
		featured:parseFeatured(validateQuery(map.featured.parent,true),map),
		languages:parseLanguages(validateQuery(map.languages.parent,true),map),
		pdf_btn
	}
}


function validateQuery(query, isAll, from, att) {
	let resp = '';
	let attr = att ? att : 'textContent';
	if (isAll) {
		const r = document.querySelectorAll(query)
		resp = Array.from(r);
	} else if(from) {
		/*
		if ( query == ".pv-certification-entity > div > a > .pv-certifications__summary-info > p.nth-of-type(1) > span:nth-of-type(2)" ) {
			console.log(`why is ${query} bad?`);
		}
		*/
		const r = from.querySelector(query);
		resp = r === null ? '' : r[attr];
	} else {
		const r = document.querySelector(query);
		resp = r === null ? '' : r[attr];
	}
	return resp;
}


function sendData(data) {
	chrome.runtime.sendMessage({data, type: 'user_data'});
}


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


function parseExperience(expArr, map) {
	return expArr.map((exp) => {
		return {
			logo: validateQuery(map.experience.logo, false, exp, 'src'),
			c_name: trim(validateQuery(map.experience.c_name, false, exp)),
			position: validateQuery(map.experience.position, false, exp),
			period: validateQuery(map.experience.period, false, exp),
			location: validateQuery(map.experience.location, false, exp),
			description: trim(validateQuery(map.experience.description, false, exp))
		}
	})
}


function parseEducation(eduArr, map) {
	return eduArr.map((edu) => {
		return {
			logo: validateQuery(map.education.logo, false, edu, 'src'),
			u_name: validateQuery(map.education.u_name, false, edu)
		}
	})
}


function parseVolunteer(volArr, map) {
	return volArr.map((vol) => {
		return {
			logo: validateQuery(map.voluteer.logo, false, vol, 'src' ),
			href: validateQuery(map.voluteer.href, false, vol),
			company: validateQuery(map.voluteer.company, false, vol),
			role: validateQuery(map.voluteer.role, false, vol)
		}
	})
}


function parseAwards(awardArr, map) {
	return awardArr.map((award) => {
		return {
			award: validateQuery(map.awards.award, false, award )
		}
	})
}


function parseCertifications(certArr, map) {
	return certArr.map((cert) => {
		return {
			img: validateQuery(map.certifications.title, false, cert, 'src' ),
			href: validateQuery(map.certifications.href, false, cert, 'href' ),
			title: trim(validateQuery(map.certifications.title, false, cert )),
			issuer: trim(validateQuery(map.certifications.issuer, false, cert )),
			issued: trim(validateQuery(map.certifications.issued, false, cert ))
		}
	})
}


function parseFeatured(featArr, map) {
	return featArr.map((feat) => {
		return {
			text: trim(validateQuery(map.featured.text, false, feat )),
			href: validateQuery(map.featured.href, false, feat),
			company: validateQuery(map.featured.company, false, feat),
			role: validateQuery(map.featured.role, false, feat)
		}
	})
}


function parseLanguages(langArr, map) {
	return langArr.map((lang) => {
		return {
			language:    trim(validateQuery(map.languages.language, false, lang )),
			proficiency: trim(validateQuery(map.languages.proficiency, false, lang))
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

