import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const speciesData = [
  { 
    commonName: 'Pothos', 
    latinName: 'Epipremnum aureum', 
    defaultWaterDays: 7,
    hindiName: 'पोथोस',
    tamilName: 'போதோஸ்',
    teluguName: 'పోథోస్',
    bengaliName: 'পোথোস',
    marathiName: 'पोथोस',
    gujaratiName: 'પોથોસ',
    kannadaName: 'ಪೋಥೋಸ್',
    malayalamName: 'പോഥോസ്',
    punjabiName: 'ਪੋਥੋਸ',
    odiaName: 'ପୋଥୋସ୍',
    assameseName: 'পোথোস'
  },
  { 
    commonName: 'Snake Plant', 
    latinName: 'Sansevieria trifasciata', 
    defaultWaterDays: 14,
    hindiName: 'सांप का पौधा',
    tamilName: 'பாம்பு செடி',
    teluguName: 'పాము మొక్క',
    bengaliName: 'সাপের গাছ',
    marathiName: 'सापाचे झाड',
    gujaratiName: 'સાપનું છોડ',
    kannadaName: 'ಹಾವಿನ ಗಿಡ',
    malayalamName: 'പാമ്പിന്റെ ചെടി',
    punjabiName: 'ਸੱਪ ਦਾ ਪੌਦਾ',
    odiaName: 'ସାପର ଗଛ',
    assameseName: 'সাপৰ গছ'
  },
  { 
    commonName: 'Monstera', 
    latinName: 'Monstera deliciosa', 
    defaultWaterDays: 7,
    hindiName: 'मॉन्स्टेरा',
    tamilName: 'மான்ஸ்டெரா',
    teluguName: 'మాన్స్టెరా',
    bengaliName: 'মনস্টেরা',
    marathiName: 'मॉन्स्टेरा',
    gujaratiName: 'મોન્સ્ટેરા',
    kannadaName: 'ಮಾನ್ಸ್ಟೆರಾ',
    malayalamName: 'മോൻസ്റ്റെര',
    punjabiName: 'ਮੋਨਸਟੇਰਾ',
    odiaName: 'ମୋନଷ୍ଟେରା',
    assameseName: 'মনষ্টেৰা'
  },
  { 
    commonName: 'Fiddle Leaf Fig', 
    latinName: 'Ficus lyrata', 
    defaultWaterDays: 6,
    hindiName: 'फिडल लीफ फिग',
    tamilName: 'ஃபிடில் லீஃப் ஃபிக்',
    teluguName: 'ఫిడిల్ లీఫ్ ఫిగ్',
    bengaliName: 'ফিডল লিফ ফিগ',
    marathiName: 'फिडल लीफ फिग',
    gujaratiName: 'ફિડલ લીફ ફિગ',
    kannadaName: 'ಫಿಡಲ್ ಲೀಫ್ ಫಿಗ್',
    malayalamName: 'ഫിഡിൽ ലീഫ് ഫിഗ്',
    punjabiName: 'ਫਿਡਲ ਲੀਫ ਫਿਗ',
    odiaName: 'ଫିଡଲ୍ ଲିଫ୍ ଫିଗ୍',
    assameseName: 'ফিডল লিফ ফিগ'
  },
  { 
    commonName: 'Spider Plant', 
    latinName: 'Chlorophytum comosum', 
    defaultWaterDays: 5,
    hindiName: 'मकड़ी का पौधा',
    tamilName: 'சிலந்தி செடி',
    teluguName: 'సాలీడు మొక్క',
    bengaliName: 'মাকড়সার গাছ',
    marathiName: 'कोळीचे झाड',
    gujaratiName: 'સાપનું છોડ',
    kannadaName: 'ಎರಡೆಹುಳು ಗಿಡ',
    malayalamName: 'ചിലന്തിയുടെ ചെടി',
    punjabiName: 'ਮਕੜੀ ਦਾ ਪੌਦਾ',
    odiaName: 'ମାକଡ଼ର ଗଛ',
    assameseName: 'মকৰা গছ'
  },
  { 
    commonName: 'Rubber Plant', 
    latinName: 'Ficus elastica', 
    defaultWaterDays: 7,
    hindiName: 'रबर प्लांट',
    tamilName: 'ரப்பர் செடி',
    teluguName: 'రబ్బర్ మొక్క',
    bengaliName: 'রাবার গাছ',
    marathiName: 'रबरचे झाड',
    gujaratiName: 'રબરનું છોડ',
    kannadaName: 'ರಬ್ಬರ್ ಗಿಡ',
    malayalamName: 'റബ്ബർ ചെടി',
    punjabiName: 'ਰਬੜ ਦਾ ਪੌਦਾ',
    odiaName: 'ରବର ଗଛ',
    assameseName: 'ৰাবাৰ গছ'
  },
  { 
    commonName: 'Peace Lily', 
    latinName: 'Spathiphyllum', 
    defaultWaterDays: 5,
    hindiName: 'पीस लिली',
    tamilName: 'பீஸ் லில்லி',
    teluguName: 'పీస్ లిల్లీ',
    bengaliName: 'পিস লিলি',
    marathiName: 'पीस लिली',
    gujaratiName: 'પીસ લિલી',
    kannadaName: 'ಪೀಸ್ ಲಿಲ್ಲಿ',
    malayalamName: 'പീസ് ലില്ലി',
    punjabiName: 'ਪੀਸ ਲਿਲੀ',
    odiaName: 'ପିସ୍ ଲିଲି',
    assameseName: 'পিচ লিলি'
  },
  { 
    commonName: 'Aloe Vera', 
    latinName: 'Aloe barbadensis', 
    defaultWaterDays: 10,
    hindiName: 'एलोवेरा',
    tamilName: 'அலோவேரா',
    teluguName: 'అలోవెరా',
    bengaliName: 'এলোভেরা',
    marathiName: 'एलोवेरा',
    gujaratiName: 'એલોવેરા',
    kannadaName: 'ಅಲೋವೆರಾ',
    malayalamName: 'അലോവെര',
    punjabiName: 'ਏਲੋਵੇਰਾ',
    odiaName: 'ଏଲୋଭେରା',
    assameseName: 'এলোভেৰা'
  },
  { 
    commonName: 'Jade Plant', 
    latinName: 'Crassula ovata', 
    defaultWaterDays: 10,
    hindiName: 'जेड प्लांट',
    tamilName: 'ஜேட் செடி',
    teluguName: 'జేడ్ మొక్క',
    bengaliName: 'জেড গাছ',
    marathiName: 'जेडचे झाड',
    gujaratiName: 'જેડનું છોડ',
    kannadaName: 'ಜೇಡ್ ಗಿಡ',
    malayalamName: 'ജേഡ് ചെടി',
    punjabiName: 'ਜੇਡ ਦਾ ਪੌਦਾ',
    odiaName: 'ଜେଡ୍ ଗଛ',
    assameseName: 'জেড গছ'
  },
  { 
    commonName: 'ZZ Plant', 
    latinName: 'Zamioculcas zamiifolia', 
    defaultWaterDays: 14,
    hindiName: 'जेड जेड प्लांट',
    tamilName: 'ஜேட் ஜேட் செடி',
    teluguName: 'జేడ్ జేడ్ మొక్క',
    bengaliName: 'জেড জেড গাছ',
    marathiName: 'जेड जेडचे झाड',
    gujaratiName: 'જેડ જેડનું છોડ',
    kannadaName: 'ಜೇಡ್ ಜೇಡ್ ಗಿಡ',
    malayalamName: 'ജേഡ് ജേഡ് ചെടി',
    punjabiName: 'ਜੇਡ ਜੇਡ ਦਾ ਪੌਦਾ',
    odiaName: 'ଜେଡ୍ ଜେଡ୍ ଗଛ',
    assameseName: 'জেড জেড গছ'
  }
]

async function main() {
  console.log('🌱 Seeding database with plant species...')
  
  // Create species
  for (const species of speciesData) {
    await prisma.species.upsert({
      where: { commonName: species.commonName },
      update: {},
      create: species,
    })
  }
  
  console.log(`✅ Created ${speciesData.length} species`)
  
  // Create some sample claim tokens
  const claimTokens = []
  for (let i = 0; i < 10; i++) {
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15)
    
    claimTokens.push({
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
  }
  
  for (const tokenData of claimTokens) {
    await prisma.claimToken.create({
      data: tokenData,
    })
  }
  
  console.log(`✅ Created ${claimTokens.length} claim tokens`)
  
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
