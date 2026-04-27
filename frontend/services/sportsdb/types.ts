// Subset of TheSportsDB v2 response shapes. Fields that TheSportsDB returns as
// strings-of-numbers are kept as strings here — coerce at the call site when needed.

export interface SDBLiveScore {
    idLiveScore?: string;
    idEvent?: string;
    strSport?: string;
    idLeague?: string;
    strLeague?: string;
    idHomeTeam?: string;
    strHomeTeam?: string;
    idAwayTeam?: string;
    strAwayTeam?: string;
    strHomeTeamBadge?: string | null;
    strAwayTeamBadge?: string | null;
    intHomeScore?: string | null;
    intAwayScore?: string | null;
    strStatus?: string;
    strProgress?: string;
    strEventTime?: string;
    dateEvent?: string;
    updated?: string;
}

export interface SDBEvent {
    idEvent?: string;
    idLeague?: string;
    strLeague?: string;
    strSeason?: string;
    idHomeTeam?: string;
    strHomeTeam?: string;
    idAwayTeam?: string;
    strAwayTeam?: string;
    intHomeScore?: string | null;
    intAwayScore?: string | null;
    strResult?: string | null;
    strHomeTeamBadge?: string | null;
    strAwayTeamBadge?: string | null;
    strThumb?: string | null;
    strVideo?: string | null; // YouTube highlights URL — present after the match ends
    strVenue?: string | null;
    strStatus?: string | null;
    strTimestamp?: string;
    dateEvent?: string;
    strTime?: string;
    strPostponed?: string;
}

export interface SDBTeam {
    idTeam?: string;
    strTeam?: string;
    strTeamBadge?: string | null;
    strTeamLogo?: string | null;
    strCountry?: string;
    strLeague?: string;
    strStadium?: string;
    strManager?: string;
}

export interface SDBLineupPlayer {
    idLineup?: string;
    idEvent?: string;
    idPlayer?: string;
    strPlayer?: string;
    idTeam?: string;
    strTeam?: string;
    strPosition?: string; // "Goalkeeper" | "Defender" | "Midfielder" | "Forward" | "Substitute"
    strFormation?: string;
    intSquadNumber?: string;
    strPlayerThumb?: string | null;
    strCutout?: string | null; // v2: cutout photo URL (preferred over strPlayerThumb)
    strHome?: string; // v1: "1"/"0"   v2: "Yes"/"No"
    strSubstitute?: string; // v1: "1"/"0"   v2: "Yes"/"No"
    strNationality?: string; // country name — populated on v2 lineup rows
    strCountry?: string; // fallback field name some endpoints use
}

export interface SDBEventStat {
    idStatistic?: string;
    idEvent?: string;
    strEvent?: string;
    strStat?: string; // "Shots on Goal", "Ball Possession %", etc.
    intHome?: string;
    intAway?: string;
}

export interface SDBTimelineEvent {
    idTimeline?: string;
    idEvent?: string;
    idTeam?: string;
    idPlayer?: string;
    idAssist?: string;
    intTime?: string; // minute as a numeric string — "56", "90+2"
    strTimeline?: string; // event type: "Goal", "Yellow Card", "Substitute"
    strTimelineDetail?: string; // sub-type: "Penalty", "Own Goal", "Disallowed Goal"
    strPlayer?: string;
    strAssist?: string;
    strHome?: string; // "1"/"0" (v1) or "Yes"/"No" (v2)
}

export interface SDBLeague {
    idLeague?: string;
    strLeague?: string;
    strLeagueAlternate?: string;
    strSport?: string;
    strCountry?: string;
    strBadge?: string | null;
    strLogo?: string | null;
    strCurrentSeason?: string;
}

// Response envelopes. TheSportsDB v2 uses `lookup` as the envelope key for every
// `/lookup/*` endpoint — we tolerate both shapes so v1 fallbacks keep working.
export interface SDBLiveScoreResponse { livescore?: SDBLiveScore[] | null }
export interface SDBLeagueResponse { lookup?: SDBLeague[] | null }
export interface SDBEventsResponse { events?: SDBEvent[] | null; lookup?: SDBEvent[] | null }
export interface SDBScheduleResponse { schedule?: SDBEvent[] | null }
export interface SDBTeamsResponse { teams?: SDBTeam[] | null; lookup?: SDBTeam[] | null }
export interface SDBLineupResponse { lineup?: SDBLineupPlayer[] | null; lookup?: SDBLineupPlayer[] | null }

export interface SDBPlayer {
    idPlayer?: string;
    idTeam?: string;
    strPlayer?: string;
    strTeam?: string;
    strSport?: string;
    strPosition?: string;
    strNumber?: string;
    strNationality?: string;
    strThumb?: string | null;
    strCutout?: string | null;
    strRender?: string | null;
}

export interface SDBTeamPlayersResponse {
    player?: SDBPlayer[] | null;
    list?: SDBPlayer[] | null;
}
export interface SDBStatsResponse { statistics?: SDBEventStat[] | null; lookup?: SDBEventStat[] | null }
export interface SDBTimelineResponse { timeline?: SDBTimelineEvent[] | null; lookup?: SDBTimelineEvent[] | null }
