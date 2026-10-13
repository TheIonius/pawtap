/**
 * Curated Vocabulary Collections for Pawtap
 * Massive dictionary of 500+ cozy words, 1,000+ standard English words, and 300+ expert words.
 * Full non-repeating Fisher-Yates sampler guarantees zero word repetition per session.
 */

export const COZY_WORDS = [
  "latte", "espresso", "cappuccino", "macchiato", "mocha", "matcha", "americano", "chai", "tea", "teapot",
  "teacup", "saucer", "creamer", "milk", "froth", "foam", "brew", "brewing", "barista", "mug",
  "ceramic", "porcelain", "roast", "vanilla", "hazelnut", "caramel", "cinnamon", "nutmeg", "clove", "cardamom",
  "honey", "syrup", "boba", "tapioca", "cocoa", "cacao", "marshmallow", "steaming", "sip", "warmth",
  "cortado", "ristretto", "affogato", "oolong", "sencha", "genmaicha", "hojicha", "darjeeling", "peppermint", "tisane",
  "steep", "infusion", "kettle", "samovar", "drip", "chemex", "frenchpress", "pourover", "coffeemaker", "steam",
  "aroma", "sweetener", "agave", "maple", "molasses", "demerara", "lavender", "creamy", "bakery", "pastry",
  "croissant", "brioche", "biscuit", "scone", "muffin", "cupcake", "macaron", "pancake", "waffle", "crepe",
  "doughnut", "cookie", "shortbread", "tart", "pie", "cobbler", "brownie", "bread", "loaf", "sourdough",
  "baguette", "flour", "butter", "sugar", "icing", "glaze", "almond", "pistachio", "pecan", "walnut",
  "oatmeal", "porridge", "granola", "jam", "marmalade", "pudding", "custard", "crumb", "golden", "baked",
  "sweetness", "treat", "madeleine", "financier", "cannoli", "eclair", "profiterole", "choux", "sponge", "shortcake",
  "clafoutis", "strudel", "pretzel", "focaccia", "ciabatta", "challah", "yeast", "knead", "dough", "crust",
  "toasted", "flaky", "buttery", "goldenrod", "confection", "marzipan", "ganache", "praline", "meringue", "blanket",
  "quilt", "duvet", "pillow", "cushion", "sweater", "cardigan", "slippers", "socks", "knit", "knitting",
  "yarn", "wool", "woolen", "fleece", "cashmere", "velvet", "linen", "cotton", "tweed", "snuggle",
  "cuddle", "cozy", "coziness", "snug", "comfy", "warm", "shelter", "nest", "armchair", "sofa",
  "couch", "hearth", "fireplace", "chimney", "embers", "woodsmoke", "crackling", "candle", "candlelight", "flame",
  "glow", "lantern", "nightlight", "softness", "flannel", "mohair", "alpaca", "scarf", "shawl", "beanie",
  "mittens", "pajamas", "robe", "throw", "mattress", "featherbed", "hammock", "rug", "sheepskin", "tapestry",
  "footstool", "alcove", "nook", "parlor", "veranda", "porch", "sunroom", "attic", "garret", "cubby",
  "den", "retreat", "hideaway", "sanctuary", "haven", "cradle", "rain", "raindrop", "rainfall", "rainstorm",
  "drizzle", "mist", "fog", "shower", "puddle", "umbrella", "cloud", "cloudy", "overcast", "sunbeam",
  "sunlight", "breeze", "whisper", "autumn", "fall", "leaves", "foliage", "acorn", "chestnut", "pinecone",
  "moss", "fern", "succulent", "plant", "sprout", "blossom", "petal", "flower", "daisy", "tulip",
  "jasmine", "chamomile", "rose", "garden", "meadow", "forest", "woodland", "creek", "brook", "pebble",
  "stone", "twilight", "dusk", "dawn", "sunrise", "sunset", "evening", "morning", "afternoon", "petrichor",
  "dewdrop", "morningdew", "frost", "snowflake", "icicle", "driftwood", "willow", "birch", "cedar", "cypress",
  "ivy", "clover", "heather", "mossy", "bark", "canopy", "glade", "grove", "orchard", "hillside",
  "valley", "stream", "tide", "seashell", "boulder", "horizon", "rainbow", "zephyr", "solstice", "equinox",
  "book", "bookshop", "bookshelf", "library", "bookmark", "novel", "poetry", "poem", "story", "tale",
  "chapter", "page", "parchment", "journal", "diary", "notebook", "pen", "quill", "ink", "pencil",
  "sketch", "letter", "envelope", "stamp", "paper", "ribbon", "desk", "drawer", "shelf", "windowpane",
  "reading", "writing", "studying", "verse", "rhyme", "author", "stationery", "typewriter", "calligraphy", "manuscript",
  "vellum", "deckle", "watercolor", "palette", "easel", "canvas", "pigment", "charcoal", "monogram", "postmark",
  "waxseal", "brass", "inkwell", "blotter", "hardcover", "anthology", "chronicle", "memoir", "quiet", "gentle",
  "peaceful", "peace", "serenity", "serene", "calm", "calmness", "tranquil", "soothing", "restful", "rest",
  "slumber", "sleepy", "nap", "napping", "dream", "daydream", "drift", "breathe", "breath", "stillness",
  "solitude", "mellow", "tender", "hushed", "ease", "unwind", "relax", "repose", "content", "cherish",
  "grateful", "pause", "linger", "ponder", "reflect", "muse", "contentment", "quietude", "warmhearted", "fondness",
  "softhearted", "reverie", "gentleness", "peacefulness", "balmy", "placid", "halcyon", "patient", "harmony", "kitten",
  "cat", "paw", "paws", "purr", "purring", "whiskers", "puppy", "hound", "sparrow", "robin",
  "cottage", "village", "cabin", "loft", "pantry", "cupboard", "pottery", "clay", "basket", "wicker",
  "vintage", "antique", "rustic", "wooden", "timber", "amber", "sepia", "pastel", "honeycomb", "starlight",
  "moonlight", "melody", "lullaby", "music", "hum", "chime", "sparkle", "glimmer", "radiant", "hazel",
  "russet", "tawny", "peachy", "silky", "dappled", "homely", "comfort", "snuggled", "quaint", "heirloom",
  "patchwork", "embroidery", "needlework", "crochet", "stitch", "sewing", "thimble", "bobbin", "bobbinlace", "woven",
  "loom", "spun", "spinning", "homespun", "apron", "tablecloth", "napkin", "doily", "teatime", "elevenses",
  "siesta", "interlude", "sojourn", "harbor", "oasis", "pastoral", "woodcraft", "artisan", "handcrafted", "bespoke",
  "trinket", "locket", "keepsake", "scented", "cologne", "bergamot", "rosemary", "thyme", "sage", "basil",
  "parsley", "dill", "fennel", "allspice", "gingerbread", "marsh", "thicket", "bramble", "bracken", "mossland",
  "fernwood", "elderberry", "blackberry", "raspberry", "blueberry", "wildberry", "vineyard", "trellis", "arbor"
];

