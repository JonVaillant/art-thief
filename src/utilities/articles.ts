import { Page } from "playwright-core"
import { FoundArticle } from '../interfaces/found-article.interface'

// @IMPORTANT: Due to the way playwright works you can't use document or window

export const getArticle = async (page: Page) => await page.evaluate(() => {
    // ## In Open Tag

    /**
     * For an element find the element within that is the article container.
     * The paragraphs are not always <p> or all in same container (section-containers sometimes)
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
        // const shallowestParent = textElsOfCommonDepth[0]?.parentElement || textElsOfCommonWidth[0].parentElement // <-- this works really well often
        const shallowestParent = getShallowestCommonParentAlt(textElsOfCommonDepth)
        // const shallowestParent = textElsOfCommonWidth[0].parentElement

        // We want the shallowest parent element, as it contains mostly/only the text we want.
        // Shallowest parent is found by finding from elements of common depth that match criteria
        // the parent which contains most of them.
        // By doing this we handle when all p's are in same el and when they are split into sections etc
        // e.g. p + p + img + p OR p + div[p + p] + p + p + div[p]

        return shallowestParent || elMostText
    }

    // const getShallowestCommonParent = (els: HTMLElement[]): HTMLElement | null => {
    //     const parents: HTMLElement[] = [...new Set(els.map(el => el?.parentElement))].filter(p => p != null) as HTMLElement[]

    //     if (parents.length === 0) return null
    //     if (parents.length === 1) return parents[0]
        
    //     return getShallowestCommonParent(parents)
    // }

    /**
     * Takes some elements on same level and traverses up the tree until **most** of them are present.
     * Remaining elements may be banners or related content around the actual content (unless mistake).
     * @param bottomEls Elements on same level (often `<p>`). At or near greatest depth in content.
     */
    const getShallowestCommonParentAlt = (bottomEls: HTMLElement[], attempt = 0) => {
        if (attempt > 3) return bottomEls[Math.round(bottomEls.length / 2)]
        const bottomElWithSuitableParent = bottomEls.find(el => parentContains(bottomEls, el?.parentElement))
        return bottomElWithSuitableParent ? bottomElWithSuitableParent.parentElement : getShallowestCommonParentAlt(bottomEls.map(el => el?.parentElement), attempt + 1)
    }

    const parentContains = (children: HTMLElement[], parent: HTMLElement): boolean => {
        const sameParent: number = children.reduce((acc, chi) => acc += parent.contains(chi) ? 1 : 0, 0)
        const result: boolean = (sameParent / children.length) >= 0.7
        return result
    }

    const notInHidden = (el: HTMLElement): boolean => (el.hidden || el.style.opacity === '0' || el.style.display === 'none') ? false : (el?.parentElement ? notInHidden(el?.parentElement) : true)

    /** How many parent levels above this el are there? */
    const getElDepth = (el: HTMLElement): number => el?.parentElement ? (1 + getElDepth(el?.parentElement)) : 0

    /** Get an object mapping depths to their depth occurrences */
    const findMostCommonDepths = (els: HTMLElement[]): { [key: number]: number } => els.map(el => getElDepth(el)).reduce((a, d) => ({...a, [d]: (a[d] || 0) + 1}), {})

    /** Find depth which is most common (highest occurrence) */
    const findMostCommonDepth = (els: HTMLElement[]): number => {
        const depthCounts: { [key: number]: number } = findMostCommonDepths(els)
        let highestCount: number = 0
        let mostCommonDepth: number = 0

        Object.keys(depthCounts).map(depth => Number(depth)).filter(w => !!w).forEach(depth => {
            const count = depthCounts[depth]
            if (count <= highestCount || depth < mostCommonDepth) return
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
        const widthCounts: { [key: number]: number } = findMostCommonWidths(els)
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

    const paragraphLikeExp = new RegExp(/[\w| |.|,|&]{30,}\W/g)
    const hasMeatyParagraphs = (textContent: string): boolean => (textContent.match(paragraphLikeExp)?.length || 0) > 3

    /** Clean el and return innerHTML string. Modifies el passed in. */
    const getPureHtml = (el: HTMLElement): string => {
        el.querySelectorAll('script').forEach(s => s.remove())
        el.querySelectorAll('*').forEach(c => {
            c.removeAttribute('class')
            c.removeAttribute('style')
            c.removeAttribute('id')
        })

        return el.innerHTML
    }

    const articleEl = findArticleContainer()

    const htmlText = getPureHtml(articleEl)

    const result: FoundArticle = {
        tag: articleEl.tagName,
        cssClass: articleEl.className,
        content: articleEl.textContent,
        html: htmlText,
        confidenceArticle: articleEl.textContent.length > 300 && hasMeatyParagraphs(articleEl.textContent)
    }

    return window['foundArticle'] = result

    // ## Out Close Tag
})
