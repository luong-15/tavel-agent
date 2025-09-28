const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Helper function to detect Vietnamese text
function isVietnamese(text) {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
  return vietnamesePattern.test(text);
}

app.post('/taybac-tour', (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;
  const queryText = req.body.queryResult.queryText;

  let responseText = '';

  // Simulate real-time data
  const prices = {
    'sapa_classic': { 'xe_khach': 2500000, 'tau_hoa': 3200000, 'may_bay': 4500000 },
    'mocchau_tea': { 'xe_khach': 2200000, 'tau_hoa': 2900000, 'may_bay': 4200000 },
    'maichau_culture': { 'xe_khach': 2300000, 'tau_hoa': 3000000, 'may_bay': 4300000 }
  };

  const availability = Math.random() > 0.1; // 90% available

  // Detect if user is speaking Vietnamese
  const userLanguage = isVietnamese(queryText) ? 'vi' : 'en';

  switch (intent) {
    case 'Default Fallback Intent':
      if (userLanguage === 'vi') {
        responseText = `Xin lỗi, tôi chưa hiểu rõ câu hỏi "${queryText}". Bạn có thể hỏi về tour du lịch Tây Bắc, giá cả, lịch trình, thời điểm lý tưởng, hoặc đặt tour không?`;
      } else {
        responseText = `Sorry, I didn't understand "${queryText}". You can ask about Tay Bac tours, prices, itinerary, best time to visit, or booking.`;
      }
      break;

    case 'AskTourPrice':
      const tourPrice = parameters.TayBacTour || 'sapa_classic';
      const transportPrice = parameters.TransportType || 'xe_khach';
      const price = prices[tourPrice] ? prices[tourPrice][transportPrice] : 2500000;
      
      if (userLanguage === 'vi') {
        responseText = `Giá tour ${tourPrice} bằng ${transportPrice} là ${price.toLocaleString()}đ/người. Bao gồm ăn uống, khách sạn, hướng dẫn viên. Bạn muốn đặt không?`;
      } else {
        responseText = `The price for ${tourPrice} tour by ${transportPrice} is ${price.toLocaleString()}đ/person. Includes meals, hotel, and guide. Would you like to book?`;
      }
      break;

    case 'AskTourItinerary':
      const destinationIt = parameters.destination || 'Sapa';
      const durationIt = parameters.duration || '2 days';
      
      if (userLanguage === 'vi') {
        responseText = `Lịch trình tour ${destinationIt} trong ${durationIt}: Ngày 1: Khởi hành từ Hà Nội, thăm quan điểm nổi tiếng. Ngày 2: Trải nghiệm văn hóa, thưởng thức ẩm thực địa phương. Chi tiết hơn vui lòng hỏi!`;
      } else {
        responseText = `${destinationIt} tour itinerary for ${durationIt}: Day 1: Departure from Hanoi, visit famous attractions. Day 2: Cultural experience, enjoy local cuisine. Ask for more details!`;
      }
      break;

    case 'AskIdealTime':
      const destIdeal = parameters.destination || 'Sapa';
      
      if (userLanguage === 'vi') {
        responseText = `Thời điểm lý tưởng du lịch ${destIdeal} là mùa thu (9-11) với thời tiết mát mẻ, hoa ban nở. Mùa xuân (2-4) cũng đẹp với hoa đào. Tránh mùa mưa hè.`;
      } else {
        responseText = `The ideal time to visit ${destIdeal} is autumn (Sep-Nov) with cool weather and blooming flowers. Spring (Feb-Apr) is also beautiful with peach blossoms. Avoid rainy summer season.`;
      }
      break;

    case 'BookTour':
      const tourBook = parameters.tour || 'sapa_classic';
      const destBook = parameters.destination || 'Sapa';
      
      if (availability) {
        if (userLanguage === 'vi') {
          responseText = `Tour ${tourBook} đến ${destBook} còn chỗ! Vui lòng cung cấp số người, ngày đi, thông tin liên hệ để tôi xử lý booking.`;
        } else {
          responseText = `${tourBook} tour to ${destBook} is available! Please provide number of people, departure date, and contact info for booking.`;
        }
      } else {
        if (userLanguage === 'vi') {
          responseText = `Xin lỗi, tour ${tourBook} hiện đã hết chỗ. Bạn có thể chọn tour khác hoặc ngày khác.`;
        } else {
          responseText = `Sorry, ${tourBook} tour is currently fully booked. You can choose another tour or different dates.`;
        }
      }
      break;

    case 'ChangeBooking':
      if (userLanguage === 'vi') {
        responseText = `Để thay đổi booking, vui lòng cung cấp mã booking và chi tiết thay đổi. Tôi sẽ kiểm tra và cập nhật cho bạn.`;
      } else {
        responseText = `To change your booking, please provide booking code and change details. I'll check and update for you.`;
      }
      break;

    case 'CancelBooking':
      if (userLanguage === 'vi') {
        responseText = `Hủy tour: Cung cấp mã booking để kiểm tra chính sách. Hủy trước 7 ngày hoàn 100% tiền.`;
      } else {
        responseText = `Tour cancellation: Provide booking code to check policy. Cancel 7+ days before for 100% refund.`;
      }
      break;

    case 'AskWeather':
      const location = parameters.destination || 'Tay Bac region';
      if (userLanguage === 'vi') {
        responseText = `Thời tiết tại ${location} hiện tại khá mát mẻ, nhiệt độ 15-25°C. Nên mang theo áo ấm và áo mưa.`;
      } else {
        responseText = `Current weather in ${location} is quite cool, temperature 15-25°C. Bring warm clothes and rain jacket.`;
      }
      break;

    case 'AskActivities':
      if (userLanguage === 'vi') {
        responseText = `Hoạt động ở Tây Bắc: Trekking, thăm bản làng dân tộc, chụp ảnh ruộng bậc thang, thưởng thức ẩm thực, mua sắm thổ cẩm.`;
      } else {
        responseText = `Tay Bac activities: Trekking, visiting ethnic villages, photographing terraced fields, enjoying local cuisine, shopping for traditional textiles.`;
      }
      break;

    default:
      if (userLanguage === 'vi') {
        responseText = 'Cảm ơn bạn đã liên hệ với Tay Bac Tour Bot! Tôi có thể giúp bạn tìm hiểu về tour du lịch Tây Bắc.';
      } else {
        responseText = 'Thank you for contacting Tay Bac Tour Bot! I can help you learn about Tay Bac tours.';
      }
  }

  res.json({
    fulfillmentText: responseText
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook listening on port ${port}`);
});
