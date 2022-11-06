import { Page } from "playwright-core"
import { FoundMedia, FoundMediaItem } from "../interfaces/found-media.interface"

export const getImageMedia = async (page: Page) => page.evaluate(() => {
    // ## In Open Tag
    const collectImageMedia = (topParent: HTMLElement = document.body): FoundMediaItem[] => {
        const htmlImgMedia: FoundMediaItem[] = Array.from(topParent.querySelectorAll('img')).map(img => {
            const media: FoundMediaItem = {
                src: img.getAttribute('src')?.toString() || '',
                posY: countOffset(img),
                width: getWidthImg(img),
                height: getHeightImg(img)
            }
    
            return media
        })
    
        const bgImgMedia: FoundMediaItem[] = Array.from(topParent.querySelectorAll('[style*=background-image]')).filter(el => hasProtocol((el as HTMLElement).style.backgroundImage)).map(el => {
            const bgEl = el as HTMLElement
            
            const media: FoundMediaItem = {
                src: getBackgroundImageSrc(bgEl),
                posY: countOffset(bgEl),
                width: bgEl.clientWidth,
                height: bgEl.clientHeight
            }
    
            return media
        })
    
        const foundMedia: FoundMediaItem[] = ([] as FoundMediaItem[]).concat(htmlImgMedia, bgImgMedia).filter(fm => !!fm.src)
    
        return foundMedia
    }
    
    const getBackgroundImageSrc = (el: HTMLElement) => el.style.backgroundImage.replace('url', '').replace(/\(|\)|"|'|\s/g, '')
    
    const countOffset = (targetElement: HTMLElement): number => {
        let currentElement: HTMLElement | null = targetElement
        let currentOffset: number = 0
    
        while (currentElement !== null) {
            currentOffset += currentElement.offsetTop
            currentElement = currentElement.parentElement
        }
    
        return currentOffset
    }
    
    const getWidthImg = (img: HTMLImageElement) => (img.naturalWidth || img.clientWidth)
    const getHeightImg = (img: HTMLImageElement) => (img.naturalHeight || img.clientHeight)
   
    const hasProtocol = (str: string): boolean => str.includes('//')

    const result: FoundMedia  = {
        mediaItems: collectImageMedia()
    }

    return window['foundImageMedia'] = result
    // ## Out Close Tag
})
