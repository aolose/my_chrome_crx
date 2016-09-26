var parser = new DOMParser();
chrome.extension.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		var type = msg.data.type || msg.data;
		var qid = msg.qid;
		var param;
		if (typeof  msg.data === 'object') {
			param = msg.data;
			delete  param.type;
		}
		var result=0;
		switch (type) {
			case 'list':
				 fetchDoc('http://req.51qqt.com/Pts/issuelist.aspx?project=10', 0, function (dom) {
					if (typeof dom==='object') {
						var fs = [].slice.call(dom.querySelectorAll('.problem_title_cell>a[href^="ViewProblem.aspx?Problem"]'));
						if (fs.length) {
							result=[];
							fs.forEach(function (a) {
								result.push({
									url: 'http://req.51qqt.com/Pts/LogWork'+a.getAttribute('href').replace('ViewProblem',''),
									text: a.textContent
								})
							})
						}
					}
					port.postMessage({
						qid: qid,
						data: result
					});
				});
				break;
			case 'send':
				fetchDoc(param.url,0,function(dom){
					var state = dom.forms[0].__VIEWSTATE.value;
					fetchDoc(param.url,{
						__VIEWSTATE:state,
						ctl00$CP1$btnSubbmit:'提交工作记录 (Alt+S)',
						ctl00$CP1$editorContent$editor:param.content
					},function(r){
						port.postMessage({
							qid: qid,
							data: typeof r==='object'||r<400
						});
					})
				});
		}
	});
});

var fetchDoc = function (url, params, func) {
	var request = new XMLHttpRequest();
	var data;
	if (params) {
		data = new FormData();
		Object.keys(params).forEach(function (k) {
			data.append(k, params[k]);
		});
	}
	request.open(params ? "POST": "GET", url);
	request.onreadystatechange = function () {
		if (request.readyState === XMLHttpRequest.DONE) {
			if (request.status === 200) {
				var dom = parser.parseFromString(request.responseText, 'text/html');
				func(dom);
			} else {
				func(request.status)
			}
		}
	};
	request.send(data);
};

