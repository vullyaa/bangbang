const IDEOLOGIES = [
  "Revolutionary",
  "Progressive",
  "Liberal",
  "Moderate",
  "Conservative",
  "Nationalist",
  "Authoritarian",
];

const IDEOLOGY_AXIS = {
  Revolutionary: -2.2,
  Progressive: -1.5,
  Liberal: -0.8,
  Moderate: 0,
  Conservative: 0.8,
  Nationalist: 1.5,
  Authoritarian: 2.3,
};

const STATES = [
  ["Alabama", "South", 9], ["Alaska", "West", 3], ["Arizona", "West", 11], ["Arkansas", "South", 6], ["California", "Pacific", 54],
  ["Colorado", "West", 10], ["Connecticut", "Northeast", 7], ["Delaware", "South", 3], ["Florida", "South", 30], ["Georgia", "South", 16],
  ["Hawaii", "Pacific", 4], ["Idaho", "West", 4], ["Illinois", "Midwest", 19], ["Indiana", "Midwest", 11], ["Iowa", "Midwest", 6],
  ["Kansas", "Midwest", 6], ["Kentucky", "South", 8], ["Louisiana", "South", 8], ["Maine", "Northeast", 4], ["Maryland", "South", 10],
  ["Massachusetts", "Northeast", 11], ["Michigan", "Midwest", 15], ["Minnesota", "Midwest", 10], ["Mississippi", "South", 6], ["Missouri", "Midwest", 10],
  ["Montana", "West", 4], ["Nebraska", "Midwest", 5], ["Nevada", "West", 6], ["New Hampshire", "Northeast", 4], ["New Jersey", "Northeast", 14],
  ["New Mexico", "West", 5], ["New York", "Northeast", 28], ["North Carolina", "South", 16], ["North Dakota", "Midwest", 3], ["Ohio", "Midwest", 17],
  ["Oklahoma", "South", 7], ["Oregon", "Pacific", 8], ["Pennsylvania", "Northeast", 19], ["Rhode Island", "Northeast", 4], ["South Carolina", "South", 9],
  ["South Dakota", "Midwest", 3], ["Tennessee", "South", 11], ["Texas", "South", 40], ["Utah", "West", 6], ["Vermont", "Northeast", 3],
  ["Virginia", "South", 13], ["Washington", "Pacific", 12], ["West Virginia", "South", 4], ["Wisconsin", "Midwest", 10], ["Wyoming", "West", 3],
];

const REAL_EARLY = {
  1796: ["John Adams", "Thomas Jefferson", "Thomas Pinckney"],
  1800: ["Thomas Jefferson", "John Adams", "Aaron Burr"],
  1804: ["Thomas Jefferson", "Charles C. Pinckney", "George Clinton"],
  1808: ["James Madison", "Charles C. Pinckney", "George Clinton"],
  1812: ["James Madison", "DeWitt Clinton", "Elbridge Gerry"],
  1816: ["James Monroe", "Rufus King", "Daniel Tompkins"],
  1820: ["James Monroe", "John Quincy Adams", "Daniel Tompkins"],
  1824: ["John Quincy Adams", "Andrew Jackson", "Henry Clay"],
};

const PARTY_COLORS = {
  Federalist: "#60a5fa",
  "Jeffersonian Republican": "#f59e0b",
  Democratic: "#2563eb",
  Republican: "#dc2626",
  Whig: "#a855f7",
  Socialist: "#ef4444",
  Communist: "#b91c1c",
  Libertarian: "#facc15",
  Green: "#22c55e",
  Patriot: "#7c3aed",
  "National Union": "#0ea5e9",
  Reform: "#14b8a6",
  Constitution: "#f97316",
  "People's Labor": "#fb7185",
  Vanguard: "#991b1b",
};

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 1776;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function makeInitialParties() {
  return [
    { name: "Federalist", ideology: "Conservative", strength: 30, established: true, region: { Northeast: 1.25, South: 0.85, Midwest: 1, West: 1, Pacific: 1 } },
    { name: "Jeffersonian Republican", ideology: "Liberal", strength: 33, established: true, region: { Northeast: 0.85, South: 1.3, Midwest: 1, West: 1, Pacific: 1 } },
  ];
}

