import { Page } from "playwright-core"

// @IMPORTANT: Due to the way playwright works you can't use document or window

export const getArticle = async (page: Page) => await page.evaluate(() => {
// ## In Open Tag

/**
 * For an element find the element within that is the article container.
 * The paragraphs are not always <p> or all in same container (sections sometimes)
 */
const findArticleContainer = (topParent: HTMLElement = document.body): HTMLElement | null => {
    const textEls = allElsWithText(topParent)
    const elMostText = elWithMostText(textEls)

    if (!elMostText) return null

    const textElsWithinElWithMostText = allElsWithText(elMostText)
    const allVisibleEls = textElsWithinElWithMostText.filter(notInHidden)
    const mostCommonWidth = findMostCommonWidth(allVisibleEls)
    const textElsOfCommonWidth = textElsWithinElWithMostText.filter(te => te.clientWidth === mostCommonWidth)
    const mostCommonDepth = findMostCommonDepth(textElsOfCommonWidth)
    // const greatestDepth = findGreatestDepth(textElsOfCommonWidth)
    const textElsOfCommonDepth = textElsOfCommonWidth.filter(te => getElDepth(te) === mostCommonDepth)
    const shallowestParent = textElsOfCommonDepth[0]?.parentElement || textElsOfCommonWidth[0].parentElement
    // const shallowestParent = getShallowestCommonParent(textElsOfCommonDepth)
    // const shallowestParent = textElsOfCommonWidth[0].parentElement

    console.log('shallowest parent tag', shallowestParent?.tagName)

    // now find shallowest parent
    // by finding from elements of common depth keep getting their parents until there is only 1 parent



    // once you have el with most text you want to dive in and find a pattern
    // e.g. p + p + img + p OR p + div[p + p] + p + p + div[p]
    // could count siblings with text and get average length?

    // keep diving in
    // count length per element (filtering empties)

    // or alternatively look at the X positions to discard sidebars

    // for each text item go up and add the parent to a list
    // merge uniques so only one parent

    // if x elements have same width and x position but are in different containers (parents),
    // then there is a good chance they are associated as part of the same article (sections)

    // if parent has same width as child which has text
    // and the parent has most of the text from the page's most text container...

    // measure all elements with text widths
    // get the unique widths from the set
    // from the uniques determine the most common width

    // possibly, the ideal parent may really be one with the same width as the children

    // return elMostText

    return shallowestParent || elMostText
}

const getShallowestCommonParent = (els: HTMLElement[]): HTMLElement | null => {
    const parents: HTMLElement[] = [...new Set(els.map(el => el?.parentElement))].filter(p => p != null) as HTMLElement[]

    if (parents.length === 0) return null
    if (parents.length === 1) return parents[0]
    
    return getShallowestCommonParent(parents)
}

const notInHidden = (el: HTMLElement): boolean => (el.hidden || el.style.opacity === '0' || el.style.display === 'none') ? false : (el?.parentElement ? notInHidden(el?.parentElement) : true)

/** How many parent levels above this el are there? */
const getElDepth = (el: HTMLElement): number => el?.parentElement ? (1 + getElDepth(el?.parentElement)) : 0

/** Get an object mapping depths to their depth occurrences */
// const findMostCommonDepths = (els: HTMLElement[]): { [key: number]: number } => els.map(el => getElDepth(el)).reduce((a, d) => ({...a, [d]: (a[d] || 0) + 1}), {})

/** Find depth which is most common (highest occurrence) */
const findMostCommonDepth = (els: HTMLElement[]): number => {
    const depthCounts = findMostCommonDepth
    let highestCount: number = 0
    let mostCommonDepth: number = 0

    Object.keys(depthCounts).map(depth => Number(depth)).filter(w => !!w).forEach(depth => {
        const count = depthCounts[depth]
        if (count <= highestCount || depth > mostCommonDepth) return
        highestCount = count
        mostCommonDepth = depth
    });

    return mostCommonDepth
}

// const findGreatestDepth = (els: HTMLElement[]): number => els.map(getElDepth).sort((a, b) => b - a).filter(v => !!v)[0]

/** Get an object mapping widths to their depth occurrences */
const findMostCommonWidths = (els: HTMLElement[]): { [key: number]: number } => els.map(el => el.clientWidth).reduce((a, w) => ({...a, [w]: (a[w] || 0) + 1}), {})

/** Find width which is most common (highest occurrence) */
const findMostCommonWidth = (els: HTMLElement[]): number => {
    const widthCounts = findMostCommonWidths(els)
    let highestCount: number = 0
    let mostCommonWidth: number = 0

    Object.keys(widthCounts).map(width => Number(width)).filter(w => !!w).forEach(width => {
        const count = widthCounts[width]
        if (count <= highestCount || width < mostCommonWidth) return
        highestCount = count
        mostCommonWidth = width
    });

    return mostCommonWidth
}

const allElsWithText = (searchEl: HTMLElement): HTMLElement[] => Array.from(searchEl.querySelectorAll(':not(:empty):not(script)')).filter(el => !!el.textContent) as HTMLElement[]

const elWithMostText = (textEls: HTMLElement[]): HTMLElement | null => {
    const byTextLength = textEls.sort((a, b) => (b.textContent?.length || 0) - (a.textContent?.length || 0))
    return byTextLength.length ? byTextLength[0] : null
}

// const nodeIndex = (els: HTMLElement[],e el: HTMLElement): number => els.indexOf(el)

// const articleText = (articleEl: HTMLElement): string | null => articleEl.textContent

const articleEl = findArticleContainer()

const result = {
    tag: articleEl.tagName,
    cssClass: articleEl.className,
    content: articleEl.textContent
}

return window['outResult'] = result

// ## Out Close Tag
})
