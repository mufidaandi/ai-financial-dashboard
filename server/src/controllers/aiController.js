import { GoogleGenAI, Type } from "@google/genai";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import Insight from "../models/Insight.js";
import crypto from "crypto";

// Smart transaction categorization with Gemini AI
export const suggestCategory = async (req, res) => {
    try {
        console.log("AI suggestion request received:", req.body);
        console.log("User ID:", req.user?._id);
        
        const { description, type } = req.body;
        
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }

        // For income transactions, return null (no category needed)
        if (type === "income") {
            return res.json({ 
                suggestedCategory: null, 
                confidence: "high",
                reason: "Income transactions don't require categories" 
            });
        }

        // Get user's existing categories
        const userCategories = await Category.find({ user: req.user._id });
        const categoryNames = userCategories.map(cat => cat.name);

        // If no categories exist, suggest creating some common ones
        if (categoryNames.length === 0) {
            const commonCategories = ["Groceries", "Utilities", "Transportation", "Entertainment", "Shopping"];
            return res.json({ 
                suggestedCategory: null,
                confidence: "medium", 
                reason: "No categories found. Consider creating categories first.",
                suggestedNewCategories: commonCategories
            });
        }

        // Check API key
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY not found");
            return res.status(500).json({ message: "AI service not configured" });
        }

        try {
            // Initialize Gemini AI
            const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            // Create AI prompt for categorization
            const prompt = `
You are a financial AI assistant helping categorize expense transactions.

Transaction Description: "${description}"
Available Categories: ${categoryNames.join(", ")}

Task: Analyze the transaction description and suggest the most appropriate category from the available options.

IMPORTANT: Respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks.

Required JSON format:
{
  "category": "exact category name from the list or null if no good match",
  "confidence": "high|medium|low",
  "reason": "brief explanation why this category fits"
}

Rules:
- Only suggest categories that exist in the available list
- If no category fits well, return null for category
- Be conservative - only suggest "high" confidence for obvious matches
- Keep reason under 50 characters
- Respond ONLY with the JSON object, nothing else
`;

            const result = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            category: {
                                type: Type.STRING,
                                description: "The suggested category name or null if no match"
                            },
                            confidence: {
                                type: Type.STRING,
                                description: "Confidence level: high, medium, or low"
                            },
                            reason: {
                                type: Type.STRING,
                                description: "Brief explanation for the categorization"
                            }
                        },
                        required: ["category", "confidence", "reason"]
                    }
                }
            });
            const text = result.text;

            console.log("Raw AI response:", text);

            // Clean and parse AI response
            let aiResponse;
            try {
                // Remove any markdown code blocks, extra whitespace, or formatting
                let cleanText = text.trim();
                
                // Remove markdown code blocks if present
                cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                
                // Find JSON object in the response
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanText = jsonMatch[0];
                }
                
                console.log("Cleaned response:", cleanText);
                aiResponse = JSON.parse(cleanText);
                
                // Validate required fields
                if (typeof aiResponse !== 'object' || aiResponse === null) {
                    throw new Error("Response is not a valid object");
                }
                
                // Ensure required fields exist with defaults
                aiResponse = {
                    category: aiResponse.category || null,
                    confidence: aiResponse.confidence || "medium",
                    reason: aiResponse.reason || "AI analysis completed"
                };
                
            } catch (error) {
                console.error("AI response parsing error:", error);
                console.error("Raw response:", text);
                
                // Fallback: return a default response instead of failing
                aiResponse = {
                    category: null,
                    confidence: "low",
                    reason: "Unable to parse AI response, please try again"
                };
                
                console.log("Using fallback response:", aiResponse);
            }

            // Validate suggested category exists
            let suggestedCategory = null;
            if (aiResponse.category) {
                const foundCategory = userCategories.find(cat => 
                    cat.name.toLowerCase() === aiResponse.category.toLowerCase()
                );
                if (foundCategory) {
                    suggestedCategory = {
                        _id: foundCategory._id,
                        name: foundCategory.name
                    };
                }
            }

            res.json({
                suggestedCategory,
                confidence: aiResponse.confidence || "medium",
                reason: aiResponse.reason || "AI analysis completed",
                description // Echo back for reference
            });

        } catch (geminiError) {
            console.error("Gemini AI failed:", geminiError.message || geminiError);
            
            // Handle different types of errors with appropriate fallbacks
            if (geminiError.message?.includes("API key not valid")) {
                return res.status(500).json({ 
                    message: "Invalid API key. Please check your Google AI Studio API key.",
                    error: "API_KEY_INVALID"
                });
            } else if (geminiError.message?.includes("404") || geminiError.message?.includes("not found")) {
                return res.status(500).json({ 
                    message: "Model not available. Please check API key permissions.",
                    error: "MODEL_NOT_FOUND"
                });
            } else if (geminiError.message?.includes("overloaded") || geminiError.message?.includes("503") || geminiError.message?.includes("UNAVAILABLE")) {
                // Gemini is overloaded - provide intelligent fallback
                console.log("Gemini overloaded, using fallback categorization");
                
                const fallbackResult = performFallbackCategorization(description, userCategories);
                
                return res.json({
                    suggestedCategory: fallbackResult.category,
                    confidence: "medium",
                    reason: "AI service busy - used pattern matching",
                    fallback: true,
                    description
                });
            } else {
                // For other errors, provide fallback
                console.log("Gemini error, using fallback categorization");
                
                const fallbackResult = performFallbackCategorization(description, userCategories);
                
                return res.json({
                    suggestedCategory: fallbackResult.category,
                    confidence: "low",
                    reason: "AI service unavailable - used basic matching", 
                    fallback: true,
                    description
                });
            }
        }

    } catch (error) {
        console.error("AI categorization error:", error);
        res.status(500).json({ 
            message: "AI categorization failed", 
            error: error.message 
        });
    }
};

