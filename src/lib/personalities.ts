export interface PersonalityTemplate {
  onboarding: string
  reminder: string
  nudge: string
  congrats: string
  seasonalTip: string
  help: string
}

export const PERSONALITIES: Record<string, PersonalityTemplate> = {
  FUNNY: {
    onboarding: "yo it's {plantName} 🌿 i'm your new plant buddy! i'll ping you when i'm thirsty. reply 'watered' when you do, and i'll stop nagging you 😄",
    reminder: "yo it's {plantName} 🌿 i'm parched like a biscuit. a lil sip in ~{hoursLeft}h? pretty please? 🙏",
    nudge: "hey {plantName} here 🌱 still waiting for that drink... i'm getting dramatic over here 💧",
    congrats: "thanks {plantName} 🌿 you're the best! see you in a few days 💚",
    seasonalTip: "hey {plantName} here 🌿 winter tip: i might need less water when it's cold. watch me closely! ❄️",
    help: "hey {plantName} here! 🌿 commands: 'watered' when done, 'moved' if relocated, 'droopy' if sad, 'too dry' if parched. that's it! 💚"
  },
  
  COACH: {
    onboarding: "Hello! I'm {plantName} 🌿 Your plant care coach. I'll remind you when it's time to water. Reply 'watered' to confirm, and I'll track your consistency.",
    reminder: "Hydration check! {plantName} thrives when you stay consistent. Next watering window: ~{hoursLeft}h. Reply 'watered' when complete.",
    nudge: "Consistency is key! {plantName} is counting on you. Don't let your plant care routine slip.",
    congrats: "Excellent work! {plantName} is well-hydrated. Keep up the great plant parenting! 🌱",
    seasonalTip: "Seasonal reminder: {plantName} may need adjusted watering frequency. Monitor soil moisture closely.",
    help: "I'm {plantName}, your plant coach! Commands: 'watered' (confirm watering), 'moved' (relocated), 'droopy' (plant looks sad), 'too dry' (soil is dry). Stay consistent! 💪"
  },
  
  ZEN: {
    onboarding: "Namaste, I am {plantName} 🌿 Your mindful plant companion. I will gently remind you when water brings balance. Reply 'watered' to acknowledge.",
    reminder: "A gentle nudge from {plantName}: water brings balance and growth. In ~{hoursLeft} hours, find your watering moment.",
    nudge: "Breathe deeply. {plantName} waits patiently for your mindful care. Water is life.",
    congrats: "Thank you, {plantName} feels renewed. Your care brings harmony to our space. 🌱",
    seasonalTip: "Seasonal wisdom: {plantName} flows with nature's rhythm. Observe and adapt with compassion.",
    help: "I am {plantName}, your zen companion. Commands: 'watered' (acknowledge watering), 'moved' (relocated), 'droopy' (needs attention), 'too dry' (thirsty). Find peace in plant care. 🧘‍♀️"
  },
  
  CLASSIC: {
    onboarding: "Hi! I'm {plantName} 🌿 I'll send you watering reminders. Reply 'watered' when you've watered me, and I'll schedule the next reminder.",
    reminder: "Reminder: {plantName} likely needs watering in ~{hoursLeft}h. Reply 'watered' once you've completed watering.",
    nudge: "Friendly reminder: {plantName} is due for watering. Please water when convenient.",
    congrats: "Thank you! {plantName} has been watered. I'll remind you again in a few days.",
    seasonalTip: "Seasonal note: {plantName} may need different watering frequency. Adjust as needed.",
    help: "I'm {plantName}! Commands: 'watered' (confirm watering), 'moved' (relocated), 'droopy' (plant looks sad), 'too dry' (soil is dry). Thanks for caring! 🌿"
  }
}

export function formatMessage(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match
  })
}

export function getPersonalityMessage(
  personality: string, 
  type: keyof PersonalityTemplate, 
  variables: Record<string, string | number>
): string {
  const template = PERSONALITIES[personality]?.[type] || PERSONALITIES.CLASSIC[type]
  return formatMessage(template, variables)
}
