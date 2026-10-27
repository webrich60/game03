export const cats=[
 {id:'monaka',name:'もなか',reading:'もなか',trait:'やんちゃ',color:'#a7d9bd',crop:[0,.327],speed:5.8,pounce:{speed:10,duration:.42,cooldown:1.5,reach:1.35,aimMoving:false},pickupReach:1,
 description:'弾む走りでまっしぐら！ 捕まえると前足を上げて2回ジャンプ。',quote:'いっくぞー！ みんな、まてまてー！',preview:{motion:'celebrate',duration:2.2},
 reactions:{meow:{motion:'celebrate',duration:1.35},catch:{motion:'celebrate',duration:1.35,lines:['やったー！ もう1匹いくぞ！','つかまえたっ！ まだまだ遊ぼ！']},bonus:{motion:'celebrate',duration:.7,lines:['ボーナスも、いっただきー！']},pounce:{lines:['そーれっ！']}}},
 {id:'ohagi',name:'おはぎ',trait:'真面目',color:'#efb0b3',crop:[.329,.635],speed:5.4,pounce:{speed:9.1,duration:.38,cooldown:1.35,reach:1.45,aimMoving:true},pickupReach:1,
 description:'背すじを伸ばしてきびきび行進。捕まえたら敬礼しておじぎ。動きながらも正確にとびつく。',quote:'あわてず、1匹ずつ。きちんと捕まえます。',preview:{motion:'bow',duration:2.2},
 reactions:{meow:{motion:'bow',duration:1.4},catch:{motion:'bow',duration:1.4,lines:['1匹、きちんと捕まえました。','次のねずみも、確実に。']},bonus:{motion:'bow',duration:.65,lines:['ボーナス、受け取りました。']},pounce:{motion:'focus',duration:.4,lines:['よく狙って……いきます！']}}},
 {id:'daifuku',name:'大福',trait:'おっちょこちょい',color:'#ecd08d',crop:[.638,1],speed:5.4,pounce:{speed:9.1,duration:.38,cooldown:1.35,reach:1.35,aimMoving:false},pickupReach:1.6,
 description:'ゆらゆら歩き、捕まえると両足をばたばた！ 3回のとびつきで横にころん。ボーナスは広く拾えるよ。',quote:'あれっ？ えへへ、つかまえちゃった！',preview:{motion:'stumble',duration:2.2},
 reactions:{meow:{motion:'surprised',duration:1.25},catch:{motion:'surprised',duration:1.25,lines:['あれっ？ つかまえちゃった！','わわっ！ でも、やったー！']},bonus:{motion:'surprised',duration:.8,lines:['あっ！ うっかりボーナスも拾っちゃった！']},stumble:{motion:'stumble',duration:1.25,lines:['わわっ、ころん！ ……だいじょうぶ！']},pounce:{lines:['えいっ……あわわっ！']}}},
 {id:'castella',name:'カステラ',trait:'優しい・おてんば',color:'#b9a9dc',speed:5.6,pounce:{speed:9.6,duration:.40,cooldown:1.4,reach:1.4,aimMoving:false},pickupReach:1.15,meow:{radius:5.6,duration:2.8},
 description:'横にぴょん！ 前足でスカーフを持ち上げてカプッ。優しい「にゃあ」は広く長めに届くよ。',quote:'みんなにやさしく！ ……でも、かぷっ♪',preview:{motion:'nibble',duration:2.2},
 reactions:{catch:{motion:'nibble',duration:1.5,lines:['つかまえたよ！ ……つい、かぷっ♪','やさしく、かぷっ。えへへ！']},bonus:{motion:'gentle',duration:.9,lines:['みんなの分も、見つけたよ。']},pounce:{motion:'focus',duration:.4,lines:['ちょっとお先に、ぴょんっ！']},meow:{motion:'nibble',duration:1.5,lines:['だいじょうぶ。あわてないでね。']}}}
];
export function findCat(id){return cats.find(c=>c.id===id)||cats[0];}
