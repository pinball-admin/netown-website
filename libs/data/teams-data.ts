// Shared team data for all 48 World Cup 2026 teams
// Single source of truth for team detail pages

export interface TeamPlayer {
  name: string
  number: number
  position: string
  club?: string
}

export interface TeamFixture {
  opponent: string
  date: string
  time: string
  venue: string
}

export interface TeamAIAnalysis {
  persona: string
  alias: string
  initials: string
  gradient: string
  winProbability: number
  analysis: string
}

export interface TeamData {
  name: string
  flag: string
  code: string
  ranking: number
  coach: string
  coachNationality: string
  keyPlayers: TeamPlayer[]
  squad: TeamPlayer[]
  worldCupTitles: number
  bestResult: string
  group: string
  fixtures: TeamFixture[]
  aiAnalysis: TeamAIAnalysis[]
}

// Helper: build team fixtures from schedule data
function f(opponent: string, date: string, time: string, venue: string): TeamFixture {
  return { opponent, date, time, venue }
}

// Helper: build AI analysis entry
function ai(persona: string, alias: string, initials: string, gradient: string, winProbability: number, analysis: string): TeamAIAnalysis {
  return { persona, alias, initials, gradient, winProbability, analysis }
}

// Helper: build player entry
function p(name: string, number: number, position: string, club?: string): TeamPlayer {
  return { name, number, position, club }
}

