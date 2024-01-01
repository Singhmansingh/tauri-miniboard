export type Track = {
    trackid: number,
    tracktitle: string,
    trackurl: string,
    trackimg?: string
}

export type TrackListType = {
    tracks:Array<Track>,
    platform?:"youtube" | "spotify",
    listname?:string
}
