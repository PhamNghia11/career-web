const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://localhost:27017/gdu_career"; // Cập nhật URI nếu cần

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("news");

        const sampleNews = [
            {
                title: "GDU hợp tác cùng Techcombank: Mở rộng cơ hội thực tập cho sinh viên khối ngành Kinh tế",
                summary: "Buổi ký kết hợp tác giữa Đại học Gia Định và Techcombank hứa hẹn mang lại hàng trăm vị trí thực tập và cơ hội việc làm chính thức cho sinh viên bản địa trong năm 2026.",
                content: "<p>Đại học Gia Định (GDU) vừa chính thức ký kết thỏa thuận hợp tác chiến lược với Ngân hàng Techcombank...</p>",
                imageUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80",
                category: "Thị trường",
                sourceName: "GDU News",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 1250,
                slug: "gdu-hop-tac-techcombank-2026-v2"
            },
            {
                title: "Thị trường lao động IT 2026: Ưu tiên nhân lực có kỹ năng về AI và Cloud Computing",
                summary: "Báo cáo mới nhất từ đối tác VietnamWorks cho thấy nhu cầu tuyển dụng kỹ sư AI tăng vọt 150% so với cùng kỳ năm ngoái.",
                imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
                category: "Thị trường",
                sourceName: "VietnamWorks",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 3420,
                slug: "thi-truong-lao-dong-it-2026-v2"
            },
            {
                title: "5 bước để có một bộ CV 'bách phát bách trúng' trong mắt nhà tuyển dụng",
                summary: "Hướng dẫn thực tế từ chuyên gia nhân sự giúp sinh viên GDU tối ưu hóa CV để vượt qua vòng hồ sơ của các tập đoàn lớn.",
                imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
                category: "Kỹ năng",
                sourceName: "Career Hacks",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 2800,
                slug: "5-buoc-toi-uu-cv-v2"
            },
            {
                title: "Chuyện người trong nghề: Từ sinh viên GDU đến vị trí Lead Engineer tại tập đoàn đa quốc gia",
                summary: "Anh Nguyễn Văn A - Cựu sinh viên K14 chia sẻ hành trình nỗ lực và những bí kíp giúp anh gặt hái thành công sớm.",
                imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
                category: "Kỹ năng",
                sourceName: "Career Talk",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 4100,
                slug: "career-talk-nguyen-van-a-v2"
            },
            {
                title: "Thông báo tuyển dụng Thực tập sinh Tài năng GDU Nest - Mùa 5",
                summary: "Chương trình thực tập trả lương tại GDU Nest đã chính thức mở đơn đăng ký. Đây là cơ hội vàng để sinh viên trải nghiệm môi trường làm việc thực chiến.",
                imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
                category: "Thông báo",
                sourceName: "GDU Center",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 5200,
                slug: "tuyen-dung-thuc-tap-sinh-gdu-nest-m5-v2"
            },
            {
                title: "Học bổng 'Vươn xa ước mơ 2026': Tổng giá trị lên tới 1 tỷ đồng dành cho sinh viên GDU",
                summary: "Quỹ học bổng từ các doanh nghiệp đối tác dành riêng cho sinh viên GDU có thành tích học tập xuất sắc và vượt khó.",
                imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
                category: "Thông báo",
                sourceName: "GDU Center",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 1800,
                slug: "hoc-bong-vuon-xa-uo-mo-2026-v2"
            }
        ];

        console.log("Inserting 6 quality news items...");
        await collection.insertMany(sampleNews);
        console.log("Seed data created successfully in MongoDB!");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await client.close();
    }
}

seed();
