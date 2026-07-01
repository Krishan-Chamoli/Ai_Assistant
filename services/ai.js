import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple check for Gemini API key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generates AI content based on parameters.
 * Falls back to high-quality mock generation if no Gemini API key is configured.
 */
export async function generateAIContent({ contentType, topic, tone }) {
  // Construct a professional dynamic prompt
  const prompt = `Generate a highly engaging ${contentType} about "${topic}". The writing style and voice should be strictly ${tone}. 
Ensure the content is well-structured, formatted in clean Markdown, and optimized for its respective platform.`;

  if (genAI) {
    try {
      // Use gemini-2.5-flash as the default fast text generation model
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text && text.trim().length > 0) {
        return {
          prompt,
          output: text,
          modelUsed: 'gemini-2.5-flash',
        };
      }
    } catch (error) {
      console.error('Error generating with Gemini API, falling back to mock generator:', error);
    }
  }

  // Fallback / Mock Content Generation logic if API Key is not set or fails
  const output = getMockContent(contentType, topic, tone);
  return {
    prompt,
    output,
    modelUsed: 'Mock AI Content Engine',
  };
}

function getMockContent(contentType, topic, tone) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const intro = {
    Professional: `As we navigate the evolving landscape of **${topic}**, establishing a clear, strategic framework is essential for sustainable growth. This analysis outlines the primary dimensions and best practices required to achieve excellence.`,
    Witty: `Let's be honest: talking about **${topic}** can sometimes feel like explaining memes to your grandparents. But fear not! We are diving deep into the quirky, wonderful, and slightly chaotic world of it. Grab a coffee, and let's decode this mystery together.`,
    Casual: `Hey there! Today we're chatting about **${topic}**. It's something that's been on a lot of people's minds lately, and I wanted to share a few quick thoughts on why it matters and how you can get started without losing your mind.`,
    Informative: `This document provides a comprehensive overview of **${topic}**. Based on recent data and industry reports, we analyze the core concepts, historical context, and technical implementations driving current trends in this field.`,
    Persuasive: `Are you tired of falling behind? The future belongs to those who master **${topic}** today. Implementing these proven strategies is no longer optional—it is the single most critical step you can take to unlock your competitive advantage immediately.`
  }[tone] || `Here is a custom piece on **${topic}** crafted in a **${tone}** tone.`;

  const body1 = {
    Professional: `### 1. Key Objectives and Frameworks\nTo implement successful strategies surrounding ${topic}, organizations must focus on operational efficiency, cross-functional collaboration, and data-driven iteration. By establishing strict performance indicators, team members can measure impact and align milestones with overall company targets.`,
    Witty: `### 1. The "Secret Sauce"\nFirst things first: you can't just throw ${topic} into a blender and hope for magic. It requires a recipe. Think of it like baking: a pinch of strategy, a dash of execution, and a healthy dose of patience (or just reloading your browser and hoping for the best).`,
    Casual: `### 1. Let's Keep It Simple\nFirst off, don't overcomplicate it. When it comes to ${topic}, the best approach is to start small. Figure out what your main goal is, take one step at a time, and don't worry about making it perfect on day one. Learning as you go is half the fun!`,
    Informative: `### 1. Core Mechanics and Taxonomy\nAt its foundation, ${topic} relies on three key pillars: system design, resource allocation, and continuous integration. Understanding how these elements interface is crucial for diagnosing bottlenecks and optimizing throughput across standard workflows.`,
    Persuasive: `### 1. The Cost of Inaction\nEvery day you hesitate is a day your competitors gain ground. By leveraging ${topic}, you aren't just saving time—you are positioning yourself to dominate the market. The statistics speak for themselves: early adopters report up to a 150% increase in productivity.`
  }[tone] || ``;

  const body2 = {
    Professional: `### 2. Implementation Methodology\nExecuting this model involves a phased rollout starting with scoping and research, followed by localized testing, and finally, full-scale deployment. Regular post-mortem assessments ensure that operational gaps are quickly identified and remediated.`,
    Witty: `### 2. Pro Tips for Survival\n- **Tip #1:** Don't press the big red button unless you know what it does.\n- **Tip #2:** Coffee is a valid engineering tool.\n- **Tip #3:** Remember that ${topic} is a journey, not a sprint. Enjoy the scenery!`,
    Casual: `### 2. A Few Handy Tips\nHere's what I wish someone had told me before starting:\n* Focus on the basics first\n* Ask questions when you get stuck\n* Keep a notebook of what works and what doesn't\nIt's a lot easier when you take the pressure off yourself.`,
    Informative: `### 2. Comparative Analysis\nWhen examining ${topic} against historical alternatives, we see a significant reduction in latency and a notable increase in scalability. The table below represents a standard comparison metric:\n\n| Metric | Traditional | Modern (${topic}) |\n|---|---|---|\n| Latency | High | Extremely Low |\n| Scalability | Manual | Auto-Scaled |`,
    Persuasive: `### 2. A Proven Path to Success\nWe've designed a clear, straightforward path for you to adopt ${topic}. Our framework eliminates guesswork, handles the heavy lifting, and lets you focus on what you do best: growing your brand and converting users into loyal advocates.`
  }[tone] || ``;

  const conclusion = {
    Professional: `### Conclusion\nIn summary, a disciplined adherence to these guidelines will ensure that initiatives involving **${topic}** yield measurable returns. For further consultations or deep-dives into specific data points, please contact our strategy department.`,
    Witty: `### And That's a Wrap!\nSo there you have it—the lowdown on **${topic}**. Hopefully, you learned something new, had a laugh, and feel slightly more prepared to tackle the day. Go forth and conquer!`,
    Casual: `### Wrapping Up\nThat's pretty much it for now! I hope this helps you get a better handle on **${topic}**. If you have any feedback or want to chat more about it, feel free to reach out. Keep styling!`,
    Informative: `### Summary of Findings\nThe data confirms that **${topic}** remains an essential variable in standard operations. Future studies should focus on long-term sustainability metrics and further integration boundaries.`,
    Persuasive: `### The Time is Now\nStop waiting for the "perfect" moment. It doesn't exist. The tools are here, the strategy is clear, and the opportunity is yours. [Click here to begin your journey with ${topic} today](#) and make your success story a reality.`
  }[tone] || ``;

  // Format tailored to Content Type
  switch (contentType) {
    case 'Blog Post':
      return `# The Definitive Guide to ${topic}\n\n*Published on ${dateStr} • Written in a ${tone} tone*\n\n${intro}\n\n${body1}\n\n${body2}\n\n${conclusion}`;

    case 'Social Media Post':
      const emojis = { Professional: '💼🚀', Witty: '🧠💡😎', Casual: '👋✨☕', Informative: '📊🔍📘', Persuasive: '🔥🎯🏆' }[tone] || '✨';
      const hashtags = { 
        Professional: '#BusinessStrategy #Leadership #GrowthMindset', 
        Witty: '#LifeHacks #ThoughtsOfTheDay #MindsetShift', 
        Casual: '#ChillVibes #SimpleLiving #DailyRoutine', 
        Informative: '#LearnSomethingNew #DataScience #FactsOnly', 
        Persuasive: '#TakeAction #UnlockSuccess #NoExcuses' 
      }[tone] || '#Innovation';
      return `### Evolving with ${topic} ${emojis}\n\n${intro.replace(/\n\n/g, ' ')}\n\n${body1.replace(/### .*\n/g, '').substring(0, 150)}...\n\n👉 What are your thoughts on this? Let me know in the comments below!\n\n${hashtags}`;

    case 'Email Draft':
      return `**Subject:** ${tone === 'Witty' ? 'Wait, what about' : 'Important updates on'} ${topic}? 📩\n\nHi [Name],\n\n${intro}\n\n${body1.replace(/### .*\n/g, '')}\n\nBest regards,\n\n[Your Name]  \n*[Your Title]*`;

    case 'Marketing Ad':
      return `## 🚨 ATTENTION: The Future of ${topic} is Here! 🚨\n\n${intro}\n\n**Why Choose Us?**\n✅ Proven Industry Standard\n✅ 100% Secure & Reliable\n✅ Boost Productivity by 2x\n\n${conclusion}\n\n**👉 [Get Started Free Today!]**`;

    case 'Product Description':
      return `# The Smart ${topic} Toolkit\n\n*A premium solution designed for your everyday needs.*\n\n${intro}\n\n### Product Benefits:\n- **Advanced Architecture:** Engineered for maximum efficiency and durability.\n- **Modern Styling:** Compact, sleek aesthetic that fits any workspace.\n- **Seamless Integration:** Works with your existing tools right out of the box.\n\n${body2.replace(/### .*\n/g, '')}\n\n*Available in Light & Dark configurations. Order yours now.*`;

    default:
      return `# Generation: ${topic}\n\n*Type: ${contentType} | Tone: ${tone}*\n\n${intro}\n\n${body1}\n\n${body2}\n\n${conclusion}`;
  }
}
