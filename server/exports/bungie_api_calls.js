//============= Private ==============//
const platformUrl = "https://www.bungie.net/Platform";
const baseUrl = "https://bungie.net";
const membershipType = "3";
const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition";
const characters = " Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/"
const memebershipId = "";
const character = "";
export const apiKey = ""
//=============== end ==================//

//=================== Public, add more below ========================//

export function searchPlayer(name) {
    return `${platformUrl}/Destiny2/SearchDestinyPlayer/All/${name}`;
}

export function getCharacters(membershipType, memebershipId) {
    return `${platformUrl}/Destiny2/${membershipType}/Profile/${memebershipId}/?components=100,102,103,200,201,202,205,300,301,304,305,306,307,308`;
}

export function getActivities(membershipType, memebershipId, character) {
    return `${platformUrl}/Destiny2/${membershipType}/Account/${memebershipId}/Character/${character}/Stats/Activities/`;
}

export function getItemFromManifest(id) {
    return `${manifestUrl}/${id}`;
}

export function getIcon(link) {
    return `${baseUrl}/${link}`;
}