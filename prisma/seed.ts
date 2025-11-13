import { prisma } from '../lib/prisma'

async function main() {
  console.log('🌱 Seeding database...')

  // Tạo settings mặc định
  const dailyFeeSetting = await prisma.appSettings.upsert({
    where: { key: 'daily_fee' },
    update: {},
    create: {
      key: 'daily_fee',
      value: '70000',
      description: 'Học phí hàng ngày (VND)'
    }
  })

  const appNameSetting = await prisma.appSettings.upsert({
    where: { key: 'app_name' },
    update: {},
    create: {
      key: 'app_name',
      value: 'Hệ thống điểm danh học sinh',
      description: 'Tên ứng dụng'
    }
  })

  // Tạo dữ liệu học sinh mẫu
  const students = await Promise.all([
    prisma.student.upsert({
      where: { id: 'student-1' },
      update: {},
      create: {
        id: 'student-1',
        name: 'Nguyễn Văn An'
      }
    }),
    prisma.student.upsert({
      where: { id: 'student-2' },
      update: {},
      create: {
        id: 'student-2',
        name: 'Trần Thị Bình'
      }
    }),
    prisma.student.upsert({
      where: { id: 'student-3' },
      update: {},
      create: {
        id: 'student-3',
        name: 'Lê Hoàng Cường'
      }
    }),
    prisma.student.upsert({
      where: { id: 'student-4' },
      update: {},
      create: {
        id: 'student-4',
        name: 'Phạm Thị Dung'
      }
    }),
    prisma.student.upsert({
      where: { id: 'student-5' },
      update: {},
      create: {
        id: 'student-5',
        name: 'Võ Minh Đức'
      }
    }),
    prisma.student.upsert({
      where: { id: 'student-6' },
      update: {},
      create: {
        id: 'student-6',
        name: 'Ngô Thị Hoa'
      }
    })
  ])

  console.log('✅ Seeding completed!')
  console.log(`Created/Updated ${students.length} students`)
  console.log(`Created/Updated settings: ${dailyFeeSetting.key}, ${appNameSetting.key}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })