import { useEffect, useState } from 'react';
import { GameComponent } from './game/GameComponent';
import { CharacterAvatarPreview } from './game/CharacterAvatarPreview';
import {
  getGameState,
  subscribeToGameState,
  updateGameState,
  BUSINESS_DEFINITIONS,
  UPGRADE_TIER_DEFS,
  SKIN_DEFINITIONS,
  MILESTONES,
  buyBusiness,
  upgradeBusinessLevel,
  getUpgradeCost,
  getEffectiveRates,
  buySkin,
  equipSkin,
  getPlayerNetWorth,
  getPlayerLevelTitle,
  xpForLevel,
  getBusinessFinancialStats,
  setTargetWaypoint,
  clearTargetWaypoint,
  dismissMilestoneNotification,
} from './store/gameState';
import type { BusinessDef, Transaction, SkinDef } from './store/gameState';
import './App.css';

// Primary Visual Palette:
// Charcoal: #252923
// Forest Green: #315B43
// Warm Off-White: #F4F1E8
// Concrete Gray: #D5D4CD
// Muted Ochre: #B58A45
// Pure White: #FFFFFF

function App() {
  const [gameState, setGameState] = useState(getGameState());
  const [isPaused, setIsPaused] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmUpgradeBusiness, setConfirmUpgradeBusiness] = useState<BusinessDef | null>(null);

  // Wardrobe state
  const [selectedWardrobeSkinId, setSelectedWardrobeSkinId] = useState<string>(gameState.equippedOutfit || 'skin_street');
  const [wardrobeCategory, setWardrobeCategory] = useState<'ALL' | 'STARTER' | 'PURCHASABLE' | 'UNLOCKED'>('ALL');

  // Notification state
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Directory filter states
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'ALL' | 'OWNED' | 'UNOWNED'>('ALL');

  // Ledger filter in Reports/Ledger
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'REVENUE' | 'EXPENSE' | 'PURCHASE' | 'UPGRADE' | 'SKIN'>('ALL');

  useEffect(() => {
    const unsubscribe = subscribeToGameState((newState) => {
      setGameState(newState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmUpgradeBusiness) {
          setConfirmUpgradeBusiness(null);
        } else if (gameState.panelOpen) {
          updateGameState({ panelOpen: false });
        } else if (showPortfolio) {
          setShowPortfolio(false);
        } else if (showWardrobe) {
          setShowWardrobe(false);
        } else if (showProgression) {
          setShowProgression(false);
        } else if (showReports) {
          setShowReports(false);
        } else if (showDirectory) {
          setShowDirectory(false);
        } else if (showLedger) {
          setShowLedger(false);
        } else if (isPaused) {
          setIsPaused(false);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        }
        return;
      }

      if (
        e.key.toLowerCase() === 'e' &&
        gameState.activeInteraction &&
        !gameState.panelOpen &&
        !isPaused &&
        !showDirectory &&
        !showPortfolio &&
        !showWardrobe &&
        !showProgression &&
        !showLedger &&
        !showReports &&
        !isMenuOpen &&
        !confirmUpgradeBusiness
      ) {
        e.preventDefault();
        updateGameState({ panelOpen: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState.activeInteraction,
    gameState.panelOpen,
    isPaused,
    showDirectory,
    showPortfolio,
    showWardrobe,
    showProgression,
    showLedger,
    showReports,
    isMenuOpen,
    confirmUpgradeBusiness,
  ]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const activeBusiness = gameState.activeInteraction
    ? BUSINESS_DEFINITIONS.find((b) => b.id === gameState.activeInteraction)
    : null;

  const currentPanelBusiness = gameState.panelOpen && activeBusiness ? activeBusiness : null;
  const isPanelBusinessOwned = currentPanelBusiness ? gameState.ownedBusinesses.includes(currentPanelBusiness.id) : false;
  const isPanelBusinessSuspended = currentPanelBusiness
    ? gameState.suspendedBusinesses?.includes(currentPanelBusiness.id)
    : false;

  const currentBusinessLevel = currentPanelBusiness
    ? gameState.businessUpgrades?.[currentPanelBusiness.id] ?? 1
    : 1;

  const currentEff = currentPanelBusiness
    ? getEffectiveRates(currentPanelBusiness.id, currentBusinessLevel)
    : { gross: 0, cost: 0, net: 0, capacity: 0, tierName: 'Basic' };

  const nextEff = currentPanelBusiness && currentBusinessLevel < 5
    ? getEffectiveRates(currentPanelBusiness.id, currentBusinessLevel + 1)
    : null;

  const nextUpgradeCost = currentPanelBusiness && currentBusinessLevel < 5
    ? getUpgradeCost(currentPanelBusiness.id, currentBusinessLevel + 1)
    : 0;

  const handleBuy = (business: BusinessDef) => {
    const result = buyBusiness(business.id);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const handleConfirmUpgrade = () => {
    if (!confirmUpgradeBusiness) return;
    const result = upgradeBusinessLevel(confirmUpgradeBusiness.id);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
      setConfirmUpgradeBusiness(null);
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const handleBuySkin = (skin: SkinDef) => {
    const result = buySkin(skin.id);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const handleEquipSkin = (skinId: string) => {
    const result = equipSkin(skinId);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const closePanel = () => {
    updateGameState({ panelOpen: false });
  };

  const handleLocateBusiness = (businessId: string) => {
    setTargetWaypoint(businessId);
    setShowDirectory(false);
    setShowPortfolio(false);
    updateGameState({ panelOpen: false });
    const def = BUSINESS_DEFINITIONS.find((b) => b.id === businessId);
    if (def) {
      setMessage({ text: `Locating ${def.name}. Camera panned & waypoint set.`, type: 'success' });
    }
  };

  const openDirectoryBusinessDetails = (b: BusinessDef) => {
    updateGameState({ activeInteraction: b.id, panelOpen: true });
    setShowDirectory(false);
    setShowPortfolio(false);
  };

  // Authoritative financial calculations
  const ownedBusinessesList = gameState.ownedBusinesses
    .map((id) => BUSINESS_DEFINITIONS.find((def) => def.id === id))
    .filter(Boolean) as BusinessDef[];

  const activeOwnedBusinesses = ownedBusinessesList.filter(
    (b) => !gameState.suspendedBusinesses?.includes(b.id)
  );

  const grossIncomePerMinute = activeOwnedBusinesses.reduce((acc, b) => {
    const eff = getEffectiveRates(b.id, gameState.businessUpgrades?.[b.id] ?? 1);
    return acc + eff.gross;
  }, 0);

  const operatingCostPerMinute = activeOwnedBusinesses.reduce((acc, b) => {
    const eff = getEffectiveRates(b.id, gameState.businessUpgrades?.[b.id] ?? 1);
    return acc + eff.cost;
  }, 0);

  const netProfitPerMinute = grossIncomePerMinute - operatingCostPerMinute;
  const playerNetWorth = getPlayerNetWorth(gameState);

  const totalGrossRevenue = gameState.totalEarnings || 0;
  const totalOperatingExpenses = gameState.totalExpenses || 0;
  const totalNetProfit = totalGrossRevenue - totalOperatingExpenses;

  // Directory filtering logic
  const filteredBusinesses = BUSINESS_DEFINITIONS.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      b.type.toLowerCase().includes(directorySearch.toLowerCase()) ||
      b.category.toLowerCase().includes(directorySearch.toLowerCase());

    const isOwned = gameState.ownedBusinesses.includes(b.id);
    if (directoryFilter === 'OWNED') return matchesSearch && isOwned;
    if (directoryFilter === 'UNOWNED') return matchesSearch && !isOwned;
    return matchesSearch;
  });

  // Wardrobe filtering logic
  const filteredSkins = SKIN_DEFINITIONS.filter((s) => {
    const isUnlocked = gameState.unlockedSkins.includes(s.id);
    if (wardrobeCategory === 'STARTER') return s.price === 0;
    if (wardrobeCategory === 'PURCHASABLE') return s.price > 0 && !isUnlocked;
    if (wardrobeCategory === 'UNLOCKED') return isUnlocked;
    return true;
  });

  const selectedSkinDef =
    SKIN_DEFINITIONS.find((s) => s.id === selectedWardrobeSkinId) ||
    SKIN_DEFINITIONS.find((s) => s.id === gameState.equippedOutfit) ||
    SKIN_DEFINITIONS[0];

  // Ledger filtering logic
  const filteredLedger = gameState.ledger.filter((t) => {
    if (ledgerFilter === 'REVENUE') return t.type === 'revenue' || t.amount > 0;
    if (ledgerFilter === 'EXPENSE') return t.type === 'expense';
    if (ledgerFilter === 'PURCHASE') return t.type === 'purchase';
    if (ledgerFilter === 'UPGRADE') return t.type === 'upgrade';
    if (ledgerFilter === 'SKIN') return t.type === 'skin';
    return true;
  });

  // Level & XP calculations
  const curXP = gameState.playerXP || 0;
  const curLevel = gameState.playerLevel || 1;
  const nextLevelXP = xpForLevel(curLevel + 1);
  const curLevelBaseXP = xpForLevel(curLevel);
  const xpNeeded = nextLevelXP - curLevelBaseXP;
  const xpProgress = Math.max(0, Math.min(100, Math.floor(((curXP - curLevelBaseXP) / (xpNeeded || 1)) * 100)));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#252923] text-[#252923] font-sans">
      {/* Phaser Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <GameComponent />
      </div>

      {/* Backdrop for Navigation Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-[#252923]/60 z-30 pointer-events-auto transition-opacity"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu backdrop"
        />
      )}

      {/* Expanded Navigation Sidebar */}
      {isMenuOpen && (
        <div className="fixed top-4 left-4 z-40 w-80 max-w-[calc(100vw-32px)] bg-[#FFFFFF] border-2 border-[#D5D4CD] p-5 rounded shadow-2xl pointer-events-auto flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b-2 border-[#D5D4CD] pb-3">
            <div>
              <h1 className="text-base font-bold uppercase tracking-wider text-[#252923]">STREET TO CEO</h1>
              <span className="text-[10px] font-bold uppercase text-[#252923]/60 tracking-wider">Empire Headquarters</span>
            </div>
            <button
              className="w-8 h-8 rounded border-2 border-[#D5D4CD] bg-[#F4F1E8] hover:bg-[#D5D4CD] text-[#252923] font-bold flex items-center justify-center transition-colors text-sm"
              onClick={() => setIsMenuOpen(false)}
              title="Close Menu (Esc)"
              aria-label="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex flex-col gap-2 text-xs font-medium bg-[#F4F1E8] p-3.5 rounded border border-[#D5D4CD]">
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Player Title</span>
              <span className="font-bold text-[#B58A45] text-[11px] truncate max-w-[150px]">
                Lvl {curLevel} · {getPlayerLevelTitle(curLevel)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Spendable Cash</span>
              <span className="font-bold text-[#315B43] text-sm">₦{gameState.cash.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Total Net Worth</span>
              <span className="font-bold text-[#252923] text-sm">₦{playerNetWorth.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-[#D5D4CD]">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Gross Income/Min</span>
              <span className="font-bold text-[#315B43]">₦{grossIncomePerMinute.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Op. Costs/Min</span>
              <span className="font-bold text-[#b91c1c]">-₦{operatingCostPerMinute.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-[#D5D4CD]">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Net Profit/Min</span>
              <span className={`font-bold ${netProfitPerMinute >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                {netProfitPerMinute >= 0 ? '+' : ''}₦{netProfitPerMinute.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Enterprises Owned</span>
              <span className="font-bold text-[#252923]">{gameState.ownedBusinesses.length} / 17</span>
            </div>
            {gameState.suspendedBusinesses && gameState.suspendedBusinesses.length > 0 && (
              <div className="bg-[#b45309]/10 border border-[#b45309] p-2 rounded text-[11px] font-bold text-[#b45309]">
                ⚠️ {gameState.suspendedBusinesses.length} business(es) suspended due to unpaid operating costs.
              </div>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-3.5 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowPortfolio(true);
                setIsMenuOpen(false);
              }}
            >
              <span>COMPANY PORTFOLIO & VALUE</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-3.5 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowDirectory(true);
                setIsMenuOpen(false);
              }}
            >
              <span>BUSINESS DIRECTORY (17)</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-3.5 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowWardrobe(true);
                setIsMenuOpen(false);
              }}
            >
              <span>WARDROBE & CUSTOMIZER</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-3.5 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowProgression(true);
                setIsMenuOpen(false);
              }}
            >
              <span>PROGRESSION & MILESTONES</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-3.5 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowReports(true);
                setIsMenuOpen(false);
              }}
            >
              <span>EXECUTIVE FINANCIAL REPORTS</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-3.5 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowLedger(true);
                setIsMenuOpen(false);
              }}
            >
              <span>TRANSACTION LEDGER</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
          </div>

          <button
            className="mt-1 w-full bg-[#D5D4CD]/50 hover:bg-[#D5D4CD] text-[#252923] font-bold py-2 rounded text-xs transition-colors uppercase tracking-wider"
            onClick={() => setIsMenuOpen(false)}
          >
            Collapse Menu
          </button>
        </div>
      )}

      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-3 sm:p-5 flex flex-col justify-between">
        {/* Top HUD Bar */}
        <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
          {/* Top Left Menu Trigger & Economy Badges */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto flex-wrap">
            <button
              className="w-11 h-11 bg-[#FFFFFF] hover:bg-[#F4F1E8] border-2 border-[#D5D4CD] rounded shadow-sm flex items-center justify-center text-[#252923] transition-colors focus:outline-none focus:ring-2 focus:ring-[#315B43]"
              onClick={() => setIsMenuOpen(true)}
              title="Open Headquarters Menu"
              aria-label="Open Headquarters Menu"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>

            {/* Financial Overview Chip */}
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] px-3 py-1.5 rounded shadow-sm text-xs font-bold flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#252923]/60 uppercase tracking-wider text-[10px]">Cash</span>
                <span className="text-[#315B43] font-bold text-sm">₦{gameState.cash.toLocaleString()}</span>
              </div>
              <div className="h-4 w-px bg-[#D5D4CD]" />
              <div className="flex items-center gap-1.5">
                <span className="text-[#252923]/60 uppercase tracking-wider text-[10px]">Net Worth</span>
                <span className="text-[#252923] font-bold text-sm">₦{playerNetWorth.toLocaleString()}</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-[#D5D4CD]" />
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-[#252923]/60 uppercase tracking-wider text-[10px]">Net/15s</span>
                <span className={`font-bold ${netProfitPerMinute >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                  {netProfitPerMinute >= 0 ? '+' : ''}₦{Math.floor(netProfitPerMinute / 4).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Player Level Chip */}
            <button
              onClick={() => setShowProgression(true)}
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] border-2 border-[#B58A45] px-3 py-1.5 rounded shadow-sm text-xs font-bold flex items-center gap-2 transition-colors pointer-events-auto"
              title="View Player Progression & Milestones"
            >
              <span className="w-2 h-2 rounded-full bg-[#B58A45]" />
              <span className="text-[#252923]">Lvl {curLevel}</span>
              <span className="hidden sm:inline text-[#B58A45] font-semibold">{getPlayerLevelTitle(curLevel)}</span>
            </button>
          </div>

          {/* Top Right Waypoint Indicator & Controls */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto mt-2 sm:mt-0">
            {gameState.targetWaypoint && (
              <div className="bg-[#FFFFFF] border-2 border-[#B58A45] px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B58A45] animate-ping" />
                <span className="text-[#252923]">Target: {gameState.targetWaypoint.name}</span>
                <button
                  className="ml-1 text-[11px] bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] px-2 py-0.5 rounded"
                  onClick={clearTargetWaypoint}
                  title="Clear Waypoint"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className="bg-[#FFFFFF] hover:bg-[#F4F1E8] border-2 border-[#D5D4CD] px-3 py-1.5 rounded text-xs font-bold tracking-wide text-[#252923] shadow-sm transition-colors"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Unlocked Toast Notifications */}
        {gameState.pendingMilestoneNotifications && gameState.pendingMilestoneNotifications.length > 0 && (
          <div className="absolute top-20 right-4 max-w-sm flex flex-col gap-2 pointer-events-auto z-40">
            {gameState.pendingMilestoneNotifications.map((msId) => {
              const ms = MILESTONES.find((m) => m.id === msId);
              if (!ms) return null;
              return (
                <div
                  key={msId}
                  className="bg-[#FFFFFF] border-2 border-[#B58A45] p-3 rounded shadow-xl flex items-center justify-between gap-3 animate-bounce"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#B58A45] tracking-wider">🏆 Milestone Unlocked!</div>
                    <div className="text-xs font-bold text-[#252923]">{ms.name}</div>
                    <div className="text-[10px] text-[#252923]/70">{ms.description} (+{ms.xpReward} XP)</div>
                  </div>
                  <button
                    className="bg-[#315B43] hover:bg-[#315B43]/90 text-[#FFFFFF] font-bold text-[10px] px-2.5 py-1.5 rounded"
                    onClick={() => dismissMilestoneNotification(msId)}
                  >
                    DISMISS
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Contextual Interaction Prompt */}
        {!gameState.panelOpen && gameState.activeInteraction && activeBusiness && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-[#FFFFFF] border-2 border-[#252923] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 pointer-events-auto">
            <div className="bg-[#315B43] text-[#FFFFFF] rounded w-8 h-8 flex items-center justify-center font-bold border-2 border-[#252923]">
              E
            </div>
            <span className="font-bold text-[#252923] text-sm">Press E to inspect {activeBusiness.name}</span>
          </div>
        )}

        {/* Global Alert Notification */}
        {message && (
          <div
            className={`absolute top-16 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-xl font-bold border-2 transition-all pointer-events-none z-50 text-sm ${
              message.type === 'error'
                ? 'bg-[#FFFFFF] border-[#252923] text-red-700'
                : 'bg-[#315B43] border-[#252923] text-[#FFFFFF]'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ─── UPGRADE CONFIRMATION MODAL ────────────────────────────────────── */}
        {confirmUpgradeBusiness && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-50 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#B58A45] p-6 rounded shadow-2xl w-full max-w-md flex flex-col gap-4">
              <div className="border-b-2 border-[#D5D4CD] pb-3">
                <span className="text-[10px] font-bold uppercase text-[#B58A45] tracking-wider">Capital Investment Authorization</span>
                <h3 className="text-xl font-bold text-[#252923]">Upgrade {confirmUpgradeBusiness.name}?</h3>
              </div>

              {(() => {
                const curLvl = gameState.businessUpgrades?.[confirmUpgradeBusiness.id] ?? 1;
                const nextLvl = curLvl + 1;
                const cost = getUpgradeCost(confirmUpgradeBusiness.id, nextLvl);
                const curE = getEffectiveRates(confirmUpgradeBusiness.id, curLvl);
                const nxtE = getEffectiveRates(confirmUpgradeBusiness.id, nextLvl);
                const tierName = UPGRADE_TIER_DEFS[nextLvl - 1]?.name || 'Upgraded Tier';
                const canAfford = gameState.cash >= cost;

                return (
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="bg-[#F4F1E8] p-3 rounded border border-[#D5D4CD] flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#252923]/70 font-semibold">Advancement:</span>
                        <span className="font-bold text-[#252923]">Level {curLvl} → Level {nextLvl} ({tierName})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#252923]/70 font-semibold">Upgrade Cost:</span>
                        <span className="font-bold text-[#b91c1c]">₦{cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#252923]/70 font-semibold">Spendable Cash After:</span>
                        <span className={`font-bold ${canAfford ? 'text-[#315B43]' : 'text-red-700'}`}>
                          ₦{(gameState.cash - cost).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#D5D4CD] pt-2 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#252923]/60 tracking-wider">Financial Effect Comparison:</span>
                      <div className="flex justify-between">
                        <span>Gross Revenue:</span>
                        <span className="font-semibold">₦{curE.gross.toLocaleString()}/min → <strong className="text-[#315B43]">₦{nxtE.gross.toLocaleString()}/min</strong> (+₦{(nxtE.gross - curE.gross).toLocaleString()})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Costs:</span>
                        <span className="font-semibold">₦{curE.cost.toLocaleString()}/min → <strong className="text-[#b91c1c]">₦{nxtE.cost.toLocaleString()}/min</strong></span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#D5D4CD]">
                        <span className="font-bold">Net Profit Jump:</span>
                        <span className="font-bold text-[#315B43]">
                          +₦{curE.net.toLocaleString()}/min → +₦{nxtE.net.toLocaleString()}/min (+₦{(nxtE.net - curE.net).toLocaleString()}/min)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Capacity:</span>
                        <span className="font-semibold">{curE.capacity} → {nxtE.capacity} clients/day</span>
                      </div>
                    </div>

                    {!canAfford && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded font-bold text-[11px]">
                        ⚠️ Insufficient funds. You need ₦{(cost - gameState.cash).toLocaleString()} more.
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        className="flex-1 bg-[#D5D4CD] hover:bg-[#D5D4CD]/80 text-[#252923] font-bold py-2.5 rounded transition-colors"
                        onClick={() => setConfirmUpgradeBusiness(null)}
                      >
                        CANCEL
                      </button>
                      <button
                        disabled={!canAfford}
                        className={`flex-1 font-bold py-2.5 rounded text-white transition-colors ${
                          canAfford ? 'bg-[#315B43] hover:bg-[#315B43]/90' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleConfirmUpgrade}
                      >
                        CONFIRM UPGRADE
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ─── FEATURE 4: COMPANY PORTFOLIO & MANAGEMENT MODAL ────────────────── */}
        {showPortfolio && !gameState.panelOpen && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-[#D5D4CD] pb-3">
                <div>
                  <h2 className="text-xl font-bold uppercase text-[#252923]">Company Portfolio & Management</h2>
                  <span className="text-xs text-[#252923]/60 font-semibold uppercase">
                    Asset Valuations, Payback Timelines & Operational Efficiency
                  </span>
                </div>
                <button
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded text-xs"
                  onClick={() => setShowPortfolio(false)}
                >
                  CLOSE
                </button>
              </div>

              {/* Portfolio Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#252923]/60">Total Net Worth</span>
                  <span className="text-lg font-bold text-[#252923]">₦{playerNetWorth.toLocaleString()}</span>
                  <span className="text-[9px] text-[#252923]/50">Cash + Enterprise Assets</span>
                </div>
                <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#252923]/60">Spendable Cash</span>
                  <span className="text-lg font-bold text-[#315B43]">₦{gameState.cash.toLocaleString()}</span>
                  <span className="text-[9px] text-[#252923]/50">Immediate liquidity</span>
                </div>
                <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#252923]/60">Enterprises Owned</span>
                  <span className="text-lg font-bold text-[#B58A45]">{ownedBusinessesList.length} / 17</span>
                  <span className="text-[9px] text-[#252923]/50">Commercial properties</span>
                </div>
                <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#252923]/60">Combined Net Run Rate</span>
                  <span className="text-lg font-bold text-[#315B43]">+{netProfitPerMinute.toLocaleString()}/min</span>
                  <span className="text-[9px] text-[#252923]/50">₦{Math.floor(netProfitPerMinute / 4).toLocaleString()} every 15s</span>
                </div>
              </div>

              {/* Owned Enterprises List */}
              <div className="overflow-y-auto flex flex-col gap-3 pr-1">
                {ownedBusinessesList.length === 0 ? (
                  <div className="bg-[#F4F1E8] p-8 rounded border border-[#D5D4CD] text-center text-xs font-medium text-[#252923]/70">
                    No commercial properties acquired yet. Explore the{' '}
                    <button
                      className="text-[#315B43] font-bold underline"
                      onClick={() => {
                        setShowPortfolio(false);
                        setShowDirectory(true);
                      }}
                    >
                      Business Directory
                    </button>{' '}
                    to make your first acquisition.
                  </div>
                ) : (
                  ownedBusinessesList.map((b) => {
                    const stats = getBusinessFinancialStats(b.id, gameState);
                    const isSuspended = gameState.suspendedBusinesses?.includes(b.id);

                    return (
                      <div
                        key={b.id}
                        className="bg-[#F4F1E8] border-2 border-[#D5D4CD] p-4 rounded flex flex-col gap-3 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#D5D4CD] pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-[#252923]">{b.name}</span>
                              <span className="bg-[#B58A45]/20 text-[#B58A45] border border-[#B58A45] px-2 py-0.5 rounded font-bold text-[10px]">
                                Level {stats.level}: {stats.tierName}
                              </span>
                              {isSuspended && (
                                <span className="bg-[#b45309]/10 text-[#b45309] border border-[#b45309] px-2 py-0.5 rounded font-bold text-[10px]">
                                  SUSPENDED
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#252923]/60 uppercase font-semibold">
                              {b.category} · Customer Capacity: {stats.capacity} clients/day
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className="text-xs bg-[#B58A45] hover:bg-[#B58A45]/90 text-white font-bold px-3 py-1.5 rounded transition-colors"
                              onClick={() => handleLocateBusiness(b.id)}
                            >
                              LOCATE
                            </button>
                            <button
                              className="text-xs bg-[#315B43] hover:bg-[#315B43]/90 text-white font-bold px-3 py-1.5 rounded transition-colors"
                              onClick={() => openDirectoryBusinessDetails(b)}
                            >
                              INSPECT & UPGRADE
                            </button>
                          </div>
                        </div>

                        {/* Financial metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#252923]/60 block font-semibold">Purchase & Upgrades:</span>
                            <span className="font-bold text-[#252923]">
                              ₦{stats.purchasePrice.toLocaleString()} + ₦{stats.upgradeSpend.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#252923]/50 block">Total: ₦{stats.totalInvestment.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[#252923]/60 block font-semibold">Cumulative Net Profit:</span>
                            <span className={`font-bold ${stats.cumulativeNetProfit >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                              ₦{stats.cumulativeNetProfit.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#252923]/50 block">Rev: ₦{stats.cumulativeGross.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[#252923]/60 block font-semibold">Payback Estimate:</span>
                            <span className="font-bold text-[#B58A45]">{stats.paybackStatus}</span>
                            <span className="text-[9px] text-[#252923]/50 block">Net: +₦{stats.currentNetProfitPerMin.toLocaleString()}/min</span>
                          </div>
                          <div>
                            <span className="text-[#252923]/60 block font-semibold">Company Valuation:</span>
                            <span className="font-bold text-[#315B43] text-sm">₦{stats.valuation.toLocaleString()}</span>
                            <span className="text-[9px] text-[#252923]/50 block">Asset + Performance</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── FEATURE 2: WARDROBE & CHARACTER CUSTOMIZATION MODAL ──────────── */}
        {showWardrobe && !gameState.panelOpen && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-[#D5D4CD] pb-3">
                <div>
                  <h2 className="text-xl font-bold uppercase text-[#252923]">Executive Wardrobe & Customizer</h2>
                  <span className="text-xs text-[#252923]/60 font-semibold uppercase">
                    Reflect Your Mogul Status on the Streets & in the Boardroom
                  </span>
                </div>
                <button
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded text-xs"
                  onClick={() => setShowWardrobe(false)}
                >
                  CLOSE
                </button>
              </div>

              {/* Main wardrobe content: Preview on left, catalog on right */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-y-auto pr-1">
                {/* Left: Active Outfit Showcase */}
                <div className="bg-[#F4F1E8] border-2 border-[#D5D4CD] p-4 rounded flex flex-col items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#252923]/60">
                    Selected Look Preview
                  </span>
                  <CharacterAvatarPreview
                    skin={selectedSkinDef}
                    size={140}
                    isEquipped={gameState.equippedOutfit === selectedSkinDef.id}
                  />

                  <div className="text-center w-full">
                    <h3 className="text-base font-bold text-[#252923]">{selectedSkinDef.name}</h3>
                    <span className="text-[11px] text-[#B58A45] font-bold uppercase tracking-wider">
                      {selectedSkinDef.category} · {selectedSkinDef.price === 0 ? 'Free Starter' : `₦${selectedSkinDef.price.toLocaleString()}`}
                    </span>
                    <p className="text-xs text-[#252923]/80 mt-1.5 leading-relaxed">{selectedSkinDef.description}</p>
                  </div>

                  {/* Action button for previewed outfit */}
                  <div className="w-full pt-2 border-t border-[#D5D4CD]">
                    {gameState.equippedOutfit === selectedSkinDef.id ? (
                      <div className="w-full bg-[#315B43]/20 border border-[#315B43] text-[#315B43] font-bold py-2 rounded text-center text-xs">
                        ✓ CURRENTLY EQUIPPED
                      </div>
                    ) : gameState.unlockedSkins.includes(selectedSkinDef.id) ? (
                      <button
                        className="w-full bg-[#315B43] hover:bg-[#315B43]/90 text-white font-bold py-2.5 rounded text-xs transition-colors"
                        onClick={() => handleEquipSkin(selectedSkinDef.id)}
                      >
                        EQUIP OUTFIT
                      </button>
                    ) : (
                      <button
                        disabled={gameState.cash < selectedSkinDef.price}
                        className={`w-full font-bold py-2.5 rounded text-xs text-white transition-colors ${
                          gameState.cash >= selectedSkinDef.price
                            ? 'bg-[#B58A45] hover:bg-[#B58A45]/90'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => handleBuySkin(selectedSkinDef)}
                      >
                        {gameState.cash >= selectedSkinDef.price
                          ? `PURCHASE (₦${selectedSkinDef.price.toLocaleString()})`
                          : `NEED ₦${(selectedSkinDef.price - gameState.cash).toLocaleString()} MORE`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Skin Catalogue Grid */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  {/* Category Filter Tabs */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(['ALL', 'STARTER', 'PURCHASABLE', 'UNLOCKED'] as const).map((cat) => (
                      <button
                        key={cat}
                        className={`text-xs font-bold px-3 py-1.5 rounded border transition-colors ${
                          wardrobeCategory === cat
                            ? 'bg-[#315B43] text-white border-[#315B43]'
                            : 'bg-[#F4F1E8] text-[#252923] border-[#D5D4CD] hover:bg-[#D5D4CD]'
                        }`}
                        onClick={() => setWardrobeCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Grid of skin cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto pr-1">
                    {filteredSkins.map((skin) => {
                      const isEquipped = gameState.equippedOutfit === skin.id;
                      const isUnlocked = gameState.unlockedSkins.includes(skin.id);
                      const isSelected = selectedSkinDef.id === skin.id;

                      return (
                        <div
                          key={skin.id}
                          onClick={() => setSelectedWardrobeSkinId(skin.id)}
                          className={`p-3 rounded border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[#FFFFFF] border-[#B58A45] shadow-md ring-1 ring-[#B58A45]'
                              : 'bg-[#F4F1E8] border-[#D5D4CD] hover:border-[#252923]/40'
                          }`}
                        >
                          <CharacterAvatarPreview skin={skin} size={60} isEquipped={isEquipped} />
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-xs text-[#252923]">{skin.name}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                  isEquipped
                                    ? 'bg-[#315B43]/15 text-[#315B43] border-[#315B43]'
                                    : isUnlocked
                                    ? 'bg-[#252923]/10 text-[#252923] border-[#D5D4CD]'
                                    : 'bg-[#b45309]/10 text-[#b45309] border-[#b45309]'
                                }`}
                              >
                                {isEquipped ? 'EQUIPPED' : isUnlocked ? 'OWNED' : 'LOCKED'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#252923]/70 line-clamp-1">{skin.description}</span>
                            <div className="text-[10px] font-bold text-[#B58A45]">
                              {skin.price === 0 ? 'FREE' : `₦${skin.price.toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FEATURE 3: PLAYER PROGRESSION & MILESTONES MODAL ─────────────── */}
        {showProgression && !gameState.panelOpen && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-[#D5D4CD] pb-3">
                <div>
                  <h2 className="text-xl font-bold uppercase text-[#252923]">Career Progression & Milestones</h2>
                  <span className="text-xs text-[#252923]/60 font-semibold uppercase">
                    Track Accomplishments, Reputation, and Executive Standing
                  </span>
                </div>
                <button
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded text-xs"
                  onClick={() => setShowProgression(false)}
                >
                  CLOSE
                </button>
              </div>

              {/* Player Level & XP Card */}
              <div className="bg-[#F4F1E8] border-2 border-[#D5D4CD] p-4 rounded flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#252923]/60">Current Status</span>
                    <h3 className="text-lg font-bold text-[#252923]">
                      Level {curLevel} — {getPlayerLevelTitle(curLevel)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#252923]/60">Career XP</span>
                    <span className="text-sm font-bold text-[#B58A45] block">{curXP} XP</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-[#252923]/70 mb-1">
                    <span>Progress to Level {Math.min(10, curLevel + 1)}</span>
                    <span>{xpProgress}%</span>
                  </div>
                  <div className="w-full bg-[#D5D4CD] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#315B43] h-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#252923]">
                  Executive Milestones ({gameState.completedMilestones.length} of {MILESTONES.length} achieved)
                </h3>

                <div className="overflow-y-auto flex flex-col gap-2 max-h-[46vh] pr-1">
                  {MILESTONES.map((ms) => {
                    const isCompleted = gameState.completedMilestones.includes(ms.id);
                    return (
                      <div
                        key={ms.id}
                        className={`p-3 rounded border flex justify-between items-center text-xs ${
                          isCompleted
                            ? 'bg-[#315B43]/10 border-[#315B43]'
                            : 'bg-[#F4F1E8] border-[#D5D4CD]'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#252923] text-sm">{ms.name}</span>
                            {isCompleted ? (
                              <span className="text-[9px] font-bold text-[#315B43] bg-[#315B43]/20 border border-[#315B43] px-1.5 py-0.5 rounded">
                                ✓ COMPLETED
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-[#252923]/50 bg-[#D5D4CD] px-1.5 py-0.5 rounded">
                                IN PROGRESS
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#252923]/70">{ms.description}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-[#B58A45] text-xs">+{ms.xpReward} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FINANCIAL REPORTS MODAL ───────────────────────────────────────── */}
        {showReports && !gameState.panelOpen && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-[#D5D4CD] pb-3">
                <div>
                  <h2 className="text-xl font-bold uppercase text-[#252923]">Executive Financial Report</h2>
                  <span className="text-xs text-[#252923]/60 font-semibold uppercase">Economy Balance & Performance</span>
                </div>
                <button
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded text-xs"
                  onClick={() => setShowReports(false)}
                >
                  CLOSE
                </button>
              </div>

              <div className="overflow-y-auto flex flex-col gap-4 pr-1">
                {/* 4 Core Financial Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#252923]/60">Cash Balance</span>
                    <span className="text-base font-bold text-[#315B43]">₦{gameState.cash.toLocaleString()}</span>
                    <span className="text-[9px] text-[#252923]/50">Available spendable</span>
                  </div>

                  <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#252923]/60">Total Gross Revenue</span>
                    <span className="text-base font-bold text-[#252923]">₦{totalGrossRevenue.toLocaleString()}</span>
                    <span className="text-[9px] text-[#252923]/50">Career cumulative</span>
                  </div>

                  <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#252923]/60">Operating Expenses</span>
                    <span className="text-base font-bold text-[#b91c1c]">₦{totalOperatingExpenses.toLocaleString()}</span>
                    <span className="text-[9px] text-[#252923]/50">Total operating costs</span>
                  </div>

                  <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#252923]/60">Total Net Profit</span>
                    <span className={`text-base font-bold ${totalNetProfit >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                      ₦{totalNetProfit.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#252923]/50">Gross minus operating</span>
                  </div>
                </div>

                {/* Recurring Run-Rate Banner */}
                <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-4 rounded flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase text-[#252923] tracking-wider border-b border-[#D5D4CD] pb-1.5 flex justify-between">
                    <span>15-Second Passive Income Cycle</span>
                    <span className="text-[#315B43]">Every 15 Seconds</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#252923]/60 block">Gross Income / Min</span>
                      <span className="font-bold text-[#315B43] text-sm">₦{grossIncomePerMinute.toLocaleString()}</span>
                      <span className="text-[10px] text-[#252923]/50 block">₦{Math.floor(grossIncomePerMinute / 4).toLocaleString()} / 15s</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#252923]/60 block">Operating Costs / Min</span>
                      <span className="font-bold text-[#b91c1c] text-sm">-₦{operatingCostPerMinute.toLocaleString()}</span>
                      <span className="text-[10px] text-[#252923]/50 block">-₦{Math.floor(operatingCostPerMinute / 4).toLocaleString()} / 15s</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#252923]/60 block">Net Profit Rate / Min</span>
                      <span className={`font-bold text-sm ${netProfitPerMinute >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                        {netProfitPerMinute >= 0 ? '+' : ''}₦{netProfitPerMinute.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#252923]/50 block">
                        ₦{Math.floor(netProfitPerMinute / 4).toLocaleString()} net / 15s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-Business Portfolio Breakdown */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#252923]">
                      Owned Enterprises Breakdown ({ownedBusinessesList.length} of 17)
                    </h3>
                  </div>

                  {ownedBusinessesList.length === 0 ? (
                    <div className="bg-[#F4F1E8] p-6 rounded border border-[#D5D4CD] text-center text-xs font-medium text-[#252923]/70">
                      No enterprises owned yet. Open the Business Directory to acquire your first property.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ownedBusinessesList.map((b) => {
                        const lvl = gameState.businessUpgrades?.[b.id] ?? 1;
                        const eff = getEffectiveRates(b.id, lvl);
                        const isSuspended = gameState.suspendedBusinesses?.includes(b.id);
                        const tickNet = Math.floor(eff.net / 4);

                        return (
                          <div
                            key={b.id}
                            className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#252923] text-sm flex items-center gap-2">
                                <span>{b.name}</span>
                                <span className="bg-[#B58A45]/20 text-[#B58A45] border border-[#B58A45] text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  Level {lvl} ({eff.tierName})
                                </span>
                                {isSuspended ? (
                                  <span className="bg-[#b45309]/10 text-[#b45309] border border-[#b45309] text-[9px] px-1.5 py-0.5 rounded font-bold">
                                    SUSPENDED
                                  </span>
                                ) : (
                                  <span className="bg-[#315B43]/10 text-[#315B43] border border-[#315B43] text-[9px] px-1.5 py-0.5 rounded font-bold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#252923]/60">{b.type} · Capacity: {eff.capacity}</span>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <span className="text-[10px] text-[#252923]/60 block">Effective Gross / Costs</span>
                                <span className="font-semibold text-[#252923]">
                                  ₦{eff.gross.toLocaleString()} / -₦{eff.cost.toLocaleString()}
                                </span>
                              </div>
                              <div className="border-l border-[#D5D4CD] pl-3">
                                <span className="text-[10px] text-[#252923]/60 block">Net Profit / 15s</span>
                                <span className="font-bold text-[#315B43]">
                                  +₦{eff.net.toLocaleString()}/min (+₦{tickNet.toLocaleString()}/15s)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── BUSINESS DIRECTORY MODAL ──────────────────────────────────────── */}
        {showDirectory && !gameState.panelOpen && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-[#D5D4CD] pb-3">
                <div>
                  <h2 className="text-xl font-bold uppercase text-[#252923]">City Business Catalogue</h2>
                  <span className="text-xs text-[#252923]/60 font-semibold uppercase">
                    17 Commercial Enterprises
                  </span>
                </div>
                <button
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded text-xs"
                  onClick={() => setShowDirectory(false)}
                >
                  CLOSE
                </button>
              </div>

              {/* Search Bar & Filter Tabs */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                <input
                  type="text"
                  placeholder="Search by business name or category..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full sm:w-72 bg-[#F4F1E8] border border-[#D5D4CD] px-3 py-1.5 rounded text-xs font-medium text-[#252923] focus:outline-none focus:ring-1 focus:ring-[#315B43]"
                />
                <div className="flex items-center gap-1 self-start sm:self-auto">
                  {(['ALL', 'OWNED', 'UNOWNED'] as const).map((filter) => (
                    <button
                      key={filter}
                      className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                        directoryFilter === filter
                          ? 'bg-[#315B43] text-[#FFFFFF] border-[#315B43]'
                          : 'bg-[#F4F1E8] text-[#252923] border-[#D5D4CD] hover:bg-[#D5D4CD]'
                      }`}
                      onClick={() => setDirectoryFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Directory Listing */}
              <div className="overflow-y-auto flex flex-col gap-3 pr-1">
                {filteredBusinesses.length === 0 ? (
                  <div className="text-center p-8 text-[#252923]/70 font-semibold text-xs">
                    No businesses matching your criteria.
                  </div>
                ) : (
                  filteredBusinesses.map((b) => {
                    const owned = gameState.ownedBusinesses.includes(b.id);
                    const lvl = gameState.businessUpgrades?.[b.id] ?? 1;
                    const eff = getEffectiveRates(b.id, lvl);
                    const isSuspended = gameState.suspendedBusinesses?.includes(b.id);

                    return (
                      <div
                        key={b.id}
                        className="bg-[#F4F1E8] border-2 border-[#D5D4CD] p-3.5 rounded flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                      >
                        <div className="flex flex-col gap-1 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#252923] text-base">{b.name}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                owned
                                  ? 'text-[#315B43] border-[#315B43] bg-[#315B43]/10'
                                  : 'text-[#252923]/60 border-[#D5D4CD] bg-[#FFFFFF]'
                              }`}
                            >
                              {owned ? (isSuspended ? 'OWNED (SUSPENDED)' : `OWNED (LVL ${lvl})`) : 'FOR SALE'}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#252923]/70 uppercase">{b.category}</span>
                          <p className="text-[11px] text-[#252923]/80 line-clamp-2">{b.description}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#D5D4CD]">
                          <div className="text-right flex flex-col gap-0.5">
                            <div className="text-xs font-bold text-[#252923]">
                              Price: <span className="text-sm font-bold text-[#252923]">₦{b.price.toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-[#252923]/80 font-medium">
                              Gross: ₦{eff.gross.toLocaleString()}/min | Costs: ₦{eff.cost.toLocaleString()}/min
                            </div>
                            <div className="text-xs font-bold text-[#315B43]">
                              Net: +₦{eff.net.toLocaleString()}/min (+₦{Math.floor(eff.net / 4).toLocaleString()} / 15s)
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className="text-xs bg-[#B58A45] hover:bg-[#B58A45]/80 text-[#FFFFFF] font-bold px-3 py-1.5 rounded transition-colors"
                              onClick={() => handleLocateBusiness(b.id)}
                              title="Locate building in city"
                            >
                              LOCATE ON MAP
                            </button>
                            <button
                              className="text-xs bg-[#252923] hover:bg-[#252923]/80 text-[#FFFFFF] font-bold px-3 py-1.5 rounded transition-colors"
                              onClick={() => openDirectoryBusinessDetails(b)}
                            >
                              DETAILS
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── FINANCIAL LEDGER OVERLAY ──────────────────────────────────────── */}
        {showLedger && !gameState.panelOpen && !showDirectory && !showReports && !showWardrobe && !showPortfolio && !showProgression && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-20 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-3 border-b-2 border-[#D5D4CD] pb-3">
                <h2 className="text-xl font-bold uppercase text-[#252923]">Financial Ledger</h2>
                <button
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded text-xs"
                  onClick={() => setShowLedger(false)}
                >
                  CLOSE
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 mb-3 flex-wrap">
                {(['ALL', 'REVENUE', 'EXPENSE', 'PURCHASE', 'UPGRADE', 'SKIN'] as const).map((filter) => (
                  <button
                    key={filter}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                      ledgerFilter === filter
                        ? 'bg-[#315B43] text-[#FFFFFF] border-[#315B43]'
                        : 'bg-[#F4F1E8] text-[#252923] border-[#D5D4CD] hover:bg-[#D5D4CD]'
                    }`}
                    onClick={() => setLedgerFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto flex flex-col gap-2">
                {filteredLedger.length === 0 ? (
                  <div className="text-center p-8 text-[#252923]/70 font-semibold text-xs">No transactions found.</div>
                ) : (
                  filteredLedger.map((t: Transaction, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#F4F1E8] border border-[#D5D4CD] p-2.5 rounded flex justify-between items-center text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-[#252923]">{t.description}</span>
                        <span className="text-[10px] text-[#252923]/60">{new Date(t.date).toLocaleTimeString()}</span>
                      </div>
                      <span
                        className={`font-bold ${
                          t.amount > 0 ? 'text-[#315B43]' : t.amount < 0 ? 'text-red-700' : 'text-[#252923]'
                        }`}
                      >
                        {t.amount > 0 ? '+' : ''}₦{t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── PAUSE OVERLAY ─────────────────────────────────────────────────── */}
        {isPaused && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-20 pointer-events-auto">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-8 rounded shadow-lg text-center min-w-[300px]">
              <h2 className="text-2xl font-bold text-[#252923] mb-2 uppercase">PAUSED</h2>
              <p className="text-[#252923]/80 font-semibold mb-6 text-sm">Game economy paused.</p>
              <button
                className="w-full bg-[#315B43] hover:bg-[#315B43]/90 text-[#FFFFFF] font-bold py-3 px-4 rounded transition-colors"
                onClick={() => setIsPaused(false)}
              >
                RESUME
              </button>
            </div>
          </div>
        )}

        {/* ─── FEATURE 1: BUSINESS DETAILS & INSPECT PANEL (WITH UPGRADES) ──── */}
        {gameState.panelOpen && currentPanelBusiness && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-xl w-full max-w-lg pointer-events-auto flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b-2 border-[#D5D4CD] pb-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#252923] leading-tight uppercase">
                    {currentPanelBusiness.name}
                  </h2>
                  <span className="text-xs font-bold text-[#252923]/70 uppercase tracking-wider">
                    {currentPanelBusiness.category} ({currentPanelBusiness.type})
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded text-xs font-bold border-2 ${
                    isPanelBusinessOwned
                      ? isPanelBusinessSuspended
                        ? 'text-[#b45309] border-[#b45309] bg-[#b45309]/10'
                        : 'text-[#315B43] border-[#315B43] bg-[#315B43]/10'
                      : 'bg-[#D5D4CD] text-[#252923] border-[#D5D4CD]'
                  }`}
                >
                  {isPanelBusinessOwned
                    ? isPanelBusinessSuspended
                      ? 'SUSPENDED'
                      : `LEVEL ${currentBusinessLevel}: ${currentEff.tierName}`
                    : 'FOR SALE'}
                </div>
              </div>

              <div className="bg-[#F4F1E8] p-4 rounded border-2 border-[#D5D4CD] flex flex-col gap-3">
                <p className="text-[#252923] font-medium text-xs leading-relaxed">
                  {currentPanelBusiness.description}
                </p>

                {/* Financial breakdown table */}
                <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#D5D4CD] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Gross Revenue</span>
                    <div className="text-right">
                      <span className="font-bold text-[#315B43]">
                        ₦{currentEff.gross.toLocaleString()} / min
                      </span>
                      <span className="text-[10px] text-[#252923]/60 block">
                        ₦{Math.floor(currentEff.gross / 4).toLocaleString()} every 15s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Operating Costs</span>
                    <div className="text-right">
                      <span className="font-bold text-[#b91c1c]">
                        ₦{currentEff.cost.toLocaleString()} / min
                      </span>
                      <span className="text-[10px] text-[#252923]/60 block">
                        ₦{Math.floor(currentEff.cost / 4).toLocaleString()} every 15s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#D5D4CD]">
                    <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Net Profit</span>
                    <div className="text-right">
                      <span className="font-bold text-[#315B43]">
                        +₦{currentEff.net.toLocaleString()} / min
                      </span>
                      <span className="text-[10px] text-[#252923]/60 block">
                        +₦{Math.floor(currentEff.net / 4).toLocaleString()} every 15s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Customer Capacity</span>
                    <span className="font-bold text-[#252923]">
                      {currentEff.capacity} clients/day
                    </span>
                  </div>

                  {!isPanelBusinessOwned ? (
                    <div className="flex items-center justify-between pt-1 border-t border-[#D5D4CD]">
                      <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Purchase Price</span>
                      <span className="text-lg font-bold text-[#252923]">
                        ₦{currentPanelBusiness.price.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Financial performance summary for owned business */}
                      {(() => {
                        const stats = getBusinessFinancialStats(currentPanelBusiness.id, gameState);
                        return (
                          <div className="bg-[#FFFFFF] p-2.5 rounded border border-[#D5D4CD] flex flex-col gap-1 mt-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-[#252923]/60">Total Invested:</span>
                              <span className="font-bold">₦{stats.totalInvestment.toLocaleString()} (Upgrades: ₦{stats.upgradeSpend.toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#252923]/60">Cumulative Net Profit:</span>
                              <span className={`font-bold ${stats.cumulativeNetProfit >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                                ₦{stats.cumulativeNetProfit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#252923]/60">Break-Even Status:</span>
                              <span className="font-bold text-[#B58A45]">{stats.paybackStatus}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-[#D5D4CD]">
                              <span className="text-[#252923]/60">Company Valuation:</span>
                              <span className="font-bold text-[#315B43]">₦{stats.valuation.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Upgrade Section */}
                      {currentBusinessLevel < 5 && nextEff ? (
                        <div className="bg-[#FFFFFF] border-2 border-[#B58A45] p-3 rounded flex flex-col gap-2 mt-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#B58A45] tracking-wider">
                                Upgrade Option
                              </span>
                              <div className="font-bold text-xs text-[#252923]">
                                Level {currentBusinessLevel + 1}: {nextEff.tierName}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-[#252923]/60 block">Price</span>
                              <span className="font-bold text-[#252923] text-sm">
                                ₦{nextUpgradeCost.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#F4F1E8] p-2 rounded">
                            <div>
                              <span className="text-[#252923]/60 block">Net Profit:</span>
                              <span className="font-bold text-[#315B43]">
                                +₦{currentEff.net.toLocaleString()} → +₦{nextEff.net.toLocaleString()}/min
                              </span>
                            </div>
                            <div>
                              <span className="text-[#252923]/60 block">Capacity:</span>
                              <span className="font-bold text-[#252923]">
                                {currentEff.capacity} → {nextEff.capacity} clients
                              </span>
                            </div>
                          </div>

                          <button
                            className="w-full bg-[#B58A45] hover:bg-[#B58A45]/90 text-white font-bold py-2 rounded text-xs transition-colors shadow-sm"
                            onClick={() => setConfirmUpgradeBusiness(currentPanelBusiness)}
                          >
                            UPGRADE OPERATION (₦{nextUpgradeCost.toLocaleString()})
                          </button>
                        </div>
                      ) : (
                        <div className="bg-[#315B43]/15 border border-[#315B43] p-2.5 rounded text-center font-bold text-xs text-[#315B43] mt-2">
                          ★ MAXIMUM LEVEL REACHED: Premium Operation
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-[#D5D4CD] hover:bg-[#D5D4CD]/80 text-[#252923] font-bold py-2.5 px-3 rounded text-xs transition-colors"
                  onClick={closePanel}
                >
                  {isPanelBusinessOwned ? 'CLOSE' : 'CANCEL'}
                </button>
                <button
                  className="bg-[#B58A45] hover:bg-[#B58A45]/90 text-[#FFFFFF] font-bold py-2.5 px-3 rounded text-xs transition-colors"
                  onClick={() => handleLocateBusiness(currentPanelBusiness.id)}
                  title="Locate on Map"
                >
                  LOCATE
                </button>
                {!isPanelBusinessOwned && (
                  <button
                    className="flex-1 bg-[#315B43] hover:bg-[#315B43]/90 text-[#FFFFFF] font-bold py-2.5 px-3 rounded text-xs transition-colors"
                    onClick={() => handleBuy(currentPanelBusiness)}
                  >
                    BUY BUSINESS
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
