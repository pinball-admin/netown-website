'use client'

import { useState } from 'react'
import Link from 'next/link'
import PredictionModal from '@/components/football/PredictionModal'
import CandyPoints from '@/components/football/CandyPoints'
import ComplianceNotice from '@/components/football/ComplianceNotice'
import FansShop from '@/components/football/FansShop'
import TeamsHub from '@/components/football/TeamsHub'
import TeamMatrix from '@/components/football/TeamMatrix'
import GlobalOracle from '@/components/football/GlobalOracle'
import LanguageSwitcher from '@/components/football/LanguageSwitcher'
import AmazonBanner from '@/components/football/AmazonBanner'
import GamersCorner from '@/components/football/GamersCorner'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import ConnectWalletButton from '@/components/football/ConnectWalletButton'
import HeroSection from '@/components/football/HeroSection'
import { useI18n } from '@/contexts/I18nContext'

// Match Data
const matchData = {
  'Group A': [
    { id: 1, team1: 'USA', team2: 'MAR', date: '2026-06-11', time: '20:00' },
    { id: 2, team1: 'CRO', team2: 'NGA', date: '2026-06-12', time: '18:00' },
    { id: 3, team1: 'USA', team2: 'CRO', date: '2026-06-16', time: '21:00' },
    { id: 4, team1: 'MAR', team2: 'NGA', date: '2026-06-16', time: '18:00' },
  ],
  'Group B': [
    { id: 5, team1: 'ARG', team2: 'KSA', date: '2026-06-12', time: '15:00' },
    { id: 6, team1: 'MEX', team2: 'POL', date: '2026-06-12', time: '20:00' },
    { id: 7, team1: 'ARG', team2: 'MEX', date: '2026-06-17', time: '21:00' },
    { id: 8, team1: 'KSA', team2: 'POL', date: '2026-06-17', time: '18:00' },
  ],
  'Group C': [
    { id: 9, team1: 'FRA', team2: 'AUS', date: '2026-06-13', time: '15:00' },
    { id: 10, team1: 'GER', team2: 'JPN', date: '2026-06-13', time: '20:00' },
    { id: 11, team1: 'FRA', team2: 'GER', date: '2026-06-18', time: '21:00' },
    { id: 12, team1: 'AUS', team2: 'JPN', date: '2026-06-18', time: '18:00' },
  ],
  'Knockouts': [
    { id: 13, team1: 'Group A Winner', team2: 'Group B Runner-up', date: '2026-06-22', time: '21:00', round: 'Round of 16' },
    { id: 14, team1: 'Group B Winner', team2: 'Group A Runner-up', date: '2026-06-23', time: '21:00', round: 'Round of 16' },
    { id: 15, team1: 'Group C Winner', team2: 'Group D Runner-up', date: '2026-06-24', time: '21:00', round: 'Round of 16' },
  ],
}

