var $r=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function $e(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var le={exports:{}},w={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var he;function Ce(){if(he)return w;he=1;var t=Symbol.for("react.element"),o=Symbol.for("react.portal"),n=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),y=Symbol.for("react.profiler"),u=Symbol.for("react.provider"),f=Symbol.for("react.context"),p=Symbol.for("react.forward_ref"),$=Symbol.for("react.suspense"),S=Symbol.for("react.memo"),P=Symbol.for("react.lazy"),R=Symbol.iterator;function H(e){return e===null||typeof e!="object"?null:(e=R&&e[R]||e["@@iterator"],typeof e=="function"?e:null)}var q={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},I=Object.assign,D={};function C(e,r,m){this.props=e,this.context=r,this.refs=D,this.updater=m||q}C.prototype.isReactComponent={},C.prototype.setState=function(e,r){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,r,"setState")},C.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function T(){}T.prototype=C.prototype;function V(e,r,m){this.props=e,this.context=r,this.refs=D,this.updater=m||q}var U=V.prototype=new T;U.constructor=V,I(U,C.prototype),U.isPureReactComponent=!0;var Y=Array.isArray,W=Object.prototype.hasOwnProperty,G={current:null},X={key:!0,ref:!0,__self:!0,__source:!0};function B(e,r,m){var k,x={},z=null,A=null;if(r!=null)for(k in r.ref!==void 0&&(A=r.ref),r.key!==void 0&&(z=""+r.key),r)W.call(r,k)&&!X.hasOwnProperty(k)&&(x[k]=r[k]);var L=arguments.length-2;if(L===1)x.children=m;else if(1<L){for(var N=Array(L),O=0;O<L;O++)N[O]=arguments[O+2];x.children=N}if(e&&e.defaultProps)for(k in L=e.defaultProps,L)x[k]===void 0&&(x[k]=L[k]);return{$$typeof:t,type:e,key:z,ref:A,props:x,_owner:G.current}}function F(e,r){return{$$typeof:t,type:e.type,key:r,ref:e.ref,props:e.props,_owner:e._owner}}function j(e){return typeof e=="object"&&e!==null&&e.$$typeof===t}function _(e){var r={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(m){return r[m]})}var M=/\/+/g;function Z(e,r){return typeof e=="object"&&e!==null&&e.key!=null?_(""+e.key):r.toString(36)}function h(e,r,m,k,x){var z=typeof e;(z==="undefined"||z==="boolean")&&(e=null);var A=!1;if(e===null)A=!0;else switch(z){case"string":case"number":A=!0;break;case"object":switch(e.$$typeof){case t:case o:A=!0}}if(A)return A=e,x=x(A),e=k===""?"."+Z(A,0):k,Y(x)?(m="",e!=null&&(m=e.replace(M,"$&/")+"/"),h(x,r,m,"",function(O){return O})):x!=null&&(j(x)&&(x=F(x,m+(!x.key||A&&A.key===x.key?"":(""+x.key).replace(M,"$&/")+"/")+e)),r.push(x)),1;if(A=0,k=k===""?".":k+":",Y(e))for(var L=0;L<e.length;L++){z=e[L];var N=k+Z(z,L);A+=h(z,r,m,N,x)}else if(N=H(e),typeof N=="function")for(e=N.call(e),L=0;!(z=e.next()).done;)z=z.value,N=k+Z(z,L++),A+=h(z,r,m,N,x);else if(z==="object")throw r=String(e),Error("Objects are not valid as a React child (found: "+(r==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":r)+"). If you meant to render a collection of children, use an array instead.");return A}function c(e,r,m){if(e==null)return e;var k=[],x=0;return h(e,k,"","",function(z){return r.call(m,z,x++)}),k}function a(e){if(e._status===-1){var r=e._result;r=r(),r.then(function(m){(e._status===0||e._status===-1)&&(e._status=1,e._result=m)},function(m){(e._status===0||e._status===-1)&&(e._status=2,e._result=m)}),e._status===-1&&(e._status=0,e._result=r)}if(e._status===1)return e._result.default;throw e._result}var l={current:null},i={transition:null},g={ReactCurrentDispatcher:l,ReactCurrentBatchConfig:i,ReactCurrentOwner:G};function b(){throw Error("act(...) is not supported in production builds of React.")}return w.Children={map:c,forEach:function(e,r,m){c(e,function(){r.apply(this,arguments)},m)},count:function(e){var r=0;return c(e,function(){r++}),r},toArray:function(e){return c(e,function(r){return r})||[]},only:function(e){if(!j(e))throw Error("React.Children.only expected to receive a single React element child.");return e}},w.Component=C,w.Fragment=n,w.Profiler=y,w.PureComponent=V,w.StrictMode=s,w.Suspense=$,w.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=g,w.act=b,w.cloneElement=function(e,r,m){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var k=I({},e.props),x=e.key,z=e.ref,A=e._owner;if(r!=null){if(r.ref!==void 0&&(z=r.ref,A=G.current),r.key!==void 0&&(x=""+r.key),e.type&&e.type.defaultProps)var L=e.type.defaultProps;for(N in r)W.call(r,N)&&!X.hasOwnProperty(N)&&(k[N]=r[N]===void 0&&L!==void 0?L[N]:r[N])}var N=arguments.length-2;if(N===1)k.children=m;else if(1<N){L=Array(N);for(var O=0;O<N;O++)L[O]=arguments[O+2];k.children=L}return{$$typeof:t,type:e.type,key:x,ref:z,props:k,_owner:A}},w.createContext=function(e){return e={$$typeof:f,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:u,_context:e},e.Consumer=e},w.createElement=B,w.createFactory=function(e){var r=B.bind(null,e);return r.type=e,r},w.createRef=function(){return{current:null}},w.forwardRef=function(e){return{$$typeof:p,render:e}},w.isValidElement=j,w.lazy=function(e){return{$$typeof:P,_payload:{_status:-1,_result:e},_init:a}},w.memo=function(e,r){return{$$typeof:S,type:e,compare:r===void 0?null:r}},w.startTransition=function(e){var r=i.transition;i.transition={};try{e()}finally{i.transition=r}},w.unstable_act=b,w.useCallback=function(e,r){return l.current.useCallback(e,r)},w.useContext=function(e){return l.current.useContext(e)},w.useDebugValue=function(){},w.useDeferredValue=function(e){return l.current.useDeferredValue(e)},w.useEffect=function(e,r){return l.current.useEffect(e,r)},w.useId=function(){return l.current.useId()},w.useImperativeHandle=function(e,r,m){return l.current.useImperativeHandle(e,r,m)},w.useInsertionEffect=function(e,r){return l.current.useInsertionEffect(e,r)},w.useLayoutEffect=function(e,r){return l.current.useLayoutEffect(e,r)},w.useMemo=function(e,r){return l.current.useMemo(e,r)},w.useReducer=function(e,r,m){return l.current.useReducer(e,r,m)},w.useRef=function(e){return l.current.useRef(e)},w.useState=function(e){return l.current.useState(e)},w.useSyncExternalStore=function(e,r,m){return l.current.useSyncExternalStore(e,r,m)},w.useTransition=function(){return l.current.useTransition()},w.version="18.3.1",w}var ye;function Se(){return ye||(ye=1,le.exports=Ce()),le.exports}var te=Se();const Cr=$e(te);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),be=(...t)=>t.filter((o,n,s)=>!!o&&o.trim()!==""&&s.indexOf(o)===n).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ze={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=te.forwardRef(({color:t="currentColor",size:o=24,strokeWidth:n=2,absoluteStrokeWidth:s,className:y="",children:u,iconNode:f,...p},$)=>te.createElement("svg",{ref:$,...ze,width:o,height:o,stroke:t,strokeWidth:s?Number(n)*24/Number(o):n,className:be("lucide",y),...p},[...f.map(([S,P])=>te.createElement(S,P)),...Array.isArray(u)?u:[u]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(t,o)=>{const n=te.forwardRef(({className:s,...y},u)=>te.createElement(Ae,{ref:u,iconNode:o,className:be(`lucide-${Ne(t)}`,s),...y}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]],Sr=d("Activity",Re);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],Nr=d("ArrowDown",je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],zr=d("ArrowLeft",Le);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],Ar=d("ArrowRight",Oe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],Rr=d("ArrowUp",Ee);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],jr=d("Award",Pe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],Lr=d("Bell",De);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m9 16 2 2 4-4",key:"19s6y9"}]],Or=d("CalendarCheck",qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M16 19h6",key:"xwg31i"}],["path",{d:"M19 16v6",key:"tddt3s"}]],Er=d("CalendarPlus",Te);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],Pr=d("Calendar",Ie);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Dr=d("Check",Ve);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],qr=d("ChevronLeft",He);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Tr=d("ChevronRight",Ge);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],Ir=d("CircleAlert",Ue);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],Vr=d("CircleCheckBig",We);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],Hr=d("CircleCheck",Ye);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]],Gr=d("CirclePlus",Fe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],Ur=d("CircleX",Be);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],Wr=d("Clock",Ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],Yr=d("Copy",Je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]],Fr=d("Cpu",Xe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]],Br=d("Crown",Ke);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14",key:"36qu9e"}],["path",{d:"M2 20h20",key:"owomy5"}],["path",{d:"M14 12v.01",key:"xfcn54"}]],Zr=d("DoorClosed",Qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],Jr=d("Download",et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],Xr=d("EyeOff",tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Kr=d("Eye",rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],Qr=d("FileText",ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]],eo=d("Flame",nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]],to=d("GraduationCap",st);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],ro=d("Info",at);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it=[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]],oo=d("KeyRound",it);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],no=d("LayoutDashboard",ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]],so=d("LayoutGrid",lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=[["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 18h.01",key:"1tta3j"}],["path",{d:"M3 6h.01",key:"1rqtza"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 18h13",key:"1lx6n3"}],["path",{d:"M8 6h13",key:"ik3vkj"}]],ao=d("List",dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],io=d("LoaderCircle",ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],co=d("Lock",pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]],lo=d("LogIn",ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]],uo=d("LogOut",yt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]],po=d("Mail",ft);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],ho=d("MapPin",gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=[["path",{d:"m3 11 18-5v12L3 14v-3z",key:"n962bs"}],["path",{d:"M11.6 16.8a3 3 0 1 1-5.8-1.6",key:"1yl0tm"}]],yo=d("Megaphone",mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]],fo=d("Music2",bt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=[["path",{d:"M9 18V5l12-2v13",key:"1jmyc2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["circle",{cx:"18",cy:"16",r:"3",key:"1hluhg"}]],go=d("Music",kt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]],mo=d("OctagonAlert",vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],bo=d("PenLine",xt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]],ko=d("Phone",wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],vo=d("Plus",_t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=[["path",{d:"M4.9 19.1C1 15.2 1 8.8 4.9 4.9",key:"1vaf9d"}],["path",{d:"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5",key:"u1ii0m"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5",key:"1j5fej"}],["path",{d:"M19.1 4.9C23 8.8 23 15.1 19.1 19",key:"10b0cb"}]],xo=d("Radio",Mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],wo=d("RefreshCw",$t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],_o=d("RotateCcw",Ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],Mo=d("RotateCw",St);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],$o=d("Save",Nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],Co=d("Search",zt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],So=d("Send",At);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],No=d("Settings",Rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],zo=d("ShieldCheck",jt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],Ao=d("Shield",Lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=[["line",{x1:"4",x2:"4",y1:"21",y2:"14",key:"1p332r"}],["line",{x1:"4",x2:"4",y1:"10",y2:"3",key:"gb41h5"}],["line",{x1:"12",x2:"12",y1:"21",y2:"12",key:"hf2csr"}],["line",{x1:"12",x2:"12",y1:"8",y2:"3",key:"1kfi7u"}],["line",{x1:"20",x2:"20",y1:"21",y2:"16",key:"1lhrwl"}],["line",{x1:"20",x2:"20",y1:"12",y2:"3",key:"16vvfq"}],["line",{x1:"2",x2:"6",y1:"14",y2:"14",key:"1uebub"}],["line",{x1:"10",x2:"14",y1:"8",y2:"8",key:"1yglbp"}],["line",{x1:"18",x2:"22",y1:"16",y2:"16",key:"1jxqpz"}]],Ro=d("SlidersVertical",Ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],jo=d("Sparkles",Et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],Lo=d("Trash2",Pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],Oo=d("TrendingUp",Dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Eo=d("TriangleAlert",qt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]],Po=d("UserCheck",Tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],Do=d("UserPlus",It);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],qo=d("User",Vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]],To=d("Users",Ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],Io=d("WifiOff",Gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]],Vo=d("Wifi",Ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Ho=d("X",Wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],Go=d("Zap",Yt);function ke(t){var o,n,s="";if(typeof t=="string"||typeof t=="number")s+=t;else if(typeof t=="object")if(Array.isArray(t)){var y=t.length;for(o=0;o<y;o++)t[o]&&(n=ke(t[o]))&&(s&&(s+=" "),s+=n)}else for(n in t)t[n]&&(s&&(s+=" "),s+=n);return s}function Uo(){for(var t,o,n=0,s="",y=arguments.length;n<y;n++)(t=arguments[n])&&(o=ke(t))&&(s&&(s+=" "),s+=o);return s}const pe="-",Ft=t=>{const o=Zt(t),{conflictingClassGroups:n,conflictingClassGroupModifiers:s}=t;return{getClassGroupId:f=>{const p=f.split(pe);return p[0]===""&&p.length!==1&&p.shift(),ve(p,o)||Bt(f)},getConflictingClassGroupIds:(f,p)=>{const $=n[f]||[];return p&&s[f]?[...$,...s[f]]:$}}},ve=(t,o)=>{var f;if(t.length===0)return o.classGroupId;const n=t[0],s=o.nextPart.get(n),y=s?ve(t.slice(1),s):void 0;if(y)return y;if(o.validators.length===0)return;const u=t.join(pe);return(f=o.validators.find(({validator:p})=>p(u)))==null?void 0:f.classGroupId},fe=/^\[(.+)\]$/,Bt=t=>{if(fe.test(t)){const o=fe.exec(t)[1],n=o==null?void 0:o.substring(0,o.indexOf(":"));if(n)return"arbitrary.."+n}},Zt=t=>{const{theme:o,prefix:n}=t,s={nextPart:new Map,validators:[]};return Xt(Object.entries(t.classGroups),n).forEach(([u,f])=>{ue(f,s,u,o)}),s},ue=(t,o,n,s)=>{t.forEach(y=>{if(typeof y=="string"){const u=y===""?o:ge(o,y);u.classGroupId=n;return}if(typeof y=="function"){if(Jt(y)){ue(y(s),o,n,s);return}o.validators.push({validator:y,classGroupId:n});return}Object.entries(y).forEach(([u,f])=>{ue(f,ge(o,u),n,s)})})},ge=(t,o)=>{let n=t;return o.split(pe).forEach(s=>{n.nextPart.has(s)||n.nextPart.set(s,{nextPart:new Map,validators:[]}),n=n.nextPart.get(s)}),n},Jt=t=>t.isThemeGetter,Xt=(t,o)=>o?t.map(([n,s])=>{const y=s.map(u=>typeof u=="string"?o+u:typeof u=="object"?Object.fromEntries(Object.entries(u).map(([f,p])=>[o+f,p])):u);return[n,y]}):t,Kt=t=>{if(t<1)return{get:()=>{},set:()=>{}};let o=0,n=new Map,s=new Map;const y=(u,f)=>{n.set(u,f),o++,o>t&&(o=0,s=n,n=new Map)};return{get(u){let f=n.get(u);if(f!==void 0)return f;if((f=s.get(u))!==void 0)return y(u,f),f},set(u,f){n.has(u)?n.set(u,f):y(u,f)}}},xe="!",Qt=t=>{const{separator:o,experimentalParseClassName:n}=t,s=o.length===1,y=o[0],u=o.length,f=p=>{const $=[];let S=0,P=0,R;for(let C=0;C<p.length;C++){let T=p[C];if(S===0){if(T===y&&(s||p.slice(C,C+u)===o)){$.push(p.slice(P,C)),P=C+u;continue}if(T==="/"){R=C;continue}}T==="["?S++:T==="]"&&S--}const H=$.length===0?p:p.substring(P),q=H.startsWith(xe),I=q?H.substring(1):H,D=R&&R>P?R-P:void 0;return{modifiers:$,hasImportantModifier:q,baseClassName:I,maybePostfixModifierPosition:D}};return n?p=>n({className:p,parseClassName:f}):f},er=t=>{if(t.length<=1)return t;const o=[];let n=[];return t.forEach(s=>{s[0]==="["?(o.push(...n.sort(),s),n=[]):n.push(s)}),o.push(...n.sort()),o},tr=t=>({cache:Kt(t.cacheSize),parseClassName:Qt(t),...Ft(t)}),rr=/\s+/,or=(t,o)=>{const{parseClassName:n,getClassGroupId:s,getConflictingClassGroupIds:y}=o,u=[],f=t.trim().split(rr);let p="";for(let $=f.length-1;$>=0;$-=1){const S=f[$],{modifiers:P,hasImportantModifier:R,baseClassName:H,maybePostfixModifierPosition:q}=n(S);let I=!!q,D=s(I?H.substring(0,q):H);if(!D){if(!I){p=S+(p.length>0?" "+p:p);continue}if(D=s(H),!D){p=S+(p.length>0?" "+p:p);continue}I=!1}const C=er(P).join(":"),T=R?C+xe:C,V=T+D;if(u.includes(V))continue;u.push(V);const U=y(D,I);for(let Y=0;Y<U.length;++Y){const W=U[Y];u.push(T+W)}p=S+(p.length>0?" "+p:p)}return p};function nr(){let t=0,o,n,s="";for(;t<arguments.length;)(o=arguments[t++])&&(n=we(o))&&(s&&(s+=" "),s+=n);return s}const we=t=>{if(typeof t=="string")return t;let o,n="";for(let s=0;s<t.length;s++)t[s]&&(o=we(t[s]))&&(n&&(n+=" "),n+=o);return n};function sr(t,...o){let n,s,y,u=f;function f($){const S=o.reduce((P,R)=>R(P),t());return n=tr(S),s=n.cache.get,y=n.cache.set,u=p,p($)}function p($){const S=s($);if(S)return S;const P=or($,n);return y($,P),P}return function(){return u(nr.apply(null,arguments))}}const E=t=>{const o=n=>n[t]||[];return o.isThemeGetter=!0,o},_e=/^\[(?:([a-z-]+):)?(.+)\]$/i,ar=/^\d+\/\d+$/,ir=new Set(["px","full","screen"]),cr=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,lr=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,dr=/^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,ur=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,pr=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,J=t=>re(t)||ir.has(t)||ar.test(t),Q=t=>oe(t,"length",vr),re=t=>!!t&&!Number.isNaN(Number(t)),de=t=>oe(t,"number",re),se=t=>!!t&&Number.isInteger(Number(t)),hr=t=>t.endsWith("%")&&re(t.slice(0,-1)),v=t=>_e.test(t),ee=t=>cr.test(t),yr=new Set(["length","size","percentage"]),fr=t=>oe(t,yr,Me),gr=t=>oe(t,"position",Me),mr=new Set(["image","url"]),br=t=>oe(t,mr,wr),kr=t=>oe(t,"",xr),ae=()=>!0,oe=(t,o,n)=>{const s=_e.exec(t);return s?s[1]?typeof o=="string"?s[1]===o:o.has(s[1]):n(s[2]):!1},vr=t=>lr.test(t)&&!dr.test(t),Me=()=>!1,xr=t=>ur.test(t),wr=t=>pr.test(t),_r=()=>{const t=E("colors"),o=E("spacing"),n=E("blur"),s=E("brightness"),y=E("borderColor"),u=E("borderRadius"),f=E("borderSpacing"),p=E("borderWidth"),$=E("contrast"),S=E("grayscale"),P=E("hueRotate"),R=E("invert"),H=E("gap"),q=E("gradientColorStops"),I=E("gradientColorStopPositions"),D=E("inset"),C=E("margin"),T=E("opacity"),V=E("padding"),U=E("saturate"),Y=E("scale"),W=E("sepia"),G=E("skew"),X=E("space"),B=E("translate"),F=()=>["auto","contain","none"],j=()=>["auto","hidden","clip","visible","scroll"],_=()=>["auto",v,o],M=()=>[v,o],Z=()=>["",J,Q],h=()=>["auto",re,v],c=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],a=()=>["solid","dashed","dotted","double","none"],l=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],i=()=>["start","end","center","between","around","evenly","stretch"],g=()=>["","0",v],b=()=>["auto","avoid","all","avoid-page","page","left","right","column"],e=()=>[re,v];return{cacheSize:500,separator:":",theme:{colors:[ae],spacing:[J,Q],blur:["none","",ee,v],brightness:e(),borderColor:[t],borderRadius:["none","","full",ee,v],borderSpacing:M(),borderWidth:Z(),contrast:e(),grayscale:g(),hueRotate:e(),invert:g(),gap:M(),gradientColorStops:[t],gradientColorStopPositions:[hr,Q],inset:_(),margin:_(),opacity:e(),padding:M(),saturate:e(),scale:e(),sepia:g(),skew:e(),space:M(),translate:M()},classGroups:{aspect:[{aspect:["auto","square","video",v]}],container:["container"],columns:[{columns:[ee]}],"break-after":[{"break-after":b()}],"break-before":[{"break-before":b()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...c(),v]}],overflow:[{overflow:j()}],"overflow-x":[{"overflow-x":j()}],"overflow-y":[{"overflow-y":j()}],overscroll:[{overscroll:F()}],"overscroll-x":[{"overscroll-x":F()}],"overscroll-y":[{"overscroll-y":F()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[D]}],"inset-x":[{"inset-x":[D]}],"inset-y":[{"inset-y":[D]}],start:[{start:[D]}],end:[{end:[D]}],top:[{top:[D]}],right:[{right:[D]}],bottom:[{bottom:[D]}],left:[{left:[D]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",se,v]}],basis:[{basis:_()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",v]}],grow:[{grow:g()}],shrink:[{shrink:g()}],order:[{order:["first","last","none",se,v]}],"grid-cols":[{"grid-cols":[ae]}],"col-start-end":[{col:["auto",{span:["full",se,v]},v]}],"col-start":[{"col-start":h()}],"col-end":[{"col-end":h()}],"grid-rows":[{"grid-rows":[ae]}],"row-start-end":[{row:["auto",{span:[se,v]},v]}],"row-start":[{"row-start":h()}],"row-end":[{"row-end":h()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",v]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",v]}],gap:[{gap:[H]}],"gap-x":[{"gap-x":[H]}],"gap-y":[{"gap-y":[H]}],"justify-content":[{justify:["normal",...i()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...i(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...i(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[V]}],px:[{px:[V]}],py:[{py:[V]}],ps:[{ps:[V]}],pe:[{pe:[V]}],pt:[{pt:[V]}],pr:[{pr:[V]}],pb:[{pb:[V]}],pl:[{pl:[V]}],m:[{m:[C]}],mx:[{mx:[C]}],my:[{my:[C]}],ms:[{ms:[C]}],me:[{me:[C]}],mt:[{mt:[C]}],mr:[{mr:[C]}],mb:[{mb:[C]}],ml:[{ml:[C]}],"space-x":[{"space-x":[X]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[X]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",v,o]}],"min-w":[{"min-w":[v,o,"min","max","fit"]}],"max-w":[{"max-w":[v,o,"none","full","min","max","fit","prose",{screen:[ee]},ee]}],h:[{h:[v,o,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[v,o,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[v,o,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[v,o,"auto","min","max","fit"]}],"font-size":[{text:["base",ee,Q]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",de]}],"font-family":[{font:[ae]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",v]}],"line-clamp":[{"line-clamp":["none",re,de]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",J,v]}],"list-image":[{"list-image":["none",v]}],"list-style-type":[{list:["none","disc","decimal",v]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[t]}],"placeholder-opacity":[{"placeholder-opacity":[T]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[t]}],"text-opacity":[{"text-opacity":[T]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...a(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",J,Q]}],"underline-offset":[{"underline-offset":["auto",J,v]}],"text-decoration-color":[{decoration:[t]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:M()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",v]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",v]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[T]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...c(),gr]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",fr]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},br]}],"bg-color":[{bg:[t]}],"gradient-from-pos":[{from:[I]}],"gradient-via-pos":[{via:[I]}],"gradient-to-pos":[{to:[I]}],"gradient-from":[{from:[q]}],"gradient-via":[{via:[q]}],"gradient-to":[{to:[q]}],rounded:[{rounded:[u]}],"rounded-s":[{"rounded-s":[u]}],"rounded-e":[{"rounded-e":[u]}],"rounded-t":[{"rounded-t":[u]}],"rounded-r":[{"rounded-r":[u]}],"rounded-b":[{"rounded-b":[u]}],"rounded-l":[{"rounded-l":[u]}],"rounded-ss":[{"rounded-ss":[u]}],"rounded-se":[{"rounded-se":[u]}],"rounded-ee":[{"rounded-ee":[u]}],"rounded-es":[{"rounded-es":[u]}],"rounded-tl":[{"rounded-tl":[u]}],"rounded-tr":[{"rounded-tr":[u]}],"rounded-br":[{"rounded-br":[u]}],"rounded-bl":[{"rounded-bl":[u]}],"border-w":[{border:[p]}],"border-w-x":[{"border-x":[p]}],"border-w-y":[{"border-y":[p]}],"border-w-s":[{"border-s":[p]}],"border-w-e":[{"border-e":[p]}],"border-w-t":[{"border-t":[p]}],"border-w-r":[{"border-r":[p]}],"border-w-b":[{"border-b":[p]}],"border-w-l":[{"border-l":[p]}],"border-opacity":[{"border-opacity":[T]}],"border-style":[{border:[...a(),"hidden"]}],"divide-x":[{"divide-x":[p]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[p]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[T]}],"divide-style":[{divide:a()}],"border-color":[{border:[y]}],"border-color-x":[{"border-x":[y]}],"border-color-y":[{"border-y":[y]}],"border-color-s":[{"border-s":[y]}],"border-color-e":[{"border-e":[y]}],"border-color-t":[{"border-t":[y]}],"border-color-r":[{"border-r":[y]}],"border-color-b":[{"border-b":[y]}],"border-color-l":[{"border-l":[y]}],"divide-color":[{divide:[y]}],"outline-style":[{outline:["",...a()]}],"outline-offset":[{"outline-offset":[J,v]}],"outline-w":[{outline:[J,Q]}],"outline-color":[{outline:[t]}],"ring-w":[{ring:Z()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[t]}],"ring-opacity":[{"ring-opacity":[T]}],"ring-offset-w":[{"ring-offset":[J,Q]}],"ring-offset-color":[{"ring-offset":[t]}],shadow:[{shadow:["","inner","none",ee,kr]}],"shadow-color":[{shadow:[ae]}],opacity:[{opacity:[T]}],"mix-blend":[{"mix-blend":[...l(),"plus-lighter","plus-darker"]}],"bg-blend":[{"bg-blend":l()}],filter:[{filter:["","none"]}],blur:[{blur:[n]}],brightness:[{brightness:[s]}],contrast:[{contrast:[$]}],"drop-shadow":[{"drop-shadow":["","none",ee,v]}],grayscale:[{grayscale:[S]}],"hue-rotate":[{"hue-rotate":[P]}],invert:[{invert:[R]}],saturate:[{saturate:[U]}],sepia:[{sepia:[W]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[n]}],"backdrop-brightness":[{"backdrop-brightness":[s]}],"backdrop-contrast":[{"backdrop-contrast":[$]}],"backdrop-grayscale":[{"backdrop-grayscale":[S]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[P]}],"backdrop-invert":[{"backdrop-invert":[R]}],"backdrop-opacity":[{"backdrop-opacity":[T]}],"backdrop-saturate":[{"backdrop-saturate":[U]}],"backdrop-sepia":[{"backdrop-sepia":[W]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[f]}],"border-spacing-x":[{"border-spacing-x":[f]}],"border-spacing-y":[{"border-spacing-y":[f]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",v]}],duration:[{duration:e()}],ease:[{ease:["linear","in","out","in-out",v]}],delay:[{delay:e()}],animate:[{animate:["none","spin","ping","pulse","bounce",v]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[Y]}],"scale-x":[{"scale-x":[Y]}],"scale-y":[{"scale-y":[Y]}],rotate:[{rotate:[se,v]}],"translate-x":[{"translate-x":[B]}],"translate-y":[{"translate-y":[B]}],"skew-x":[{"skew-x":[G]}],"skew-y":[{"skew-y":[G]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",v]}],accent:[{accent:["auto",t]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",v]}],"caret-color":[{caret:[t]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":M()}],"scroll-mx":[{"scroll-mx":M()}],"scroll-my":[{"scroll-my":M()}],"scroll-ms":[{"scroll-ms":M()}],"scroll-me":[{"scroll-me":M()}],"scroll-mt":[{"scroll-mt":M()}],"scroll-mr":[{"scroll-mr":M()}],"scroll-mb":[{"scroll-mb":M()}],"scroll-ml":[{"scroll-ml":M()}],"scroll-p":[{"scroll-p":M()}],"scroll-px":[{"scroll-px":M()}],"scroll-py":[{"scroll-py":M()}],"scroll-ps":[{"scroll-ps":M()}],"scroll-pe":[{"scroll-pe":M()}],"scroll-pt":[{"scroll-pt":M()}],"scroll-pr":[{"scroll-pr":M()}],"scroll-pb":[{"scroll-pb":M()}],"scroll-pl":[{"scroll-pl":M()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",v]}],fill:[{fill:[t,"none"]}],"stroke-w":[{stroke:[J,Q,de]}],stroke:[{stroke:[t,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}},Wo=sr(_r);var ce={exports:{}},Mr=ce.exports,me;function Yo(){return me||(me=1,(function(t,o){(function(n,s){t.exports=s()})(Mr,(function(){var n=1e3,s=6e4,y=36e5,u="millisecond",f="second",p="minute",$="hour",S="day",P="week",R="month",H="quarter",q="year",I="date",D="Invalid Date",C=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,T=/\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,V={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(h){var c=["th","st","nd","rd"],a=h%100;return"["+h+(c[(a-20)%10]||c[a]||c[0])+"]"}},U=function(h,c,a){var l=String(h);return!l||l.length>=c?h:""+Array(c+1-l.length).join(a)+h},Y={s:U,z:function(h){var c=-h.utcOffset(),a=Math.abs(c),l=Math.floor(a/60),i=a%60;return(c<=0?"+":"-")+U(l,2,"0")+":"+U(i,2,"0")},m:function h(c,a){if(c.date()<a.date())return-h(a,c);var l=12*(a.year()-c.year())+(a.month()-c.month()),i=c.clone().add(l,R),g=a-i<0,b=c.clone().add(l+(g?-1:1),R);return+(-(l+(a-i)/(g?i-b:b-i))||0)},a:function(h){return h<0?Math.ceil(h)||0:Math.floor(h)},p:function(h){return{M:R,y:q,w:P,d:S,D:I,h:$,m:p,s:f,ms:u,Q:H}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(h){return h===void 0}},W="en",G={};G[W]=V;var X="$isDayjsObject",B=function(h){return h instanceof M||!(!h||!h[X])},F=function h(c,a,l){var i;if(!c)return W;if(typeof c=="string"){var g=c.toLowerCase();G[g]&&(i=g),a&&(G[g]=a,i=g);var b=c.split("-");if(!i&&b.length>1)return h(b[0])}else{var e=c.name;G[e]=c,i=e}return!l&&i&&(W=i),i||!l&&W},j=function(h,c){if(B(h))return h.clone();var a=typeof c=="object"?c:{};return a.date=h,a.args=arguments,new M(a)},_=Y;_.l=F,_.i=B,_.w=function(h,c){return j(h,{locale:c.$L,utc:c.$u,x:c.$x,$offset:c.$offset})};var M=(function(){function h(a){this.$L=F(a.locale,null,!0),this.parse(a),this.$x=this.$x||a.x||{},this[X]=!0}var c=h.prototype;return c.parse=function(a){this.$d=(function(l){var i=l.date,g=l.utc;if(i===null)return new Date(NaN);if(_.u(i))return new Date;if(i instanceof Date)return new Date(i);if(typeof i=="string"&&!/Z$/i.test(i)){var b=i.match(C);if(b){var e=b[2]-1||0,r=(b[7]||"0").substring(0,3);return g?new Date(Date.UTC(b[1],e,b[3]||1,b[4]||0,b[5]||0,b[6]||0,r)):new Date(b[1],e,b[3]||1,b[4]||0,b[5]||0,b[6]||0,r)}}return new Date(i)})(a),this.init()},c.init=function(){var a=this.$d;this.$y=a.getFullYear(),this.$M=a.getMonth(),this.$D=a.getDate(),this.$W=a.getDay(),this.$H=a.getHours(),this.$m=a.getMinutes(),this.$s=a.getSeconds(),this.$ms=a.getMilliseconds()},c.$utils=function(){return _},c.isValid=function(){return this.$d.toString()!==D},c.isSame=function(a,l){var i=j(a);return this.startOf(l)<=i&&i<=this.endOf(l)},c.isAfter=function(a,l){return j(a)<this.startOf(l)},c.isBefore=function(a,l){return this.endOf(l)<j(a)},c.$g=function(a,l,i){return _.u(a)?this[l]:this.set(i,a)},c.unix=function(){return Math.floor(this.valueOf()/1e3)},c.valueOf=function(){return this.$d.getTime()},c.startOf=function(a,l){var i=this,g=!!_.u(l)||l,b=_.p(a),e=function(N,O){var K=_.w(i.$u?Date.UTC(i.$y,O,N):new Date(i.$y,O,N),i);return g?K:K.endOf(S)},r=function(N,O){return _.w(i.toDate()[N].apply(i.toDate("s"),(g?[0,0,0,0]:[23,59,59,999]).slice(O)),i)},m=this.$W,k=this.$M,x=this.$D,z="set"+(this.$u?"UTC":"");switch(b){case q:return g?e(1,0):e(31,11);case R:return g?e(1,k):e(0,k+1);case P:var A=this.$locale().weekStart||0,L=(m<A?m+7:m)-A;return e(g?x-L:x+(6-L),k);case S:case I:return r(z+"Hours",0);case $:return r(z+"Minutes",1);case p:return r(z+"Seconds",2);case f:return r(z+"Milliseconds",3);default:return this.clone()}},c.endOf=function(a){return this.startOf(a,!1)},c.$set=function(a,l){var i,g=_.p(a),b="set"+(this.$u?"UTC":""),e=(i={},i[S]=b+"Date",i[I]=b+"Date",i[R]=b+"Month",i[q]=b+"FullYear",i[$]=b+"Hours",i[p]=b+"Minutes",i[f]=b+"Seconds",i[u]=b+"Milliseconds",i)[g],r=g===S?this.$D+(l-this.$W):l;if(g===R||g===q){var m=this.clone().set(I,1);m.$d[e](r),m.init(),this.$d=m.set(I,Math.min(this.$D,m.daysInMonth())).$d}else e&&this.$d[e](r);return this.init(),this},c.set=function(a,l){return this.clone().$set(a,l)},c.get=function(a){return this[_.p(a)]()},c.add=function(a,l){var i,g=this;a=Number(a);var b=_.p(l),e=function(k){var x=j(g);return _.w(x.date(x.date()+Math.round(k*a)),g)};if(b===R)return this.set(R,this.$M+a);if(b===q)return this.set(q,this.$y+a);if(b===S)return e(1);if(b===P)return e(7);var r=(i={},i[p]=s,i[$]=y,i[f]=n,i)[b]||1,m=this.$d.getTime()+a*r;return _.w(m,this)},c.subtract=function(a,l){return this.add(-1*a,l)},c.format=function(a){var l=this,i=this.$locale();if(!this.isValid())return i.invalidDate||D;var g=a||"YYYY-MM-DDTHH:mm:ssZ",b=_.z(this),e=this.$H,r=this.$m,m=this.$M,k=i.weekdays,x=i.months,z=i.meridiem,A=function(O,K,ne,ie){return O&&(O[K]||O(l,g))||ne[K].slice(0,ie)},L=function(O){return _.s(e%12||12,O,"0")},N=z||function(O,K,ne){var ie=O<12?"AM":"PM";return ne?ie.toLowerCase():ie};return g.replace(T,(function(O,K){return K||(function(ne){switch(ne){case"YY":return String(l.$y).slice(-2);case"YYYY":return _.s(l.$y,4,"0");case"M":return m+1;case"MM":return _.s(m+1,2,"0");case"MMM":return A(i.monthsShort,m,x,3);case"MMMM":return A(x,m);case"D":return l.$D;case"DD":return _.s(l.$D,2,"0");case"d":return String(l.$W);case"dd":return A(i.weekdaysMin,l.$W,k,2);case"ddd":return A(i.weekdaysShort,l.$W,k,3);case"dddd":return k[l.$W];case"H":return String(e);case"HH":return _.s(e,2,"0");case"h":return L(1);case"hh":return L(2);case"a":return N(e,r,!0);case"A":return N(e,r,!1);case"m":return String(r);case"mm":return _.s(r,2,"0");case"s":return String(l.$s);case"ss":return _.s(l.$s,2,"0");case"SSS":return _.s(l.$ms,3,"0");case"Z":return b}return null})(O)||b.replace(":","")}))},c.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},c.diff=function(a,l,i){var g,b=this,e=_.p(l),r=j(a),m=(r.utcOffset()-this.utcOffset())*s,k=this-r,x=function(){return _.m(b,r)};switch(e){case q:g=x()/12;break;case R:g=x();break;case H:g=x()/3;break;case P:g=(k-m)/6048e5;break;case S:g=(k-m)/864e5;break;case $:g=k/y;break;case p:g=k/s;break;case f:g=k/n;break;default:g=k}return i?g:_.a(g)},c.daysInMonth=function(){return this.endOf(R).$D},c.$locale=function(){return G[this.$L]},c.locale=function(a,l){if(!a)return this.$L;var i=this.clone(),g=F(a,l,!0);return g&&(i.$L=g),i},c.clone=function(){return _.w(this.$d,this)},c.toDate=function(){return new Date(this.valueOf())},c.toJSON=function(){return this.isValid()?this.toISOString():null},c.toISOString=function(){return this.$d.toISOString()},c.toString=function(){return this.$d.toUTCString()},h})(),Z=M.prototype;return j.prototype=Z,[["$ms",u],["$s",f],["$m",p],["$H",$],["$W",S],["$M",R],["$y",q],["$D",I]].forEach((function(h){Z[h[1]]=function(c){return this.$g(c,h[0],h[1])}})),j.extend=function(h,c){return h.$i||(h(c,M,j),h.$i=!0),j},j.locale=F,j.isDayjs=B,j.unix=function(h){return j(1e3*h)},j.en=G[W],j.Ls=G,j.p={},j}))})(ce)),ce.exports}export{Lr as $,Ar as A,Sr as B,Wr as C,po as D,No as E,eo as F,to as G,Qr as H,ro as I,Ir as J,oo as K,io as L,yo as M,Co as N,mo as O,ko as P,Jr as Q,Cr as R,jo as S,Oo as T,To as U,Vr as V,Ur as W,Ho as X,Kr as Y,So as Z,Do as _,te as a,Lo as a0,_o as a1,$o as a2,vo as a3,Dr as a4,Rr as a5,Nr as a6,bo as a7,Ro as a8,qo as a9,Fr as aa,Ao as ab,Eo as ac,wo as ad,zr as ae,no as af,Go as ag,Yr as ah,ho as ai,Zr as aj,co as ak,Xr as al,Io as am,Vo as an,Uo as b,$r as c,Yo as d,Er as e,lo as f,$e as g,uo as h,Pr as i,qr as j,Tr as k,fo as l,so as m,ao as n,Gr as o,Or as p,xo as q,Se as r,go as s,Wo as t,zo as u,Mo as v,jr as w,Hr as x,Po as y,Br as z};
