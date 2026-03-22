import{r as t,M as D,j as y,e as k,P as U,f as S,h as b,L as A,c as z}from"./index-DKhbxwxh.js";class K extends t.Component{getSnapshotBeforeUpdate(l){const e=this.props.childRef.current;if(e&&l.isPresent&&!this.props.isPresent){const n=this.props.sizeRef.current;n.height=e.offsetHeight||0,n.width=e.offsetWidth||0,n.top=e.offsetTop,n.left=e.offsetLeft}return null}componentDidUpdate(){}render(){return this.props.children}}function T({children:i,isPresent:l}){const e=t.useId(),n=t.useRef(null),C=t.useRef({width:0,height:0,top:0,left:0}),{nonce:a}=t.useContext(D);return t.useInsertionEffect(()=>{const{width:d,height:o,top:h,left:s}=C.current;if(l||!n.current||!d||!o)return;n.current.dataset.motionPopId=e;const c=document.createElement("style");return a&&(c.nonce=a),document.head.appendChild(c),c.sheet&&c.sheet.insertRule(`
          [data-motion-pop-id="${e}"] {
            position: absolute !important;
            width: ${d}px !important;
            height: ${o}px !important;
            top: ${h}px !important;
            left: ${s}px !important;
          }
        `),()=>{document.head.removeChild(c)}},[l]),y.jsx(K,{isPresent:l,childRef:n,sizeRef:C,children:t.cloneElement(i,{ref:n})})}const q=({children:i,initial:l,isPresent:e,onExitComplete:n,custom:C,presenceAffectsLayout:a,mode:d})=>{const o=k(B),h=t.useId(),s=t.useCallback(f=>{o.set(f,!0);for(const x of o.values())if(!x)return;n&&n()},[o,n]),c=t.useMemo(()=>({id:h,initial:l,isPresent:e,custom:C,onExitComplete:s,register:f=>(o.set(f,!1),()=>o.delete(f))}),a?[Math.random(),s]:[e,s]);return t.useMemo(()=>{o.forEach((f,x)=>o.set(x,!1))},[e]),t.useEffect(()=>{!e&&!o.size&&n&&n()},[e]),d==="popLayout"&&(i=y.jsx(T,{isPresent:e,children:i})),y.jsx(U.Provider,{value:c,children:i})};function B(){return new Map}const g=i=>i.key||"";function j(i){const l=[];return t.Children.forEach(i,e=>{t.isValidElement(e)&&l.push(e)}),l}const G=({children:i,custom:l,initial:e=!0,onExitComplete:n,presenceAffectsLayout:C=!0,mode:a="sync",propagate:d=!1})=>{const[o,h]=S(d),s=t.useMemo(()=>j(i),[i]),c=d&&!o?[]:s.map(g),f=t.useRef(!0),x=t.useRef(s),v=k(()=>new Map),[I,L]=t.useState(s),[p,M]=t.useState(s);b(()=>{f.current=!1,x.current=s;for(let u=0;u<p.length;u++){const r=g(p[u]);c.includes(r)?v.delete(r):v.get(r)!==!0&&v.set(r,!1)}},[p,c.length,c.join("-")]);const R=[];if(s!==I){let u=[...s];for(let r=0;r<p.length;r++){const m=p[r],w=g(m);c.includes(w)||(u.splice(r,0,m),R.push(m))}a==="wait"&&R.length&&(u=R),M(j(u)),L(s);return}const{forceRender:E}=t.useContext(A);return y.jsx(y.Fragment,{children:p.map(u=>{const r=g(u),m=d&&!o?!1:s===p||c.includes(r),w=()=>{if(v.has(r))v.set(r,!0);else return;let P=!0;v.forEach($=>{$||(P=!1)}),P&&(E==null||E(),M(x.current),d&&(h==null||h()),n&&n())};return y.jsx(q,{isPresent:m,initial:!f.current||e?void 0:!1,custom:m?void 0:l,presenceAffectsLayout:C,mode:a,onExitComplete:m?void 0:w,children:u},r)})})};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=z("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=z("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);export{G as A,O as C,H as a};
