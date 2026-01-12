import {type Artwork, type ArtworkApiResponse} from "../types/Artwork";

export const fetchArtworks = async (
    page: number,
    limit: number
): Promise <ArtworkApiResponse> =>{
    const response = await fetch (
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`
    )

    if(!response.ok) {
        throw new Error ('Failed to fetch artworks')
    }
    return response.json()
};