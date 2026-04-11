"use strict";(globalThis.webpackChunktraveling_allowance_system=globalThis.webpackChunktraveling_allowance_system||[]).push([[185],{78185(t,e,n){n.d(e,{A:()=>R});var a=n(98587),r=n(58168),i=n(65043),o=n(58387),s=n(83290),l=n(98610);function h(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function d(t){return parseFloat(t)}var u=n(90310),c=n(34535),p=n(98206),g=n(92532),m=n(72372);function f(t){return(0,m.Ay)("MuiSkeleton",t)}(0,g.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var b=n(70579);const v=["animation","className","component","height","style","variant","width"];let w,y,A,$,k=t=>t;const C=(0,s.i7)(w||(w=k`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),x=(0,s.i7)(y||(y=k`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`)),S=(0,c.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:n}=t;return[e.root,e[n.variant],!1!==n.animation&&e[n.animation],n.hasChildren&&e.withChildren,n.hasChildren&&!n.width&&e.fitContent,n.hasChildren&&!n.height&&e.heightAuto]}})(t=>{let{theme:e,ownerState:n}=t;const a=h(e.shape.borderRadius)||"px",i=d(e.shape.borderRadius);return(0,r.A)({display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:(0,u.X4)(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em"},"text"===n.variant&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${i}${a}/${Math.round(i/.6*10)/10}${a}`,"&:empty:before":{content:'"\\00a0"'}},"circular"===n.variant&&{borderRadius:"50%"},"rounded"===n.variant&&{borderRadius:(e.vars||e).shape.borderRadius},n.hasChildren&&{"& > *":{visibility:"hidden"}},n.hasChildren&&!n.width&&{maxWidth:"fit-content"},n.hasChildren&&!n.height&&{height:"auto"})},t=>{let{ownerState:e}=t;return"pulse"===e.animation&&(0,s.AH)(A||(A=k`
      animation: ${0} 2s ease-in-out 0.5s infinite;
    `),C)},t=>{let{ownerState:e,theme:n}=t;return"wave"===e.animation&&(0,s.AH)($||($=k`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${0} 2s linear 0.5s infinite;
        background: linear-gradient(
          90deg,
          transparent,
          ${0},
          transparent
        );
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `),x,(n.vars||n).palette.action.hover)}),R=i.forwardRef(function(t,e){const n=(0,p.b)({props:t,name:"MuiSkeleton"}),{animation:i="pulse",className:s,component:h="span",height:d,style:u,variant:c="text",width:g}=n,m=(0,a.A)(n,v),w=(0,r.A)({},n,{animation:i,component:h,variant:c,hasChildren:Boolean(m.children)}),y=(t=>{const{classes:e,variant:n,animation:a,hasChildren:r,width:i,height:o}=t,s={root:["root",n,a,r&&"withChildren",r&&!i&&"fitContent",r&&!o&&"heightAuto"]};return(0,l.A)(s,f,e)})(w);return(0,b.jsx)(S,(0,r.A)({as:h,ref:e,className:(0,o.A)(y.root,s),ownerState:w},m,{style:(0,r.A)({width:g,height:d},u)}))})},90310(t,e,n){n.d(e,{X4:()=>l});var a=n(17868),r=n(11188);function i(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return(0,r.A)(t,e,n)}function o(t){if(t.type)return t;if("#"===t.charAt(0))return o(function(t){t=t.slice(1);const e=new RegExp(`.{1,${t.length>=6?2:1}}`,"g");let n=t.match(e);return n&&1===n[0].length&&(n=n.map(t=>t+t)),n?`rgb${4===n.length?"a":""}(${n.map((t,e)=>e<3?parseInt(t,16):Math.round(parseInt(t,16)/255*1e3)/1e3).join(", ")})`:""}(t));const e=t.indexOf("("),n=t.substring(0,e);if(-1===["rgb","rgba","hsl","hsla","color"].indexOf(n))throw new Error((0,a.A)(9,t));let r,i=t.substring(e+1,t.length-1);if("color"===n){if(i=i.split(" "),r=i.shift(),4===i.length&&"/"===i[3].charAt(0)&&(i[3]=i[3].slice(1)),-1===["srgb","display-p3","a98-rgb","prophoto-rgb","rec-2020"].indexOf(r))throw new Error((0,a.A)(10,r))}else i=i.split(",");return i=i.map(t=>parseFloat(t)),{type:n,values:i,colorSpace:r}}function s(t){const{type:e,colorSpace:n}=t;let{values:a}=t;return-1!==e.indexOf("rgb")?a=a.map((t,e)=>e<3?parseInt(t,10):t):-1!==e.indexOf("hsl")&&(a[1]=`${a[1]}%`,a[2]=`${a[2]}%`),a=-1!==e.indexOf("color")?`${n} ${a.join(" ")}`:`${a.join(", ")}`,`${e}(${a})`}function l(t,e){return t=o(t),e=i(e),"rgb"!==t.type&&"hsl"!==t.type||(t.type+="a"),"color"===t.type?t.values[3]=`/${e}`:t.values[3]=e,s(t)}}}]);
//# sourceMappingURL=185.a2dd42d5.chunk.js.map