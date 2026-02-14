
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly as a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ticketSchema = {
  type: Type.OBJECT,
  properties: {
    passengers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Full name of the passenger." },
          eTicketNo: { type: Type.STRING, description: "Specific electronic ticket number for this passenger." }
        },
        required: ["name"]
      },
      description: "List of passengers and their specific e-ticket numbers found on the ticket."
    },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          origin: { type: Type.STRING, description: "Departure city/airport code." },
          destination: { type: Type.STRING, description: "Arrival city/airport code." },
          departureDate: { type: Type.STRING, description: "Departure date in YYYY-MM-DD format." },
          departureTime: { type: Type.STRING, description: "Departure time in HH:MM format." },
          arrivalDate: { type: Type.STRING, description: "Arrival date in YYYY-MM-DD format." },
          arrivalTime: { type: Type.STRING, description: "Arrival time in HH:MM format." },
          flightNo: { type: Type.STRING, description: "Flight number, e.g., 'EK651'." }
        },
        required: ["origin", "destination", "departureDate", "departureTime", "arrivalDate", "arrivalTime"]
      },
      description: "List of all flight segments (legs) in the itinerary."
    },
    pnr: {
      type: Type.STRING,
      description: "Passenger Name Record (6-character locator code)."
    },
    issuedDate: {
      type: Type.STRING,
      description: "Date when ticket was issued in YYYY-MM-DD format."
    },
    airlineName: {
      type: Type.STRING,
      description: "Name of the airline company."
    }
  },
  required: ["passengers", "segments", "pnr", "airlineName"]
};

export const extractTicketDetails = async (base64Data: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Extract flight ticket information. Extract ALL flight segments found. For each segment, extract origin, destination, departure date/time, and arrival date/time. Match each passenger with their e-ticket number. Provide details in JSON format." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ticketSchema,
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data extracted from the ticket.");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw error;
  }
};
