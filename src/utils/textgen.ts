// ── Text Generation (Prompt Forge) ──
import { SeededRNG } from './rng';
import type { DifficultyConfig, Theme } from '../types';

// ── Sentence pools by theme ──
const SENTENCE_POOLS: Record<Theme, string[]> = {
  cyberpunk: [
    "The neon lights flickered above the rain-soaked streets of the lower district.",
    "She jacked into the network and felt the rush of data flowing through her mind.",
    "Chrome implants gleamed under the violet haze of the city skyline at midnight.",
    "The hacker slipped through the firewall like a ghost in the machine.",
    "Megacorporations owned every corner of the city and every thought in your head.",
    "His cybernetic arm whirred softly as he reached for the encrypted drive.",
    "Advertisements floated through the air as holograms selling dreams to the desperate.",
    "The underground market traded in stolen memories and bootleg neural upgrades.",
    "A rogue artificial intelligence had been hiding in the old server farm for years.",
    "She could taste the static on her tongue every time she connected to the grid.",
    "The streets were alive with the hum of drones and the flicker of broken signs.",
    "He downloaded the blueprint directly into his cortex and blinked twice to confirm.",
    "Trust was the most expensive commodity in a world built on synthetic lies.",
    "Every shadow in the alley could be a bounty hunter or a malfunctioning android.",
    "The signal came from deep within the abandoned sector of the orbital station.",
    "They promised a better life through technology but delivered only control and silence.",
    "Her avatar moved through the virtual marketplace scanning for the stolen code.",
    "The city never slept because sleep was a luxury only the powerful could afford.",
    "Binary rain fell on the rooftop while she traced the origin of the breach.",
    "Old world books were worth more than gold in a society that forgot how to read.",
    "The data courier sprinted through the crowd carrying secrets worth killing for.",
    "Quantum encryption was supposed to be unbreakable until someone proved otherwise.",
    "Beneath the glowing skyline the forgotten people built their own kind of future.",
    "His neural implant buzzed with an incoming message from an unknown sender.",
    "The corporation erased her identity overnight and she became a ghost in the system.",
    "Synthetic rain drummed against the window of the cramped apartment on floor thirty seven.",
    "Every keystroke was monitored so they learned to speak in code and silence.",
    "The black market surgeon worked by candlelight in a basement below the noodle shop.",
    "She compiled the virus in under a minute and uploaded it to the mainframe.",
    "The digital frontier was the last place where freedom still meant something real.",
    "Augmented eyes could see in the dark but they could never see the truth clearly.",
    "The resistance broadcast on frequencies that the towers could not trace or jam.",
    "He traded his memories for enough credits to survive another week in the sprawl.",
    "A pulse of light swept through the server room as the system rebooted itself.",
    "The line between human and machine had blurred so much that nobody cared anymore.",
  ],
  scifi: [
    "The starship emerged from hyperspace into an uncharted region of the galaxy.",
    "Oxygen levels were dropping and the crew had twelve hours to find a solution.",
    "The alien artifact hummed with a frequency that no instrument could fully measure.",
    "Captain Torres stared at the viewscreen as the unknown planet filled the horizon.",
    "Light from a distant supernova painted the hull in shades of gold and crimson.",
    "The colony ship had been drifting for three hundred years before anyone woke up.",
    "First contact was nothing like the old movies had predicted it would be.",
    "Gravity generators failed on deck seven and everything floated in sudden silence.",
    "The probe sent back images of structures that could not have formed naturally.",
    "She recalibrated the navigation system using the pulsar as a fixed reference point.",
    "Fuel reserves were critically low and the nearest station was two jumps away.",
    "The wormhole collapsed behind them leaving no way to return to known space.",
    "Each crew member carried a small device that recorded their thoughts for posterity.",
    "The surface of the moon was covered in a fine dust that glittered like diamonds.",
    "Communications with Earth had been silent for over a decade and nobody knew why.",
    "The engine room vibrated with the deep hum of the fusion reactor spinning up.",
    "They discovered water beneath the ice crust of the frozen world orbiting the gas giant.",
    "Her space suit had a small tear and she had roughly four minutes to seal it.",
    "The fleet assembled near the asteroid belt preparing for a mission beyond the frontier.",
    "Signals from the deep space array suggested something was moving toward the solar system.",
    "The terraform project would take a century but it was the only hope for survival.",
    "Cryogenic pods lined the corridor each one holding a passenger dreaming of a new world.",
    "The space station rotated slowly providing just enough artificial gravity to walk normally.",
    "Radiation levels outside the shield perimeter were lethal within a matter of minutes.",
    "She floated past the observation deck and watched a nebula bloom in the distance.",
    "The mission briefing was clear but the reality of deep space was something else entirely.",
    "A small repair drone hummed along the exterior patching microfractures in the hull.",
    "The star map displayed a cluster of systems that had never been explored by anyone.",
    "Zero gravity made simple tasks like eating and sleeping surprisingly complicated.",
    "The escape pod launched automatically when the hull breach alarm filled every corridor.",
  ],
  fantasy: [
    "The ancient dragon circled the mountain peak before landing on the crumbling tower.",
    "She drew the enchanted blade and felt its warmth spread through her trembling hands.",
    "The forest whispered secrets to those who were patient enough to listen carefully.",
    "A spell of protection shimmered around the castle walls as the enemy army advanced.",
    "The old wizard opened his grimoire and began to read the incantation by candlelight.",
    "Deep within the dungeon a creature stirred awoken by the sound of approaching footsteps.",
    "The elven council had debated for centuries while the world outside slowly crumbled apart.",
    "He forged the sword in dragonfire and cooled it in the waters of the sacred spring.",
    "The prophecy spoke of a child born under twin moons who would restore the kingdom.",
    "Runes carved into the stone wall began to glow as the traveler spoke the password.",
    "The potion bubbled in the cauldron releasing a scent of lavender and midnight frost.",
    "A phoenix rose from the ashes spreading wings of flame across the darkened sky.",
    "The knight knelt before the throne and swore an oath that would bind him forever.",
    "Somewhere in the enchanted forest a unicorn drank from a stream of liquid silver.",
    "The necromancer raised an army from the fallen soldiers of the last great war.",
    "Magic flowed through the land like rivers connecting every living thing to each other.",
    "The treasure map led to a cavern filled with gold and guarded by an ancient curse.",
    "She spoke to the wind and the wind answered carrying her words across the mountains.",
    "The dark lord sat upon a throne of obsidian plotting the end of the free kingdoms.",
    "A young apprentice accidentally turned himself invisible and could not find the counterspell.",
    "The dwarven mines extended deep into the earth where no sunlight had ever reached.",
    "Legends told of a sword buried beneath the lake that could cut through any magic.",
    "The fairy ring appeared only on the night of the summer solstice under a full moon.",
    "He bargained with the trickster spirit and lost three years of his own memory.",
    "The castle gates opened with a groan revealing a courtyard overgrown with thorny vines.",
    "A hundred candles floated in the great hall casting dancing shadows on the stone walls.",
    "The sorcerer wove illusions so real that even the birds tried to land on them.",
    "Every hero who entered the labyrinth emerged changed in ways they could never explain.",
    "The enchanted mirror showed not your reflection but the truest version of your soul.",
    "Storm clouds gathered above the battlefield as the two armies prepared to clash at dawn.",
  ],
  philosophy: [
    "The only true wisdom is knowing that you know nothing at all about the world.",
    "We are what we repeatedly do and excellence is therefore not an act but a habit.",
    "The unexamined life is not worth living for a human being who seeks the truth.",
    "To be yourself in a world that constantly tries to change you is a real achievement.",
    "Happiness depends upon ourselves and not upon the circumstances around us each day.",
    "In the middle of difficulty lies opportunity for those who choose to look for it.",
    "The mind is everything because what you think is what you eventually become.",
    "He who has a why to live can bear almost any how that life throws at him.",
    "Knowledge speaks but wisdom listens to the silence between the words we say.",
    "The only thing we have to fear is fear itself and the paralysis it brings.",
    "Life must be understood backwards but it can only be lived going forward each day.",
    "Not everything that can be counted counts and not everything that counts can be counted.",
    "The greatest glory in living lies not in never falling but in rising every time.",
    "Freedom is not worth having if it does not include the freedom to make mistakes.",
    "The measure of a person is what they do with the power they have been given.",
    "Those who cannot change their minds cannot change anything else in the world around them.",
    "A society grows great when old people plant trees whose shade they will never enjoy.",
    "The purpose of life is a life of purpose and meaning beyond our own comfort.",
    "What we know is a drop and what we do not know is an entire ocean.",
    "It is the mark of an educated mind to entertain a thought without accepting it fully.",
    "Time is the most valuable thing a person can spend and it never comes back.",
    "The best way to predict the future is to create it with your own hands.",
    "No one can make you feel inferior without your consent and your own permission.",
    "I think therefore I am is the foundation upon which all certainty must be built.",
    "The world is full of obvious things which nobody ever observes or takes the time to see.",
    "Injustice anywhere is a threat to justice everywhere in the connected web of humanity.",
    "We do not see things as they are but rather we see them as we are.",
    "To live is the rarest thing in the world because most people merely exist day by day.",
    "The only way to do great work is to love what you do with your whole heart.",
    "Doubt is not a pleasant condition but certainty is an absurd one to cling to forever.",
  ],
};

