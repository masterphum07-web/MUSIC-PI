var zr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function $e(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var le={exports:{}},w={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var he;function Ce(){if(he)return w;he=1;var t=Symbol.for("react.element"),o=Symbol.for("react.portal"),n=Symbol.for("react.fragment"),a=Symbol.for("react.strict_mode"),y=Symbol.for("react.profiler"),u=Symbol.for("react.provider"),f=Symbol.for("react.context"),p=Symbol.for("react.forward_ref"),$=Symbol.for("react.suspense"),S=Symbol.for("react.memo"),q=Symbol.for("react.lazy"),j=Symbol.iterator;function H(e){return e===null||typeof e!="object"?null:(e=j&&e[j]||e["@@iterator"],typeof e=="function"?e:null)}var D={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},I=Object.assign,P={};function C(e,r,m){this.props=e,this.context=r,this.refs=P,this.updater=m||D}C.prototype.isReactComponent={},C.prototype.setState=function(e,r){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,r,"setState")},C.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function T(){}T.prototype=C.prototype;function V(e,r,m){this.props=e,this.context=r,this.refs=P,this.updater=m||D}var U=V.prototype=new T;U.constructor=V,I(U,C.prototype),U.isPureReactComponent=!0;var Y=Array.isArray,W=Object.prototype.hasOwnProperty,G={current:null},X={key:!0,ref:!0,__self:!0,__source:!0};function B(e,r,m){var k,x={},z=null,A=null;if(r!=null)for(k in r.ref!==void 0&&(A=r.ref),r.key!==void 0&&(z=""+r.key),r)W.call(r,k)&&!X.hasOwnProperty(k)&&(x[k]=r[k]);var R=arguments.length-2;if(R===1)x.children=m;else if(1<R){for(var N=Array(R),O=0;O<R;O++)N[O]=arguments[O+2];x.children=N}if(e&&e.defaultProps)for(k in R=e.defaultProps,R)x[k]===void 0&&(x[k]=R[k]);return{$$typeof:t,type:e,key:z,ref:A,props:x,_owner:G.current}}function F(e,r){return{$$typeof:t,type:e.type,key:r,ref:e.ref,props:e.props,_owner:e._owner}}function L(e){return typeof e=="object"&&e!==null&&e.$$typeof===t}function _(e){var r={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(m){return r[m]})}var M=/\/+/g;function Z(e,r){return typeof e=="object"&&e!==null&&e.key!=null?_(""+e.key):r.toString(36)}function h(e,r,m,k,x){var z=typeof e;(z==="undefined"||z==="boolean")&&(e=null);var A=!1;if(e===null)A=!0;else switch(z){case"string":case"number":A=!0;break;case"object":switch(e.$$typeof){case t:case o:A=!0}}if(A)return A=e,x=x(A),e=k===""?"."+Z(A,0):k,Y(x)?(m="",e!=null&&(m=e.replace(M,"$&/")+"/"),h(x,r,m,"",function(O){return O})):x!=null&&(L(x)&&(x=F(x,m+(!x.key||A&&A.key===x.key?"":(""+x.key).replace(M,"$&/")+"/")+e)),r.push(x)),1;if(A=0,k=k===""?".":k+":",Y(e))for(var R=0;R<e.length;R++){z=e[R];var N=k+Z(z,R);A+=h(z,r,m,N,x)}else if(N=H(e),typeof N=="function")for(e=N.call(e),R=0;!(z=e.next()).done;)z=z.value,N=k+Z(z,R++),A+=h(z,r,m,N,x);else if(z==="object")throw r=String(e),Error("Objects are not valid as a React child (found: "+(r==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":r)+"). If you meant to render a collection of children, use an array instead.");return A}function l(e,r,m){if(e==null)return e;var k=[],x=0;return h(e,k,"","",function(z){return r.call(m,z,x++)}),k}function s(e){if(e._status===-1){var r=e._result;r=r(),r.then(function(m){(e._status===0||e._status===-1)&&(e._status=1,e._result=m)},function(m){(e._status===0||e._status===-1)&&(e._status=2,e._result=m)}),e._status===-1&&(e._status=0,e._result=r)}if(e._status===1)return e._result.default;throw e._result}var d={current:null},i={transition:null},g={ReactCurrentDispatcher:d,ReactCurrentBatchConfig:i,ReactCurrentOwner:G};function b(){throw Error("act(...) is not supported in production builds of React.")}return w.Children={map:l,forEach:function(e,r,m){l(e,function(){r.apply(this,arguments)},m)},count:function(e){var r=0;return l(e,function(){r++}),r},toArray:function(e){return l(e,function(r){return r})||[]},only:function(e){if(!L(e))throw Error("React.Children.only expected to receive a single React element child.");return e}},w.Component=C,w.Fragment=n,w.Profiler=y,w.PureComponent=V,w.StrictMode=a,w.Suspense=$,w.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=g,w.act=b,w.cloneElement=function(e,r,m){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var k=I({},e.props),x=e.key,z=e.ref,A=e._owner;if(r!=null){if(r.ref!==void 0&&(z=r.ref,A=G.current),r.key!==void 0&&(x=""+r.key),e.type&&e.type.defaultProps)var R=e.type.defaultProps;for(N in r)W.call(r,N)&&!X.hasOwnProperty(N)&&(k[N]=r[N]===void 0&&R!==void 0?R[N]:r[N])}var N=arguments.length-2;if(N===1)k.children=m;else if(1<N){R=Array(N);for(var O=0;O<N;O++)R[O]=arguments[O+2];k.children=R}return{$$typeof:t,type:e.type,key:x,ref:z,props:k,_owner:A}},w.createContext=function(e){return e={$$typeof:f,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:u,_context:e},e.Consumer=e},w.createElement=B,w.createFactory=function(e){var r=B.bind(null,e);return r.type=e,r},w.createRef=function(){return{current:null}},w.forwardRef=function(e){return{$$typeof:p,render:e}},w.isValidElement=L,w.lazy=function(e){return{$$typeof:q,_payload:{_status:-1,_result:e},_init:s}},w.memo=function(e,r){return{$$typeof:S,type:e,compare:r===void 0?null:r}},w.startTransition=function(e){var r=i.transition;i.transition={};try{e()}finally{i.transition=r}},w.unstable_act=b,w.useCallback=function(e,r){return d.current.useCallback(e,r)},w.useContext=function(e){return d.current.useContext(e)},w.useDebugValue=function(){},w.useDeferredValue=function(e){return d.current.useDeferredValue(e)},w.useEffect=function(e,r){return d.current.useEffect(e,r)},w.useId=function(){return d.current.useId()},w.useImperativeHandle=function(e,r,m){return d.current.useImperativeHandle(e,r,m)},w.useInsertionEffect=function(e,r){return d.current.useInsertionEffect(e,r)},w.useLayoutEffect=function(e,r){return d.current.useLayoutEffect(e,r)},w.useMemo=function(e,r){return d.current.useMemo(e,r)},w.useReducer=function(e,r,m){return d.current.useReducer(e,r,m)},w.useRef=function(e){return d.current.useRef(e)},w.useState=function(e){return d.current.useState(e)},w.useSyncExternalStore=function(e,r,m){return d.current.useSyncExternalStore(e,r,m)},w.useTransition=function(){return d.current.useTransition()},w.version="18.3.1",w}var ye;function Se(){return ye||(ye=1,le.exports=Ce()),le.exports}var te=Se();const Ar=$e(te);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),be=(...t)=>t.filter((o,n,a)=>!!o&&o.trim()!==""&&a.indexOf(o)===n).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ze={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=te.forwardRef(({color:t="currentColor",size:o=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:y="",children:u,iconNode:f,...p},$)=>te.createElement("svg",{ref:$,...ze,width:o,height:o,stroke:t,strokeWidth:a?Number(n)*24/Number(o):n,className:be("lucide",y),...p},[...f.map(([S,q])=>te.createElement(S,q)),...Array.isArray(u)?u:[u]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=(t,o)=>{const n=te.forwardRef(({className:a,...y},u)=>te.createElement(Ae,{ref:u,iconNode:o,className:be(`lucide-${Ne(t)}`,a),...y}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]],jr=c("Activity",je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M17 18H3",key:"1amg6g"}],["path",{d:"M21 6H3",key:"1jwq7v"}]],Lr=c("AlignLeft",Le);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],Rr=c("ArrowDown",Re);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],Or=c("ArrowLeft",Oe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],Er=c("ArrowRight",Ee);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],qr=c("ArrowUp",qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],Pr=c("Award",Pe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],Dr=c("Bell",De);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m9 16 2 2 4-4",key:"19s6y9"}]],Tr=c("CalendarCheck",Te);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M16 19h6",key:"xwg31i"}],["path",{d:"M19 16v6",key:"tddt3s"}]],Ir=c("CalendarPlus",Ie);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],Vr=c("Calendar",Ve);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Hr=c("Check",He);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Gr=c("ChevronLeft",Ge);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Ur=c("ChevronRight",Ue);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],Wr=c("CircleAlert",We);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],Yr=c("CircleCheckBig",Ye);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],Fr=c("CircleCheck",Fe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]],Br=c("CirclePlus",Be);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],Zr=c("CircleX",Ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],Jr=c("Clock",Je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],Xr=c("Copy",Xe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]],Kr=c("Cpu",Ke);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]],Qr=c("Crown",Qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["path",{d:"M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14",key:"36qu9e"}],["path",{d:"M2 20h20",key:"owomy5"}],["path",{d:"M14 12v.01",key:"xfcn54"}]],eo=c("DoorClosed",et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],to=c("Download",tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],ro=c("ExternalLink",rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],oo=c("EyeOff",ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],no=c("Eye",nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],ao=c("FileText",at);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]],so=c("Flame",st);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it=[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]],io=c("GraduationCap",it);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],co=c("Info",ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]],lo=c("KeyRound",lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],uo=c("LayoutDashboard",dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]],po=c("LayoutGrid",ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 18h.01",key:"1tta3j"}],["path",{d:"M3 6h.01",key:"1rqtza"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 18h13",key:"1lx6n3"}],["path",{d:"M8 6h13",key:"ik3vkj"}]],ho=c("List",pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],yo=c("LoaderCircle",ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],fo=c("Lock",yt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]],go=c("LogIn",ft);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]],mo=c("LogOut",gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]],bo=c("Mail",mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],ko=c("MapPin",bt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=[["path",{d:"m3 11 18-5v12L3 14v-3z",key:"n962bs"}],["path",{d:"M11.6 16.8a3 3 0 1 1-5.8-1.6",key:"1yl0tm"}]],vo=c("Megaphone",kt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]],xo=c("Music2",vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=[["path",{d:"M9 18V5l12-2v13",key:"1jmyc2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["circle",{cx:"18",cy:"16",r:"3",key:"1hluhg"}]],wo=c("Music",xt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]],_o=c("OctagonAlert",wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],Mo=c("PenLine",_t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]],$o=c("Phone",Mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Co=c("Plus",$t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],So=c("Printer",Ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]],No=c("QrCode",St);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=[["path",{d:"M4.9 19.1C1 15.2 1 8.8 4.9 4.9",key:"1vaf9d"}],["path",{d:"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5",key:"u1ii0m"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5",key:"1j5fej"}],["path",{d:"M19.1 4.9C23 8.8 23 15.1 19.1 19",key:"10b0cb"}]],zo=c("Radio",Nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],Ao=c("RefreshCw",zt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],jo=c("RotateCcw",At);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],Lo=c("RotateCw",jt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],Ro=c("Save",Lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],Oo=c("Search",Rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],Eo=c("Send",Ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],qo=c("Settings",Et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],Po=c("ShieldCheck",qt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],Do=c("Shield",Pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=[["line",{x1:"4",x2:"4",y1:"21",y2:"14",key:"1p332r"}],["line",{x1:"4",x2:"4",y1:"10",y2:"3",key:"gb41h5"}],["line",{x1:"12",x2:"12",y1:"21",y2:"12",key:"hf2csr"}],["line",{x1:"12",x2:"12",y1:"8",y2:"3",key:"1kfi7u"}],["line",{x1:"20",x2:"20",y1:"21",y2:"16",key:"1lhrwl"}],["line",{x1:"20",x2:"20",y1:"12",y2:"3",key:"16vvfq"}],["line",{x1:"2",x2:"6",y1:"14",y2:"14",key:"1uebub"}],["line",{x1:"10",x2:"14",y1:"8",y2:"8",key:"1yglbp"}],["line",{x1:"18",x2:"22",y1:"16",y2:"16",key:"1jxqpz"}]],To=c("SlidersVertical",Dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],Io=c("Sparkles",Tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],Vo=c("Trash2",It);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],Ho=c("TrendingUp",Vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Go=c("TriangleAlert",Ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]],Uo=c("UserCheck",Gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],Wo=c("UserPlus",Ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],Yo=c("User",Wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]],Fo=c("Users",Yt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],Bo=c("WifiOff",Ft);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]],Zo=c("Wifi",Bt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Jo=c("X",Zt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],Xo=c("Zap",Jt);function ke(t){var o,n,a="";if(typeof t=="string"||typeof t=="number")a+=t;else if(typeof t=="object")if(Array.isArray(t)){var y=t.length;for(o=0;o<y;o++)t[o]&&(n=ke(t[o]))&&(a&&(a+=" "),a+=n)}else for(n in t)t[n]&&(a&&(a+=" "),a+=n);return a}function Ko(){for(var t,o,n=0,a="",y=arguments.length;n<y;n++)(t=arguments[n])&&(o=ke(t))&&(a&&(a+=" "),a+=o);return a}const pe="-",Xt=t=>{const o=Qt(t),{conflictingClassGroups:n,conflictingClassGroupModifiers:a}=t;return{getClassGroupId:f=>{const p=f.split(pe);return p[0]===""&&p.length!==1&&p.shift(),ve(p,o)||Kt(f)},getConflictingClassGroupIds:(f,p)=>{const $=n[f]||[];return p&&a[f]?[...$,...a[f]]:$}}},ve=(t,o)=>{var f;if(t.length===0)return o.classGroupId;const n=t[0],a=o.nextPart.get(n),y=a?ve(t.slice(1),a):void 0;if(y)return y;if(o.validators.length===0)return;const u=t.join(pe);return(f=o.validators.find(({validator:p})=>p(u)))==null?void 0:f.classGroupId},fe=/^\[(.+)\]$/,Kt=t=>{if(fe.test(t)){const o=fe.exec(t)[1],n=o==null?void 0:o.substring(0,o.indexOf(":"));if(n)return"arbitrary.."+n}},Qt=t=>{const{theme:o,prefix:n}=t,a={nextPart:new Map,validators:[]};return tr(Object.entries(t.classGroups),n).forEach(([u,f])=>{ue(f,a,u,o)}),a},ue=(t,o,n,a)=>{t.forEach(y=>{if(typeof y=="string"){const u=y===""?o:ge(o,y);u.classGroupId=n;return}if(typeof y=="function"){if(er(y)){ue(y(a),o,n,a);return}o.validators.push({validator:y,classGroupId:n});return}Object.entries(y).forEach(([u,f])=>{ue(f,ge(o,u),n,a)})})},ge=(t,o)=>{let n=t;return o.split(pe).forEach(a=>{n.nextPart.has(a)||n.nextPart.set(a,{nextPart:new Map,validators:[]}),n=n.nextPart.get(a)}),n},er=t=>t.isThemeGetter,tr=(t,o)=>o?t.map(([n,a])=>{const y=a.map(u=>typeof u=="string"?o+u:typeof u=="object"?Object.fromEntries(Object.entries(u).map(([f,p])=>[o+f,p])):u);return[n,y]}):t,rr=t=>{if(t<1)return{get:()=>{},set:()=>{}};let o=0,n=new Map,a=new Map;const y=(u,f)=>{n.set(u,f),o++,o>t&&(o=0,a=n,n=new Map)};return{get(u){let f=n.get(u);if(f!==void 0)return f;if((f=a.get(u))!==void 0)return y(u,f),f},set(u,f){n.has(u)?n.set(u,f):y(u,f)}}},xe="!",or=t=>{const{separator:o,experimentalParseClassName:n}=t,a=o.length===1,y=o[0],u=o.length,f=p=>{const $=[];let S=0,q=0,j;for(let C=0;C<p.length;C++){let T=p[C];if(S===0){if(T===y&&(a||p.slice(C,C+u)===o)){$.push(p.slice(q,C)),q=C+u;continue}if(T==="/"){j=C;continue}}T==="["?S++:T==="]"&&S--}const H=$.length===0?p:p.substring(q),D=H.startsWith(xe),I=D?H.substring(1):H,P=j&&j>q?j-q:void 0;return{modifiers:$,hasImportantModifier:D,baseClassName:I,maybePostfixModifierPosition:P}};return n?p=>n({className:p,parseClassName:f}):f},nr=t=>{if(t.length<=1)return t;const o=[];let n=[];return t.forEach(a=>{a[0]==="["?(o.push(...n.sort(),a),n=[]):n.push(a)}),o.push(...n.sort()),o},ar=t=>({cache:rr(t.cacheSize),parseClassName:or(t),...Xt(t)}),sr=/\s+/,ir=(t,o)=>{const{parseClassName:n,getClassGroupId:a,getConflictingClassGroupIds:y}=o,u=[],f=t.trim().split(sr);let p="";for(let $=f.length-1;$>=0;$-=1){const S=f[$],{modifiers:q,hasImportantModifier:j,baseClassName:H,maybePostfixModifierPosition:D}=n(S);let I=!!D,P=a(I?H.substring(0,D):H);if(!P){if(!I){p=S+(p.length>0?" "+p:p);continue}if(P=a(H),!P){p=S+(p.length>0?" "+p:p);continue}I=!1}const C=nr(q).join(":"),T=j?C+xe:C,V=T+P;if(u.includes(V))continue;u.push(V);const U=y(P,I);for(let Y=0;Y<U.length;++Y){const W=U[Y];u.push(T+W)}p=S+(p.length>0?" "+p:p)}return p};function cr(){let t=0,o,n,a="";for(;t<arguments.length;)(o=arguments[t++])&&(n=we(o))&&(a&&(a+=" "),a+=n);return a}const we=t=>{if(typeof t=="string")return t;let o,n="";for(let a=0;a<t.length;a++)t[a]&&(o=we(t[a]))&&(n&&(n+=" "),n+=o);return n};function lr(t,...o){let n,a,y,u=f;function f($){const S=o.reduce((q,j)=>j(q),t());return n=ar(S),a=n.cache.get,y=n.cache.set,u=p,p($)}function p($){const S=a($);if(S)return S;const q=ir($,n);return y($,q),q}return function(){return u(cr.apply(null,arguments))}}const E=t=>{const o=n=>n[t]||[];return o.isThemeGetter=!0,o},_e=/^\[(?:([a-z-]+):)?(.+)\]$/i,dr=/^\d+\/\d+$/,ur=new Set(["px","full","screen"]),pr=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,hr=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,yr=/^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,fr=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,gr=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,J=t=>re(t)||ur.has(t)||dr.test(t),Q=t=>oe(t,"length",Mr),re=t=>!!t&&!Number.isNaN(Number(t)),de=t=>oe(t,"number",re),ae=t=>!!t&&Number.isInteger(Number(t)),mr=t=>t.endsWith("%")&&re(t.slice(0,-1)),v=t=>_e.test(t),ee=t=>pr.test(t),br=new Set(["length","size","percentage"]),kr=t=>oe(t,br,Me),vr=t=>oe(t,"position",Me),xr=new Set(["image","url"]),wr=t=>oe(t,xr,Cr),_r=t=>oe(t,"",$r),se=()=>!0,oe=(t,o,n)=>{const a=_e.exec(t);return a?a[1]?typeof o=="string"?a[1]===o:o.has(a[1]):n(a[2]):!1},Mr=t=>hr.test(t)&&!yr.test(t),Me=()=>!1,$r=t=>fr.test(t),Cr=t=>gr.test(t),Sr=()=>{const t=E("colors"),o=E("spacing"),n=E("blur"),a=E("brightness"),y=E("borderColor"),u=E("borderRadius"),f=E("borderSpacing"),p=E("borderWidth"),$=E("contrast"),S=E("grayscale"),q=E("hueRotate"),j=E("invert"),H=E("gap"),D=E("gradientColorStops"),I=E("gradientColorStopPositions"),P=E("inset"),C=E("margin"),T=E("opacity"),V=E("padding"),U=E("saturate"),Y=E("scale"),W=E("sepia"),G=E("skew"),X=E("space"),B=E("translate"),F=()=>["auto","contain","none"],L=()=>["auto","hidden","clip","visible","scroll"],_=()=>["auto",v,o],M=()=>[v,o],Z=()=>["",J,Q],h=()=>["auto",re,v],l=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],s=()=>["solid","dashed","dotted","double","none"],d=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],i=()=>["start","end","center","between","around","evenly","stretch"],g=()=>["","0",v],b=()=>["auto","avoid","all","avoid-page","page","left","right","column"],e=()=>[re,v];return{cacheSize:500,separator:":",theme:{colors:[se],spacing:[J,Q],blur:["none","",ee,v],brightness:e(),borderColor:[t],borderRadius:["none","","full",ee,v],borderSpacing:M(),borderWidth:Z(),contrast:e(),grayscale:g(),hueRotate:e(),invert:g(),gap:M(),gradientColorStops:[t],gradientColorStopPositions:[mr,Q],inset:_(),margin:_(),opacity:e(),padding:M(),saturate:e(),scale:e(),sepia:g(),skew:e(),space:M(),translate:M()},classGroups:{aspect:[{aspect:["auto","square","video",v]}],container:["container"],columns:[{columns:[ee]}],"break-after":[{"break-after":b()}],"break-before":[{"break-before":b()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...l(),v]}],overflow:[{overflow:L()}],"overflow-x":[{"overflow-x":L()}],"overflow-y":[{"overflow-y":L()}],overscroll:[{overscroll:F()}],"overscroll-x":[{"overscroll-x":F()}],"overscroll-y":[{"overscroll-y":F()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[P]}],"inset-x":[{"inset-x":[P]}],"inset-y":[{"inset-y":[P]}],start:[{start:[P]}],end:[{end:[P]}],top:[{top:[P]}],right:[{right:[P]}],bottom:[{bottom:[P]}],left:[{left:[P]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",ae,v]}],basis:[{basis:_()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",v]}],grow:[{grow:g()}],shrink:[{shrink:g()}],order:[{order:["first","last","none",ae,v]}],"grid-cols":[{"grid-cols":[se]}],"col-start-end":[{col:["auto",{span:["full",ae,v]},v]}],"col-start":[{"col-start":h()}],"col-end":[{"col-end":h()}],"grid-rows":[{"grid-rows":[se]}],"row-start-end":[{row:["auto",{span:[ae,v]},v]}],"row-start":[{"row-start":h()}],"row-end":[{"row-end":h()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",v]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",v]}],gap:[{gap:[H]}],"gap-x":[{"gap-x":[H]}],"gap-y":[{"gap-y":[H]}],"justify-content":[{justify:["normal",...i()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...i(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...i(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[V]}],px:[{px:[V]}],py:[{py:[V]}],ps:[{ps:[V]}],pe:[{pe:[V]}],pt:[{pt:[V]}],pr:[{pr:[V]}],pb:[{pb:[V]}],pl:[{pl:[V]}],m:[{m:[C]}],mx:[{mx:[C]}],my:[{my:[C]}],ms:[{ms:[C]}],me:[{me:[C]}],mt:[{mt:[C]}],mr:[{mr:[C]}],mb:[{mb:[C]}],ml:[{ml:[C]}],"space-x":[{"space-x":[X]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[X]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",v,o]}],"min-w":[{"min-w":[v,o,"min","max","fit"]}],"max-w":[{"max-w":[v,o,"none","full","min","max","fit","prose",{screen:[ee]},ee]}],h:[{h:[v,o,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[v,o,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[v,o,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[v,o,"auto","min","max","fit"]}],"font-size":[{text:["base",ee,Q]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",de]}],"font-family":[{font:[se]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",v]}],"line-clamp":[{"line-clamp":["none",re,de]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",J,v]}],"list-image":[{"list-image":["none",v]}],"list-style-type":[{list:["none","disc","decimal",v]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[t]}],"placeholder-opacity":[{"placeholder-opacity":[T]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[t]}],"text-opacity":[{"text-opacity":[T]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...s(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",J,Q]}],"underline-offset":[{"underline-offset":["auto",J,v]}],"text-decoration-color":[{decoration:[t]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:M()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",v]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",v]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[T]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...l(),vr]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",kr]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},wr]}],"bg-color":[{bg:[t]}],"gradient-from-pos":[{from:[I]}],"gradient-via-pos":[{via:[I]}],"gradient-to-pos":[{to:[I]}],"gradient-from":[{from:[D]}],"gradient-via":[{via:[D]}],"gradient-to":[{to:[D]}],rounded:[{rounded:[u]}],"rounded-s":[{"rounded-s":[u]}],"rounded-e":[{"rounded-e":[u]}],"rounded-t":[{"rounded-t":[u]}],"rounded-r":[{"rounded-r":[u]}],"rounded-b":[{"rounded-b":[u]}],"rounded-l":[{"rounded-l":[u]}],"rounded-ss":[{"rounded-ss":[u]}],"rounded-se":[{"rounded-se":[u]}],"rounded-ee":[{"rounded-ee":[u]}],"rounded-es":[{"rounded-es":[u]}],"rounded-tl":[{"rounded-tl":[u]}],"rounded-tr":[{"rounded-tr":[u]}],"rounded-br":[{"rounded-br":[u]}],"rounded-bl":[{"rounded-bl":[u]}],"border-w":[{border:[p]}],"border-w-x":[{"border-x":[p]}],"border-w-y":[{"border-y":[p]}],"border-w-s":[{"border-s":[p]}],"border-w-e":[{"border-e":[p]}],"border-w-t":[{"border-t":[p]}],"border-w-r":[{"border-r":[p]}],"border-w-b":[{"border-b":[p]}],"border-w-l":[{"border-l":[p]}],"border-opacity":[{"border-opacity":[T]}],"border-style":[{border:[...s(),"hidden"]}],"divide-x":[{"divide-x":[p]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[p]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[T]}],"divide-style":[{divide:s()}],"border-color":[{border:[y]}],"border-color-x":[{"border-x":[y]}],"border-color-y":[{"border-y":[y]}],"border-color-s":[{"border-s":[y]}],"border-color-e":[{"border-e":[y]}],"border-color-t":[{"border-t":[y]}],"border-color-r":[{"border-r":[y]}],"border-color-b":[{"border-b":[y]}],"border-color-l":[{"border-l":[y]}],"divide-color":[{divide:[y]}],"outline-style":[{outline:["",...s()]}],"outline-offset":[{"outline-offset":[J,v]}],"outline-w":[{outline:[J,Q]}],"outline-color":[{outline:[t]}],"ring-w":[{ring:Z()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[t]}],"ring-opacity":[{"ring-opacity":[T]}],"ring-offset-w":[{"ring-offset":[J,Q]}],"ring-offset-color":[{"ring-offset":[t]}],shadow:[{shadow:["","inner","none",ee,_r]}],"shadow-color":[{shadow:[se]}],opacity:[{opacity:[T]}],"mix-blend":[{"mix-blend":[...d(),"plus-lighter","plus-darker"]}],"bg-blend":[{"bg-blend":d()}],filter:[{filter:["","none"]}],blur:[{blur:[n]}],brightness:[{brightness:[a]}],contrast:[{contrast:[$]}],"drop-shadow":[{"drop-shadow":["","none",ee,v]}],grayscale:[{grayscale:[S]}],"hue-rotate":[{"hue-rotate":[q]}],invert:[{invert:[j]}],saturate:[{saturate:[U]}],sepia:[{sepia:[W]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[n]}],"backdrop-brightness":[{"backdrop-brightness":[a]}],"backdrop-contrast":[{"backdrop-contrast":[$]}],"backdrop-grayscale":[{"backdrop-grayscale":[S]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[q]}],"backdrop-invert":[{"backdrop-invert":[j]}],"backdrop-opacity":[{"backdrop-opacity":[T]}],"backdrop-saturate":[{"backdrop-saturate":[U]}],"backdrop-sepia":[{"backdrop-sepia":[W]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[f]}],"border-spacing-x":[{"border-spacing-x":[f]}],"border-spacing-y":[{"border-spacing-y":[f]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",v]}],duration:[{duration:e()}],ease:[{ease:["linear","in","out","in-out",v]}],delay:[{delay:e()}],animate:[{animate:["none","spin","ping","pulse","bounce",v]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[Y]}],"scale-x":[{"scale-x":[Y]}],"scale-y":[{"scale-y":[Y]}],rotate:[{rotate:[ae,v]}],"translate-x":[{"translate-x":[B]}],"translate-y":[{"translate-y":[B]}],"skew-x":[{"skew-x":[G]}],"skew-y":[{"skew-y":[G]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",v]}],accent:[{accent:["auto",t]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",v]}],"caret-color":[{caret:[t]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":M()}],"scroll-mx":[{"scroll-mx":M()}],"scroll-my":[{"scroll-my":M()}],"scroll-ms":[{"scroll-ms":M()}],"scroll-me":[{"scroll-me":M()}],"scroll-mt":[{"scroll-mt":M()}],"scroll-mr":[{"scroll-mr":M()}],"scroll-mb":[{"scroll-mb":M()}],"scroll-ml":[{"scroll-ml":M()}],"scroll-p":[{"scroll-p":M()}],"scroll-px":[{"scroll-px":M()}],"scroll-py":[{"scroll-py":M()}],"scroll-ps":[{"scroll-ps":M()}],"scroll-pe":[{"scroll-pe":M()}],"scroll-pt":[{"scroll-pt":M()}],"scroll-pr":[{"scroll-pr":M()}],"scroll-pb":[{"scroll-pb":M()}],"scroll-pl":[{"scroll-pl":M()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",v]}],fill:[{fill:[t,"none"]}],"stroke-w":[{stroke:[J,Q,de]}],stroke:[{stroke:[t,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}},Qo=lr(Sr);var ce={exports:{}},Nr=ce.exports,me;function en(){return me||(me=1,(function(t,o){(function(n,a){t.exports=a()})(Nr,(function(){var n=1e3,a=6e4,y=36e5,u="millisecond",f="second",p="minute",$="hour",S="day",q="week",j="month",H="quarter",D="year",I="date",P="Invalid Date",C=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,T=/\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,V={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(h){var l=["th","st","nd","rd"],s=h%100;return"["+h+(l[(s-20)%10]||l[s]||l[0])+"]"}},U=function(h,l,s){var d=String(h);return!d||d.length>=l?h:""+Array(l+1-d.length).join(s)+h},Y={s:U,z:function(h){var l=-h.utcOffset(),s=Math.abs(l),d=Math.floor(s/60),i=s%60;return(l<=0?"+":"-")+U(d,2,"0")+":"+U(i,2,"0")},m:function h(l,s){if(l.date()<s.date())return-h(s,l);var d=12*(s.year()-l.year())+(s.month()-l.month()),i=l.clone().add(d,j),g=s-i<0,b=l.clone().add(d+(g?-1:1),j);return+(-(d+(s-i)/(g?i-b:b-i))||0)},a:function(h){return h<0?Math.ceil(h)||0:Math.floor(h)},p:function(h){return{M:j,y:D,w:q,d:S,D:I,h:$,m:p,s:f,ms:u,Q:H}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(h){return h===void 0}},W="en",G={};G[W]=V;var X="$isDayjsObject",B=function(h){return h instanceof M||!(!h||!h[X])},F=function h(l,s,d){var i;if(!l)return W;if(typeof l=="string"){var g=l.toLowerCase();G[g]&&(i=g),s&&(G[g]=s,i=g);var b=l.split("-");if(!i&&b.length>1)return h(b[0])}else{var e=l.name;G[e]=l,i=e}return!d&&i&&(W=i),i||!d&&W},L=function(h,l){if(B(h))return h.clone();var s=typeof l=="object"?l:{};return s.date=h,s.args=arguments,new M(s)},_=Y;_.l=F,_.i=B,_.w=function(h,l){return L(h,{locale:l.$L,utc:l.$u,x:l.$x,$offset:l.$offset})};var M=(function(){function h(s){this.$L=F(s.locale,null,!0),this.parse(s),this.$x=this.$x||s.x||{},this[X]=!0}var l=h.prototype;return l.parse=function(s){this.$d=(function(d){var i=d.date,g=d.utc;if(i===null)return new Date(NaN);if(_.u(i))return new Date;if(i instanceof Date)return new Date(i);if(typeof i=="string"&&!/Z$/i.test(i)){var b=i.match(C);if(b){var e=b[2]-1||0,r=(b[7]||"0").substring(0,3);return g?new Date(Date.UTC(b[1],e,b[3]||1,b[4]||0,b[5]||0,b[6]||0,r)):new Date(b[1],e,b[3]||1,b[4]||0,b[5]||0,b[6]||0,r)}}return new Date(i)})(s),this.init()},l.init=function(){var s=this.$d;this.$y=s.getFullYear(),this.$M=s.getMonth(),this.$D=s.getDate(),this.$W=s.getDay(),this.$H=s.getHours(),this.$m=s.getMinutes(),this.$s=s.getSeconds(),this.$ms=s.getMilliseconds()},l.$utils=function(){return _},l.isValid=function(){return this.$d.toString()!==P},l.isSame=function(s,d){var i=L(s);return this.startOf(d)<=i&&i<=this.endOf(d)},l.isAfter=function(s,d){return L(s)<this.startOf(d)},l.isBefore=function(s,d){return this.endOf(d)<L(s)},l.$g=function(s,d,i){return _.u(s)?this[d]:this.set(i,s)},l.unix=function(){return Math.floor(this.valueOf()/1e3)},l.valueOf=function(){return this.$d.getTime()},l.startOf=function(s,d){var i=this,g=!!_.u(d)||d,b=_.p(s),e=function(N,O){var K=_.w(i.$u?Date.UTC(i.$y,O,N):new Date(i.$y,O,N),i);return g?K:K.endOf(S)},r=function(N,O){return _.w(i.toDate()[N].apply(i.toDate("s"),(g?[0,0,0,0]:[23,59,59,999]).slice(O)),i)},m=this.$W,k=this.$M,x=this.$D,z="set"+(this.$u?"UTC":"");switch(b){case D:return g?e(1,0):e(31,11);case j:return g?e(1,k):e(0,k+1);case q:var A=this.$locale().weekStart||0,R=(m<A?m+7:m)-A;return e(g?x-R:x+(6-R),k);case S:case I:return r(z+"Hours",0);case $:return r(z+"Minutes",1);case p:return r(z+"Seconds",2);case f:return r(z+"Milliseconds",3);default:return this.clone()}},l.endOf=function(s){return this.startOf(s,!1)},l.$set=function(s,d){var i,g=_.p(s),b="set"+(this.$u?"UTC":""),e=(i={},i[S]=b+"Date",i[I]=b+"Date",i[j]=b+"Month",i[D]=b+"FullYear",i[$]=b+"Hours",i[p]=b+"Minutes",i[f]=b+"Seconds",i[u]=b+"Milliseconds",i)[g],r=g===S?this.$D+(d-this.$W):d;if(g===j||g===D){var m=this.clone().set(I,1);m.$d[e](r),m.init(),this.$d=m.set(I,Math.min(this.$D,m.daysInMonth())).$d}else e&&this.$d[e](r);return this.init(),this},l.set=function(s,d){return this.clone().$set(s,d)},l.get=function(s){return this[_.p(s)]()},l.add=function(s,d){var i,g=this;s=Number(s);var b=_.p(d),e=function(k){var x=L(g);return _.w(x.date(x.date()+Math.round(k*s)),g)};if(b===j)return this.set(j,this.$M+s);if(b===D)return this.set(D,this.$y+s);if(b===S)return e(1);if(b===q)return e(7);var r=(i={},i[p]=a,i[$]=y,i[f]=n,i)[b]||1,m=this.$d.getTime()+s*r;return _.w(m,this)},l.subtract=function(s,d){return this.add(-1*s,d)},l.format=function(s){var d=this,i=this.$locale();if(!this.isValid())return i.invalidDate||P;var g=s||"YYYY-MM-DDTHH:mm:ssZ",b=_.z(this),e=this.$H,r=this.$m,m=this.$M,k=i.weekdays,x=i.months,z=i.meridiem,A=function(O,K,ne,ie){return O&&(O[K]||O(d,g))||ne[K].slice(0,ie)},R=function(O){return _.s(e%12||12,O,"0")},N=z||function(O,K,ne){var ie=O<12?"AM":"PM";return ne?ie.toLowerCase():ie};return g.replace(T,(function(O,K){return K||(function(ne){switch(ne){case"YY":return String(d.$y).slice(-2);case"YYYY":return _.s(d.$y,4,"0");case"M":return m+1;case"MM":return _.s(m+1,2,"0");case"MMM":return A(i.monthsShort,m,x,3);case"MMMM":return A(x,m);case"D":return d.$D;case"DD":return _.s(d.$D,2,"0");case"d":return String(d.$W);case"dd":return A(i.weekdaysMin,d.$W,k,2);case"ddd":return A(i.weekdaysShort,d.$W,k,3);case"dddd":return k[d.$W];case"H":return String(e);case"HH":return _.s(e,2,"0");case"h":return R(1);case"hh":return R(2);case"a":return N(e,r,!0);case"A":return N(e,r,!1);case"m":return String(r);case"mm":return _.s(r,2,"0");case"s":return String(d.$s);case"ss":return _.s(d.$s,2,"0");case"SSS":return _.s(d.$ms,3,"0");case"Z":return b}return null})(O)||b.replace(":","")}))},l.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},l.diff=function(s,d,i){var g,b=this,e=_.p(d),r=L(s),m=(r.utcOffset()-this.utcOffset())*a,k=this-r,x=function(){return _.m(b,r)};switch(e){case D:g=x()/12;break;case j:g=x();break;case H:g=x()/3;break;case q:g=(k-m)/6048e5;break;case S:g=(k-m)/864e5;break;case $:g=k/y;break;case p:g=k/a;break;case f:g=k/n;break;default:g=k}return i?g:_.a(g)},l.daysInMonth=function(){return this.endOf(j).$D},l.$locale=function(){return G[this.$L]},l.locale=function(s,d){if(!s)return this.$L;var i=this.clone(),g=F(s,d,!0);return g&&(i.$L=g),i},l.clone=function(){return _.w(this.$d,this)},l.toDate=function(){return new Date(this.valueOf())},l.toJSON=function(){return this.isValid()?this.toISOString():null},l.toISOString=function(){return this.$d.toISOString()},l.toString=function(){return this.$d.toUTCString()},h})(),Z=M.prototype;return L.prototype=Z,[["$ms",u],["$s",f],["$m",p],["$H",$],["$W",S],["$M",j],["$y",D],["$D",I]].forEach((function(h){Z[h[1]]=function(l){return this.$g(l,h[0],h[1])}})),L.extend=function(h,l){return h.$i||(h(l,M,L),h.$i=!0),L},L.locale=F,L.isDayjs=B,L.unix=function(h){return L(1e3*h)},L.en=G[W],L.Ls=G,L.p={},L}))})(ce)),ce.exports}export{Dr as $,Er as A,jr as B,Jr as C,bo as D,qo as E,so as F,io as G,ao as H,co as I,Wr as J,lo as K,yo as L,vo as M,Oo as N,_o as O,$o as P,to as Q,Ar as R,Io as S,Ho as T,Fo as U,Yr as V,Zr as W,Jo as X,no as Y,Eo as Z,Wo as _,te as a,Vo as a0,jo as a1,Ro as a2,Co as a3,Hr as a4,qr as a5,Rr as a6,Mo as a7,To as a8,Lr as a9,ko as aa,Yo as ab,Kr as ac,Do as ad,Go as ae,Ao as af,Or as ag,uo as ah,Xo as ai,Xr as aj,eo as ak,fo as al,oo as am,So as an,ro as ao,No as ap,Bo as aq,Zo as ar,Ko as b,zr as c,en as d,Ir as e,go as f,$e as g,mo as h,Vr as i,Gr as j,Ur as k,xo as l,po as m,ho as n,Br as o,Tr as p,zo as q,Se as r,wo as s,Qo as t,Po as u,Lo as v,Pr as w,Fr as x,Uo as y,Qr as z};
