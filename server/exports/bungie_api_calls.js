//============= Private ==============//
//=============== end ==================//

//=================== Public, add more below ========================//
export function getActivities(characterType = titan) {
    return `${platformUrl}/Destiny2/${membershipType}/Account/${myMembershipId}/Character/${titan}/Stats/Activities/`;
}

export function getItemFromManifest(id) {
    return `${manifestUrl}/${id}`;
}

export function getIcon(link) {
    return `${baseUrl}/${link}`;
}