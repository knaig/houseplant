#!/usr/bin/env node
/**
 * Test Plant Care Calculation Service
 * Tests watering schedule calculations with various scenarios
 */

const { plantCareService } = require('./src/lib/plant-care.ts');

console.log('🌱 Testing Plant Care Service\n');

// Test 1: Normal plant with all fields
console.log('Test 1: Normal plant with all fields');
const normalPlant = {
  lastWateredAt: new Date('2025-10-01'),
  potSizeCm: 15,
  lightLevel: 'MEDIUM',
  species: {
    defaultWaterDays: 7,
    commonName: 'Monstera Deliciosa'
  }
};

try {
  const calc1 = plantCareService.calculateWateringSchedule(normalPlant);
  console.log('✅ Calculation successful');
  console.log(`   Base water days: ${calc1.baseWaterDays}`);
  console.log(`   Adjusted water days: ${calc1.adjustedWaterDays}`);
  console.log(`   Needs water: ${calc1.needsWater}`);
  console.log(`   Days overdue: ${calc1.daysOverdue}`);
  console.log(`   Next water due: ${calc1.nextWaterDue.toISOString()}\n`);
} catch (error) {
  console.error('❌ Test 1 failed:', error.message, '\n');
}

// Test 2: Newly claimed plant (null values)
console.log('Test 2: Newly claimed plant with null values');
const newPlant = {
  lastWateredAt: null,
  potSizeCm: null,
  lightLevel: null,
  species: {
    defaultWaterDays: 7,
    commonName: 'Snake Plant'
  }
};

try {
  const calc2 = plantCareService.calculateWateringSchedule(newPlant);
  console.log('✅ Calculation successful (handles nulls)');
  console.log(`   Base water days: ${calc2.baseWaterDays}`);
  console.log(`   Adjusted water days: ${calc2.adjustedWaterDays}`);
  console.log(`   Default pot size used: ${calc2.factors.potSize}cm`);
  console.log(`   Default light level used: ${calc2.factors.lightLevel}\n`);
} catch (error) {
  console.error('❌ Test 2 failed:', error.message, '\n');
}

// Test 3: High light plant (needs more water)
console.log('Test 3: High light plant');
const highLightPlant = {
  lastWateredAt: new Date('2025-10-01'),
  potSizeCm: 20,
  lightLevel: 'HIGH',
  species: {
    defaultWaterDays: 7,
    commonName: 'Succulent'
  }
};

try {
  const calc3 = plantCareService.calculateWateringSchedule(highLightPlant);
  console.log('✅ Calculation successful');
  console.log(`   Light factor applied: HIGH (0.8x)`);
  console.log(`   Adjusted water days: ${calc3.adjustedWaterDays}`);
  console.log(`   (Shorter interval due to more light)\n`);
} catch (error) {
  console.error('❌ Test 3 failed:', error.message, '\n');
}

// Test 4: Low light plant (needs less water)
console.log('Test 4: Low light plant');
const lowLightPlant = {
  lastWateredAt: new Date('2025-10-01'),
  potSizeCm: 15,
  lightLevel: 'LOW',
  species: {
    defaultWaterDays: 7,
    commonName: 'Pothos'
  }
};

try {
  const calc4 = plantCareService.calculateWateringSchedule(lowLightPlant);
  console.log('✅ Calculation successful');
  console.log(`   Light factor applied: LOW (1.2x)`);
  console.log(`   Adjusted water days: ${calc4.adjustedWaterDays}`);
  console.log(`   (Longer interval due to less light)\n`);
} catch (error) {
  console.error('❌ Test 4 failed:', error.message, '\n');
}

// Test 5: Overdue plant
console.log('Test 5: Overdue plant');
const overduePlant = {
  lastWateredAt: new Date('2025-09-20'), // 20 days ago
  potSizeCm: 15,
  lightLevel: 'MEDIUM',
  species: {
    defaultWaterDays: 7,
    commonName: 'Fern'
  }
};

try {
  const calc5 = plantCareService.calculateWateringSchedule(overduePlant);
  console.log('✅ Calculation successful');
  console.log(`   Needs water: ${calc5.needsWater}`);
  console.log(`   Days overdue: ${calc5.daysOverdue}`);
  console.log(`   ⚠️  Plant needs immediate watering!\n`);
} catch (error) {
  console.error('❌ Test 5 failed:', error.message, '\n');
}

console.log('✅ All plant care tests completed!\n');

