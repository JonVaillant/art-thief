export const countOffset = (targetElement: HTMLElement): number => {
    let currentElement: HTMLElement | null = targetElement
    let currentOffset: number = 0

    while (currentElement !== null) {
        currentOffset += currentElement.offsetTop
        currentElement = currentElement.parentElement
    }

    return currentOffset
}

export const getWidthImg = (img: HTMLImageElement) => (img.naturalWidth || img.clientWidth)
export const getHeightImg = (img: HTMLImageElement) => (img.naturalHeight || img.clientHeight)
