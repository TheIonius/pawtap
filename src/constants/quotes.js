/**
 * Multilingual literary and philosophical quote collections.
 * Supports: English, Spanish, French, German, Italian, Portuguese,
 * Dutch, Polish, Russian, Japanese (Romaji), Indonesian, Swedish, Turkish, Korean, and Chinese (Pinyin).
 */

export const QUOTES_BY_LANGUAGE = {
  english: {
    short: [
      { id: 'en-s-1', text: "I declare after all there is no enjoyment like reading! How much sooner one tires of any thing than of a book!", source: "Jane Austen, Pride and Prejudice" },
      { id: 'en-s-2', text: "It is the time you have wasted for your rose that makes your rose so important.", source: "Antoine de Saint-Exupéry, The Little Prince" },
      { id: 'en-s-3', text: "There is some good in this world, and it's worth fighting for.", source: "J.R.R. Tolkien, The Two Towers" },
      { id: 'en-s-4', text: "I am so glad I live in a world where there are Octobers.", source: "L.M. Montgomery, Anne of Green Gables" },
      { id: 'en-s-5', text: "Even the smallest one can change the course of the future.", source: "Galadriel, The Lord of the Rings" },
      { id: 'en-s-6', text: "Tea to the English is really a picnic indoors.", source: "Alice Thomas Ellis" },
      { id: 'en-s-7', text: "To love oneself is the beginning of a lifelong romance.", source: "Oscar Wilde, An Ideal Husband" },
      { id: 'en-s-8', text: "The soul should always stand ajar, ready to welcome the ecstatic experience.", source: "Emily Dickinson" },
      { id: 'en-s-9', text: "The world is full of magical things patiently waiting for our wits to grow sharper.", source: "Bertrand Russell" },
      { id: 'en-s-10', text: "Live in each season as it passes; breathe the air, drink the drink, taste the fruit.", source: "Henry David Thoreau, Walden" },
      { id: 'en-s-11', text: "No act of kindness, no matter how small, is ever wasted.", source: "Aesop" },
      { id: 'en-s-12', text: "Simplicity is the keynote of all true elegance.", source: "Coco Chanel" },
      { id: 'en-s-13', text: "There are years that ask questions and years that answer.", source: "Zora Neale Hurston" },
      { id: 'en-s-14', text: "If you have a garden and a library, you have everything you need.", source: "Marcus Tullius Cicero" },
      { id: 'en-s-15', text: "Kindness is like snow. It beautifies everything it covers.", source: "Kahlil Gibran" }
    ],
    medium: [
      { id: 'en-m-1', text: "It was a cozy little room with books lining the shelves, a soft wool blanket folded across the armchair, and the scent of freshly brewed coffee drifting through the morning air.", source: "Sanctuary Mornings" },
      { id: 'en-m-2', text: "Outside, rain tapped softly against the windowpane, whispering secrets to the autumn garden while the hearth crackled with steady golden warmth.", source: "Autumn by the Hearth" },
      { id: 'en-m-3', text: "The little cat curled into a sleeping crescent atop the desk, purring softly in rhythm with the gentle clicking of mechanical keys.", source: "Mochi's Afternoon Nap" },
      { id: 'en-m-4', text: "In the depth of winter, I finally learned that within me there lay an invincible summer that no storm could extinguish.", source: "Albert Camus" },
      { id: 'en-m-5', text: "We read to know we're not alone. Each page turned is a quiet conversation across time and distance.", source: "William Nicholson, Shadowlands" },
      { id: 'en-m-6', text: "A cup of warm matcha latte and a quiet hour of reading can restore the peace that a long week in the city has scattered.", source: "Café Notes" },
      { id: 'en-m-7', text: "The garden slept beneath a silver mist, every blade of grass holding a single perfect dewdrop until the dawn sun broke through the clouds.", source: "The Quiet Meadow" },
      { id: 'en-m-8', text: "True contentment is not having everything, but cherishing the soft moments that visit us unannounced on ordinary afternoons.", source: "Gentle Reflections" }
    ],
    long: [
      { id: 'en-l-1', text: "The old cat leaped softly onto the wide window ledge, curling its paws beneath its chest with a gentle sigh. Through the glass, silver rain streaked down against the garden leaves, but the room was warm, filled with the aroma of roasted coffee and the rhythmic tapping of fingers across smooth mechanical keys.", source: "Pawtap Sanctuary Tales" },
      { id: 'en-l-2', text: "There is a quiet majesty in the early hours before the world awakens to its chores. The kettle murmurs, the sky turns from ink to pale periwinkle, and your thoughts are entirely your own. In that brief interlude between sleep and daylight, you can gather your peace and carry it with you like a lantern.", source: "Dawn in the Sanctuary" },
      { id: 'en-l-3', text: "Outside, the autumn wind shook the beech trees until their golden coins rained down across the mossy woodland path. But inside the little library, all was calm. The brass lamp hummed quietly above the polished oak desk, and the scent of aged leather and lavender sachets created a refuge where hours slipped away unnoticed.", source: "The Autumn Scribe" },
      { id: 'en-l-4', text: "Great things are done by a series of small things brought together. A masterpiece begins with a single brushstroke, a grand novel with a single keystroke, and a peaceful life with an accumulation of gentle, unhurried mornings. Cultivate your quiet sanctuary with patience and care.", source: "Vincent van Gogh & Cozy Philosophy" }
    ]
  },
  spanish: {
    short: [
      { id: 'es-s-1', text: "Recordar es fácil para el que tiene memoria, olvidar es difícil para el que tiene corazón.", source: "Gabriel García Márquez" },
      { id: 'es-s-2', text: "Siempre imaginé que el Paraíso sería algún tipo de biblioteca.", source: "Jorge Luis Borges" },
      { id: 'es-s-3', text: "Queda prohibido no sonreír a los problemas, no luchar por lo que quieres y abandonarlo todo por miedo.", source: "Pablo Neruda" },
      { id: 'es-s-4', text: "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos.", source: "Miguel de Cervantes, Don Quijote" },
      { id: 'es-s-5', text: "Vivir es lo más raro de este mundo, la mayoría de la gente existe, eso es todo.", source: "Oscar Wilde" }
    ],
    medium: [
      { id: 'es-m-1', text: "En una tarde lluviosa de otoño, el aroma del café recién tostado y las páginas doradas de un libro antiguo devuelven la serenidad al alma.", source: "Notas de Café" },
      { id: 'es-m-2', text: "Escribe lo que no debe ser olvidado. La memoria es una planta delicada que necesita agua constante y paciencia para florecer con calma.", source: "Isabel Allende" },
      { id: 'es-m-3', text: "La verdadera paz no consiste en la ausencia de tormenta, sino en la quietud profunda de nuestro propio refugio interior.", source: "Pensamientos Tranquilos" },
      { id: 'es-m-4', text: "El gato blanco dormía plácidamente junto a la ventana mientras el sonido de las teclas llenaba la habitación de suave armonía.", source: "El Santuario de la Tarde" }
    ],
    long: [
      { id: 'es-l-1', text: "El secreto de una buena vejez no es otra cosa que un pacto honrado con la soledad. Mientras afuera la lluvia acaricia las hojas del jardín, dentro de la pequeña estancia la taza de chocolate humea y las palabras fluyen como un arroyo sereno entre las manos de quien escribe sin prisa.", source: "Gabriel García Márquez, Cien años de soledad" },
      { id: 'es-l-2', text: "Hay mañanas en las que el mundo parece nacer de nuevo. La niebla se disipa sobre los tejados dorados y un rayo de sol tibio ilumina la mesa de roble. En esos instantes suspendidos, basta una respiración profunda para recordar la belleza oculta de las cosas más simples.", source: "Crónicas del Refugio" }
    ]
  },
  french: {
    short: [
      { id: 'fr-s-1', text: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", source: "Antoine de Saint-Exupéry, Le Petit Prince" },
      { id: 'fr-s-2', text: "Le véritable voyage de découverte ne consiste pas à chercher de nouveaux paysages, mais à avoir de nouveaux yeux.", source: "Marcel Proust" },
      { id: 'fr-s-3', text: "Aimer, c'est savoir dire je t'aime sans parler.", source: "Victor Hugo" },
      { id: 'fr-s-4', text: "Il n'y a qu'un bonheur dans cette vie, c'est d'aimer et d'être aimé.", source: "George Sand" },
      { id: 'fr-s-5', text: "Patience et longueur de temps font plus que force ni que rage.", source: "Jean de La Fontaine" }
    ],
    medium: [
      { id: 'fr-m-1', text: "Au milieu de l'hiver, j'ai découvert en moi un invincible été. Il y a dans chaque être humain une flamme douce que nulle tempête ne saurait éteindre.", source: "Albert Camus" },
      { id: 'fr-m-2', text: "Une tasse de thé fumant, une couverture en laine douce et le crépitement d'un feu de bois créent un havre de paix où le temps semble s'arrêter.", source: "Rêveries d'Hiver" },
      { id: 'fr-m-3', text: "Le petit chat s'étira paresseusement sur le coussin de velours, bercé par le cliquetis régulier des touches sous les doigts attentifs.", source: "Après-midi au Salon" }
    ],
    long: [
      { id: 'fr-l-1', text: "Mais, à l'instant même où la gorgée mêlée des miettes du gâteau toucha mon palais, je tressaillis, attentif à ce qui se passait d'extraordinaire en moi. Un plaisir délicieux m'avait envahi, isolé, sans la notion de sa cause, me rendant les vicissitudes de la vie indifférentes, ses désastres inoffensifs, sa brièveté illusoire.", source: "Marcel Proust, Du côté de chez Swann" },
      { id: 'fr-l-2', text: "La pluie tombait doucement sur les pavés parisiens, faisant briller les reflets dorés des réverbères. À l'intérieur du petit café d'angle, l'odeur du pain frais et du café chaud enveloppait les rêveurs d'un sentiment réconfortant de plénitude et de douceur partagée.", source: "Matinée Parisienne" }
    ]
  },
  german: {
    short: [
      { id: 'de-s-1', text: "Auch aus Steinen, die einem in den Weg gelegt werden, kann man Schönes bauen.", source: "Johann Wolfgang von Goethe" },
      { id: 'de-s-2', text: "Du musst das Leben nicht verstehen, dann wird es werden wie ein Fest.", source: "Rainer Maria Rilke" },
      { id: 'de-s-3', text: "Man muss das Unmögliche versuchen, um das Mögliche zu erreichen.", source: "Hermann Hesse" },
      { id: 'de-s-4', text: "Ein Buch muss die Axt sein für das gefrorene Meer in uns.", source: "Franz Kafka" },
      { id: 'de-s-5', text: "Wer nicht wagt, der darf nicht hoffen.", source: "Friedrich Schiller" }
    ],
    medium: [
      { id: 'de-m-1', text: "Der Duft von frischem Kaffee und warmer Milch am frühen Morgen erfüllt die kleine Stube mit einer wohligen Geborgenheit, die den ganzen Tag begleitet.", source: "Gemütliche Morgenstunden" },
      { id: 'de-m-2', text: "Draußen tanzten die goldenen Herbstblätter im kühlen Wind, während drinnen der Kaminofen leise knisterte und das Zimmer in warmes Licht tauchte.", source: "Herbst am Kamin" },
      { id: 'de-m-3', text: "In der Ruhe des Lesens finden wir jene Zuflucht, die uns der lärmende Alltag verwehrt. Jedes getippte Wort bringt neue Gelassenheit.", source: "Stille Gedanken" }
    ],
    long: [
      { id: 'de-l-1', text: "Die Welt war schön, wenn man sie so betrachtete, so kindlich, so erwacht, so offen für das Unmittelbare. Ein warmer Tee am Abend, eine weiche Wolldecke und das leise Ticken der Wanduhr erinnern uns daran, wie kostbar jeder einzelne Augenblick friedvoller Einkehr ist.", source: "Hermann Hesse, Siddhartha" }
    ]
  },
  italian: {
    short: [
      { id: 'it-s-1', text: "L'amor che move il sole e l'altre stelle.", source: "Dante Alighieri, Divina Commedia" },
      { id: 'it-s-2', text: "Prendete la vita con leggerezza, che leggerezza non è superficialità, ma planare sulle cose dall'alto.", source: "Italo Calvino" },
      { id: 'it-s-3', text: "Non si ricordano i giorni, si ricordano gli attimi.", source: "Cesare Pavese" },
      { id: 'it-s-4', text: "Chi non legge, a 70 anni avrà vissuto una sola vita. Chi legge avrà vissuto 5000 anni.", source: "Umberto Eco" }
    ],
    medium: [
      { id: 'it-m-1', text: "Il profumo del caffè appena fatto saliva lentamente per la stanza, mentre fuori una pioggia leggera accarezzava i tetti dorati della città.", source: "Mattina d'Autunno" },
      { id: 'it-m-2', text: "D'una città non godi le meraviglie passeggere, ma la risposta calma che offre al tuo cuore quando cerchi rifugio nei suoi vicoli silenziosi.", source: "Italo Calvino, Le città invisibili" }
    ],
    long: [
      { id: 'it-l-1', text: "Nella penombra calda del piccolo salotto, tra tazze di ceramica artigianale e libri rilegati in tela, il gattino dormiva sereno. Il ritmo delicato delle dita sui tasti creava una melodia intima e rilassante, lontana da ogni fretta del mondo.", source: "Racconti del Santuario" }
    ]
  },
  portuguese: {
    short: [
      { id: 'pt-s-1', text: "Tudo vale a pena se a alma não é pequena.", source: "Fernando Pessoa" },
      { id: 'pt-s-2', text: "Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei.", source: "Clarice Lispector" },
      { id: 'pt-s-3', text: "O tempo é um rato roedor das coisas, que as diminui ou altera no silêncio dos dias.", source: "Machado de Assis" },
      { id: 'pt-s-4', text: "É preciso sair da ilha para ver a ilha. Não nos vemos se não saímos de nós mesmos.", source: "José Saramago" }
    ],
    medium: [
      { id: 'pt-m-1', text: "Na quietude desta tarde suave, entre uma chávena de chá quente e o som compassado das teclas, encontro a paz que as ruas apressadas nunca souberam guardar.", source: "Fernando Pessoa, Livro do Desassossego" },
      { id: 'pt-m-2', text: "A chuva caía macia sobre as folhas da varanda enquanto o gato se enroscava na manta de lã, ronronando em perfeita harmonia com o silêncio da casa.", source: "Tarde Tranquila" }
    ],
    long: [
      { id: 'pt-l-1', text: "Tenho em mim todos os sonhos do mundo. Quando abro as páginas de um livro querido e sinto o aroma reconfortante do café fresco, percebo que os melhores refúgios da vida são construídos com pequenas delicadezas e passos lentos.", source: "Refúgio Literário" }
    ]
  },
  dutch: {
    short: [
      { id: 'nl-s-1', text: "Hoe heerlijk is het dat niemand een minuut hoeft te wachten om te beginnen de wereld te verbeteren.", source: "Anne Frank" },
      { id: 'nl-s-2', text: "Van de maan af gezien zijn we allen even groot.", source: "Multatuli" },
      { id: 'nl-s-3', text: "De stilte spreekt een taal die alleen een rustig hart kan verstaan.", source: "Nederlandse Wijsheden" }
    ],
    medium: [
      { id: 'nl-m-1', text: "Buiten ruist de herfstwind door de bomen langs de gracht, maar binnen heerst de tijdloze warmte van verhalen, thee en zachte muziek.", source: "Herfst aan de Gracht" },
      { id: 'nl-m-2', text: "In de vroege ochtend, wanneer de mist nog over de velden ligt, brengt het zachte tikken van de toetsen een kalme helderheid in de geest.", source: "Ochtendgloren" }
    ],
    long: [
      { id: 'nl-l-1', text: "De rust van een oude bibliotheek is als een veilige haven voor het denkende gemoed. Tussen de rijen van verweerde boekenruggen en het zachte schijnsel van de koperen lamp vergeet men de tijd en hervindt men de eenvoud van het bestaan.", source: "De Haven van Gedachten" }
    ]
  },
  polish: {
    short: [
      { id: 'pl-s-1', text: "Nic dwa razy się nie zdarza i nie zdarzy.", source: "Wisława Szymborska" },
      { id: 'pl-s-2', text: "W mojej ojczyźnie, do której nie wrócę, jest takie leśne jezioro ogromne.", source: "Czesław Miłosz" },
      { id: 'pl-s-3', text: "Człowiek wyruszył na spotkanie innych światów, nie poznawszy do końca swoich własnych zakamarków.", source: "Stanisław Lem" }
    ],
    medium: [
      { id: 'pl-m-1', text: "W zaciszu ciepłego pokoju, przy filiżance parującej herbaty, słowa układają się w łagodny rytm, przynosząc ukojenie zmęczonym myślom.", source: "Olga Tokarczuk" },
      { id: 'pl-m-2', text: "Jesienny deszcz cicho bębnił w szyby, a w pokoju pachniało cynamonem i świeżo zaparzoną kawą.", source: "Ciepły Wieczór" }
    ],
    long: [
      { id: 'pl-l-1', text: "Świat jest tkaniną, którą tkamy codziennie na nowo. Każde łagodne uderzenie w klawisze, każdy spokojny oddech i chwila skupienia przypominają, że prawdziwy spokój rodzi się w prostocie obecnej chwili.", source: "Tkactwo Spokoju" }
    ]
  },
  russian: {
    short: [
      { id: 'ru-s-1', text: "В человеке должно быть всё прекрасно: и лицо, и одежда, и душа, и мысли.", source: "Антон Чехов" },
      { id: 'ru-s-2', text: "Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему.", source: "Лев Толстой" },
      { id: 'ru-s-3', text: "Рукописи не горят. В тишине утреннего света слова обретают вечную жизнь.", source: "Михаил Булгаков" },
      { id: 'ru-s-4', text: "Красота спасёт мир, когда мы научимся замечать её в самых тихих мелочах.", source: "Фёдор Достоевский" }
    ],
    medium: [
      { id: 'ru-m-1', text: "За окном кружились первые снежинки, укрывая сад белым пушистым одеялом, а в уютной комнате тихо потрескивал огонь в печи и пахло горячим чаем с чабрецом.", source: "Зимний Вечер" },
      { id: 'ru-m-2', text: "Спокойствие духа начинается там, где человек находит искреннюю радость в неспешном труде, любимой книге и чашке тёплого молока с мёдом.", source: "Утренний Покой" }
    ],
    long: [
      { id: 'ru-l-1', text: "Есть особая прелесть в ранних часах, когда весь дом ещё спит. Чайник на кухне тихо закипает, за окном брезжит нежный рассвет, и ваши мысли принадлежат только вам. В этом тихом промежутке между сном и явью можно обрести душевный мир на весь предстоящий день.", source: "Рассвет в Убежище" }
    ]
  },
  japanese_romaji: {
    short: [
      { id: 'ja-s-1', text: "Tsuki ga kirei desu ne. Kono shizuka na yoru ni anata to onaji sora o mitsumete imasu.", source: "Natsume Soseki" },
      { id: 'ja-s-2', text: "Furuike ya kawazu tobikomu mizu no oto.", source: "Matsuo Basho" },
      { id: 'ja-s-3', text: "Ame ni mo makezu, kaze ni mo makezu, shizuka ni waratte ikiru hito ni naritai.", source: "Kenji Miyazawa" },
      { id: 'ja-s-4', text: "Hito wa dareka to atatakai ocha o nomu dake de sukuwareru koto ga aru.", source: "Osamu Dazai" }
    ],
    medium: [
      { id: 'ja-m-1', text: "Donna ni kurai yoru demo, kanarazu asa wa kuru. Shizuka na heya de kokoro o ochitsukete, yukkuri to mae o muki mashou.", source: "Haruki Murakami" },
      { id: 'ja-m-2', text: "Mado no soto dewa yasashii ame ga futteite, kotatsu no naka dewa shiroi neko ga maruku natte nemutte imasu.", source: "Ame no Nichiyoubi" },
      { id: 'ja-m-3', text: "Hidamari no naka de ocha o susuri nagara, ki no nukumori o kanjiru jikan wa nani yori mo zeitaku desu.", source: "Nagomi no Jikan" }
    ],
    long: [
      { id: 'ja-l-1', text: "Shigure no oto o kikinagara, atatakai heya de hon o yomu jikan koso ga, jinsei ni okeru hontou no fukami to yasuragi o ataete kuremasu. Kii o osu tabi ni kokoro ga sukitotte yuku you na, odayaka na gogo no hitotoki desu.", source: "Pawtap no Mori" }
    ]
  },
  indonesian: {
    short: [
      { id: 'id-s-1', text: "Aku ingin mencintaimu dengan sederhana, dengan kata yang tak sempat diucapkan kayu kepada api.", source: "Sapardi Djoko Damono" },
      { id: 'id-s-2', text: "Kalian boleh maju dalam pelajaran, tapi jangan pernah kehilangan kehangatan nurani.", source: "Pramoedya Ananta Toer" },
      { id: 'id-s-3', text: "Hujan bulan Juni membasahi bumi dengan ketabahan yang tak terucapkan.", source: "Sajak Hujan" }
    ],
    medium: [
      { id: 'id-m-1', text: "Ketenangan hati adalah harta terbesar. Di dalam kehangatan secangkir kopi pagi, kita menemukan semangat baru untuk melangkah dengan penuh keyakinan dan kelembutan.", source: "Catatan Pagi" },
      { id: 'id-m-2', text: "Kucing kecil itu mendengkur pelan di dekat jendela, menikmati semilir angin sepoi-sepoi dan hangatnya sinar mentari yang menyapa beranda rumah.", source: "Sore di Beranda" }
    ],
    long: [
      { id: 'id-l-1', text: "Ada kedamaian yang mendalam di saat-saat tenang sebelum dunia riuh dengan kesibukannya. Ditemani harum teh melati dan denting lembut ketukan jari pada tuts, setiap beban pikiran perlahan memudar menjadi keikhlasan yang menyejukkan jiwa.", source: "Kedamaian Suaka" }
    ]
  },
  swedish: {
    short: [
      { id: 'sv-s-1', text: "Ge barnen kärlek, mera kärlek och ännu mera kärlek, så kommer folkvettet av sig självt.", source: "Astrid Lindgren" },
      { id: 'sv-s-2', text: "Skäms inte för att du är människa, var stolt! Inne i dig öppnar sig valv bakom valv oändligt.", source: "Tomas Tranströmer" },
      { id: 'sv-s-3', text: "Ja visst gör det ont när knoppar brister. Varför skulle annars våren tveka?", source: "Karin Boye" }
    ],
    medium: [
      { id: 'sv-m-1', text: "I den stilla kvällen lyser den lilla lampan milt över skrivbordet, och doften av nybryggt kaffe fyller stugan med en varm och trygg känsla.", source: "Kvällsro i Stugan" },
      { id: 'sv-m-2', text: "Snön föll sakta utanför fönstret medan elden sprakade mjukt i kakelugnen. Det fanns ingen brådska i hela världen, bara denna fridfulla stund.", source: "Vinterfrid" }
    ],
    long: [
      { id: 'sv-l-1', text: "Ingen kan lära en människa något som hon inte redan bär en aning om i sitt hjärta. När fingrarna rör sig över tangenterna i jämn rytm, skingras dagens bekymmer som morgondimma över en stilla skogssjö, och sinnet finner åter sin ro.", source: "Selma Lagerlöf & Nordisk Filosofi" }
    ]
  },
  turkish: {
    short: [
      { id: 'tr-s-1', text: "Dünle beraber gitti cancağızım, ne kadar söz varsa düne ait. Şimdi yeni şeyler söylemek lazım.", source: "Mevlana Celaleddin Rumi" },
      { id: 'tr-s-2', text: "Sevelim, sevilelim; bu dünya kimseye kalmaz.", source: "Yunus Emre" },
      { id: 'tr-s-3', text: "Yaşamak bir ağaç gibi tek ve hür ve bir orman gibi kardeşçesine, bu hasret bizim.", source: "Nazım Hikmet" }
    ],
    medium: [
      { id: 'tr-m-1', text: "Sessiz bir odada kitap okumak ve sıcak bir bardak çay yudumlamak, yorgun bir ruhu iyileştiren en güzel sığınaktır.", source: "Sabahattin Ali" },
      { id: 'tr-m-2', text: "Yağmur damlaları camlara vururken, odadaki kedinin mırıltısı ve tuşların tatlı sesi odaya huzurlu bir melodi katıyordu.", source: "Huzurlu Akşamlar" }
    ],
    long: [
      { id: 'tr-l-1', text: "Hayatımın en mutlu anıymış, bilmiyordum. Yağmurlu bir sonbahar gününde sıcak bir çay eşliğinde mekanik tuşların tatlı tıkırtısını dinlemek, insana tüm dünyanın telaşını unutturacak derin ve duru bir iç huzur verir.", source: "Orhan Pamuk, Masumiyet Müzesi" }
    ]
  },
  korean: {
    short: [
      { id: 'ko-s-1', text: "죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를, 잎새에 이는 바람에도 나는 괴로워했다.", source: "윤동주, 서시" },
      { id: 'ko-s-2', text: "가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야만 분명하게 볼 수 있어.", source: "생텍쥐페리, 어린 왕자" },
      { id: 'ko-s-3', text: "자세히 보아야 예쁘다. 오래 보아야 사랑스럽다. 너도 그렇다.", source: "나태주, 풀꽃" },
      { id: 'ko-s-4', text: "나 보기가 역겨워 가실 때에는 말없이 고이 보내 드리우리다.", source: "김소월, 진달래꽃" },
      { id: 'ko-s-5', text: "고요한 마음에 비치는 달빛처럼, 작은 쉼표 하나가 하루의 위로가 된다.", source: "달빛 산책" }
    ],
    medium: [
      { id: 'ko-m-1', text: "달이 어지간히 기울어 있었다. 고요한 밤길을 걸으며 따뜻한 차 한 잔을 떠올리면, 지친 마음에 잔잔한 위로와 평화가 찾아온다.", source: "이효석, 메밀꽃 필 무렵" },
      { id: 'ko-m-2', text: "비 내리는 오후, 창가에 앉아 따스한 커피 향을 맡으며 부드러운 자판을 두드리는 시간은 온전한 나만의 안식처가 되어준다.", source: "오후의 찻집" },
      { id: 'ko-m-3', text: "새하얀 고양이가 책상 모퉁이에서 조용히 숨을 고르고, 부드러운 타건 소리는 방 안을 평온한 온기로 채워준다.", source: "포근한 기록" }
    ],
    long: [
      { id: 'ko-l-1', text: "삶의 무게에 짓눌려 허덕일 때, 조용한 방에서 따뜻한 차를 마시며 책 한 권을 펼쳐 드는 것만으로도 영혼은 다시 숨을 쉰다. 소박하고 정갈한 일상의 평온함이야말로 우리가 끝내 지켜내야 할 가장 귀한 축복이다.", source: "박완서, 일상의 기적" },
      { id: 'ko-l-2', text: "이른 새벽 창문을 열면 차가운 공기 속으로 은은한 풀꽃 향기가 스며든다. 세상이 깨어나기 전, 조용히 책상 앞에 앉아 한 글자씩 정성스럽게 적어 내려가는 순간마다 마음에 맑은 등불이 켜진다.", source: "새벽의 안식처" }
    ]
  },
  chinese: {
    short: [
      { id: 'zh-s-1', text: "Chuang qian ming yue guang, yi shi di shang shuang. Ju tou wang ming yue, di tou si gu xiang.", source: "Li Bai, Jing Ye Si" },
      { id: 'zh-s-2', text: "Xue er shi xi zhi, bu yi yue hu? You peng zi yuan fang lai, bu yi le hu?", source: "Confucius, Lun Yu" },
      { id: 'zh-s-3', text: "Qian li zhi xing, shi yu zu xia. Zhi ren zhe zhi, zi zhi zhe ming.", source: "Laozi, Dao De Jing" },
      { id: 'zh-s-4', text: "Dan yuan ren chang jiu, qian li gong chan juan.", source: "Su Shi, Shui Diao Ge Tou" },
      { id: 'zh-s-5', text: "Sheng ru xia hua zhi xunlan, si ru qiu ye zhi jingmei.", source: "Rabindranath Tagore & Zheng Zhenduo" }
    ],
    medium: [
      { id: 'zh-m-1', text: "Rensheng bu guo shi yi chang lvcheng. Dongde xiangshou pingdan rizi de ren, cai neng zhenzheng tiwei dao shenghuo de wenrou yu meihao.", source: "Lin Yutang, Sheng Huo De Yi Shu" },
      { id: 'zh-m-2', text: "Zai yige anjing de wanshang, pao yi bei re cha, tingzhe chuangwai de xiyu sheng, xinling ziran hui shuhuai qilai.", source: "Cha Xiang Sui Bi" },
      { id: 'zh-m-3', text: "Xiao mao zai chuangtai shang heshang le shuangyan, wenxiang de kafei he qingcui de jianpan sheng rang shiguang bian de man le xialai.", source: "Wu Hou De Ningjing" }
    ],
    long: [
      { id: 'zh-l-1', text: "Waimian xiaxie xiyu, wunei que wunuan ruchun. Yi bei nongyu de kafei, yi ben houhou de shuben, jianpan shang qingcui de qiaoji sheng, rang shiguang zai zheli fangman le jiaobu, liuxia le wujin de wenxin yu pingjing.", source: "Pawtap Shan Ju Bi Ji" },
      { id: 'zh-l-2', text: "Chenguang touguo chuanglian sa zai mutou zhuozi shang, re cha de qiwu manman shengqi. Zai zhe duanzan de ningjing zhong, mei yici qiaoji du shi yu ziji xinling de wenrou duihua, pinghe er chongshi.", source: "Chenxi De Anxiang" }
    ]
  }
};

// Aliases for matching language IDs
QUOTES_BY_LANGUAGE.english_cozy = QUOTES_BY_LANGUAGE.english;

// Default English quotes export for backward compatibility
export const QUOTES = QUOTES_BY_LANGUAGE.english;

/**
 * Returns a random quote matching the specified length and language.
 * Falls back gracefully to English if language or specific length is unavailable.
 * @param {'short' | 'medium' | 'long'} length
 * @param {string} language
 */
export function getRandomQuote(length = 'medium', language = 'english') {
  const targetLang = (language && QUOTES_BY_LANGUAGE[language]) ? language : 'english';
  const langCollection = QUOTES_BY_LANGUAGE[targetLang] || QUOTES_BY_LANGUAGE.english;
  const list = langCollection[length] || langCollection.medium || langCollection.short || QUOTES_BY_LANGUAGE.english[length] || QUOTES_BY_LANGUAGE.english.medium;

  if (!list || list.length === 0) {
    return QUOTES_BY_LANGUAGE.english.medium[0];
  }

  return list[Math.floor(Math.random() * list.length)];
}
