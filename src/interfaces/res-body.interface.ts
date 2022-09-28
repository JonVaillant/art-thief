import { FoundArticle } from "./found-article.interface";
import { FoundMedia } from "./found-media.interface";

export interface ResBody {
    url?: string,
    foundMedia?: FoundMedia,
    foundArticle?: FoundArticle
}
