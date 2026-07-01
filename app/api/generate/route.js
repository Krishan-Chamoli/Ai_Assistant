import { NextResponse } from 'next/server';
import { generateAIContent } from '@/services/ai';
import { z } from 'zod';

const generateSchema = z.object({
  contentType: z.enum(['Blog Post', 'Social Media Post', 'Email Draft', 'Marketing Ad', 'Product Description'], {
    message: 'Invalid content type',
  }),
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters long')
    .max(100, 'Topic must be under 100 characters'),
  tone: z.enum(['Professional', 'Witty', 'Casual', 'Informative', 'Persuasive'], {
    message: 'Invalid tone style',
  }),
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map(err => err.message).join(', ') },
        { status: 400 }
      );
    }

    const { contentType, topic, tone } = validation.data;

    const result = await generateAIContent({ contentType, topic, tone });

    return NextResponse.json({
      success: true,
      data: {
        contentType,
        topic,
        tone,
        prompt: result.prompt,
        output: result.output,
        modelUsed: result.modelUsed,
      }
    });
  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    );
  }
}
