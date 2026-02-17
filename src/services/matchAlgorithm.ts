import type { QuestionnaireAnswers } from '@/types';

// 匹配权重配置
type MatchScoreMap = Record<string, Record<string, number>>;

const matchWeights: Record<string, MatchScoreMap> = {
  q1: {
    reading: { reading: 1, movie: 0.8, cafe: 0.6 },
    outdoor: { outdoor: 1, sports: 0.9, activity: 0.8 },
    cafe: { cafe: 1, reading: 0.7, movie: 0.6 },
    cooking: { cooking: 1, home: 0.9 },
    music: { music: 1, concert: 0.9 },
    movie: { movie: 1, reading: 0.8, art: 0.7 },
  },
  q2: {
    pop: { pop: 1 },
    indie: { indie: 1, folk: 0.8, art: 0.7 },
    jazz: { jazz: 1, classical: 0.8 },
    classical: { classical: 1, jazz: 0.8 },
    rock: { rock: 1 },
    folk: { folk: 1, indie: 0.8 },
  },
  q3: {
    dinner: { dinner: 1, cafe: 0.7 },
    walk: { walk: 1, cafe: 0.8 },
    activity: { activity: 1, outdoor: 0.9 },
    cafe: { cafe: 1, walk: 0.8, dinner: 0.7 },
    concert: { concert: 1, music: 0.9 },
    home: { home: 1, cooking: 0.9 },
  },
  q4: {
    stable: { stable: 1, mindful: 0.8 },
    adventure: { adventure: 1, active: 0.9 },
    balanced: { balanced: 1, stable: 0.8 },
    artistic: { artistic: 1, mindful: 0.8 },
    active: { active: 1, adventure: 0.9 },
    mindful: { mindful: 1, artistic: 0.8, stable: 0.7 },
  },
  q5: {
    reading: { reading: 1, art: 0.7 },
    sports: { sports: 1, outdoor: 0.9 },
    art: { art: 1, reading: 0.7, music: 0.8 },
    music: { music: 1, art: 0.8 },
    cooking: { cooking: 1 },
    gaming: { gaming: 1 },
  },
  q6: {
    career: { career: 1, balance: 0.8 },
    family: { family: 1, balance: 0.9 },
    travel: { travel: 1, adventure: 0.9 },
    freedom: { freedom: 1, travel: 0.8 },
    balance: { balance: 1, family: 0.9, career: 0.8 },
    growth: { growth: 1, career: 0.8 },
  },
  q7: {
    deep: { deep: 1, written: 0.8 },
    daily: { daily: 1, humor: 0.8 },
    humor: { humor: 1, daily: 0.8 },
    written: { written: 1, deep: 0.8 },
    direct: { direct: 1, action: 0.8 },
    action: { action: 1, direct: 0.8 },
  },
  q8: {
    honesty: { honesty: 1, loyalty: 0.9 },
    humor: { humor: 1 },
    kindness: { kindness: 1 },
    intelligence: { intelligence: 1 },
    loyalty: { loyalty: 1, honesty: 0.9 },
    freedom: { freedom: 1 },
  },
  q9: {
    romance: { romance: 1, drama: 0.8 },
    drama: { drama: 1, art: 0.9, romance: 0.8 },
    scifi: { scifi: 1 },
    documentary: { documentary: 1 },
    comedy: { comedy: 1 },
    art: { art: 1, drama: 0.9 },
  },
  q10: {
    soulmate: { soulmate: 1, growth: 0.8 },
    companionship: { companionship: 1, stable: 0.9 },
    passion: { passion: 1 },
    growth: { growth: 1, soulmate: 0.8 },
    fun: { fun: 1 },
    stable: { stable: 1, companionship: 0.9 },
  },
};

function getMatchReason(questionKey: string, answer1: string): string {
  const reasonMap: Record<string, Record<string, string>> = {
    q1: {
      reading: '都喜欢安静的阅读时光',
      outdoor: '都热爱户外活动',
      cafe: '都享受咖啡馆的悠闲',
      cooking: '都热爱美食和烹饪',
      music: '都有音乐情怀',
      movie: '都喜爱电影艺术',
    },
    q2: {
      pop: '音乐品味相似',
      indie: '都喜欢独立音乐',
      jazz: '都欣赏爵士乐',
      classical: '都喜爱古典音乐',
      rock: '都热爱摇滚',
      folk: '都钟情民谣',
    },
    q3: {
      dinner: '都喜欢浪漫的晚餐约会',
      walk: '都享受散步聊天的时光',
      activity: '都喜欢有趣的约会活动',
      cafe: '都偏爱安静的咖啡馆约会',
      concert: '都喜爱音乐会约会',
      home: '都喜欢在家约会',
    },
    q4: {
      stable: '生活态度都追求安稳',
      adventure: '都有冒险精神',
      balanced: '都重视生活平衡',
      artistic: '都有艺术气质',
      active: '都充满活力',
      mindful: '都注重内心成长',
    },
    q5: {
      reading: '都有阅读爱好',
      sports: '都热爱运动',
      art: '都有艺术爱好',
      music: '都热爱音乐',
      cooking: '都喜欢烹饪',
      gaming: '都喜欢游戏',
    },
    q6: {
      career: '都重视事业发展',
      family: '都渴望建立家庭',
      travel: '都梦想环游世界',
      freedom: '都追求自由生活',
      balance: '都追求平衡人生',
      growth: '都注重个人成长',
    },
    q7: {
      deep: '都渴望深度交流',
      daily: '都喜欢分享日常',
      humor: '都有幽默感',
      written: '都喜欢文字表达',
      direct: '都欣赏直接沟通',
      action: '都相信行动胜于言语',
    },
    q8: {
      honesty: '都看重诚实',
      humor: '都欣赏幽默',
      kindness: '都重视善良',
      intelligence: '都欣赏智慧',
      loyalty: '都看重忠诚',
      freedom: '都尊重自由',
    },
    q9: {
      romance: '都喜欢浪漫作品',
      drama: '都欣赏文艺片',
      scifi: '都喜欢科幻',
      documentary: '都喜爱纪录片',
      comedy: '都喜欢喜剧',
      art: '都有艺术品味',
    },
    q10: {
      soulmate: '都寻找灵魂伴侣',
      companionship: '都渴望温暖陪伴',
      passion: '都追求热烈爱情',
      growth: '都希望共同成长',
      fun: '都想要轻松快乐',
      stable: '都追求稳定感情',
    },
  };

  return reasonMap[questionKey]?.[answer1] || '有共同的兴趣';
}

export function calculateCompatibility(
  user1Answers: QuestionnaireAnswers,
  user2Answers: QuestionnaireAnswers
): { score: number; reasons: string[] } {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const reasons: string[] = [];

  const questionKeys = Object.keys(user1Answers) as (keyof QuestionnaireAnswers)[];

  for (const key of questionKeys) {
    const answer1 = user1Answers[key];
    const answer2 = user2Answers[key];
    const weights = matchWeights[key];

    if (weights && weights[answer1]) {
      const matchScore = weights[answer1][answer2] || 0;
      totalScore += matchScore;
      maxPossibleScore += 1;

      if (matchScore >= 0.8) {
        reasons.push(getMatchReason(key, answer1));
      }
    }
  }

  const compatibilityScore = Math.round((totalScore / maxPossibleScore) * 100);
  const uniqueReasons = [...new Set(reasons)].slice(0, 3);

  return { score: compatibilityScore, reasons: uniqueReasons };
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}
