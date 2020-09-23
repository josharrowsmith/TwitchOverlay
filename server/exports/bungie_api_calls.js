//============= Private ==============//
const platformUrl = "https://www.bungie.net/Platform";
const baseUrl = "https://bungie.net";
const membershipType = "3";
const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition";
const memebershipId = "";
const character = "";
export const apiKey = ""
//=============== end ==================//

//=================== Public, add more below ========================//
export function getActivities() {
    return `${platformUrl}/Destiny2/${membershipType}/Account/${memebershipId}/Character/${character}/Stats/Activities/`;
}

export function getItemFromManifest(id) {
    return `${manifestUrl}/${id}`;
}

export function getIcon(link) {
    return `${baseUrl}/${link}`;
}