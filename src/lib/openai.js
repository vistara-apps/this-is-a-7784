import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

// Generate state-specific rights content
export const generateStateRights = async (stateName, language = 'en') => {
  try {
    const prompt = `Generate comprehensive "Know Your Rights" information for ${stateName} in ${language === 'es' ? 'Spanish' : 'English'}. 

Please provide:
1. A list of 6-8 key rights citizens have during police interactions
2. A list of 6-8 things citizens should NEVER say during police encounters
3. Three specific scripts for different scenarios:
   - policeStop: What to say during a traffic stop or street encounter
   - searchRefusal: How to refuse consent to searches
   - silentInvocation: How to invoke right to remain silent

Format the response as JSON with this structure:
{
  "title": "Your Rights in ${stateName}" (or Spanish equivalent),
  "rights": ["right 1", "right 2", ...],
  "doNotSay": ["thing not to say 1", "thing not to say 2", ...],
  "scripts": {
    "policeStop": "script text...",
    "searchRefusal": "script text...",
    "silentInvocation": "script text..."
  }
}

Important guidelines:
- Be legally accurate for ${stateName} specifically
- Use clear, concise language
- Scripts should be practical and easy to remember under stress
- Include specific constitutional amendments where relevant
- For Spanish, use formal but accessible language
- Ensure all advice is legally sound and protective of civil rights`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal expert specializing in civil rights and police interactions. Provide accurate, state-specific legal guidance that helps protect citizens' constitutional rights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      max_tokens: 2000
    })

    const content = completion.choices[0].message.content
    return JSON.parse(content)

  } catch (error) {
    console.error('OpenAI generation error:', error)
    throw new Error('Failed to generate rights content')
  }
}

// Translate existing content to another language
export const translateContent = async (content, targetLanguage) => {
  try {
    const languageName = targetLanguage === 'es' ? 'Spanish' : 'English'
    
    const prompt = `Translate the following legal rights content to ${languageName}. Maintain legal accuracy and use formal but accessible language.

Original content:
${JSON.stringify(content, null, 2)}

Please return the translated content in the same JSON structure, ensuring:
- Legal terminology is accurately translated
- Scripts remain practical and memorable
- Constitutional references are properly translated
- The tone remains authoritative but accessible`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional legal translator specializing in civil rights documentation. Provide accurate translations that maintain legal precision."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    })

    const translatedContent = completion.choices[0].message.content
    return JSON.parse(translatedContent)

  } catch (error) {
    console.error('Translation error:', error)
    throw new Error('Failed to translate content')
  }
}

// Generate content for multiple states
export const generateMultipleStates = async (states, language = 'en') => {
  const results = {}
  const errors = []

  for (const state of states) {
    try {
      console.log(`Generating content for ${state} in ${language}...`)
      const content = await generateStateRights(state, language)
      results[state] = content
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Failed to generate content for ${state}:`, error)
      errors.push({ state, error: error.message })
    }
  }

  return { results, errors }
}

// Validate generated content
export const validateContent = (content) => {
  const requiredFields = ['title', 'rights', 'doNotSay', 'scripts']
  const requiredScripts = ['policeStop', 'searchRefusal', 'silentInvocation']

  // Check required fields
  for (const field of requiredFields) {
    if (!content[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Check arrays have content
  if (!Array.isArray(content.rights) || content.rights.length === 0) {
    throw new Error('Rights array is empty or invalid')
  }

  if (!Array.isArray(content.doNotSay) || content.doNotSay.length === 0) {
    throw new Error('DoNotSay array is empty or invalid')
  }

  // Check scripts
  for (const script of requiredScripts) {
    if (!content.scripts[script] || typeof content.scripts[script] !== 'string') {
      throw new Error(`Missing or invalid script: ${script}`)
    }
  }

  return true
}

// US States list for content generation
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
]
