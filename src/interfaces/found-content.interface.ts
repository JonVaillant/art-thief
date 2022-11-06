import { FoundArticle } from './found-article.interface'
import { FoundMedia } from './found-media.interface';

export interface FoundContent {
    foundArticle?: FoundArticle,
    foundImageMedia?: FoundMedia
}
