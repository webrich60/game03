export const cats=[
 {id:'monaka',name:'最中',reading:'モナカ',trait:'やんちゃ',color:'#a7d9bd',crop:[0,.327],speed:5.8,pounce:{speed:10,duration:.42,cooldown:1.5,reach:1.35,aimMoving:false},pickupReach:1,
 description:'走るのも、とびつくのも勢いよく！ 捕まえると嬉しくてぴょん。',quote:'いっくぞー！ みんな、まてまてー！',preview:{motion:'celebrate',duration:2.2},
 reactions:{catch:{motion:'celebrate',duration:.9,lines:['やったー！ もう1匹いくぞ！','つかまえたっ！ まだまだ遊ぼ！']},bonus:{motion:'celebrate',duration:.7,lines:['ボーナスも、いっただきー！']},pounce:{lines:['そーれっ！']}}},
 {id:'ohagi',name:'おはぎ',trait:'真面目',color:'#efb0b3',crop:[.329,.635],speed:5.4,pounce:{speed:9.1,duration:.38,cooldown:1.35,reach:1.45,aimMoving:true},pickupReach:1,
 description:'動きながらでも近くのねずみを狙ってとびつく。捕まえたら、ぺこり。',quote:'あわてず、1匹ずつ。きちんと捕まえます。',preview:{motion:'bow',duration:2.2},
 reactions:{catch:{motion:'bow',duration:.85,lines:['1匹、きちんと捕まえました。','次のねずみも、確実に。']},bonus:{motion:'bow',duration:.65,lines:['ボーナス、受け取りました。']},pounce:{motion:'focus',duration:.4,lines:['よく狙って……いきます！']}}},
 {id:'daifuku',name:'大福',trait:'おっちょこちょい',color:'#ecd08d',crop:[.638,1],speed:5.4,pounce:{speed:9.1,duration:.38,cooldown:1.35,reach:1.35,aimMoving:false},pickupReach:1.6,
 description:'3回とびつくと、着地でころん。操作はそのまま、ボーナスは広く拾えるよ。',quote:'あれっ？ えへへ、つかまえちゃった！',preview:{motion:'stumble',duration:2.2},
 reactions:{catch:{motion:'surprised',duration:.8,lines:['あれっ？ つかまえちゃった！','わわっ！ でも、やったー！']},bonus:{motion:'surprised',duration:.8,lines:['あっ！ うっかりボーナスも拾っちゃった！']},stumble:{motion:'stumble',duration:.9,lines:['わわっ、ころん！ ……だいじょうぶ！']},pounce:{lines:['えいっ……あわわっ！']}}}
];
export function findCat(id){return cats.find(c=>c.id===id)||cats[0];}
