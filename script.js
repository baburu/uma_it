const LANE_COLORS = {
  Speed:   'var(--lane-speed)',
  Stamina: 'var(--lane-stamina)',
  Power:   'var(--lane-power)',
  Guts:    'var(--lane-guts)',
  Wit:     'var(--lane-wit)',
  Friend:  'var(--lane-friend)',
  Group:   'var(--lane-group)'
};

let CARDS = [];
let deck = []; // Stores selected cards (max 6)
let sortKey = 'score';
let sortDir = -1; // -1 desc, 1 asc
let activeType = '';
let searchQuery = '';

let tierTypeFilterVal = '';
let tierSearchVal = '';

const tbody = document.getElementById('tbody');
const typeFilter = document.getElementById('typeFilter');
const searchInput = document.getElementById('searchInput');

// Preloads all images into browser memory cache
function preloadImages(cards) {
  const urls = [...new Set(cards.map(c => c.img))];
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

async function init() {
  try {
    const res = await fetch('cards.json');
    CARDS = await res.json();

    // Assign unique IDs to cards
    CARDS.forEach((c, i) => c.id = i);

    // Preload all card images into browser cache
    preloadImages(CARDS);

    // Set meta data
    document.getElementById('metaCount').textContent = CARDS.length;
    document.getElementById('metaTop').textContent = Math.max(...CARDS.map(c => c.score)).toFixed(2);

    // Populate type filter dropdowns
    const types = [...new Set(CARDS.map(c => c.type))].sort();
    types.forEach(t => {
      const opt1 = document.createElement('option');
      opt1.value = t; opt1.textContent = t;
      typeFilter.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = t; opt2.textContent = t;
      document.getElementById('tierTypeFilter').appendChild(opt2);
    });

    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // Filters for Tab 1
    typeFilter.addEventListener('change', () => {
      activeType = typeFilter.value;
      renderTable();
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase().trim();
        renderTable();
      });
    }

    // Filters for Tab 2 (Tier List)
    document.getElementById('tierTypeFilter').addEventListener('change', (e) => {
      tierTypeFilterVal = e.target.value;
      renderTierList();
    });

    document.getElementById('tierSearch').addEventListener('input', (e) => {
      tierSearchVal = e.target.value.toLowerCase().trim();
      renderTierList();
    });

    // Clear Deck Button
    document.getElementById('btnClearDeck').addEventListener('click', () => {
      deck = [];
      updateDeckUI();
      syncTierListDeckState();
    });

    // Table Header Sorting
    document.querySelectorAll('thead th').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (key === 'rank') return;
        if (sortKey === key) {
          sortDir *= -1;
        } else {
          sortKey = key;
          sortDir = (key === 'name' || key === 'lb' || key === 'type') ? 1 : -1;
        }
        renderTable();
      });
    });

    renderTable();
    updateDeckUI();
    renderTierList();
  } catch (err) {
    console.error('Failed to load cards.json:', err);
  }
}

