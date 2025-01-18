import { NextResponse } from 'next/server';
import { initiateBootstrapping } from '../../services/bootstrap';

export const maxDuration = 60;


export async function POST() {
  await initiateBootstrapping(process.env.PINECONE_INDEX as string)

  return NextResponse.json({ success: true }, { status: 200 })
}