function generateTimeline(seedText) {
  const seed = seedText ? hashSeed(seedText) : Math.floor(Math.random() * 1e9);
  const rng = mulberry32(seed);

  const history = [];
  const yearlyEvents = [];
  const partySnapshots = [];
  const story = [];

  const surnames = ["Adams", "Jefferson", "Hamilton", "Madison", "Monroe", "Jackson", "Lincoln", "Grant", "Roosevelt", "Kennedy", "Bush", "Clinton", "Reagan", "Hayes", "Marshall", "Wright", "Hale", "Mercer", "Stone", "Park", "Santiago", "Shaw", "Everett", "Avery"];
  const firstNames = ["John", "Thomas", "Sarah", "Mary", "James", "Alex", "Eleanor", "Charles", "Ruth", "William", "Eliza", "Gabriel", "Nora", "Isaac", "Hannah", "Victor", "Amelia", "Liam", "Marcus", "Zoe"];

  let parties = makeInitialParties();
  let ideologySupport = { Revolutionary: 8, Progressive: 10, Liberal: 17, Moderate: 24, Conservative: 20, Nationalist: 14, Authoritarian: 7 };

  let incumbent = { president: "George Washington's Legacy", party: "None", approval: 79, termStart: 1789, termsServed: 2, vp: "John Adams", dictator: false };
  let economy = 62;
  let debt = 24;
  let polarization = 28;
  let badEconomyStreak = 0;

  function genName(preferRealYear) {
    if (REAL_EARLY[preferRealYear]) return REAL_EARLY[preferRealYear][Math.floor(rng() * REAL_EARLY[preferRealYear].length)];
    return `${pick(rng, firstNames)} ${pick(rng, surnames)}`;
  }

  function crisisRoll(year) {
    const crises = [];
    const baseChance = clamp(0.2 + (polarization / 210) + (debt / 250), 0.2, 0.75);
    if (rng() < baseChance) {
      crises.push(pick(rng, ["Recession", "War", "Invasion", "Revolutionary Unrest", "Financial Panic", "Scandal Cascade", "Pandemic", "Nuclear Scare"]));
    }
    if ([1812, 1860, 1929, 1941, 1968, 2001, 2008].includes(year) && rng() < 0.8) {
      crises.push(pick(rng, ["Historical Flashpoint", "Constitutional Crisis", "Global Market Collapse", "Civil Violence"]));
    }
    if (badEconomyStreak >= 3 && rng() < 0.45) crises.push("General Strike Wave");
    return [...new Set(crises)];
  }

  function applyCrises(year, crises, approval) {
    let narrative = [];
    let shift = 0;
    for (const c of crises) {
      if (c.includes("War") || c.includes("Invasion")) {
        shift += 6 - Math.floor(rng() * 10);
        economy -= 6;
        polarization += 6;
        narrative.push(`⚔️ ${c}: early rally effect fades into fatigue, forcing ${incumbent.president} to expand conscription and emergency borrowing.`);
      } else if (c.includes("Recession") || c.includes("Panic") || c.includes("Collapse")) {
        shift -= 8 + Math.floor(rng() * 8);
        economy -= 10;
        badEconomyStreak++;
        narrative.push(`💸 ${c}: unemployment spikes, farm prices collapse, and anti-establishment parties gain oxygen.`);
      } else if (c.includes("Revolution")) {
        shift -= 12;
        polarization += 10;
        narrative.push(`🔥 ${c}: armed factions challenge federal control. Governors request federal troops, while radicals recruit openly.`);
      } else if (c.includes("Scandal")) {
        shift -= 10;
        narrative.push(`🎃 ${c}: leaked cabinet bribery memos spark impeachment talk and mass protests.`);
      } else {
        shift -= 4;
        narrative.push(`⚠️ ${c}: institutional strain reduces public trust and deepens ideological sorting.`);
      }
    }
    approval = clamp(approval + shift, 6, 90);
    return { approval, narrative };
  }

  function createPartyIfNeeded(year) {
    if (rng() < 0.18) {
      const options = [
        ["Whig", "Moderate"], ["Democratic", "Liberal"], ["Republican", "Conservative"], ["Socialist", "Progressive"], ["Communist", "Revolutionary"],
        ["Libertarian", "Conservative"], ["Green", "Progressive"], ["Patriot", "Nationalist"], ["Reform", "Moderate"], ["Constitution", "Authoritarian"],
        ["People's Labor", "Progressive"], ["Vanguard", "Authoritarian"], ["National Union", "Moderate"],
      ];
      const [name, ideology] = pick(rng, options);
      if (!parties.find((p) => p.name === name)) {
        parties.push({ name, ideology, strength: 7 + Math.floor(rng() * 12), established: false, region: { Northeast: 1 + (rng() - 0.5), South: 1 + (rng() - 0.5), Midwest: 1 + (rng() - 0.5), West: 1 + (rng() - 0.5), Pacific: 1 + (rng() - 0.5) } });
        story.push(`🔀 ${year}: ${name} party founded from ${ideology} organizing networks.`);
      }
    }
  }

  function maybeSplitMerge(year) {
    if (parties.length < 3 || rng() > 0.16) return;
    const donor = pick(rng, parties.filter((p) => p.strength > 8));
    if (!donor) return;
    if (rng() < 0.55) {
      donor.strength -= 4;
      const newParty = { name: `${donor.name} Reform Bloc`, ideology: pick(rng, IDEOLOGIES), strength: 6 + Math.floor(rng() * 8), established: false, region: { Northeast: 1, South: 1, Midwest: 1, West: 1, Pacific: 1 } };
      parties.push(newParty);
      story.push(`🔄 ${year}: ${donor.name} splits, forming ${newParty.name}.`);
    } else {
      const partner = pick(rng, parties.filter((p) => p !== donor));
      donor.strength += Math.floor(partner.strength * 0.35);
      story.push(`🤝 ${year}: ${donor.name} absorbs part of ${partner.name}, creating a hybrid coalition.`);
      partner.strength *= 0.55;
    }
  }

  function adjustIdeologies(incApproval) {
    const spillover = (incApproval - 50) / 20;
    ideologySupport.Moderate += spillover;
    ideologySupport.Liberal += spillover * 0.35;
    ideologySupport.Conservative += spillover * 0.35;

    if (economy < 40) {
      ideologySupport.Progressive += 1.8;
      ideologySupport.Revolutionary += 1.4;
      ideologySupport.Moderate -= 1.2;
    }
    if (polarization > 65) {
      ideologySupport.Nationalist += 1.5;
      ideologySupport.Authoritarian += 1.1;
      ideologySupport.Liberal -= 0.5;
    }

    for (const i of IDEOLOGIES) ideologySupport[i] = clamp(ideologySupport[i] + (rng() - 0.5), 3, 34);
    const total = IDEOLOGIES.reduce((s, i) => s + ideologySupport[i], 0);
    for (const i of IDEOLOGIES) ideologySupport[i] = (ideologySupport[i] / total) * 100;
  }

  function candidateFromParty(year, party) {
    const president = genName(year <= 1824 ? year : null);
    const vp = `${pick(rng, firstNames)} ${pick(rng, surnames)}`;
    const age = 43 + Math.floor(rng() * 39);
    const dynasty = surnames.filter((s) => history.some((h) => h.winner.name.includes(s))).includes(president.split(" ").at(-1));
    const campaign = -6 + Math.floor(rng() * 13);
    return { name: president, vp, party: party.name, ideology: party.ideology, age, dynasty, campaign };
  }

  function simulateElection(year) {
    createPartyIfNeeded(year);
    maybeSplitMerge(year);
    parties.forEach((p) => {
      const ide = ideologySupport[p.ideology] || 10;
      const stabilityBonus = p.established ? 4 : -2;
      p.strength = clamp(p.strength * 0.84 + ide * 0.26 + stabilityBonus + (rng() - 0.5) * 4, 2, 45);
      if (p.name === incumbent.party) p.strength += (incumbent.approval - 50) / 10;
    });

    parties = parties.filter((p) => p.established || p.strength > 4.7 || ["Democratic", "Republican", "Federalist", "Jeffersonian Republican", "Whig"].includes(p.name));

    const sorted = [...parties].sort((a, b) => b.strength - a.strength);
    const candidates = sorted.slice(0, 4).map((p) => candidateFromParty(year, p));
    const dayOneApproval = clamp((incumbent.approval || 52) - 2 + Math.floor(rng() * 5), 12, 87);

    const crises = crisisRoll(year);
    const crisisResult = applyCrises(year, crises, dayOneApproval);
    let approvalElectionDay = clamp(crisisResult.approval - 2 - Math.floor(rng() * 7), 4, 86); // negative bias

    if (incumbent.dictator && rng() < 0.28) {
      approvalElectionDay -= 12;
      crises.push("Dictatorship Collapse");
      story.push(`🕊️ ${year}: authoritarian system collapses, constitutional rule restored with amnesty and reforms.`);
      economy += 12;
      polarization -= 14;
    }

    const nationalMood = (approvalElectionDay - 50) / 12 + (economy - 50) / 18 - badEconomyStreak * 0.65;
    const turnout = clamp(49 + Math.floor(rng() * 22) + crises.length * 2 + Math.floor(polarization / 18), 42, 82);

    if (economy < 35 && ["Socialist", "Communist"].some((p) => parties.some((q) => q.name === p && q.strength >= 25)) && rng() < 0.4) {
      crises.push("Left Insurrection Attempt");
      const success = rng() < 0.36;
      story.push(success ? `💣 ${year}: socialist/communist uprising topples several state governments before federal settlement creates the Cooperative Commonwealth territories.` : `⚖️ ${year}: socialist-led revolt fails after military defections reverse early gains.`);
      if (success) {
        economy -= 8;
        polarization += 18;
        parties.push({ name: "Workers Commonwealth", ideology: "Revolutionary", strength: 18, established: false, region: { Northeast: 1.2, South: 0.8, Midwest: 1.4, West: 1, Pacific: 1.3 } });
      }
    }

    const popular = candidates.map((c, i) => {
      const partyObj = parties.find((p) => p.name === c.party);
      const incPenalty = i === 0 && c.party === incumbent.party ? -Math.max(0, 7 - crises.length) : 0;
      const spoiler = (c.party === "Green" || c.party === "Libertarian" || c.party === "Reform") ? 2.8 : 0;
      const val = partyObj.strength + c.campaign + spoiler + (i === 0 ? nationalMood * 3.6 : 0) + incPenalty + (rng() - 0.5) * 5;
      return Math.max(1, val);
    });
    const totalPopBase = popular.reduce((a, b) => a + b, 0);
    const popPct = popular.map((p) => (p / totalPopBase) * 100);

    let stateWins = {};
    let ec = {};
    candidates.forEach((c) => { stateWins[c.party] = 0; ec[c.party] = 0; });

    for (const [state, region, votes] of STATES) {
      const scores = candidates.map((c, i) => {
        const party = parties.find((p) => p.name === c.party);
        const regional = (party.region[region] || 1) * 2.4;
        const ideologyPull = (ideologySupport[c.ideology] || 10) / 16;
        const stateNoise = (rng() - 0.5) * 6;
        return popPct[i] + regional + ideologyPull + stateNoise;
      });
      const winIndex = scores.indexOf(Math.max(...scores));
      const winner = candidates[winIndex];
      stateWins[winner.party] += 1;
      ec[winner.party] += votes;
    }

    const ecWinnerParty = Object.entries(ec).sort((a, b) => b[1] - a[1])[0][0];
    const popWinnerParty = candidates[popPct.indexOf(Math.max(...popPct))].party;
    const contingent = Object.values(ec).every((v) => v < 270);
    let finalWinnerParty = ecWinnerParty;
    if (contingent) {
      finalWinnerParty = sorted[0]?.name || ecWinnerParty;
      story.push(`⚖️ ${year}: contingent election in the House decides the presidency.`);
    }

    if (Math.abs(Math.max(...popPct) - popPct.slice().sort((a,b)=>b-a)[1]) < 0.5 && rng() < 0.5) {
      story.push(`🗳️ ${year}: recount triggered under 0.5% margin, shifting one key state.`);
      finalWinnerParty = pick(rng, [finalWinnerParty, popWinnerParty]);
    }

    const winnerCandidate = candidates.find((c) => c.party === finalWinnerParty) || candidates[0];
    const winnerApprovalBoost = 5 + Math.floor(rng() * 7);

    let impeachment = false;
    if (approvalElectionDay < 22 && crises.some((c) => c.includes("Scandal")) && rng() < 0.08) {
      impeachment = true;
      story.push(`⚖️ ${year}: impeachment proceedings launched amid collapsing approval.`);
    }

    let assassination = false;
    if (rng() < 0.028) {
      assassination = true;
      story.push(`💀 ${year}: assassination crisis shocks the nation; vice-presidential succession reshapes the era.`);
    }

    const dictChance = clamp((polarization - 55) / 180 + (winnerCandidate.ideology === "Authoritarian" ? 0.09 : 0), 0, 0.21);
    const dictator = rng() < dictChance;

    const result = {
      year,
      incumbent: { ...incumbent, dayOneApproval, electionDayApproval: approvalElectionDay },
      crises,
      crisisNarrative: crisisResult.narrative,
      candidates,
      popularVotePct: popPct,
      ec,
      stateWins,
      turnout,
      contingent,
      popularWinner: popWinnerParty,
      winner: { ...winnerCandidate, party: finalWinnerParty, wonPopular: finalWinnerParty === popWinnerParty, wonEC: finalWinnerParty === ecWinnerParty, dictator },
      impeachment,
      assassination,
      economy: clamp(economy, 15, 95),
      polarization: clamp(polarization, 5, 95),
      congress: {
        house: rng() < 0.52 ? finalWinnerParty : pick(rng, candidates.map((c) => c.party)),
        senate: rng() < 0.5 ? finalWinnerParty : pick(rng, candidates.map((c) => c.party)),
      },
      summary: `${year}: ${winnerCandidate.name} (${finalWinnerParty}) wins with ${Math.max(...Object.values(ec))} EC votes in a turnout of ${turnout}%.`,
    };

    incumbent = {
      president: winnerCandidate.name,
      party: finalWinnerParty,
      approval: clamp(approvalElectionDay + winnerApprovalBoost, 20, 88),
      termStart: year + 1,
      termsServed: incumbent.president === winnerCandidate.name ? incumbent.termsServed + 1 : 1,
      vp: winnerCandidate.vp,
      dictator,
    };

    if (assassination && rng() < 0.6) {
      incumbent.president = incumbent.vp;
      incumbent.approval = clamp(incumbent.approval + 8, 20, 92);
      story.push(`🕯️ ${year}: VP ${incumbent.vp} sworn in with temporary unity surge.`);
    }

    debt = clamp(debt + Math.floor(rng() * 9) - 2 + crises.length * 2, 5, 99);
    economy = clamp(economy + Math.floor(rng() * 7) - 2 - crises.length * 3 + (incumbent.approval > 56 ? 2 : -1), 15, 95);
    if (economy > 45) badEconomyStreak = Math.max(0, badEconomyStreak - 1);
    polarization = clamp(polarization + Math.floor(rng() * 9) - 3 + (crises.length ? 2 : -1), 8, 98);

    adjustIdeologies(approvalElectionDay);

    history.push(result);
    partySnapshots.push({ year, parties: parties.map((p) => ({ ...p })) });

    for (let y = year; y < year + 4; y++) {
      yearlyEvents.push({
        year: y,
        text: `${y}: ${incumbent.president} administration | economy ${economy}/95 | polarization ${polarization}/100. ${pick(rng, ["Industrialization accelerates in coastal cities.", "Rural debt protests spread through interior states.", "Supreme Court appointments alter constitutional doctrine.", "Immigration and urbanization reshape coalition politics.", "Media technology shifts campaign style and candidate branding."])} ${crises.length ? `Legacy of ${crises.join(", ")} still shapes policy fights.` : "No major crisis year, but partisan organizing intensifies."}`,
      });
    }
  }

  for (let year = 1796; year <= 2100; year += 4) simulateElection(year);

  story.unshift("Timeline begins with Washington's immense shadow over institutions and elite trust.");
  story.push("By 2100, party systems, ideologies, and constitutional norms bear little resemblance to baseline history.");

  return { seed, history, yearlyEvents, partySnapshots, story, final: { economy, polarization, debt, parties, ideologySupport, incumbent } };
}

