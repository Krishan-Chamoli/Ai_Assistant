import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required to fetch history.' },
        { status: 400 }
      );
    }

    // Retrieve user history from MongoDB via Prisma
    const history = await prisma.content.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('History Fetch API Error:', error);
    try {
      const logPath = path.join(process.cwd(), 'error-history.log');
      fs.appendFileSync(logPath, `${new Date().toISOString()} [GET] - ${error.stack || error.message || error}\n\n`);
    } catch (e) {
      console.error('Failed to write log file:', e);
    }
    return NextResponse.json(
      { error: 'Internal Server Error. Failed to fetch history.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required to delete record.' },
        { status: 400 }
      );
    }

    // Delete content by ID
    await prisma.content.delete({
      where: { id: contentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    console.error('History Delete API Error:', error);
    try {
      const logPath = path.join(process.cwd(), 'error-history.log');
      fs.appendFileSync(logPath, `${new Date().toISOString()} [DELETE] - ${error.stack || error.message || error}\n\n`);
    } catch (e) {
      console.error('Failed to write log file:', e);
    }
    return NextResponse.json(
      { error: 'Internal Server Error. Failed to delete history item.' },
      { status: 500 }
    );
  }
}
