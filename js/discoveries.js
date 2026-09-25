export const DISCOVERIES = [
  {id:"sterfte",title:"De eerste doden",dim:"after",prereq:[],
    when:(w,s)=>w.year>=8&&s.deaths>=6,
    prompt:"Dorpen begraven hun doden. Sommigen dromen dat de gestorvene nog ademt. Wat is waar?",
    options:[
      {id:"einde",label:"De dood is het einde",toward:0.12,opens:["zin-zonder-ziel","lichaam"],echo:"Niets gaat door. Wat daarna gezegd wordt, is mensentaal."},
      {id:"doorgaan",label:"Iets gaat door",toward:0.88,opens:["plaats","ziel-of-stroom"],echo:"Iets van de gestorvene blijft. Waar, is nog onbepaald."},
      {id:"onbeslist-after",label:"Laat het wisselen",toward:0.5,spread:0.72,opens:["plaats","zin-zonder-ziel"],echo:"Soms lijkt er iets door te gaan, soms niet. De wereld blijft grillig."}
    ]},
  {id:"plaats",title:"Waar het voortbestaan is",dim:"place",prereq:["sterfte"],
    when:(w)=>w.onto.after.value>0.55&&w.year>=14,
    prompt:"Als iets doorgaat: keert het hier terug, of is er een andere wereld?",
    options:[
      {id:"wederkeer",label:"Terugkeer in deze wereld",toward:0.15,opens:["karma-vraag"],echo:"Wat sterft, kan hier weer beginnen."},
      {id:"hiernamaals",label:"Een andere wereld",toward:0.85,opens:["grond-roep"],echo:"Er is een elders. Soms is het voelbaar."}
    ]},
  {id:"ziel-of-stroom",title:"Wat gaat er door?",dim:"self",prereq:["sterfte"],
    when:(w)=>w.onto.after.value>0.55,
    prompt:"Als iets de dood overleeft: is dat een blijvend zelf, of lost het op in iets groters?",
    options:[
      {id:"blijvend-zelf",label:"Een afgescheiden, blijvend zelf",toward:0.15,opens:["dualisme"],echo:"Iemand blijft iemand."},
      {id:"geen-zelf",label:"Het zelf is verbonden of illusoir",toward:0.85,opens:["grond-roep"],echo:"Grenzen tussen geesten zijn poreus."}
    ]},
  {id:"zin-zonder-ziel",title:"Zin zonder hiernamaals",dim:"moral",prereq:["sterfte"],
    when:(w)=>w.onto.after.value<0.45&&w.year>=16,
    prompt:"Als de dood het einde is: beloont de wereld het goede nog, of is ze onverschillig?",
    options:[
      {id:"toch-moraal",label:"Het universum beloont en straft",toward:0.18,opens:["wil"],echo:"Geen ziel, wel gevolgen."},
      {id:"onverschillig",label:"Het universum is onverschillig",toward:0.86,opens:["absurd","wil"],echo:"Geen extra rechtvaardigheid buiten de mens."}
    ]},
  {id:"lichaam",title:"Alleen deze stof",dim:"ground",prereq:["sterfte"],
    when:(w)=>w.onto.after.value<0.45,
    prompt:"Zonder voortbestaan: is er nog een diepere eenheid achter de wereld, of is dit alles?",
    options:[
      {id:"alleen-wereld",label:"Alleen deze wereld",toward:0.88,opens:["zintuig"],echo:"Geen tweede verdieping."},
      {id:"toch-grond",label:"Toch een diepere eenheid",toward:0.16,opens:["grond-roep"],echo:"Ook zonder ziel kan de wereld één zijn."}
    ]},
  {id:"orde-ontdekt",title:"Herhaling of toeval",dim:"order",prereq:["sterfte"],
    when:(w,s)=>w.year>=20&&s.actions>=80,
    prompt:"Oogsten, stormen, mislukte jachten. Lopen gebeurtenissen volgens een wet, of is het chaos?",
    options:[
      {id:"wet",label:"Wetmatig",toward:0.16,opens:["wil","inzicht-pad"],echo:"Wie oplet, kan voorspellen."},
      {id:"chaos",label:"Chaotisch",toward:0.84,opens:["wil","zintuig"],echo:"Zelfs dezelfde daad loopt anders af."}
    ]},
  {id:"wil",title:"Doen keuzes ertoe?",dim:"will",prereq:["orde-ontdekt"],
    when:(w,s)=>s.actions>=140,
    prompt:"Sommigen zwoegen en slagen, anderen zwoegen en vallen. Stuurt inspanning de uitkomst?",
    options:[
      {id:"vrij",label:"Keuzes doen ertoe",toward:0.18,opens:["ethiek-maakbaar"],echo:"Inspanning buigt de afloop."},
      {id:"vast",label:"Uitkomsten liggen vast",toward:0.84,opens:["gelatenheid"],echo:"Wat gebeurt, was al gelegd."}
    ]},
  {id:"zintuig",title:"Kunnen we vertrouwen wat we zien?",dim:"senses",prereq:["orde-ontdekt"],
    when:(w,s)=>s.noiseEvents>=12,
    prompt:"Getuigen spreken elkaar tegen. Zijn de zintuigen betrouwbaar, of misleiden ze?",
    options:[
      {id:"oog",label:"Zintuigen zijn betrouwbaar",toward:0.18,opens:["inzicht-pad"],echo:"Wie kijkt, weet."},
      {id:"sluier",label:"Zintuigen misleiden",toward:0.84,opens:["inzicht-pad"],echo:"Waarneming is ruis. Iets anders moet dragen."}
    ]},
  {id:"inzicht-pad",title:"Rede of alleen ervaring",dim:"insight",prereq:["zintuig"],
    when:(w)=>w.year>=28,
    prompt:"Leraren denken hardop zonder iets nieuws te zien. Reikt de rede verder dan ervaring?",
    options:[
      {id:"rede",label:"Rede reikt verder",toward:0.16,opens:["grond-roep"],echo:"Nadenken kan raken wat het oog mist."},
      {id:"ervaring-alleen",label:"Alleen ervaring telt",toward:0.84,opens:["ethiek-maakbaar"],echo:"Wat niet meegemaakt is, is geen weten."}
    ]},
  {id:"grond-roep",title:"Is er een diepere eenheid?",dim:"ground",prereq:[],
    when:(w,s)=>s.unity>=5&&w.year>=24,
    prompt:"Enkelen vallen stil en zeggen dat alles één is. Raken ze iets echts, of alleen zichzelf?",
    options:[
      {id:"eenheid",label:"Er is een diepere eenheid",toward:0.14,opens:["stroom"],echo:"Die ervaring raakt de grond."},
      {id:"geen-grond",label:"Er is alleen deze wereld",toward:0.86,opens:["stroom"],echo:"De stilte is menselijk, niet kosmisch."}
    ]},
  {id:"karma-vraag",title:"Gevolgen voorbij de dader",dim:"moral",prereq:["plaats"],
    when:(w)=>w.onto.place.value<0.4,
    prompt:"Wie terugkeert: draagt het universum de daad mee, of begint ieder leven schoon?",
    options:[
      {id:"karma",label:"Het universum beloont en straft",toward:0.16,opens:["stroom"],echo:"Daden hebben een weerkaatsing buiten de wil."},
      {id:"schoon",label:"Het universum is onverschillig",toward:0.84,opens:["stroom"],echo:"Wederkeer zonder rechtbank."}
    ]},
  {id:"dualisme",title:"Geest tegenover wereld",dim:"self",prereq:["ziel-of-stroom"],
    when:(w)=>w.onto.self.value<0.4,
    prompt:"Als het zelf blijft: staat het scherp los van de stof, of is het dezelfde orde?",
    options:[
      {id:"scherp",label:"Afgescheiden en blijvend",toward:0.12,opens:["zintuig"],echo:"Twee ordes: denken en stof."},
      {id:"verweven",label:"Verbonden",toward:0.62,opens:["grond-roep"],echo:"Het zelf lekt."}
    ]},
  {id:"stroom",title:"Blijft iets, of stroomt alles?",dim:"flux",prereq:["orde-ontdekt"],
    when:(w)=>w.year>=36,
    prompt:"Huizen vergaan, namen vergaan, rivieren verleggen zich. Is bestendigheid de regel, of de uitzondering?",
    options:[
      {id:"blijft",label:"Dingen blijven",toward:0.16,opens:[],echo:"Onder de wisseling is iets dat houdt."},
      {id:"stroomt",label:"Alles stroomt",toward:0.86,opens:[],echo:"Geen tweede keer dezelfde wereld."}
    ]},
  {id:"absurd",title:"Het verlangen dat niet past",dim:"moral",prereq:["zin-zonder-ziel"],
    when:(w,s)=>w.onto.moral.value>0.7&&s.gapMoral>0.28,
    prompt:"Zij blijven een rechtvaardige wereld verwachten, terwijl de wereld onverschillig is. Blijft die kloof waar?",
    options:[
      {id:"kloof-houden",label:"Onverschilligheid blijft",toward:0.9,opens:[],echo:"Het absurde is geen vergissing. Het is de maat."},
      {id:"toch-ordenen",label:"Toch een morele weerkaatsing",toward:0.28,opens:[],echo:"Je kantelt de wereld naar hun verlangen."}
    ]},
  {id:"ethiek-maakbaar",title:"Maakbaarheid",dim:"will",prereq:["wil"],
    when:(w)=>w.onto.will.value<0.45,
    prompt:"Als keuzes ertoe doen: is de gemeenschap maakbaar, of blijft de aard van de mens de limiet?",
    options:[
      {id:"maakbaar",label:"Keuzes blijven wegen",toward:0.14,opens:[],echo:"Instellingen kunnen buigen wat mensen doen."},
      {id:"limiet",label:"Meer ligt vast dan men hoopt",toward:0.58,opens:[],echo:"Wil is echt, maar smal."}
    ]},
  {id:"gelatenheid",title:"Wat rest bij het vaste",dim:"insight",prereq:["wil"],
    when:(w)=>w.onto.will.value>0.65,
    prompt:"Als uitkomsten vastliggen: kan inzicht nog iets wijzigen, of alleen verdragen?",
    options:[
      {id:"inzien",label:"Rede reikt tot de wet",toward:0.2,opens:[],echo:"Begrijpen is de enige vrijheid."},
      {id:"zwijgen",label:"Alleen ervaring telt",toward:0.78,opens:[],echo:"Geen extra weten boven het ondergane."}
    ]}
];
export function discoveryById(id){return DISCOVERIES.find(d=>d.id===id);}
