import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function GET() {
  try {
    console.log('SENDING TEST EMAIL');

    const result = await resend.emails.send({
      from: 'InfraMind <onboarding@resend.dev>',
      to: 'mailitadarsh@gmail.com',
      subject: 'InfraMind Down Alert Test',
      html: `
        <h2>🚨 Website Down Alert</h2>
        <p>This is a test email from InfraMind.</p>
      `,
    });

    console.log('EMAIL RESULT:', result);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('EMAIL ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error,
      },
      {
        status: 500,
      }
    );
  }
}