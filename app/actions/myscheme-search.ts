"use server";

import { WebSearchResults, WebSearchResultItem } from '../../utils/types';
import * as cheerio from 'cheerio';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID;

const SEARCH_DOMAIN = 'myscheme.gov.in';

/**
 * Performs a web search using Google Custom Search API, restricted to a specific domain.
 * @param query The search query string.
 * @returns A promise that resolves to WebSearchResults.
 */
export async function performMySchemeSearch(query: string): Promise<WebSearchResults> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX_ID) {
    console.error('Google API Key or CX ID is not configured.');
    return {
      success: false,
      error: 'Search service is not configured. Please contact support.',
    };
  }

  if (!query) {
    return {
      success: false,
      error: 'Search query cannot be empty.',
    };
  }

  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(query)}&num=5`; // Fetch top 3 results

  console.log(`Performing Google search for: "${query}" on ${SEARCH_DOMAIN}`);
  console.log(searchUrl);

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Search API request failed:', errorData);
      throw new Error(errorData.error?.message || 'Google Search API request failed');
    }

    const rawResults = await response.json();

    if (!rawResults.items || rawResults.items.length === 0) {
      return {
        success: true,
        data: [], // No results found
      };
    }

    let items: WebSearchResultItem[] = rawResults.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    // Fetch page content for the top 2 results
    const contentFetchPromises = items.map(async (item) => {
      try {
        console.log(`Fetching content for: ${item.link}`);
        const pageResponse = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0' } }); // Add User-Agent
        if (!pageResponse.ok) {
          console.warn(`Failed to fetch content for ${item.link}, status: ${pageResponse.status}`);
          return item; // Return item without pageContent
        }
        const htmlContent = await pageResponse.text();
        const $ = cheerio.load(htmlContent);
        // Basic text extraction from body, removing script/style tags. 
        // This can be refined with more specific selectors if the target site structure is known.
        $('script, style, noscript, iframe, header, footer, nav, aside').remove();
        let pageText = $('body').text() || '';
        pageText = pageText.replace(/\s\s+/g, ' ').trim(); // Clean up whitespace
        
        return { ...item, pageContent: pageText.substring(0, 5000) }; // Limit content length
      } catch (fetchError) {
        console.error(`Error fetching content for ${item.link}:`, fetchError);
        return item; // Return item without pageContent in case of error
      }
    });

    const itemsWithContent = await Promise.all(contentFetchPromises);
    // Replace the original items with those that might have pageContent
    items = itemsWithContent;

    return {
      success: true,
      data: items,
    };

  } catch (error) {
    console.error('Error performing Google search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred during web search.',
    };
  }
}
