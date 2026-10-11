import { useEffect, useState } from 'react';
import { GameComponent } from './game/GameComponent';
import {
  getGameState,
  subscribeToGameState,
  updateGameState,
  BUSINESS_DEFINITIONS,
  buyBusiness,
  setTargetWaypoint,
  clearTargetWaypoint
} from './store/gameState';
import type { BusinessDef, Transaction } from './store/gameState';
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
  const [showLedger, setShowLedger] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Directory filter states
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'ALL' | 'OWNED' | 'UNOWNED'>('ALL');

  // Ledger filter in Reports/Ledger
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'REVENUE' | 'EXPENSE' | 'PURCHASE'>('ALL');

  useEffect(() => {
    const unsubscribe = subscribeToGameState((newState) => {
      setGameState(newState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState.panelOpen) {
          updateGameState({ panelOpen: false });
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
        !showLedger &&
        !showReports &&
        !isMenuOpen
      ) {
        e.preventDefault();
        updateGameState({ panelOpen: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.activeInteraction, gameState.panelOpen, isPaused, showDirectory, showLedger, showReports, isMenuOpen]);

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

  const handleBuy = (business: BusinessDef) => {
    const result = buyBusiness(business.id);
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
    updateGameState({ panelOpen: false });
    const def = BUSINESS_DEFINITIONS.find((b) => b.id === businessId);
    if (def) {
      setMessage({ text: `Locating ${def.name}. Camera panned & waypoint set.`, type: 'success' });
    }
  };

  const openDirectoryBusinessDetails = (b: BusinessDef) => {
    updateGameState({ activeInteraction: b.id, panelOpen: true });
    setShowDirectory(false);
  };

  // Authoritative financial calculations
  const ownedBusinessesList = gameState.ownedBusinesses
    .map((id) => BUSINESS_DEFINITIONS.find((def) => def.id === id))
    .filter(Boolean) as BusinessDef[];

  const activeOwnedBusinesses = ownedBusinessesList.filter(
    (b) => !gameState.suspendedBusinesses?.includes(b.id)
  );

  const grossIncomePerMinute = activeOwnedBusinesses.reduce((acc, b) => acc + b.incomePerMinute, 0);
  const operatingCostPerMinute = activeOwnedBusinesses.reduce((acc, b) => acc + b.operatingCostPerMinute, 0);
  const netProfitPerMinute = grossIncomePerMinute - operatingCostPerMinute;

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

  // Ledger filtering logic
  const filteredLedger = gameState.ledger.filter((t) => {
    if (ledgerFilter === 'REVENUE') return t.type === 'revenue' || t.amount > 0;
    if (ledgerFilter === 'EXPENSE') return t.type === 'expense';
    if (ledgerFilter === 'PURCHASE') return t.type === 'purchase';
    return true;
  });

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
        <div className="fixed top-4 left-4 z-40 w-72 max-w-[calc(100vw-32px)] bg-[#FFFFFF] border-2 border-[#D5D4CD] p-5 rounded shadow-2xl pointer-events-auto flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
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
          <div className="flex flex-col gap-2.5 text-xs font-medium bg-[#F4F1E8] p-3.5 rounded border border-[#D5D4CD]">
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Sector</span>
              <span className="font-semibold text-[#252923] text-right text-[11px] truncate max-w-[140px]">{gameState.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Spendable Cash</span>
              <span className="font-bold text-[#315B43] text-sm">₦{gameState.cash.toLocaleString()}</span>
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
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Total Net Profit</span>
              <span className="font-semibold text-[#252923]">₦{totalNetProfit.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#252923]/70 uppercase text-[10px] font-bold tracking-wider">Businesses Owned</span>
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
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-4 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowDirectory(true);
                setIsMenuOpen(false);
              }}
            >
              <span>BUSINESS DIRECTORY (17)</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-4 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
              onClick={() => {
                setShowReports(true);
                setIsMenuOpen(false);
              }}
            >
              <span>FINANCIAL REPORTS</span>
              <span className="text-[#B58A45] font-bold">→</span>
            </button>
            <button
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2.5 px-4 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm text-xs flex items-center justify-between"
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
      <div className="absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
        {/* Top HUD Bar */}
        <div className="flex justify-between items-start gap-2">
          {/* Top Left Menu Trigger & Economy Badges */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              className="w-12 h-12 bg-[#FFFFFF] hover:bg-[#F4F1E8] border-2 border-[#D5D4CD] rounded shadow-sm flex items-center justify-center text-[#252923] transition-colors focus:outline-none focus:ring-2 focus:ring-[#315B43]"
              onClick={() => setIsMenuOpen(true)}
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>

            {/* Financial Overview Chip */}
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] px-3.5 py-2 rounded shadow-sm text-xs font-bold flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#252923]/60 uppercase tracking-wider text-[10px]">Cash</span>
                <span className="text-[#315B43] font-bold text-sm">₦{gameState.cash.toLocaleString()}</span>
              </div>
              <div className="h-4 w-px bg-[#D5D4CD]" />
              <div className="flex items-center gap-1.5">
                <span className="text-[#252923]/60 uppercase tracking-wider text-[10px]">Net Payout</span>
                <span className={`font-bold ${netProfitPerMinute >= 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                  {netProfitPerMinute >= 0 ? '+' : ''}₦{netProfitPerMinute.toLocaleString()}/min
                </span>
                <span className="text-[10px] text-[#252923]/50">
                  (₦{Math.floor(netProfitPerMinute / 4).toLocaleString()} / 15s)
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Waypoint Indicator & Controls */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            {gameState.targetWaypoint && (
              <div className="bg-[#FFFFFF] border-2 border-[#B58A45] px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B58A45] animate-ping" />
                <span className="text-[#252923]">Waypoint: {gameState.targetWaypoint.name}</span>
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

            <div className="hidden sm:block bg-[#FFFFFF] border-2 border-[#D5D4CD] p-2.5 rounded text-xs font-semibold text-[#252923] shadow-sm text-right max-w-[240px]">
              Move: WASD / Arrow Keys<br />Press E near a business to inspect
            </div>
          </div>
        </div>

        {/* Interaction Prompt (Contextual) */}
        {!gameState.panelOpen && gameState.activeInteraction && activeBusiness && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-[#FFFFFF] border-2 border-[#252923] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 pointer-events-auto">
            <div className="bg-[#315B43] text-[#FFFFFF] rounded w-8 h-8 flex items-center justify-center font-bold border-2 border-[#252923]">
              E
            </div>
            <span className="font-bold text-[#252923] text-sm">Press E to inspect {activeBusiness.name}</span>
          </div>
        )}

        {/* Global Notifications */}
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

        {/* FINANCIAL REPORTS MODAL (PART 5) */}
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
                    <span className="text-[9px] text-[#252923]/50">Before operating costs</span>
                  </div>

                  <div className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#252923]/60">Total Operating Expenses</span>
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
                      No enterprises owned yet. Open the{' '}
                      <button
                        className="text-[#315B43] font-bold underline"
                        onClick={() => {
                          setShowReports(false);
                          setShowDirectory(true);
                        }}
                      >
                        Business Directory
                      </button>{' '}
                      to acquire your first property in the city.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ownedBusinessesList.map((b) => {
                        const isSuspended = gameState.suspendedBusinesses?.includes(b.id);
                        const netMin = b.incomePerMinute - b.operatingCostPerMinute;
                        const tickNet = Math.floor(netMin / 4);
                        return (
                          <div
                            key={b.id}
                            className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#252923] text-sm flex items-center gap-2">
                                <span>{b.name}</span>
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
                              <span className="text-[10px] text-[#252923]/60">{b.type}</span>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <span className="text-[10px] text-[#252923]/60 block">Gross / Op. Cost</span>
                                <span className="font-semibold text-[#252923]">
                                  ₦{b.incomePerMinute.toLocaleString()} / -₦{b.operatingCostPerMinute.toLocaleString()}
                                </span>
                              </div>
                              <div className="border-l border-[#D5D4CD] pl-3">
                                <span className="text-[10px] text-[#252923]/60 block">Net Profit / 15s</span>
                                <span className="font-bold text-[#315B43]">
                                  +₦{netMin.toLocaleString()}/min (+₦{tickNet.toLocaleString()}/15s)
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

        {/* UPGRADED BUSINESS DIRECTORY (PART 3) */}
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
                    const isSuspended = gameState.suspendedBusinesses?.includes(b.id);
                    const netMin = b.incomePerMinute - b.operatingCostPerMinute;

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
                              {owned ? (isSuspended ? 'OWNED (SUSPENDED)' : 'OWNED') : 'FOR SALE'}
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
                              Gross: ₦{b.incomePerMinute.toLocaleString()}/min | Costs: ₦{b.operatingCostPerMinute.toLocaleString()}/min
                            </div>
                            <div className="text-xs font-bold text-[#315B43]">
                              Net: +₦{netMin.toLocaleString()}/min (+₦{Math.floor(netMin / 4).toLocaleString()} / 15s)
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

        {/* FINANCIAL LEDGER OVERLAY */}
        {showLedger && !gameState.panelOpen && !showDirectory && !showReports && (
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
              <div className="flex items-center gap-1 mb-3">
                {(['ALL', 'REVENUE', 'EXPENSE', 'PURCHASE'] as const).map((filter) => (
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

        {/* PAUSE OVERLAY */}
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

        {/* BUSINESS DETAILS & INSPECT PANEL (PART 1 & 4) */}
        {gameState.panelOpen && currentPanelBusiness && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto p-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-xl w-full max-w-md pointer-events-auto flex flex-col gap-4">
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
                      : 'OWNED'
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
                        ₦{currentPanelBusiness.incomePerMinute.toLocaleString()} / min
                      </span>
                      <span className="text-[10px] text-[#252923]/60 block">
                        ₦{Math.floor(currentPanelBusiness.incomePerMinute / 4).toLocaleString()} every 15s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Operating Costs</span>
                    <div className="text-right">
                      <span className="font-bold text-[#b91c1c]">
                        ₦{currentPanelBusiness.operatingCostPerMinute.toLocaleString()} / min
                      </span>
                      <span className="text-[10px] text-[#252923]/60 block">
                        ₦{Math.floor(currentPanelBusiness.operatingCostPerMinute / 4).toLocaleString()} every 15s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#D5D4CD]">
                    <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Net Profit</span>
                    <div className="text-right">
                      <span className="font-bold text-[#315B43]">
                        +₦{(currentPanelBusiness.incomePerMinute - currentPanelBusiness.operatingCostPerMinute).toLocaleString()} / min
                      </span>
                      <span className="text-[10px] text-[#252923]/60 block">
                        +₦{Math.floor((currentPanelBusiness.incomePerMinute - currentPanelBusiness.operatingCostPerMinute) / 4).toLocaleString()} every 15s
                      </span>
                    </div>
                  </div>

                  {!isPanelBusinessOwned ? (
                    <div className="flex items-center justify-between pt-1 border-t border-[#D5D4CD]">
                      <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Purchase Price</span>
                      <span className="text-lg font-bold text-[#252923]">
                        ₦{currentPanelBusiness.price.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 pt-1 border-t border-[#D5D4CD]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#252923]/80 font-bold uppercase text-[10px]">Status</span>
                        {isPanelBusinessSuspended ? (
                          <span className="font-bold text-[#b45309] text-[11px] flex items-center gap-1.5">
                            <span className="block w-2 h-2 rounded-full bg-[#b45309]" />
                            Suspended (Costs Unpaid)
                          </span>
                        ) : (
                          <span className="font-bold text-[#315B43] text-[11px] flex items-center gap-1.5">
                            <span className="block w-2 h-2 rounded-full bg-[#315B43] animate-pulse" />
                            Operating & Profitable
                          </span>
                        )}
                      </div>
                      {isPanelBusinessSuspended && (
                        <p className="text-[10px] text-[#b45309] font-medium mt-1">
                          Operations are paused to protect against negative cash. Will resume automatically once cash covers operating expenses.
                        </p>
                      )}
                    </div>
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