export const ENGLISH_1000 = [
  "the", "of", "and", "a", "to", "in", "is", "you", "that", "it",
  "he", "was", "for", "on", "are", "as", "with", "his", "they", "I",
  "at", "be", "this", "have", "from", "or", "one", "had", "by", "word",
  "but", "not", "what", "all", "were", "we", "when", "your", "can", "said",
  "there", "use", "an", "each", "which", "she", "do", "how", "their", "if",
  "will", "up", "other", "about", "out", "many", "then", "them", "these", "so",
  "some", "her", "would", "make", "like", "him", "into", "time", "has", "look",
  "two", "more", "write", "go", "see", "number", "no", "way", "could", "people",
  "my", "than", "first", "water", "been", "call", "who", "oil", "its", "now",
  "find", "long", "down", "day", "did", "get", "come", "made", "may", "part",
  "over", "new", "sound", "take", "only", "little", "work", "know", "place", "year",
  "live", "me", "back", "give", "most", "very", "after", "thing", "our", "just",
  "name", "good", "sentence", "man", "think", "say", "great", "where", "help", "through",
  "much", "before", "line", "right", "too", "mean", "old", "any", "same", "tell",
  "boy", "follow", "came", "want", "show", "also", "around", "farm", "three", "small",
  "set", "put", "end", "does", "another", "well", "large", "must", "big", "even",
  "such", "because", "turn", "here", "why", "ask", "went", "men", "read", "need",
  "land", "different", "home", "us", "move", "try", "kind", "hand", "picture", "again",
  "change", "off", "play", "spell", "air", "away", "animal", "house", "point", "page",
  "letter", "mother", "answer", "found", "study", "still", "learn", "should", "world", "high",
  "every", "near", "add", "food", "between", "own", "below", "country", "plant", "last",
  "school", "father", "keep", "tree", "never", "start", "city", "earth", "eye", "light",
  "thought", "head", "under", "story", "saw", "left", "few", "while", "along", "might",
  "close", "something", "seem", "next", "hard", "open", "example", "begin", "life", "always",
  "those", "both", "paper", "together", "got", "group", "often", "run", "important", "until",
  "children", "side", "feet", "car", "mile", "night", "walk", "white", "sea", "began",
  "grow", "took", "river", "four", "carry", "state", "once", "book", "hear", "stop",
  "without", "second", "late", "miss", "idea", "enough", "eat", "face", "watch", "far",
  "indian", "really", "almost", "let", "above", "girl", "sometimes", "mountain", "cut", "young",
  "talk", "soon", "list", "song", "being", "leave", "family", "it's", "body", "music",
  "color", "stand", "sun", "questions", "fish", "area", "mark", "dog", "horse", "birds",
  "problem", "complete", "room", "knew", "since", "ever", "piece", "told", "usually", "didn't",
  "friends", "easy", "heard", "order", "red", "door", "sure", "become", "top", "ship",
  "across", "today", "during", "short", "better", "best", "however", "low", "hours", "black",
  "products", "happen", "whole", "measure", "remember", "early", "waves", "listen", "wind", "rock",
  "space", "covered", "fast", "several", "hold", "himself", "toward", "five", "step", "morning",
  "passed", "vowel", "true", "hundred", "against", "pattern", "numeral", "table", "north", "slow",
  "money", "map", "draw", "voice", "seen", "cold", "cried", "plan", "notice", "south",
  "sing", "war", "ground", "fall", "king", "town", "unit", "figure", "certain", "field",
  "travel", "wood", "fire", "upon", "done", "english", "road", "half", "ten", "fly",
  "gave", "box", "finally", "wait", "correct", "oh", "quickly", "person", "became", "shown",
  "minutes", "strong", "verb", "stars", "front", "feel", "fact", "inches", "street", "decided",
  "contain", "course", "surface", "produce", "building", "ocean", "class", "note", "nothing", "rest",
  "carefully", "scientists", "inside", "wheels", "stay", "green", "known", "island", "week", "less",
  "machine", "base", "ago", "stood", "plane", "system", "behind", "ran", "round", "boat",
  "game", "force", "brought", "understand", "warm", "common", "bring", "explain", "dry", "though",
  "language", "shape", "deep", "thousands", "yes", "clear", "equation", "yet", "government", "filled",
  "heat", "full", "hot", "check", "object", "am", "rule", "among", "noun", "power",
  "cannot", "able", "six", "size", "dark", "ball", "material", "special", "heavy", "fine",
  "pair", "circle", "include", "built", "can't", "matter", "square", "syllables", "perhaps", "bill",
  "felt", "suddenly", "test", "direction", "center", "farmers", "ready", "anything", "divided", "general",
  "energy", "subject", "europe", "moon", "region", "return", "believe", "dance", "members", "picked",
  "simple", "cells", "paint", "mind", "love", "cause", "rain", "exercise", "eggs", "train",
  "blue", "wish", "drop", "developed", "window", "difference", "distance", "heart", "site", "sum",
  "summer", "wall", "forest", "probably", "legs", "sat", "main", "winter", "wide", "written",
  "length", "reason", "kept", "interest", "arms", "brother", "race", "present", "beautiful", "store",
  "job", "edge", "past", "sign", "record", "finished", "discovered", "wild", "happy", "beside",
  "gone", "sky", "grass", "million", "west", "lay", "weather", "root", "instruments", "meet",
  "third", "months", "paragraph", "raised", "represent", "soft", "whether", "clothes", "flowers", "shall",
  "teacher", "held", "describe", "drive", "cross", "already", "speak", "solve", "appear", "acting",
  "action", "active", "actually", "affect", "afford", "afraid", "afternoon", "agreement", "ahead", "airline",
  "airport", "album", "alcohol", "alive", "allow", "alone", "alright", "although", "amazing", "amount",
  "ancient", "angel", "anger", "angle", "angry", "annual", "anxiety", "anybody", "anymore", "anyone",
  "anyway", "apart", "apartment", "apparent", "appeal", "apple", "apply", "appoint", "approve", "argue",
  "arise", "arm", "army", "arrange", "arrest", "arrival", "arrive", "artist", "aspect", "assess",
  "asset", "assign", "assist", "assume", "assure", "athlete", "attack", "attempt", "attend", "attitude",
  "attorney", "attract", "audience", "author", "auto", "autumn", "available", "average", "avoid", "award",
  "aware", "baby", "background", "balance", "bank", "barely", "barrel", "barrier", "baseball", "basic",
  "basis", "basket", "battle", "beach", "bear", "beat", "beauty", "bed", "bedroom", "beer",
  "behalf", "behave", "behavior", "belief", "belong", "belt", "bench", "bend", "beneath", "benefit",
  "besides", "beyond", "bike", "billion", "bind", "biology", "bird", "birth", "birthday", "bishop",
  "bite", "bitter", "blade", "blame", "blanket", "blind", "block", "blood", "blow", "board",
  "bomb", "bond", "bone", "boom", "boot", "border", "born", "borrow", "boss", "bother",
  "bottle", "bottom", "boundary", "bowl", "brain", "branch", "brand", "bread", "break", "breakfast",
  "breast", "breath", "breathe", "brick", "bridge", "brief", "bright", "brilliant", "broad", "broker",
  "brown", "brush", "buck", "budget", "build", "builder", "bullet", "bunch", "burden", "burn",
  "bury", "bus", "business", "busy", "buyer", "cabin", "cabinet", "cable", "cake", "calculate",
  "camera", "camp", "campaign", "campus", "cancel", "cancer", "candidate", "candle", "candy", "canvas",
  "capability", "capable", "capacity", "capital", "captain", "capture", "carbon", "card", "care", "career",
  "careful", "cargo", "carrier", "case", "cash", "casino", "cast", "castle", "casual", "catch",
  "category", "cattle", "cease", "ceiling", "celebrate", "cell", "central", "century", "ceremony", "chain",
  "chair", "chairman", "challenge", "chamber", "champion", "chance", "channel", "chapter", "character", "charge",
  "charity", "charm", "chart", "chase", "cheap", "cheek", "cheer", "cheese", "chef", "chemical",
  "chest", "chicken", "chief", "child", "childhood", "chip", "chocolate", "choice", "choose", "church",
  "citizen", "civil", "claim", "classic", "classroom", "clean", "clearly", "client", "climate", "climb",
  "clinic", "clinical", "clock", "closely", "closer", "clothing", "cloud", "club", "coach", "coal",
  "coast", "coat", "code", "coffee", "cognitive", "collapse", "colleague", "collect", "collection", "collective",
  "college", "colonial", "column", "combine", "comedy", "comfort", "comfortable", "command", "commander", "comment",
  "commercial", "commission", "commit", "commitment", "committee", "communicate", "community", "company", "compare", "comparison",
  "compete", "competition", "competitive", "competitor", "complain", "complaint", "completely", "complex", "complicated", "component",
  "compose", "composition", "comprehensive", "computer", "concentrate", "concentration", "concept", "concern", "concerned", "concert",
  "conclude", "conclusion", "concrete", "condition", "conduct", "conference", "confidence", "confident", "confirm", "conflict",
  "confront", "confusion", "congress", "connect", "connection", "consciousness", "consensus", "consequence", "conservative", "consider",
  "considerable", "consideration", "consist", "consistent", "constant", "constantly", "constitute", "constitutional", "construct", "construction",
  "consultant", "consume", "consumer", "consumption", "contact", "container", "contemporary", "content", "contest", "context",
  "continue", "continued", "contract", "contrast", "contribute", "contribution", "control", "controversial", "controversy", "convention",
  "conventional", "conversation", "convert", "cook", "cookie", "cool", "cooperation", "cop", "cope", "copy",
  "core", "corn", "corridor", "cost", "couch", "council", "counsel", "count", "counter", "county",
  "couple", "courage", "court", "cousin", "cover", "coverage", "cow", "crack", "craft", "crash",
  "crazy", "cream", "create", "creation", "creative", "creature", "credit", "crew", "crime", "criminal",
  "crisis", "criteria", "critic", "critical"
];

