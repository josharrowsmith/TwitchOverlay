//============= Private ==============//
const platformUrl = "https://www.bungie.net/Platform";
const baseUrl = "https://bungie.net";
const membershipType = "3";
const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition";
const characters = " Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/"
const memebershipId = "4611686018487695004";
const character = "2305843009451944152";
const getMainfest = "Manifest";
export const apiKey = ""
//=============== end ==================//

//=================== Public, add more below ========================//

export const nightFalls = [245243710, 3354105309, 3849697860, 2168858559, 1302909043, 3919254032, 3883876601, 13813394, 766116576, 3455414851, 2533203708, 1002842615, 2694576755, 3200108048, 68611398, 54961125, 3726640183, 1358381372, 380956401, 3597372938, 135872558, 3879949581, 2023667984, 2660931443]


export function getMainTheMainfest() {
    return `${platformUrl}/Destiny2/${getMainfest}`;
}

export function activityDefinition(url) {
    return `${baseUrl}/${url}`
}

export function searchPlayer(name) {
    return `${platformUrl}/Destiny2/SearchDestinyPlayer/All/${name}`;
}

export function getCharacters(membershipType, memebershipId) {
    return `${platformUrl}/Destiny2/${membershipType}/Profile/${memebershipId}/?components=100,102,103,200,201,202,205,300,301,304,305,306,307,308`;
}

export function getActivities(membershipType, memebershipId, character, pages) {
    return `${platformUrl}/Destiny2/${membershipType}/Account/${memebershipId}/Character/${character}/Stats/Activities/?mode=ScoredNightfall&count=250&page=${pages}`;
}

export function getItemFromManifest(id) {
    return `${manifestUrl}/${id}`;
}

export function getIcon(link) {
    return `${baseUrl}/${link}`;
}