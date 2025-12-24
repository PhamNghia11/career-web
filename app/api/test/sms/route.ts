
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    // Debug endpoint for SMS
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const msg = "Ma xac minh GDU Career cua ban la: 123456"

    if (!phone) {
        return NextResponse.json({ error: "Missing phone param" }, { status: 400 })
    }

    try {
        const apiKey = process.env.ESMS_API_KEY
        const secretKey = process.env.ESMS_SECRET_KEY
        const brandName = process.env.ESMS_BRAND_NAME

        // Log config status (masked)
        const config = {
            apiKey: apiKey ? "Present (Starts with " + apiKey.substring(0, 3) + ")" : "Missing",
            secretKey: secretKey ? "Present" : "Missing",
            brandName: brandName || "Not set (Using default)",
        }

        // Test 1: Using Type 8 (Fixed Notify) - Current App Config
        const urlType8 = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${phone}&Content=${encodeURIComponent(msg)}&ApiKey=${apiKey}&SecretKey=${secretKey}&IsUnicode=0&Brandname=${brandName || "Verify"}&SmsType=8`
        const res8 = await fetch(urlType8)
        const data8 = await res8.json()

        // Test 2: Using Type 2 (CSKH) - If they have a registered brandname
        const urlType2 = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${phone}&Content=${encodeURIComponent(msg)}&ApiKey=${apiKey}&SecretKey=${secretKey}&IsUnicode=0&Brandname=${brandName || "Verify"}&SmsType=2`
        const res2 = await fetch(urlType2)
        const data2 = await res2.json()

        // Test 3: Type 8 with EMPTY Brandname (let eSMS decide)
        const urlType8NoBrand = `https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${phone}&Content=${encodeURIComponent(msg)}&ApiKey=${apiKey}&SecretKey=${secretKey}&IsUnicode=0&SmsType=8`
        const res8NoBrand = await fetch(urlType8NoBrand)
        const data8NoBrand = await res8NoBrand.json()

        return NextResponse.json({
            description: "Debugging eSMS sending",
            config,
            results: {
                type8_response_verify: data8,
                type2_response_verify: data2,
                type8_response_no_brand: data8NoBrand
            },
            recommendation: "Check CodeResult. 100 = Success. 99/others = Error."
        })

    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}
