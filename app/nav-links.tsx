"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

const links = [
  ["Start here", "/start"],
  ["Tools", "/tools"],
  ["Learning", "/learning"],
  ["Work together", "/work"],
  ["Source Desk", "/insights"],
  ["About", "/about"],
] as const;

function isCurrent(pathname:string, href:string){
  return pathname===href || (href!=="/start" && pathname.startsWith(`${href}/`));
}

export function NavLinks({mobile=false}:{mobile?:boolean}){
  const pathname=usePathname();
  return <nav aria-label={mobile?"Mobile navigation":"Primary navigation"}>
    {links.map(([label,href])=><Link key={href} href={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}</Link>)}
    {mobile&&<Link href="/search" aria-current={pathname==="/search"?"page":undefined}>Search</Link>}
  </nav>;
}
