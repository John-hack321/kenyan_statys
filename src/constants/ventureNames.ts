// Ideas for the venture name. Hosts can tap one, shuffle for another, or write their own.

const ADJECTIVES = ["Bespoke", "Haven", "Golden", "Urban", "Sunrise", "Cosy", "Prime", "Bright", "Serene", "Open Door", "Hearth", "Wanderer"];
const NOUNS = ["Homes", "Stays", "Nest", "Retreats", "Spaces", "Suites", "Lodgings", "Corners"];

const firstWord = (s?: string) => (s ?? "").trim().split(/\s+/)[0] ?? "";

// "Wanjiru" + "Kamau" -> ["Wanjiru Kamau", "Wanjiru's Stays", "Wanjiru's Homes", "Bespoke Homes", ...]
// Their own name comes first: some hosts just want to use it.
export function suggestVentureNames(firstName?: string, lastName?: string): string[] {
    const first = firstWord(firstName);
    const own = first ? [`${first} ${(lastName ?? "").trim()}`.trim(), `${first}'s Stays`, `${first}'s Homes`] : [];
    const general = ["Bespoke Homes", "Haven Stays", "Urban Nest", "Sunrise Retreats"];
    return [...own, ...general].filter((n) => n.length <= 40);
}

// "Surprise me": a new combination each time, never the one already showing
export function randomVentureName(current?: string): string {
    let name = current;
    for (let i = 0; i < 10 && (!name || name === current); i++) {
        name = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
    }
    return name as string;
}
