"use client";
import {useEffect,useState} from "react";

export function PwaLifecycle(){
  const [waiting,setWaiting]=useState<ServiceWorker|null>(null);
  const [offline,setOffline]=useState(false);
  useEffect(()=>{
    const main=document.querySelector<HTMLElement>("main#main");
    if(main&&!main.hasAttribute("tabindex")) main.tabIndex=-1;
    if(!("serviceWorker" in navigator)) return;
    let timer:number|undefined;
    const sync=()=>setOffline(!navigator.onLine);
    window.addEventListener("online",sync); window.addEventListener("offline",sync); sync();
    navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(registration=>{
      if(registration.waiting)setWaiting(registration.waiting);
      registration.addEventListener("updatefound",()=>{const worker=registration.installing;if(worker)worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)setWaiting(worker)})});
      registration.update().catch(()=>{});
      timer=window.setInterval(()=>registration.update().catch(()=>{}),60*60*1000);
    }).catch(()=>{});
    return()=>{if(timer!==undefined) window.clearInterval(timer);window.removeEventListener("online",sync);window.removeEventListener("offline",sync)};
  },[]);
  if(!offline&&!waiting)return null;
  return <aside className="pwa-notice" role="status" aria-live="polite">{offline?<span>You are offline. Saved shell pages remain available; live actions may not work.</span>:<><span>A site update is ready.</span><button type="button" onClick={()=>{waiting?.postMessage({type:"ACTIVATE_UPDATE"});window.location.reload()}}>Update now</button></>}</aside>;
}