// Predictions Mock Data -  enriched with detailed expert analyses
const predictions: Record<string, Record<string, { winner: string; score: string; confidence: number; analysis: string; recentForm: string; keyInsight: string }>> = {
  'beckham_chen': {
    '1': { winner: 'USA', score: '2-1', confidence: 67, analysis: 'Bayesian model leverages P=0.72 for home advantage. Pulisic creativity vs Hakimi speed on the flanks - expect USA to exploit wide areas with precision crosses to Sargent. Morocco set-piece vulnerability (12% conceded from corners in qualifiers) could be decisive.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Home World Cup debut pressure affects Morocco more than expected' },
    '2': { winner: 'Croatia', score: '2-0', confidence: 71, analysis: 'Modric-Kovacic pivot dominates midfield 68% possession average. Nigeria 4-3-3 lacks defensive structure - Croatia methodical build-up will create 3+ clear chances. Brozovic screening allows fullbacks to push high.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Croatia has covered 18/20 Asianhandicap spots in last 5 major tournaments' },
    '3': { winner: 'USA', score: '1-0', confidence: 58, analysis: 'Must-win scenario for USA. Celtic Park atmosphere correlates with +15% home performance. McKennie return adds steel. Both teams 4-2-3-1 mirror matchup - transition speed decides.', recentForm: '🏆🏆🔥🔥🔥', keyInsight: 'Deadly Pulisic diagonal runs into left channel will unlock Croatia high line' },
    '4': { winner: 'Morocco', score: '2-1', confidence: 63, analysis: 'Morocco dark horse 2022 memories fuel belief. Hakimi vs Nigeria left defensive frailties. Amrabat withdrawn role disrupts Nigeria 4-3-3 pressing trigger. En-Nesyri poacher instinct prevails in tight affair.', recentForm: '🏆🏆🏆🏆🔥', keyInsight: 'Set-piece excellence: Morocco converts 3/4 corner situations vs Africa opponents' },
    '5': { winner: 'Argentina', score: '3-1', confidence: 79, analysis: 'Messi free-roaming causes Saudi 4-4-2 structural chaos. Di Maria worldie probability spikes to 23% when space exists. Saudi keeper issues in qualifiers (2.3 goals conceded per game vs top 50 nations) compound.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Scaloni 3-5-2 overwhelms Saudi wings - expect Julian Alvarez third-man runs' },
    '6': { winner: 'Mexico', score: '2-2', confidence: 48, analysis: 'Lewandowski legacy match vs Chicharito revival narrative. Mexico organizational discipline frustrates Poland tactical nous. James Rodriguez absence depletes Colombia creative core. Mineiro atmosphere elevates Mexico to gritty draw.', recentForm: '🔥🔥🏆🏆🏆', keyInsight: 'Mexico has never lost a World Cup group stage when leading at HT (87% WIN)' },
    '7': { winner: 'Argentina', score: '2-0', confidence: 74, analysis: 'Argentina tactical evolution: Scaloni abandoned 4-3-3 for 3-5-2 creating overloads. Mexico energy-drink pressing unsustainable vs Messi positional rotation. Guardiola-influenced build-up structure dismantles Mexico 5-3-2 low block.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Messi 8/10 performances correlate with narrow victories - expect late Lautaro dagger' },
    '8': { winner: 'Poland', score: '1-0', confidence: 52, analysis: 'Saudi recovery momentum vs Poland survival instinct. Zielinski playmaking elevation compensates for Lewandowski declining pace. Saudi wing creativity (Al-Burayk overlapping) tested against Poland 3-4-3 compactness.', recentForm: '🔥🏆🏆🏆🔥', keyInsight: 'Lewandowski final tournament motivation: 2022 penalty miss haunts - redemption arc begins' },
    '9': { winner: 'France', score: '3-0', confidence: 81, analysis: 'Mbappe electric pace vs Australia defensive coordination collapse. Dembele Hakimi-level speed exploitation on counter. Giroud target man role creates third-man scenarios. Australia 4-4-2 midfield 18-yard box vulnerability exposed.', recentForm: '🏆🏆🏆🏆🔥', keyInsight: 'Pogba replacement (Tchouameni) actually IMPROVES France defensive shape - +0.3 xGA reduction' },
    '10': { winner: 'Germany', score: '2-1', confidence: 69, analysis: 'Nagelsmann youth revolution fascinating tactical petri dish. Musiala gravity creation + Wirtz diagonal runs = chaos. Japan disciplined 4-2-3-1 triggers Germany 4-3-3 asymmetric pressing. Gundogan false-9 glimpses vs Japan high line.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Germany WC2022 trauma fuel: Flick OUT, Nagelsmann IN = psychological reset +12% performance' },
    '11': { winner: 'France', score: '2-1', confidence: 66, analysis: 'Euros final rematch psychological warfare. Foden Grealish Manchester connection vs real-politique Deschamps pragmatism. Germany psychological edge from Euros penalty heartache. Close battle: Kimmich regista role controlling tempo.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Mbappe plays RIGHT side for France (vs left for club) - asymmetric advantage vs Bayern trio' },
    '12': { winner: 'Japan', score: '2-0', confidence: 57, analysis: 'Japan tactical evolution under Moriyasu unprecedented preparation (7 training camps). Bundesliga factory pipeline: 8 Japan starters vs Germany leagues. Australia structural rigidity 4-4-2 predictability vs Japan 4-3-3 fluid interchange.', recentForm: '🔥🏆🏆🏆🔥', keyInsight: 'Real Sociedad Kubo + Leipzig Olmo = Spain-lite replication, defeating Australia systematically' },
  },
  'zidane_gao': {
    '1': { winner: 'Draw', score: '1-1', confidence: 52, analysis: 'Neural network assigns 42% draw probability (highest across all simulations). Morocco 2022 semi-final hangover lingers - subconscious fear of USA raw athleticism. Reunion atmosphere creates emotional lift but dissipates after 20 mins.', recentForm: '🔥🔥🏆🏆🏆', keyInsight: 'Bayesian prior from Morocco 2022: 78% of semis finalists underperform next tournament' },
    '2': { winner: 'Croatia', score: '2-1', confidence: 61, analysis: 'Midfield control matrix: Modric-Brozovic-Kovacic triangle dominates 73% duels won. Nigeria 4-3-3 pressing triggers Croatia long-ball strategy - directness success rate 67% vs Africa opponents historically.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Perisic assists correlate with Croatia tournament success: 0.8 per game when advancing past groups' },
    '3': { winner: 'USA', score: '2-0', confidence: 55, analysis: 'Group survival probability cascade: USA 67% > Croatia 52%. McKennie Brozovic duel key. Gvardiol vs Pulisic chess match determines trajectory. Neural network detects Croatia fatigue pattern in third matches (+0.4 goals conceded).', recentForm: '🏆🏆🔥🔥🔥', keyInsight: 'Pulisic Chelsea form resurrection: 3G/2A in last 5 matches = tournament Pulisic emerges' },
    '4': { winner: 'Nigeria', score: '1-0', confidence: 49, analysis: 'Sadiq penalty shootout specialist potential vs Morocco chaos theory. Amrabat absence creates Nigeria tactical window. Osimhen poacher excellence vs Hakimi experience - individual brilliance decides.', recentForm: '🔥🔥🔥🏆🏆', keyInsight: 'Nigeria FA political turmoil creates US vs THEM siege mentality: +18% defensive organization' },
    '5': { winner: 'Argentina', score: '2-0', confidence: 77, analysis: 'Conmebol mysticism meets Asian tactical naivety. Saudi 4-4-2 shape disintegrates vs Messi third-floor movement. Neural network detects Saudi goalkeeper regression: -0.3 saves probability vs initial simulations.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Messi World Cup FINAL form timeline: peaking NOW for last dance glory' },
    '6': { winner: 'Mexico', score: '2-1', confidence: 56, analysis: 'Chicharito retirement narrative motivation spike vs Lewandowski fairy tale finale. Aztec atmosphere advantage: altitude Mexico City training benefits Dallas humidity adaptation. Close encounter with Szczesny shootout practice benefits Mexico.', recentForm: '🔥🔥🏆🏆🏆', keyInsight: 'Mexico penalty shootout preparation: 847 practice hours = tournament edge in knockout scenarios' },
    '7': { winner: 'Argentina', score: '3-0', confidence: 72, analysis: 'Messi Maradona parallel trajectory: 1986 synthesis with 2022 evolution. Mexico historical trauma vs Argentina: 4-0 2020 friendly haunting. La Albiceleste ruthlessness in group stage closes: 89% conversion from chances.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Scaloni innovation: 3-5-2 creates numerical superiority in wide areas Mexico cannot contain' },
    '8': { winner: 'Poland', score: '2-1', confidence: 54, analysis: 'Saudi momentum reversal under нов management. Zielinski Napoli form sustains Poland offensive structure. Emotional Salah absence creates Egypt parallels - Saudi rises from Arab spring.', recentForm: '🔥🏆🏆🏆🔥', keyInsight: 'Saudi domestic league quality improvement: 6 naturalized players elevate technical floor significantly' },
    '9': { winner: 'France', score: '4-1', confidence: 84, analysis: 'NN trajectory: Mbappe entering Ronaldo 2002 zone - 8 goals in 3 matches projection. Dembele Hakimi-level speed kills Australia defensive trigger. Giroud target man + Mbappe poacher spatial occupation = defensive nightmare.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Euro 2024 disappointment fuel: Deschamps ANGER management creates +15% focus improvement' },
    '10': { winner: 'Germany', score: '3-2', confidence: 64, analysis: 'Nagelsmann tactical innovation: Wirtz false-9 hybrid disrupts Japan 4-2-3-1 shape. Individual brilliance vs collective discipline battle. Germany vulnerability: crosses (conceded 34% from wide areas) vs Japan crossing proficiency.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Germany psychological recovery: 2022 first-round exit = maximum motivation reset under new coach' },
    '11': { winner: 'Draw', score: '2-2', confidence: 51, analysis: 'Neural network detects revenge motivation symmetry: France seeking Euros justice + Germany seeking WC 2022 redemption. Tchouameni Kimmich midfield duel creates mutual destruction. Mbappe vs Bayern Munich tactical prep paradox.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Both teams 78% probability of 3+ goals - entertaining draw serves both psychological agendas' },
    '12': { winner: 'Japan', score: '1-0', confidence: 58, analysis: 'Bundesliga factory pipeline vs Australia rigid tactics. Ueda Celtic experience creates Scottish adaptation benefits. Japan tactical flexibility: 4-3-3/5-4-1 hybrid confuses Australia predetermined responses.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Real Sociedad Kubo: La Masia vs Bundesliga education synthesis = unstoppable creativity' },
  },
  'batistuta_zhang': {
    '1': { winner: 'USA', score: '3-1', confidence: 72, analysis: 'Violent aesthetics: Pulisic-Gio Reyna-Vaughan connection = beautiful violence. McKenniebox presence creates 2nd-phase chaos. Weah pace vs Hakimi experience - USA athleticism overwhelms Morocco discipline.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'MLS physicality advantage: USA players accustomed to contact football vs technical Morocco' },
    '2': { winner: 'Croatia', score: '2-0', confidence: 68, analysis: 'xG model: Croatia 2.3 expected vs Nigeria 1.1. Modric worldie probability 18% when space exists. Perisic set-piece delivery creates 2.3 expected goals from dead balls.', recentForm: '🏆🏆🏆🏆🔥', keyInsight: 'Croatia tournament experience: 89% win rate in groups when Modric starts' },
    '3': { winner: 'USA', score: '2-1', confidence: 65, analysis: 'American siege mentality: Pulisic leadership elevates group performance. Turner shot-stopping regression to mean = crucial saves. Gvardiol Chelsea connection vs Pulisic Chelsea connection - friendship tested.', recentForm: '🏆🏆🔥🔥🔥', keyInsight: 'Balkan tragedy correlation: Croatia 2022 semi-final exhaustion carries into 2026 (-0.2 xGA)' },
    '4': { winner: 'Morocco', score: '2-0', confidence: 61, analysis: 'Morocco redemption arc: Hakimi against Inter teammates = personal motivation. En-Nesyri Champions League form replication. Amrabat comeback narrative drives defensive excellence.', recentForm: '🏆🏆🏆🏆🔥', keyInsight: 'African champions tradition: 2022 Morocco leads 2026 Nigeria - cyclical pattern favors Morocco' },
    '5': { winner: 'Argentina', score: '3-0', confidence: 76, analysis: 'La Pulga devastation: Messi free-kick probability 34% when fouled outside box. Di Maria worldie + Julian Alvarez third-man = beautiful violence. Saudi desperation = Argentina feast.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Messi psyching: Final tournament creates transcendent performances - Historical 92% correlation' },
    '6': { winner: 'Mexico', score: '2-1', confidence: 59, analysis: 'Chicharito legacy battle vs Lewandowski redemption. Mexican violent creativity vs Polish calculated efficiency. Atmospheric intimidation creates Mexico +0.3 performance boost.', recentForm: '🔥🔥🏆🏆🏆', keyInsight: 'CONCACAF warrior mentality: Mexico thrives in hostile environments - Dallas heat advantage' },
    '7': { winner: 'Argentina', score: '2-0', confidence: 71, analysis: 'Tactical violence: Argentina pressing intensity suffocates Mexico creativity. De Paulaggression + Paredes destruction = midfield dominance. Mexico spirit breaks under weight of history.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'South American knockout instinct: Argentina 92% ruthless when leading HT in tournaments' },
    '8': { winner: 'Poland', score: '1-0', confidence: 56, analysis: 'Saudi recovery attempt vs Poland survival mathematics. Zielinski creativity = penalty shootout preparation. Zielinski penalty shootout specialist potential vs Saudi confusion.', recentForm: '🔥🏆🏆🏆🔥', keyInsight: 'Polish discipline: 4-1-4-1 block forces Saudi to shoot from distance - low conversion expected' },
    '9': { winner: 'France', score: '3-0', confidence: 82, analysis: 'Mbappe violence: 94% sprint speed vs Australia defensive 18-yard box chaos. Dembele Hakimi-style destruction = beautiful. Thuram physical presence completes violent trinity.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Euro 2024 trauma transformation: Defeat fuels Mbappe +15% scoring probability in 2026' },
    '10': { winner: 'Germany', score: '2-1', confidence: 67, analysis: 'xG battle: Germany 2.1 vs Japan 1.8. Havertz false-9 role creates confusion. Japan pressing triggers Germany long-ball counter - physical dominance prevails.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Nagelsmann tactical surprise: 3-4-2-1 asymmetry catches Japan defensive coordination off-guard' },
    '11': { winner: 'France', score: '2-1', confidence: 63, analysis: 'Euro 2024 final memory warfare: Mbappe vs Bayern Munich defensive duo. Griezmannwork rate = silent assassin. France tournament resilience tested by German set-piece proficiency.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Mbappe right side exploitation: Bayern defenders face club teammate = hesitation +0.3 seconds' },
    '12': { winner: 'Japan', score: '2-1', confidence: 62, analysis: 'Real Sociedad duo Kubo-Oiyma: Bundesliga preparation sophistication. Celtic connections: Maeda-Reo Hatate-Antony = Scottish technical advantage. Japan collective violence dismantles Australia.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'J-League vs A-League evolution: Japanese domestic league quality gap = 2-goal advantage' },
  },
  'shearer_zhang': {
    '1': { winner: 'USA', score: '2-0', confidence: 65, analysis: 'Traditional striker analysis: Sargent target man + Pulisic secondary striker = partnership goals. Robinson overlapping + wing partnerships = crosses. Morocco 2 strikers = defensive overload.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Home World Cup tradition: USA joins 1994 momentum - nations win opening matches 67%' },
    '2': { winner: 'Croatia', score: '2-0', confidence: 73, analysis: 'Physical dominance: Croatia 4-2-3-1 bully Nigeria 4-3-3. Modric experience vs Nigeria youthful pressing = patience victory. Perisic set-piece = aerial dominance.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Croatian physical specimens: 184cm average height vs Nigeria 176cm = set-piece massacre' },
    '3': { winner: 'Croatia', score: '1-0', confidence: 58, analysis: 'Classic striker battle: Budimir vs Sargent = goalkeeper decisive. Gvardiol physical presence disrupts USA set pieces. Experience under pressure: Croatia 89% group stage survival rate.', recentForm: '🏆🏆🔥🔥🔥', keyInsight: 'American youthful exuberance vs European tournament nous = narrow Croatia victory' },
    '4': { winner: 'Draw', score: '1-1', confidence: 51, analysis: 'Morocco Africa pride vs Nigeria local rivalry. Both teams physical = mutual destruction. Hakimi offensive contribution vs Nigeria left-back frailties = balanced.', recentForm: '🏆🏆🏆🏆🔥', keyInsight: 'African tactical parity: 2026 yields more draws than 2022 - pattern emerges' },
    '5': { winner: 'Argentina', score: '2-0', confidence: 78, analysis: 'Striker dominance: Lautaro Martinez form = 2-goal minimum. Messi playmaking + Lautaro poaching = partnership excellence. Saudi defensive structure collapse under pressure.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Lautaro Martinez Ballon dOr trajectory: 2026 WC = pinnacle moment - motivated' },
    '6': { winner: 'Poland', score: '2-1', confidence: 57, analysis: 'Lewandowski legacy finale: 3 goals minimum projection. Zielinski creative role = 2 assists. Mexico defensive frailties vs Poland direct play = penalty shootout preparation.', recentForm: '🔥🔥🏆🏆🏆', keyInsight: 'Classic striker battle: Lewandowski Chicharito = mutually assured destruction - Poland edges' },
    '7': { winner: 'Argentina', score: '3-1', confidence: 69, analysis: 'Lautaro vs Chicharito = generational striker battle. Mexico pressing = energy depletion. Argentina ruthless: 87% conversion when creating 3+ chances.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'La Albiceleste knockout instinct: HT leading = 94% win rate historically' },
    '8': { winner: 'Saudi Arabia', score: '2-0', confidence: 52, analysis: 'Saudi momentum reversal under new tactical identity. Al-Burayk overlapping + Al-Dawsari creativity = defensive chaos. Poland high line vulnerable to pace.', recentForm: '🔥🏆🏆🏆🔥', keyInsight: 'Asian momentum: 2022 Qatar 2026 Saudi progression = Arab nation rising' },
    '9': { winner: 'France', score: '3-1', confidence: 79, analysis: 'Mbappe entering Ronaldo 2002 zone. Giroud target man = physical dominance. France set-piece proficiency vs Australia aerial weakness = 2+ goals.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Euro 2024 humiliation fuel: France 2026 = redemption arc with Mbappe hat-tricks' },
    '10': { winner: 'Germany', score: '2-1', confidence: 68, analysis: 'Havertz false-9 innovation: Japan defense confusion. Germany physical dominance + Havertz movement = 2+ goals. Japan pressing = energy expenditure without reward.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'German tournament tradition: 2010 runners-up, 2014 winners, 2018 groups, 2022 R16, 2026 = cycle completes' },
    '11': { winner: 'Draw', score: '1-1', confidence: 54, analysis: 'Striker duel: Giroud vs Neuer nemesis = mutual destruction. Gnabry inconsistent = draw probability increases. France defensive shape = German frustration.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Euro 2024 final memory: both teams psychological paralysis = cagey draw result' },
    '12': { winner: 'Japan', score: '2-0', confidence: 63, analysis: 'Maeda Celtic-Hokkaido connection: Scottish technical preparation advantage. Japan collective pressing = Australia passivity exploitation. Physical dominance in wide areas.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'J-League quality: 2023 ACL final = continental confidence boost +0.3 tournament performance' },
  },
  'ronaldo_silva': {
    '1': { winner: 'USA', score: '2-1', confidence: 63, analysis: 'Samba style vs European pragmatism: Pulisic explosion > Hakimi caution. Weah pace = counter-attack dimension. Home crowd = +0.3 psychological boost.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'American diaspora: 50M Hispanic support = 12th man atmosphere advantage' },
    '2': { winner: 'Croatia', score: '2-0', confidence: 71, analysis: '1v1 success: Modric vs Nigeria midfielders = dominant. Croatia tournament experience = Portugal 2016 template. Perisic Hakimi-level explosive running.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Dark horse precedent: Portugal 2016 winner pattern = Croatia 2026 +18% group performance' },
    '3': { winner: 'Croatia', score: '1-0', confidence: 56, analysis: 'Petrovic vs Turner = shootout specialist advantage. Croatia VAR luck correlation: +0.2 goals from refereeing decisions historically. Experience prevails.', recentForm: '🏆🏆🔥🔥🔥', keyInsight: 'American youth vs European age: Croatia 28.3 avg age > USA 24.7 = tournament endurance' },
    '4': { winner: 'Nigeria', score: '1-0', confidence: 48, analysis: 'Osimhen Champions League form = individual brilliance decisive. Morocco collective vs Nigeria individual = chess match. Dark horse reversal potential.', recentForm: '🔥🔥🔥🏆🏆', keyInsight: 'African nation emerging: Nigeria 1994, 2014 promise = 2026 breakthrough momentum builds' },
    '5': { winner: 'Argentina', score: '3-1', confidence: 81, analysis: 'Messi Samba synergy: Di Maria + Ronaldo Nazario parallels. Saudi chaos = South American celebration. Tournament favorite status confirmed.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Messi final dance: emotional momentum carries through group stage = 3/3 wins' },
    '6': { winner: 'Mexico', score: '2-1', confidence: 54, analysis: 'Latin American camaraderie: Mexico passion > Poland calculation. Lozano vs Lewandowski = explosive pace vs target man. Atmosphere decides.', recentForm: '🔥🔥🏆🏆🏆', keyInsight: 'CONCACAF tradition: Mexico 7/8 quarters appearances = knockout resilience' },
    '7': { winner: 'Argentina', score: '2-0', confidence: 73, analysis: 'South American supremacy: Lautaro Martinez > Chicharito legacy. Messi genius vs Mexico spirit = respectful dismissal. Argentina class tells.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'Messi rivalry respect: Mexico supporters secretly admire = respectful reception + quiet exit' },
    '8': { winner: 'Poland', score: '1-0', confidence: 53, analysis: 'European pragmatism defeats Asian ambition. Lewandowski penalty specialist preparation vs Saudi psychological fragility. Clinical efficiency prevails.', recentForm: '🔥🏆🏆🏆🔥', keyInsight: 'Polish motivation: Lewandowski final chance = personal redemption + team survival' },
    '9': { winner: 'France', score: '3-0', confidence: 83, analysis: 'MbappeExplosive speed = defensive chaos. Dembele Hakimi-level destruction = Australia tactical collapse. Samba style replication in Europe.', recentForm: '🏆🏆🏆🏆🏆', keyInsight: 'French revolution: Benzema absence = faster, more direct football = +0.5 goals' },
    '10': { winner: 'Germany', score: '2-1', confidence: 66, analysis: 'Havertz movement creates Musiala + Wirtz space. Germany physical vs Japan technical = balance. Nagelsmann innovation edges Japan preparation.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Bundesliga dominance: Germany 8 Japan players = information warfare advantage' },
    '11': { winner: 'France', score: '2-1', confidence: 61, analysis: 'Mbappe Bayern revenge motivation. Griezmann work rate vs Kimmich leadership. Euro 2024 final memory = France +12% performance edge.', recentForm: '🏆🏆🏆🔥🔥', keyInsight: 'Club teammates clash: Mbappe vs Kimmich = international duty advantage' },
    '12': { winner: 'Japan', score: '2-0', confidence: 61, analysis: 'Kubo Oiyma = Brazilian connection in La Liga. Celtic-Maeda partnership = Scottish technical advantage. Japan collective > Australia individual.', recentForm: '🔥🏆🏆🏆🏆', keyInsight: 'Asian progression: Qatar 2022 3 teams = Saudi/Japan 2026 4 teams emerging' },
  },
}

// Community Posts Mock Data - Hot discussions with 25+ posts
interface CommunityPost {
  id: number
  author: string
  avatar: string
  country: string
  content: string
  likes: number
  comments: number
  time: string
  isHot?: boolean
  isPinned?: boolean
  tags: string[]
}

const communityPosts: CommunityPost[] = [
  { id: 1, author: 'MessiFanArgentina', avatar: '🔵', country: '🇦🇷', content: 'USA vs Morocco opening match analysis: Pulisic is the key. His Chelsea form resurrection this season has been incredible. If he stays fit, USA goes through from Group A. The home advantage cannot be underestimated!', likes: 234, comments: 45, time: '2h ago', isHot: true, isPinned: true, tags: ['USA', 'Morocco', 'Analysis'] },
  { id: 2, author: 'CroatiaWizard', avatar: '🔴', country: '🇭🇷', content: 'Modric at 41 still running the show! His partnership with Kovacic and Brozovic is the heartbeat of this team. Nigeria better watch out - Croatia midfield control is UNREAL.', likes: 189, comments: 32, time: '3h ago', isHot: true, tags: ['Croatia', 'Modric', 'Midfield'] },
  { id: 3, author: 'BrazilianSambaKing', avatar: '💛', country: '🇧🇷', content: 'Neymar ALONE is worth the ticket price! His final World Cup - the entire Brazil is behind him. 2026 is HIS tournament. Prediction: 8 goals minimum!', likes: 567, comments: 89, time: '4h ago', isHot: true, tags: ['Brazil', 'Neymar', 'Prediction'] },
  { id: 4, author: 'EnglandHoper2026', avatar: '⚽', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', content: 'Southgate OUT! Kane needs proper service. 2022 penalty heartbreak cannot happen again. Our golden generation deserves a trophy! Trusting Shearer Zhang prediction: England reaches quarters minimum.', likes: 345, comments: 67, time: '5h ago', isHot: true, tags: ['England', 'Kane', 'Analysis'] },
  { id: 5, author: 'FranceUltraMbappe', avatar: '💙', country: '🇫🇷', content: 'Mbappe 2026 = Ronaldo 2002 zone! Euro 2024 humiliation → World Cup glory transformation. France dark horse? NO! France is the FAVORITE. Hat-tricks incoming!', likes: 456, comments: 78, time: '6h ago', isHot: true, tags: ['France', 'Mbappe', 'Favorites'] },
  { id: 6, author: 'GermanyTechExpert', avatar: '⚫', country: '🇩🇪', content: 'Nagelsmann tactical revolution fascinating! Wirtz false-9 hybrid, Musiala gravity creation, Havertz movement... Germany WC2022 trauma fuel → 2026 CHAMPIONS!', likes: 298, comments: 41, time: '7h ago', tags: ['Germany', 'Nagelsmann', 'Tactics'] },
  { id: 7, author: 'MexicoLuchaLibre', avatar: '💚', country: '🇲🇽', content: 'Chicharito comeback narrative EPIC! Mexico tournament resilience tradition: 7/8 quarter appearances. Dallas humidity advantage vs Poland. WE GOING THROUGH!', likes: 234, comments: 56, time: '8h ago', tags: ['Mexico', 'Chicharito', 'Analysis'] },
  { id: 8, author: 'JapanBundesligaFan', avatar: '🔴', country: '🇯🇵', content: 'Kubo + Oiyma La Masia synthesis UNSTOPPABLE! 8 Japan players in Bundesliga = tactical preparation sophistication. Australia cannot handle Japan 4-3-3 fluid interchange!', likes: 187, comments: 29, time: '9h ago', tags: ['Japan', 'Kubo', 'Bundesliga'] },
  { id: 9, author: 'SpainTikiTakaLegacy', avatar: '🔴', country: '🇪🇸', content: 'Lamine Yamal + Pedri = Xavi Iniesta 2.0! Spain rebuild complete. Euro 2024 near-miss → 2026 revenge. Rodri Ballon d\'Or contender!', likes: 345, comments: 52, time: '10h ago', tags: ['Spain', 'Youth', 'Rebuild'] },
  { id: 10, author: 'PortugalRonaldoFan', avatar: '🔴', country: '🇵🇹', content: 'Ronaldo final dance PART 2! B Silva and Felix must step up. Bernardo Silva Manchester City form = KEY. Euro 2016 template replication!', likes: 289, comments: 43, time: '11h ago', tags: ['Portugal', 'Ronaldo', 'B-Silva'] },
  { id: 11, author: 'NetherlandsOranje', avatar: '🟠', country: '🇳🇱', content: 'Van Dijk defensive leadership + Memphis Depay attack = Netherlands balance! Wijnaldum return provides experience. Semi-finals or better prediction!', likes: 178, comments: 34, time: '12h ago', tags: ['Netherlands', 'Van-Dijk', 'Analysis'] },
  { id: 12, author: 'BelgiumGoldenGen', avatar: '🔴', country: '🇧🇪', content: 'De Bruyne + Lukaku partnership KEY! Belgium 2018 disappointment → 2026 redemption. Kevin Guardian mode activated. Quarter-finals minimum!', likes: 234, comments: 41, time: '13h ago', tags: ['Belgium', 'De-Bruyne', 'Redemption'] },
  { id: 13, author: 'ItalyDefensiveArt', avatar: '🔵', country: '🇮🇹', content: 'Donnarumma + Bastoni + Bucciarelli = Italy defensive dynasty! Spalletti tactical innovation. Euro 2020 champions momentum carries to 2026!', likes: 198, comments: 28, time: '14h ago', tags: ['Italy', 'Defense', 'Spalletti'] },
  { id: 14, author: 'UruguayTraditionalist', avatar: '⚽', country: '🇺🇾', content: 'Nunez + Valverde + Bentancur = Uruguay physical dominance! Darwin Darwin Darwin - his pressing will terrify opponents. Dark horse CHAMPION pick!', likes: 267, comments: 48, time: '15h ago', tags: ['Uruguay', 'Nunez', 'Dark-Horse'] },
  { id: 15, author: 'MoroccoAtlasLion', avatar: '🟢', country: '🇲🇦', content: 'Hakimi Inter teammates revenge motivation! Amrabat return = defensive excellence. 2022 semi-final inspiration carries forward. AFRICA RISING!', likes: 312, comments: 55, time: '16h ago', isHot: true, tags: ['Morocco', 'Hakimi', 'Africa'] },
  { id: 16, author: 'SenegalLions', avatar: '💛', country: '🇸🇳', content: 'Mané + Koulibaly = Senegal trophy dream! Mane Bayern form resurrection = tournament Pulisic equivalent. Africa champion PREDICTION!', likes: 189, comments: 32, time: '17h ago', tags: ['Senegal', 'Mane', 'Africa'] },
  { id: 17, author: 'PolandLegacy', avatar: '⚪', country: '🇵🇱', content: 'Lewandowski final chance REDEMPTION! 2022 penalty miss → 2026 glory arc. Zielinski Napoli form = creative support. Fighting!', likes: 234, comments: 41, time: '18h ago', tags: ['Poland', 'Lewandowski', 'Redemption'] },
  { id: 18, author: 'CameroonIndomitable', avatar: '🟢', country: '🇨🇲', content: 'Song Ekango + Andre Onana = Cameroon unity! Napoli Song form = tournament surprise package. Africa dark horse!', likes: 145, comments: 23, time: '19h ago', tags: ['Cameroon', 'Onana', 'Africa'] },
  { id: 19, author: 'ColombiaCoffee', avatar: '💛', country: '🇨🇴', content: 'James Rodriguez LIVERPOOL REVIVAL! Colombia qualification momentum = World Cup confidence. South America dark horse!', likes: 167, comments: 28, time: '20h ago', tags: ['Colombia', 'James', 'South-America'] },
  { id: 20, author: 'AustraliaSocceroos', avatar: '🟡', country: '🇦🇺', content: 'Mathew Leckie experience + A-League quality improvement = Australia competitive! Group C challenge = motivational opportunity!', likes: 123, comments: 19, time: '21h ago', tags: ['Australia', 'Leckie', 'Competitive'] },
  { id: 21, author: 'CanadaMapleLeaf', avatar: '🔴', country: '🇨🇦', content: 'Davies Bayern speed + Portland Davies form = Canada attacking threat! First World Cup = historical momentum. GO CANADA GO!', likes: 198, comments: 35, time: '22h ago', isHot: true, tags: ['Canada', 'Davies', 'Historic'] },
  { id: 22, author: 'SaudiArabiaEagles', avatar: '💚', country: '🇸🇦', content: 'Al-Dawsari creativity + naturalized players quality = Saudi improvement! 2022 upset vs Argentina = template. Asian pride!', likes: 156, comments: 24, time: '23h ago', tags: ['Saudi', 'Al-Dawsari', 'Asia'] },
  { id: 23, author: 'SouthKoreaTaeguk', avatar: '🔵', country: '🇰🇷', content: 'Son Heung-min Golden Boot legacy + Hwang Hee-chan partnership = Korea attacking threat! Celtic connection preparation. Asian excellence!', likes: 234, comments: 38, time: '1d ago', tags: ['Korea', 'Son', 'Asian'] },
  { id: 24, author: 'Qatar2022Lessons', avatar: '🔴', country: '🇶🇦', content: 'Host nation pressure ANALYSIS! Qatar 2022 learning = 2026 improved hosting. First tournament appearance growing pains OVER!', likes: 98, comments: 15, time: '1d ago', tags: ['Qatar', 'Host', 'Analysis'] },
  { id: 25, author: 'PredictorPro', avatar: '⚽', country: '🌍', content: 'AI Expert Analysis Summary: Argentina 18% crown defense, France +12% from Euro trauma, Brazil Neymar redemption, Germany Nagelsmann revolution. TOURNAMENT WILL BE EPIC!', likes: 456, comments: 72, time: '1d ago', isHot: true, isPinned: true, tags: ['AI', 'Prediction', 'Summary'] },
  { id: 26, author: 'EnglandDefensive', avatar: '⚽', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', content: 'Southgate tactical dilemma: 3-4-3 vs 4-3-3 vs 4-2-3-1. Walker Trent Alexander-Arnold fullback dilemma. Rice and Mainoo pivot chemistry TEST!', likes: 167, comments: 41, time: '1d ago', tags: ['England', 'Southgate', 'Tactics'] },
]

export default function FootballPage() {
  const { t, tTeam } = useI18n()
  const [selectedPersona, setSelectedPersona] = useState<string | null>('beckham_chen')
  const [activeTab, setActiveTab] = useState('Group A')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMatch, setModalMatch] = useState<{ id: number; team1: string; team2: string; date: string; time: string } | null>(null)
  const [isOracleOpen, setIsOracleOpen] = useState(false)

  const personaIds = ['beckham_chen', 'zidane_gao', 'batistuta_zhang', 'shearer_zhang', 'ronaldo_silva']
  const personas = personaIds.map((id) => ({
    id,
    initials: id.split('_').map(n => n[0].toUpperCase()).join(''),
    gradient: {
      beckham_chen: 'from-blue-500 to-purple-600',
      zidane_gao: 'from-amber-500 to-orange-600',
      batistuta_zhang: 'from-red-500 to-rose-600',
      shearer_zhang: 'from-green-500 to-emerald-600',
      ronaldo_silva: 'from-yellow-500 to-amber-600',
    }[id] as string,
    name: t(`aiExperts.${id}.name`),
    alias: t(`aiExperts.${id}.name`),
    preferences: t(`aiExperts.${id}.preferences`).split(','),
    traits: t(`aiExperts.${id}.traits`).split(','),
  }))

  const handlePredict = (match: { id: number; team1: string; team2: string; date: string; time: string }) => {
    if (selectedPersona) {
      setModalMatch(match)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalMatch(null)
  }

  const selectedPersonaData = personas.find(p => p.id === selectedPersona)
  const modalPrediction = modalMatch && selectedPersona
    ? predictions[selectedPersona]?.[modalMatch.id.toString()]
    : null

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-50 overflow-x-hidden">
      {/* Compliance Notice */}
      <ComplianceNotice />

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t('nav.backToTown')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <ConnectWalletButton />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Google AdSense - Top Banner */}
      <div className="pt-16">
        <DynamicAdBanner teamId="worldcup" teamName="World Cup 2026" teamFlag="🏆" variant="top" />
      </div>

      {/* Main Content */}
      <main className="pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section with Countdown */}
          <HeroSection />

          {/* Page Header */}
          <div className="mb-8" id="schedule">
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6">
            {/* Left Column - AI Personas */}
            <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                {t('aiPersonas.title')}
              </h2>
              <div className="space-y-4">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedPersona === persona.id
                        ? 'bg-slate-800/60 border-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-emerald-500/30 hover:-translate-y-0.5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${persona.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <span className="text-white font-bold text-lg">{persona.initials}</span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">{persona.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{persona.alias}</p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {persona.preferences.map((pref, idx) => (
                            <span
                              key={`pref-${idx}`}
                              className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                            >
                              {pref}
                            </span>
                          ))}
                          {persona.traits.map((trait, idx) => (
                            <span
                              key={`trait-${idx}`}
                              className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column - Schedule Sandbox */}
            <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                {t('schedule.title')}
              </h2>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'Group A', label: t('schedule.groupA') },
                  { key: 'Group B', label: t('schedule.groupB') },
                  { key: 'Group C', label: t('schedule.groupC') },
                  { key: 'Knockouts', label: t('schedule.knockouts') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key)
                      closeModal()
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Match List */}
              <div className="space-y-4">
                {matchData[activeTab as keyof typeof matchData]?.map((match) => (
                  <div
                    key={match.id}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 transition-all duration-300 hover:border-emerald-500/30"
                  >
                    {/* Match Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Team 1 */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center mb-2">
                            <span className="text-xs font-bold text-slate-300">{t(`teams.${match.team1}`)}</span>
                          </div>
                          <span className="text-sm font-medium text-white text-center max-w-[80px] truncate">{t(`teams.${match.team1}`)}</span>
                        </div>

                        {/* VS */}
                        <div className="text-slate-500 font-bold text-xl px-4">{t('schedule.vs')}</div>

                        {/* Team 2 */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center mb-2">
                            <span className="text-xs font-bold text-slate-300">{t(`teams.${match.team2}`)}</span>
                          </div>
                          <span className="text-sm font-medium text-white text-center max-w-[80px] truncate">{t(`teams.${match.team2}`)}</span>
                        </div>
                      </div>

                      {/* Time and Predict Button */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-slate-400 text-xs text-right">
                          <div>{match.date}</div>
                          <div>{match.time}</div>
                        </div>
                        <button
                          onClick={() => handlePredict(match)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          {t('schedule.aiPredict')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Full Schedule Link */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <Link
                  href="/football/schedule"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <span>{t('schedule.viewFullSchedule')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Amazon Banner */}
              <AmazonBanner />

              {/* Teams Hub */}
              <TeamsHub />

              {/* 48-Team Global Gateway */}
              <TeamMatrix />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candy Points */}
              <CandyPoints />

              {/* Fans Shop */}
              <FansShop />

              {/* Gamers Corner */}
              <GamersCorner />

              {/* Community Forum - Hot Discussions */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  🔥 Community Forum
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {communityPosts.slice(0, 12).map((post) => (
                    <div
                      key={post.id}
                      className={`bg-slate-800/40 backdrop-blur-sm border rounded-xl p-3 hover:border-orange-500/30 transition-all duration-300 ${
                        post.isPinned ? 'border-amber-500/50' : post.isHot ? 'border-orange-500/30' : 'border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm flex-shrink-0">
                          {post.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-white text-xs font-medium truncate">{post.author}</span>
                            <span>{post.country}</span>
                            {post.isHot && <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">🔥 HOT</span>}
                            {post.isPinned && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">📌 Pinned</span>}
                          </div>
                          <span className="text-slate-500 text-xs">{post.time}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2 line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <span>❤️</span>
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <span>💬</span>
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex-1" />
                        <div className="flex gap-1 flex-wrap">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <Link href="/football/forum" className="w-full py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center">
                    View All 26+ Discussions →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Prediction Modal */}
      <PredictionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        match={modalMatch}
        persona={selectedPersonaData || null}
        prediction={modalPrediction}
      />

      {/* Global Oracle Modal */}
      <GlobalOracle
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
      />

      {/* Google AdSense - Bottom Banner (hidden on main dashboard) */}
      <DynamicAdBanner
        teamId="worldcup-bottom"
        teamName="World Cup 2026"
        teamFlag="🏆"
        variant="bottom"
        isScrollTriggered={true}
        showOnMainDashboard={false}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs font-medium">{t('brand.name')} · football.netown.cn · {t('home.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}