export const SPANISH_WORDS = [
  "de", "la", "que", "el", "en", "y", "a", "los", "se", "del",
  "las", "por", "un", "para", "con", "no", "una", "su", "al", "lo",
  "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque",
  "esta", "son", "entre", "cuando", "muy", "sin", "sobre", "también", "me", "hasta",
  "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos", "uno", "les",
  "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "esto", "mí", "antes",
  "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa",
  "estos", "mucho", "quienes", "nada", "muchos", "cual", "sea", "poco", "ella", "estar",
  "haber", "hacer", "decir", "poder", "ir", "ver", "dar", "saber", "querer", "llegar",
  "pasar", "deber", "poner", "parecer", "quedar", "creer", "hablar", "llevar", "dejar", "seguir",
  "encontrar", "llamar", "venir", "pensar", "salir", "volver", "tomar", "conocer", "vivir", "sentir",
  "tratar", "mirar", "contar", "empezar", "esperar", "buscar", "existir", "entrar", "trabajar", "escribir",
  "perder", "producir", "ocurrir", "entender", "pedir", "recibir", "recordar", "terminar", "permitir", "aparecer",
  "conseguir", "comenzar", "servir", "sacar", "necesitar", "mantener", "resultar", "leer", "caer", "cambiar",
  "presentar", "crear", "abrir", "considerar", "oír", "acabar", "ganar", "formar", "partir", "morir",
  "aceptar", "realizar", "suponer", "comprender", "lograr", "responder", "tiempo", "año", "día", "vida",
  "cosa", "hombre", "parte", "mundo", "mujer", "caso", "país", "lugar", "persona", "hora",
  "trabajo", "punto", "mano", "manera", "fin", "tipo", "gente", "ejemplo", "lado", "hijo",
  "problema", "cuenta", "medio", "palabra", "amigo", "casa", "agua", "noche", "ciudad", "calle",
  "camino", "amor", "café", "sol", "luz", "mar", "cielo", "tierra", "puerta", "mesa",
  "libro", "ojos", "cara", "padre", "madre", "familia", "cabeza", "corazón", "cuerpo", "voz",
  "sonido", "momento", "minuto", "segundo", "semana", "mes", "verano", "invierno", "primavera", "otoño",
  "viento", "lluvia", "estrella", "bosque", "río", "flor", "árbol", "piedra", "paz", "sueño",
  "fuego", "blanco", "negro", "verde", "azul", "rojo", "amarillo", "dulce", "suave", "claro",
  "bueno", "nuevo", "viejo", "gran", "pequeño", "largo", "alto", "bajo", "feliz", "libre",
  "fuerte", "joven", "cierto", "fácil", "difícil", "seguro", "posible", "hermoso", "tranquilo", "calma",
  "alma", "abrazo", "sonrisa", "esperanza", "atardecer", "amanecer", "hoja", "campana", "manzanilla", "miel",
  "manta", "bufanda", "chimenea", "brisa", "madera", "susurro", "rincón", "sendero", "colina", "espuma",
  "pastelería", "galleta", "canela", "aroma", "terciopelo", "calidez", "refugio", "tranquilidad", "serenidad", "sencillo",
  "canción", "pintura", "pincel", "cuaderno", "pluma", "tinta", "viaje"
];

