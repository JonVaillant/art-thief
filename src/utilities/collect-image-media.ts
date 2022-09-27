import { FoundMedia } from "../interfaces/found-media.interface"
import { hasProtocol } from "./integrity"
import { countOffset, getHeightImg, getWidthImg } from "./measurement"

export const collectImageMedia = (topParent: HTMLElement = document.body): FoundMedia[] => {
    const htmlImgMedia: FoundMedia[] = Array.from(topParent.querySelectorAll('img')).map(img => {
        const media: FoundMedia = {
            src: img.getAttribute('src')?.toString() || '',
            posY: countOffset(img),
            width: getWidthImg(img),
            height: getHeightImg(img)
        }

        return media
    })

    const bgImgMedia: FoundMedia[] = Array.from(topParent.querySelectorAll('[style*=background-image]')).filter(el => hasProtocol((el as HTMLElement).style.backgroundImage)).map (el => {
        const bgEl = el as HTMLElement
        
        const media: FoundMedia = {
            src: getBackgroundImageSrc(bgEl),
            posY: countOffset(bgEl),
            width: bgEl.clientWidth,
            height: bgEl.clientHeight
        }

        return media
    })

    const foundMedia: FoundMedia[] = ([] as FoundMedia[]).concat(htmlImgMedia, bgImgMedia).filter(fm => !!fm.src)

    return foundMedia
}

export const getBackgroundImageSrc = (el: HTMLElement) => el.style.backgroundImage.replace('url', '').replace(/\(|\)|"|'|\s/g, '')
