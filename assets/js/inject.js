	var isEnabledInternalAppointments = 1;
	//-------------------------------------------------------------
var isInited2 = false; var isOesEnabled = false;
window.addEventListener('message', function (event) {
	if (typeof event.data !== 'object') return;
	if (!('msg' in event.data)) return;
	if (!('type' in event.data.msg)) return;
	if (event.data.msg.type != 'yes-exam-going') return;
	console.log('yes-exam-going');
	initOes();
});
console.log("OES: ", window.location.hash);
if (window.location.hash == '#isExam'){
	initOes();
}

function initOes(){
	//-----------------------------------------------------
	if (isInited2) return;
	isInited2 = true;
	isOesEnabled = true;
	//--------------------------------------------------
	function stopExam(){
		window.postMessage("start-exit-moodle");
	}
	//--------------------------------------------------
	// Отключаем правую кнопку
	document.addEventListener("contextmenu", function(evt){
	  evt.preventDefault();
	}, false);
	// Отключаем копирование
	document.addEventListener("copy", function(evt){
	  	evt.clipboardData.setData("text/plain", "Копирование на этой странице запрещено");
	  	evt.preventDefault();
	}, false);
	// Отключаем вырезку
	document.addEventListener("cut", function(evt){
	  	evt.preventDefault();
	}, false);
	// Отключаем выделение
	var sheet = document.createElement('style')
	sheet.innerHTML = "* {user-select: none !important;}*::selection {background: none;}*::-moz-selection {background: none;}";
	document.body.appendChild(sheet);
	// При попытке вставить делаем запись
	document.addEventListener('paste', (e) => {
	    var clipboardData, pastedData;
	    e.stopPropagation();
	    e.preventDefault();
	    clipboardData = e.clipboardData || window.clipboardData;
	    pastedData = clipboardData.getData('Text');
	    event = {'type': 'on-paste', 'content': pastedData};
	    window.parent.postMessage(JSON.stringify(event), '*');
	    console.log('send event', JSON.stringify(event));
	});
	//--------------------------------------------------
	if (window.location.pathname.endsWith("/mod/quiz/review.php") || window.location.pathname.endsWith("/moodle/course/view.php")){
		console.log('send start-exit');
		window.postMessage("start-exit");
		try{
			window.parent.postMessage('do-exit', '*');
			window.parent.postMessage('start-exit', '*')
		} catch (e){

		}
	} 
	//--------------------------------------------------
	console.log('Moodle AITU');
	//--------------------------------------------------
	var jqueryLoaded = (function(){
		//--------------------------------------------------
		if (window.location.pathname.endsWith("/mod/quiz/attempt.php") || window.location.pathname.endsWith("/moodle/course/attempt.php")){
			var examName = $('#page h1').text().trim();
			if (examName != ''){
				var msg = {};
				msg['type'] = 'on-exam-name';
				msg['name'] = examName;
				var data = {};
				data['type'] = 'send-data-message';
				data['msg'] = msg;
				window.postMessage(JSON.stringify(data), '*');
			}
		}
		//--------------------------------------------------
		if ($('.quizstartbuttondiv form button[type=submit]').length >= 1){
			$('.quizstartbuttondiv form button[type=submit]').click();
		}
		$('#jump-to-activity').css('display', 'none');
		$('#next-activity-link').css('display', 'none');
		$('#prev-activity-link').css('display', 'none');

		/*
		if ($('.mod_quiz-next-nav').attr('value') == 'Закончить попытку...') $('.mod_quiz-next-nav').attr('value', 'Завершить экзамен');
		$('.othernav .endtestlink').text('Завершить экзамен');
		*/

		if ($('.mod_quiz-next-nav').attr('value') == 'Закончить попытку...') $('.mod_quiz-next-nav').attr('value', 'Завершить');
		$('.othernav .endtestlink').text('Завершить');
		//--------------------------------------------------
		if (window.location.pathname.endsWith("/mod/quiz/startattempt.php")){
			$('#id_submitbutton').click();
		}
		if (window.location.pathname.endsWith("/mod/quiz/summary.php")){

			var parent = $('.quizsummaryofattempt').parent();
			var first = parent.find('.btn-secondary').eq(0);
			var second = parent.find('.btn-secondary').eq(1);

			second.click();

			$(document).on('click', '.moodle-dialogue-confirm input[type=button][value="Отмена"]', function(){
				console.log('click canser');
				first.click();
			});
		}
		//--------------------------------------------------
	});	
	//--------------------------------------------------
	(function() {
	  	const script = document.createElement("script");
	  	script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
	  	script.type = 'text/javascript';
	  	script.addEventListener('load', () => {
	    console.log(`jQuery ${$.fn.jquery} has been loaded successfully!`);
	   		jqueryLoaded();
	  	});
	  	document.head.appendChild(script);
	})();
	//--------------------------------------------------
}; 
//------------------------------------------------------
document.addEventListener('mouseover', function(e) {
	if (e.target == document) return;
    if (!event.target.matches('.quizstartbuttondiv form button[type=submit], .quizstartbuttondiv form button[type=submit] *')) return;
    //--------------------
    if (isOesEnabled) return;
    if ("isEnabledInternalAppointments" in window && window.isEnabledInternalAppointments == 0) return;
    //--------------------
    if (window.location.hash == '#OES') return;
	if (window.self !== window.top) return;
    //--------------------
    var el = e.target;
    if (el.matches(".oesInited")) return;
    elClone = el.cloneNode(true);
    elClone.classList.add('oesInited');
    elClone.setAttribute('type', 'button');
    el.parentNode.replaceChild(elClone, el);
    //--------------------
}); 
async function getCookieData() {
	try {
		const response = await fetch('/get-cookie.php', {
			method: 'GET',
			credentials: 'include' // если нужно отправлять куки
		});

		if (!response.ok) {
			throw new Error(`Ошибка HTTP: ${response.status}`);
		}

		// если ответ — JSON
		const data = await response.json();
		return data;

		// если ответ — обычный текст, используй:
		// const text = await response.text();
		// return text;

	} catch (error) {
		console.error('Ошибка при получении cookie:', error);
		return null;
	}
}
//------------------------------------------------------
// Курс, тест и группа студента из Moodle (OES-254).
// Только добавляет параметры к переходу в OES; любая ошибка или ожидание дольше 1,5 с — переход как раньше.
var oesLmsContextPromise = null;
var oesLmsContextTimedOut = false;
// Адрес OES: aitu.oes.kz, на стенде — mySite, если его задали
function oesTargetHost(){
	try {
		if (typeof window.mySite === 'string' && /^aitu(-[a-z0-9-]+)?\.oes\.kz$/.test(window.mySite)) return window.mySite;
	} catch (e) {}
	return 'aitu.oes.kz';
}
function oesLmsText(value){
	return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 255);
}
function oesLmsDecode(html){
	var t = document.createElement('textarea');
	t.innerHTML = html;
	return t.value;
}
// Ссылки страницы на путь path с параметром key = value
function oesLmsLinks(root, path, key, value){
	var result = [];
	var links = root.querySelectorAll('a[href*="' + path + '"]');
	for (var i = 0; i < links.length; i++) {
		try {
			var u = new URL(links[i].getAttribute('href'), window.location.href);
			if (u.pathname.slice(-path.length) === path && u.searchParams.get(key) === String(value)) result.push(links[i]);
		} catch (e) {}
	}
	return result;
}
// Группы через веб-сервис Moodle: массив названий, [] — точно нет группы, null — не удалось определить
function oesLmsGroupsSelector(cfg, courseId, signal){
	var service = 'core_group_get_groups_for_selector';
	return fetch(cfg.wwwroot + '/lib/ajax/service.php?sesskey=' + encodeURIComponent(cfg.sesskey) + '&info=' + service, {
		method: 'POST', credentials: 'same-origin', signal: signal,
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify([{index: 0, methodname: service, args: {courseid: courseId}}])
	}).then(function(r){ return r.json(); }).then(function(data){
		var groups = (data && data[0] && !data[0].error && data[0].data) ? data[0].data.groups : null;
		if (!Array.isArray(groups) || groups.length == 0) return null;
		var names = [], hasAll = false;
		groups.forEach(function(g){ if (!(parseInt(g.id, 10) > 0)) hasAll = true; else names.push(oesLmsText(oesLmsDecode(g.name))); });
		// Раздельные группы: только свои группы; «Все участники» без групп — студент без группы
		if (!hasAll) return names;
		return names.length == 0 ? [] : null;
	}).catch(function(){ return null; });
}
// Группы со страницы профиля в курсе (блок «Группа»)
function oesLmsGroupsProfile(cfg, courseId, userId, signal){
	return fetch(cfg.wwwroot + '/user/view.php?id=' + userId + '&course=' + courseId, {credentials: 'same-origin', signal: signal})
		.then(function(r){ return r.text(); }).then(function(html){
			var doc = new DOMParser().parseFromString(html, 'text/html');
			var names = [];
			oesLmsLinks(doc, '/user/index.php', 'id', courseId).forEach(function(a){
				if (a.href.indexOf('group=') != -1) names.push(oesLmsText(a.textContent));
			});
			if (names.length == 0) {
				// Курс без режима групп: названия без ссылок
				var labels = ['group', 'groups', 'группа', 'группы', 'топ', 'топтар'];
				var dls = doc.querySelectorAll('section.node_category dl');
				for (var i = 0; i < dls.length; i++) {
					var dt = dls[i].querySelector('dt'), dd = dls[i].querySelector('dd');
					if (dt && dd && labels.indexOf(oesLmsText(dt.textContent).toLowerCase()) != -1) names.push(oesLmsText(dd.textContent));
				}
			}
			return names.filter(function(n){ return n !== ''; });
		}).catch(function(){ return null; });
}
// Контекст со страницы теста. Обещание всегда выполняется не позже budgetMs.
function oesLmsContext(budgetMs){
	return new Promise(function(resolve){
		var ctx = {}, done = false, controller = null;
		function finish(timedOut){
			if (done) return;
			done = true;
			if (timedOut === true) oesLmsContextTimedOut = true;
			try { if (controller) controller.abort(); } catch (e) {}
			resolve(ctx);
		}
		setTimeout(function(){ finish(true); }, budgetMs);
		try {
			controller = ('AbortController' in window) ? new AbortController() : null;
			var signal = controller ? controller.signal : undefined;
			var cfg = (window.M && M.cfg) ? M.cfg : {};
			var bodyClass = ' ' + (document.body ? document.body.className : '') + ' ';
			var url = new URL(window.location.href), m;
			// Курс
			var courseId = parseInt(cfg.courseId, 10) || 0;
			if (!courseId && (m = bodyClass.match(/\scourse-(\d+)\s/))) courseId = parseInt(m[1], 10);
			if (courseId == (parseInt(cfg.siteId, 10) || 1)) courseId = 0;
			// Тест (cmid)
			var cmid = (m = bodyClass.match(/\scmid-(\d+)\s/)) ? parseInt(m[1], 10) : 0;
			if (!cmid) cmid = parseInt(url.searchParams.get('cmid'), 10) || 0;
			if (!cmid && /\/mod\/quiz\/view\.php$/.test(url.pathname)) cmid = parseInt(url.searchParams.get('id'), 10) || 0;
			if (cmid > 0) ctx.lmsCmid = String(cmid);
			// Название теста
			var quizName = '';
			var activity = document.querySelector('[data-activityname]');
			if (activity) quizName = oesLmsText(activity.getAttribute('data-activityname'));
			if (!quizName && cmid) {
				var quizLinks = oesLmsLinks(document, '/mod/quiz/view.php', 'id', cmid);
				if (quizLinks.length) quizName = oesLmsText(quizLinks[0].textContent);
			}
			if (!quizName) {
				var crumbs = document.querySelectorAll('.breadcrumb li');
				if (crumbs.length && !crumbs[crumbs.length - 1].querySelector('a')) quizName = oesLmsText(crumbs[crumbs.length - 1].textContent);
			}
			if (quizName) ctx.lmsQuizName = quizName;
			if (!courseId) return finish();
			ctx.lmsCourseId = String(courseId);
			// Название курса: title ссылки на курс (полное), заголовок страницы, если это не тест, текст ссылки, title документа
			var courseName = '';
			var courseLinks = oesLmsLinks(document, '/course/view.php', 'id', courseId);
			courseLinks.forEach(function(a){ if (!courseName) courseName = oesLmsText(a.getAttribute('title')); });
			var heading = document.querySelector('.page-header-headings h1');
			var headingText = heading ? oesLmsText(heading.textContent) : '';
			if (!courseName && quizName && headingText && headingText != quizName) courseName = headingText;
			if (!courseName && courseLinks.length) courseName = oesLmsText(courseLinks[0].textContent);
			if (!courseName && document.title.indexOf(': ') > 0) courseName = oesLmsText(document.title.split(': ')[0]);
			if (courseName) ctx.lmsCourseName = courseName;
			// Группы
			var userId = parseInt(cfg.userId, 10) || 0;
			if (!userId) {
				var userEl = document.querySelector('[data-userid]');
				userId = userEl ? (parseInt(userEl.getAttribute('data-userid'), 10) || 0) : 0;
			}
			if (!cfg.wwwroot) cfg = {wwwroot: window.location.origin, sesskey: cfg.sesskey};
			var bySelector = cfg.sesskey ? oesLmsGroupsSelector(cfg, courseId, signal) : Promise.resolve(null);
			bySelector.then(function(groups){
				if (groups !== null || !userId) return groups;
				return oesLmsGroupsProfile(cfg, courseId, userId, signal);
			}).then(function(groups){
				if (Array.isArray(groups) && groups.length) ctx.lmsGroups = groups.slice(0, 10);
				finish();
			}).catch(function(){ finish(); });
		} catch (e) {
			finish();
		}
	});
}
function oesLmsContextStart(){
	if (!oesLmsContextPromise || oesLmsContextTimedOut) {
		oesLmsContextTimedOut = false;
		oesLmsContextPromise = oesLmsContext(1500);
	}
	return oesLmsContextPromise;
}
// Ожидание контекста при переходе: не дольше 1,5 с, без исключений
function oesLmsContextWait(){
	try {
		return Promise.race([
			oesLmsContextStart(),
			new Promise(function(resolve){ setTimeout(function(){ resolve({}); }, 1600); })
		]).catch(function(){ return {}; });
	} catch (e) {
		return Promise.resolve({});
	}
}
// Дополнительный параметр адреса internal_assignment: lms = base64url(JSON), без символов, которые OES декодирует повторно
function oesLmsQuery(ctx){
	try {
		if (!ctx) return '';
		var data = {};
		if (ctx.lmsCourseId) data.courseId = parseInt(ctx.lmsCourseId, 10);
		if (ctx.lmsCourseName) data.courseName = ctx.lmsCourseName;
		if (ctx.lmsCmid) data.cmid = parseInt(ctx.lmsCmid, 10);
		if (ctx.lmsQuizName) data.quizName = ctx.lmsQuizName;
		if (Array.isArray(ctx.lmsGroups) && ctx.lmsGroups.length) data.groups = ctx.lmsGroups;
		if (Object.keys(data).length == 0) return '';
		var token = btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		return token.length <= 4000 ? '&lms=' + token : '';
	} catch (e) {
		return '';
	}
}
// Заранее, пока студент на странице теста с кнопкой начала
(function(){
	try {
		if (window.self !== window.top || window.location.hash == '#OES') return;
		if ("isEnabledInternalAppointments" in window && window.isEnabledInternalAppointments == 0) return;
		var start = function(){
			try {
				if (/\/mod\/quiz\/view\.php$/.test(window.location.pathname) && document.querySelector('.quizstartbuttondiv')) oesLmsContextStart();
			} catch (e) {}
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
	} catch (e) {}
})();
//------------------------------------------------------
document.addEventListener('click', async function(e) {
	//--------------------
	function getCookie(cookieName) {
	  	var cookie = {};
	  	document.cookie.split(';').forEach(function(el) {
	    	var [key,value] = el.split('=');
	    	cookie[key.trim()] = value;
	  	});
	  	return cookie[cookieName];
	}
	//--------------------
  	if (!event.target.matches('.quizstartbuttondiv form button[type=submit], .quizstartbuttondiv form button[type=submit] *, .quizstartbuttondiv form button[type=button], .quizstartbuttondiv form button[type=button] *')) return;
  	if (isOesEnabled) return; 
  	if (window.location.hash == '#OES') return;
	//--------------------
  	if ("isEnabledInternalAppointments" in window && window.isEnabledInternalAppointments == 0) return;
  	console.log("Click submit");
  	e.preventDefault();
	//--------------------
  	var examName = document.querySelector(".page-header-headings h1").innerText;
  	if (examName.trim() == '') {
  		alert("OES: Не могу получить название экзамена");
  		return;
  	}
	//--------------------
	var lmsContext = oesLmsContextWait();
	var cookieData = await getCookieData();
	var lmsQuery = oesLmsQuery(await lmsContext);
	// cookieData['MoodleSession'] = getCookie('MoodleSession'); 
	//--------------------
	var buttonEl = document.querySelectorAll(
	    '.quizstartbuttondiv form button[type=submit], ' +
	    '.quizstartbuttondiv form button[type=submit] *, ' +
	    '.quizstartbuttondiv form button[type=button], ' +
	    '.quizstartbuttondiv form button[type=button] *'
	)[0];

	var button = buttonEl ? buttonEl.closest('button') : null;

	var buttonText = button
	    ? (button.getAttribute('data-text-original') || button.textContent.trim())
	    : '';
	//--------------------
  	window.location.href = "https://" + oesTargetHost() + "/internal_assignment?system=DEFAULT_MOODLE&examName=" + encodeURIComponent(examName) + "&buttonText=" + encodeURIComponent(buttonText)+ "&url=" + encodeURIComponent(window.location.href + "#OES") + "&backurl=" + encodeURIComponent(window.location.href) + "&cookies=" + encodeURIComponent(JSON.stringify(cookieData)) + lmsQuery;
  	return false;
}); 
//------------------------------------------------------
(function(){
	console.log("OES START CHECK");
	var isLogged = false;
	var elements = document.querySelectorAll('.menu-action-text');
	for (var i = 0; i < elements.length; i++) {
		var el = elements[i];
		if (el.innerText.trim() == 'Личный кабинет') isLogged = true;
		if (el.innerText.trim() == 'О пользователе') isLogged = true;
		if (el.innerText.trim() == 'Выход') isLogged = true;
	}
	elements = document.querySelectorAll('.dropdown-item');
	for (var i = 0; i < elements.length; i++) {
		var el = elements[i];
		if (el.innerText.trim() == 'Личные файлы') isLogged = true;
		if (el.innerText.trim() == 'Настройки') isLogged = true;
		if (el.innerText.trim() == 'Выход') isLogged = true;
	}
	console.log("OES START CHECK", isLogged, elements);
	if (isLogged){
		var data = {};
		data['type'] = 'im-logged';
		//
		var args = {};
		args['type'] = 'send-data-message';
		args['msg'] = data;
		args['packetId'] = -1;
		window.postMessage(JSON.stringify(args), '*');
		//
		console.log("OES: send is logged");
	} 

	if (!isLogged){
		setTimeout(function(){
			var isLogged = false;
			var elements = document.querySelectorAll('.menu-action-text');
			for (var i = 0; i < elements.length; i++) {
				var el = elements[i];
				if (el.innerText.trim() == 'Личный кабинет') isLogged = true;
				if (el.innerText.trim() == 'О пользователе') isLogged = true;
				if (el.innerText.trim() == 'Выход') isLogged = true;
			}
			elements = document.querySelectorAll('.dropdown-item');
			for (var i = 0; i < elements.length; i++) {
				var el = elements[i];
				if (el.innerText.trim() == 'Личные файлы') isLogged = true;
				if (el.innerText.trim() == 'Настройки') isLogged = true;
				if (el.innerText.trim() == 'Выход') isLogged = true;
			}
			console.log("OES START CHECK", isLogged, elements);
			if (isLogged){
				var data = {};
				data['type'] = 'im-logged';
				//
				var args = {};
				args['type'] = 'send-data-message';
				args['msg'] = data;
				args['packetId'] = -1;
				window.postMessage(JSON.stringify(args), '*');
				//
				console.log("OES: send is logged");
			} 
		}, 1000);
	}
	//--------------------------------------------------
	if (window.location.pathname.endsWith("/mod/quiz/review.php") || window.location.pathname.endsWith("/moodle/course/view.php") || window.location.pathname.endsWith("/moodle/quiz/view.php")){
		window.postMessage("start-exit");
		try{
			parent.postMessage("do-exit", "*");
			console.log("do-exit");
		} catch (e){
			console.log("do-exit", e);
		}
		try{
			window.parent.postMessage('do-exit', '*');
			window.parent.postMessage('start-exit', '*')
		} catch (e){
			console.log("do-exit", e);
		}
	}
	setTimeout(async function(){
		function convertAttemptUrlToView(url) {
		    try {
		        const u = new URL(url);

		        // Берём cmid из параметров
		        const cmid = u.searchParams.get("cmid");
		        if (!cmid) return null; // нет cmid — нечего конвертировать

		        // Меняем путь
		        u.pathname = u.pathname.replace("attempt.php", "view.php");

		        // Чистим параметры и ставим новый
		        u.search = "";              // очистить ?...
		        u.searchParams.set("id", cmid);

		        return u.toString();
		    } catch (e) {
		        return null;
		    }
		}

		if (window.location.pathname.endsWith("/mod/quiz/attempt.php") || window.location.pathname.endsWith("/moodle/course/attempt.php")){
			var h1 = document.querySelector('#page h1');
		    var examName = h1 ? h1.textContent.trim() : '';

		    if (examName !== '') {
		        var msg = {
		            type: 'on-exam-name',
		            name: examName
		        };

		        var data = {
		            type: 'oes-data-message',
		            msg: msg
		        };

		        try {
		            parent.postMessage(JSON.stringify(data), '*');
		        } catch (e) {
		            // ignore
		        }
		    }
		    var cookieData = await getCookieData();
			if ("isEnabledInternalAppointments" in window && window.isEnabledInternalAppointments == 0) return;
			if (isOesEnabled) return;
			if (window.self !== window.top) {

			} else {
				var url = convertAttemptUrlToView(window.location.href);
				// console.log("ОПА", 'examName', examName, url);
				var lmsQuery = oesLmsQuery(await oesLmsContextWait());
				window.location.href = "https://" + oesTargetHost() + "/internal_assignment?system=DEFAULT_MOODLE&examName=" + encodeURIComponent(examName) + "&url=" + encodeURIComponent(window.location.href + "#OES") + "&backurl=" + encodeURIComponent(url) + "&cookies=" + encodeURIComponent(JSON.stringify(cookieData)) + lmsQuery;
			}
		}	
	}, 1000);
	//--------------------------------------------------
})();
//------------------------------------------------------
/*
setTimeout(async function(){
	console.log("requestFullscreen 1");
	if (window.self === window.top) return;
	console.log("requestFullscreen 2");
	['click', 'keydown', 'mousemove', 'touchstart'].forEach(event => {
	    document.addEventListener(event, async () => {
	        if (!document.fullscreenElement) {
	            try {
	                await document.documentElement.requestFullscreen();
	            } catch (_) {}
	        }
	    }, { passive: true });
	}); 

	const box = document.getElementById('region-main-box');

	function applyBlur() {
	    if (box) box.style.filter = 'blur(14px)';
	}

	function removeBlur() {
	    if (box) box.style.filter = 'none';
	}

	// вкладка ушла из видимости (переключение, Win+Tab и т.п.)
	document.addEventListener('visibilitychange', () => {
	    if (document.visibilityState === 'hidden') {
	        applyBlur();
	    } else {
	        removeBlur();
	    }
	});

	// мышь вышла за пределы окна (часто перед любыми действиями)
	document.documentElement.addEventListener('mouseleave', () => {
	    applyBlur();
	});

	document.documentElement.addEventListener('mouseenter', () => {
	    removeBlur();
	});


	await document.documentElement.requestFullscreen();
}, 3000);
*/

/*
setTimeout(async function(){ 
	if (window.self === window.top) return; 
	const box = document.getElementById('region-main-box');

	function applyBlur() {
	    if (box) box.style.filter = 'blur(14px)';
	}

	function removeBlur() {
	    if (box) box.style.filter = 'none';
	}

	// вкладка ушла из видимости (переключение, Win+Tab и т.п.)
	document.addEventListener('visibilitychange', () => {
	    if (document.visibilityState === 'hidden') {
	        applyBlur();
	    } else {
	        removeBlur();
	    }
	});

	// мышь вышла за пределы окна (часто перед любыми действиями)
	document.documentElement.addEventListener('mouseleave', () => {
	    applyBlur();
	});

	document.documentElement.addEventListener('mouseenter', () => {
	    removeBlur();
	}); 
}, 3000);
*/
//------------------------------------------------------
var msg = {};
msg['type'] = 'is-exam-going';
var data = {};
data['type'] = 'send-data-message';
data['msg'] = msg;
window.postMessage(JSON.stringify(data), '*');
//------------------------------------------------------
function initQuizButtonsNoTranslate(){
	if (window.location.hash == '#OES') return;
	if (window.self !== window.top) return;

    var buttonSelector = '.quizstartbuttondiv form button[type=submit], .quizstartbuttondiv form button[type=button]';
    var fullSelector = [
        '.quizstartbuttondiv form button[type=submit]',
        '.quizstartbuttondiv form button[type=submit] *',
        '.quizstartbuttondiv form button[type=button]',
        '.quizstartbuttondiv form button[type=button] *'
    ].join(', ');

    document.querySelectorAll(buttonSelector).forEach(function(button){
        if (!button.hasAttribute('data-text-original')) {
            button.setAttribute('data-text-original', button.textContent.trim());
        }
    });

    document.querySelectorAll(fullSelector).forEach(function(el){
        if (!el.hasAttribute('data-translate-disabled')) {
            el.setAttribute('translate', 'no');
            el.classList.add('notranslate');
            el.setAttribute('data-translate-disabled', '1');
        }
    });
}

initQuizButtonsNoTranslate();

setInterval(function(){
    initQuizButtonsNoTranslate();
}, 1000);
//------------------------------------------------------
(function () {

    function isTargetForm(form) {
        if (!form) return false;

        var action = form.getAttribute('action') || '';
        action = action.split('?')[0].split('#')[0];

        return action.toLowerCase().endsWith('startattempt.php');
    }

    function forceSubmitHandler(e) {
        var isEnabled = true;

        if (window.location.hash == '#OES') isEnabled = false;
        if (window.self !== window.top) isEnabled = false;

        if (isEnabled) return;

        var btn = e.target.closest('button[type="submit"], input[type="submit"]');
        if (!btn) return;

        var form = btn.form || btn.closest('form');
        if (!form) return;

        if (!isTargetForm(form)) return;

        console.log("CLICK SUBMIT");
        console.log('Force submit form:', form);

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        form.setAttribute('target', '_self');

        if (btn.name && !form.querySelector('input[type="hidden"][data-force-submit-btn="' + btn.name + '"]')) {
            var hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = btn.name;
            hidden.value = btn.value || '';
            hidden.setAttribute('data-force-submit-btn', btn.name);
            form.appendChild(hidden);
        }

        HTMLFormElement.prototype.submit.call(form);
    }

    document.addEventListener('click', forceSubmitHandler, true);

    setTimeout(function () {
        document.addEventListener('click', forceSubmitHandler, true);
    }, 0);

})();
//------------------------------------------------------