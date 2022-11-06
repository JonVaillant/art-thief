export interface FoundMedia {
    mediaItems: FoundMediaItem[]
}

export interface FoundMediaItem {
    src: string,
    posY: number,
    width: number,
    height: number,
    colors?: string[]
}
