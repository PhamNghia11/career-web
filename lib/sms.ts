/**
 * Helper to send SMS via eSMS.vn
 * Documentation: https://esms.vn/tai-lieu-ky-thuat/api-gui-tin-nhan-cskh
 */

export async function sendSMS(phone: string, message: string) {
    try {
        const apiKey = process.env.ESMS_API_KEY
        const secretKey = process.env.ESMS_SECRET_KEY
        const brandName = process.env.ESMS_BRAND_NAME || "Verify"

        // If no API key, log to console (Mock mode)
        if (!apiKey || !secretKey) {
            console.log("---------------------------------------------------")
            console.log(`[SMS MOCK] To: ${phone}`)
            console.log(`[SMS MOCK] Message: ${message}`)
            console.log("---------------------------------------------------")
            return { success: true, mock: true }
        }

        // Format phone number: ensure 0 at start, no +84 (eSMS usually takes 09xxx)
        // Adjust logic if needed based on eSMS requirements
        let formattedPhone = phone
        if (formattedPhone.startsWith("+84")) {
            formattedPhone = "0" + formattedPhone.slice(3)
        }

        // Call eSMS API
        const url = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${encodeURIComponent(formattedPhone)}&Content=${encodeURIComponent(message)}&ApiKey=${apiKey}&SecretKey=${secretKey}&IsUnicode=0&Brandname=${brandName}&SmsType=2`

        const response = await fetch(url)
        const data = await response.json()

        // eSMS success code is typically 100
        if (data.CodeResult === "100") {
            console.log(`[SMS] Sent to ${phone}: Success`)
            return { success: true, data }
        } else {
            console.error(`[SMS] Failed to send to ${phone}:`, data)
            return { success: false, error: data.ErrorMessage || "Unknown error" }
        }

    } catch (error) {
        console.error("[SMS] Error sending SMS:", error)
        return { success: false, error }
    }
}
