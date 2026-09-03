import Doctor from '../models/Doctor.js';

const SEED_DOCTORS = [
  // Internal Medicine
  {
    name: 'Dr. Ahmed Al-Rashidi', nameAr: 'د. قاسم العليوي',
    specialty: 'Internal Medicine', specialtyAr: 'الطب الباطني',
    description: 'Specialist in adult diseases and preventive care.',
    descriptionAr: 'متخصص في أمراض البالغين والرعاية الوقائية.',
    consultationFee: 150
  },
  {
    name: 'Dr. Sara Al-Zahrawi', nameAr: 'د. ناصر العليوي',
    specialty: 'Internal Medicine', specialtyAr: 'الطب الباطني',
    description: 'Expert in chronic disease management and internal disorders.',
    descriptionAr: 'خبيرة في إدارة الأمراض المزمنة والاضطرابات الداخلية.',
    consultationFee: 175
  },
  {
    name: 'Dr. Khalid Al-Amin', nameAr: 'د. عبدالله يوسف',
    specialty: 'Internal Medicine', specialtyAr: 'الطب الباطني',
    description: 'Focused on diabetes, hypertension and general internal medicine.',
    descriptionAr: 'متخصص في السكري وارتفاع ضغط الدم والطب الداخلي العام.',
    consultationFee: 150
  },
  // Cardiology
  {
    name: 'Dr. Faisal Al-Mutar', nameAr: 'د. فيصل القطان',
    specialty: 'Cardiology', specialtyAr: 'أمراض القلب',
    description: 'Senior cardiologist specializing in heart diseases and ECG diagnostics.',
    descriptionAr: 'طبيب قلب أول متخصص في أمراض القلب وتشخيص تخطيط القلب.',
    consultationFee: 250
  },
  {
    name: 'Dr. Nora Al-Habboubi', nameAr: 'د. عبدالصمد',
    specialty: 'Cardiology', specialtyAr: 'أمراض القلب',
    description: 'Specialist in interventional cardiology and heart failure management.',
    descriptionAr: 'متخصصة في أمراض القلب التداخلية وإدارة قصور القلب.',
    consultationFee: 225
  },
  {
    name: 'Dr. Omar Al-Ghamdi', nameAr: 'د. عمر الغامدي',
    specialty: 'Cardiology', specialtyAr: 'أمراض القلب',
    description: 'Expert in cardiac imaging and preventive cardiology.',
    descriptionAr: 'خبير في تصوير القلب وأمراض القلب الوقائية.',
    consultationFee: 250
  },
  // Orthopedics
  {
    name: 'Dr. Yusuf Al-Jaber', nameAr: 'د.ماجد المهندس',
    specialty: 'Orthopedics', specialtyAr: 'جراحة العظام',
    description: 'Specialist in bone fractures, joint replacement and sports injuries.',
    descriptionAr: 'متخصص في كسور العظام واستبدال المفاصل وإصابات الرياضة.',
    consultationFee: 200
  },
  {
    name: 'Dr. Layla Al-Suwaidi', nameAr: 'د. علي السبيعي',
    specialty: 'Orthopedics', specialtyAr: 'جراحة العظام',
    description: 'Expert in spine surgery and musculoskeletal disorders.',
    descriptionAr: 'خبيرة في جراحة العمود الفقري واضطرابات الجهاز العضلي الهيكلي.',
    consultationFee: 200
  },
  {
    name: 'Dr. Tariq Al-Harbi', nameAr: 'د. طارق الحربي',
    specialty: 'Orthopedics', specialtyAr: 'جراحة العظام',
    description: 'Focused on pediatric orthopedics and hand surgery.',
    descriptionAr: 'متخصص في جراحة العظام للأطفال وجراحة اليد.',
    consultationFee: 175
  }
];

export const seedDoctors = async () => {
  const seedNames = SEED_DOCTORS.map(d => d.name);

  // Remove any doctor not in the current seed list (orphaned old records)
  await Doctor.deleteMany({ name: { $nin: seedNames } });

  for (const doc of SEED_DOCTORS) {
    await Doctor.updateOne({ name: doc.name }, { $set: doc }, { upsert: true });
  }
  console.log('Doctors synced');
};

export const getAllDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    const filter = { isActive: true };
    if (specialty) filter.specialty = specialty;
    const doctors = await Doctor.find(filter);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSpecialties = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    const specialties = [...new Set(doctors.map(d => d.specialty))];
    const result = specialties.map(s => {
      const doc = doctors.find(d => d.specialty === s);
      return { specialty: s, specialtyAr: doc.specialtyAr };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
