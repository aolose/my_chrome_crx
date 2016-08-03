var loginWin = document.querySelector('.needLogin');
var login = document.createElement('iframe');
var url = document.querySelector('#url');
var splice = document.querySelector('#splice');
var f = document.querySelector('#f');
var btn_send = document.querySelector('#send');
var btn_clear = document.querySelector('#clear');
var btn_check = document.querySelector('#check');
var port = chrome.extension.connect({name: 'Job Logs'});
var _state;
var logsUrl = 'http://req.51qqt.com/Pts/LogWork.aspx?problem=';
var pgId;
chrome.cookies.onChanged.addListener(function(changeInfo) {
	checkLogin();
});
var checkLogin = function(func){
	chrome.cookies.get({
		name:'.URTracker',
		url:'http://req.51qqt.com'
	},function(cookie){
		if(!cookie){
			_state='';
			loginWin.show();
		}else {
			loginWin.hide();
			if(func)func();
		}
	})
};
checkLogin();
try {
	tinymce.init({
		selector:'textarea' ,
		plugins :'',
		menubar: false,
		selection_toolbar: false,
		min_height:400,
		max_height:600
	}).then(function(editor){
		editor=editor[0];
		var ee = editor.getBody();
		var start = ee.innerHTML;
		btn_clear.onclick =function(){
			ee.innerHTML=start;
			localStorage.removeItem('editor');
		};
		var cc = localStorage.getItem('editor');
		if(cc){
			ee.innerHTML = cc;
		}
		var save = function(){
			var t = ee.textContent.replace(/^\s+|\s+$/,'');
			if(!t)return;
			localStorage.setItem('editor',ee.innerHTML)
		};
		editor.on('keyup',save)
	});
}catch (e){}


if(pgId=localStorage.getItem('pgId')){
	url.value = pgId
}
url.onblur = function(){
	localStorage.setItem('pgId',url.value);
};

loginWin.show = function(){
	loginWin.style.display='block';
	login.id='login';
	login.src='http://req.51qqt.com/Accounts/login.aspx';
	splice.appendChild(login);
	setTimeout(function(){
		loginWin.style.opacity=1;
	},30)
};
loginWin.hide = function(){
	if(_state)reloadState();
	loginWin.style.opacity=0;
	setTimeout(function(){
		loginWin.display='';
		if(login.parentNode){
			splice.removeChild(login);
		}
	},210);
};

port.onMessage.addListener(function(state) {
	if(state){
		_state=state;
	}
});
var bg = function(msg){
	port.postMessage(msg);
};
var getState =function(){
	bg('state');
};
var reloadState = function(){
	bg('reload');
};
var encode = function(a) {
	if (!a)
		return '';
	a = a.replace(/&/g, '&amp;');
	a = a.replace(/</g, '&lt;');
	a = a.replace(/>/g, '&gt;');
	return a;
};

function send(){
	var u;
	var editor = tinymce.EditorManager.activeEditor.getBody();
	var t = editor.textContent.replace(/^\s+|\s+$/,'');
	if(!t)return;
	checkLogin(function(){
		var content = encode(editor.innerHTML);
		if(!parseInt(u=url.value)){
			return alert('请先设定日志ID');
		}
		f.ctl00$CP1$editorContent$editor.value = content;
		var data = new FormData(f);

		var request = new XMLHttpRequest();
		request.open("POST", logsUrl+u);
		request.onreadystatechange = function () {
			if(request.readyState === XMLHttpRequest.DONE ) {
				if(request.status <400)alert('提交成功！');
				else{
					alert('提交失败')
				}
			}
		};
		request.send(data);
	});
}
getState();
btn_check.onclick = reloadState;
btn_send.onclick=send;
