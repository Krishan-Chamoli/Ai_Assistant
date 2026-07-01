import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const saveSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  contentType: z.string().min(1, 'Content Type is required'),
  topic: z.string().min(1, 'Topic is required'),
  tone: z.string().min(1, 'Tone is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  output: z.string().min(1, 'Output is required'),
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate save request body
    const validation = saveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map(err => err.message).join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'User does not exist. Cannot save content.' },
        { status: 404 }
      );
    }

    // Save to Content collection in MongoDB
    const savedContent = await prisma.content.create({
      data: {
        userId: data.userId,
        contentType: data.contentType,
        topic: data.topic,
        tone: data.tone,
        prompt: data.prompt,
        output: data.output,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Content saved successfully',
      data: savedContent,
    });
  } catch (error) {
    console.error('Save API Error:', error);
    try {
      const logPath = path.join(process.cwd(), 'error-save.log');
      fs.appendFileSync(logPath, `${new Date().toISOString()} - ${error.stack || error.message || error}\n\n`);
    } catch (e) {
      console.error('Failed to write log file:', e);
    }
    return NextResponse.json(
      { error: 'Internal Server Error. Failed to save content to database.' },
      { status: 500 }
    );
  }
}
