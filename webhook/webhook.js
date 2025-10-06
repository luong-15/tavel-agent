// Helper function to detect Vietnamese text
function isVietnamese(text) {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
  return vietnamesePattern.test(text);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node webhook.js <intent> <parameters_json> [queryText]');
  process.exit(1);
}

const intent = args[0];
const parameters = JSON.parse(args[1]);
const queryText = args[2] || '';

  let responseText = '';
  let suggestions = [];

  // Simulate real-time data
  const tourPrices = {
    'sapa_classic': { 
      'xe_khach': 2500000, 
      'tau_hoa': 3200000, 
      'may_bay': 4500000,
      'details': 'Đã bao gồm: Xe di chuyển khứ hồi, khách sạn 3 sao, ăn uống 3 bữa/ngày, hướng dẫn viên, vé tham quan, bảo hiểm du lịch'
    },
    'mocchau_tea': { 
      'xe_khach': 2200000, 
      'tau_hoa': 2900000, 
      'may_bay': 4200000,
      'details': 'Đã bao gồm: Xe di chuyển, homestay/khách sạn, ăn uống, hướng dẫn viên, vé tham quan đồi chè, bảo hiểm'
    },
    'maichau_culture': { 
      'xe_khach': 2300000, 
      'tau_hoa': 3000000, 
      'may_bay': 4300000,
      'details': 'Đã bao gồm: Xe di chuyển, homestay Thái, ăn uống, hướng dẫn viên, trải nghiệm văn hóa, bảo hiểm'
    }
  };

  const groupDiscounts = {
    5: 10, // 5+ người giảm 10%
    10: 15, // 10+ người giảm 15%
    20: 20  // 20+ người giảm 20%
  };

  // Detect if user is speaking Vietnamese
  const userLanguage = isVietnamese(queryText) ? 'vi' : 'en';

  switch (intent) {
    case 'Default Fallback Intent':
      if (userLanguage === 'vi') {
        responseText = `Xin lỗi, tôi chưa hiểu rõ ý bạn. 🤔\n\nTôi có thể giúp bạn:\n🎯 **Tư vấn tour:** Sapa, Mộc Châu, Mai Châu\n📅 **Xem lịch trình:** Chi tiết từng ngày\n💰 **Báo giá:** Theo phương tiện di chuyển\n📝 **Đặt tour:** Nhanh chóng và dễ dàng\n❓ **Hỏi đáp:** Thời tiết, đồ mang, thanh toán\n\nHãy thử hỏi theo cách khác hoặc chọn từ gợi ý trên. Hoặc gọi hotline 1900-xxxx để được hỗ trợ trực tiếp! 📞`;

        suggestions = [
          { title: "Xem gợi ý tour" },
          { title: "Hỏi về giá tour" },
          { title: "Liên hệ hotline" }
        ];
      } else {
        responseText = `Sorry, I didn't understand "${queryText}". You can ask about Lotus Nomad Travel tours, prices, itinerary, best time to visit, or booking.`;
      }
      break;

    case 'AskTourPrice':
      const tourType = parameters.TayBacTour || 'sapa_classic';
      const transport = parameters.TransportType || 'xe_khach';
      const numPeople = parameters.numPeople || 1;

      if (tourPrices[tourType]) {
        let basePrice = tourPrices[tourType][transport] || tourPrices[tourType]['xe_khach'];
        let discount = 0;

        // Apply group discount
        for (let minSize of Object.keys(groupDiscounts).sort((a, b) => b - a)) {
          if (numPeople >= parseInt(minSize)) {
            discount = groupDiscounts[minSize];
            break;
          }
        }

        const finalPrice = Math.round(basePrice * (1 - discount / 100));

        if (userLanguage === 'vi') {
          responseText = `💰 **Báo giá tour ${tourType}:**\n\n`;
          responseText += `👥 Số người: ${numPeople}\n`;
          responseText += `🚗 Phương tiện: ${transport}\n`;
          responseText += `💵 Giá gốc: ${basePrice.toLocaleString()}đ/người\n`;

          if (discount > 0) {
            responseText += `🎁 Giảm giá nhóm: ${discount}%\n`;
            responseText += `✨ **Giá cuối: ${finalPrice.toLocaleString()}đ/người**\n\n`;
          } else {
            responseText += `✨ **Giá cuối: ${basePrice.toLocaleString()}đ/người**\n\n`;
          }

          responseText += `📋 **Đã bao gồm:**\n${tourPrices[tourType].details}\n\n`;
          responseText += `❌ **Không bao gồm:** Chi phí cá nhân, đồ uống có cồn, tips\n\n`;
          responseText += `🎁 **Ưu đãi thêm:** Trẻ em dưới 5 tuổi miễn phí, từ 5-10 tuổi giảm 50%\n\n`;
          responseText += `Bạn có muốn đặt tour này không? 😊`;

          suggestions = [
            { title: "Xem lịch trình tour" },
            { title: "Đặt tour ngay" },
            { title: "Hỏi về hoạt động" }
          ];
        } else {
          responseText = `Price for ${tourType} tour by ${transport}: ${finalPrice.toLocaleString()}đ/person${discount > 0 ? ` (${discount}% group discount)` : ''}. Includes meals, hotel, and guide.`;
        }
      } else {
        responseText = userLanguage === 'vi' ?
          'Xin lỗi, tôi không tìm thấy thông tin giá cho tour này. Vui lòng liên hệ 1900-xxxx.' :
          'Sorry, price information not found for this tour. Please contact 1900-xxxx.';
      }
      break;

    case 'AskTourItinerary':
      const destination = parameters.destination || 'Sapa';
      const duration = parameters.duration || '3 ngày 2 đêm';

      if (userLanguage === 'vi') {
        responseText = `📅 **Lịch trình tour ${destination} ${duration}:**\n\n`;

        if (destination.toLowerCase().includes('sapa')) {
          responseText += `**Ngày 1:** Khởi hành từ Hà Nội\n`;
          responseText += `• 06:00: Xe đón tại điểm hẹn\n`;
          responseText += `• 12:00: Ăn trưa tại Lào Cai\n`;
          responseText += `• 14:00: Checkin khách sạn Sapa\n`;
          responseText += `• 15:30: Thăm Núi Hàm Rồng\n`;
          responseText += `• 18:00: Ăn tối, nghỉ ngơi\n\n`;

          responseText += `**Ngày 2:** Khám phá Sapa\n`;
          responseText += `• 08:00: Ăn sáng, khởi hành\n`;
          responseText += `• 09:00: Thăm bản Cát Cát\n`;
          responseText += `• 11:00: Trekking đến thác Bạc\n`;
          responseText += `• 14:00: Thăm chợ phiên Bắc Hà (T7)\n`;
          responseText += `• 18:00: Trải nghiệm văn hóa H'Mông\n\n`;

          if (duration.includes('3 ngày')) {
            responseText += `**Ngày 3:** Fansipan & về Hà Nội\n`;
            responseText += `• 06:00: Chinh phục Fansipan bằng cáp treo\n`;
            responseText += `• 12:00: Ăn trưa và mua sắm\n`;
            responseText += `• 14:00: Về Hà Nội\n`;
            responseText += `• 20:00: Kết thúc tour tại Hà Nội\n\n`;
          }
        } else if (destination.toLowerCase().includes('mộc châu')) {
          responseText += `**Ngày 1:** Hà Nội - Mộc Châu\n`;
          responseText += `• 06:00: Khởi hành từ Hà Nội\n`;
          responseText += `• 10:00: Thăm đồi chè Mộc Châu\n`;
          responseText += `• 12:00: Ăn trưa tại nhà hàng địa phương\n`;
          responseText += `• 14:00: Checkin homestay/hotel\n`;
          responseText += `• 16:00: Thăm rừng thông Bản Áng\n\n`;

          responseText += `**Ngày 2:** Trải nghiệm địa phương\n`;
          responseText += `• 07:00: Ngắm bình minh trên đồi chè\n`;
          responseText += `• 09:00: Thăm trang trại bò sữa\n`;
          responseText += `• 11:00: Thăm bản Pa Phách\n`;
          responseText += `• 14:00: Mua sắm đặc sản\n`;
          responseText += `• 16:00: Về Hà Nội\n\n`;
        }

        responseText += `💰 **Giá từ:** 2.200.000đ - 4.500.000đ/người\n`;
        responseText += `📞 **Đặt tour:** 1900-xxxx\n\n`;
        responseText += `Bạn muốn biết thêm chi tiết gì không?`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về hoạt động" }
        ];
      } else {
        responseText = `${destination} ${duration} itinerary: Day 1: Departure, sightseeing. Day 2: Cultural activities, local experiences. Contact for detailed schedule!`;
      }
      break;

    case 'AskAccommodation':
      const hotelType = parameters.hotelType || 'khách sạn';
      
      if (userLanguage === 'vi') {
        responseText = `🏨 **Thông tin lưu trú:**\n\n`;
        responseText += `**Khách sạn tiêu chuẩn:** 3-4 sao, trung tâm thành phố\n`;
        responseText += `• Phòng đôi/đơn có ban công view núi\n`;
        responseText += `• Bao gồm: WiFi, TV, minibar, điều hòa\n`;
        responseText += `• Dịch vụ: Bể bơi, spa, gym (tùy khách sạn)\n\n`;
        
        responseText += `**Homestay:** Trải nghiệm đặc biệt\n`;
        responseText += `• Nhà sàn truyền thống của người dân tộc\n`;
        responseText += `• Trải nghiệm văn hóa địa phương chân thực\n`;
        responseText += `• Ăn uống cùng gia đình chủ nhà\n\n`;
        
        responseText += `**Villa gia đình:** Cho nhóm lớn\n`;
        responseText += `• Có bếp, phòng khách riêng\n`;
        responseText += `• Phù hợp 6-12 người\n`;
        responseText += `• Giá từ 8.000.000đ/villa/đêm\n\n`;
        
        responseText += `🐕 **Chính sách thú cưng:** Một số nơi cho phép (phí thêm 200.000đ/đêm)\n\n`;
        responseText += `Bạn muốn chọn loại lưu trú nào?`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về ẩm thực" }
        ];
      }
      break;

    case 'AskFood':
      if (userLanguage === 'vi') {
        responseText = `🍽️ **Ẩm thực Tây Bắc:**\n\n`;
        responseText += `**Tour đã bao gồm:** 3 bữa ăn/ngày\n`;
        responseText += `• Sáng: Phở, bánh mì, cháo\n`;
        responseText += `• Trưa/Tối: Set menu hoặc buffet\n\n`;
        
        responseText += `**🍖 Đặc sản phải thử:**\n`;
        responseText += `• Thịt lợn bản nướng\n`;
        responseText += `• Cá suối nướng lá chuối\n`;
        responseText += `• Thắng cố (Sapa)\n`;
        responseText += `• Rượu cần (Mai Châu)\n`;
        responseText += `• Sữa bò tươi (Mộc Châu)\n\n`;
        
        responseText += `**BBQ gia đình:** Có tổ chức theo yêu cầu (phí thêm 300.000đ/người)\n\n`;
        responseText += `**Không ăn theo tour:** Giảm 400.000đ/người\n\n`;
        responseText += `**Lưu ý:** Có thể yêu cầu ăn chay/kiêng đồ ăn nhất định\n\n`;
        responseText += `Bạn có yêu cầu đặc biệt về ẩm thực không?`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về lưu trú" }
        ];
      }
      break;

    case 'AskTransport':
      if (userLanguage === 'vi') {
        responseText = `🚗 **Phương tiện di chuyển:**\n\n`;
        responseText += `**Xe khách giường nằm:** 2.200.000 - 2.500.000đ\n`;
        responseText += `• Thời gian: 5-6 tiếng từ Hà Nội\n`;
        responseText += `• Xe 45 chỗ, có toilet, điều hòa\n`;
        responseText += `• Khởi hành: 22:00 hoặc 06:00\n\n`;
        
        responseText += `**Tàu hỏa:** 2.900.000 - 3.200.000đ\n`;
        responseText += `• Thời gian: 8 tiếng (tàu đêm)\n`;
        responseText += `• Toa giường nằm khoang 4 người\n`;
        responseText += `• Trải nghiệm độc đáo\n\n`;
        
        responseText += `**Máy bay:** 4.200.000 - 4.500.000đ\n`;
        responseText += `• Bay thẳng đến sân bay gần nhất\n`;
        responseText += `• Tiết kiệm thời gian tối đa\n`;
        responseText += `• Chỉ áp dụng một số tour\n\n`;
        
        responseText += `**Xe riêng/VIP:** Theo yêu cầu\n`;
        responseText += `• 7-16 chỗ tùy nhu cầu\n`;
        responseText += `• Linh hoạt lịch trình\n`;
        responseText += `• Phí thêm 2.000.000 - 5.000.000đ\n\n`;
        
        responseText += `**Tự túc:** Giảm 500.000 - 1.200.000đ/người\n\n`;
        responseText += `**Đưa đón tại nhà:** Có (trong nội thành HN, phí 200.000đ khứ hồi)\n\n`;
        responseText += `Bạn muốn chọn phương tiện nào?`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về lưu trú" }
        ];
      }
      break;

    case 'AskPolicies':
      if (userLanguage === 'vi') {
        responseText = `📋 **Chính sách tour:**\n\n`;
        responseText += `**💰 Thanh toán:**\n`;
        responseText += `• Cọc: 30% khi đăng ký\n`;
        responseText += `• Thanh toán đủ: Trước 7 ngày khởi hành\n`;
        responseText += `• Hình thức: Tiền mặt, CK, thẻ, ví điện tử\n`;
        responseText += `• Xuất hóa đơn VAT đầy đủ\n\n`;
        
        responseText += `**❌ Chính sách hủy tour:**\n`;
        responseText += `• Trước 15 ngày: Hoàn 100% cọc\n`;
        responseText += `• 7-14 ngày: Hoàn 50% cọc\n`;
        responseText += `• Dưới 7 ngày: Mất toàn bộ cọc\n`;
        responseText += `• Hủy do thời tiết: Hoàn 100%\n\n`;
        
        responseText += `**🔄 Thay đổi booking:**\n`;
        responseText += `• Đổi tên: Miễn phí trước 7 ngày\n`;
        responseText += `• Đổi ngày: 500.000đ/người\n`;
        responseText += `• Đổi tour: Tính chênh lệch giá\n\n`;
        
        responseText += `**⏰ Chính sách trễ giờ:**\n`;
        responseText += `• Đợi tối đa 30 phút\n`;
        responseText += `• Trễ quá giờ: Tự túc đến điểm hẹn\n\n`;
        
        responseText += `**🛡️ Bảo hiểm:**\n`;
        responseText += `• Bảo hiểm du lịch: 20 triệu đồng/người\n`;
        responseText += `• Bảo hiểm tai nạn: 100 triệu đồng/người\n\n`;
        
        responseText += `**🏔️ Phụ phí mùa cao điểm:**\n`;
        responseText += `• Tết Dương lịch, Âm lịch: +20%\n`;
        responseText += `• Lễ 30/4, 2/9: +15%\n`;
        responseText += `• Cuối tuần: +10%\n\n`;

        responseText += `Bạn cần làm rõ điều khoản nào?`;

        suggestions = [
          { title: "Đặt tour ngay" },
          { title: "Hỏi về thanh toán" },
          { title: "Liên hệ hotline" }
        ];
      }
      break;

    case 'AskWeather':
      const location = parameters.destination || (userLanguage === 'vi' ? 'Tây Bắc' : 'Northwest Vietnam');
      if (userLanguage === 'vi') {
        responseText = `🌤️ **Thời tiết ${location}:**\n\n`;
        responseText += `**Mùa xuân (3-5):** 15-22°C\n`;
        responseText += `• Ấm áp, hoa đào nở rộ\n`;
        responseText += `• Thích hợp trekking, chụp ảnh\n\n`;

        responseText += `**Mùa hè (6-8):** 20-28°C\n`;
        responseText += `• Mưa nhiều, ẩm ướt\n`;
        responseText += `• Thác nước đẹp, mát mẻ\n\n`;

        responseText += `**⭐ Mùa thu (9-11):** 12-20°C - TỐT NHẤT\n`;
        responseText += `• Mát mẻ, ít mưa\n`;
        responseText += `• Lúa chín vàng, cảnh đẹp nhất\n\n`;

        responseText += `**Mùa đông (12-2):** 5-15°C\n`;
        responseText += `• Lạnh, có sương mù\n`;
        responseText += `• Sapa có thể có tuyết\n\n`;

        responseText += `**🎒 Đồ cần mang:**\n`;
        responseText += `• Áo ấm (bắt buộc mùa đông)\n`;
        responseText += `• Áo mưa, giày chống trượt\n`;
        responseText += `• Kem chống nắng, nón\n\n`;

        responseText += `Bạn dự định đi vào mùa nào?`;

        suggestions = [
          { title: "Xem lịch trình" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về hoạt động" }
        ];
      } else {
        responseText = `Current weather in ${location}: 15-25°C, cool and pleasant. Bring warm clothes and rain jacket.`;
      }
      break;

    case 'AskActivities':
      if (userLanguage === 'vi') {
        responseText = `🎯 **Hoạt động & trải nghiệm:**\n\n`;
        responseText += `**🏔️ Sapa:**\n`;
        responseText += `• Trekking chinh phục Fansipan\n`;
        responseText += `• Thăm bản Cát Cát, Tả Van, Y Tý\n`;
        responseText += `• Chợ phiên Bắc Hà (thứ 7)\n`;
        responseText += `• Trải nghiệm văn hóa H'Mông, Dao đỏ\n`;
        responseText += `• Check-in cầu Mây, ga tàu cũ\n\n`;

        responseText += `**🌿 Mộc Châu:**\n`;
        responseText += `• Thăm đồi chè bất tận\n`;
        responseText += `• Rừng thông Bản Áng\n`;
        responseText += `• Trang trại bò sữa\n`;
        responseText += `• Thưởng thức chè Shan tuyết\n\n`;

        responseText += `**🏞️ Mai Châu:**\n`;
        responseText += `• Chèo thuyền độc mộc\n`;
        responseText += `• Homestay với người Thái\n`;
        responseText += `• Xem múa xòe, uống rượu cần\n`;
        responseText += `• Đi xe đạp qua thung lũng\n\n`;

        responseText += `**🎪 Hoạt động nhóm:**\n`;
        responseText += `• Team building có hướng dẫn\n`;
        responseText += `• Gala đêm với MC chuyên nghiệp\n`;
        responseText += `• Hoạt động thiện nguyện\n`;
        responseText += `• Chụp ảnh flycam\n\n`;

        responseText += `**🛍️ Mua sắm:**\n`;
        responseText += `• Thổ cẩm, đồ thủ công\n`;
        responseText += `• Chè đặc sản, mật ong rừng\n`;
        responseText += `• Rượu cần, rượu táo mèo\n\n`;

        responseText += `Bạn quan tâm hoạt động nào nhất?`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về thời tiết" }
        ];
      } else {
        responseText = `Northwest Vietnam activities: Trekking, visiting ethnic villages, cultural experiences, local markets, traditional crafts.`;
      }
      break;

    case 'AskDocuments':
      if (userLanguage === 'vi') {
        responseText = `📄 **Giấy tờ cần thiết:**\n\n`;
        responseText += `**✅ Bắt buộc:**\n`;
        responseText += `• CMND/CCCD hoặc Hộ chiếu (bản gốc)\n`;
        responseText += `• Trẻ em: Giấy khai sinh (có ảnh)\n\n`;

        responseText += `**🛡️ Bảo hiểm:**\n`;
        responseText += `• Tour đã bao gồm bảo hiểm du lịch\n`;
        responseText += `• Có thể mua thêm bảo hiểm nâng cao\n\n`;

        responseText += `**📋 Giấy tờ khác:**\n`;
        responseText += `• Giấy xác nhận sức khỏe (nếu trên 65 tuổi)\n`;
        responseText += `• Giấy chứng nhận tiêm chủng (nếu cần)\n\n`;

        responseText += `Tất cả đều rất đơn giản, không cần thủ tục phức tạp! 😊`;

        suggestions = [
          { title: "Đặt tour ngay" },
          { title: "Hỏi về chính sách" },
          { title: "Liên hệ hotline" }
        ];
      }
      break;

    case 'AskSupport':
      if (userLanguage === 'vi') {
        responseText = `🛠️ **Hỗ trợ khách hàng:**\n\n`;
        responseText += `**📞 Hotline 24/7:** 1900-1234\n`;
        responseText += `• Hỗ trợ trong và ngoài giờ tour\n`;
        responseText += `• Xử lý sự cố khẩn cấp\n\n`;

        responseText += `**👥 Hướng dẫn viên:**\n`;
        responseText += `• Tiếng Việt: Tất cả tour\n`;
        responseText += `• Tiếng Anh: Theo yêu cầu\n`;
        responseText += `• Tiếng Trung, Hàn: Tour cao cấp\n\n`;

        responseText += `**🏥 Y tế:**\n`;
        responseText += `• Hộp thuốc sơ cứu cơ bản\n`;
        responseText += `• Y tá đi cùng (nhóm 20+ người)\n`;
        responseText += `• Liên hệ bệnh viện địa phương\n\n`;

        responseText += `**📱 Liên hệ nhanh:**\n`;
        responseText += `• Zalo/WhatsApp: 0987-654-321\n`;
        responseText += `• Email: support@lotusnomadtravel.vn\n`;
        responseText += `• Facebook: @LotusNomadTravelVN\n\n`;

        responseText += `**🆘 Trường hợp mất đồ:**\n`;
        responseText += `• Báo ngay cho HDV\n`;
        responseText += `• Hỗ trợ làm giấy tờ khẩn cấp\n`;
        responseText += `• Bồi thường theo quy định\n\n`;

        responseText += `Chúng tôi luôn bên bạn! 🤝`;

        suggestions = [
          { title: "Đặt tour ngay" },
          { title: "Hỏi về chính sách" },
          { title: "Liên hệ hotline" }
        ];
      }
      break;

    case 'BookTour':
      const tourBook = parameters.tour || 'sapa_classic';
      const destBook = parameters.destination || 'Sapa';
      const bookingDate = parameters.startDate || 'chưa xác định';
      const groupSize = parameters.numPeople || 1;
      const transportBook = parameters.TransportType || 'xe_khach';

      if (userLanguage === 'vi') {
        // Calculate price based on tour, transport, group size
        let basePrice = tourPrices[tourBook]?.[transportBook] || 2500000;
        let discount = 0;
        if (groupSize >= 5) discount = 10;
        if (groupSize >= 10) discount = 15;
        const finalPrice = Math.round(basePrice * (1 - discount / 100));

        responseText = `✅ **Xác nhận yêu cầu đặt tour Tây Bắc!**\n\n`;
        responseText += `🎯 **Tour:** ${tourBook.toUpperCase()} đến ${destBook}\n`;
        responseText += `👥 **Số người:** ${groupSize} (bao gồm trẻ em)\n`;
        responseText += `🚗 **Phương tiện:** ${transportBook.replace('_', ' ')}\n`;
        responseText += `📅 **Thời gian:** 3 ngày 2 đêm (tháng ${bookingDate ? new Date(bookingDate).getMonth() + 1 : '10'})\n\n`;

        responseText += `💎 **Lựa chọn gói tour:**\n`;
        responseText += `• **Tiêu chuẩn (Economy):** 2.500.000 - 3.500.000đ/người\n`;
        responseText += `  - Khách sạn 3 sao, xe giường nằm, ăn 3 bữa/ngày\n`;
        responseText += `• **Cao cấp (Luxury):** 4.000.000 - 5.500.000đ/người\n`;
        responseText += `  - Resort 4-5 sao, xe limousine, ăn buffet cao cấp, HDV riêng\n\n`;

        responseText += `✨ **Giá của bạn:** ${finalPrice.toLocaleString()}đ/người (đã giảm ${discount}% nhóm)\n\n`;

        responseText += `📋 **Đã bao gồm:**\n`;
        responseText += `• Xe đưa đón khứ hồi từ Hà Nội\n`;
        responseText += `• Lưu trú 3 sao (phòng đôi/twin)\n`;
        responseText += `• Ăn 3 bữa/ngày (Việt Nam & địa phương)\n`;
        responseText += `• Hướng dẫn viên chuyên nghiệp\n`;
        responseText += `• Vé tham quan tất cả điểm\n`;
        responseText += `• Bảo hiểm du lịch 20 triệuđ\n\n`;

        responseText += `❌ **Không bao gồm:**\n`;
        responseText += `• Chi phí cá nhân, tips HDV (50k/người/ngày)\n`;
        responseText += `• Đồ uống có cồn, mua sắm\n`;
        responseText += `• Phụ phí phòng đơn (+500k)\n\n`;

        responseText += `🎁 **Ưu đãi đặc biệt:**\n`;
        responseText += `• Trẻ em <5 tuổi: Miễn phí\n`;
        responseText += `• 5-10 tuổi: Giảm 50%\n`;
        responseText += `• Nhóm ${groupSize >= 5 ? 'của bạn' : '5+ người'}: Đã áp dụng ${discount}%\n\n`;

        responseText += `📝 **Quy trình đặt tour:**\n`;
        responseText += `1. **Xác nhận chi tiết:** Gọi/Zalo 1900-1234 hoặc chat để cung cấp họ tên, số ĐT, email\n`;
        responseText += `2. **Cọc đặt chỗ:** 30% tổng giá trị (chuyển khoản/Momo/ZaloPay)\n`;
        responseText += `3. **Hợp đồng & thanh toán:** Ký online, trả đủ trước 7 ngày\n`;
        responseText += `4. **Xác nhận cuối:** Nhận lịch trình chi tiết & voucher\n\n`;

        responseText += `⏰ **Khả dụng:** Còn chỗ! Book ngay để giữ giá tốt.\n`;
        responseText += `📞 **Liên hệ ngay:** Hotline 1900-1234 | Zalo: 0987-654-321 | Email: info@taybactour.vn\n\n`;
        responseText += `Cảm ơn bạn! Chúng tôi cam kết mang đến trải nghiệm tuyệt vời. 😊🏔️`;

        suggestions = [
          { title: "Chọn gói Economy" },
          { title: "Chọn gói Luxury" },
          { title: "Liên hệ đặt ngay" }
        ];
      } else {
        // English fallback
        responseText = `Booking confirmed for ${tourBook} to ${destBook} (${groupSize} people, ${transport}). Economy: 2.5M-3.5M VND/person. Luxury: 4M-5.5M VND/person. Includes transport, meals, hotel, guide. Deposit 30% to book. Contact 1900-1234.`;
      }
      break;

    case 'ChangeBooking':
      if (userLanguage === 'vi') {
        responseText = `🔄 **Thay đổi booking:**\n\n`;
        responseText += `📋 **Cần thông tin:**\n`;
        responseText += `• Mã booking của bạn\n`;
        responseText += `• Nội dung muốn thay đổi\n`;
        responseText += `• Lý do thay đổi\n\n`;

        responseText += `⚡ **Có thể thay đổi:**\n`;
        responseText += `• Ngày khởi hành (phí 500k/người)\n`;
        responseText += `• Số lượng người (tùy tình hình)\n`;
        responseText += `• Phương tiện di chuyển\n`;
        responseText += `• Loại phòng khách sạn\n`;
        responseText += `• Thông tin cá nhân\n\n`;

        responseText += `⏰ **Thời hạn:** Trước 7 ngày khởi hành\n\n`;
        responseText += `📞 **Liên hệ:** 1900-1234 với mã booking`;

        suggestions = [
          { title: "Liên hệ hotline" },
          { title: "Hỏi về chính sách" },
          { title: "Hủy tour" }
        ];
      } else {
        responseText = `To change booking, provide booking code and change details. Contact 1900-1234.`;
      }
      break;

    case 'CancelBooking':
      if (userLanguage === 'vi') {
        responseText = `❌ **Hủy tour:**\n\n`;
        responseText += `📋 **Cần thông tin:**\n`;
        responseText += `• Mã booking\n`;
        responseText += `• Lý do hủy tour\n`;
        responseText += `• Thông tin tài khoản nhận hoàn tiền\n\n`;

        responseText += `💰 **Chính sách hoàn tiền:**\n`;
        responseText += `• Trước 15 ngày: Hoàn 100% cọc\n`;
        responseText += `• 7-14 ngày: Hoàn 50% cọc\n`;
        responseText += `• Dưới 7 ngày: Mất toàn bộ cọc\n`;
        responseText += `• Do thời tiết xấu: Hoàn 100%\n`;
        responseText += `• Do dịch bệnh: Hoàn 100%\n\n`;

        responseText += `⏱️ **Thời gian xử lý:** 3-7 ngày làm việc\n\n`;
        responseText += `📞 **Hotline hủy tour:** 1900-1234`;

        suggestions = [
          { title: "Liên hệ hotline" },
          { title: "Hỏi về chính sách" },
          { title: "Thay đổi booking" }
        ];
      } else {
        responseText = `Tour cancellation: Provide booking code. Refund policy: 100% if 15+ days, 50% if 7-14 days before departure.`;
      }
      break;

    case 'AskRecommendations':
      if (userLanguage === 'vi') {
        responseText = `⭐ **Gợi ý tour hot nhất:**\n\n`;
        responseText += `🥇 **Top 1: Sapa 3N2Đ cổ điển**\n`;
        responseText += `• Giá: 2.500.000đ/người\n`;
        responseText += `• Fansipan + Bản Cát Cát + Chợ phiên\n`;
        responseText += `• Đánh giá: ⭐⭐⭐⭐⭐ (4.8/5)\n\n`;

        responseText += `🥈 **Top 2: Mộc Châu 2N1Đ trà xanh**\n`;
        responseText += `• Giá: 2.200.000đ/người\n`;
        responseText += `• Đồi chè + Rừng thông + Sữa bò\n`;
        responseText += `• Đánh giá: ⭐⭐⭐⭐⭐ (4.7/5)\n\n`;

        responseText += `🥉 **Top 3: Mai Châu 3N2Đ văn hóa Thái**\n`;
        responseText += `• Giá: 2.300.000đ/người\n`;
        responseText += `• Homestay + Múa xòe + Rượu cần\n`;
        responseText += `• Đánh giá: ⭐⭐⭐⭐⭐ (4.6/5)\n\n`;

        responseText += `🎯 **Gợi ý theo mùa:**\n`;
        responseText += `• Mùa thu: Tất cả đều tuyệt đẹp\n`;
        responseText += `• Mùa xuân: Sapa (hoa đào) 🌸\n`;
        responseText += `• Mùa hè: Mộc Châu (mát mẻ) 🌿\n`;
        responseText += `• Mùa đông: Mai Châu (ấm hơn) 🔥\n\n`;

        responseText += `💡 **Tips từ chuyên gia:**\n`;
        responseText += `• Đi nhóm 4-6 người để giá tốt\n`;
        responseText += `• Book trước 2 tuần để có chỗ đẹp\n`;
        responseText += `• Mang giày trekking chắc chắn\n`;
        responseText += `• Chuẩn bị áo ấm cho buổi sáng sớm\n\n`;

        responseText += `Bạn thích kiểu tour nào? Tôi sẽ tư vấn cụ thể hơn! 😊`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về lịch trình" }
        ];
      } else {
        responseText = `Top recommendations: 1) Sapa 3D2N classic, 2) Moc Chau tea tour 2D1N, 3) Mai Chau culture 3D2N. All highly rated!`;
      }
      break;

    case 'AskContact':
      if (userLanguage === 'vi') {
        responseText = `📞 **Thông tin liên hệ:**\n\n`;
        responseText += `**🏢 Văn phòng chính:**\n`;
        responseText += `• Địa chỉ: 123 Đường ABC, Hoàn Kiếm, Hà Nội\n`;
        responseText += `• Giờ làm việc: 8:00 - 18:00 (T2-T7)\n`;
        responseText += `• Chủ nhật: 9:00 - 17:00\n\n`;

        responseText += `**📱 Liên hệ nhanh:**\n`;
        responseText += `• Hotline 24/7: 1900-1234\n`;
        responseText += `• Zalo/WhatsApp: 0987-654-321\n`;
        responseText += `• Viber: 0987-654-321\n\n`;

        responseText += `**💻 Kênh online:**\n`;
        responseText += `• Website: www.lotusnomadtravel.vn\n`;
        responseText += `• Email: info@lotusnomadtravel.vn\n`;
        responseText += `• Facebook: fb.com/LotusNomadTravelVN\n`;
        responseText += `• Instagram: @lotusnomadtravel\n`;
        responseText += `• YouTube: Lotus Nomad Travel\n\n`;

        responseText += `**🚗 Chi nhánh:**\n`;
        responseText += `• Sapa: 456 Đường Cầu Mây, Sapa\n`;
        responseText += `• Mộc Châu: 789 TT Mộc Châu, Sơn La\n`;
        responseText += `• Mai Châu: 321 TT Mai Châu, Hòa Bình\n\n`;

        responseText += `**🎧 Hỗ trợ khách hàng:**\n`;
        responseText += `• Tư vấn: ext 1\n`;
        responseText += `• Booking: ext 2\n`;
        responseText += `• Khiếu nại: ext 3\n`;
        responseText += `• Khẩn cấp: ext 9\n\n`;

        responseText += `Liên hệ ngay để được tư vấn miễn phí! 🆓`;

        suggestions = [
          { title: "Đặt tour ngay" },
          { title: "Hỏi về chính sách" },
          { title: "Xem gợi ý tour" }
        ];
      } else {
        responseText = `Contact us: Hotline 24/7: 1900-1234, WhatsApp: 0987-654-321, Email: info@lotusnomadtravel.vn, Website: www.lotusnomadtravel.vn`;
      }
      break;

    case 'AskIdealTime':
      const destIdeal = parameters.destination || (userLanguage === 'vi' ? 'Tây Bắc' : 'Northwest Vietnam');

      if (userLanguage === 'vi') {
        responseText = `🗓️ **Thời điểm lý tưởng du lịch ${destIdeal}:**\n\n`;

        responseText += `⭐ **TUYỆT NHẤT: Mùa thu (9-11)**\n`;
        responseText += `• Thời tiết: 15-22°C, mát mẻ dễ chịu\n`;
        responseText += `• Cảnh quan: Lúa chín vàng óng\n`;
        responseText += `• Ưu điểm: Ít mưa, trời trong xanh\n`;
        responseText += `• Lưu ý: Giá cao hơn, cần book sớm\n\n`;

        responseText += `🌸 **RẤT ĐẸP: Mùa xuân (2-4)**\n`;
        responseText += `• Thời tiết: 12-20°C, mát lạnh\n`;
        responseText += `• Cảnh quan: Hoa đào, hoa mận nở rộ\n`;
        responseText += `• Ưu điểm: Không đông khách\n`;
        responseText += `• Lưu ý: Đêm có thể lạnh, mang áo ấm\n\n`;

        responseText += `🌿 **TẠM ỔN: Mùa hè (5-8)**\n`;
        responseText += `• Thời tiết: 18-28°C, mưa nhiều\n`;
        responseText += `• Cảnh quan: Xanh tươi, thác đẹp\n`;
        responseText += `• Ưu điểm: Mát mẻ hơn miền xuôi\n`;
        responseText += `• Lưu ý: Cần áo mưa, đường trơn trượt\n\n`;

        responseText += `❄️ **THÁCH THỨC: Mùa đông (12-2)**\n`;
        responseText += `• Thời tiết: 5-15°C, rất lạnh\n`;
        responseText += `• Cảnh quan: Sương mù, có thể có tuyết\n`;
        responseText += `• Ưu điểm: Giá rẻ, trải nghiệm độc đáo\n`;
        responseText += `• Lưu ý: Cần đồ ấm dày, một số đường đóng\n\n`;

        responseText += `📅 **Lịch cụ thể theo địa điểm:**\n`;
        responseText += `• Sapa: Tốt nhất 9-11, 3-4\n`;
        responseText += `• Mộc Châu: Tốt nhất 10-12, 3-5\n`;
        responseText += `• Mai Châu: Tốt quanh năm, tránh 6-8\n\n`;

        responseText += `Bạn dự định đi vào thời gian nào? Tôi sẽ tư vấn chi tiết hơn! 😊`;

        suggestions = [
          { title: "Xem giá tour" },
          { title: "Đặt tour ngay" },
          { title: "Hỏi về hoạt động" }
        ];
      } else {
        responseText = `Best time to visit ${destIdeal}: Autumn (Sep-Nov) for perfect weather and golden rice fields. Spring (Feb-Apr) also beautiful with blooming flowers. Avoid rainy summer.`;
      }
      break;

    case 'FAQ':
      const topic = parameters.topic || '';
      
      if (userLanguage === 'vi') {
        responseText = `❓ **Câu hỏi thường gặp:**\n\n`;
        
        if (topic.includes('thanh toán') || topic.includes('payment')) {
          responseText += `💳 **Thanh toán:**\n`;
          responseText += `• Tiền mặt: Tại văn phòng hoặc HDV\n`;
          responseText += `• Chuyển khoản: MB Bank, Vietcombank, BIDV\n`;
          responseText += `• Thẻ tín dụng: Visa, MasterCard (phí 3%)\n`;
          responseText += `• Ví điện tử: MoMo, ZaloPay, ViettelPay\n`;
          responseText += `• Trả góp: 0% qua thẻ tín dụng (6-12 tháng)\n`;
        } else if (topic.includes('đồ') || topic.includes('mang')) {
          responseText += `🎒 **Đồ cần mang theo:**\n`;
          responseText += `• Áo ấm (bắt buộc), áo mưa\n`;
          responseText += `• Giày trekking chống trượt\n`;
          responseText += `• Nón, kính râm, kem chống nắng\n`;
          responseText += `• Thuốc cá nhân, dầu gió\n`;
          responseText += `• Pin dự phòng, túi nilon chống ướt\n`;
          responseText += `• CMND/CCCD bản gốc\n`;
        } else if (topic.includes('ăn') || topic.includes('food')) {
          responseText += `🍽️ **Ẩm thực:**\n`;
          responseText += `• Tour bao gồm đầy đủ bữa ăn\n`;
          responseText += `• Đặc sản: Thịt lợn bản, cá suối, thắng cố\n`;
          responseText += `• Chay/kiêng: Báo trước khi đăng ký\n`;
          responseText += `• Nước uống: Tự túc (khoảng 30k/chai)\n`;
          responseText += `• BBQ tự chọn: Thêm 300k/người\n`;
        } else if (topic.includes('ở') || topic.includes('khách sạn')) {
          responseText += `🏨 **Lưu trú:**\n`;
          responseText += `• Khách sạn 3-4 sao tiêu chuẩn\n`;
          responseText += `• Homestay truyền thống (tùy tour)\n`;
          responseText += `• Phòng đôi/đơn theo yêu cầu\n`;
          responseText += `• Villa nhóm lớn (8+ người)\n`;
          responseText += `• Tiện nghi: WiFi, TV, điều hòa, nước nóng\n`;
        } else {
          responseText += `🔥 **TOP 5 câu hỏi hot:**\n\n`;
          responseText += `1️⃣ **"Giá tour đã bao gồm hết chưa?"**\n`;
          responseText += `→ Đã bao gồm: Di chuyển, ăn ở, HDV, vé tham quan, bảo hiểm\n`;
          responseText += `→ Chưa bao gồm: Chi tiêu cá nhân, đồ uống có cồn\n\n`;
          
          responseText += `2️⃣ **"Thời tiết có đẹp không?"**\n`;
          responseText += `→ Mùa thu (9-11) đẹp nhất, mùa xuân (3-4) cũng ok\n`;
          responseText += `→ Tránh mùa mưa hè, mùa đông cần áo ấm dày\n\n`;
          
          responseText += `3️⃣ **"Đi nhóm có giảm giá không?"**\n`;
          responseText += `→ 5+ người: Giảm 10%\n`;
          responseText += `→ 10+ người: Giảm 15%\n`;
          responseText += `→ 20+ người: Giảm 20%\n\n`;
          
          responseText += `4️⃣ **"Hủy tour có mất tiền không?"**\n`;
          responseText += `→ Trước 15 ngày: Hoàn 100%\n`;
          responseText += `→ 7-14 ngày: Hoàn 50%\n`;
          responseText += `→ Dưới 7 ngày: Mất cọc\n\n`;
          
          responseText += `5️⃣ **"Tour có an toàn không?"**\n`;
          responseText += `→ HDV kinh nghiệm, bảo hiểm đầy đủ\n`;
          responseText += `→ Xe đời mới, tài xế chuyên nghiệp\n`;
          responseText += `→ Hotline 24/7 hỗ trợ khẩn cấp\n\n`;
        }
        
        responseText += `\n💬 Còn thắc mắc gì khác không? Hỏi tôi nhé!`;

        suggestions = [
          { title: "Đặt tour ngay" },
          { title: "Hỏi về chính sách" },
          { title: "Liên hệ hotline" }
        ];
      } else {
        responseText = `FAQ: Payment methods include cash, bank transfer, credit cards. Bring warm clothes, trekking shoes. Tours include all meals and accommodation. Group discounts available.`;
      }
      break;

    case 'SmallTalk':
      if (queryText.includes('cảm ơn') || queryText.includes('thank')) {
        if (userLanguage === 'vi') {
          responseText = `🙏 Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!\n\nNếu cần hỗ trợ thêm về tour du lịch Tây Bắc, đừng ngại liên hệ nhé! Chúc bạn có chuyến đi tuyệt vời! 🌟✈️`;

          suggestions = [
            { title: "Xem gợi ý tour" },
            { title: "Liên hệ hotline" },
            { title: "Đặt tour ngay" }
          ];
        } else {
          responseText = `Thank you for choosing our service! Feel free to ask if you need more help with Lotus Nomad Travel tours! 🌟`;
        }
      } else if (queryText.includes('tạm biệt') || queryText.includes('bye')) {
        if (userLanguage === 'vi') {
          responseText = `👋 Tạm biệt và cảm ơn bạn!\n\nHãy nhớ liên hệ 1900-1234 khi sẵn sàng khám phá Tây Bắc nhé! Chúc bạn có ngày tốt lành! 😊🏔️`;

          suggestions = [
            { title: "Xem gợi ý tour" },
            { title: "Liên hệ hotline" },
            { title: "Đặt tour ngay" }
          ];
        } else {
          responseText = `Goodbye and thank you! Contact us at 1900-1234 when ready to explore with Lotus Nomad Travel! Have a great day! 😊`;
        }
      } else {
        if (userLanguage === 'vi') {
          responseText = `😊 Tôi luôn khỏe mạnh và sẵn sàng hỗ trợ bạn về tour du lịch Tây Bắc!\n\nCó gì tôi có thể giúp không? Tour nào bạn quan tâm? 🏔️`;

          suggestions = [
            { title: "Xem gợi ý tour" },
            { title: "Hỏi về giá tour" },
            { title: "Liên hệ hotline" }
          ];
        } else {
          responseText = `I'm always ready to help you with Lotus Nomad Travel tours! What can I assist you with? 😊`;
        }
      }
      break;

    case 'Greeting':
      const currentHour = new Date().getHours();
      let timeGreeting = '';
      
      if (currentHour < 12) {
        timeGreeting = userLanguage === 'vi' ? 'Chào buổi sáng' : 'Good morning';
      } else if (currentHour < 18) {
        timeGreeting = userLanguage === 'vi' ? 'Chào buổi chiều' : 'Good afternoon';  
      } else {
        timeGreeting = userLanguage === 'vi' ? 'Chào buổi tối' : 'Good evening';
      }
      
      if (userLanguage === 'vi') {
        responseText = `👋 ${timeGreeting}! Chào mừng bạn đến với **Lotus Nomad Travel**!\n\n`;
        responseText += `🤖 Tôi là trợ lý AI của chúng tôi, luôn sẵn sàng hỗ trợ bạn 24/7.\n\n`;
        responseText += `🎯 **Tôi có thể giúp bạn:**\n`;
        responseText += `• 🏔️ Tư vấn tour Sapa, Mộc Châu, Mai Châu\n`;
        responseText += `• 📅 Xem chi tiết lịch trình và giá cả\n`;
        responseText += `• 📝 Đặt tour nhanh chóng, dễ dàng\n`;
        responseText += `• ❓ Trả lời mọi câu hỏi về du lịch Tây Bắc\n`;
        responseText += `• 🌤️ Tư vấn thời điểm đi lý tưởng\n`;
        responseText += `• 🛠️ Hỗ trợ thay đổi/hủy booking\n\n`;
        responseText += `🔥 **Ưu đãi đặc biệt:**\n`;
        responseText += `• Giảm 10-20% cho nhóm từ 5 người\n`;
        responseText += `• Trẻ em dưới 5 tuổi: MIỄN PHÍ\n`;
        responseText += `• Book online: Tặng bảo hiểm nâng cao\n\n`;
        responseText += `💬 **Bạn quan tâm điều gì hôm nay?** Cứ thoải mái hỏi tôi nhé! 😊`;

        suggestions = [
          { title: "Xem gợi ý tour" },
          { title: "Hỏi về giá tour" },
          { title: "Xem lịch trình" }
        ];
      } else {
        responseText = `${timeGreeting}! Welcome to Lotus Nomad Travel! I'm your AI assistant, ready to help you 24/7 with tours to Sapa, Moc Chau, and Mai Chau. What would you like to know? 😊`;
      }
      break;

    default:
      if (userLanguage === 'vi') {
        responseText = `🤖 Cảm ơn bạn đã liên hệ với **Lotus Nomad Travel**!\n\n`;
        responseText += `Tôi có thể giúp bạn khám phá vẻ đẹp hùng vĩ của vùng Tây Bắc với những tour chất lượng cao:\n\n`;
        responseText += `🏔️ **Sapa:** Fansipan - nóc nhà Đông Dương\n`;
        responseText += `🌿 **Mộc Châu:** Đồi chè xanh bất tận\n`;
        responseText += `🏞️ **Mai Châu:** Văn hóa Thái độc đáo\n\n`;
        responseText += `✨ Hãy bắt đầu cuộc trò chuyện bằng cách hỏi về giá tour, lịch trình, hoặc đặt tour ngay! 😊`;
      } else {
        responseText = `Thank you for contacting Lotus Nomad Travel! I can help you explore the magnificent beauty of Northwest Vietnam. Ask about tour prices, itineraries, or book now! 😊`;
      }
  }

  const messages = [
    {
      text: {
        text: [responseText]
      }
    }
  ];

  if (suggestions && suggestions.length > 0) {
    messages.push({
      platform: "FACEBOOK",
      payload: {
        quick_replies: suggestions.map(s => ({
          content_type: "text",
          title: s.title,
          payload: s.title
        }))
      }
    });
  }

  const response = {
    fulfillmentText: responseText,
    fulfillmentMessages: messages
  };

  console.log(JSON.stringify(response, null, 2));
