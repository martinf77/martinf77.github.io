(function(){
  var i18n = { current: 'en', data: {} };

  function detectDefault(){
    try{
      var langs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
      for(var i=0;i<langs.length;i++){
        if(!langs[i]) continue;
        if(langs[i].toLowerCase().indexOf('hu') === 0) return 'hu';
      }
    }catch(e){}
    return 'en';
  }

  function load(lang){
    return fetch('assets/i18n/' + lang + '.json').then(function(res){
      if(!res.ok) throw new Error('i18n load failed');
      return res.json();
    }).then(function(json){
      i18n.current = lang;
      i18n.data = json;
      apply();
      var sel = document.getElementById('lang-select');
      if(sel) sel.value = lang;
    }).catch(function(){
      console.error('Failed to load i18n for', lang);
    });
  }

  function apply(){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      var val = i18n.data[key];
      if(val === undefined) {
        // leave original content when translation missing
        return;
      }
      // handle placeholders
      if(el.tagName.toLowerCase() === 'input' && el.placeholder !== undefined){
        el.placeholder = val;
      } else if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    // set document language attribute
    try{ document.documentElement.lang = i18n.current; }catch(e){}
    // update document title if a title.* key exists on page
    try{
      var titleEl = document.querySelector('[data-i18n^="title."]');
      if(titleEl){
        var tkey = titleEl.getAttribute('data-i18n');
        var tval = i18n.data[tkey];
        if(tval) document.title = tval + ' - martinf77';
      }
    }catch(e){}
  }

  function setLang(lang){
    try{ localStorage.setItem('lang', lang); }catch(e){}
    return load(lang);
  }

  // expose small API
  window.i18n = {
    t: function(k){ return i18n.data[k] || k; },
    setLang: setLang,
    current: function(){ return i18n.current; }
  };

  function init(){
    var stored = null;
    try{ stored = localStorage.getItem('lang'); }catch(e){}
    var initial = stored || detectDefault();
    var sel = document.getElementById('lang-select');
    if(sel){
      sel.addEventListener('change', function(){
        console.debug('i18n: selector changed to', sel.value);
        setLang(sel.value);
      });
    } else {
      console.debug('i18n: lang-select not found');
    }
    console.debug('i18n: loading initial language', initial);
    load(initial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready
    init();
  }

})();
