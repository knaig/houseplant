import { PERSONALITIES } from './personalities';

// Plant name components for generating suggestions
export const PLANT_ADJECTIVES = [
  "Happy", "Sleepy", "Bouncy", "Wise", "Sneaky", "Cheerful", "Gentle", "Bold",
  "Calm", "Playful", "Serene", "Energetic", "Peaceful", "Mischievous", "Loyal",
  "Bright", "Cozy", "Wild", "Tender", "Spirited", "Zen", "Funny", "Sweet"
];

export const PLANT_SUFFIXES = [
  "the Great", "Jr.", "the Magnificent", "McLeafface", "the Wise", "the Brave",
  "the Gentle", "the Bold", "the Cheerful", "the Peaceful", "the Spirited",
  "the Loyal", "the Bright", "the Cozy", "the Wild", "the Tender"
];

export const PLANT_PUNS = [
  "Leafy McLeafface", "Planty Antipathy", "Chloro Phil", "Photosynthesis Pete",
  "Root Beer", "Stem Cell", "Branch Manager", "Leaf It To Me", "Planty Potter",
  "Groot Jr.", "Poison Ivy", "Captain Chlorophyll", "Leafy Green", "Planty Pants",
  "Sir Stemsalot", "Lady Leafington", "Duke of Photosynthesis", "Count Chlorophyll"
];

export const PERSONALITY_THEMES = {
  FUNNY: [
    "Giggles", "Chuckles", "Smiley", "Jolly", "Comedy", "Laughs", "Grinner",
    "Punny", "Silly", "Wacky", "Goofy", "Cheerful", "Merry", "Playful"
  ],
  ZEN: [
    "Serenity", "Peace", "Calm", "Zen", "Tranquil", "Harmony", "Balance",
    "Stillness", "Meditation", "Mindful", "Centered", "Inner Peace", "Om",
    "Breathe", "Flow"
  ],
  CARING: [
    "Nurturer", "Caregiver", "Gentle", "Tender", "Loving", "Kind", "Sweet",
    "Compassionate", "Warm", "Caring", "Protective", "Devoted", "Affectionate",
    "Tender Heart"
  ],
  ADVENTUROUS: [
    "Explorer", "Adventurer", "Bold", "Brave", "Fearless", "Daring", "Wild",
    "Free Spirit", "Wanderer", "Pioneer", "Trailblazer", "Nomad", "Rebel",
    "Thrill Seeker"
  ],
  INTELLECTUAL: [
    "Wise", "Scholar", "Thinker", "Genius", "Professor", "Sage", "Oracle",
    "Philosopher", "Intellect", "Brainy", "Clever", "Smart", "Brilliant",
    "Knowledgeable"
  ]
};

/**
 * Generates species-specific plant name suggestions based on common name
 */
export function generateSpeciesNames(commonName: string): string[] {
  const words = commonName.toLowerCase().split(/\s+/);
  const suggestions: string[] = [];
  
  // Extract key words from species name
  const keyWords = words.filter(word => 
    word.length > 2 && 
    !['plant', 'tree', 'flower', 'vine', 'bush', 'shrub'].includes(word)
  );
  
  if (keyWords.length === 0) {
    keyWords.push(words[0] || 'plant');
  }
  
  // Generate species-specific suggestions
  keyWords.forEach(word => {
    // Capitalize first letter
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    
    // Add various combinations
    suggestions.push(`${capitalized} the ${word.charAt(0).toUpperCase() + word.slice(1)}`);
    suggestions.push(`Sir ${capitalized}salot`);
    suggestions.push(`Lady ${capitalized}ington`);
    suggestions.push(`${capitalized} Ducky`);
    suggestions.push(`${capitalized} Jr.`);
    
    // Add adjective combinations
    const randomAdjective = PLANT_ADJECTIVES[Math.floor(Math.random() * PLANT_ADJECTIVES.length)];
    suggestions.push(`${randomAdjective} ${capitalized}`);
  });
  
  return suggestions.slice(0, 5);
}

/**
 * Generates fun generic plant name suggestions
 */
export function generateFunNames(): string[] {
  const suggestions = [...PLANT_PUNS];
  
  // Add personality-based names
  Object.values(PERSONALITY_THEMES).forEach(themes => {
    themes.forEach(theme => {
      suggestions.push(`${theme} Leaf`);
      suggestions.push(`${theme} Plant`);
    });
  });
  
  // Add adjective combinations
  PLANT_ADJECTIVES.forEach(adj => {
    suggestions.push(`${adj} Green`);
    suggestions.push(`${adj} Leaf`);
    suggestions.push(`${adj} Plant`);
  });
  
  // Shuffle and return subset
  return shuffleArray(suggestions).slice(0, 8);
}

/**
 * Validates plant name format and requirements
 */
export function validatePlantName(name: string): { valid: boolean; reason?: string } {
  if (!name) {
    return { valid: false, reason: "Name is required" };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, reason: "Name must be at least 2 characters long" };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, reason: "Name must be less than 50 characters" };
  }
  
  // Allow letters, numbers, spaces, basic punctuation, and emoji
  const validPattern = /^[\p{L}\p{N}\s\-'.,!?()&@#$%*+=:;"]+$/u;
  if (!validPattern.test(trimmed)) {
    return { valid: false, reason: "Name contains invalid characters" };
  }
  
  // Check for excessive whitespace
  if (trimmed !== trimmed.replace(/\s+/g, ' ')) {
    return { valid: false, reason: "Name has excessive spaces" };
  }
  
  return { valid: true };
}

/**
 * Generates smart plant name suggestions combining species-specific and generic names
 */
export function generateSmartSuggestions(
  speciesCommonName?: string, 
  personality?: string
): string[] {
  let suggestions: string[] = [];
  
  // Add species-specific suggestions if available
  if (speciesCommonName) {
    suggestions.push(...generateSpeciesNames(speciesCommonName));
  }
  
  // Add fun generic suggestions
  suggestions.push(...generateFunNames());
  
  // Filter by personality if specified
  if (personality && PERSONALITY_THEMES[personality as keyof typeof PERSONALITY_THEMES]) {
    const personalityNames = PERSONALITY_THEMES[personality as keyof typeof PERSONALITY_THEMES];
    personalityNames.forEach(name => {
      suggestions.push(name);
      suggestions.push(`${name} Plant`);
      suggestions.push(`${name} Leaf`);
    });
  }
  
  // Remove duplicates and shuffle
  const uniqueSuggestions = [...new Set(suggestions)];
  const shuffled = shuffleArray(uniqueSuggestions);
  
  // Return 6-8 diverse suggestions
  return shuffled.slice(0, 8);
}

/**
 * Checks if a plant name is unique within a user's collection
 */
export function isNameUnique(name: string, existingNames: string[]): boolean {
  const normalizedName = name.trim().toLowerCase();
  return !existingNames.some(existing => 
    existing.toLowerCase() === normalizedName
  );
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Normalizes a plant name for consistent storage
 */
export function normalizePlantName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Generates a random plant name suggestion
 */
export function getRandomSuggestion(speciesCommonName?: string, personality?: string): string {
  const suggestions = generateSmartSuggestions(speciesCommonName, personality);
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}
