var $ = document.querySelector.bind(document);
var $new = document.createElement.bind(document);
var loginWin = $('.needLogin');
var login = $new('iframe');
var url = $('#url');
var splice = $('#splice');
var btn_send = $('#send');
var btn_clear = $('#clear');
var btn_check = $('#check');
var editor;
var ck = chrome.cookies;
var port = chrome.extension.connect({name: 'Job Logs'});
var cbList = {};

var onMsg = function (msg) {
	var qid = msg.qid;
	var func = cbList[qid];
	delete cbList[qid];
	func(msg.data);
};

var eventsList = [];
ck.onChanged.addListener(function () {
	eventsList.forEach(function (func) {
		func();
	});
});

var checkLogin = function (func) {
	ck.get({
		name: '.URTracker',
		url: 'http://req.51qqt.com'
	}, function (cookie) {
		// 登录cookie检查
		if (!cookie) {
			loginWin.show();
			if (0 === eventsList.length) {
				eventsList.push(function () {
					eventsList.length = 0;
					checkLogin(loadList)
				})
			}
		} else {
			eventsList.length = 0;
			if (func)func();
			loginWin.hide();
		}
	})
};
var loadList = function () {
	ck.remove({
		url: 'http://req.51qqt.com',
		name:'LastQueryString_27_10'
	});
	ck.remove({
		url: 'http://req.51qqt.com',
		name:'CurrentProblemList'
	});
	ck.set(ck1);
	ck.set(ck2);
	url.onchange=null;
	var _u = localStorage.getItem('url');
	url.value = undefined;
	query('list', function (array) {
		if (!array)alert('获取日志列表失败');
		else {
			url.innerHTML = '';
			var k = document.createDocumentFragment();
			var defaultIndex = 0;
			array.forEach(function (d, i) {
				var o = $new('option');
				o.value = d.url;
				o.text = d.text;
				k.appendChild(o);
				if (d.url === _u)defaultIndex = i;
			});
			url.appendChild(k);
			url.onchange=function(){
				localStorage.setItem('url',url.value);
			};
			url.selectedIndex = defaultIndex;
		}
	})
};
loginWin.show = function () {
	loginWin.style.display = 'block';
	login.id = 'login';
	login.src = 'http://req.51qqt.com/Accounts/login.aspx';
	splice.appendChild(login);
	setTimeout(function () {
		loginWin.style.opacity = 1;
	}, 30)
};
loginWin.hide = function () {
	loginWin.style.opacity = 0;
	setTimeout(function () {
		loginWin.style.display = '';
		if (login.parentNode) {
			splice.removeChild(login);
		}
	}, 210);
};
var query = function (param, func) {
	var qid = Date.now() + Math.random();
	cbList[qid] = func;
	port.postMessage({qid: qid, data: param});
};
var encode = function (a) {
	if (!a)
		return '';
	a = a.replace(/&/g, '&amp;');
	a = a.replace(/</g, '&lt;');
	a = a.replace(/>/g, '&gt;');
	return a;
};
var _send;
var send = function () {
	if(_send)return;
	_send=true;
	var editor = tinymce.EditorManager.activeEditor.getBody();
	var t = editor.textContent.replace(/^\s+|\s+$/, '');
	if (!t)return;
	checkLogin(function () {
		var content = encode(editor.innerHTML);
		query({
			url: url.value,
			type: 'send',
			content: content
		}, function (suc) {
			alert(suc ? '提交成功' : '提交失败');
			_send=false;
		})
	});
};
btn_check.onclick = loadList;
btn_send.onclick = send;
port.onMessage.addListener(onMsg);

// 我提交过的
var ck1 = {
	url: 'http://req.51qqt.com',
	domain: 'req.51qqt.com',
	httpOnly: false,
	name: 'LastQueryString_27_10',
	path: '/',
	sameSite: 'no_restriction',
	storeId: '0',
	value: 'FilterType=1&procName=Relate_3&Title=%e6%88%91%e5%88%9b%e5%bb%ba%e7%9a%84%e4%ba%8b%e5%8a%a1'
};
// 时间排序
var ck2 = {
	url: 'http://req.51qqt.com',
	domain: 'req.51qqt.com',
	expirationDate: 253402300529.52216,
	httpOnly: false,
	name: 'ProblemListSortExpression_27_10',
	path: '/',
	sameSite: 'no_restriction',
	storeId: '0',
	value: 'LastTime DESC'
};

window.addEventListener("unload", function () {
	localStorage.setItem('url', url.value);
	if (editor) {
		var ee = editor.getBody();
		var t = ee.textContent.replace(/^\s+|\s+$/, '');
		if (!t)return;
		localStorage.setItem('editor', ee.innerHTML)
	}
}, true);

tinymce.init({
	selector: 'textarea',
	menubar: false,
	selection_toolbar: false,
	min_height: 400,
	max_height: 600,
	plugins: 'paste',
	paste_data_images: true
}).then(function (editors) {
	editor = editors[0];
	var ee = editor.getBody();
	var start = ee.innerHTML;
	btn_clear.onclick = function () {
		ee.innerHTML = start;
		localStorage.removeItem('editor');
	};
	var cc = localStorage.getItem('editor');
	if (cc) {
		ee.innerHTML = cc;
	}
	checkLogin(loadList);
});