#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const SKIP_DIRS=new Set(['.git','node_modules','artifacts','api','lib','scripts','supabase']);
const STYLE='<link rel="stylesheet" href="/site-shell.css">';
const SCRIPT='<script defer src="/site-shell.js"></script>';

function walk(dir,files=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith('.')&&entry.name!=='.well-known') continue;
    if(entry.isDirectory()){
      if(!SKIP_DIRS.has(entry.name)) walk(path.join(dir,entry.name),files);
    }else if(entry.isFile()&&entry.name.endsWith('.html')) files.push(path.join(dir,entry.name));
  }
  return files;
}

function inject(html){
  let next=html;
  if(!next.includes('/site-shell.css')){
    if(next.includes('</head>')) next=next.replace('</head>',STYLE+'\n</head>');
    else throw new Error('Missing </head>');
  }
  if(!next.includes('/site-shell.js')){
    if(next.includes('</body>')) next=next.replace('</body>',SCRIPT+'\n</body>');
    else throw new Error('Missing </body>');
  }
  return next;
}

const files=walk(ROOT);
const report={scanned:files.length,changed:0,unchanged:0,errors:[]};

for(const file of files){
  const relative=path.relative(ROOT,file);
  try{
    const current=fs.readFileSync(file,'utf8');
    const next=inject(current);
    if(next===current){
      report.unchanged++;
      continue;
    }
    fs.writeFileSync(file,next,'utf8');
    report.changed++;
    process.stdout.write('updated '+relative+'\n');
  }catch(error){
    report.errors.push({file:relative,error:error.message});
    process.stderr.write('failed '+relative+': '+error.message+'\n');
  }
}

process.stdout.write('\n'+JSON.stringify(report,null,2)+'\n');
if(report.errors.length) process.exitCode=1;
