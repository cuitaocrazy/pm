(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([["mf-dep_5773"],{45773:function(z,g,n){"use strict";n.r(g);var Z=n(47153);g.default=Z.Z},47153:function(z,g,n){"use strict";n.d(g,{Z:function(){return B}});var Z=n(22122),r=n(96156),K=n(7085),j=n(35510),D=n.n(j),T=n(28481),M=n(81253),l=n(67294),R=n(82321),I=n(90826),P=l.forwardRef(function(e,i){var t,a=e.prefixCls,s=a===void 0?"rc-switch":a,v=e.className,u=e.checked,x=e.defaultChecked,h=e.disabled,E=e.loadingIcon,p=e.checkedChildren,O=e.unCheckedChildren,C=e.onClick,f=e.onChange,m=e.onKeyDown,b=(0,M.Z)(e,["prefixCls","className","checked","defaultChecked","disabled","loadingIcon","checkedChildren","unCheckedChildren","onClick","onChange","onKeyDown"]),c=(0,R.Z)(!1,{value:u,defaultValue:x}),y=(0,T.Z)(c,2),d=y[0],F=y[1];function k(o,w){var N=d;return h||(N=o,F(N),f==null||f(N,w)),N}function G(o){o.which===I.Z.LEFT?k(!1,o):o.which===I.Z.RIGHT&&k(!0,o),m==null||m(o)}function V(o){var w=k(!d,o);C==null||C(w,o)}var Y=D()(s,v,(t={},(0,r.Z)(t,"".concat(s,"-checked"),d),(0,r.Z)(t,"".concat(s,"-disabled"),h),t));return l.createElement("button",Object.assign({},b,{type:"button",role:"switch","aria-checked":d,disabled:h,className:Y,ref:i,onKeyDown:G,onClick:V}),E,l.createElement("span",{className:"".concat(s,"-inner")},d?p:O))});P.displayName="Switch";var A=P,L=n(9054),W=n(99469),$=n(10772),H=n(77067),U=function(e,i){var t={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&i.indexOf(a)<0&&(t[a]=e[a]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,a=Object.getOwnPropertySymbols(e);s<a.length;s++)i.indexOf(a[s])<0&&Object.prototype.propertyIsEnumerable.call(e,a[s])&&(t[a[s]]=e[a[s]]);return t},S=l.forwardRef(function(e,i){var t,a=e.prefixCls,s=e.size,v=e.disabled,u=e.loading,x=e.className,h=x===void 0?"":x,E=U(e,["prefixCls","size","disabled","loading","className"]),p=l.useContext(L.E_),O=p.getPrefixCls,C=p.direction,f=l.useContext($.Z),m=l.useContext(W.Z),b=(v!=null?v:m)||u,c=O("switch",a),y=l.createElement("div",{className:"".concat(c,"-handle")},u&&l.createElement(K.Z,{className:"".concat(c,"-loading-icon")})),d=D()((t={},(0,r.Z)(t,"".concat(c,"-small"),(s||f)==="small"),(0,r.Z)(t,"".concat(c,"-loading"),u),(0,r.Z)(t,"".concat(c,"-rtl"),C==="rtl"),t),h);return l.createElement(H.Z,{insertExtraNode:!0},l.createElement(A,(0,Z.Z)({},E,{prefixCls:c,className:d,disabled:b,ref:i,loadingIcon:y})))});S.__ANT_SWITCH=!0;var B=S}}]);