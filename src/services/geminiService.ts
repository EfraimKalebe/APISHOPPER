import axios from 'axios';

const extractValueFromImage = async (image: string): Promise<number> => {
  try {
    const response = await axios.post(
      "https://m.media-amazon.com/images/I/518j3NEZ0lL._AC_UF894,1000_QL80_.jpg",
      { image },
      { headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` } }
    );

    return response.data.value; // Assumindo que a API retorna um campo "value"
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to extract value from image');
  }
};

export default { extractValueFromImage };