// Generate or retrieve cached spending insights
export const getSpendingInsights = async (req, res) => {
    try {
        console.log("Spending insights request received for user:", req.user?._id);
        const { forceRegenerate } = req.query;

        // Get user's transactions (from first transaction to now, not hardcoded 6 months)
        const firstTransaction = await Transaction.findOne({
            user: req.user._id
        }).sort({ date: 1 });

        if (!firstTransaction) {
            return res.json({
                insights: {
                    totalSpent: 0,
                    averageDaily: 0,
                    categoryBreakdown: [],
                    trends: {
                        spendingTrend: "stable",
                        trendPercentage: 0,
                        description: "No transaction data available"
                    },
                    aiRecommendations: [],
                    financialHealthScore: 50,
                    healthFactors: {
                        categoryDiversity: 0,
                        spendingConsistency: 0,
                        budgetAdherence: 0
                    }
                },
                isFromCache: false,
                generatedAt: new Date(),
                message: "Not enough transaction data for meaningful insights"
            });
        }

        const startDate = firstTransaction.date;
        const endDate = new Date();

        // Get all transactions from first transaction to now
        const transactions = await Transaction.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        }).populate('category').sort({ date: -1 });

        console.log(`Found ${transactions.length} transactions for analysis from ${startDate} to ${endDate}`);

        // Create a hash of the transaction data to detect changes
        const transactionData = transactions.map(t => ({
            id: t._id.toString(),
            amount: t.amount,
            category: t.category?.name || 'Uncategorized',
            date: t.date.toISOString(),
            type: t.type
        }));
        const dataHash = crypto.createHash('md5').update(JSON.stringify(transactionData)).digest('hex');

        // Check for existing cached insights
        if (!forceRegenerate) {
            const existingInsight = await Insight.findOne({
                user: req.user._id,
                dataHash: dataHash
            }).sort({ generatedAt: -1 });

            if (existingInsight) {
                console.log("Returning cached insights");
                return res.json({
                    insights: existingInsight.insights,
                    dateRange: existingInsight.dateRange,
                    isFromCache: true,
                    generatedAt: existingInsight.generatedAt,
                    transactionCount: existingInsight.transactionCount
                });
            }
        }

        console.log("Generating new insights...");

        // Calculate basic statistics
        const expenses = transactions.filter(t => t.type === 'expense');
        const income = transactions.filter(t => t.type === 'income');
        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate daily average based on actual date range
        const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        const averageDaily = totalSpent / daysDiff;

        // Category analysis
        const categorySpending = {};
        expenses.forEach(t => {
            const categoryName = t.category?.name || 'Uncategorized';
            categorySpending[categoryName] = {
                amount: (categorySpending[categoryName]?.amount || 0) + t.amount,
                count: (categorySpending[categoryName]?.count || 0) + 1
            };
        });

        const categoryBreakdown = Object.entries(categorySpending)
            .map(([category, data]) => ({
                category,
                amount: data.amount,
                percentage: ((data.amount / totalSpent) * 100),
                transactionCount: data.count
            }))
            .sort((a, b) => b.amount - a.amount);

        // Calculate trends (compare first half vs second half)
        const midDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
        const firstHalf = expenses.filter(t => t.date <= midDate);
        const secondHalf = expenses.filter(t => t.date > midDate);
        
        const firstHalfSpending = firstHalf.reduce((sum, t) => sum + t.amount, 0);
        const secondHalfSpending = secondHalf.reduce((sum, t) => sum + t.amount, 0);
        
        let spendingTrend = "stable";
        let trendPercentage = 0;
        let trendDescription = "Your spending has remained relatively stable";
        
        if (firstHalfSpending > 0) {
            trendPercentage = ((secondHalfSpending - firstHalfSpending) / firstHalfSpending) * 100;
            
            if (trendPercentage > 15) {
                spendingTrend = "increasing";
                trendDescription = `Your spending has increased by ${trendPercentage.toFixed(1)}%`;
            } else if (trendPercentage < -15) {
                spendingTrend = "decreasing";
                trendDescription = `Your spending has decreased by ${Math.abs(trendPercentage).toFixed(1)}%`;
            }
        }

        // Calculate financial health score
        const categoryDiversity = Math.min(100, (Object.keys(categorySpending).length / 8) * 100);
        const spendingConsistency = Math.max(0, 100 - Math.abs(trendPercentage));
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
        const budgetAdherence = Math.min(100, Math.max(0, savingsRate * 2)); // Rough estimate
        
        const financialHealthScore = Math.round(
            (categoryDiversity * 0.2) + 
            (spendingConsistency * 0.3) + 
            (budgetAdherence * 0.5)
        );

        // Prepare data for AI analysis
        const analysisData = {
            totalTransactions: transactions.length,
            expenseCount: expenses.length,
            incomeCount: income.length,
            totalSpent: totalSpent.toFixed(2),
            totalIncome: totalIncome.toFixed(2),
            averageDaily: averageDaily.toFixed(2),
            daysCovered: daysDiff,
            categoryBreakdown: categoryBreakdown.slice(0, 5),
            spendingTrend,
            trendPercentage: trendPercentage.toFixed(1),
            savingsRate: savingsRate.toFixed(1),
            financialHealthScore
        };

        let aiRecommendations = [];

        // Generate AI recommendations
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

                const prompt = `
You are a financial AI assistant analyzing spending patterns. Based on the user's transaction data, provide personalized recommendations.

User's Financial Data:
- Time Period: ${daysDiff} days (from ${startDate.toDateString()} to ${endDate.toDateString()})
- Total Transactions: ${analysisData.totalTransactions}
- Total Spent: $${analysisData.totalSpent}
- Total Income: $${analysisData.totalIncome}
- Daily Average Spending: $${analysisData.averageDaily}
- Savings Rate: ${analysisData.savingsRate}%
- Financial Health Score: ${analysisData.financialHealthScore}/100
- Spending Trend: ${spendingTrend} (${trendPercentage.toFixed(1)}%)
- Top Categories: ${categoryBreakdown.slice(0, 3).map(c => `${c.category}: $${c.amount.toFixed(2)}`).join(', ')}

IMPORTANT: Respond with ONLY a valid JSON object.

{
  "recommendations": [
    {
      "type": "savings|budgeting|category|general",
      "title": "Brief title (max 50 chars)",
      "description": "Detailed explanation (max 150 chars)",
      "priority": "high|medium|low"
    }
  ]
}

Generate 2-4 personalized, actionable recommendations.`;

                const result = await genAI.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                recommendations: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            type: { type: Type.STRING },
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            priority: { type: Type.STRING }
                                        },
                                        required: ["type", "title", "description", "priority"]
                                    }
                                }
                            },
                            required: ["recommendations"]
                        }
                    }
                });

                const aiResponse = JSON.parse(result.text);
                aiRecommendations = aiResponse.recommendations || [];
                console.log("AI recommendations generated successfully");

            } catch (aiError) {
                console.error("AI recommendation generation failed:", aiError.message);
            }
        }

        // Fallback recommendations if AI fails
        if (aiRecommendations.length === 0) {
            aiRecommendations = [
                {
                    type: "budgeting",
                    title: "Set Monthly Budget",
                    description: `Based on your $${averageDaily.toFixed(2)} daily average, consider setting a monthly budget of $${(averageDaily * 30 * 0.9).toFixed(0)}`,
                    priority: "high"
                },
                {
                    type: "category",
                    title: "Review Top Category",
                    description: `${categoryBreakdown[0]?.category || 'Your top category'} represents ${categoryBreakdown[0]?.percentage.toFixed(1) || 0}% of spending. Look for optimization opportunities.`,
                    priority: "medium"
                }
            ];

            if (savingsRate < 10) {
                aiRecommendations.push({
                    type: "savings",
                    title: "Improve Savings Rate",
                    description: "Your savings rate is below 10%. Try the 50/30/20 rule for better financial health.",
                    priority: "high"
                });
            }
        }

        // Create insights object
        const insights = {
            totalSpent,
            averageDaily,
            categoryBreakdown,
            trends: {
                spendingTrend,
                trendPercentage,
                description: trendDescription
            },
            aiRecommendations,
            financialHealthScore,
            healthFactors: {
                categoryDiversity,
                spendingConsistency,
                budgetAdherence
            }
        };

        // Save insights to database
        const newInsight = new Insight({
            user: req.user._id,
            dataHash,
            transactionCount: transactions.length,
            dateRange: { startDate, endDate },
            insights
        });

        await newInsight.save();
        console.log("New insights saved to database");

        // Clean up old insights (keep only the latest 5 per user)
        const oldInsights = await Insight.find({ user: req.user._id })
            .sort({ generatedAt: -1 })
            .skip(5);
        
        if (oldInsights.length > 0) {
            await Insight.deleteMany({ 
                _id: { $in: oldInsights.map(i => i._id) } 
            });
            console.log(`Cleaned up ${oldInsights.length} old insights`);
        }

        res.json({
            insights,
            dateRange: { startDate, endDate },
            isFromCache: false,
            generatedAt: newInsight.generatedAt,
            transactionCount: transactions.length
        });

    } catch (error) {
        console.error("Spending insights error:", error);
        res.status(500).json({ 
            message: "Failed to generate spending insights", 
            error: error.message 
        });
    }
};

