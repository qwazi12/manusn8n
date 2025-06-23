import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, subject, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create email content
    const emailContent = {
      to: 'nodepilotdev@gmail.com',
      from: email,
      subject: `NodePilot Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FA8072;">New Contact Form Submission</h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Contact Details:</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This message was sent from the NodePilot contact form at https://nodepilot.dev</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the NodePilot contact form at https://nodepilot.dev
Timestamp: ${new Date().toISOString()}
      `
    };

    // Send email using Resend (if API key is available)
    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: 'NodePilot Contact <noreply@nodepilot.dev>',
          to: ['nodepilotdev@gmail.com'],
          replyTo: email,
          subject: `NodePilot Contact Form: ${subject}`,
          html: emailContent.html,
          text: emailContent.text
        });

        console.log('Email sent successfully:', emailResult);

        return NextResponse.json(
          {
            message: 'Message sent successfully! We will get back to you soon.',
            success: true
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);

        // Log the submission for manual follow-up
        console.log('Contact form submission (email failed):', emailContent);

        return NextResponse.json(
          {
            message: 'Message received! We will get back to you soon.',
            success: true
          },
          { status: 200 }
        );
      }
    } else {
      // No email service configured, just log the submission
      console.log('Contact form submission (no email service):', emailContent);

      return NextResponse.json(
        {
          message: 'Message received! We will get back to you soon.',
          success: true
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