/* ========================================= */
/* TAB 1: RANKING TABLE RENDER               */
/* ========================================= */
function renderTable() {
  let rows = CARDS.filter(c => {
    const matchesType = !activeType || c.type === activeType;
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery);
    return matchesType && matchesSearch;
  });

  rows.sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') {
      return av.localeCompare(bv) * sortDir;
    }
    return (av - bv) * sortDir;
  });

  // Update header arrows
  document.querySelectorAll('thead th').forEach(th => {
    const key = th.dataset.key;
    const isSortKey = (key === sortKey);
    th.classList.toggle('active', isSortKey);

    const arrowSpan = th.querySelector('.arrow');
    if (arrowSpan) {
      arrowSpan.textContent = isSortKey ? (sortDir === 1 ? '▲' : '▼') : '';
    }
  });

  tbody.innerHTML = '';
  rows.forEach((c, i) => {
    const tr = document.createElement('tr');
    const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const laneColor = LANE_COLORS[c.type] || 'var(--gold)';
    tr.innerHTML = `
      <td class="rank ${rankClass}">${i + 1}</td>
      <td class="name-cell" style="--lane-color:${laneColor}">
        <div class="card-info">
          <img src="${c.img}" alt="" class="card-thumb">
          <span>${c.name}</span>
        </div>
      </td>
      <td class="lb-tag">${c.lb}</td>
      <td><span class="type-tag" style="--lane-color:${laneColor}">${c.type}</span></td>
      <td class="num score-cell">${c.score.toFixed(2)}</td>
      <td class="num">${fmt(c.speed)}</td>
      <td class="num">${fmt(c.stamina)}</td>
      <td class="num">${fmt(c.power)}</td>
      <td class="num">${fmt(c.guts)}</td>
      <td class="num">${fmt(c.wit)}</td>
      <td class="num">${fmt(c.total)}</td>
      <td class="num">${fmt(c.sp)}</td>
      <td class="num">${fmt(c.rb)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========================================= */
/* TAB 2: DECK BUILDER & TIER LIST LOGIC     */
/* ========================================= */

function addToDeck(card) {
  if (deck.length >= 6) return; // Max 6 cards
  if (deck.some(d => d.id === card.id)) return; // Already in deck
  deck.push(card);
  updateDeckUI();
  syncTierListDeckState(); // Instant state update without re-rendering images
}

function removeFromDeckIndex(index) {
  deck.splice(index, 1);
  updateDeckUI();
  syncTierListDeckState();
}

function removeFromDeckById(id) {
  deck = deck.filter(d => d.id !== id);
  updateDeckUI();
  syncTierListDeckState();
}

// Surgical DOM update for tier list when deck changes (NEVER destroys image tags)
function syncTierListDeckState() {
  document.querySelectorAll('.tier-card').forEach(cardEl => {
    const cardId = parseInt(cardEl.dataset.id, 10);
    const inDeck = deck.some(d => d.id === cardId);
    
    cardEl.classList.toggle('in-deck', inDeck);
    
    let overlay = cardEl.querySelector('.in-deck-overlay');
    if (inDeck) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'in-deck-overlay';
        overlay.textContent = '✓ DECK';
        cardEl.querySelector('.card-thumb-wrapper').appendChild(overlay);
      }
    } else {
      if (overlay) {
        overlay.remove();
      }
    }
  });
}

function updateDeckUI() {
  const slotsEl = document.getElementById('deckSlots');
  const countEl = document.getElementById('deckCount');
  if (!slotsEl) return;

  countEl.textContent = `${deck.length} / 6 Cards`;
  slotsEl.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const slot = document.createElement('div');
    if (i < deck.length) {
      const c = deck[i];
      const laneColor = LANE_COLORS[c.type] || 'var(--gold)';
      slot.className = 'deck-slot filled';
      slot.style.setProperty('--lane-color', laneColor);
      slot.innerHTML = `
        <img src="${c.img}" alt="" class="slot-img">
        <div class="slot-info">
          <span class="slot-name">${c.name}</span>
          <div class="slot-tags">
            <span class="slot-type" style="color:${laneColor}">${c.type}</span>
            <span class="slot-lb">${c.lb}</span>
          </div>
        </div>
        <button class="btn-remove-slot" title="Remove Card">&times;</button>
      `;
      slot.querySelector('.btn-remove-slot').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromDeckIndex(i);
      });
    } else {
      slot.className = 'deck-slot empty';
      slot.innerHTML = `<span style="font-size:18px; margin-right:6px;">+</span> <span>Add Card</span>`;
    }
    slotsEl.appendChild(slot);
  }

  // Calculate sum of stats
  const totSpeed = deck.reduce((a, c) => a + (c.speed || 0), 0);
  const totStamina = deck.reduce((a, c) => a + (c.stamina || 0), 0);
  const totPower = deck.reduce((a, c) => a + (c.power || 0), 0);
  const totGuts = deck.reduce((a, c) => a + (c.guts || 0), 0);
  const totWit = deck.reduce((a, c) => a + (c.wit || 0), 0);
  const totTotal = deck.reduce((a, c) => a + (c.total || 0), 0);
  const totSP = deck.reduce((a, c) => a + (c.sp || 0), 0);
  const totRB = deck.reduce((a, c) => a + (c.rb || 0), 0);

  document.getElementById('totSpeed').textContent = Math.round(totSpeed);
  document.getElementById('totStamina').textContent = Math.round(totStamina);
  document.getElementById('totPower').textContent = Math.round(totPower);
  document.getElementById('totGuts').textContent = Math.round(totGuts);
  document.getElementById('totWit').textContent = Math.round(totWit);
  document.getElementById('totTotal').textContent = Math.round(totTotal);
  document.getElementById('totSP').textContent = Math.round(totSP);
  document.getElementById('totRB').textContent = Math.round(totRB) + '%';
}

function renderTierList() {
  const tierListEl = document.getElementById('tierList');
  if (!tierListEl) return;

  const filtered = CARDS.filter(c => {
    const matchesType = !tierTypeFilterVal || c.type === tierTypeFilterVal;
    const matchesSearch = !tierSearchVal || c.name.toLowerCase().includes(tierSearchVal);
    return matchesType && matchesSearch;
  });

  const tiers = [
    { name: 'S', color: '#ef4444', cards: filtered.filter(c => c.score >= 3.0) },
    { name: 'A', color: '#f97316', cards: filtered.filter(c => c.score >= 2.6 && c.score < 3.0) },
    { name: 'B', color: '#eab308', cards: filtered.filter(c => c.score >= 2.2 && c.score < 2.6) },
    { name: 'C', color: '#22c55e', cards: filtered.filter(c => c.score < 2.2) }
  ];

  tierListEl.innerHTML = '';

  tiers.forEach(t => {
    const row = document.createElement('div');
    row.className = 'tier-row';
    row.innerHTML = `
      <div class="tier-badge" style="background:${t.color}">
        <span>${t.name}</span>
      </div>
      <div class="tier-cards"></div>
    `;

    const cardsContainer = row.querySelector('.tier-cards');
    if (t.cards.length === 0) {
      cardsContainer.innerHTML = `<span class="empty-tier">No cards in this tier</span>`;
    } else {
      t.cards.forEach(c => {
        const inDeck = deck.some(d => d.id === c.id);
        const cardEl = document.createElement('div');
        cardEl.className = `tier-card ${inDeck ? 'in-deck' : ''}`;
        cardEl.dataset.id = c.id; // Store ID for fast DOM lookup
        cardEl.style.setProperty('--card-lane', LANE_COLORS[c.type] || 'var(--gold)');
        
        cardEl.innerHTML = `
          <div class="card-thumb-wrapper">
            <img src="${c.img}" alt="" class="tier-card-img">
            <span class="badge-score">${c.score.toFixed(2)}</span>
            <span class="badge-rb">${c.rb}RB</span>
            <span class="badge-type" style="color:${LANE_COLORS[c.type] || 'var(--gold)'}">${c.type}</span>
            ${inDeck ? '<div class="in-deck-overlay">✓ DECK</div>' : ''}
          </div>
          <div class="tier-card-info">
            <span class="tier-card-name">${c.name}</span>
            <span class="tier-card-lb">${c.lb}</span>
          </div>
        `;

        cardEl.addEventListener('click', () => {
          const isAlreadyInDeck = deck.some(d => d.id === c.id);
          if (isAlreadyInDeck) {
            removeFromDeckById(c.id);
          } else {
            addToDeck(c);
          }
        });

        cardsContainer.appendChild(cardEl);
      });
    }

    tierListEl.appendChild(row);
  });
}

function fmt(v) {
  if (v === null || v === undefined) return '—';
  return Number.isInteger(v) ? v : v.toFixed(0);
}

document.addEventListener('DOMContentLoaded', init);