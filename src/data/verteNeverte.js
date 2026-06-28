// VERTE ALEBO NEVERTE — banka tvrdení
// truth: true = VERÍM (pravda), false = NEVERÍM (blud)

export const VN_STATEMENTS = [
  // 🛸 Konšpiračné teórie
  { category: 'Konšpiračné teórie', icon: '🛸', truth: true, text: 'CIA mala v 60. rokoch program „Acoustic Kitty" — chceli z mačky urobiť živé odpočúvacie zariadenie.', explanation: 'Reálny, drahý a nefunkčný projekt CIA.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: true, text: 'Projekt MKUltra: vláda USA testovala LSD a manipuláciu mysle na ľuďoch, často bez ich vedomia.', explanation: 'Odtajnený program z éry studenej vojny.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: true, text: 'V roku 1962 navrhli americkí vojaci „Operáciu Northwoods" — falošné útoky na vlastných občanov ako zámienku na vojnu proti Kube.', explanation: 'Návrh existoval, Kennedy ho zamietol.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: true, text: 'Po 2. svetovej vojne USA tajne zamestnali nemeckých nacistických vedcov („Operácia Paperclip").', explanation: 'Pomohli rozbehnúť vesmírny program.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: true, text: 'FBI viedlo na Alberta Einsteina rozsiahly sledovací spis (vyše 1 500 strán).', explanation: 'Sledovali ho roky kvôli politickým postojom.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: false, text: 'Zem je v skutočnosti plochá a NASA to tají.', explanation: 'Guľatosť Zeme je dokázaná tisícročia.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: false, text: 'Pristátie na Mesiaci v roku 1969 bolo natočené v štúdiu.', explanation: 'Vyvrátené (zrkadlá na Mesiaci, vzorky, nezávislé sledovanie).' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: false, text: 'Svetové vlády tajne ovládajú „reptiliáni" — jašteričí ľudia v prestrojení.', explanation: 'Konšpiračný výmysel bez dôkazov.' },
  { category: 'Konšpiračné teórie', icon: '🛸', truth: false, text: 'Stopy za lietadlami („chemtrails") sú chemikálie na ovplyvňovanie ľudí.', explanation: 'Sú to kondenzačné stopy z vodnej pary.' },

  // 🌍 Planéta Zem
  { category: 'Planéta Zem', icon: '🌍', truth: true, text: 'Na Zemi je viac stromov než hviezd v Mliečnej dráhe.', explanation: '~3 bilióny stromov vs. stovky miliárd hviezd.' },
  { category: 'Planéta Zem', icon: '🌍', truth: true, text: 'Mariánska priekopa je hlbšia, než je Mount Everest vysoký.', explanation: '~11 km vs. ~8,8 km.' },
  { category: 'Planéta Zem', icon: '🌍', truth: true, text: 'Antarktída je najväčšia púšť na svete.', explanation: 'Púšť = málo zrážok, nie nutne piesok.' },
  { category: 'Planéta Zem', icon: '🌍', truth: true, text: 'Sahara bola pred tisíckami rokov zelená, s jazerami a zvieratami.', explanation: '„Africké vlhké obdobie".' },
  { category: 'Planéta Zem', icon: '🌍', truth: true, text: 'Banán je botanicky bobuľa, ale jahoda nie.', explanation: 'Botanika je krutá.' },
  { category: 'Planéta Zem', icon: '🌍', truth: false, text: 'Veľký čínsky múr je jedinou ľudskou stavbou viditeľnou voľným okom z vesmíru.', explanation: 'Populárny mýtus.' },
  { category: 'Planéta Zem', icon: '🌍', truth: false, text: 'Blesk nikdy neudrie dvakrát na to isté miesto.', explanation: 'Pokojne aj mnohokrát (napr. Empire State Building).' },
  { category: 'Planéta Zem', icon: '🌍', truth: false, text: 'Voda v dreze sa na južnej pologuli točí opačne kvôli Coriolisovej sile.', explanation: 'Na malej škále rozhoduje tvar nádoby.' },
  { category: 'Planéta Zem', icon: '🌍', truth: false, text: 'Ročné obdobia spôsobuje to, že Zem je v lete bližšie k Slnku.', explanation: 'Spôsobuje ich naklonenie zemskej osi.' },

  // 📜 Svetové udalosti v histórii
  { category: 'Svetové udalosti', icon: '📜', truth: true, text: 'Oxfordská univerzita je staršia než Aztécka ríša.', explanation: 'Oxford ~1096, Tenochtitlán 1325.' },
  { category: 'Svetové udalosti', icon: '📜', truth: true, text: 'Cleopatra žila časovo bližšie k pristátiu na Mesiaci než k stavbe Veľkej pyramídy.', explanation: 'Pyramída ~2560 pred Kr., Cleopatra ~30 pred Kr.' },
  { category: 'Svetové udalosti', icon: '📜', truth: true, text: 'Posledná poprava gilotínou vo Francúzsku bola v tom istom roku ako prvý Star Wars (1977).', explanation: 'Obe v roku 1977.' },
  { category: 'Svetové udalosti', icon: '📜', truth: true, text: 'Najkratšia vojna v histórii (Británia vs. Zanzibar, 1896) trvala asi 38–40 minút.', explanation: 'Anglo-zanzibarská vojna.' },
  { category: 'Svetové udalosti', icon: '📜', truth: true, text: 'Srstnaté mamuty ešte žili, keď už stála Veľká pyramída v Gíze.', explanation: 'Posledné mamuty vymreli až po dostavbe pyramíd.' },
  { category: 'Svetové udalosti', icon: '📜', truth: false, text: 'Napoleon Bonaparte bol nezvyčajne malý (okolo 150 cm).', explanation: 'Meral ~1,68–1,70 m, dobový priemer.' },
  { category: 'Svetové udalosti', icon: '📜', truth: false, text: 'Vikingovia bežne nosili prilby s rohmi.', explanation: 'Výmysel z 19. storočia.' },
  { category: 'Svetové udalosti', icon: '📜', truth: false, text: 'Albert Einstein prepadol v škole z matematiky.', explanation: 'Matematika mu išla výborne.' },
  { category: 'Svetové udalosti', icon: '📜', truth: false, text: 'Veľký požiar Londýna (1666) zabil desaťtisíce ľudí.', explanation: 'Oficiálne zaznamenaných úmrtí bolo veľmi málo.' },

  // 🌟 Známe osobnosti
  { category: 'Známe osobnosti', icon: '🌟', truth: true, text: 'Albert Einstein dostal ponuku stať sa prezidentom Izraela, ale odmietol.', explanation: 'Ponuka prišla v roku 1952.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: true, text: 'Freddie Mercury (Queen) sa narodil na ostrove Zanzibar.', explanation: 'Stone Town, 1946.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: true, text: 'Arnold Schwarzenegger bol milionárom ešte pred hereckou kariérou.', explanation: 'Zbohatol na biznise a realitách.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: true, text: 'J. R. R. Tolkien bol nominovaný na Nobelovu cenu za literatúru.', explanation: 'Nominácia v roku 1961.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: true, text: 'Isaac Newton strávil obrovskú časť života alchýmiou.', explanation: 'Písal o nej možno viac než o fyzike.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: false, text: 'Walt Disney je kryogenicky zmrazený a čaká na oživenie.', explanation: 'V skutočnosti bol spopolnený.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: false, text: 'Prvý počítač Apple navrhol a postavil sám Steve Jobs.', explanation: 'Apple I postavil Steve Wozniak.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: false, text: 'Thomas Edison vynašiel žiarovku úplne sám, od nuly.', explanation: 'Nadviazal na skorších vynálezcov, hlavne ju vylepšil.' },
  { category: 'Známe osobnosti', icon: '🌟', truth: false, text: 'Krištof Kolumbus ako prvý dokázal, že Zem je guľatá.', explanation: 'Vzdelaní ľudia to vedeli už od antiky.' },
]