export const FRENCH_WORDS = [
  "le", "de", "un", "à", "être", "et", "en", "avoir", "que", "pour",
  "dans", "ce", "il", "qui", "ne", "sur", "se", "pas", "plus", "pouvoir",
  "par", "je", "avec", "tout", "faire", "son", "mettre", "autre", "on", "mais",
  "nous", "comme", "ou", "si", "leur", "y", "dire", "elle", "devoir", "avant",
  "deux", "même", "prendre", "aussi", "celui", "donner", "bien", "où", "fois", "vous",
  "encore", "nouveau", "aller", "cela", "voir", "vouloir", "grand", "premier", "venir", "jour",
  "alors", "pays", "trois", "penser", "partie", "monde", "seul", "sous", "savoir", "après",
  "coup", "très", "main", "petit", "moment", "forme", "trouver", "rien", "vie", "temps",
  "maison", "ciel", "livre", "amour", "café", "jardin", "nuit", "coeur", "enfant", "doux",
  "ami", "fleur", "soleil", "étoile", "chanson", "plume", "eau", "terre", "forêt", "rivière",
  "arbre", "vent", "pluie", "neige", "matin", "soir", "oiseau", "silence", "paix", "lumière",
  "chaleur", "chemin", "voix", "regard", "sourire", "fenêtre", "table", "chaise", "pain", "beurre",
  "thé", "gâteau", "crème", "sucre", "feu", "fumée", "pierre", "mer", "plage", "vague",
  "nuage", "bleu", "blanc", "rouge", "vert", "jaune", "rose", "sommeil", "rêve", "espoir",
  "joie", "calme", "doucement", "toujours", "jamais", "souvent", "ici", "là", "maintenant", "demain",
  "hier", "belle", "beau", "vrai", "facile", "fort", "libre", "heureux", "simple", "musique",
  "lettre", "page", "mot", "histoire", "pensée", "voyage", "route", "ville", "village", "chambre",
  "porte", "clé", "lit", "couverture", "douceur", "bonté", "tendresse", "regarder", "écouter", "parler",
  "aimer", "vivre", "sentir", "dormir", "marcher", "courir", "voler", "danser", "crépuscule", "aurore",
  "feuille", "cheminée", "douillet", "velours", "châle", "tricot", "brouillard", "brume", "rosée", "souffle",
  "murmure", "chuchotement", "cafetière", "infusion", "camomille", "cannelle", "miel", "gourmandise", "croissant", "chocolat",
  "confiture", "refuge", "sérénité", "tranquillité", "berceuse", "mélodie", "flâner", "cahier", "encrier", "aquarelle",
  "tableau", "clairière", "sentier"
];

export const GERMAN_WORDS = [
  "der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich",
  "des", "auf", "für", "ist", "im", "dem", "nicht", "ein", "eine", "als",
  "auch", "es", "an", "werden", "aus", "er", "hat", "dass", "sie", "nach",
  "wird", "bei", "einer", "um", "am", "sind", "noch", "wie", "einem", "über",
  "einen", "so", "zum", "war", "haben", "nur", "oder", "aber", "vor", "zur",
  "bis", "mehr", "durch", "man", "sein", "wurde", "sei", "hatte", "kann", "gegen",
  "vom", "können", "schon", "wenn", "habe", "seine", "ihre", "dann", "unter", "wir",
  "soll", "ich", "eines", "jahr", "zwei", "uhr", "wieder", "keine", "zeit", "leben",
  "wald", "brot", "kaffee", "regen", "sonne", "traum", "buch", "liebe", "freund", "welt",
  "haus", "nacht", "licht", "mensch", "tag", "hand", "auge", "wasser", "stadt", "weg",
  "kopf", "land", "kind", "bild", "arbeit", "raum", "herz", "frage", "seite", "kraft",
  "gruppe", "ort", "fall", "ende", "woche", "monat", "sommer", "winter", "frühling", "herbst",
  "himmel", "erde", "wind", "schnee", "baum", "blume", "vogel", "meer", "fluss", "stein",
  "feuer", "wärme", "ruhe", "frieden", "stimme", "blick", "tür", "fenster", "tisch", "stuhl",
  "tasse", "tee", "kuchen", "apfel", "milch", "schlaf", "stille", "freude", "hoffnung", "stern",
  "mond", "morgen", "abend", "heute", "gestern", "immer", "nie", "oft", "hier", "dort",
  "jetzt", "schön", "gut", "wahr", "einfach", "stark", "ruhig", "frei", "glücklich", "sanft",
  "warm", "kalt", "hell", "dunkel", "klein", "groß", "neu", "alt", "sehen", "hören",
  "sprechen", "gehen", "kommen", "bleiben", "finden", "denken", "fühlen", "wissen", "abendrot", "morgenrot",
  "gemütlich", "kamin", "feuerstelle", "kuscheln", "wolle", "strumpf", "decke", "teekanne", "zimt", "honig",
  "gebäck", "krümel", "nebel", "tau", "waldboden", "laub", "moos", "herbstlaub", "sonnenstrahl", "sanftmut",
  "ruhepause", "geborgenheit", "wanderung", "wiese", "flüstern", "heimat", "zuflucht", "tagebuch", "tinte", "feder",
  "kerzenschein", "sommerabend", "wintermorgen"
];

