/**
 * Comprehensive verification tests for STREET TO CEO Expansion Roadmap
 * Tests Upgrades, Skins, Progression, Valuation, and Save Integrity.
 */

// ─── Browser-global stubs ─────────────────────────────────────────────────────
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, val: string) => storage.set(key, val),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
(globalThis as any).window = {
  setInterval: (fn: () => void, ms: number) => setInterval(fn, ms),
  clearInterval: (id: ReturnType<typeof setInterval>) => clearInterval(id),
};

const {
  BUSINESS_DEFINITIONS,
  SKIN_DEFINITIONS,
  MILESTONES,
  UPGRADE_TIER_DEFS,
  buyBusiness,
  upgradeBusinessLevel,
  getUpgradeCost,
  getEffectiveRates,
  buySkin,
  equipSkin,
  getPlayerNetWorth,
  getBusinessValuation,
  getBusinessFinancialStats,
  computePlayerLevel,
  getPlayerLevelTitle,
  getGameState,
  updateGameState,
  saveGame,
  loadGame,
  dismissMilestoneNotification,
} = await import('./src/store/gameState.ts');

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string, detail = '') {
  if (cond) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

console.log('\n══════════ TEST SUITE 1: BUSINESS CATALOGUE & INITIAL STATE ══════════');
assert(BUSINESS_DEFINITIONS.length === 17, 'Exactly 17 commercial enterprises present');
const st0 = getGameState();
assert(st0.cash === 50000, 'Starting cash is ₦50,000');
assert(st0.unlockedSkins.includes('skin_street'), 'Free starter skin_street unlocked');
assert(st0.unlockedSkins.includes('skin_campus'), 'Free starter skin_campus unlocked');
assert(st0.unlockedSkins.includes('skin_casual'), 'Free starter skin_casual unlocked');

console.log('\n══════════ TEST SUITE 2: BUSINESS UPGRADES & ECONOMY EFFECTS ══════════');
// Fresh setup
updateGameState({
  cash: 500000,
  ownedBusinesses: [],
  ledger: [],
  businessUpgrades: {},
  businessUpgradeSpend: {},
  businessRevenue: {},
  businessExpenses: {},
  playerXP: 0,
  playerLevel: 1,
  completedMilestones: [],
});

// 1. Cannot upgrade an unowned business
const unownedUpgrade = upgradeBusinessLevel('b_corner');
assert(!unownedUpgrade.success, 'Unowned business cannot be upgraded');

// 2. Buy Corner Shop (Price ₦25,000)
const buyCorner = buyBusiness('b_corner');
assert(buyCorner.success, 'Successfully purchased Corner Shop');
assert(getGameState().cash === 475000, 'Cash deducted for Corner Shop purchase');
assert(getGameState().businessUpgrades['b_corner'] === undefined || getGameState().businessUpgrades['b_corner'] === 1, 'Initial level is 1 (implicit or explicit)');

// Level 1 rates check
const l1Rates = getEffectiveRates('b_corner', 1);
assert(l1Rates.gross === 2000, 'L1 gross rate is ₦2,000/min');
assert(l1Rates.cost === 600, 'L1 operating cost is ₦600/min');
assert(l1Rates.net === 1400, 'L1 net profit is ₦1,400/min');
assert(l1Rates.capacity > 0, `L1 customer capacity is positive (${l1Rates.capacity})`);

// 3. Upgrade to Level 2 (Equipment)
// Cost for Corner Shop L2: 25,000 * 0.50 = 12,500
const costL2 = getUpgradeCost('b_corner', 2);
assert(costL2 === 12500, `Upgrade cost to L2 is ₦12,500 (found ${costL2})`);

const up1 = upgradeBusinessLevel('b_corner');
assert(up1.success, 'Upgrade to Level 2 succeeded');
assert(getGameState().cash === 475000 - 12500, `Cash after L2 upgrade: ₦${getGameState().cash}`);
assert(getGameState().businessUpgrades['b_corner'] === 2, 'businessUpgrades recorded Level 2');
assert(getGameState().businessUpgradeSpend['b_corner'] === 12500, 'businessUpgradeSpend recorded ₦12,500');

// L2 rates check
const l2Rates = getEffectiveRates('b_corner', 2);
assert(l2Rates.gross > l1Rates.gross, `L2 gross (₦${l2Rates.gross}) > L1 gross (₦${l1Rates.gross})`);
assert(l2Rates.cost < l1Rates.cost, `L2 cost (₦${l2Rates.cost}) < L1 cost (₦${l1Rates.cost})`);
assert(l2Rates.net > l1Rates.net, `L2 net (₦${l2Rates.net}) > L1 net (₦${l1Rates.net})`);
assert(l2Rates.capacity > l1Rates.capacity, `L2 capacity (${l2Rates.capacity}) > L1 capacity (${l1Rates.capacity})`);

// 4. Upgrade through Level 3, 4, 5
const up2 = upgradeBusinessLevel('b_corner'); // L3
assert(up2.success, 'Upgrade to Level 3 succeeded');
assert(getGameState().businessUpgrades['b_corner'] === 3, 'Level 3 reached');

const up3 = upgradeBusinessLevel('b_corner'); // L4
assert(up3.success, 'Upgrade to Level 4 succeeded');
assert(getGameState().businessUpgrades['b_corner'] === 4, 'Level 4 reached');

const up4 = upgradeBusinessLevel('b_corner'); // L5
assert(up4.success, 'Upgrade to Level 5 succeeded (Premium Operation)');
assert(getGameState().businessUpgrades['b_corner'] === 5, 'Level 5 reached');

const l5Rates = getEffectiveRates('b_corner', 5);
assert(l5Rates.gross === Math.floor(2000 * 2.80), `L5 gross multiplier applied: ₦${l5Rates.gross}`);
assert(l5Rates.cost === Math.floor(600 * 0.70), `L5 cost multiplier applied: ₦${l5Rates.cost}`);

// 5. Upgrade beyond max level is blocked
const up5 = upgradeBusinessLevel('b_corner');
assert(!up5.success, 'Upgrade beyond Level 5 (Max) is blocked');

// 6. Insufficient funds upgrade is blocked
updateGameState({ cash: 10 });
buyBusiness('b_clothing'); // Need ₦35,000, have ₦10 -> blocked
const buyBlocked = buyBusiness('b_clothing');
assert(!buyBlocked.success, 'Purchase blocked when cash insufficient');

console.log('\n══════════ TEST SUITE 3: CHARACTER SKINS & WARDROBE ══════════');
updateGameState({ cash: 50000, unlockedSkins: ['skin_street', 'skin_campus', 'skin_casual'], equippedOutfit: 'skin_street' });

// Starter skins cannot be purchased again
const buyStarter = buySkin('skin_street');
assert(!buyStarter.success, 'Double purchase of owned skin blocked');

// Purchase in-game currency skin
const suitDef = SKIN_DEFINITIONS.find((s: any) => s.id === 'skin_suit')!;
assert(suitDef.price === 5000, 'Corporate suit price is ₦5,000');
const buySuit = buySkin('skin_suit');
assert(buySuit.success, 'Purchased Corporate Suit with in-game currency');
assert(getGameState().cash === 45000, `Cash deducted correctly (₦${getGameState().cash})`);
assert(getGameState().unlockedSkins.includes('skin_suit'), 'Corporate Suit in unlockedSkins');

// Cannot buy again
const buySuitAgain = buySkin('skin_suit');
assert(!buySuitAgain.success, 'Double purchase of purchased skin blocked');

// Equip skin
assert(getGameState().equippedOutfit === 'skin_street', 'Initial skin is skin_street');
const equipSuit = equipSkin('skin_suit');
assert(equipSuit.success, 'Successfully equipped Corporate Suit');
assert(getGameState().equippedOutfit === 'skin_suit', 'Equipped outfit updated to skin_suit');

// Cannot equip locked skin
const equipLocked = equipSkin('skin_sovereign');
assert(!equipLocked.success, 'Equipping locked skin blocked');
assert(getGameState().equippedOutfit === 'skin_suit', 'Equipped outfit remained skin_suit');

console.log('\n══════════ TEST SUITE 4: PLAYER PROGRESSION & MILESTONES ══════════');
const gsProg = getGameState();
assert(gsProg.playerXP > 0, `Player earned XP from gameplay events (${gsProg.playerXP} XP)`);
assert(gsProg.playerLevel >= 1, `Player level is valid (${gsProg.playerLevel})`);
assert(typeof getPlayerLevelTitle(gsProg.playerLevel) === 'string', 'Player level title retrieved');

// Check milestones achieved
assert(gsProg.completedMilestones.includes('ms_first_biz'), 'ms_first_biz milestone achieved');
assert(gsProg.completedMilestones.includes('ms_first_upgrade'), 'ms_first_upgrade milestone achieved');
assert(gsProg.completedMilestones.includes('ms_level3_upgrade'), 'ms_level3_upgrade milestone achieved');
assert(gsProg.completedMilestones.includes('ms_max_upgrade'), 'ms_max_upgrade milestone achieved');
assert(gsProg.completedMilestones.includes('ms_first_skin'), 'ms_first_skin milestone achieved');

// Dismiss milestone notification
if (gsProg.pendingMilestoneNotifications.length > 0) {
  const notifId = gsProg.pendingMilestoneNotifications[0];
  dismissMilestoneNotification(notifId);
  assert(!getGameState().pendingMilestoneNotifications.includes(notifId), 'Milestone notification dismissed');
}

console.log('\n══════════ TEST SUITE 5: VALUATION, FINANCIAL STATS & PAYBACK ══════════');
// Set simulated cumulative financial records for Corner Shop
updateGameState({
  businessRevenue: { b_corner: 80000 },
  businessExpenses: { b_corner: 20000 },
});

const stats = getBusinessFinancialStats('b_corner', getGameState());
assert(stats.purchasePrice === 25000, 'Financial stats: purchase price ₦25,000');
assert(stats.upgradeSpend > 0, `Financial stats: upgrade investment recorded (₦${stats.upgradeSpend})`);
assert(stats.cumulativeGross === 80000, 'Financial stats: cumulative gross ₦80,000');
assert(stats.cumulativeOperatingCost === 20000, 'Financial stats: cumulative operating costs ₦20,000');
assert(stats.cumulativeNetProfit === 60000, 'Financial stats: cumulative net profit ₦60,000');
assert(stats.valuation > stats.totalInvestment, `Company valuation (₦${stats.valuation}) accounts for assets and performance`);
assert(typeof stats.paybackStatus === 'string', `Payback status calculated: "${stats.paybackStatus}"`);

const totalNetWorth = getPlayerNetWorth(getGameState());
assert(totalNetWorth > getGameState().cash, `Net worth (₦${totalNetWorth}) exceeds available cash (₦${getGameState().cash})`);

console.log('\n══════════ TEST SUITE 6: SAVE & RELOAD DATA INTEGRITY ══════════');
// Save state
saveGame();

// Clear in-memory state and load from storage
updateGameState({
  cash: 0,
  ownedBusinesses: [],
  businessUpgrades: {},
  businessUpgradeSpend: {},
  businessRevenue: {},
  businessExpenses: {},
  unlockedSkins: [],
  equippedOutfit: 'corrupted_skin',
  playerXP: 0,
  playerLevel: 0,
  completedMilestones: [],
});

loadGame();
const loaded = getGameState();

assert(loaded.cash === 45000, `Saved cash restored: ₦${loaded.cash}`);
assert(loaded.ownedBusinesses.includes('b_corner'), 'Owned businesses restored');
assert(loaded.businessUpgrades['b_corner'] === 5, 'Upgrade level restored to Level 5');
assert(loaded.businessUpgradeSpend['b_corner'] > 0, 'Upgrade spend restored');
assert(loaded.businessRevenue['b_corner'] === 80000, 'Business revenue totals restored');
assert(loaded.businessExpenses['b_corner'] === 20000, 'Business expenses totals restored');
assert(loaded.unlockedSkins.includes('skin_suit'), 'Unlocked skins restored');
assert(loaded.unlockedSkins.includes('skin_street'), 'Free starter skin restored');
assert(loaded.equippedOutfit === 'skin_suit', 'Equipped skin restored safely');
assert(loaded.playerXP > 0, 'Player XP restored');
assert(loaded.completedMilestones.includes('ms_first_biz'), 'Completed milestones restored');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  EXPANSION VERIFICATION RESULTS: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
process.exit(0);