// Get AI-powered category suggestions
export const suggestCategories = async (req, res) => {
    try {
        console.log("Category suggestions request received");
        console.log("User ID:", req.user?._id);

        // Get user's existing categories to avoid duplicates
        const userCategories = await Category.find({ user: req.user._id });
        const existingCategoryNames = userCategories.map(cat => cat.name.toLowerCase());

        // Check API key
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY not found");
            return res.status(500).json({ message: "AI service not configured" });
        }

        try {
            // Initialize Gemini AI
            const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            // Create AI prompt for category suggestions
            const prompt = `
You are a financial AI assistant helping suggest useful expense categories for personal finance tracking.

Current user categories: ${existingCategoryNames.length > 0 ? existingCategoryNames.join(", ") : "None"}

Task: Suggest 8-10 useful expense categories that would be valuable for personal finance tracking. Focus on common, practical categories that most people would find useful.

IMPORTANT: Respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks.

Required JSON format:
{
  "suggestions": [
    {
      "name": "Category Name",
      "description": "Brief description of what this category covers",
      "icon": "emoji or icon suggestion"
    }
  ]
}

Rules:
- Avoid suggesting categories that already exist in the user's list
- Focus on broad, commonly used categories
- Include a mix of essential (groceries, utilities) and lifestyle (entertainment, dining) categories
- Keep category names concise (1-2 words)
- Keep descriptions under 30 characters
- Suggest appropriate emojis for visual appeal
- Respond ONLY with the JSON object, nothing else
`;

            const result = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: {
                                            type: Type.STRING,
                                            description: "Category name"
                                        },
                                        description: {
                                            type: Type.STRING,
                                            description: "Brief description"
                                        },
                                        icon: {
                                            type: Type.STRING,
                                            description: "Emoji or icon"
                                        }
                                    },
                                    required: ["name", "description", "icon"]
                                }
                            }
                        },
                        required: ["suggestions"]
                    }
                }
            });

            const text = result.text;
            console.log("Raw AI response:", text);

            // Clean and parse AI response
            let aiResponse;
            try {
                // Remove any markdown code blocks, extra whitespace, or formatting
                let cleanText = text.trim();
                
                // Remove markdown code blocks if present
                cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                
                // Find JSON object in the response
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanText = jsonMatch[0];
                }
                
                console.log("Cleaned response:", cleanText);
                aiResponse = JSON.parse(cleanText);
                
                // Validate response structure
                if (!aiResponse.suggestions || !Array.isArray(aiResponse.suggestions)) {
                    throw new Error("Invalid response structure");
                }
                
            } catch (error) {
                console.error("AI response parsing error:", error);
                console.error("Raw response:", text);
                
                // Fallback: return common category suggestions
                aiResponse = {
                    suggestions: [
                        { name: "Groceries", description: "Food and household items", icon: "🛒" },
                        { name: "Dining", description: "Restaurants and takeout", icon: "🍽️" },
                        { name: "Transportation", description: "Gas, public transport, rideshare", icon: "🚗" },
                        { name: "Utilities", description: "Electricity, water, internet", icon: "💡" },
                        { name: "Entertainment", description: "Movies, games, subscriptions", icon: "🎬" },
                        { name: "Healthcare", description: "Medical expenses, pharmacy", icon: "🏥" },
                        { name: "Shopping", description: "Clothing, electronics, misc", icon: "🛍️" },
                        { name: "Education", description: "Books, courses, learning", icon: "📚" }
                    ]
                };
                
                console.log("Using fallback suggestions");
            }

            // Filter out categories that already exist (case-insensitive)
            const filteredSuggestions = aiResponse.suggestions.filter(suggestion => 
                !existingCategoryNames.includes(suggestion.name.toLowerCase())
            );

            res.json({
                suggestions: filteredSuggestions,
                message: "Category suggestions generated successfully"
            });

        } catch (geminiError) {
            console.error("Gemini AI failed:", geminiError.message);
            
            // Fallback: return common categories not already in user's list
            const commonCategories = [
                { name: "Groceries", description: "Food and household items", icon: "🛒" },
                { name: "Dining", description: "Restaurants and takeout", icon: "🍽️" },
                { name: "Transportation", description: "Gas, public transport, rideshare", icon: "🚗" },
                { name: "Utilities", description: "Electricity, water, internet", icon: "💡" },
                { name: "Entertainment", description: "Movies, games, subscriptions", icon: "🎬" },
                { name: "Healthcare", description: "Medical expenses, pharmacy", icon: "🏥" },
                { name: "Shopping", description: "Clothing, electronics, misc", icon: "🛍️" },
                { name: "Education", description: "Books, courses, learning", icon: "📚" },
                { name: "Insurance", description: "Health, auto, home insurance", icon: "🛡️" },
                { name: "Personal Care", description: "Haircuts, cosmetics, gym", icon: "💄" }
            ];

            const filteredSuggestions = commonCategories.filter(suggestion => 
                !existingCategoryNames.includes(suggestion.name.toLowerCase())
            );

            res.json({
                suggestions: filteredSuggestions,
                message: "Using fallback category suggestions"
            });
        }

    } catch (error) {
        console.error("Category suggestions error:", error);
        res.status(500).json({ 
            message: "Failed to generate category suggestions", 
            error: error.message 
        });
    }
};

