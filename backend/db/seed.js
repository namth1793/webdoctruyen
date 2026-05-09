const db = require('./schema');

// Clear existing data
db.exec(`
  DELETE FROM ratings;
  DELETE FROM comments;
  DELETE FROM story_tags;
  DELETE FROM tags;
  DELETE FROM reading_history;
  DELETE FROM bookmarks;
  DELETE FROM chapters;
  DELETE FROM stories;
  DELETE FROM categories;
  DELETE FROM users;
  DELETE FROM affiliate_links;
  DELETE FROM admin_users;
`);

// Categories
const cats = db.prepare(`INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)`);
cats.run('Ngôn tình', 'ngon-tinh', 'Truyện ngôn tình lãng mạn ngọt ngào', '#ec4899');
cats.run('Đam mỹ', 'dam-my', 'Truyện đam mỹ BL/Yaoi', '#8b5cf6');
cats.run('Tiểu thuyết', 'tieu-thuyet', 'Tiểu thuyết đa thể loại', '#3b82f6');
cats.run('Thể loại khác', 'the-loai-khac', 'Các thể loại khác', '#10b981');

const catMap = {};
db.prepare('SELECT * FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

// Stories data
const stories = [
  {
    title: 'Thập Nhật Chung Yên',
    slug: 'thap-nhat-chung-yen',
    author: 'Hạ Thần Nguyệt',
    cover: 'https://picsum.photos/seed/thap-nhat/300/400',
    desc: 'Truyện kể về Hàn Tư và Lục Trình bị mắc kẹt trong vòng lặp tận thế kéo dài 10 ngày. Mỗi lần thế giới sụp đổ, họ lại tỉnh dậy vào buổi sáng ngày đầu tiên. Trong những ngày cuối cùng của thế giới, hai người dần hiểu ra rằng người duy nhất họ cần bên cạnh chính là nhau.',
    status: 'complete',
    totalChapters: 43,
    views: 81124,
    favorites: 4230,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Vô hạn lưu', 'Tận thế', 'HE'],
    featured: 1
  },
  {
    title: 'Điệp Báo Không Giới Hạn',
    slug: 'diep-bao-khong-gioi-han',
    author: 'Mặc Hương Đồng Khứu',
    cover: 'https://picsum.photos/seed/diep-bao/300/400',
    desc: 'Điệp viên thiên tài Tô Hiểu Hải xuyên vào thời dân quốc, trở thành gián điệp hạng A của tổ chức tình báo. Gặp gỡ thiếu tướng lạnh lùng Bạch Liễu Minh, từ đối thủ đến tri kỷ, từ tri kỷ đến tình nhân. Một câu chuyện về tình yêu và lòng trung thành trong thời chiến.',
    status: 'complete',
    totalChapters: 122,
    views: 37914,
    favorites: 2100,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Lịch sử', 'Điệp viên', 'HE'],
    featured: 0
  },
  {
    title: 'Sủng Phi',
    slug: 'sung-phi',
    author: 'Tiểu Mãn Tử',
    cover: 'https://picsum.photos/seed/sung-phi/300/400',
    desc: 'Nàng vốn chỉ là một phi tử bình thường trong hậu cung, không tranh không đoạt. Nhưng mỗi lần hoàng thượng ghé thăm, ngài lại không muốn rời đi. "Ái phi, trẫm chỉ muốn ở bên nàng." Một câu chuyện cung đình ngọt ngào, không cung đấu, không thủ đoạn, chỉ có tình yêu thuần túy.',
    status: 'complete',
    totalChapters: 86,
    views: 25122,
    favorites: 1890,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Cổ trang', 'Sủng văn', 'HE'],
    featured: 0
  },
  {
    title: 'Săn Diệt Gã Chồng Bạch Cốt',
    slug: 'san-diet-ga-chong-bach-cot',
    author: 'Thất Nguyệt Hà',
    cover: 'https://picsum.photos/seed/san-diet/300/400',
    desc: 'Trong game điện nhân hóa, thợ săn Diệp Vũ nhận nhiệm vụ tiêu diệt trùm cuối Bạch Cốt Vương. Nhưng hắn không ngờ rằng trùm cuối này lại có IQ cao đến vậy, thậm chí còn... tán tỉnh mình? Hệ thống ghép đôi thì thầm: "Xin chúc mừng, bạn đã kết hôn với Bạch Cốt Vương!"',
    status: 'complete',
    totalChapters: 74,
    views: 36989,
    favorites: 2560,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Huyền huyễn', 'Game', 'Hài hước', 'HE'],
    featured: 0
  },
  {
    title: 'Kim Cương Không Vỡ',
    slug: 'kim-cuong-khong-vo',
    author: 'Chu Y',
    cover: 'https://picsum.photos/seed/kim-cuong/300/400',
    desc: 'Giang Thành - thiếu gia lạnh lùng của tập đoàn Kim Cương, luôn giữ khoảng cách với mọi người. Cho đến khi anh gặp Trần Dương - chàng trai trẻ nghịch ngợm, lạc quan như ánh nắng. "Anh cứng như kim cương, nhưng em có thể làm anh tan chảy." HE đảm bảo.',
    status: 'complete',
    totalChapters: 89,
    views: 36608,
    favorites: 2340,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Hiện đại', 'Đô thị', 'Sủng văn', 'HE'],
    featured: 0
  },
  {
    title: 'Ma Đạo Tổ Sư',
    slug: 'ma-dao-to-su',
    author: 'Mặc Hương Đồng Khứu',
    cover: 'https://picsum.photos/seed/ma-dao/300/400',
    desc: 'Tổ sư Ma Đạo Ngụy Vô Tiện bị đồng đạo tiêu diệt, tái sinh 16 năm sau trong thân xác một tên thanh niên hèn kém. Anh ta lại gặp Lam Vong Cơ - người anh yêu nhất từ tiền kiếp. Nhưng lần này, mọi thứ đã khác. Một truyện tu tiên cực phẩm với plot twist và tình cảm sâu sắc.',
    status: 'complete',
    totalChapters: 113,
    views: 210000,
    favorites: 15200,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Tu tiên', 'Huyền huyễn', 'Cổ trang', 'HE'],
    featured: 1
  },
  {
    title: 'Nghịch Thiên Phi',
    slug: 'nghich-thien-phi',
    author: 'Phượng Khinh',
    cover: 'https://picsum.photos/seed/nghich-thien/300/400',
    desc: 'Nàng là phi tử bị cả hậu cung khinh thường. Hắn là hoàng đế lạnh lùng được mọi người kính sợ. Khi nàng quyết định không còn cam chịu nữa, khi hắn bắt đầu để ý đến người phụ nữ bị lãng quên này - một cuộc tranh đấu hậu cung đầy kịch tính bắt đầu. Báo thù, tình yêu, và quyền lực đan xen.',
    status: 'complete',
    totalChapters: 210,
    views: 125000,
    favorites: 8900,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Cổ trang', 'Cung đấu', 'Báo thù', 'HE'],
    featured: 1
  },
  {
    title: 'Xuyên Nhanh Nữ Phụ Lên Ngôi',
    slug: 'xuyen-nhanh-nu-phu-len-ngoi',
    author: 'Điền Hạ',
    cover: 'https://picsum.photos/seed/xuyen-nhanh/300/400',
    desc: 'Hệ thống xuyên nhanh giao cho Tống Ninh một nhiệm vụ: đóng vai các nhân vật nữ phụ bị đối xử bất công và giúp họ lật ngược số phận. Từ vợ cả bị chồng phụ bạc, đến tiểu thư bị gia đình chèn ép - mỗi thế giới là một câu chuyện mới với kết thúc viên mãn.',
    status: 'complete',
    totalChapters: 200,
    views: 67000,
    favorites: 4560,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Xuyên nhanh', 'Hệ thống', 'Nữ cường', 'HE'],
    featured: 0
  },
  {
    title: 'Ngọt Sủng Hết Mực',
    slug: 'ngot-sung-het-muc',
    author: 'Tình Thư',
    cover: 'https://picsum.photos/seed/ngot-sung/300/400',
    desc: 'CEO lạnh lùng Trần Hạo gặp lại người con gái 5 năm trước đã cứu anh trong cơn hoạn nạn - Lâm Tiểu Hy. Lần này, anh quyết tâm không để nàng rời đi. "Lâm Tiểu Hy, em là thứ tôi muốn nhất trong cuộc đời này." Ngọt sủng từ đầu đến cuối, đảm bảo HE.',
    status: 'complete',
    totalChapters: 134,
    views: 45000,
    favorites: 3120,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Hiện đại', 'CEO', 'Sủng văn', 'HE'],
    featured: 0
  },
  {
    title: 'Hắc Nguyệt Quang',
    slug: 'hac-nguyet-quang',
    author: 'Đường Tửu',
    cover: 'https://picsum.photos/seed/hac-nguyet/300/400',
    desc: 'Tể tướng lạnh lùng Tần Nguyệt vs Điện Hạ ngạo mạn Chu Hành. Hai người từ thù địch đến không thể thiếu nhau. "Ngươi như ánh trăng đen tối - ta không thể nhìn thẳng, nhưng cũng không thể không nhìn." Cổ trang BL với chính trị cung đình phức tạp.',
    status: 'complete',
    totalChapters: 156,
    views: 52000,
    favorites: 3890,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Cổ trang', 'Triều đình', 'Sủng văn', 'HE'],
    featured: 0
  },
  {
    title: 'Vạn Giới Thần Chủ',
    slug: 'van-gioi-than-chu',
    author: 'Thiên Tàm Thổ Đậu',
    cover: 'https://picsum.photos/seed/van-gioi/300/400',
    desc: 'Nhân vật phản diện Diệp Phong bị đọc giả căm ghét nhất trong truyện tu tiên bỗng có ý thức. Hắn quyết định sẽ không chết theo số phận đã được viết ra. Nhưng khi hắn thay đổi, cả thế giới bắt đầu lộn nhào. Một câu chuyện về sự lựa chọn và số mệnh.',
    status: 'ongoing',
    totalChapters: 450,
    views: 89000,
    favorites: 6700,
    catSlug: 'tieu-thuyet',
    genres: ['Huyền huyễn', 'Tu tiên', 'Phản diện', 'Hệ thống'],
    featured: 1
  },
  {
    title: 'Bá Đạo Tổng Tài Ái Thê Như Mệnh',
    slug: 'ba-dao-tong-tai-ai-the',
    author: 'Hoa Vũ Phong',
    cover: 'https://picsum.photos/seed/ba-dao/300/400',
    desc: 'Ký ức hợp đồng hôn nhân - Mạc Thiên Thành lạnh lùng bá đạo, Diệp Tịnh Như ngây thơ đáng yêu. Anh tưởng chỉ là giao dịch, nhưng từ bao giờ anh đã không thể sống thiếu nàng? "Diệp Tịnh Như, cả đời này em chỉ có thể là vợ ta." 312 chương ngọt ngào đến sâu răng.',
    status: 'complete',
    totalChapters: 312,
    views: 78000,
    favorites: 5430,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Hiện đại', 'Hợp đồng hôn nhân', 'Sủng văn', 'HE'],
    featured: 0
  },
  {
    title: 'Thế Giới Ký',
    slug: 'the-gioi-ky',
    author: 'Phong Nguyệt',
    cover: 'https://picsum.photos/seed/the-gioi/300/400',
    desc: 'Thám hiểm gia Lý Mặc bước vào cánh cổng không gian dị thường và lạc vào một thế giới kỳ lạ nơi phép thuật và khoa học cùng tồn tại. Để trở về, anh phải hoàn thành 108 nhiệm vụ. Hành trình phiêu lưu đầy bất ngờ qua nhiều thế giới khác nhau.',
    status: 'ongoing',
    totalChapters: 88,
    views: 34000,
    favorites: 2100,
    catSlug: 'tieu-thuyet',
    genres: ['Huyền huyễn', 'Phiêu lưu', 'Dị giới', 'Hành động'],
    featured: 0
  },
  {
    title: 'Ảnh Đế Chi Thê',
    slug: 'anh-de-chi-the',
    author: 'Sở Vân',
    cover: 'https://picsum.photos/seed/anh-de/300/400',
    desc: 'Diễn viên hạng A Thẩm Mặc lạnh lùng kết hôn với biên kịch bình thường Lâm Hy vì gia đình sắp đặt. Cô tưởng anh không quan tâm, nhưng mỗi lần cô gặp khó khăn, anh đều xuất hiện. "Tôi không giỏi nói lời ngọt ngào, nhưng tôi có thể bảo vệ em." Showbiz + sủng văn.',
    status: 'complete',
    totalChapters: 134,
    views: 56000,
    favorites: 3780,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Giải trí', 'Hiện đại', 'Hôn nhân', 'HE'],
    featured: 0
  },
  {
    title: 'Phúc Hắc Sủng Thê',
    slug: 'phuc-hac-sung-the',
    author: 'Đào Lý',
    cover: 'https://picsum.photos/seed/phuc-hac/300/400',
    desc: 'Người đàn ông bí ẩn và nguy hiểm nhất thành phố Mạc Thần bỗng dưng xuất hiện trước cửa nhà Tô Uyển và tuyên bố: "Từ nay nàng là vợ ta." Điều kỳ lạ là anh ta lại sủng nàng một cách vô lý. Nàng không hiểu vì sao, nhưng anh biết - cô là người anh đã tìm kiếm suốt 10 năm.',
    status: 'ongoing',
    totalChapters: 178,
    views: 29000,
    favorites: 1890,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Đô thị', 'Bí ẩn', 'Hắc đạo', 'HE'],
    featured: 0
  },
  {
    title: 'Hệ Thống Trọng Sinh Của Em',
    slug: 'he-thong-trong-sinh',
    author: 'Phù Quang',
    cover: 'https://picsum.photos/seed/trong-sinh/300/400',
    desc: 'Sau khi chết vì kẻ thù, Lâm Tiêu được hệ thống cho cơ hội trọng sinh. Lần này, cô sẽ không để lịch sử bi kịch lặp lại. Nhưng hệ thống lại giao cho cô nhiệm vụ: "Chinh phục nam chính trong vòng 365 ngày." Nam chính chính là kẻ thù đã hại cô trong kiếp trước!',
    status: 'ongoing',
    totalChapters: 155,
    views: 38000,
    favorites: 2670,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Trọng sinh', 'Báo thù', 'Hệ thống', 'HE'],
    featured: 0
  },
  {
    title: 'Thiên Hạ Đệ Nhất Sủng',
    slug: 'thien-ha-de-nhat-sung',
    author: 'Mộng Thê',
    cover: 'https://picsum.photos/seed/thien-ha/300/400',
    desc: 'Trong truyện, nàng chỉ là vai phụ bị hoàng thượng ruồng bỏ. Nhưng khi tác giả viết lại, nàng bỗng trở thành người được hoàng thượng sủng ái nhất thiên hạ. "Ái phi, trong mắt trẫm, nàng là tuyệt sắc thiên hạ." Truyện sủng thuần ngọt không drama.',
    status: 'complete',
    totalChapters: 67,
    views: 21000,
    favorites: 1450,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Cổ trang', 'Sủng văn', 'Thuần ngọt', 'HE'],
    featured: 0
  },
  {
    title: 'Chấp Chưởng Thủ',
    slug: 'chap-chuong-thu',
    author: 'Hải Đường',
    cover: 'https://picsum.photos/seed/chap-chuong/300/400',
    desc: 'Giám đốc điều hành lạnh lùng Chu Ngự và trợ lý mới Ngô Lương. Một người cứng nhắc theo quy tắc, một người lại phá vỡ mọi quy tắc. Công việc biến thành cuộc chiến, cuộc chiến biến thành tình yêu. "Ngô Lương, anh cấm anh yêu em - nhưng trái tim anh không nghe lời anh."',
    status: 'ongoing',
    totalChapters: 88,
    views: 18000,
    favorites: 1230,
    catSlug: 'dam-my',
    genres: ['Đam mỹ', 'Đô thị', 'Sếp - Nhân viên', 'Hiện đại', 'HE'],
    featured: 0
  },
  {
    title: 'Vợ Bé Của Tổng Tài',
    slug: 'vo-be-cua-tong-tai',
    author: 'Tiểu Đào',
    cover: 'https://picsum.photos/seed/vo-be/300/400',
    desc: 'Sau một đêm nhầm lẫn, Đường Tiểu Nhu trở thành "vợ nhỏ" của tổng tài Diệp Thiếu Khiêm. Cô tưởng đây là ác mộng, nhưng khi anh ta bắt đầu chiều chuộng cô theo đủ mọi cách... có vẻ như anh ta mới là người không thoát được. Hiện đại sủng văn hài hước.',
    status: 'ongoing',
    totalChapters: 98,
    views: 15000,
    favorites: 980,
    catSlug: 'ngon-tinh',
    genres: ['Ngôn tình', 'Hiện đại', 'Hài hước', 'Sủng văn'],
    featured: 0
  },
  {
    title: 'Lão Thổ Ty',
    slug: 'lao-tho-ty',
    author: 'Thiên Hạ Bá Xướng',
    cover: 'https://picsum.photos/seed/lao-tho/300/400',
    desc: 'Thám hiểm mộ cổ - Ngô Tà và nhóm bạn bước vào hầm mộ bí ẩn của dòng tộc Trương. Những điều họ tìm thấy không chỉ là vàng bạc châu báu, mà còn là những bí mật ngàn năm về một vương quốc đã mất. Phiêu lưu, kinh dị, bí ẩn đan xen trong từng trang.',
    status: 'complete',
    totalChapters: 200,
    views: 41000,
    favorites: 2890,
    catSlug: 'tieu-thuyet',
    genres: ['Huyền huyễn', 'Phiêu lưu', 'Bí ẩn', 'Cổ trang'],
    featured: 0
  }
];

const insertStory = db.prepare(`
  INSERT INTO stories (title, slug, author, cover_image, description, status, total_chapters, views, favorites, category_id, genres, featured, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime','-'||(abs(random()) % 3)||' days'))
`);

for (const s of stories) {
  insertStory.run(
    s.title, s.slug, s.author, s.cover, s.desc,
    s.status, s.totalChapters, s.views, s.favorites,
    catMap[s.catSlug], JSON.stringify(s.genres), s.featured
  );
}

const storyMap = {};
db.prepare('SELECT * FROM stories').all().forEach(s => { storyMap[s.slug] = s.id; });

// Chapters for "Thập Nhật Chung Yên"
const insertChapter = db.prepare(`
  INSERT INTO chapters (story_id, chapter_number, title, content, views)
  VALUES (?, ?, ?, ?, ?)
`);

const chaptersThapNhat = [
  {
    num: 1,
    title: 'Ngày Đầu Tiên',
    content: `Hàn Tư tỉnh dậy với tiếng còi hú inh ỏi xé toạc màn đêm.

Anh nhảy bật dậy khỏi giường, tim đập loạn. Ánh sáng đỏ rực từ cửa sổ chiếu vào phòng - không phải bình minh, mà là lửa. Lửa từ tòa nhà đối diện, từ xe cộ dưới đường, từ khắp nơi.

"Lại rồi," anh thì thầm, giọng bình thản đến lạ lùng.

Đây là lần thứ... bao nhiêu rồi nhỉ? Anh đã mất đếm từ lâu.

Hàn Tư mặc nhanh áo khoác, nhét điện thoại vào túi dù biết mạng đã chết từ sáng sớm. Thói quen mà. Khi bạn sống đi sống lại một ngày đủ nhiều lần, mọi thứ đều trở thành thói quen - kể cả tận thế.

Anh mở cửa phòng và suýt đâm vào một người đang chạy ngược chiều.

"Ái!" Người đó kêu lên, suýt ngã.

Hàn Tư nhìn xuống - Lục Trình. Dĩ nhiên là Lục Trình.

Người đàn ông này luôn xuất hiện vào buổi sáng đầu tiên. Dù Hàn Tư chạy trốn, dù anh cố tình đi theo hướng khác - cuối cùng họ vẫn gặp nhau. Hàn Tư từng thử chứng minh điều đó không phải định mệnh, nhưng bây giờ anh đã chấp nhận.

"Đi," Lục Trình nói, giọng vội vàng. "Tòa A đã sập. Chúng ta cần..."

"Đến kho hàng số 7 ở cảng phía đông," Hàn Tư cắt lời. "Tầng 3, phòng thứ 4 từ trái sang. Có thức ăn cho 15 ngày và máy phát điện."

Lục Trình nhìn anh trân trân.

"Anh... biết rồi à?"

Hàn Tư chỉ quay người bước đi. "Đi nhanh lên. Lũ zombie từ khu B sẽ tràn sang đây trong vòng 20 phút."

Phía sau anh, Lục Trình im lặng một giây rồi chạy theo.

Đây là ngày đầu tiên. Còn 9 ngày nữa trước khi thế giới sụp đổ lần này.`
  },
  {
    num: 2,
    title: 'Người Đó Biết Quá Nhiều',
    content: `Lục Trình không phải loại người dễ hoảng loạn.

Anh từng là sĩ quan cảnh sát, từng đối mặt với con tin, với kẻ giết người, với đủ loại tình huống nguy hiểm. Anh không sợ chết. Nhưng người đàn ông lạ lùng đang đứng trước mặt anh này - anh ta khiến Lục Trình cảm thấy một điều kỳ lạ hơn sợ hãi.

Tò mò.

"Anh biết kho hàng đó ở đâu?" Lục Trình hỏi khi họ chạy qua con phố vắng tanh. "Anh đã đến đó trước rồi à?"

Hàn Tư không trả lời ngay. Anh đang đếm - Lục Trình nhận ra điều đó. Đếm bước chân, đếm góc phố, đếm gì đó mà người thường không để ý.

"Rẽ phải đây," Hàn Tư nói đột ngột.

Lục Trình rẽ. Và đúng lúc đó, một toán người mất kiểm soát tràn ra từ con hẻm trước mặt - đúng con đường họ vừa định đi.

Lục Trình nín thở.

"Anh vừa cứu mạng tôi," anh nói khi họ tiếp tục chạy.

"Đã cứu nhiều lần rồi," Hàn Tư thản nhiên đáp. "Anh sẽ quen."

*Đã cứu nhiều lần?* Lục Trình nghiền ngẫm câu đó. Họ mới gặp nhau lần đầu hôm nay. Hoặc ít nhất, anh nghĩ vậy.

"Tên anh là gì?" Lục Trình hỏi.

"Hàn Tư." Ngắn gọn. Không thêm thắt.

"Hàn Tư." Lục Trình nhắc lại, ghi nhớ. "Tôi là Lục Trình. Và tôi muốn biết - anh đang ẩn giấu điều gì?"

Hàn Tư dừng lại trước cánh cổng sắt của kho hàng. Anh nhìn Lục Trình với ánh mắt... mệt mỏi? Không, không phải mệt mỏi. Là gì đó phức tạp hơn.

"Anh sẽ không tin tôi đâu," Hàn Tư nói.

"Thử xem."

Một tiếng thở dài. "Chúng ta đang sống lại ngày này lần thứ 47. Và lần nào, sau 10 ngày, thế giới cũng kết thúc. Rồi chúng ta lại tỉnh dậy vào sáng hôm nay."

Lục Trình nhìn anh. Rất lâu.

"Vòng lặp," anh nói cuối cùng. "Anh đang nói về vòng lặp thời gian."

"Ừ."

"Và tôi... tôi cũng bị mắc kẹt trong đó?"

"Ừ. Nhưng chỉ có tôi nhớ. Anh không nhớ gì cả mỗi lần reset."

Lại im lặng. Rồi Lục Trình hỏi một câu mà Hàn Tư không ngờ đến:

"Vậy thì anh có biết mình cần làm gì để thoát ra không?"

Hàn Tư nhìn anh một lúc rồi nhìn đi chỗ khác. "Không biết. Tôi vẫn đang tìm."

Lục Trình gật đầu. "Được rồi. Vậy chúng ta cùng tìm."`
  },
  {
    num: 3,
    title: 'Mười Ngày Và Một Người',
    content: `Đến ngày thứ 47 của vòng lặp, Hàn Tư đã biết mọi thứ.

Anh biết rằng vào ngày thứ 3, một đứa trẻ sẽ bị mắc kẹt ở tòa nhà số 12 đường Hoàng Hoa - nếu không cứu kịp, nó sẽ chết trước khi reset. Anh biết rằng vào ngày thứ 5, người đàn ông ở căn hộ 406 sẽ dùng súng bắn vào đám đông, và cách duy nhất ngăn anh ta là đưa cho anh ta ảnh của con gái còn sống ở trại cứu thương số 3. Anh biết rằng vào ngày thứ 8, sẽ có một cơn mưa lớn, và mọi người cần trữ nước sạch trước đó.

Anh biết tất cả. Nhưng có một điều anh không biết - tại sao vòng lặp bắt đầu.

"Anh đang nghĩ gì vậy?"

Giọng Lục Trình kéo anh về thực tại. Họ đang ngồi trên mái kho hàng, nhìn xuống thành phố chìm trong lửa và bóng tối. Ngày đầu tiên luôn hỗn loạn nhất.

"Nghĩ xem còn thiếu gì," Hàn Tư nói.

"Anh luôn nghĩ như vậy." Lục Trình duỗi chân, tựa lưng vào ống khói. "47 vòng lặp mà anh vẫn chưa tìm ra cách thoát. Anh không nản lòng sao?"

Hàn Tư nhìn anh. Câu hỏi này - trong tất cả những lần trước, Lục Trình chưa bao giờ hỏi. Thường thì anh ta chỉ lắng nghe, thực hiện theo kế hoạch, và chết cùng thế giới vào ngày thứ 10.

"Anh không nhớ," Hàn Tư nói. "Nhưng tôi nhớ. Mỗi lần, tôi nhớ tất cả."

"Vậy thì anh hẳn rất mệt."

Ba chữ đó, nói ra thật bình thường, nhưng Hàn Tư cảm thấy gì đó trong ngực co lại.

47 vòng lặp. 47 lần chứng kiến thế giới sụp đổ. 47 lần tỉnh dậy một mình với ký ức về tất cả những người đã chết.

"Ừ," anh nói, giọng khẽ khàng hơn anh muốn. "Rất mệt."

Lục Trình quay nhìn anh. Trong ánh sáng đỏ của thành phố đang cháy, gương mặt anh trông lạ lùng - không phải lo lắng, không phải thương hại. Chỉ là... hiểu.

"Được rồi," Lục Trình nói. "Thì lần này, anh không cần phải một mình nữa."

Hàn Tư không nói gì. Nhưng lần đầu tiên sau 47 vòng lặp, anh không cảm thấy lạnh.`
  }
];

for (const ch of chaptersThapNhat) {
  insertChapter.run(storyMap['thap-nhat-chung-yen'], ch.num, ch.title, ch.content, Math.floor(Math.random() * 5000) + 1000);
}
// Add remaining chapters as placeholders
for (let i = 4; i <= 43; i++) {
  const content = `Chương ${i} - Nội dung đang cập nhật...\n\nHàn Tư và Lục Trình tiếp tục hành trình trong vòng lặp ngày tận thế. Mỗi ngày trôi qua họ lại hiểu nhau hơn, và dần nhận ra rằng chìa khóa để thoát khỏi vòng lặp không nằm ở bên ngoài - mà nằm ở chính họ.`;
  insertChapter.run(storyMap['thap-nhat-chung-yen'], i, `Chương ${i}`, content, Math.floor(Math.random() * 3000) + 500);
}

// Chapters for "Ma Đạo Tổ Sư"
const chaptersMaDaoToSu = [
  {
    num: 1,
    title: 'Tựu Thi',
    content: `Có người hỏi: "Trong thiên hạ, ai là người đáng sợ nhất?"

Câu trả lời của mỗi người một khác nhau. Có người nói là kiếm khách đệ nhất Lam Vong Cơ, có người nói là kỳ lão Lam Khải Sinh, có người nói là gia chủ Giang Phong của Kim Lân Các...

Nhưng mười sáu năm trước, câu trả lời của mọi người đều chỉ có một: Ngụy Vô Tiện.

Tổ sư Ma Đạo, Ác Nhân Thiếu Chủ Ngụy Vô Tiện - người duy nhất dám dùng tà thuật thao túng thi thể người chết, người bị cả tiên giới khinh thường và căm ghét. Lúc còn sống, hắn là cái gai trong mắt mọi người. Khi chết rồi, hắn trở thành lời cảnh báo mà cha mẹ dùng để dọa con cái.

Thế nhưng giờ đây, cái hồn ma bị căm ghét đó đang nhìn xuống đôi bàn tay gầy guộc của một thân xác xa lạ, với biểu cảm... khá bình thản.

"Trọng sinh?" Ngụy Vô Tiện tự hỏi bản thân. "Hay nhập hồn?"

Một ký ức xa lạ ùa vào đầu - tên Mạc Tuyên Vũ, một thiếu niên ở làng Mạc Gia Loan, vừa nhảy giếng vì tình. Thân xác còn sống, hồn đã bỏ đi.

Tiện cho ta dùng.

Ngụy Vô Tiện ngồi dậy, phủi đất trên người, và bình thản đánh giá tình hình. Hắn đang ở một cái giếng cạn. Trời vừa sáng. Ở đâu đó xa xa có tiếng gà gáy.

"Thôi được," hắn lầm bầm, giọng nghe có vẻ... vui vẻ một cách kỳ lạ. "Thì sống lại vậy. Lần này ta sẽ sống tốt hơn một chút."

Hắn không biết rằng "tốt hơn một chút" đó sẽ dẫn hắn trở lại gặp người mà hắn yêu nhất, và không thể yêu.`
  },
  {
    num: 2,
    title: 'Tương Phùng',
    content: `Mạc Gia Loan không phải nơi tốt cho người mới đến.

Ngụy Vô Tiện - hay đúng hơn là Mạc Tuyên Vũ - nhận ra điều đó trong vòng một ngày. Ký ức của thân chủ cho biết rằng họ Mạc là nhánh phụ của gia tộc Ninh, và người trong làng đối xử với người họ Mạc không khác gì nô bộc.

Nhưng điều đó không quan trọng.

Điều quan trọng là hắn cần tìm hiểu xem mình đang ở đâu trong dòng thời gian. Ngụy Vô Tiện đã chết - hắn nhớ rõ tiếng sấm trên Đốt Tinh Nhai, nhớ mặt từng người, nhớ đặc biệt khuôn mặt của người đứng xa nhất, không nói lời nào.

Lam Vong Cơ.

Hắn tự hỏi người đó bây giờ ở đâu.

Câu trả lời đến nhanh hơn hắn nghĩ.

Ba ngày sau khi "tỉnh dậy", hắn đang ngồi vá lưới cho một lão ngư dân thì nghe tiếng vó ngựa từ đầu làng. Người trong làng đổ ra xem - những tiên môn nhân đến tìm dị quỷ quái thú đang làm hại dân làng gần đây.

Đứng đầu đoàn là một thiếu niên khoảng mười lăm tuổi. Bào trắng tinh, ngọc quan sáng bóng, mắt như sao sáng. Thần thái lạnh lùng, dáng vẻ xa cách.

Ngụy Vô Tiện nhìn cậu ta và cảm thấy tim thắt lại.

Cậu ta vẫn còn trẻ lắm. Trẻ hơn cái ngày cuối cùng Ngụy Vô Tiện nhìn thấy cậu ta nhiều năm.

Lam Vong Cơ.`
  }
];

for (const ch of chaptersMaDaoToSu) {
  insertChapter.run(storyMap['ma-dao-to-su'], ch.num, ch.title, ch.content, Math.floor(Math.random() * 8000) + 3000);
}
for (let i = 3; i <= 113; i++) {
  const content = `Chương ${i}\n\nNgụy Vô Tiện và Lam Vong Cơ tiếp tục hành trình tu tiên đầy gian nan. Từng bước, từng bước, bức màn bí ẩn về quá khứ dần được hé lộ. Tình cảm ẩn giấu bao năm bắt đầu không thể che giấu nữa...`;
  insertChapter.run(storyMap['ma-dao-to-su'], i, `Chương ${i}`, content, Math.floor(Math.random() * 5000) + 1000);
}

// Add a few chapters for other popular stories
const otherStories = ['sung-phi', 'nghich-thien-phi', 'van-gioi-than-chu', 'kim-cuong-khong-vo'];
for (const slug of otherStories) {
  const sid = storyMap[slug];
  const story = stories.find(s => s.slug === slug);
  for (let i = 1; i <= story.totalChapters; i++) {
    const content = `Chương ${i}\n\nNội dung chương ${i} của truyện "${story.title}"...\n\nCâu chuyện tiếp tục với những tình tiết gay cấn và cảm xúc sâu lắng. Các nhân vật dần bộc lộ bản thân, mối quan hệ ngày càng phức tạp và đẹp đẽ hơn theo từng trang truyện.`;
    insertChapter.run(sid, i, `Chương ${i}`, content, Math.floor(Math.random() * 4000) + 500);
  }
}

// Add chapters for remaining stories
for (const story of stories) {
  if (!['thap-nhat-chung-yen', 'ma-dao-to-su', ...otherStories].includes(story.slug)) {
    const sid = storyMap[story.slug];
    for (let i = 1; i <= story.totalChapters; i++) {
      const content = `Chương ${i}\n\nNội dung chương ${i} của truyện "${story.title}"...\n\nCâu chuyện tiếp tục với những bước ngoặt thú vị. ${story.genres.join(', ')}.`;
      insertChapter.run(sid, i, `Chương ${i}`, content, Math.floor(Math.random() * 3000) + 200);
    }
  }
}

// Demo user + admin
const bcrypt = require('bcryptjs');
const userHash = bcrypt.hashSync('user123', 10);
const adminHash = bcrypt.hashSync('admin123', 10);
db.prepare(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`).run('docgiathu', 'docgia@truyen.vn', userHash);
db.prepare(`INSERT INTO admin_users (username, email, password) VALUES (?, ?, ?)`).run('admin', 'admin@truyen.vn', adminHash);

// Tags
const tagData = [
  // Kết thúc
  { name: 'HE', slug: 'he' },
  { name: 'BE', slug: 'be' },
  { name: 'SE', slug: 'se' },
  { name: 'Open End', slug: 'open-end' },
  // Thể loại phụ
  { name: 'Sủng văn', slug: 'sung-van' },
  { name: 'Ngọt', slug: 'ngot' },
  { name: 'Học đường', slug: 'hoc-duong' },
  { name: 'Thanh xuân vườn trường', slug: 'thanh-xuan-vuon-truong' },
  { name: 'Showbiz', slug: 'showbiz' },
  { name: 'Tổng tài', slug: 'tong-tai' },
  { name: 'Hợp đồng', slug: 'hop-dong' },
  { name: 'CEO', slug: 'ceo' },
  // Bối cảnh
  { name: 'Cổ trang', slug: 'co-trang' },
  { name: 'Hiện đại', slug: 'hien-dai' },
  { name: 'Tương lai', slug: 'tuong-lai' },
  { name: 'Mạt thế', slug: 'mat-the' },
  { name: 'Dị giới', slug: 'di-gioi' },
  // Cơ chế
  { name: 'Tu tiên', slug: 'tu-tien' },
  { name: 'Xuyên không', slug: 'xuyen-khong' },
  { name: 'Trọng sinh', slug: 'trong-sinh' },
  { name: 'Vô hạn lưu', slug: 'vo-han-luu' },
  { name: 'Hệ thống', slug: 'he-thong' },
  { name: 'Phản diện', slug: 'phan-dien' },
  { name: 'Điệp viên', slug: 'diep-vien' },
  { name: 'Kinh dị', slug: 'kinh-di' },
];
const insertTag = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)');
for (const t of tagData) insertTag.run(t.name, t.slug);

const tagMap = {};
db.prepare('SELECT * FROM tags').all().forEach(t => { tagMap[t.slug] = t.id; });

// Story-tag links (map selected stories to relevant tags)
const storyTagLinks = {
  'thap-nhat-chung-yen': ['he', 'vo-han-luu'],
  'ma-dao-to-su': ['he', 'tu-tien', 'co-trang'],
  'sung-phi': ['he', 'co-trang', 'sung-van', 'ngot'],
  'nghich-thien-phi': ['he', 'co-trang'],
  'kim-cuong-khong-vo': ['he', 'hien-dai', 'sung-van', 'tong-tai'],
  'ngot-sung-het-muc': ['he', 'hien-dai', 'tong-tai', 'ngot'],
  'ba-dao-tong-tai-ai-the': ['he', 'hien-dai', 'tong-tai', 'ngot'],
  'he-thong-trong-sinh': ['he', 'trong-sinh'],
  'thien-ha-de-nhat-sung': ['he', 'co-trang', 'sung-van', 'ngot'],
};
const insertStoryTag = db.prepare('INSERT OR IGNORE INTO story_tags (story_id, tag_id) VALUES (?, ?)');
for (const [slug, tags] of Object.entries(storyTagLinks)) {
  const sid = storyMap[slug];
  if (sid) for (const t of tags) if (tagMap[t]) insertStoryTag.run(sid, tagMap[t]);
}

// Affiliate links
db.prepare(`INSERT INTO affiliate_links (name, url, description, trigger_after, active) VALUES (?, ?, ?, ?, ?)`).run(
  'Tặng code VIP đọc truyện',
  'https://example.com/vip-offer',
  'Nhấn để nhận mã VIP đọc truyện không giới hạn!',
  3, 1
);

// Sample comments
const userId = db.prepare('SELECT id FROM users LIMIT 1').get().id;
const sampleComments = [
  { slug: 'thap-nhat-chung-yen', text: 'Truyện hay quá, đọc xong mà khóc mãi không thôi 😭' },
  { slug: 'thap-nhat-chung-yen', text: 'Cặp Hàn Tư - Lục Trình ngọt thật, author viết quá xuất sắc!' },
  { slug: 'thap-nhat-chung-yen', text: 'Recommend mạnh cho mọi người, tình tiết hấp dẫn từ đầu đến cuối.' },
  { slug: 'ma-dao-to-su', text: 'Ma Đạo Tổ Sư là đỉnh cao của thể loại này, không có đối thủ!' },
  { slug: 'ma-dao-to-su', text: 'Lam Vong Cơ yêu không nói được, Vô Tiện cũng thế 🥹' },
  { slug: 'sung-phi', text: 'Ngọt ngào thuần túy, không cung đấu đúng như mô tả!' },
  { slug: 'nghich-thien-phi', text: 'Nữ chính mạnh quá, đọc mà hả hê lắm!' },
];
const insertComment = db.prepare('INSERT INTO comments (story_id, user_id, content) VALUES (?, ?, ?)');
for (const c of sampleComments) {
  const s = db.prepare('SELECT id FROM stories WHERE slug = ?').get(c.slug);
  if (s) insertComment.run(s.id, userId, c.text);
}

// Sample ratings
const sampleRatings = [
  { slug: 'thap-nhat-chung-yen', score: 5 },
  { slug: 'ma-dao-to-su', score: 5 },
  { slug: 'sung-phi', score: 4 },
  { slug: 'nghich-thien-phi', score: 5 },
  { slug: 'kim-cuong-khong-vo', score: 4 },
];
const insertRating = db.prepare('INSERT OR REPLACE INTO ratings (story_id, user_id, score) VALUES (?, ?, ?)');
for (const r of sampleRatings) {
  const s = db.prepare('SELECT id FROM stories WHERE slug = ?').get(r.slug);
  if (s) insertRating.run(s.id, userId, r.score);
}

console.log('✅ Seed thành công!');
console.log(`  - ${stories.length} truyện`);
console.log('  - Chương của các truyện chính');
console.log('  - 4 danh mục, 12 tags');
console.log('  - 1 user demo: docgia@truyen.vn / user123');
console.log('  - 1 admin: admin@truyen.vn / admin123');
console.log('  - 1 affiliate link mẫu');
