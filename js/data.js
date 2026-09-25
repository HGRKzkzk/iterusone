export const DIMS = [
  { id: "after", name: "Voortbestaan", a: "Dood is einde", b: "Iets gaat door" },
  { id: "place", name: "Plaats van voortbestaan", a: "Terugkeer hier", b: "Andere wereld" },
  { id: "order", name: "Orde", a: "Wetmatig", b: "Chaotisch" },
  { id: "will", name: "Handelingsvrijheid", a: "Keuzes doen ertoe", b: "Uitkomsten vast" },
  { id: "senses", name: "Zintuigen", a: "Betrouwbaar", b: "Misleidend" },
  { id: "insight", name: "Inzicht", a: "Rede reikt verder", b: "Alleen ervaring" },
  { id: "self", name: "Het zelf", a: "Afgescheiden en blijvend", b: "Verbonden of illusoir" },
  { id: "moral", name: "Morele orde", a: "Beloont en straft", b: "Onverschillig" },
  { id: "ground", name: "Grond", a: "Diepere eenheid", b: "Alleen deze wereld" },
  { id: "flux", name: "Bestendigheid", a: "Dingen blijven", b: "Alles stroomt" }
];

export const PROFILES = [
  { name: "Pythagoreïsme", traditie: "Grieks", after: 0.85, place: 0.15, order: 0.15, insight: 0.2 },
  { name: "Eleatisme", traditie: "Grieks", flux: 0.1, senses: 0.85, insight: 0.15 },
  { name: "Heraclitisme", traditie: "Grieks", flux: 0.9, order: 0.25 },
  { name: "Platonisme", traditie: "Grieks", after: 0.85, senses: 0.8, insight: 0.15, moral: 0.2 },
  { name: "Aristotelisme", traditie: "Grieks", order: 0.2, senses: 0.2, insight: 0.45 },
  { name: "Stoïcisme", traditie: "Hellenistisch", order: 0.1, will: 0.8, moral: 0.25, insight: 0.25 },
  { name: "Epicurisme", traditie: "Hellenistisch", after: 0.15, order: 0.7, moral: 0.85 },
  { name: "Pyrronisme", traditie: "Hellenistisch", senses: 0.8, insight: 0.8 },
  { name: "Neoplatonisme", traditie: "Laat-antiek", ground: 0.15, after: 0.8, place: 0.75 },
  { name: "Augustinisme", traditie: "Christelijk", place: 0.85, moral: 0.15, will: 0.7 },
  { name: "Thomisme", traditie: "Christelijk", place: 0.8, order: 0.2, insight: 0.4, moral: 0.2 },
  { name: "Ash'arisme", traditie: "Islamitisch", order: 0.75, ground: 0.2, place: 0.8 },
  { name: "Falsafa", traditie: "Islamitisch", order: 0.2, insight: 0.2, after: 0.8 },
  { name: "Soefisme", traditie: "Islamitisch", ground: 0.15, self: 0.8 },
  { name: "Kabbala", traditie: "Joods", ground: 0.2, order: 0.35, after: 0.75 },
  { name: "Advaita Vedanta", traditie: "Indiaas", ground: 0.1, self: 0.85, after: 0.85, moral: 0.2 },
  { name: "Samkhya-Yoga", traditie: "Indiaas", self: 0.15, after: 0.85, insight: 0.25 },
  { name: "Nyaya-Vaisheshika", traditie: "Indiaas", order: 0.2, senses: 0.2, self: 0.2 },
  { name: "Carvaka", traditie: "Indiaas", after: 0.1, insight: 0.85, moral: 0.85 },
  { name: "Jaïnisme", traditie: "Indiaas", after: 0.85, moral: 0.15, self: 0.2 },
  { name: "Theravada", traditie: "Boeddhistisch", after: 0.8, moral: 0.2, self: 0.85, flux: 0.85 },
  { name: "Madhyamaka", traditie: "Boeddhistisch", flux: 0.9, self: 0.85, insight: 0.45 },
  { name: "Zen", traditie: "Boeddhistisch", insight: 0.8, self: 0.8, ground: 0.35 },
  { name: "Taoïsme", traditie: "Chinees", ground: 0.2, flux: 0.8, will: 0.65 },
  { name: "Confucianisme", traditie: "Chinees", moral: 0.2, self: 0.35 },
  { name: "Mohisme", traditie: "Chinees", moral: 0.2, will: 0.2 },
  { name: "Legalisme", traditie: "Chinees", moral: 0.85, will: 0.35 },
  { name: "Ubuntu", traditie: "Afrikaans", self: 0.75, moral: 0.3 },
  { name: "Nahua-filosofie", traditie: "Mesoamerikaans", flux: 0.8, ground: 0.3 },
  { name: "Cartesianisme", traditie: "Modern", insight: 0.15, senses: 0.75, self: 0.15 },
  { name: "Spinozisme", traditie: "Modern", ground: 0.15, order: 0.1, moral: 0.8 },
  { name: "Empirisme", traditie: "Modern", insight: 0.85, order: 0.55, self: 0.7 },
  { name: "Kantianisme", traditie: "Modern", insight: 0.45, will: 0.2, moral: 0.3 },
  { name: "Hegelianisme", traditie: "Modern", flux: 0.75, insight: 0.25, order: 0.3 },
  { name: "Utilitarisme", traditie: "Modern", moral: 0.7, will: 0.25 },
  { name: "Marxisme", traditie: "Modern", after: 0.2, order: 0.3, will: 0.3, ground: 0.8 },
  { name: "Pragmatisme", traditie: "Modern", insight: 0.7, will: 0.25 },
  { name: "Existentialisme", traditie: "Modern", after: 0.15, will: 0.15, moral: 0.8 },
  { name: "Absurdisme", traditie: "Modern", moral: 0.85 },
  { name: "Nihilisme", traditie: "Modern", moral: 0.9, ground: 0.9 },
  { name: "Fysicalisme", traditie: "Analytisch", after: 0.1, order: 0.15, ground: 0.9, self: 0.7 }
];

export const SCHISM_NAMES = {
  insight: "Rationalisme tegenover empirisme",
  order: "Determinisme tegenover vrije wil",
  will: "Determinisme tegenover vrije wil",
  self: "Blijvend zelf tegenover geen-zelf",
  after: "Dualisme tegenover materialisme",
  flux: "Zijn tegenover worden",
  senses: "Dogmatisme tegenover scepticisme",
  moral: "Moreel realisme tegenover anti-realisme",
  ground: "Rede tegenover openbaring",
  place: "Wedergeboorte tegenover hiernamaals"
};

export const FIRST = ["Asha","Boro","Cira","Daan","Ela","Faro","Gita","Hano","Iri","Juno","Kira","Lumen","Mira","Nero","Orin","Pia","Quen","Rafi","Sila","Tova","Una","Vero","Wila","Xan","Yara","Zeno"];
export const LAST = ["van het Dal","aan de Rivier","op de Heuvel","uit de Nevel","van het Woud","bij de Bron","van de Steen","aan Zee"];