export const teamsData: Record<string, TeamData> = {
  // ===== GROUP J =====
  'argentina': {
    name: 'Argentina', flag: '🇦🇷', code: 'ARG', ranking: 1,
    coach: 'Lionel Scaloni', coachNationality: 'Argentine',
    keyPlayers: [p('Lionel Messi', 10, 'Forward'), p('Angel Di Maria', 11, 'Winger'), p('Emiliano Martinez', 23, 'Goalkeeper')],
    squad: [p('Lionel Messi', 10, 'Forward', 'Inter Miami'), p('Angel Di Maria', 11, 'Winger', 'Benfica'), p('Emiliano Martinez', 23, 'Goalkeeper', 'Aston Villa'), p('Cristian Romero', 13, 'Defender', 'Tottenham'), p('Nicolas Otamendi', 19, 'Defender', 'Benfica'), p('Leandro Paredes', 5, 'Midfielder', 'Juventus'), p('Rodrigo De Paul', 7, 'Midfielder', 'Atletico Madrid'), p('Julian Alvarez', 9, 'Forward', 'Manchester City')],
    worldCupTitles: 3, bestResult: 'Champion (1978, 1986, 2022)',
    group: 'Group J',
    fixtures: [f('Algeria', '2026-06-11', '18:00', 'Mercedes-Benz Stadium'), f('Austria', '2026-06-16', '21:00', 'NRG Stadium'), f('Jordan', '2026-06-22', '18:00', 'MetLife Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 18, 'Neural network shows 18% defense retention probability. Messis final dance could end in glory.'), ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 22, 'Bayesian model favors Argentina. Wing attack efficiency combined with squad depth is unmatched.'), ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 20, 'Violent aesthetics index high. Aggressive pressing game suits this squad perfectly.')],
  },
  'brazil': {
    name: 'Brazil', flag: '🇧🇷', code: 'BRA', ranking: 3,
    coach: 'Dorival Jr.', coachNationality: 'Brazilian',
    keyPlayers: [p('Neymar Jr.', 10, 'Forward'), p('Vinicius Jr.', 7, 'Winger'), p('Alisson Becker', 1, 'Goalkeeper')],
    squad: [p('Neymar Jr.', 10, 'Forward', 'Al-Hilal'), p('Vinicius Jr.', 7, 'Winger', 'Real Madrid'), p('Alisson Becker', 1, 'Goalkeeper', 'Liverpool'), p('Marquinhos', 4, 'Defender', 'PSG'), p('Raphinha', 11, 'Winger', 'Barcelona')],
    worldCupTitles: 5, bestResult: 'Champion (1958, 1962, 1970, 1994, 2002)',
    group: 'Group C',
    fixtures: [f('Morocco', '2026-06-13', '20:00', 'AT&T Stadium'), f('Haiti', '2026-06-18', '18:00', 'Mercedes-Benz Stadium'), f('Scotland', '2026-06-23', '18:00', "Levi's Stadium")],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 24, 'Highest xG shooting rate in South America. Neymar finally lifts the trophy.'), ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 21, 'Samba explosiveness peak. 1v1 success rate is devastating.')],
  },
  'france': {
    name: 'France', flag: '🇫🇷', code: 'FRA', ranking: 2,
    coach: 'Didier Deschamps', coachNationality: 'French',
    keyPlayers: [p('Kylian Mbappe', 10, 'Forward'), p('Antoine Griezmann', 7, 'Forward'), p('N Golo Kante', 6, 'Midfielder')],
    squad: [p('Kylian Mbappe', 10, 'Forward', 'Real Madrid'), p('Antoine Griezmann', 7, 'Forward', 'Atletico Madrid'), p('N Golo Kante', 6, 'Midfielder', 'Al-Ettifaq'), p('Hugo Lloris', 1, 'Goalkeeper', 'Retired'), p('William Saliba', 4, 'Defender', 'Arsenal'), p('Eduardo Camavinga', 8, 'Midfielder', 'Real Madrid')],
    worldCupTitles: 2, bestResult: 'Champion (1998, 2018)',
    group: 'Group I',
    fixtures: [f('Senegal', '2026-06-11', '21:00', 'Rose Bowl'), f('Iraq', '2026-06-16', '15:00', 'Mercedes-Benz Stadium'), f('Norway', '2026-06-21', '18:00', 'AT&T Stadium')],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 20, 'Wing cross efficiency through Mbappe is devastating. Premier League style tactics.'), ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 19, 'Midfield control with Kante return makes them favorites for deep knockout runs.')],
  },
  'england': {
    name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', ranking: 5,
    coach: 'Gareth Southgate', coachNationality: 'English',
    keyPlayers: [p('Harry Kane', 9, 'Striker'), p('Declan Rice', 6, 'Midfielder'), p('Phil Foden', 8, 'Midfielder')],
    squad: [p('Harry Kane', 9, 'Striker', 'Bayern Munich'), p('Declan Rice', 6, 'Midfielder', 'Arsenal'), p('Phil Foden', 8, 'Midfielder', 'Manchester City'), p('Bukayo Saka', 7, 'Winger', 'Arsenal'), p('Jude Bellingham', 10, 'Midfielder', 'Real Madrid')],
    worldCupTitles: 1, bestResult: 'Champion (1966)',
    group: 'Group L',
    fixtures: [f('Croatia', '2026-06-11', '15:00', 'AT&T Stadium'), f('Ghana', '2026-06-17', '15:00', 'Rose Bowl'), f('Panama', '2026-06-22', '21:00', 'Mercedes-Benz Stadium')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 15, 'Penalty box domination through Kane is their key weapon. Physical battle advantage.'), ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 14, 'Premier League discipline gives them edge in tight knockout matches.')],
  },
  'usa': {
    name: 'USA', flag: '🇺🇸', code: 'USA', ranking: 11,
    coach: 'Gregg Berhalter', coachNationality: 'American',
    keyPlayers: [p('Christian Pulisic', 10, 'Winger'), p('Gio Reyna', 7, 'Midfielder'), p('Weston McKennie', 8, 'Midfielder')],
    squad: [p('Christian Pulisic', 10, 'Winger', 'AC Milan'), p('Gio Reyna', 7, 'Midfielder', 'Borussia Dortmund'), p('Weston McKennie', 8, 'Midfielder', 'Juventus'), p('Matt Turner', 1, 'Goalkeeper', 'Nottingham Forest')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (2002)',
    group: 'Group D',
    fixtures: [f('Paraguay', '2026-06-12', '20:00', 'SoFi Stadium'), f('Australia', '2026-06-18', '21:00', 'NRG Stadium'), f('Turkey', '2026-06-23', '21:00', 'Mercedes-Benz Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 12, 'Home soil advantage plus explosive 1v1 skills. Dark horse potential.'), ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 10, 'Young squad with high neural network learning potential. Could surprise.')],
  },
  'germany': {
    name: 'Germany', flag: '🇩🇪', code: 'GER', ranking: 16,
    coach: 'Julian Nagelsmann', coachNationality: 'German',
    keyPlayers: [p('Manuel Neuer', 1, 'Goalkeeper'), p('Toni Kroos', 8, 'Midfielder'), p('Kai Havertz', 10, 'Forward')],
    squad: [p('Manuel Neuer', 1, 'Goalkeeper', 'Bayern Munich'), p('Toni Kroos', 8, 'Midfielder', 'Real Madrid'), p('Kai Havertz', 10, 'Forward', 'Arsenal'), p('Jamal Musiala', 14, 'Midfielder', 'Bayern Munich')],
    worldCupTitles: 4, bestResult: 'Champion (1954, 1974, 1990, 2014)',
    group: 'Group E',
    fixtures: [f('Curacao', '2026-06-14', '21:00', 'MetLife Stadium'), f('Ecuador', '2026-06-19', '18:00', 'NRG Stadium'), f('Ivory Coast', '2026-06-24', '21:00', 'AT&T Stadium')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 16, 'Young squad under Nagelsmann tactical genius. Traditional striker system revitalized.'), ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 14, 'High score game potential. German efficiency meets modern pressing.')],
  },

  // ===== GROUP A =====
  'mexico': {
    name: 'Mexico', flag: '🇲🇽', code: 'MEX', ranking: 12,
    coach: 'Jaime Lozano', coachNationality: 'Mexican',
    keyPlayers: [p('Hirving Lozano', 22, 'Winger'), p('Raul Jimenez', 9, 'Striker'), p('Edson Alvarez', 4, 'Midfielder')],
    squad: [p('Guillermo Ochoa', 1, 'Goalkeeper', 'Salernitana'), p('Edson Alvarez', 4, 'Midfielder', 'West Ham'), p('Hirving Lozano', 22, 'Winger', 'PSV'), p('Raul Jimenez', 9, 'Striker', 'Fulham'), p('Cesar Montes', 3, 'Defender', 'Almeria')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (1970, 1986)',
    group: 'Group A',
    fixtures: [f('South Korea', '2026-06-11', '16:00', 'SoFi Stadium'), f('Czech Republic', '2026-06-16', '18:00', 'AT&T Stadium'), f('South Africa', '2026-06-21', '21:00', 'Rose Bowl')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 14, 'CONCACAF giants with explosive wing play. Lozano can unlock any defense.'), ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 12, 'Neural network shows balanced squad. Home crowd in North America helps.')],
  },
  'south-korea': {
    name: 'South Korea', flag: '🇰🇷', code: 'KOR', ranking: 24,
    coach: 'Jurgen Klinsmann', coachNationality: 'German',
    keyPlayers: [p('Son Heung-min', 7, 'Winger'), p('Kim Min-jae', 4, 'Defender'), p('Lee Kang-in', 10, 'Midfielder')],
    squad: [p('Son Heung-min', 7, 'Winger', 'Tottenham'), p('Kim Min-jae', 4, 'Defender', 'Bayern Munich'), p('Lee Kang-in', 10, 'Midfielder', 'PSG'), p('Hwang Hee-chan', 11, 'Forward', 'Wolves'), p('Cho Gue-sung', 9, 'Striker', 'Midtjylland')],
    worldCupTitles: 0, bestResult: 'Semi-finals (2002)',
    group: 'Group A',
    fixtures: [f('Mexico', '2026-06-11', '16:00', 'SoFi Stadium'), f('South Africa', '2026-06-17', '15:00', 'NRG Stadium'), f('Czech Republic', '2026-06-22', '18:00', 'Lincoln Financial Field')],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 13, 'Son Heung-min elite wing play gives them edge. Kim Min-jae defensive rock.'), ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 10, 'Physical battle suits Korean style. Set piece danger.')],
  },
  'czech-republic': {
    name: 'Czech Republic', flag: '🇨🇿', code: 'CZE', ranking: 32,
    coach: 'Jaroslav Silhavy', coachNationality: 'Czech',
    keyPlayers: [p('Patrik Schick', 9, 'Striker'), p('Tomas Soucek', 8, 'Midfielder'), p('Vladimir Coufal', 2, 'Defender')],
    squad: [p('Patrik Schick', 9, 'Striker', 'Bayer Leverkusen'), p('Tomas Soucek', 8, 'Midfielder', 'West Ham'), p('Vladimir Coufal', 2, 'Defender', 'West Ham'), p('Antonin Barak', 7, 'Midfielder', 'Fiorentina')],
    worldCupTitles: 0, bestResult: 'Final (1934, 1962)',
    group: 'Group A',
    fixtures: [f('South Africa', '2026-06-11', '18:00', 'MetLife Stadium'), f('Mexico', '2026-06-16', '18:00', 'AT&T Stadium'), f('South Korea', '2026-06-22', '18:00', 'Lincoln Financial Field')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 9, 'Midfield control through Soucek is key. Discipline is their trademark.')],
  },
  'south-africa': {
    name: 'South Africa', flag: '🇿🇦', code: 'RSA', ranking: 60,
    coach: 'Hugo Broos', coachNationality: 'Belgian',
    keyPlayers: [p('Percy Tau', 10, 'Forward'), p('Lyle Foster', 13, 'Striker'), p('Teboho Mokoena', 4, 'Midfielder')],
    squad: [p('Percy Tau', 10, 'Forward', 'Al Ahly'), p('Lyle Foster', 13, 'Striker', 'Burnley'), p('Teboho Mokoena', 4, 'Midfielder', 'Mamelodi Sundowns'), p('Ronwen Williams', 1, 'Goalkeeper', 'Mamelodi Sundowns')],
    worldCupTitles: 0, bestResult: 'Group Stage',
    group: 'Group A',
    fixtures: [f('Czech Republic', '2026-06-11', '18:00', 'MetLife Stadium'), f('South Korea', '2026-06-17', '15:00', 'NRG Stadium'), f('Mexico', '2026-06-21', '21:00', 'Rose Bowl')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 7, 'African champions with pace and power. Underestimated but dangerous.')],
  },

  // ===== GROUP B =====
  'canada': {
    name: 'Canada', flag: '🇨🇦', code: 'CAN', ranking: 48,
    coach: 'John Herdman', coachNationality: 'Canadian',
    keyPlayers: [p('Alphonso Davies', 19, 'Winger'), p('Jonathan David', 20, 'Striker'), p('Stephen Eustaquio', 8, 'Midfielder')],
    squad: [p('Alphonso Davies', 19, 'Winger', 'Bayern Munich'), p('Jonathan David', 20, 'Striker', 'Lille'), p('Stephen Eustaquio', 8, 'Midfielder', 'Porto'), p('Milan Borjan', 1, 'Goalkeeper', 'Red Star'), p('Tajon Buchanan', 11, 'Winger', 'Inter Milan')],
    worldCupTitles: 0, bestResult: 'Group Stage',
    group: 'Group B',
    fixtures: [f('Bosnia', '2026-06-12', '18:00', "Levi's Stadium"), f('Qatar', '2026-06-17', '18:00', 'SoFi Stadium'), f('Switzerland', '2026-06-22', '21:00', 'Rose Bowl')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 11, 'Davies electrifying pace and David clinical finishing. Dark horse potential.'), ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 9, 'Premier League influence with Davies and David. Tactical discipline improving.')],
  },
  'bosnia': {
    name: 'Bosnia and Herzegovina', flag: '🇧🇦', code: 'BIH', ranking: 45,
    coach: 'Savo Milosevic', coachNationality: 'Bosnian',
    keyPlayers: [p('Edin Dzeko', 11, 'Striker'), p('Miralem Pjanic', 10, 'Midfielder'), p('Sead Kolasinac', 5, 'Defender')],
    squad: [p('Edin Dzeko', 11, 'Striker', 'Fenerbahce'), p('Miralem Pjanic', 10, 'Midfielder', 'Sharjah'), p('Sead Kolasinac', 5, 'Defender', 'Atalanta'), p('Ibrahim Sehic', 1, 'Goalkeeper', 'Qarabag')],
    worldCupTitles: 0, bestResult: 'Group Stage (2014)',
    group: 'Group B',
    fixtures: [f('Canada', '2026-06-12', '18:00', "Levi's Stadium"), f('Switzerland', '2026-06-18', '15:00', 'MetLife Stadium'), f('Qatar', '2026-06-23', '15:00', 'NRG Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 8, 'Veteran leadership from Dzeko and Pjanic. Experience over youth.')],
  },
  'qatar': {
    name: 'Qatar', flag: '🇶🇦', code: 'QAT', ranking: 58,
    coach: 'Carlos Queiroz', coachNationality: 'Portuguese',
    keyPlayers: [p('Akram Afif', 10, 'Forward'), p('Almoez Ali', 11, 'Striker'), p('Hassan Al-Haydos', 12, 'Midfielder')],
    squad: [p('Akram Afif', 10, 'Forward', 'Al Sadd'), p('Almoez Ali', 11, 'Striker', 'Al Duhail'), p('Hassan Al-Haydos', 12, 'Midfielder', 'Al Sadd'), p('Saad Al Sheeb', 1, 'Goalkeeper', 'Al Sadd')],
    worldCupTitles: 0, bestResult: 'Group Stage (2022)',
    group: 'Group B',
    fixtures: [f('Switzerland', '2026-06-12', '21:00', 'Mercedes-Benz Stadium'), f('Canada', '2026-06-17', '18:00', 'SoFi Stadium'), f('Bosnia', '2026-06-23', '15:00', 'NRG Stadium')],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 7, 'Asian Cup champions. Queiroz defensive organization could frustrate opponents.')],
  },
  'switzerland': {
    name: 'Switzerland', flag: '🇨🇭', code: 'SUI', ranking: 19,
    coach: 'Murat Yakin', coachNationality: 'Swiss',
    keyPlayers: [p('Granit Xhaka', 10, 'Midfielder'), p('Breel Embolo', 7, 'Striker'), p('Manuel Akanji', 5, 'Defender')],
    squad: [p('Granit Xhaka', 10, 'Midfielder', 'Bayer Leverkusen'), p('Breel Embolo', 7, 'Striker', 'Monaco'), p('Manuel Akanji', 5, 'Defender', 'Manchester City'), p('Yann Sommer', 1, 'Goalkeeper', 'Inter Milan'), p('Xherdan Shaqiri', 23, 'Winger', 'Chicago Fire')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (2014)',
    group: 'Group B',
    fixtures: [f('Qatar', '2026-06-12', '21:00', 'Mercedes-Benz Stadium'), f('Bosnia', '2026-06-18', '15:00', 'MetLife Stadium'), f('Canada', '2026-06-22', '21:00', 'Rose Bowl')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 14, 'Xhaka midfield leadership and Akanji defensive solidity. Swiss efficiency.')],
  },

  // ===== GROUP C (BRA already exists) =====
  'morocco': {
    name: 'Morocco', flag: '🇲🇦', code: 'MAR', ranking: 13,
    coach: 'Walid Regragui', coachNationality: 'Moroccan',
    keyPlayers: [p('Achraf Hakimi', 2, 'Defender'), p('Hakim Ziyech', 7, 'Winger'), p('Sofyan Amrabat', 4, 'Midfielder')],
    squad: [p('Achraf Hakimi', 2, 'Defender', 'PSG'), p('Hakim Ziyech', 7, 'Winger', 'Galatasaray'), p('Sofyan Amrabat', 4, 'Midfielder', 'Manchester United'), p('Yassine Bounou', 1, 'Goalkeeper', 'Al Hilal'), p('Noussair Mazraoui', 3, 'Defender', 'Bayern Munich')],
    worldCupTitles: 0, bestResult: 'Semi-finals (2022)',
    group: 'Group C',
    fixtures: [f('Brazil', '2026-06-13', '20:00', 'AT&T Stadium'), f('Scotland', '2026-06-19', '15:00', 'SoFi Stadium'), f('Haiti', '2026-06-24', '15:00', 'MetLife Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 16, '2022 semi-finalists. Hakimi and Amrabat spine is world class. Africa rising.'), ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 14, 'Defensive organization elite. Counter-attacking football at its finest.')],
  },
  'haiti': {
    name: 'Haiti', flag: '🇭🇹', code: 'HAI', ranking: 80,
    coach: 'Gabriel Calderon', coachNationality: 'Argentine',
    keyPlayers: [p('Duckens Nazon', 9, 'Striker'), p('Frantzdy Pierrot', 11, 'Forward'), p('Johnny Placide', 1, 'Goalkeeper')],
    squad: [p('Duckens Nazon', 9, 'Striker', 'CSKA Sofia'), p('Frantzdy Pierrot', 11, 'Forward', 'Maccabi Haifa'), p('Johnny Placide', 1, 'Goalkeeper', 'GFC Ajaccio'), p('Carlens Arcus', 2, 'Defender', 'Vitesse')],
    worldCupTitles: 0, bestResult: 'First appearance (2026)',
    group: 'Group C',
    fixtures: [f('Scotland', '2026-06-13', '18:00', 'Lincoln Financial Field'), f('Brazil', '2026-06-18', '18:00', 'Mercedes-Benz Stadium'), f('Morocco', '2026-06-24', '15:00', 'MetLife Stadium')],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 5, 'First World Cup appearance. Underdogs with nothing to lose.')],
  },
  'scotland': {
    name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO', ranking: 42,
    coach: 'Steve Clarke', coachNationality: 'Scottish',
    keyPlayers: [p('Andy Robertson', 3, 'Defender'), p('Scott McTominay', 8, 'Midfielder'), p('John McGinn', 7, 'Midfielder')],
    squad: [p('Andy Robertson', 3, 'Defender', 'Liverpool'), p('Scott McTominay', 8, 'Midfielder', 'Manchester United'), p('John McGinn', 7, 'Midfielder', 'Aston Villa'), p('Angus Gunn', 1, 'Goalkeeper', 'Norwich'), p('Kieran Tierney', 6, 'Defender', 'Real Sociedad')],
    worldCupTitles: 0, bestResult: 'Group Stage (1998)',
    group: 'Group C',
    fixtures: [f('Haiti', '2026-06-13', '18:00', 'Lincoln Financial Field'), f('Morocco', '2026-06-19', '15:00', 'SoFi Stadium'), f('Brazil', '2026-06-23', '18:00', "Levi's Stadium")],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 8, 'Premier League quality spine. Robertson crosses and set piece threat.')],
  },

  // ===== GROUP D (USA already exists) =====
  'paraguay': {
    name: 'Paraguay', flag: '🇵🇾', code: 'PAR', ranking: 38,
    coach: 'Guillermo Barros Schelotto', coachNationality: 'Argentine',
    keyPlayers: [p('Miguel Almiron', 10, 'Winger'), p('Julio Enciso', 17, 'Forward'), p('Fabian Balbuena', 5, 'Defender')],
    squad: [p('Miguel Almiron', 10, 'Winger', 'Newcastle'), p('Julio Enciso', 17, 'Forward', 'Brighton'), p('Fabian Balbuena', 5, 'Defender', 'Corinthians'), p('Carlos Coronel', 1, 'Goalkeeper', 'NY Red Bulls')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (2010)',
    group: 'Group D',
    fixtures: [f('USA', '2026-06-12', '20:00', 'SoFi Stadium'), f('Turkey', '2026-06-19', '21:00', 'AT&T Stadium'), f('Australia', '2026-06-24', '18:00', 'Rose Bowl')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 9, 'Almiron creative spark. Defensive tradition gives them a fighting chance.')],
  },
  'australia': {
    name: 'Australia', flag: '🇦🇺', code: 'AUS', ranking: 23,
    coach: 'Graham Arnold', coachNationality: 'Australian',
    keyPlayers: [p('Mathew Ryan', 1, 'Goalkeeper'), p('Ajdin Hrustic', 10, 'Midfielder'), p('Mitchell Duke', 9, 'Striker')],
    squad: [p('Mathew Ryan', 1, 'Goalkeeper', 'AZ Alkmaar'), p('Ajdin Hrustic', 10, 'Midfielder', 'Heerenveen'), p('Mitchell Duke', 9, 'Striker', 'Machida Zelvia'), p('Harry Souttar', 4, 'Defender', 'Leicester'), p('Riley McGree', 7, 'Midfielder', 'Middlesbrough')],
    worldCupTitles: 0, bestResult: 'Round of 16 (2022)',
    group: 'Group D',
    fixtures: [f('Turkey', '2026-06-14', '18:00', "Levi's Stadium"), f('USA', '2026-06-18', '21:00', 'NRG Stadium'), f('Paraguay', '2026-06-24', '18:00', 'Rose Bowl')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 10, 'Physical style suits tournament football. Souttar aerial dominance.')],
  },
  'turkey': {
    name: 'Turkey', flag: '🇹🇷', code: 'TUR', ranking: 29,
    coach: 'Vincenzo Montella', coachNationality: 'Italian',
    keyPlayers: [p('Hakan Calhanoglu', 10, 'Midfielder'), p('Cengiz Under', 9, 'Winger'), p('Merih Demiral', 3, 'Defender')],
    squad: [p('Hakan Calhanoglu', 10, 'Midfielder', 'Inter Milan'), p('Cengiz Under', 9, 'Winger', 'Fenerbahce'), p('Merih Demiral', 3, 'Defender', 'Al Ahli'), p('Ugurcan Cakir', 1, 'Goalkeeper', 'Trabzonspor'), p('Arda Guler', 19, 'Midfielder', 'Real Madrid')],
    worldCupTitles: 0, bestResult: 'Semi-finals (2002)',
    group: 'Group D',
    fixtures: [f('Australia', '2026-06-14', '18:00', "Levi's Stadium"), f('Paraguay', '2026-06-19', '21:00', 'AT&T Stadium'), f('USA', '2026-06-23', '21:00', 'Mercedes-Benz Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 12, 'Calhanoglu midfield maestro. Young talent Guler adds creative spark.')],
  },

  // ===== GROUP E (GER already exists) =====
  'curacao': {
    name: 'Curacao', flag: '🇨🇼', code: 'CUW', ranking: 85,
    coach: 'Remko Bicentini', coachNationality: 'Dutch',
    keyPlayers: [p('Leandro Bacuna', 8, 'Midfielder'), p('Rangelo Janga', 9, 'Striker'), p('Cuco Martina', 2, 'Defender')],
    squad: [p('Leandro Bacuna', 8, 'Midfielder', 'Groningen'), p('Rangelo Janga', 9, 'Striker', 'Astana'), p('Cuco Martina', 2, 'Defender', 'Twente'), p('Eloy Room', 1, 'Goalkeeper', 'Columbus Crew')],
    worldCupTitles: 0, bestResult: 'First appearance (2026)',
    group: 'Group E',
    fixtures: [f('Germany', '2026-06-14', '21:00', 'MetLife Stadium'), f('Ivory Coast', '2026-06-20', '15:00', 'SoFi Stadium'), f('Ecuador', '2026-06-25', '15:00', "Levi's Stadium")],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 4, 'Historic first appearance. Dutch-influenced football style.')],
  },
  'ecuador': {
    name: 'Ecuador', flag: '🇪🇨', code: 'ECU', ranking: 34,
    coach: 'Felix Sanchez', coachNationality: 'Spanish',
    keyPlayers: [p('Moises Caicedo', 23, 'Midfielder'), p('Enner Valencia', 13, 'Striker'), p('Pervis Estupinan', 3, 'Defender')],
    squad: [p('Moises Caicedo', 23, 'Midfielder', 'Chelsea'), p('Enner Valencia', 13, 'Striker', 'Fenerbahce'), p('Pervis Estupinan', 3, 'Defender', 'Brighton'), p('Hernan Galindez', 1, 'Goalkeeper', 'Aucas'), p('Jeremy Sarmiento', 9, 'Forward', 'Ipswich Town')],
    worldCupTitles: 0, bestResult: 'Round of 16 (2006)',
    group: 'Group E',
    fixtures: [f('Ivory Coast', '2026-06-15', '18:00', 'Lincoln Financial Field'), f('Germany', '2026-06-19', '18:00', 'NRG Stadium'), f('Curacao', '2026-06-25', '15:00', "Levi's Stadium")],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 11, 'Caicedo elite midfield presence. Valencia experience vital for knockout push.')],
  },
  'ivory-coast': {
    name: 'Ivory Coast', flag: '🇨🇮', code: 'CIV', ranking: 44,
    coach: 'Jean-Louis Gasset', coachNationality: 'French',
    keyPlayers: [p('Franck Kessie', 8, 'Midfielder'), p('Sebastien Haller', 9, 'Striker'), p('Serge Aurier', 17, 'Defender')],
    squad: [p('Franck Kessie', 8, 'Midfielder', 'Al Ahli'), p('Sebastien Haller', 9, 'Striker', 'Borussia Dortmund'), p('Serge Aurier', 17, 'Defender', 'Nottingham Forest'), p('Yahia Fofana', 1, 'Goalkeeper', 'Angers')],
    worldCupTitles: 0, bestResult: 'Group Stage',
    group: 'Group E',
    fixtures: [f('Ecuador', '2026-06-15', '18:00', 'Lincoln Financial Field'), f('Curacao', '2026-06-20', '15:00', 'SoFi Stadium'), f('Germany', '2026-06-24', '21:00', 'AT&T Stadium')],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 10, 'Kessie midfield power. Haller target man threat. African Cup pedigree.')],
  },

  // ===== GROUP F =====
  'netherlands': {
    name: 'Netherlands', flag: '🇳🇱', code: 'NED', ranking: 7,
    coach: 'Ronald Koeman', coachNationality: 'Dutch',
    keyPlayers: [p('Virgil van Dijk', 4, 'Defender'), p('Frenkie de Jong', 21, 'Midfielder'), p('Memphis Depay', 10, 'Forward')],
    squad: [p('Virgil van Dijk', 4, 'Defender', 'Liverpool'), p('Frenkie de Jong', 21, 'Midfielder', 'Barcelona'), p('Memphis Depay', 10, 'Forward', 'Atletico Madrid'), p('Cody Gakpo', 11, 'Winger', 'Liverpool'), p('Matthijs de Ligt', 3, 'Defender', 'Bayern Munich')],
    worldCupTitles: 0, bestResult: 'Final (1974, 1978, 2010)',
    group: 'Group F',
    fixtures: [f('Japan', '2026-06-14', '18:00', 'Rose Bowl'), f('Sweden', '2026-06-20', '18:00', 'AT&T Stadium'), f('Tunisia', '2026-06-25', '18:00', 'MetLife Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 17, 'Total football revival. van Dijk and de Jong spine world class.'), ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 15, 'Gakpo breakthrough star. Dutch attacking tradition alive and well.')],
  },
  'japan': {
    name: 'Japan', flag: '🇯🇵', code: 'JPN', ranking: 18,
    coach: 'Hajime Moriyasu', coachNationality: 'Japanese',
    keyPlayers: [p('Takefusa Kubo', 10, 'Midfielder'), p('Kaoru Mitoma', 11, 'Winger'), p('Takehiro Tomiyasu', 16, 'Defender')],
    squad: [p('Takefusa Kubo', 10, 'Midfielder', 'Real Sociedad'), p('Kaoru Mitoma', 11, 'Winger', 'Brighton'), p('Takehiro Tomiyasu', 16, 'Defender', 'Arsenal'), p('Daichi Kamada', 9, 'Midfielder', 'Crystal Palace'), p('Zion Suzuki', 1, 'Goalkeeper', 'Urawa Reds')],
    worldCupTitles: 0, bestResult: 'Round of 16 (2018, 2022)',
    group: 'Group F',
    fixtures: [f('Netherlands', '2026-06-14', '18:00', 'Rose Bowl'), f('Tunisia', '2026-06-21', '15:00', 'Lincoln Financial Field'), f('Sweden', '2026-06-26', '15:00', 'SoFi Stadium')],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 13, 'Kubo La Masia creativity. Mitoma dribbling elite. Discipline and technique.')],
  },
  'sweden': {
    name: 'Sweden', flag: '🇸🇪', code: 'SWE', ranking: 26,
    coach: 'Janne Andersson', coachNationality: 'Swedish',
    keyPlayers: [p('Alexander Isak', 9, 'Striker'), p('Dejan Kulusevski', 21, 'Winger'), p('Victor Lindelof', 3, 'Defender')],
    squad: [p('Alexander Isak', 9, 'Striker', 'Newcastle'), p('Dejan Kulusevski', 21, 'Winger', 'Tottenham'), p('Victor Lindelof', 3, 'Defender', 'Manchester United'), p('Robin Olsen', 1, 'Goalkeeper', 'Aston Villa'), p('Emil Forsberg', 10, 'Midfielder', 'RB Leipzig')],
    worldCupTitles: 0, bestResult: 'Final (1958)',
    group: 'Group F',
    fixtures: [f('Tunisia', '2026-06-15', '21:00', 'Mercedes-Benz Stadium'), f('Netherlands', '2026-06-20', '18:00', 'AT&T Stadium'), f('Japan', '2026-06-26', '15:00', 'SoFi Stadium')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 12, 'Isak elite striker. Kulusevski creative wide threat. Physical and organized.')],
  },
  'tunisia': {
    name: 'Tunisia', flag: '🇹🇳', code: 'TUN', ranking: 30,
    coach: 'Jalel Kadri', coachNationality: 'Tunisian',
    keyPlayers: [p('Wahbi Khazri', 10, 'Midfielder'), p('Ellyes Skhiri', 17, 'Midfielder'), p('Aissa Laidouni', 14, 'Midfielder')],
    squad: [p('Wahbi Khazri', 10, 'Midfielder', 'Montpellier'), p('Ellyes Skhiri', 17, 'Midfielder', 'Eintracht Frankfurt'), p('Aissa Laidouni', 14, 'Midfielder', 'Union Berlin'), p('Bechir Ben Said', 1, 'Goalkeeper', 'US Monastir')],
    worldCupTitles: 0, bestResult: 'Group Stage',
    group: 'Group F',
    fixtures: [f('Sweden', '2026-06-15', '21:00', 'Mercedes-Benz Stadium'), f('Japan', '2026-06-21', '15:00', 'Lincoln Financial Field'), f('Netherlands', '2026-06-25', '18:00', 'MetLife Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 8, 'African Cup pedigree. Midfield heavy and defensively disciplined.')],
  },

  // ===== GROUP G =====
  'belgium': {
    name: 'Belgium', flag: '🇧🇪', code: 'BEL', ranking: 15,
    coach: 'Teddy Dom', coachNationality: 'Belgian',
    keyPlayers: [p('Kevin De Bruyne', 7, 'Midfielder'), p('Romelu Lukaku', 9, 'Striker'), p('Jeremy Doku', 11, 'Winger')],
    squad: [p('Kevin De Bruyne', 7, 'Midfielder', 'Manchester City'), p('Romelu Lukaku', 9, 'Striker', 'Chelsea'), p('Jeremy Doku', 11, 'Winger', 'Manchester City'), p('Thibaut Courtois', 1, 'Goalkeeper', 'Real Madrid'), p('Youri Tielemans', 8, 'Midfielder', 'Aston Villa')],
    worldCupTitles: 0, bestResult: 'Semi-finals (2018)',
    group: 'Group G',
    fixtures: [f('Egypt', '2026-06-15', '15:00', 'NRG Stadium'), f('Iran', '2026-06-20', '21:00', "Levi's Stadium"), f('New Zealand', '2026-06-25', '21:00', 'Mercedes-Benz Stadium')],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 16, 'De Bruyne genius. Golden generation final dance. Doku explosive wide threat.')],
  },
  'egypt': {
    name: 'Egypt', flag: '🇪🇬', code: 'EGY', ranking: 35,
    coach: 'Rui Vitoria', coachNationality: 'Portuguese',
    keyPlayers: [p('Mohamed Salah', 10, 'Winger'), p('Mohamed Elneny', 17, 'Midfielder'), p('Ahmed Hegazi', 6, 'Defender')],
    squad: [p('Mohamed Salah', 10, 'Winger', 'Liverpool'), p('Mohamed Elneny', 17, 'Midfielder', 'Arsenal'), p('Ahmed Hegazi', 6, 'Defender', 'Al Ittihad'), p('Mohamed El Shenawy', 1, 'Goalkeeper', 'Al Ahly'), p('Omar Marmoush', 9, 'Forward', 'Eintracht Frankfurt')],
    worldCupTitles: 0, bestResult: 'Group Stage (2018)',
    group: 'Group G',
    fixtures: [f('Belgium', '2026-06-15', '15:00', 'NRG Stadium'), f('New Zealand', '2026-06-21', '18:00', 'MetLife Stadium'), f('Iran', '2026-06-26', '18:00', 'AT&T Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 13, 'Salah world class. Marmoush emerging star. African champions pedigree.')],
  },
  'iran': {
    name: 'Iran', flag: '🇮🇷', code: 'IRN', ranking: 22,
    coach: 'Amir Ghalenoei', coachNationality: 'Iranian',
    keyPlayers: [p('Mehdi Taremi', 9, 'Striker'), p('Sardar Azmoun', 20, 'Forward'), p('Saman Ghoddos', 14, 'Midfielder')],
    squad: [p('Mehdi Taremi', 9, 'Striker', 'Inter Milan'), p('Sardar Azmoun', 20, 'Forward', 'Bayer Leverkusen'), p('Saman Ghoddos', 14, 'Midfielder', 'Brentford'), p('Alireza Beiranvand', 1, 'Goalkeeper', 'Persepolis')],
    worldCupTitles: 0, bestResult: 'Group Stage',
    group: 'Group G',
    fixtures: [f('New Zealand', '2026-06-16', '18:00', 'Rose Bowl'), f('Belgium', '2026-06-20', '21:00', "Levi's Stadium"), f('Egypt', '2026-06-26', '18:00', 'AT&T Stadium')],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 9, 'Taremi-Azmoun strike duo dangerous. Defensive organization trademark.')],
  },
  'new-zealand': {
    name: 'New Zealand', flag: '🇳🇿', code: 'NZL', ranking: 101,
    coach: 'Danny Hay', coachNationality: 'New Zealander',
    keyPlayers: [p('Chris Wood', 9, 'Striker'), p('Ryan Thomas', 8, 'Midfielder'), p('Winston Reid', 2, 'Defender')],
    squad: [p('Chris Wood', 9, 'Striker', 'Nottingham Forest'), p('Ryan Thomas', 8, 'Midfielder', 'PSV'), p('Winston Reid', 2, 'Defender', 'Sporting KC'), p('Oliver Sail', 1, 'Goalkeeper', 'Wellington Phoenix')],
    worldCupTitles: 0, bestResult: 'Group Stage (2010)',
    group: 'Group G',
    fixtures: [f('Iran', '2026-06-16', '18:00', 'Rose Bowl'), f('Egypt', '2026-06-21', '18:00', 'MetLife Stadium'), f('Belgium', '2026-06-25', '21:00', 'Mercedes-Benz Stadium')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 6, 'Wood aerial threat. Underdogs but physical and organized.')],
  },

  // ===== GROUP H =====
  'spain': {
    name: 'Spain', flag: '🇪🇸', code: 'ESP', ranking: 8,
    coach: 'Luis de la Fuente', coachNationality: 'Spanish',
    keyPlayers: [p('Rodri', 16, 'Midfielder'), p('Pedri', 8, 'Midfielder'), p('Alvaro Morata', 7, 'Striker')],
    squad: [p('Rodri', 16, 'Midfielder', 'Manchester City'), p('Pedri', 8, 'Midfielder', 'Barcelona'), p('Alvaro Morata', 7, 'Striker', 'Atletico Madrid'), p('Unai Simon', 1, 'Goalkeeper', 'Athletic Bilbao'), p('Lamine Yamal', 19, 'Winger', 'Barcelona')],
    worldCupTitles: 1, bestResult: 'Champion (2010)',
    group: 'Group H',
    fixtures: [f('Cape Verde', '2026-06-13', '15:00', 'AT&T Stadium'), f('Saudi Arabia', '2026-06-18', '15:00', 'MetLife Stadium'), f('Uruguay', '2026-06-23', '18:00', 'SoFi Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 18, 'Rodri midfield control. Yamal teenage sensation. Tiki-taka evolution.'), ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 16, 'Possession-based dominance. Pedri-Rodri axis unmatched.')],
  },
  'cape-verde': {
    name: 'Cape Verde', flag: '🇨🇻', code: 'CPV', ranking: 73,
    coach: 'Bubista', coachNationality: 'Cape Verdean',
    keyPlayers: [p('Ryan Mendes', 10, 'Winger'), p('Jamiro Monteiro', 8, 'Midfielder'), p('Roberto Lopes', 4, 'Defender')],
    squad: [p('Ryan Mendes', 10, 'Winger', 'Fatih Karagumruk'), p('Jamiro Monteiro', 8, 'Midfielder', 'Philadelphia Union'), p('Roberto Lopes', 4, 'Defender', 'Sheriff Tiraspol'), p('Vozinha', 1, 'Goalkeeper', 'AEL Limassol')],
    worldCupTitles: 0, bestResult: 'First appearance (2026)',
    group: 'Group H',
    fixtures: [f('Spain', '2026-06-13', '15:00', 'AT&T Stadium'), f('Uruguay', '2026-06-19', '18:00', 'Lincoln Financial Field'), f('Saudi Arabia', '2026-06-24', '15:00', "Levi's Stadium")],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 6, 'First appearance. Portuguese-influenced football. Quick and technical.')],
  },
  'saudi-arabia': {
    name: 'Saudi Arabia', flag: '🇸🇦', code: 'KSA', ranking: 54,
    coach: 'Herve Renard', coachNationality: 'French',
    keyPlayers: [p('Salem Al-Dawsari', 10, 'Winger'), p('Salman Al-Faraj', 7, 'Midfielder'), p('Mohammed Al-Owais', 1, 'Goalkeeper')],
    squad: [p('Salem Al-Dawsari', 10, 'Winger', 'Al Hilal'), p('Salman Al-Faraj', 7, 'Midfielder', 'Al Hilal'), p('Mohammed Al-Owais', 1, 'Goalkeeper', 'Al Hilal'), p('Firas Al-Buraikan', 9, 'Striker', 'Al Ahli')],
    worldCupTitles: 0, bestResult: 'Round of 16 (1994)',
    group: 'Group H',
    fixtures: [f('Uruguay', '2026-06-14', '15:00', 'NRG Stadium'), f('Spain', '2026-06-18', '15:00', 'MetLife Stadium'), f('Cape Verde', '2026-06-24', '15:00', "Levi's Stadium")],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 8, 'Al-Dawsari match-winner. Renard tactical organization formidable.')],
  },
  'uruguay': {
    name: 'Uruguay', flag: '🇺🇾', code: 'URU', ranking: 14,
    coach: 'Marcelo Bielsa', coachNationality: 'Argentine',
    keyPlayers: [p('Federico Valverde', 8, 'Midfielder'), p('Darwin Nunez', 9, 'Striker'), p('Ronald Araujo', 4, 'Defender')],
    squad: [p('Federico Valverde', 8, 'Midfielder', 'Real Madrid'), p('Darwin Nunez', 9, 'Striker', 'Liverpool'), p('Ronald Araujo', 4, 'Defender', 'Barcelona'), p('Sergio Rochet', 1, 'Goalkeeper', 'Inter Miami'), p('Facundo Pellistri', 11, 'Winger', 'Manchester United')],
    worldCupTitles: 2, bestResult: 'Champion (1930, 1950)',
    group: 'Group H',
    fixtures: [f('Saudi Arabia', '2026-06-14', '15:00', 'NRG Stadium'), f('Cape Verde', '2026-06-19', '18:00', 'Lincoln Financial Field'), f('Spain', '2026-06-23', '18:00', 'SoFi Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 15, 'Bielsa intensity. Valverde engine. Nunez explosive finisher.')],
  },

  // ===== GROUP I (FRA already exists) =====
  'senegal': {
    name: 'Senegal', flag: '🇸🇳', code: 'SEN', ranking: 20,
    coach: 'Aliou Cisse', coachNationality: 'Senegalese',
    keyPlayers: [p('Sadio Mane', 10, 'Winger'), p('Edouard Mendy', 1, 'Goalkeeper'), p('Kalidou Koulibaly', 3, 'Defender')],
    squad: [p('Sadio Mane', 10, 'Winger', 'Al Nassr'), p('Edouard Mendy', 1, 'Goalkeeper', 'Al Ahli'), p('Kalidou Koulibaly', 3, 'Defender', 'Al Hilal'), p('Idrissa Gueye', 6, 'Midfielder', 'Everton'), p('Nicolas Jackson', 19, 'Striker', 'Chelsea')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (2002)',
    group: 'Group I',
    fixtures: [f('France', '2026-06-11', '21:00', 'Rose Bowl'), f('Norway', '2026-06-17', '21:00', 'SoFi Stadium'), f('Iraq', '2026-06-22', '15:00', 'NRG Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 12, 'African champions. Mane leadership and Jackson emerging talent.')],
  },
  'iraq': {
    name: 'Iraq', flag: '🇮🇶', code: 'IRQ', ranking: 63,
    coach: 'Jesus Casas', coachNationality: 'Spanish',
    keyPlayers: [p('Ali Adnan', 6, 'Defender'), p('Mohanad Ali', 10, 'Striker'), p('Amjad Attwan', 8, 'Midfielder')],
    squad: [p('Ali Adnan', 6, 'Defender', 'Al Shorta'), p('Mohanad Ali', 10, 'Striker', 'Al Shorta'), p('Amjad Attwan', 8, 'Midfielder', 'Al Shorta'), p('Jalal Hassan', 1, 'Goalkeeper', 'Al Shorta')],
    worldCupTitles: 0, bestResult: 'Group Stage (1986)',
    group: 'Group I',
    fixtures: [f('Norway', '2026-06-12', '15:00', "Levi's Stadium"), f('France', '2026-06-16', '15:00', 'Mercedes-Benz Stadium'), f('Senegal', '2026-06-22', '15:00', 'NRG Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 6, 'Resilient team. Casas brings Spanish tactical influence. Defensive discipline.')],
  },
  'norway': {
    name: 'Norway', flag: '🇳🇴', code: 'NOR', ranking: 31,
    coach: 'Stale Solbakken', coachNationality: 'Norwegian',
    keyPlayers: [p('Erling Haaland', 9, 'Striker'), p('Martin Odegaard', 10, 'Midfielder'), p('Oscar Bobb', 17, 'Winger')],
    squad: [p('Erling Haaland', 9, 'Striker', 'Manchester City'), p('Martin Odegaard', 10, 'Midfielder', 'Arsenal'), p('Oscar Bobb', 17, 'Winger', 'Manchester City'), p('Orjan Nyland', 1, 'Goalkeeper', 'Sevilla'), p('Sander Berge', 8, 'Midfielder', 'Burnley')],
    worldCupTitles: 0, bestResult: 'Round of 16 (1998)',
    group: 'Group I',
    fixtures: [f('Iraq', '2026-06-12', '15:00', "Levi's Stadium"), f('Senegal', '2026-06-17', '21:00', 'SoFi Stadium'), f('France', '2026-06-21', '18:00', 'AT&T Stadium')],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 14, 'Haaland record-breaking threat. Odegaard creative genius. Dangerous team.')],
  },

  // ===== GROUP J (ARG already exists) =====
  'algeria': {
    name: 'Algeria', flag: '🇩🇿', code: 'ALG', ranking: 33,
    coach: 'Djamel Belmadi', coachNationality: 'Algerian',
    keyPlayers: [p('Riyad Mahrez', 7, 'Winger'), p('Islam Slimani', 9, 'Striker'), p('Ramy Bensebaini', 4, 'Defender')],
    squad: [p('Riyad Mahrez', 7, 'Winger', 'Al Ahli'), p('Islam Slimani', 9, 'Striker', 'Coritiba'), p('Ramy Bensebaini', 4, 'Defender', 'Borussia Dortmund'), p('Raise Mbolhi', 1, 'Goalkeeper', 'Algerian')],
    worldCupTitles: 0, bestResult: 'Round of 16 (2014)',
    group: 'Group J',
    fixtures: [f('Argentina', '2026-06-11', '18:00', 'Mercedes-Benz Stadium'), f('Jordan', '2026-06-17', '18:00', 'Lincoln Financial Field'), f('Austria', '2026-06-23', '15:00', 'SoFi Stadium')],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 9, 'Mahrez magic. Technical and quick. African flair on the world stage.')],
  },
  'austria': {
    name: 'Austria', flag: '🇦🇹', code: 'AUT', ranking: 36,
    coach: 'Ralf Rangnick', coachNationality: 'German',
    keyPlayers: [p('David Alaba', 10, 'Defender'), p('Marcel Sabitzer', 7, 'Midfielder'), p('Konrad Laimer', 14, 'Midfielder')],
    squad: [p('David Alaba', 10, 'Defender', 'Real Madrid'), p('Marcel Sabitzer', 7, 'Midfielder', 'Borussia Dortmund'), p('Konrad Laimer', 14, 'Midfielder', 'Bayern Munich'), p('Alexander Schlager', 1, 'Goalkeeper', 'LASK'), p('Christoph Baumgartner', 9, 'Forward', 'RB Leipzig')],
    worldCupTitles: 0, bestResult: 'Group Stage',
    group: 'Group J',
    fixtures: [f('Jordan', '2026-06-12', '18:00', 'AT&T Stadium'), f('Argentina', '2026-06-16', '21:00', 'NRG Stadium'), f('Algeria', '2026-06-23', '15:00', 'SoFi Stadium')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 10, 'Rangnick gegenpressing. Alaba leadership. Sabitzer midfield engine.')],
  },
  'jordan': {
    name: 'Jordan', flag: '🇯🇴', code: 'JOR', ranking: 70,
    coach: 'Hussein Ammouta', coachNationality: 'Jordanian',
    keyPlayers: [p('Musa Al-Taamari', 10, 'Winger'), p('Yazan Al-Naimat', 9, 'Striker'), p('Baraa Marei', 21, 'Defender')],
    squad: [p('Musa Al-Taamari', 10, 'Winger', 'Montpellier'), p('Yazan Al-Naimat', 9, 'Striker', 'Al Ahli'), p('Baraa Marei', 21, 'Defender', 'Al Faisaly'), p('Yazeed Abu Layla', 1, 'Goalkeeper', 'Al Faisaly')],
    worldCupTitles: 0, bestResult: 'First appearance (2026)',
    group: 'Group J',
    fixtures: [f('Austria', '2026-06-12', '18:00', 'AT&T Stadium'), f('Algeria', '2026-06-17', '18:00', 'Lincoln Financial Field'), f('Argentina', '2026-06-22', '18:00', 'MetLife Stadium')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 5, 'Historic first World Cup. Al-Taamari playmaker. Underdog spirit.')],
  },

  // ===== GROUP K =====
  'portugal': {
    name: 'Portugal', flag: '🇵🇹', code: 'POR', ranking: 6,
    coach: 'Roberto Martinez', coachNationality: 'Spanish',
    keyPlayers: [p('Cristiano Ronaldo', 7, 'Striker'), p('Bruno Fernandes', 8, 'Midfielder'), p('Bernardo Silva', 10, 'Midfielder')],
    squad: [p('Cristiano Ronaldo', 7, 'Striker', 'Al Nassr'), p('Bruno Fernandes', 8, 'Midfielder', 'Manchester United'), p('Bernardo Silva', 10, 'Midfielder', 'Manchester City'), p('Diogo Costa', 1, 'Goalkeeper', 'Porto'), p('Ruben Dias', 3, 'Defender', 'Manchester City')],
    worldCupTitles: 0, bestResult: 'Semi-finals (1966, 2006)',
    group: 'Group K',
    fixtures: [f('DR Congo', '2026-06-13', '21:00', 'NRG Stadium'), f('Uzbekistan', '2026-06-19', '21:00', 'Mercedes-Benz Stadium'), f('Colombia', '2026-06-24', '18:00', 'MetLife Stadium')],
    aiAnalysis: [ai('beckham_chen', 'Beckham Chen', 'BC', 'from-blue-500 to-purple-600', 17, 'Ronaldo final quest. Fernandes creativity. Dias defensive solidity.'), ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 15, 'Midfield depth exceptional. Tactical flexibility under Martinez.')],
  },
  'dr-congo': {
    name: 'DR Congo', flag: '🇨🇩', code: 'COD', ranking: 65,
    coach: 'Sebastien Desabre', coachNationality: 'French',
    keyPlayers: [p('Cedric Bakambu', 9, 'Striker'), p('Yoane Wissa', 11, 'Forward'), p('Chancel Mbemba', 22, 'Defender')],
    squad: [p('Cedric Bakambu', 9, 'Striker', 'Galatasaray'), p('Yoane Wissa', 11, 'Forward', 'Brentford'), p('Chancel Mbemba', 22, 'Defender', 'Marseille'), p('Lionel Mpasi', 1, 'Goalkeeper', 'Rodez')],
    worldCupTitles: 0, bestResult: 'Group Stage (1974)',
    group: 'Group K',
    fixtures: [f('Portugal', '2026-06-13', '21:00', 'NRG Stadium'), f('Colombia', '2026-06-20', '18:00', 'NRG Stadium'), f('Uzbekistan', '2026-06-25', '15:00', 'Rose Bowl')],
    aiAnalysis: [ai('batistuta_zhang', 'Batistuta Zhang', 'BZ', 'from-red-500 to-rose-600', 7, 'Powerful and athletic. Bakambu experience. African unpredictability.')],
  },
  'uzbekistan': {
    name: 'Uzbekistan', flag: '🇺🇿', code: 'UZB', ranking: 68,
    coach: 'Srecko Katanec', coachNationality: 'Slovenian',
    keyPlayers: [p('Eldor Shomurodov', 14, 'Striker'), p('Odiljon Khamrobekov', 7, 'Midfielder'), p('Farrukh Sayfiev', 20, 'Defender')],
    squad: [p('Eldor Shomurodov', 14, 'Striker', 'Cagliari'), p('Odiljon Khamrobekov', 7, 'Midfielder', 'Pakhtakor'), p('Farrukh Sayfiev', 20, 'Defender', 'Pakhtakor'), p('Utkir Yusupov', 1, 'Goalkeeper', 'Nasaf')],
    worldCupTitles: 0, bestResult: 'First appearance (2026)',
    group: 'Group K',
    fixtures: [f('Colombia', '2026-06-14', '15:00', 'SoFi Stadium'), f('Portugal', '2026-06-19', '21:00', 'Mercedes-Benz Stadium'), f('DR Congo', '2026-06-25', '15:00', 'Rose Bowl')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 5, 'First World Cup. Shomurodov Serie A experience. Organized defense.')],
  },
  'colombia': {
    name: 'Colombia', flag: '🇨🇴', code: 'COL', ranking: 23,
    coach: 'Nestor Lorenzo', coachNationality: 'Argentine',
    keyPlayers: [p('Luis Diaz', 7, 'Winger'), p('Rafael Borre', 9, 'Striker'), p('Davinson Sanchez', 23, 'Defender')],
    squad: [p('Luis Diaz', 7, 'Winger', 'Liverpool'), p('Rafael Borre', 9, 'Striker', 'Internacional'), p('Davinson Sanchez', 23, 'Defender', 'Galatasaray'), p('James Rodriguez', 10, 'Midfielder', 'Sao Paulo'), p('David Ospina', 1, 'Goalkeeper', 'Al Nassr')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (2014)',
    group: 'Group K',
    fixtures: [f('Uzbekistan', '2026-06-14', '15:00', 'SoFi Stadium'), f('DR Congo', '2026-06-20', '18:00', 'NRG Stadium'), f('Portugal', '2026-06-24', '18:00', 'MetLife Stadium')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 13, 'Diaz explosive wide play. James creative revival. Colombian flair.')],
  },

  // ===== GROUP L (ENG already exists) =====
  'croatia': {
    name: 'Croatia', flag: '🇭🇷', code: 'CRO', ranking: 10,
    coach: 'Zlatko Dalic', coachNationality: 'Croatian',
    keyPlayers: [p('Luka Modric', 10, 'Midfielder'), p('Mateo Kovacic', 8, 'Midfielder'), p('Andrej Kramaric', 9, 'Striker')],
    squad: [p('Luka Modric', 10, 'Midfielder', 'Real Madrid'), p('Mateo Kovacic', 8, 'Midfielder', 'Manchester City'), p('Andrej Kramaric', 9, 'Striker', 'Hoffenheim'), p('Dominik Livakovic', 1, 'Goalkeeper', 'Fenerbahce'), p('Josko Gvardiol', 4, 'Defender', 'Manchester City')],
    worldCupTitles: 0, bestResult: 'Final (2018), Semi-finals (2022)',
    group: 'Group L',
    fixtures: [f('England', '2026-06-11', '15:00', 'AT&T Stadium'), f('Panama', '2026-06-18', '21:00', 'AT&T Stadium'), f('Ghana', '2026-06-23', '18:00', 'Lincoln Financial Field')],
    aiAnalysis: [ai('zidane_gao', 'Zidane Gao', 'ZG', 'from-amber-500 to-orange-600', 14, 'Modric timeless. Gvardiol world class. Knockout specialists again.')],
  },
  'ghana': {
    name: 'Ghana', flag: '🇬🇭', code: 'GHA', ranking: 52,
    coach: 'Chris Hughton', coachNationality: 'Irish',
    keyPlayers: [p('Mohammed Kudus', 10, 'Midfielder'), p('Thomas Partey', 5, 'Midfielder'), p('Inaki Williams', 9, 'Striker')],
    squad: [p('Mohammed Kudus', 10, 'Midfielder', 'West Ham'), p('Thomas Partey', 5, 'Midfielder', 'Arsenal'), p('Inaki Williams', 9, 'Striker', 'Athletic Bilbao'), p('Lawrence Ati-Zigi', 1, 'Goalkeeper', 'St. Gallen')],
    worldCupTitles: 0, bestResult: 'Quarter-finals (2010)',
    group: 'Group L',
    fixtures: [f('Panama', '2026-06-13', '15:00', 'SoFi Stadium'), f('England', '2026-06-17', '15:00', 'Rose Bowl'), f('Croatia', '2026-06-23', '18:00', 'Lincoln Financial Field')],
    aiAnalysis: [ai('ronaldo_silva', 'Ronaldo Silva', 'RS', 'from-yellow-500 to-amber-600', 9, 'Kudus rising star. Partey midfield steel. African giants resurgence.')],
  },
  'panama': {
    name: 'Panama', flag: '🇵🇦', code: 'PAN', ranking: 56,
    coach: 'Thomas Christiansen', coachNationality: 'Danish',
    keyPlayers: [p('Ismael Diaz', 10, 'Forward'), p('Anibal Godoy', 8, 'Midfielder'), p('Harold Cummings', 23, 'Defender')],
    squad: [p('Ismael Diaz', 10, 'Forward', 'Universidad Catolica'), p('Anibal Godoy', 8, 'Midfielder', 'Nashville SC'), p('Harold Cummings', 23, 'Defender', 'Independiente'), p('Luis Mejia', 1, 'Goalkeeper', 'Maccabi Haifa')],
    worldCupTitles: 0, bestResult: 'Group Stage (2018)',
    group: 'Group L',
    fixtures: [f('Ghana', '2026-06-13', '15:00', 'SoFi Stadium'), f('Croatia', '2026-06-18', '21:00', 'AT&T Stadium'), f('England', '2026-06-22', '21:00', 'Mercedes-Benz Stadium')],
    aiAnalysis: [ai('shearer_zhang', 'Shearer Zhang', 'SZ', 'from-green-500 to-emerald-600', 5, 'CONCACAF representatives. Physical and determined. Defensive organization.')],
  },
}
