import { FoundArticle } from "./found-article.interface";
import { FoundContent } from './found-content.interface'
import { FoundMedia } from "./found-media.interface";

export interface ResBody extends FoundContent {
    url?: string,
    foundMedia?: FoundMedia,
    foundArticle?: FoundArticle
}
