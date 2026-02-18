/**
 * 获取照片的完整 URL
 * @param photoUrl 数据库中保存的相对路径，如 /uploads/xxx.jpg
 * @returns 完整的照片 URL
 */
export function getPhotoUrl(photoUrl: string | undefined | null): string {
  if (!photoUrl) {
    // 返回空字符串，让调用方使用默认头像或首字母
    return '';
  }

  // 如果已经是完整 URL，直接返回
  if (photoUrl.startsWith('http')) {
    return photoUrl;
  }

  // 从环境变量获取 API 基础 URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // 从 API_BASE_URL (如 https://api.domain.com/api) 提取基础域名
  // 去掉 /api 后缀，得到 https://api.domain.com
  const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '');

  // 拼接完整 URL： https://api.domain.com/uploads/xxx.jpg
  return `${baseUrl}${photoUrl}`;
}
