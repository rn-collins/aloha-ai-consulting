"use client";
import {useEffect} from "react";

export function PwaLifecycle(){
  useEffect(()=>{
    const main=document.querySelector<HTMLElement>("main#main");
    if(main&&!main.hasAttribute("tabindex")) main.tabIndex=-1;
    if(!("serviceWorker" in navigator)) return;
    let timer:number|undefined;
    navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(registration=>{
      registration.update().catch(()=>{});
      timer=window.setInterval(()=>registration.update().catch(()=>{}),60*60*1000);
    }).catch(()=>{});
    return()=>{if(timer!==undefined) window.clearInterval(timer)};
  },[]);
  return null;
}
