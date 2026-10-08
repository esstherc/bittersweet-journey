/* Drawn for the end journey: layered mountains, dunes, river, road and a wayside inn. */
window.CREDITS_LANDSCAPE = `
<svg class="credits-landscape" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
 <defs>
  <linearGradient id="end-sky" x2="0" y2="1"><stop stop-color="#221e25"/><stop offset=".6" stop-color="#594b45"/><stop offset="1" stop-color="#998064"/></linearGradient>
  <linearGradient id="end-water" x2="0" y2="1"><stop stop-color="#647673"/><stop offset="1" stop-color="#333e3d"/></linearGradient>
  <radialGradient id="end-lamp"><stop stop-color="#fff1b7" stop-opacity=".65"/><stop offset=".25" stop-color="#dfab60" stop-opacity=".22"/><stop offset="1" stop-color="#dfab60" stop-opacity="0"/></radialGradient>
  <pattern id="end-paper" width="120" height="90" patternUnits="userSpaceOnUse"><path d="M3 20l14-1m43 37l21-2m-55 20h2m54-60l20 1" stroke="#ecdbb0" stroke-opacity=".1" stroke-width=".6"/></pattern>
 </defs>
 <path fill="url(#end-sky)" d="M0 0h1600v900H0z"/>
 <g fill="#e8cd9b" opacity=".6"><circle cx="126" cy="173" r="1.3"/><circle cx="309" cy="83" r="1"/><circle cx="1306" cy="122" r="1.6"/><circle cx="1439" cy="203" r="1"/><circle cx="1160" cy="69" r="1"/><circle cx="889" cy="94" r=".8"/></g>
 <circle cx="1270" cy="237" r="38" fill="#c6b79a" opacity=".2"/>
 <g class="credits-far-ranges" fill="#5d5b58" stroke="#a3997e" stroke-opacity=".2">
  <path d="M-250 640L-70 566 64 579 220 429 305 478 437 378 558 458 675 421 800 534 966 453 1080 513 1220 360 1345 478 1440 432 1640 565 1800 499V900H-250Z"/>
  <path d="M220 429l-44 79 48-24 43 28 38-34m132-100l-62 83 55-25 54 35 74-13m662-98l-63 93 57-36 49 43 82 18" fill="none" stroke="#d6c4a0" stroke-opacity=".24" stroke-width="2"/>
 </g>
 <g class="credits-middle-ranges" fill="#4f514a">
  <path d="M-180 768L-30 688 98 714 255 602 410 692 570 611 708 678 846 561 956 689 1104 622 1241 683 1429 561 1620 660 1780 602V900H-180Z"/>
  <g fill="none" stroke="#c3b088" stroke-opacity=".17" stroke-width="1.5"><path d="M255 602l-37 76-91 82m128-158l34 83 121 7m436-131l-30 73-95 49m125-122l74 101 68 27m441-128l-52 70-89 61m141-131l57 89 120 51"/></g>
 </g>
 <path d="M1600 682Q1400 679 1281 736T947 756Q831 737 746 770Q688 790 898 815Q1024 833 1152 900H1600Z" fill="url(#end-water)" opacity=".8"/>
 <g stroke="#a9b8a1" stroke-opacity=".23" fill="none"><path d="M1390 727l110-4m-444 54l130-2m-279 25l68 2m319 47l170 5m-580-53l78 4m-20 44l137 9"/></g>
 <g class="credits-near-dunes">
  <path d="M-120 799Q145 658 401 748T861 834Q1102 750 1393 856L1760 803V950H-120Z" fill="#827056"/>
  <path d="M-120 813Q142 678 399 767Q215 761 79 861Q339 776 540 855Q300 808 182 920" fill="#b49870" opacity=".48"/>
  <path d="M923 849Q1106 797 1335 870Q1190 841 1138 900" fill="#b39874" opacity=".35"/>
  <path d="M-200 884Q270 809 680 871T1270 900L1800 868" stroke="#d2b98c" stroke-width="4" opacity=".3" fill="none"/>
  <path d="M-200 890Q270 815 680 877T1270 906L1800 874" stroke="#433a30" stroke-width="2" opacity=".6" fill="none"/>
  <g fill="none" stroke="#b69b70" stroke-opacity=".4"><path d="M92 848l-6-16m6 16l8-12m-1 18l-2-11m987 40l-4-14m4 14l8-9m441-23l-5-18m5 18l9-10"/></g>
 </g>
 <g class="credits-bridge" transform="translate(935 774)" fill="#8c826c" stroke="#b5a688" stroke-width="2">
  <path d="M0 53Q90-56 180 53L177 68Q90-23 3 68Z"/>
  <path d="M-12 51Q90-70 192 51" fill="none" stroke-width="7"/>
  <path d="M22 23v16m26-39v20m28-34v23m28-22v23m29-8v20m27 0v17" fill="none"/>
 </g>
 <g class="credits-inn" transform="translate(1128 718)">
  <ellipse cx="106" cy="159" rx="176" ry="12" fill="#261e19" opacity=".24"/>
  <path d="M16 65h191v88H16Z" fill="#64503c" stroke="#b49b75" stroke-width="2"/>
  <path d="M-3 68Q38 45 68 5H158Q181 45 227 68L214 76H9Z" fill="#3a3933" stroke="#a49475" stroke-width="2"/>
  <path d="M22 55h178M35 43h151M46 31h127" stroke="#bda784" stroke-opacity=".36"/>
  <path d="M87 98q0-28 25-28t25 28v55H87Z" fill="#29251e"/>
  <path d="M40 92h27v30H40zm120 0h27v30h-27Z" fill="#b38643" opacity=".6"/>
  <path d="M15 77v78m193-78v78M-5 158h232M46 92v30m127-30v30M40 107h27m93 0h27" fill="none" stroke="#c0a478" stroke-width="2"/>
  <g class="credits-hung-lantern"><circle cx="148" cy="83" r="110" fill="url(#end-lamp)"/><path d="M148 61V45" stroke="#c9b27b"/><rect x="137" y="62" width="22" height="30" rx="6" fill="#eab969"/><path d="M137 66h22m-22 22h22m-11-24v24m0 4v9" stroke="#754b29" stroke-width="2"/></g>
 </g>
 <path fill="url(#end-paper)" d="M0 0h1600v900H0z"/>
</svg>
`;
