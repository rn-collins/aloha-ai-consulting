#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SKIP_DIRS=new Set(['.git','node_modules','artifacts','api','lib','scripts','supabase']);

function walk(dir,files=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith('.')&&entry.name!=='.well-known') continue;
    const absolute=path.join(dir,entry.name);
    if(entry.isDirectory()){
      if(!SKIP_DIRS.has(entry.name)) walk(absolute,files);
    }else if(entry.isFile()&&entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

const failures=[];
const files=walk(ROOT);
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const relative=path.relative(ROOT,file);
  const checks={
    language:/<html[^>]+lang=["'][^"']+["']/i.test(html),
    viewport:/<meta[^>]+name=["']viewport["']/i.test(html),
    main:/<main\b/i.test(html),
    skip:/class=["'][^"']*\bskip\b/i.test(html),
    designSystem:html.includes('aloha-ds.css'),
    siteShellStyle:html.includes('/site-shell.css'),
    siteShellScript:html.includes('/site-shell.js')
  };
  const missing=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
  if(missing.length) failures.push({file:relative,missing});
}

const report={pages:files.length,passing:files.length-failures.length,failing:failures.length,failures};
console.log(JSON.stringify(report,null,2));
if(failures.length) process.exitCode=1;
