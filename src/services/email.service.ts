import nodemailer from "nodemailer"

interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        await transporter.verify()

        const result = await transporter.sendMail({
            from: `"GDU Career Portal" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        })

        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error("Error sending email:", error)
        return { success: false, error }
    }
}