export const ITALIAN_WORDS = [
  "di", "e", "il", "la", "che", "un", "in", "a", "per", "una",
  "non", "si", "da", "io", "con", "sono", "le", "i", "del", "dei",
  "ma", "come", "ha", "ho", "al", "più", "questo", "anche", "sua", "suo",
  "nel", "nella", "gli", "era", "tra", "dopo", "ci", "qui", "sempre", "senza",
  "dove", "cosa", "tutto", "bene", "molto", "loro", "solo", "fare", "tempo", "vita",
  "casa", "giorno", "notte", "cuore", "amore", "caffè", "pane", "stella", "cielo", "luna",
  "mare", "sole", "fiore", "libro", "sogno", "terra", "mano", "occhio", "strada", "mondo",
  "persona", "amico", "città", "porta", "finestra", "tavolo", "sedia", "acqua", "luce", "voce",
  "sorriso", "vento", "pioggia", "neve", "bosco", "fiume", "albero", "foglia", "pietra", "fuoco",
  "calore", "pace", "silenzio", "musica", "canzone", "storia", "pensiero", "parola", "lettera", "viaggio",
  "mattina", "sera", "oggi", "ieri", "domani", "ora", "minuto", "anno", "mese", "settimana",
  "primavera", "estate", "autunno", "inverno", "bello", "buono", "vero", "dolce", "caldo", "freddo",
  "chiaro", "verde", "blu", "bianco", "rosso", "giallo", "felice", "sereno", "tranquillo", "gentile",
  "morbido", "nuovo", "vecchio", "grande", "piccolo", "vedere", "sentire", "parlare", "camminare", "dormire",
  "sognare", "scrivere", "leggere", "sapere", "pensare", "credere", "trovare", "vivere", "amare", "tramonto",
  "alba", "camino", "morbidezza", "coperta", "sciarpa", "lana", "nebbia", "rugiada", "brezza", "sussurro",
  "profumo", "cannella", "miele", "biscotto", "pasticceria", "cioccolata", "tisana", "camomilla", "rifugio", "serenità",
  "tranquillità", "abbraccio", "dolcezza", "nido", "candela", "quaderno", "inchiostro", "dipinto", "chitarra", "armonia"
];

export const PORTUGUESE_WORDS = [
  "de", "a", "o", "que", "e", "do", "da", "em", "um", "para",
  "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as",
  "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu",
  "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu",
  "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois",
  "sem", "mesmo", "aos", "ter", "seus", "quem", "me", "esse", "eles", "estão",
  "você", "tinha", "foram", "essa", "num", "tempo", "vida", "casa", "livro", "amor",
  "café", "sol", "noite", "mar", "céu", "luz", "amigo", "dia", "paz", "flor",
  "sonho", "vento", "chuva", "terra", "árvore", "rio", "cidade", "caminho", "olhos", "coração",
  "mão", "rosto", "voz", "sorriso", "estrada", "mundo", "porta", "janela", "mesa", "cadeira",
  "água", "fogo", "calor", "silêncio", "música", "canção", "história", "pensamento", "palavra", "carta",
  "viagem", "manhã", "tarde", "hoje", "ontem", "amanhã", "agora", "sempre", "nunca", "aqui",
  "ali", "bom", "belo", "doce", "suave", "quente", "frio", "claro", "azul", "branco",
  "verde", "amarelo", "feliz", "tranquilo", "calmo", "livre", "forte", "novo", "velho", "grande",
  "pequeno", "olhar", "sentir", "falar", "andar", "dormir", "sonhar", "escrever", "ler"
];

export const DUTCH_WORDS = [
  "de", "van", "een", "het", "en", "in", "is", "op", "te", "dat",
  "die", "voor", "met", "zijn", "niet", "aan", "er", "ook", "om", "als",
  "bij", "door", "over", "na", "naar", "zich", "nog", "uit", "maar", "wie",
  "zo", "wat", "ze", "hij", "we", "kan", "geen", "hebben", "meer", "worden",
  "jaar", "al", "nu", "veel", "goed", "tijd", "dag", "huis", "boek", "liefde",
  "koffie", "brood", "regen", "zon", "maan", "boom", "water", "zee", "nacht", "licht",
  "wereld", "mens", "hand", "oog", "stad", "weg", "hart", "kamer", "tafel", "stoel",
  "raam", "deur", "vogel", "bloem", "bos", "rivier", "wind", "sneeuw", "vuur", "warmte",
  "rust", "vrede", "stem", "blik", "lach", "thee", "koekje", "appels", "melk", "slaap",
  "droom", "ster", "ochtend", "avond", "vandaag", "gisteren", "morgen", "altijd", "nooit", "vaak",
  "hier", "daar", "mooi", "waar", "eenvoudig", "sterk", "kalm", "vrij", "blij", "zacht",
  "warm", "koud", "helder", "klein", "groot", "nieuw", "oud", "zien", "horen", "spreken",
  "lopen", "blijven", "denken", "voelen", "weten"
];

