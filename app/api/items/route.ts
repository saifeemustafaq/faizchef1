import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'items.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading items:', error);
    return NextResponse.json(
      { error: 'Failed to read items' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing items:', error);
    return NextResponse.json(
      { error: 'Failed to write items' },
      { status: 500 }
    );
  }
}