function pct(n) { return `${n.toFixed(1)}%`; }
function fmt(n) { return n.toLocaleString(); }

function render(sim) {
  const stats = document.getElementById("topStats");
  stats.innerHTML = "";
  const cards = [
    ["Seed", sim.seed],
    ["Elections", sim.history.length],
    ["Final Economy", sim.final.economy],
    ["Final Polarization", sim.final.polarization],
    ["Final Debt", sim.final.debt],
    ["Living Parties", sim.final.parties.length],
  ];
  cards.forEach(([k, v]) => {
    const el = document.createElement("div");
    el.className = "stat-card";
    el.innerHTML = `<div class="muted">${k}</div><strong>${v}</strong>`;
    stats.appendChild(el);
  });

  const elections = document.getElementById("elections");
  elections.innerHTML = `<div class="list-grid"></div>`;
  const list = elections.firstElementChild;
  sim.history.forEach((e) => {
    const popTotal = 100_000_000 + Math.floor(e.turnout * 1_900_000);
    const rows = e.candidates.map((c, i) => {
      const votes = Math.floor((e.popularVotePct[i] / 100) * popTotal);
      const partyColor = PARTY_COLORS[c.party] || "#93c5fd";
      return `<div style="margin:0.35rem 0; border-left:4px solid ${partyColor}; padding-left:0.5rem;">
        <div><strong>${c.name}</strong> (${c.party}) • ${c.ideology} • age ${c.age} ${c.dynasty ? "<span class='badge'>👑 Dynasty</span>" : ""}</div>
        <div class='muted'>VP: ${c.vp} | Campaign modifier: ${c.campaign >=0 ? "+" : ""}${c.campaign}</div>
        <div>${pct(e.popularVotePct[i])} — ${fmt(votes)} votes</div>
        <div class='vote-bar'><div class='vote-fill' style='width:${e.popularVotePct[i]}%'></div></div>
      </div>`;
    }).join("");

    const ecRows = Object.entries(e.ec).sort((a,b)=>b[1]-a[1]).map(([p,v]) => `<span class='badge'>${p}: ${v} EC</span>`).join(" ");
    const crisisBg = e.crises.length ? "linear-gradient(120deg, rgba(239,68,68,.22), rgba(251,146,60,.17))" : "rgba(255,255,255,.05)";
    const c = document.createElement("article");
    c.className = "panel-card";
    c.style.background = crisisBg;
    c.innerHTML = `
      <h3>${e.year} Election ${e.winner.dictator ? "<span class='badge dictator'>⚡ Dictatorship Risk</span>" : ""}</h3>
      <p class='muted'>Incumbent: ${e.incumbent.president} (${e.incumbent.party}) | Day one approval ${e.incumbent.dayOneApproval}% → Election day ${e.incumbent.electionDayApproval}%.</p>
      <p>${e.crises.length ? e.crises.join(" • ") : "No major systemic crisis"}</p>
      <p>${e.crisisNarrative.join(" ")}</p>
      <div>${rows}</div>
      <p><strong>Outcome:</strong> ${e.winner.name} (${e.winner.party}) wins. Popular vote winner: ${e.popularWinner}. ${e.winner.wonPopular ? "No inversion." : "Electoral inversion occurred."} ${e.contingent ? "House contingent election triggered." : ""}</p>
      <p>${ecRows}</p>
      <p class='muted'>Congress: House ${e.congress.house}, Senate ${e.congress.senate}. Turnout ${e.turnout}%.</p>
      <p class='muted'>Regional mini-map proxy: ${Object.entries(e.stateWins).map(([p, s]) => `${p} won ${s} states`).join(" | ")}</p>
      <p class='muted'>Impeachment: ${e.impeachment ? "initiated" : "none"}. Assassination crisis: ${e.assassination ? "yes" : "no"}.</p>
    `;
    list.appendChild(c);
  });

  const events = document.getElementById("events");
  events.innerHTML = `<div class='list-grid'></div>`;
  const evList = events.firstElementChild;
  sim.yearlyEvents.forEach((ev) => {
    const card = document.createElement("article");
    card.className = "panel-card";
    card.innerHTML = `<h3>${ev.year}</h3><p>${ev.text}</p>`;
    evList.appendChild(card);
  });

  const parties = document.getElementById("parties");
  parties.innerHTML = `<div class='list-grid'></div>`;
  const pList = parties.firstElementChild;
  sim.partySnapshots.filter((_, i) => i % 4 === 0 || i === sim.partySnapshots.length - 1).forEach((snap) => {
    const card = document.createElement("article");
    card.className = "panel-card";
    const lines = snap.parties
      .sort((a, b) => b.strength - a.strength)
      .map((p) => `<div><span class='badge' style='background:${(PARTY_COLORS[p.name] || "#334155")}66'>${p.name}</span> ${p.ideology} • strength ${p.strength.toFixed(1)}</div>`)
      .join("");
    card.innerHTML = `<h3>Party field in ${snap.year}</h3>${lines}`;
    pList.appendChild(card);
  });

  const story = document.getElementById("story");
  story.innerHTML = `<div class='panel-card'><h3>Complete Timeline Story</h3><p>${sim.story.join(" ")}</p><p>${sim.history.map((e)=>e.summary).join(" ")}</p></div>`;
}

function boot(seedText = "") {
  const sim = generateTimeline(seedText);
  render(sim);
  document.getElementById("seedInput").value = sim.seed;
}

document.getElementById("runBtn").addEventListener("click", () => {
  boot(document.getElementById("seedInput").value.trim());
});

document.getElementById("rerollBtn").addEventListener("click", () => {
  boot(String(document.getElementById("seedInput").value.trim() || Math.floor(Math.random() * 1e9)));
});

document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    document.getElementById(t.dataset.tab).classList.add("active");
  });
});

boot();