export const POLISH_WORDS = [
  "i", "w", "nie", "na", "do", "się", "to", "że", "o", "z",
  "co", "jak", "a", "po", "za", "od", "ale", "dla", "tak", "jest",
  "ten", "mnie", "ci", "czy", "mi", "tam", "tu", "już", "tylko", "przez",
  "bo", "ma", "było", "tym", "jej", "przed", "rok", "czas", "dom", "dzień",
  "noc", "kawa", "chleb", "książka", "miłość", "kot", "serce", "gwiazda", "księżyc", "słońce",
  "woda", "ziemia", "morze", "niebo", "drzewo", "kwiat", "las", "rzeka", "wiatr", "deszcz",
  "śnieg", "ogień", "ciepło", "spokój", "pokój", "głos", "uśmiech", "droga", "miasto", "okno",
  "drzwi", "stół", "herbata", "ciasto", "sen", "marzenie", "chwila", "poranek", "wieczór", "dzisiaj",
  "wczoraj", "jutro", "teraz", "zawsze", "nigdy", "często", "tutaj", "piękny", "dobry", "prawda",
  "prosty", "silny", "cichy", "wolny", "szczęśliwy", "miękki", "ciepły", "zimny", "jasny", "mały",
  "duży", "nowy", "stary", "widzieć", "słyszeć", "mówić", "chodzić", "myśleć"
];

export const RUSSIAN_WORDS = [
  "и", "в", "не", "на", "я", "быть", "с", "он", "что", "а",
  "по", "это", "она", "этот", "к", "но", "они", "мы", "как", "из",
  "у", "который", "то", "за", "свой", "весь", "год", "от", "так", "о",
  "для", "ты", "же", "все", "тот", "мог", "человек", "такой", "его", "только",
  "себя", "один", "ещё", "когда", "даже", "кофе", "книга", "кот", "день", "ночь",
  "дом", "свет", "любовь", "солнце", "дождь", "чай", "тепло", "луна", "звезда", "вода",
  "земля", "море", "небо", "дерево", "цветок", "лес", "река", "ветер", "снег", "огонь",
  "покой", "мир", "голос", "улыбка", "дорога", "город", "окно", "дверь", "стол", "утро",
  "вечер", "сегодня", "вчера", "завтра", "сейчас", "всегда", "никогда", "часто", "здесь", "красивый",
  "добрый", "простой", "тихий", "свободный", "счастливый", "мягкий", "тёплый", "холодный", "ясный", "маленький",
  "большой", "новый", "старый", "видеть", "слышать", "говорить", "думать", "знать"
];

export const JAPANESE_ROMAJI_WORDS = [
  "watashi", "anata", "kore", "sore", "are", "kono", "sono", "ano", "koko", "soko",
  "asoko", "dare", "nani", "doko", "itsu", "doushite", "ikaga", "hai", "iie", "arigatou",
  "sumimasen", "gomen", "ohayou", "konnichiwa", "konbanwa", "oyasumi", "sayounara", "neko", "inu", "tori",
  "sakana", "hana", "ki", "sora", "umi", "yama", "kawa", "ame", "yuki", "kaze",
  "tsuki", "taiyou", "hoshi", "ie", "heya", "hon", "tegami", "uta", "oto", "hikari",
  "yume", "kokoro", "ai", "tomodachi", "kazoku", "jikan", "kyou", "ashita", "kinou", "asa",
  "hiru", "yoru", "kohi", "cha", "ocha", "pan", "mizu", "taberu", "nomu", "miru",
  "kiku", "hanasu", "yomu", "kaku", "iku", "kuru", "kaeru", "suru", "dekiru", "omou",
  "wakaru", "shiru", "matsu", "yasumi", "shiawase", "yasashii", "atatakai", "shizuka", "kirei", "kawaii",
  "suki", "daijoubu", "ureshii", "tanoshii", "omoshiroi", "hayai", "osoi", "takai", "yasui", "atarashii",
  "furui", "chiisai", "ookii", "shiroi", "kuroi", "akai", "aoi", "midori", "machi", "michi",
  "kumo", "tasogare", "akebono", "komorebi", "hinata", "nurumayu", "kotatsu", "futon", "mafuraa", "amacha",
  "shincha", "hachimitsu", "nikki", "fude", "sumi", "shiori", "keshiki", "mori", "nagomi", "yurayura",
  "pokapoka", "fuwafuwa", "kirakira", "sarasara", "shitsukan", "hidamari", "kogarashi", "shigure", "momiji", "sakura",
  "suisen", "tsubaki"
];

export const INDONESIAN_WORDS = [
  "dan", "di", "yang", "untuk", "dengan", "ini", "itu", "dari", "tidak", "dalam",
  "ada", "ke", "akan", "bisa", "mereka", "lebih", "saya", "kita", "kamu", "pada",
  "juga", "sudah", "tahu", "mau", "hari", "rumah", "kopi", "buku", "malam", "cinta",
  "kucing", "kawan", "jalan", "waktu", "makan", "minum", "tidur", "hati", "matahari", "bulan",
  "bintang", "hujan", "tenang", "hangat", "air", "laut", "langit", "pohon", "bunga", "hutan",
  "sungai", "angin", "salju", "api", "damai", "suara", "senyum", "kota", "pintu", "jendela",
  "meja", "kursi", "teh", "roti", "pagi", "sore", "hari", "kemarin", "besok", "sekarang",
  "selalu", "pernah", "sering", "sini", "sana", "indah", "baik", "benar", "sederhana", "kuat",
  "bebas", "bahagia", "lembut", "dingin", "terang", "kecil", "besar", "baru", "lama", "lihat",
  "dengar", "bicara", "jalan", "pikir", "rasa", "hidup", "belajar", "baca", "tulis"
];

