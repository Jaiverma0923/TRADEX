const BASE_URL = "https://www.finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;

export async function finnhubFetch(endpoint : string){
    const response = await fetch(
    `${BASE_URL}${endpoint}&token=${API_KEY}`
  );

  if (!response.ok) {
    console.log(response);
    throw new Error("Finnhub request failed");
  }
  return response.json();
}
