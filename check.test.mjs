import { check } from './check.mjs';
const bad = (h) => check(h).issues.length;
console.assert(bad('<div class="slide" style="left:0"></div>') === 0, 'clean file should pass');
console.assert(bad('<div class="slide" style="transform:translate(1px)"></div>') === 1, 'translate should fail');
console.assert(bad('<div class="slide"><tr style="background:#000"></tr></div>') === 1, 'tr background should fail');
console.assert(bad('<div></div>') === 1, 'no slides should fail');
console.assert(bad('<div class="slide"><img src="data:image/png;base64,AAAA100vhAAA"></div>') === 0, 'base64 must not trip vh rule');
console.log('check.mjs: 5 assertions passed');
