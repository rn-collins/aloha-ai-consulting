(function(){
  'use strict';

  const NAV_GROUPS = [
    {
      label:'Work',
      items:[
        ['/services','Services'],['/strategy','Strategy'],['/legal-ai','Legal AI'],
        ['/ai-native-coo','AI-native COO'],['/build-your-team','Build your team']
      ]
    },
    {
      label:'Systems',
      items:[
        ['/trust-stack','Trust Stack'],['/tools','Tools'],['/twins','Twins'],
        ['/intelligence','Intelligence'],['/builds','Builds']
      ]
    },
    {
      label:'Learn',
      items:[
        ['/university','University home'],['/university/learn','Learn'],
        ['/university/playbooks','Playbooks'],['/university/templates','Templates'],
        ['/university/use-cases','Use cases'],['/ce','Continuing education']
      ]
    },
    {
      label:'About',
      items:[
        ['/methods','Methods'],['/engagements','Engagements'],['/partners','Partners'],
        ['/about','About'],['/practice','Practice']
      ]
    }
  ];

  const FOOTER_GROUPS = [
    {label:'Work with Aloha AI',items:[['/services','Consulting'],['/strategy','Strategy'],['/legal-ai','Legal AI'],['/engagements','Engagements']]},
    {label:'Use and learn',items:[['/tools','Tools'],['/trust-stack','Trust Stack'],['/university','University'],['/ce','Continuing education']]},
    {label:'Company',items:[['/about','About'],['/builds','Builds'],['/methods','Methods'],['/partners','Partners']]}
  ];

  function pathMatches(href){
    const current=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
    const target=href.replace(/\.html$/,'').replace(/\/$/,'')||'/';
    return current===target || (target!=='/' && current.startsWith(target+'/'));
  }

  function link(href,label,extraClass){
    const active=pathMatches(href);
    return '<a href="'+href+'"'+(extraClass?' class="'+extraClass+'"':'')+(active?' aria-current="page"':'')+'>'+label+'</a>';
  }

  function navMarkup(){
    const groups=NAV_GROUPS.map(function(group,index){
      const id='nav-group-'+index;
      return '<li class="site-nav__group">'
        +'<button class="site-nav__trigger" type="button" aria-expanded="false" aria-controls="'+id+'">'+group.label+'<span aria-hidden="true">⌄</span></button>'
        +'<div class="site-nav__panel" id="'+id+'">'
        +group.items.map(function(item){return link(item[0],item[1]);}).join('')
        +'</div></li>';
    }).join('');

    return '<div class="nav__in site-nav__in">'
      +'<a class="nav__brand" href="/" aria-label="Aloha AI home"><span>Aloha&nbsp;AI</span><span class="brand-spark" aria-hidden="true">✣</span></a>'
      +'<nav class="site-nav" aria-label="Primary"><ul class="site-nav__list" id="site-nav-list">'+groups+'</ul></nav>'
      +'<div class="site-nav__actions">'+link('/search','Search','site-nav__search')+link('/university/contact','Let’s build','btn btn--primary btn--sm')+'</div>'
      +'<button class="nav__burger site-nav__burger" type="button" aria-label="Open menu" aria-controls="site-nav-list" aria-expanded="false">'
      +'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>'
      +'</div>';
  }

  function footerMarkup(){
    return '<div class="wrap wrap--wide">'
      +'<div class="footer__grid site-footer__grid">'
      +'<div><a class="site-footer__brand" href="/">Aloha AI</a><p class="site-footer__intro">AI strategy, regulatory intelligence, education, and governed systems for work where trust matters.</p><p class="disc">A practice of RN Collins. Human accountability remains part of every consequential workflow.</p></div>'
      +FOOTER_GROUPS.map(function(group){return '<div><h4>'+group.label+'</h4><ul>'+group.items.map(function(item){return '<li>'+link(item[0],item[1])+'</li>';}).join('')+'</ul></div>';}).join('')
      +'</div><div class="site-footer__bottom"><span>© '+new Date().getFullYear()+' Rayven-Nikkita Collins LLC</span><span>'+link('/privacy','Privacy')+' · '+link('/terms','Terms')+'</span></div></div>';
  }

  function closeGroups(except){
    document.querySelectorAll('.site-nav__trigger[aria-expanded="true"]').forEach(function(button){
      if(button!==except) button.setAttribute('aria-expanded','false');
    });
  }

  function install(){
    document.documentElement.classList.add('js');
    const header=document.querySelector('header.nav');
    if(header){
      header.innerHTML=navMarkup();
      header.setAttribute('data-site-shell','true');
    }

    let footer=document.querySelector('footer.footer');
    if(!footer){
      footer=document.createElement('footer');
      footer.className='footer';
      document.body.appendChild(footer);
    }
    footer.innerHTML=footerMarkup();
    footer.setAttribute('data-site-shell','true');

    const burger=document.querySelector('.site-nav__burger');
    const list=document.querySelector('.site-nav__list');
    if(burger&&list){
      burger.addEventListener('click',function(){
        const open=burger.getAttribute('aria-expanded')==='true';
        burger.setAttribute('aria-expanded',String(!open));
        list.classList.toggle('open',!open);
      });
    }

    document.querySelectorAll('.site-nav__trigger').forEach(function(button){
      button.addEventListener('click',function(){
        const open=button.getAttribute('aria-expanded')==='true';
        closeGroups(button);
        button.setAttribute('aria-expanded',String(!open));
      });
    });

    document.addEventListener('click',function(event){
      if(!event.target.closest('.site-nav__group')) closeGroups();
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'){
        closeGroups();
        if(burger&&list){burger.setAttribute('aria-expanded','false');list.classList.remove('open');}
      }
    });

    const observer='IntersectionObserver' in window ? new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
    },{threshold:.12,rootMargin:'0px 0px -40px'}) : null;
    document.querySelectorAll('.section-cards .card,.section-heading').forEach(function(item,index){
      item.classList.add('motion-ready');
      item.style.setProperty('--motion-delay',Math.min(index%4,3)*70+'ms');
      if(observer) observer.observe(item); else item.classList.add('is-visible');
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
})();
