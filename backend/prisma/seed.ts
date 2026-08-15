import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.recommendationFeedback.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.farmingLog.deleteMany();
  await prisma.season.deleteMany();
  await prisma.modelUpdate.deleteMany();
  await prisma.plot.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  const farmer = await prisma.user.create({
    data: {
      name: 'Nông dân Nguyễn Văn A',
      email: 'farmer@farm.com',
      phone: '0901234567',
      password_hash: passwordHash,
      role: 'FARMER'
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Quản trị viên Hệ thống',
      email: 'admin@farm.com',
      phone: '0909999999',
      password_hash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  console.log(`👤 Created Users: ${farmer.email} (FARMER), ${admin.email} (ADMIN)`);

  // Create Plots for Farmer
  const plot1 = await prisma.plot.create({
    data: {
      user_id: farmer.id,
      name: 'Thửa đất Vườn Cam A1',
      area_m2: 5000,
      soil_type: 'Đất phù sa bồi đắp',
      latitude: 10.762622,
      longitude: 106.660172
    }
  });

  const plot2 = await prisma.plot.create({
    data: {
      user_id: farmer.id,
      name: 'Thửa đất Ruộng Lúa B2',
      area_m2: 12000,
      soil_type: 'Đất thịt nhẹ',
      latitude: 10.7651,
      longitude: 106.662
    }
  });

  console.log(`🌾 Created Plots: ${plot1.name}, ${plot2.name}`);

  // Create Seasons
  const season1 = await prisma.season.create({
    data: {
      plot_id: plot1.id,
      crop_type: 'Cam Sành Tiền Giang',
      planted_date: new Date('2026-01-15'),
      expected_harvest_date: new Date('2026-08-30'),
      target_yield: 3500,
      actual_yield: 3800,
      quality: 'A',
      unit_price_vnd: 45000,
      revenue_vnd: 171000000,
      status: 'HARVESTED'
    }
  });

  const season2 = await prisma.season.create({
    data: {
      plot_id: plot2.id,
      crop_type: 'Lúa ST25 Chất lượng cao',
      planted_date: new Date('2026-02-01'),
      expected_harvest_date: new Date('2026-05-20'),
      target_yield: 9000,
      actual_yield: 9200,
      quality: 'A',
      unit_price_vnd: 18000,
      revenue_vnd: 165600000,
      status: 'GROWING'
    }
  });

  console.log(`📅 Created Seasons: ${season1.crop_type}, ${season2.crop_type}`);

  // Create Farming Logs with Realistic Costs
  await prisma.farmingLog.createMany({
    data: [
      {
        season_id: season1.id,
        plot_id: plot1.id,
        type: 'WATER',
        amount: 2500,
        unit: 'Lít',
        method: 'Tưới phun sương',
        note: 'Tưới nước bổ sung độ ẩm đất sáng sớm',
        cost_vnd: 25000,
        logged_at: new Date('2026-02-10T07:30:00Z')
      },
      {
        season_id: season1.id,
        plot_id: plot1.id,
        type: 'FERTILIZER',
        amount: 15.0,
        unit: 'kg',
        method: 'Bón gốc',
        note: 'Bón phân NPK 20-20-15 thúc đợt 1',
        cost_vnd: 375000,
        logged_at: new Date('2026-02-12T09:00:00Z')
      },
      {
        season_id: season1.id,
        plot_id: plot1.id,
        type: 'OTHER',
        amount: 1,
        unit: 'lần',
        method: 'Phun sinh học',
        note: 'Phun chế phẩm vi sinh phòng dịch hại',
        cost_vnd: 150000,
        logged_at: new Date('2026-02-15T10:00:00Z')
      },
      {
        season_id: season2.id,
        plot_id: plot2.id,
        type: 'WATER',
        amount: 4000,
        unit: 'Lít',
        method: 'Bơm tràn',
        note: 'Bơm nước ngập ruộng giữ độ ẩm lúa đẻ nhánh',
        cost_vnd: 40000,
        logged_at: new Date('2026-02-11T16:00:00Z')
      }
    ]
  });

  console.log('📝 Created Farming Logs with costs');

  // Create Recommendations & Feedback
  const rec1 = await prisma.recommendation.create({
    data: {
      season_id: season1.id,
      plot_id: plot1.id,
      type: 'WATER',
      suggested_amount: 22.5,
      confidence_score: 0.85,
      reason: 'Dự báo thời tiết 3 ngày tới nắng nóng 33°C, không mưa. Đất có nguy cơ thiếu ẩm nhẹ.',
      model_version: 1
    }
  });

  const rec2 = await prisma.recommendation.create({
    data: {
      season_id: season1.id,
      plot_id: plot1.id,
      type: 'FERTILIZER',
      suggested_amount: 4.0,
      confidence_score: 0.82,
      reason: 'Cây đang giai đoạn phát triển cành lá. Bổ sung NPK thúc đợt tới để đạt mục tiêu 3500kg.',
      model_version: 1
    }
  });

  await prisma.recommendationFeedback.create({
    data: {
      recommendation_id: rec1.id,
      action: 'MODIFIED',
      actual_value: 25.0
    }
  });

  await prisma.recommendationFeedback.create({
    data: {
      recommendation_id: rec2.id,
      action: 'ACCEPTED'
    }
  });

  // Create Model Update Log
  await prisma.modelUpdate.create({
    data: {
      plot_id: plot1.id,
      model_version: 2,
      trigger: 'ON_FEEDBACK'
    }
  });

  console.log('🤖 Created AI Recommendations, Feedbacks, and Model Logs');
  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