const BOSS_WORDS = [
  'electromagnetic', 'synchronization', 'cryptocurrency', 'extraterrestrial',
  'nanotechnology', 'transcendence', 'decentralized', 'consciousness',
  'photosynthesis', 'hyperventilate', 'authentication', 'infrastructure',
  'metamorphosis', 'comprehensive', 'revolutionary', 'interdimensional',
];

export interface GeneratedText {
  words: string[];
  bossWordIndices: number[];
}

export function generateText(
  seed: number,
  theme: Theme,
  difficulty: DifficultyConfig,
  wordCount: number = 80
): GeneratedText {
  const rng = new SeededRNG(seed);
  const sentences = SENTENCE_POOLS[theme];
  const words: string[] = [];
  const bossWordIndices: number[] = [];

  // Shuffle sentences deterministically, then pull words from them in order
  const shuffled = rng.shuffle([...sentences]);
  let sentenceIndex = 0;

  while (words.length < wordCount) {
    // Boss word chance (~4%) — inject between sentences
    if (words.length > 3 && rng.next() < 0.04) {
      const bossWord = rng.pick(BOSS_WORDS);
      bossWordIndices.push(words.length);
      words.push(bossWord);
      continue;
    }

    // Pick next sentence
    if (sentenceIndex >= shuffled.length) {
      // Reshuffle if we run out
      rng.shuffle(shuffled);
      sentenceIndex = 0;
    }

    let sentence = shuffled[sentenceIndex++];

    // Difficulty modifiers — add numbers occasionally
    if (difficulty.numbersEnabled && rng.next() < 0.06) {
      const num = String(rng.nextInt(10, 9999));
      // Insert a number between sentences
      words.push(num);
      if (words.length >= wordCount) break;
    }

    // Split sentence into words and add them
    const sentenceWords = sentence.split(/\s+/);
    for (const w of sentenceWords) {
      if (words.length >= wordCount) break;
      words.push(w);
    }
  }

  return { words: words.slice(0, wordCount), bossWordIndices };
}

/** Generate a glitched visual of a word */
export function glitchWord(word: string, rng: SeededRNG): string {
  const glitchChars = '▓░▒█¦¡¿×÷±≠≈∞∑∏∂';
  const chars = [...word];
  const numGlitches = rng.nextInt(1, Math.min(3, chars.length));

  for (let i = 0; i < numGlitches; i++) {
    const pos = rng.nextInt(0, chars.length);
    chars[pos] = rng.pick([...glitchChars]);
  }

  return chars.join('');
}
