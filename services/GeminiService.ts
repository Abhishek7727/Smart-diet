import { GoogleGenerativeAI } from "@google/generative-ai";

interface PersonalInfo {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  goal: string;
  dietaryRestrictions: string[];
  allergies: string[];
  targetCalories: string; // Calculated automatically based on user data
}

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private apiKey: string | null = null;

  constructor() {
    // Don't initialize with a placeholder key
    // The API key will be set when needed
  }

  setApiKey(apiKey: string) {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API key is required");
    }

    this.apiKey = apiKey.trim();
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async smartDataFill(
    mealName: string,
    apiKey?: string,
  ) : Promise<any> {
    try {
      if (!this.apiKey || !this.model) {
        try {
          if(apiKey)
          {
            this.setApiKey(apiKey);
          }
        } catch(err)
        {
          console.log(err);
          throw new Error(
            "API key not configured. Please set your Gemini API key in Settings."
          );
        }
      }

      const prompt = `You are a professional nutritionist and chef specializing in healthy Indian cuisine. 
      You have to identify rough estimate of the nutritional values of the given dish in double quotes "${mealName}" in the provided
      response format. Try to give same and consistant result if you are provided with same dish/food item.
      Consistency is the key.

      IMPORTANT:
      - don't overestimate, give a rough estimated nutritional value for given recipie / dist / food item.
      - give output in required format only.

      REQUIREMENTS:
      1. If weight or serving size is also given as part of dish name, consider that and give nutritional value.
      2. If only dish name or food item name is provided, assume it is made for only 1 serving and give the nutritional values accordingly.
      3. If unable to estimate give default values as "0" to all fields given in required format.

RESPONSE FORMAT:
Return a JSON  data in this format only:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
    }

Example for yogurt:
  {
    "calories": 320,
    "protein": 18,
    "carbs": 25,
    "fat": 12,
    }

  Example got egg:
  {
   "calories": 100,
    "protein": 12,
    "carbs": 21,
    "fat": 13,
    }

Only return the JSON  data (without even mentioning JSON in response, just return a json object), no additional text.`;

      const parseData = (str: string) => {
        const jsonMatch = str.match(/\{[\s\S]*?\}/);
        if(!jsonMatch) return {calories: "0", protein: "0", carbs: "0", fat: "0"};
        try{
            const parsed = JSON.parse(jsonMatch[0]);
            return {
          calories:  `${parseInt(parsed.calories)}` || "0",
          protein:`${parseInt(parsed.protein)}` || "0",
          carbs: `${parseInt(parsed.carbs)}` || "0",
          fat: `${parseInt(parsed.fat)}` || "0",
        };
        } catch(err)
        {
          console.log(err);
          return {calories: "0", protein: "0", carbs: "0", fat: "0"};
        }
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsedResponse = parseData(text);
      return parsedResponse;
      } catch (error) {
      console.error("Error generating meal recommendations:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          throw error;
        }

        // Handle model overload or service unavailable errors
        if (
          error.message.includes("overloaded") ||
          error.message.includes("503") ||
          error.message.includes("service unavailable") ||
          error.message.includes("quota exceeded")
        ) {
          throw new Error(
            "AI service is currently busy. Please try again in a few minutes, or use fallback recommendations."
          );
        }
      }

      // For other errors, return fallback recommendations
      return {calories: "0", protein: "0", carbs: "0", fat: "0"};
    }
  }

  async generateMealRecommendations(
    personalInfo: PersonalInfo,
    mealType: string,
    currentMeals: any[] = []
  ): Promise<FoodItem[]> {
    try {
      // Check if API key is set
      if (!this.apiKey || !this.model) {
        throw new Error(
          "API key not configured. Please set your Gemini API key in Settings."
        );
      }

      const prompt = this.buildPrompt(personalInfo, mealType, currentMeals);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error("Error generating meal recommendations:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          throw error;
        }

        // Handle model overload or service unavailable errors
        if (
          error.message.includes("overloaded") ||
          error.message.includes("503") ||
          error.message.includes("service unavailable") ||
          error.message.includes("quota exceeded")
        ) {
          throw new Error(
            "AI service is currently busy. Please try again in a few minutes, or use fallback recommendations."
          );
        }
      }

      // For other errors, return fallback recommendations
      return this.getFallbackRecommendations(mealType);
    }
  }

  private buildPrompt(
    personalInfo: PersonalInfo,
    mealType: string,
    currentMeals: any[]
  ): string {
    const currentNutrition = this.calculateCurrentNutrition(currentMeals);
    const remainingCalories =
      parseInt(personalInfo.targetCalories) - currentNutrition.calories;

    // Map meal types to more descriptive names
    const mealTypeDescriptions = {
      breakfast: "breakfast (morning meal)",
      lunch: "lunch (midday meal)",
      dinner: "dinner (evening meal)",
      snacks: "snack (light meal between main meals)",
    };

    const mealDescription =
      mealTypeDescriptions[mealType as keyof typeof mealTypeDescriptions] ||
      mealType;

    return `You are a professional nutritionist and chef specializing in healthy Indian cuisine. Generate exactly 5 personalized meal recommendations for ${mealDescription} based on the following user profile.
    
IMPORTANT: 
- Generate strictly traditional Indian household dishes commonly cooked in Indian homes.
- Only generate recommendations for ${mealDescription}. Do NOT include recommendations for other meal types like breakfast, lunch, dinner, or snacks unless specifically requested.
- Ensure the dishes are healthy, balanced, and fit the user's calorie requirements.

USER PROFILE:
- Name: ${personalInfo.name}
- Age: ${personalInfo.age} years old
- Gender: ${personalInfo.gender}
- Weight: ${personalInfo.weight} kg
- Height: ${personalInfo.height} cm
- Activity Level: ${personalInfo.activityLevel}
- Goal: ${personalInfo.goal}
- Target Calories: ${personalInfo.targetCalories} calories/day
- Dietary Restrictions: ${personalInfo.dietaryRestrictions.join(", ") || "None"}
- Allergies: ${personalInfo.allergies.join(", ") || "None"}

CURRENT NUTRITION TODAY:
- Calories consumed: ${currentNutrition.calories}
- Protein consumed: ${currentNutrition.protein}g
- Carbs consumed: ${currentNutrition.carbs}g
- Fat consumed: ${currentNutrition.fat}g
- Remaining calories for today: ${remainingCalories}

MEAL TYPE: ${mealDescription}

REQUIREMENTS:
1. Generate exactly 5 meal options for ${mealDescription} ONLY.
2. DISHES MUST BE AUTHENTIC INDIAN HOUSEHOLD MEALS (e.g., Poha, Upma, Dal Chawal, Roti Sabzi, Rajma Chawal, Khichdi, etc.).
3. Each meal must be appropriate for ${mealDescription} timing and context.
4. Consider the user's dietary restrictions and allergies.
5. Ensure meals align with their fitness goal.
6. Consider remaining daily calories and nutrition needs.
7. Make meals realistic and easy to prepare in an Indian kitchen.
8. Include nutritional information for each meal.
9. Focus only on ${mealDescription} - do not mix with other meal types.

RESPONSE FORMAT:
Return a JSON array with exactly 5 objects, each containing:
{
  "id": "unique_id",
  "name": "Meal Name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "category": "${mealType}"
}

Example for breakfast:
[
  {
    "id": "breakfast_1",
    "name": "Greek Yogurt with Berries and Nuts",
    "calories": 320,
    "protein": 18,
    "carbs": 25,
    "fat": 12,
    "category": "breakfast"
  }
]

Example for lunch:
[
  {
    "id": "lunch_1",
    "name": "Grilled Chicken Salad",
    "calories": 350,
    "protein": 25,
    "carbs": 15,
    "fat": 18,
    "category": "lunch"
  }
]

Only return the JSON array, no additional text.`;
  }

  private calculateCurrentNutrition(meals: any[]): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } {
    return meals.reduce(
      (total, meal) => {
        if (meal.food) {
          total.calories += meal.food.calories;
          total.protein += meal.food.protein;
          total.carbs += meal.food.carbs;
          total.fat += meal.food.fat;
        }
        return total;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

  private parseAIResponse(response: string): FoodItem[] {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: any, index: number) => ({
          id: item.id || `ai_meal_${Date.now()}_${index}`,
          name: item.name,
          calories: parseInt(item.calories) || 0,
          protein: parseInt(item.protein) || 0,
          carbs: parseInt(item.carbs) || 0,
          fat: parseInt(item.fat) || 0,
          category: item.category || "general",
        }));
      }
      throw new Error("No valid JSON found in response");
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return this.getFallbackRecommendations("general");
    }
  }

  private getFallbackRecommendations(mealType: string): FoodItem[] {
    const fallbackMeals = {
      breakfast: [
        {
          name: "Vegetable Poha with Peanuts",
          calories: 280,
          protein: 6,
          carbs: 45,
          fat: 8,
        },
        {
          name: "Rava Upma with Mixed Veggies",
          calories: 250,
          protein: 7,
          carbs: 40,
          fat: 7,
        },
        {
          name: "Besan Chilla with Mint Chutney",
          calories: 220,
          protein: 12,
          carbs: 25,
          fat: 8,
        },
        {
          name: "Moong Dal Cheela",
          calories: 200,
          protein: 14,
          carbs: 22,
          fat: 6,
        },
        {
          name: "Multigrain Paratha with Curd",
          calories: 320,
          protein: 10,
          carbs: 45,
          fat: 12,
        },
      ],
      lunch: [
        {
          name: "Dal Tadka with Brown Rice and Salad",
          calories: 350,
          protein: 14,
          carbs: 55,
          fat: 8,
        },
        {
          name: "Roti with Mix Veg Sabzi and Dal",
          calories: 380,
          protein: 12,
          carbs: 50,
          fat: 14,
        },
        {
          name: "Rajma Chawal (Kidney Beans Curry)",
          calories: 420,
          protein: 18,
          carbs: 60,
          fat: 12,
        },
        {
          name: "Paneer Bhurji with 2 Chapatis",
          calories: 400,
          protein: 22,
          carbs: 35,
          fat: 18,
        },
        {
          name: "Chana Masala with Jeera Rice",
          calories: 380,
          protein: 16,
          carbs: 55,
          fat: 10,
        },
      ],
      dinner: [
        {
          name: "Moong Dal Khichdi with Ghee",
          calories: 320,
          protein: 12,
          carbs: 45,
          fat: 10,
        },
        {
          name: "Roti with Palak Paneer",
          calories: 350,
          protein: 18,
          carbs: 30,
          fat: 18,
        },
        {
          name: "Grilled Paneer Salad",
          calories: 280,
          protein: 20,
          carbs: 15,
          fat: 16,
        },
        {
          name: "Oats Khichdi with Vegetables",
          calories: 300,
          protein: 10,
          carbs: 45,
          fat: 8,
        },
        {
          name: "Lauki Kofta Curry with 1 Roti",
          calories: 250,
          protein: 8,
          carbs: 30,
          fat: 12,
        },
      ],
      snacks: [
        {
          name: "Roasted Makhana (Fox Nuts)",
          calories: 120,
          protein: 4,
          carbs: 20,
          fat: 3,
        },
        {
          name: "Sprouts Chaat",
          calories: 150,
          protein: 8,
          carbs: 25,
          fat: 2,
        },
        {
          name: "Masala Corn",
          calories: 180,
          protein: 5,
          carbs: 30,
          fat: 5,
        },
        {
          name: "Dhokla (2 pieces)",
          calories: 160,
          protein: 6,
          carbs: 25,
          fat: 5,
        },
        {
          name: "Buttermilk (Chaas) with Masala",
          calories: 60,
          protein: 4,
          carbs: 6,
          fat: 2,
        },
      ],
    };

    const meals =
      fallbackMeals[mealType as keyof typeof fallbackMeals] ||
      fallbackMeals.breakfast;

    return meals.map((meal, index) => ({
      id: `fallback_${mealType}_${index}`,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      category: mealType,
    }));
  }

  // Check if API key is configured
  isApiKeyConfigured(): boolean {
    return !!this.apiKey && !!this.model;
  }

  // Get the current API key (for debugging)
  getApiKey(): string | null {
    return this.apiKey;
  }
}

export default new GeminiService();