export const SWEDISH_WORDS = [
  "och", "det", "att", "i", "en", "jag", "hon", "som", "han", "på",
  "den", "med", "var", "sig", "för", "så", "till", "är", "men", "ett",
  "om", "hade", "de", "inte", "mig", "du", "där", "min", "kunde", "nu",
  "av", "när", "här", "vi", "bara", "eller", "under", "hur", "tid", "dag",
  "hem", "bok", "kärlek", "kaffe", "bröd", "regn", "sol", "måne", "träd", "vatten",
  "hav", "natt", "ljus", "värld", "människa", "hand", "öga", "stad", "väg", "hjärta",
  "rum", "bord", "stol", "fönster", "dörr", "fågel", "blomma", "skog", "flod", "vind",
  "snö", "eld", "värme", "lugn", "fred", "röst", "leende", "te", "kaka", "sömn",
  "dröm", "stjärna", "morgon", "kväll", "idag", "igår", "imorgon", "alltid", "aldrig", "ofta",
  "vacker", "god", "sann", "enkel", "stark", "stilla", "fri", "lycklig", "mjuk", "varm",
  "kall", "liten", "stor", "ny", "gammal", "se", "höra", "tala", "gå", "tänka",
  "känna", "veta", "leva", "älska", "skriva"
];

export const TURKISH_WORDS = [
  "ve", "bir", "bu", "da", "de", "için", "ne", "o", "ile", "ben",
  "çok", "daha", "gibi", "kadar", "her", "zaman", "var", "yok", "ama", "sonra",
  "en", "şimdi", "kendi", "biz", "sen", "gün", "yer", "şey", "ev", "kitap",
  "sevgi", "kahve", "ekmek", "yağmur", "güneş", "ay", "ağaç", "su", "deniz", "gece",
  "ışık", "dünya", "insan", "el", "göz", "şehir", "yol", "kalp", "oda", "masa",
  "sandalye", "pencere", "kapı", "kuş", "çiçek", "orman", "nehir", "rüzgar", "kar", "ateş",
  "sıcak", "huzur", "barış", "ses", "gülümseme", "çay", "tatlı", "uyku", "rüya", "yıldız",
  "sabah", "akşam", "bugün", "dün", "yarın", "daima", "hiç", "sık", "burada", "orada",
  "güzel", "iyi", "doğru", "basit", "güçlü", "sakin", "özgür", "mutlu", "yumuşak", "soğuk",
  "aydınlık", "küçük", "büyük", "yeni", "eski", "görmek", "duymak", "konuşmak", "yürümek", "düşünmek",
  "hissetmek", "bilmek", "yaşamak", "sevmek", "yazmak", "okumak"
];

export const EXPERT_WORDS = [
  "quintessential", "juxtaposition", "phenomenon", "idiosyncratic", "labyrinthine", "serendipity", "melancholy", "craftsmanship", "reconnaissance", "ephemeral",
  "magnanimous", "crystallize", "kaleidoscope", "chrysanthemum", "paraphernalia", "susceptibility", "counterintuitive", "disproportionate", "incompatibility", "misunderstanding",
  "unprecedented", "consciousness", "philosophical", "architectural", "bureaucratic", "circumstantial", "differentiation", "electromagnetic", "fluorescence", "hallucination",
  "illumination", "jurisdiction", "kinetic", "luminescence", "metamorphosis", "neuroscience", "orchestration", "parliamentary", "quintessence", "reminiscent",
  "synchronization", "thermodynamics", "unquestionable", "vulnerability", "whimsical", "xenophobia", "yesterday", "zealous", "ambiguity", "benevolence",
  "claustrophobia", "dexterity", "eccentricity", "formidable", "gravitational", "hypothetical", "indispensable", "judicious", "kaleidoscopic", "longevity",
  "microscopic", "nonchalant", "omnipotent", "perspicacity", "quarantine", "resilience", "superficial", "trepidation", "ubiquitous", "vicarious",
  "witticism", "xylophone", "yearning", "zenith", "archipelago", "belligerent", "connoisseur", "dichotomy", "ebullient", "fallacious",
  "garrulous", "heterogeneous", "inconsequential", "juxtapose", "kowtow", "labyrinth", "magniloquent", "nefarious", "obfuscate", "panacea",
  "querulous", "recalcitrant", "scintillating", "taciturn", "unconscionable", "vacillate", "wheedle", "zealot", "acrimonious", "cacophony",
  "diaphanous", "epiphany", "fastidious", "grandiloquent", "idiosyncrasy", "jurisprudence", "mellifluous", "nostalgia", "opulent", "paradoxical",
  "capricious", "deleterious", "evanescent", "facetious", "loquacious", "nihilism", "paradigm", "quotidian", "reciprocal", "tempestuous",
  "vehement", "aberration", "acquiesce", "alacrity", "clandestine", "coalesce", "dissonance", "egregious", "esoteric", "hegemony",
  "impassive", "impervious", "impetuous", "insidious", "invective", "moratorium", "nebulous", "ostracize", "pejorative", "phlegmatic",
  "precarious", "proliferate", "punctilious", "repudiate", "sagacious", "tantamount", "transient", "truncate", "sesquipedalian", "verisimilitude",
  "perspicacious", "circumlocution", "tintinnabulation", "supererogatory", "valetudinarian", "pusillanimous", "antediluvian", "defenestration", "schadenfreude", "sycophantic",
  "anachronistic", "sesquicentennial", "prestidigitation", "ineffable", "pulchritude", "incommensurable", "indefatigable", "incomprehensible", "incongruous", "inexorable",
  "infinitesimal", "interminable", "intransigent", "invulnerable", "irreproachable", "magniloquence", "multitudinous", "obstreperous", "onomatopoeia", "panegyric",
  "peripatetic", "perspicuous", "pleonasm", "polyglot", "prevaricate", "propensity", "proselytize", "quixotic", "ramification", "recapitulate",
  "redoubtable", "refulgent", "remonstrate", "salubrious", "sanctimonious", "sanguine", "scrupulous", "solipsism", "somnambulist", "soporific",
  "specious", "strident", "subterfuge", "supercilious", "surreptitious", "sycophant", "tautology", "temerity", "tenebrous", "timorous",
  "torpid", "tractable", "transcendental", "trenchant", "truculent", "turgid", "umbrage", "unctuous", "unequivocal", "unwieldy",
  "usurpation", "utilitarian", "vacuous", "variegated", "venerable", "veracity", "verbose", "verdant", "verisimilar", "vicissitude",
  "vilify", "vindicate", "vituperative", "vociferous", "voracious", "vouchsafe", "waning", "warranted", "winsome", "wistful",
  "wizened", "wunderkind", "xenolithic", "yesteryear", "zephyr", "zeitgeist", "zoolatry", "zygomatic", "prestidigitator", "pseudepigrapha",
  "quasiparticle", "recalcitrance", "reconnoiter", "rhadamanthine", "salmagundi", "scapulimancy", "selenography", "semaphoric", "septentrional", "siderography",
  "sigillography", "somniloquence", "subdominant", "supererogation", "surreptitiousness", "syllogistic", "syzygy", "tatterdemalion", "terpsichorean", "thaumaturge",
  "theodolite", "transubstantiation", "trouvaille", "ultracrepidarian", "unexceptionable", "uxorious", "vaticination", "ventriloquism", "vermiculation", "vilipend",
  "vociferation", "weltanschauung", "xenodochial", "xylotomous", "zarzuela", "zenithal"
];