// Fallback categorization function when Gemini AI is unavailable
function performFallbackCategorization(description, userCategories) {
    if (!description || !userCategories || userCategories.length === 0) {
        return { category: null };
    }

    const desc = description.toLowerCase().trim();
    
    // Common keyword mappings for fallback categorization
    const keywordMappings = {
        'grocery': ['grocery', 'groceries', 'supermarket', 'walmart', 'target', 'costco', 'safeway', 'kroger', 'food', 'market'],
        'groceries': ['grocery', 'groceries', 'supermarket', 'walmart', 'target', 'costco', 'safeway', 'kroger', 'food', 'market'],
        'dining': ['restaurant', 'dining', 'food', 'pizza', 'burger', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'subway', 'chipotle', 'takeout', 'delivery'],
        'food': ['restaurant', 'dining', 'food', 'pizza', 'burger', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'subway', 'chipotle', 'takeout', 'delivery'],
        'transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'parking', 'toll', 'car', 'vehicle', 'transport'],
        'utilities': ['electric', 'electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'cell', 'utility', 'bill', 'energy'],
        'entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'gaming', 'game', 'entertainment', 'fun', 'hobby', 'subscription'],
        'healthcare': ['doctor', 'medical', 'hospital', 'pharmacy', 'medicine', 'health', 'dental', 'clinic', 'insurance'],
        'shopping': ['shopping', 'store', 'mall', 'amazon', 'online', 'purchase', 'buy', 'clothing', 'clothes', 'electronics'],
        'education': ['school', 'education', 'book', 'course', 'learning', 'tuition', 'class', 'training', 'study'],
        'insurance': ['insurance', 'premium', 'policy', 'coverage', 'auto', 'health', 'life', 'home'],
        'personal care': ['haircut', 'salon', 'beauty', 'cosmetics', 'gym', 'fitness', 'spa', 'personal', 'care']
    };

    // Try to find a matching category
    for (const userCategory of userCategories) {
        const categoryNameLower = userCategory.name.toLowerCase();
        
        // Direct match - if description contains category name
        if (desc.includes(categoryNameLower)) {
            return {
                category: {
                    _id: userCategory._id,
                    name: userCategory.name
                }
            };
        }
        
        // Keyword matching - check if category has associated keywords
        const keywords = keywordMappings[categoryNameLower] || [];
        for (const keyword of keywords) {
            if (desc.includes(keyword)) {
                return {
                    category: {
                        _id: userCategory._id,
                        name: userCategory.name
                    }
                };
            }
        }
        
        // Reverse keyword matching - check if description matches any keyword that maps to this category
        for (const [mappedCategory, mappedKeywords] of Object.entries(keywordMappings)) {
            if (mappedKeywords.includes(categoryNameLower)) {
                for (const keyword of mappedKeywords) {
                    if (desc.includes(keyword)) {
                        return {
                            category: {
                                _id: userCategory._id,
                                name: userCategory.name
                            }
                        };
                    }
                }
            }
        }
    }

    // No match found
    return { category: null };
}

