"use strict";(globalThis.webpackChunktraveling_allowance_system=globalThis.webpackChunktraveling_allowance_system||[]).push([[51],{2110(t,e,r){r.d(e,{A:()=>v});var n=r(8168),a=r(8587),o=r(5043),i=r(8387),s=r(8610),l=r(4535),h=r(8206),d=r(3336),c=r(2532),u=r(2372);function p(t){return(0,u.Ay)("MuiCard",t)}(0,c.A)("MuiCard",["root"]);var m=r(579);const g=["className","raised"],f=(0,l.Ay)(d.A,{name:"MuiCard",slot:"Root",overridesResolver:(t,e)=>e.root})(()=>({overflow:"hidden"})),v=o.forwardRef(function(t,e){const r=(0,h.b)({props:t,name:"MuiCard"}),{className:o,raised:l=!1}=r,d=(0,a.A)(r,g),c=(0,n.A)({},r,{raised:l}),u=(t=>{const{classes:e}=t;return(0,s.A)({root:["root"]},p,e)})(c);return(0,m.jsx)(f,(0,n.A)({className:(0,i.A)(u.root,o),elevation:l?8:void 0,ref:e,ownerState:c},d))})},6494(t,e,r){r.d(e,{A:()=>f});var n=r(8168),a=r(8587),o=r(5043),i=r(8387),s=r(8610),l=r(4535),h=r(8206),d=r(2532),c=r(2372);function u(t){return(0,c.Ay)("MuiCardContent",t)}(0,d.A)("MuiCardContent",["root"]);var p=r(579);const m=["className","component"],g=(0,l.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(t,e)=>e.root})(()=>({padding:16,"&:last-child":{paddingBottom:24}})),f=o.forwardRef(function(t,e){const r=(0,h.b)({props:t,name:"MuiCardContent"}),{className:o,component:l="div"}=r,d=(0,a.A)(r,m),c=(0,n.A)({},r,{component:l}),f=(t=>{const{classes:e}=t;return(0,s.A)({root:["root"]},u,e)})(c);return(0,p.jsx)(g,(0,n.A)({as:l,className:(0,i.A)(f.root,o),ownerState:c,ref:e},d))})},8185(t,e,r){r.d(e,{A:()=>S});var n=r(8587),a=r(8168),o=r(5043),i=r(8387),s=r(3290),l=r(8610);function h(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function d(t){return parseFloat(t)}var c=r(310),u=r(4535),p=r(8206),m=r(2532),g=r(2372);function f(t){return(0,g.Ay)("MuiSkeleton",t)}(0,m.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var v=r(579);const A=["animation","className","component","height","style","variant","width"];let b,w,C,y,$=t=>t;const k=(0,s.i7)(b||(b=$`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),x=(0,s.i7)(w||(w=$`
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
`)),R=(0,u.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:r}=t;return[e.root,e[r.variant],!1!==r.animation&&e[r.animation],r.hasChildren&&e.withChildren,r.hasChildren&&!r.width&&e.fitContent,r.hasChildren&&!r.height&&e.heightAuto]}})(t=>{let{theme:e,ownerState:r}=t;const n=h(e.shape.borderRadius)||"px",o=d(e.shape.borderRadius);return(0,a.A)({display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:(0,c.X4)(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em"},"text"===r.variant&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${o}${n}/${Math.round(o/.6*10)/10}${n}`,"&:empty:before":{content:'"\\00a0"'}},"circular"===r.variant&&{borderRadius:"50%"},"rounded"===r.variant&&{borderRadius:(e.vars||e).shape.borderRadius},r.hasChildren&&{"& > *":{visibility:"hidden"}},r.hasChildren&&!r.width&&{maxWidth:"fit-content"},r.hasChildren&&!r.height&&{height:"auto"})},t=>{let{ownerState:e}=t;return"pulse"===e.animation&&(0,s.AH)(C||(C=$`
      animation: ${0} 2s ease-in-out 0.5s infinite;
    `),k)},t=>{let{ownerState:e,theme:r}=t;return"wave"===e.animation&&(0,s.AH)(y||(y=$`
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
    `),x,(r.vars||r).palette.action.hover)}),S=o.forwardRef(function(t,e){const r=(0,p.b)({props:t,name:"MuiSkeleton"}),{animation:o="pulse",className:s,component:h="span",height:d,style:c,variant:u="text",width:m}=r,g=(0,n.A)(r,A),b=(0,a.A)({},r,{animation:o,component:h,variant:u,hasChildren:Boolean(g.children)}),w=(t=>{const{classes:e,variant:r,animation:n,hasChildren:a,width:o,height:i}=t,s={root:["root",r,n,a&&"withChildren",a&&!o&&"fitContent",a&&!i&&"heightAuto"]};return(0,l.A)(s,f,e)})(b);return(0,v.jsx)(R,(0,a.A)({as:h,ref:e,className:(0,i.A)(w.root,s),ownerState:b},g,{style:(0,a.A)({width:m,height:d},c)}))})},310(t,e,r){r.d(e,{X4:()=>l});var n=r(7868),a=r(1188);function o(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return(0,a.A)(t,e,r)}function i(t){if(t.type)return t;if("#"===t.charAt(0))return i(function(t){t=t.slice(1);const e=new RegExp(`.{1,${t.length>=6?2:1}}`,"g");let r=t.match(e);return r&&1===r[0].length&&(r=r.map(t=>t+t)),r?`rgb${4===r.length?"a":""}(${r.map((t,e)=>e<3?parseInt(t,16):Math.round(parseInt(t,16)/255*1e3)/1e3).join(", ")})`:""}(t));const e=t.indexOf("("),r=t.substring(0,e);if(-1===["rgb","rgba","hsl","hsla","color"].indexOf(r))throw new Error((0,n.A)(9,t));let a,o=t.substring(e+1,t.length-1);if("color"===r){if(o=o.split(" "),a=o.shift(),4===o.length&&"/"===o[3].charAt(0)&&(o[3]=o[3].slice(1)),-1===["srgb","display-p3","a98-rgb","prophoto-rgb","rec-2020"].indexOf(a))throw new Error((0,n.A)(10,a))}else o=o.split(",");return o=o.map(t=>parseFloat(t)),{type:r,values:o,colorSpace:a}}function s(t){const{type:e,colorSpace:r}=t;let{values:n}=t;return-1!==e.indexOf("rgb")?n=n.map((t,e)=>e<3?parseInt(t,10):t):-1!==e.indexOf("hsl")&&(n[1]=`${n[1]}%`,n[2]=`${n[2]}%`),n=-1!==e.indexOf("color")?`${r} ${n.join(" ")}`:`${n.join(", ")}`,`${e}(${n})`}function l(t,e){return t=i(t),e=o(e),"rgb"!==t.type&&"hsl"!==t.type||(t.type+="a"),"color"===t.type?t.values[3]=`/${e}`:t.values[3]=e,s(t)}}}]);
//# sourceMappingURL=51.5ccf91fd.chunk.js.map