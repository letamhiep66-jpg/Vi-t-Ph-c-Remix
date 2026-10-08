import { UserProfile } from '../types';

export interface BodyAnalysis {
  bmi: number;
  bmiCategory: string;
  recommendedSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  silhouetteDescription: string;
  costumeRecommendations: string[];
  tailoringNotes: string;
}

export function analyzeBodyProfile(profile: UserProfile): BodyAnalysis {
  const heightM = profile.height / 100;
  const bmi = Number((profile.weight / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Cân đối';
  let recommendedSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' = 'M';

  if (bmi < 18.5) {
    bmiCategory = 'Thanh mảnh';
    recommendedSize = profile.gender === 'male' ? 'S' : 'XS';
  } else if (bmi <= 24.9) {
    bmiCategory = 'Cân đối chuẩn';
    recommendedSize = profile.height > 172 ? 'L' : 'M';
  } else if (bmi <= 29.9) {
    bmiCategory = 'Đầy đặn';
    recommendedSize = 'XL';
  } else {
    bmiCategory = 'Đậm người';
    recommendedSize = 'XXL';
  }

  const isYoung = profile.age < 30;
  const recommendations: string[] = [];
  let tailoringNotes = '';

  if (profile.gender === 'female') {
    if (bmi < 19) {
      recommendations.push('Áo Nhật Bình phối lớp', 'Áo Tấc tay thụng buông rủ');
      tailoringNotes = 'Dáng người mảnh mai rất tôn các lớp vải lụa tơ tằm mềm rủ và tay thụng rộng, tạo độ thướt tha, trang nhã.';
    } else if (bmi > 25) {
      recommendations.push('Áo Ngũ Thân vạt buông', 'Áo Giao Lĩnh cổ chữ V');
      tailoringNotes = 'Cổ chữ V của Áo Giao Lĩnh giúp phần thân trên thon gọn, kết hợp vạt áo thẳng dài che khuyết điểm tinh tế.';
    } else {
      recommendations.push('Áo Nhật Bình', 'Áo Ngũ Thân tay chẽn', 'Áo Dài Le Mur');
      tailoringNotes = 'Vóc dáng cân đối lý tưởng để thử nghiệm cả dáng áo bó eo Le Mur lẫn dáng thụng hoàng tộc Nhật Bình.';
    }
  } else {
    if (bmi < 20) {
      recommendations.push('Áo Tấc thụng triều Nguyễn', 'Áo Đối Khâm khoác ngoài');
      tailoringNotes = 'Phom áo thụng rộng kết hợp lớp áo lót bên trong giúp vai và ngực trông nở nang, đĩnh đạc.';
    } else if (bmi > 25) {
      recommendations.push('Áo Ngũ Thân tay chẽn tối giản', 'Áo Trấn Thủ phối sơ mi');
      tailoringNotes = 'Đường cắt 5 thân tạo trục dọc thẳng tắp, phom áo chẽn gọn gàng tạo vẻ uy nghiêm, vững chãi.';
    } else {
      recommendations.push('Áo Ngũ Thân tay chẽn', 'Áo Tấc', 'Áo Giao Lĩnh cách điệu');
      tailoringNotes = 'Phù hợp đa dạng phom dáng cổ phục, dễ phối cùng quần âu hiện đại hoặc chelsea boots.';
    }
  }

  if (isYoung) {
    tailoringNotes += ' Phong cách Remix gợi ý phối cùng phụ kiện tối giản (kính mát retro, sneaker trắng hoặc túi tote gấm).';
  }

  return {
    bmi,
    bmiCategory,
    recommendedSize,
    silhouetteDescription: `${bmiCategory}, cao ${profile.height}cm, cân nặng ${profile.weight}kg`,
    costumeRecommendations: recommendations,
    tailoringNotes
  };
}
