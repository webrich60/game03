export const cats=[
 {id:'monaka',name:'モナカ',color:'#a7d9bd',crop:[0,.327]},
 {id:'ohagi',name:'おはぎ',color:'#efb0b3',crop:[.329,.635]},
 {id:'daifuku',name:'大福',color:'#ecd08d',crop:[.638,1]}
];
export function findCat(id){return cats.find(c=>c.id===id)||cats[0];}
