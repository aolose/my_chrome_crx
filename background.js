var __state;
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if(msg==='reload'){
      msg='__state';
      __state=false;
    }
    if(msg==='state'){
      var m='';
      getState()(function(s){
        if(s.length>400){
          m=s;
        }
        port.postMessage(m);
      })
    }
  });
});

var getState = function(){
  var cbs;
  if(__state){
    setTimeout(function(){
      if(cbs)cbs(__state);
    },0)
  }else{
    fetch('http://req.51qqt.com/Pts/LogWork.aspx?problem=957',{
      credentials: 'include'
    })
        .then(function(res){console.log(res);return res.text()})
        .then(function(text){
          var parser = new DOMParser();
          var v = parser.parseFromString(text,'text/html').forms[0].__VIEWSTATE.value;
          __state=v;
          if(cbs)cbs(v);
        })
  }
  return function (c){
    cbs=c
  }
};