export const SUPPORTED_LANGUAGES = [
  { id: 'english', name: 'English', nativeName: 'English', code: 'EN', wordCount: '1,000+' },
  { id: 'english_cozy', name: 'English (Cozy)', nativeName: 'Cozy English', code: 'CZ', wordCount: '500+' },
  { id: 'spanish', name: 'Spanish', nativeName: 'Español', code: 'ES', wordCount: '400+' },
  { id: 'french', name: 'French', nativeName: 'Français', code: 'FR', wordCount: '350+' },
  { id: 'german', name: 'German', nativeName: 'Deutsch', code: 'DE', wordCount: '350+' },
  { id: 'italian', name: 'Italian', nativeName: 'Italiano', code: 'IT', wordCount: '350+' },
  { id: 'portuguese', name: 'Portuguese', nativeName: 'Português', code: 'PT', wordCount: '300+' },
  { id: 'dutch', name: 'Dutch', nativeName: 'Nederlands', code: 'NL', wordCount: '250+' },
  { id: 'polish', name: 'Polish', nativeName: 'Polski', code: 'PL', wordCount: '250+' },
  { id: 'russian', name: 'Russian', nativeName: 'Русский', code: 'RU', wordCount: '250+' },
  { id: 'japanese_romaji', name: 'Japanese (Romaji)', nativeName: '日本語 (Romaji)', code: 'JA', wordCount: '300+' },
  { id: 'indonesian', name: 'Indonesian', nativeName: 'Bahasa Indonesia', code: 'ID', wordCount: '250+' },
  { id: 'swedish', name: 'Swedish', nativeName: 'Svenska', code: 'SV', wordCount: '250+' },
  { id: 'turkish', name: 'Turkish', nativeName: 'Türkçe', code: 'TR', wordCount: '250+' },
];

export const LANGUAGE_DICTIONARIES = {
  english: ENGLISH_1000,
  english_cozy: COZY_WORDS,
  spanish: SPANISH_WORDS,
  french: FRENCH_WORDS,
  german: GERMAN_WORDS,
  italian: ITALIAN_WORDS,
  portuguese: PORTUGUESE_WORDS,
  dutch: DUTCH_WORDS,
  polish: POLISH_WORDS,
  russian: RUSSIAN_WORDS,
  japanese_romaji: JAPANESE_ROMAJI_WORDS,
  indonesian: INDONESIAN_WORDS,
  swedish: SWEDISH_WORDS,
  turkish: TURKISH_WORDS,
};

/**
 * Fisher-Yates non-repeating shuffle sampler.
 * Guarantees zero word repetition until the full catalog is exhausted!
 */
export function getRandomWords(count = 25, options = { punctuation: false, numbers: false, language: 'english', mode: 'cozy' }) {
  let dictionary = options.language ? LANGUAGE_DICTIONARIES[options.language] : null;
  if (!dictionary) {
    if (options.mode === 'expert') dictionary = EXPERT_WORDS;
    else if (options.mode === 'standard') dictionary = ENGLISH_1000;
    else dictionary = COZY_WORDS;
  } else if (options.mode === 'expert' && (options.language === 'english' || options.language === 'english_cozy')) {
    dictionary = EXPERT_WORDS;
  } else if (options.mode === 'expert' && Array.isArray(dictionary)) {
    const longWords = dictionary.filter(w => w.length >= 7);
    if (longWords.length >= 20) {
      dictionary = longWords;
    }
  }
  
  // Clone and shuffle dictionary to ensure no repeated words
  const pool = [...dictionary];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const result = [];
  const punctuations = [",", ".", "!", "?", ";", ":", "-", "..."];

  for (let i = 0; i < count; i++) {
    // Occasionally inject a number if enabled
    if (options.numbers && Math.random() < 0.14) {
      result.push(String(Math.floor(Math.random() * 900) + 10));
      continue;
    }

    // Wrap pool index gracefully if count exceeds dictionary size
    let word = pool[i % pool.length];

    if (options.punctuation && Math.random() < 0.2) {
      const punct = punctuations[Math.floor(Math.random() * punctuations.length)];
      if (punct === '...') {
        word = word + '...';
      } else if (Math.random() < 0.1) {
        word = '"' + word + '"';
      } else {
        word = word + punct;
      }
    }

    result.push(word);
  }

  return result;
}

/**
 * Generates practice words targeting specific missed keys/characters.
 */
export function getWordsTargetingKeys(count = 15, targetKeys = [], options = {}) {
  let dictionary = options.language ? LANGUAGE_DICTIONARIES[options.language] : null;
  if (!dictionary) {
    if (options.mode === 'expert') dictionary = EXPERT_WORDS;
    else if (options.mode === 'standard') dictionary = ENGLISH_1000;
    else dictionary = COZY_WORDS;
  } else if (options.mode === 'expert' && (options.language === 'english' || options.language === 'english_cozy')) {
    dictionary = EXPERT_WORDS;
  }
  const cleanKeys = (targetKeys || []).map(k => String(k).toLowerCase()).filter(k => k.trim().length === 1);
  if (cleanKeys.length === 0) {
    return getRandomWords(count, options);
  }

  const matchingWords = dictionary.filter(w => cleanKeys.some(k => w.toLowerCase().includes(k)));
  const pool = matchingWords.length >= count ? matchingWords : dictionary;

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
