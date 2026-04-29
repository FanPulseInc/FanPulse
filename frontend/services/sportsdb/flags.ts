// Country name → flag emoji. TheSportsDB returns `strNationality` as a free-text
// country name ("Netherlands", "Côte d'Ivoire", "England"…). We map the names
// we actually see in football lineups to ISO-3166 alpha-2 codes, then convert
// the ISO code into a regional-indicator flag emoji at render time.
//
// Coverage targets the common football nations; unknown countries return the
// raw name so the UI still shows SOMETHING useful instead of a blank slot.
const NAME_TO_ISO: Record<string, string> = {
    "afghanistan": "AF",
    "albania": "AL",
    "algeria": "DZ",
    "angola": "AO",
    "argentina": "AR",
    "armenia": "AM",
    "australia": "AU",
    "austria": "AT",
    "azerbaijan": "AZ",
    "belarus": "BY",
    "belgium": "BE",
    "bolivia": "BO",
    "bosnia and herzegovina": "BA",
    "brazil": "BR",
    "bulgaria": "BG",
    "burkina faso": "BF",
    "cameroon": "CM",
    "canada": "CA",
    "cape verde": "CV",
    "chile": "CL",
    "china": "CN",
    "colombia": "CO",
    "congo": "CG",
    "costa rica": "CR",
    "croatia": "HR",
    "cuba": "CU",
    "cyprus": "CY",
    "czech republic": "CZ",
    "czechia": "CZ",
    "côte d'ivoire": "CI",
    "cote d'ivoire": "CI",
    "ivory coast": "CI",
    "denmark": "DK",
    "dominican republic": "DO",
    "ecuador": "EC",
    "egypt": "EG",
    "england": "GB-ENG",
    "equatorial guinea": "GQ",
    "estonia": "EE",
    "ethiopia": "ET",
    "finland": "FI",
    "france": "FR",
    "gabon": "GA",
    "gambia": "GM",
    "georgia": "GE",
    "germany": "DE",
    "ghana": "GH",
    "greece": "GR",
    "guinea": "GN",
    "guinea-bissau": "GW",
    "haiti": "HT",
    "honduras": "HN",
    "hungary": "HU",
    "iceland": "IS",
    "india": "IN",
    "indonesia": "ID",
    "iran": "IR",
    "iraq": "IQ",
    "ireland": "IE",
    "israel": "IL",
    "italy": "IT",
    "jamaica": "JM",
    "japan": "JP",
    "jordan": "JO",
    "kazakhstan": "KZ",
    "kenya": "KE",
    "kosovo": "XK",
    "latvia": "LV",
    "lebanon": "LB",
    "liberia": "LR",
    "libya": "LY",
    "lithuania": "LT",
    "luxembourg": "LU",
    "madagascar": "MG",
    "mali": "ML",
    "malta": "MT",
    "mexico": "MX",
    "moldova": "MD",
    "montenegro": "ME",
    "morocco": "MA",
    "mozambique": "MZ",
    "netherlands": "NL",
    "new zealand": "NZ",
    "nigeria": "NG",
    "north macedonia": "MK",
    "northern ireland": "GB-NIR",
    "norway": "NO",
    "panama": "PA",
    "paraguay": "PY",
    "peru": "PE",
    "philippines": "PH",
    "poland": "PL",
    "portugal": "PT",
    "qatar": "QA",
    "romania": "RO",
    "russia": "RU",
    "saudi arabia": "SA",
    "scotland": "GB-SCT",
    "senegal": "SN",
    "serbia": "RS",
    "sierra leone": "SL",
    "slovakia": "SK",
    "slovenia": "SI",
    "south africa": "ZA",
    "south korea": "KR",
    "korea republic": "KR",
    "korea dpr": "KP",
    "north korea": "KP",
    "spain": "ES",
    "sweden": "SE",
    "switzerland": "CH",
    "syria": "SY",
    "thailand": "TH",
    "togo": "TG",
    "trinidad and tobago": "TT",
    "tunisia": "TN",
    "turkey": "TR",
    "türkiye": "TR",
    "uganda": "UG",
    "ukraine": "UA",
    "united arab emirates": "AE",
    "united kingdom": "GB",
    "united states": "US",
    "usa": "US",
    "uruguay": "UY",
    "uzbekistan": "UZ",
    "venezuela": "VE",
    "vietnam": "VN",
    "wales": "GB-WLS",
    "zambia": "ZM",
    "zimbabwe": "ZW",
};

function isoToEmoji(iso: string): string {
    if (iso.length !== 2) return "";
    const A = 0x41;
    const BASE = 0x1F1E6;
    const codepoints = iso
        .toUpperCase()
        .split("")
        .map(c => BASE + (c.charCodeAt(0) - A));
    return String.fromCodePoint(...codepoints);
}

// Home-nation (England/Scotland/Wales/NI) flags don't have regional-indicator
// emoji codepoints — they use a tag-sequence (black flag + subdivision tags).
// Not every OS renders them; fall back to the UK flag so we always show
// SOMETHING consistent.
function subdivisionEmoji(iso: string): string {
    const SUBS: Record<string, string> = {
        "GB-ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "GB-SCT": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "GB-WLS": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
        "GB-NIR": "🇬🇧", // no dedicated emoji — use UK
    };
    return SUBS[iso] ?? "";
}

export function countryToFlag(country: string | undefined): string {
    if (!country) return "";
    const key = country.trim().toLowerCase();
    const iso = NAME_TO_ISO[key];
    if (!iso) return "";
    if (iso.startsWith("GB-")) return subdivisionEmoji(iso);
    // Kosovo has no official ISO code / emoji — fall through to empty.
    if (iso === "XK") return "";
    return isoToEmoji(iso);
}
