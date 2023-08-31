export function secondsToTime(seconds: number) {
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);
    let dDisplay = d > 0 ? d + "d " : "";
    let hDisplay = h > 0 ? h + "h " : "";
    let mDisplay = m > 0 ? m + "m " : "";
    let sDisplay = s > 0 ? s + "s" : "0s";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
export function addDefaultSrc(ev: any) {
    ev.target.src = 'https://osu.ppy.sh/images/layout/avatar-guest.png'
}